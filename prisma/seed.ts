import {
  PrismaClient,
  UserRole,
  WarehouseStatus,
  ItemStatus,
  TransferStatus,
  AuditType,
  AuditStatus,
  ReportType,
  ReportStatus,
  WarningLevel,
  WarningStatus,
  FireStatus,
} from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

const daysAgo  = (n: number) => new Date(Date.now() - n * 86_400_000)
const hoursAgo = (n: number) => new Date(Date.now() - n * 3_600_000)
const daysAhead = (n: number) => new Date(Date.now() + n * 86_400_000)

async function main() {
  console.log("🌱  Seeding Tele-WMS database…")

  // ── Clear relational tables first (FK order: children before parents) ──────
  await prisma.auditItem.deleteMany()
  await prisma.audit.deleteMany()
  await prisma.stockTransfer.deleteMany()
  await prisma.report.deleteMany()
  await prisma.userWarning.deleteMany()
  await prisma.fireEvent.deleteMany()
  console.log("   ✓ Cleared relational tables")

  // ── 1. CATEGORIES ──────────────────────────────────────────────────────────
  const catNetwork  = await upsertCat("Network Equipment",   "Routers, switches, access points, OLTs, ONTs")
  const catCables   = await upsertCat("Cables & Fibre",      "Ethernet, fibre optic, coaxial, power cables")
  const catSIM      = await upsertCat("SIM Cards",           "Prepaid, postpaid, data-only SIM cards")
  const catMobile   = await upsertCat("Mobile Devices",      "Smartphones, modems, MiFi devices, tablets")
  const catPower    = await upsertCat("Power Equipment",     "UPS units, batteries, solar panels, inverters")
  const catTools    = await upsertCat("Tools & Accessories", "Hand tools, testers, crimpers, ladders")
  const catSafety   = await upsertCat("Safety Equipment",    "Fire extinguishers, PPE, first-aid kits")
  console.log("   ✓ Categories ready")

  // ── 2. WAREHOUSES ──────────────────────────────────────────────────────────
  const wAddis    = await findOrCreateWarehouse("Addis Ababa Central",  "Addis Ababa, Ethiopia",       "Bole Sub City, Kirkos Woreda, Addis Ababa",   "+251-11-123-4567", 8000, WarehouseStatus.ACTIVE)
  const wDireDawa = await findOrCreateWarehouse("Dire Dawa Regional",   "Dire Dawa, Ethiopia",         "Kezira District, Dire Dawa",                  "+251-25-111-2233", 4000, WarehouseStatus.ACTIVE)
  const wHawassa  = await findOrCreateWarehouse("Hawassa Southern Hub", "Hawassa, Sidama Region",      "Tabor Subcity, Hawassa",                      "+251-46-221-0088", 3500, WarehouseStatus.ACTIVE)
  const wBahirDar = await findOrCreateWarehouse("Bahir Dar North Depot","Bahir Dar, Amhara Region",    "Belay Zeleke Road, Bahir Dar",                "+251-58-220-1155", 2500, WarehouseStatus.MAINTENANCE)
  console.log("   ✓ Warehouses ready")

  // ── 3. USERS ───────────────────────────────────────────────────────────────
  const pw = (p: string) => bcrypt.hash(p, 10)

  const uAdmin   = await prisma.user.upsert({ where: { email: "admin@ethiotelecom.et"    }, update: {}, create: { email: "admin@ethiotelecom.et",    name: "System Administrator", password: await pw("admin123"),   role: UserRole.ADMIN,              isActive: true } })
  const uMgr1    = await prisma.user.upsert({ where: { email: "manager@ethiotelecom.et"  }, update: { warehouseId: wAddis.id    }, create: { email: "manager@ethiotelecom.et",  name: "Alemayehu Tadesse",    password: await pw("manager123"), role: UserRole.WAREHOUSE_MANAGER, warehouseId: wAddis.id,    isActive: true } })
  const uMgr2    = await prisma.user.upsert({ where: { email: "manager2@ethiotelecom.et" }, update: { warehouseId: wDireDawa.id }, create: { email: "manager2@ethiotelecom.et", name: "Tigist Bekele",        password: await pw("manager123"), role: UserRole.WAREHOUSE_MANAGER, warehouseId: wDireDawa.id, isActive: true } })
  const uClerk1  = await prisma.user.upsert({ where: { email: "clerk@ethiotelecom.et"    }, update: { warehouseId: wAddis.id    }, create: { email: "clerk@ethiotelecom.et",    name: "Fatuma Ahmed",         password: await pw("clerk123"),   role: UserRole.INVENTORY_CLERK,   warehouseId: wAddis.id,    isActive: true } })
  const uClerk2  = await prisma.user.upsert({ where: { email: "clerk2@ethiotelecom.et"   }, update: { warehouseId: wDireDawa.id }, create: { email: "clerk2@ethiotelecom.et",   name: "Biruk Haile",          password: await pw("clerk123"),   role: UserRole.INVENTORY_CLERK,   warehouseId: wDireDawa.id, isActive: true } })
  const uClerk3  = await prisma.user.upsert({ where: { email: "clerk3@ethiotelecom.et"   }, update: { warehouseId: wHawassa.id  }, create: { email: "clerk3@ethiotelecom.et",   name: "Hiwot Girma",          password: await pw("clerk123"),   role: UserRole.INVENTORY_CLERK,   warehouseId: wHawassa.id,  isActive: true } })
  const uTech    = await prisma.user.upsert({ where: { email: "tech@ethiotelecom.et"     }, update: { warehouseId: wAddis.id    }, create: { email: "tech@ethiotelecom.et",     name: "Dawit Solomon",        password: await pw("tech123"),    role: UserRole.TECHNICIAN,        warehouseId: wAddis.id,    isActive: true } })
  const uAuditor = await prisma.user.upsert({ where: { email: "auditor@ethiotelecom.et"  }, update: {},                             create: { email: "auditor@ethiotelecom.et",  name: "Mekdes Alemu",         password: await pw("audit123"),   role: UserRole.AUDITOR,            isActive: true } })

  await prisma.warehouse.update({ where: { id: wAddis.id    }, data: { managerId: uMgr1.id } })
  await prisma.warehouse.update({ where: { id: wDireDawa.id }, data: { managerId: uMgr2.id } })
  await prisma.warehouse.update({ where: { id: wHawassa.id  }, data: { managerId: uMgr1.id } })
  await prisma.warehouse.update({ where: { id: wBahirDar.id }, data: { managerId: uMgr2.id } })
  console.log("   ✓ Users ready")

  // ── 4. INVENTORY ITEMS ─────────────────────────────────────────────────────
  const iRouter = await upsertItem("TPL-AC1200",        "Router TP-Link AC1200",                  "Dual-band wireless router, 1200 Mbps",                       72,   20, 150,  2500,   "Tech Solutions Ltd",         ItemStatus.IN_STOCK,    catNetwork.id, wAddis.id)
  const iSwitch = await upsertItem("CIS-SG110-24",      "Cisco SG110-24 Switch",                  "24-port unmanaged Gigabit switch",                           18,   10,  60,  8400,   "Cisco Systems",              ItemStatus.IN_STOCK,    catNetwork.id, wAddis.id)
  const iOLT    = await upsertItem("HUA-MA5608T",       "Huawei OLT MA5608T",                     "GPON/EPON optical line terminal, 2U chassis",                 4,    2,  20, 185000, "Huawei Technologies",        ItemStatus.IN_STOCK,    catNetwork.id, wAddis.id)
  const iONT    = await upsertItem("HUA-HG8240H",       "Huawei ONT HG8240H",                     "GPON optical network terminal, 4-port",                      340, 100, 600,  1850,   "Huawei Technologies",        ItemStatus.IN_STOCK,    catNetwork.id, wDireDawa.id)
  const iAP     = await upsertItem("UBQ-UAP-AC-PRO",    "Ubiquiti UAP-AC-PRO Access Point",        "802.11ac dual-radio indoor access point",                    55,   15, 100,  6200,   "Ubiquiti Networks",          ItemStatus.IN_STOCK,    catNetwork.id, wHawassa.id)
  const iCat6   = await upsertItem("ETH-CAT6-100",      "Ethernet Cable Cat6 (100 m roll)",        "UTP Cat6 cable, solid core, 100 m",                          12,   30, 200,   420,   "Cable Corp Ethiopia",        ItemStatus.LOW_STOCK,   catCables.id,  wDireDawa.id)
  const iFibre  = await upsertItem("FIB-ADSS-12F-2KM",  "ADSS Fibre Cable 12F (2 km drum)",        "All-dielectric self-supporting 12-fibre ADSS",                8,    5,  30, 14500,  "Prysmian Group",             ItemStatus.IN_STOCK,    catCables.id,  wAddis.id)
  const iSim1   = await upsertItem("SIM-PREP-001",       "SIM Card — Prepaid (bulk ×100)",          "Standard/Micro/Nano prepaid SIM, bulk pack",               4200, 500, 10000,   25,   "Ethio Telecom Production",   ItemStatus.IN_STOCK,    catSIM.id,     wAddis.id)
  const iSim2   = await upsertItem("SIM-DATA-4G",        "SIM Card — 4G Data-Only",                "4G LTE data SIM for IoT/MiFi devices",                       0,  200, 3000,    35,   "Ethio Telecom Production",   ItemStatus.OUT_OF_STOCK, catSIM.id,    wHawassa.id)
  const iMiFi   = await upsertItem("ZTE-MF927U",         "ZTE MF927U MiFi Router",                 "4G LTE pocket WiFi, up to 32 simultaneous users",            88,   25, 200,  1950,   "ZTE Corporation",            ItemStatus.IN_STOCK,    catMobile.id,  wAddis.id)
  const iModem  = await upsertItem("HUA-E8372H",         "Huawei E8372H USB Modem",                "4G LTE USB stick modem, 150 Mbps",                           22,   30, 120,   980,   "Huawei Technologies",        ItemStatus.LOW_STOCK,   catMobile.id,  wDireDawa.id)
  const iUPS    = await upsertItem("APC-SMT1500I",        "APC Smart-UPS 1500 VA",                  "Line-interactive UPS, 1500 VA / 980 W, LCD display",          9,    5,  30, 22500,  "Schneider Electric",         ItemStatus.IN_STOCK,    catPower.id,   wAddis.id)
  const iBatt   = await upsertItem("BAT-12V-100AH",       "VRLA Battery 12 V 100 Ah",               "Valve-regulated lead-acid standby battery",                   6,   10,  60,  4800,   "Ritar Power",                ItemStatus.LOW_STOCK,   catPower.id,   wBahirDar.id)
  const iExt    = await upsertItem("SAF-EXT-ABC-6KG",     "Fire Extinguisher ABC 6 kg",             "Dry powder multi-purpose wall-mount extinguisher",           24,   10,  60,  1200,   "Safety First PLC",           ItemStatus.IN_STOCK,    catSafety.id,  wAddis.id)
  const iSolar  = await upsertItem("SOL-200W-PANEL",      "Solar Panel 200 W Monocrystalline",      "12/24 V mono solar panel for off-grid telecom sites",        14,    5,  40,  8900,   "SolarEdge Ethiopia",         ItemStatus.IN_STOCK,    catPower.id,   wHawassa.id)
  console.log("   ✓ Inventory items ready")

  // ── 5. STOCK TRANSFERS ─────────────────────────────────────────────────────
  await prisma.stockTransfer.createMany({ data: [
    // Completed
    { itemId: iRouter.id, quantity: 15, fromWarehouseId: wAddis.id,    toWarehouseId: wDireDawa.id, requestedById: uClerk1.id, approvedById: uMgr1.id, status: TransferStatus.COMPLETED,  notes: "Network expansion — new cell sites Dire Dawa",        requestDate: daysAgo(20), approvedDate: daysAgo(19), completedDate: daysAgo(18) },
    { itemId: iFibre.id,  quantity:  2, fromWarehouseId: wAddis.id,    toWarehouseId: wDireDawa.id, requestedById: uClerk2.id, approvedById: uMgr1.id, status: TransferStatus.COMPLETED,  notes: "Backbone fibre extension — Phase 2",                  requestDate: daysAgo(30), approvedDate: daysAgo(29), completedDate: daysAgo(28) },
    { itemId: iMiFi.id,   quantity: 20, fromWarehouseId: wAddis.id,    toWarehouseId: wBahirDar.id, requestedById: uClerk3.id, approvedById: uMgr1.id, status: TransferStatus.COMPLETED,  notes: "Corporate order — Bahir Dar University",              requestDate: daysAgo(12), approvedDate: daysAgo(11), completedDate: daysAgo(10) },
    // In-Transit
    { itemId: iCat6.id,   quantity:  5, fromWarehouseId: wDireDawa.id, toWarehouseId: wHawassa.id,  requestedById: uClerk2.id, approvedById: uMgr2.id, status: TransferStatus.IN_TRANSIT, notes: "LAN cabling — Hawassa University dormitories",          requestDate: daysAgo(5),  approvedDate: daysAgo(4) },
    // Approved
    { itemId: iONT.id,    quantity: 50, fromWarehouseId: wDireDawa.id, toWarehouseId: wHawassa.id,  requestedById: uClerk3.id, approvedById: uMgr2.id, status: TransferStatus.APPROVED,   notes: "FTTH rollout — Hawassa residential zones Phase 1",    requestDate: daysAgo(7),  approvedDate: daysAgo(6) },
    // Pending
    { itemId: iSim1.id,   quantity: 1000, fromWarehouseId: wAddis.id,  toWarehouseId: wHawassa.id,  requestedById: uClerk3.id,                         status: TransferStatus.PENDING,    notes: "SIM activation drive — Sidama Region campaign",       requestDate: daysAgo(1) },
    { itemId: iAP.id,     quantity: 10, fromWarehouseId: wHawassa.id,  toWarehouseId: wBahirDar.id, requestedById: uClerk2.id,                         status: TransferStatus.PENDING,    notes: "WiFi coverage expansion — Bahir Dar Airport zone",    requestDate: daysAgo(2) },
    // Rejected
    { itemId: iUPS.id,    quantity:  4, fromWarehouseId: wAddis.id,    toWarehouseId: wDireDawa.id, requestedById: uClerk1.id, approvedById: uMgr1.id, status: TransferStatus.REJECTED,   notes: "Rejected — Addis stock below safety threshold",       requestDate: daysAgo(10), approvedDate: daysAgo(9) },
  ]})
  console.log("   ✓ Stock transfers ready")

  // ── 6. AUDITS & AUDIT ITEMS ────────────────────────────────────────────────
  const audit1 = await prisma.audit.create({ data: {
    warehouseId: wAddis.id, auditorId: uAuditor.id,
    type: AuditType.FULL_AUDIT, status: AuditStatus.COMPLETED,
    startDate: daysAgo(45), endDate: daysAgo(44),
    itemsAudited: 14, discrepancies: 2,
    notes: "Quarterly full audit. Two items had quantity mismatches (router +3, Cat6 cable –5).",
  }})
  await prisma.auditItem.createMany({ data: [
    { auditId: audit1.id, itemId: iRouter.id, expectedQty: 35, actualQty: 38,  discrepancy:  3, notes: "Found 3 extra units in returns bay" },
    { auditId: audit1.id, itemId: iSwitch.id, expectedQty: 18, actualQty: 18,  discrepancy:  0, notes: "" },
    { auditId: audit1.id, itemId: iCat6.id,   expectedQty: 20, actualQty: 15,  discrepancy: -5, notes: "5 rolls issued without documentation" },
    { auditId: audit1.id, itemId: iSim1.id,   expectedQty: 4000, actualQty: 4200, discrepancy: 200, notes: "Restocked after count started" },
  ]})

  const audit2 = await prisma.audit.create({ data: {
    warehouseId: wDireDawa.id, auditorId: uAuditor.id,
    type: AuditType.SPOT_CHECK, status: AuditStatus.COMPLETED,
    startDate: daysAgo(14), endDate: daysAgo(14),
    itemsAudited: 5, discrepancies: 0,
    notes: "Spot check following router transfer. All quantities verified.",
  }})
  await prisma.auditItem.createMany({ data: [
    { auditId: audit2.id, itemId: iONT.id,   expectedQty: 340, actualQty: 340, discrepancy: 0, notes: "" },
    { auditId: audit2.id, itemId: iCat6.id,  expectedQty: 12,  actualQty: 12,  discrepancy: 0, notes: "" },
    { auditId: audit2.id, itemId: iModem.id, expectedQty: 22,  actualQty: 22,  discrepancy: 0, notes: "" },
  ]})

  await prisma.audit.create({ data: {
    warehouseId: wHawassa.id, auditorId: uAuditor.id,
    type: AuditType.CYCLE_COUNT, status: AuditStatus.IN_PROGRESS,
    startDate: daysAgo(1), itemsAudited: 3, discrepancies: 0,
    notes: "Ongoing cycle count — access points and SIM cards.",
  }})

  await prisma.audit.create({ data: {
    warehouseId: wAddis.id, auditorId: uAuditor.id,
    type: AuditType.EMERGENCY_AUDIT, status: AuditStatus.SCHEDULED,
    startDate: daysAhead(2),
    notes: "Emergency audit triggered by fire alert on 19 May 2026.",
  }})
  console.log("   ✓ Audits & audit items ready")

  // ── 7. REPORTS ─────────────────────────────────────────────────────────────
  await prisma.report.createMany({ data: [
    { name: "Addis Ababa — Monthly Inventory Report (April 2026)", type: ReportType.INVENTORY,      warehouseId: wAddis.id,    generatedBy: uAdmin.id,   status: ReportStatus.READY,      format: "PDF",  parameters: { month: 4, year: 2026 } },
    { name: "Q1 2026 Stock Movement Report",                       type: ReportType.MOVEMENT,                                  generatedBy: uMgr1.id,    status: ReportStatus.READY,      format: "XLSX", parameters: { quarter: 1, year: 2026 } },
    { name: "Full Audit Report — Addis Ababa Central (Mar 2026)", type: ReportType.AUDIT,           warehouseId: wAddis.id,    generatedBy: uAuditor.id, status: ReportStatus.READY,      format: "PDF",  parameters: { auditType: "FULL_AUDIT" } },
    { name: "Low Stock Alert Report — May 2026",                   type: ReportType.ALERT,                                     generatedBy: uMgr2.id,    status: ReportStatus.READY,      format: "PDF",  parameters: { alertType: "LOW_STOCK" } },
    { name: "User Activity Log — May 2026",                        type: ReportType.USER_ACTIVITY,                             generatedBy: uAdmin.id,   status: ReportStatus.PROCESSING, format: "PDF",  parameters: { month: 5, year: 2026 } },
  ]})
  console.log("   ✓ Reports ready")

  // ── 8. USER WARNINGS ───────────────────────────────────────────────────────
  await prisma.userWarning.createMany({ data: [
    { warehouseId: wAddis.id,    managerId: uMgr1.id, userId: uClerk1.id, message: "Inventory item issued without completing the transfer request form. Please follow proper documentation procedures.", level: WarningLevel.WARNING,  status: WarningStatus.ACTIVE },
    { warehouseId: wDireDawa.id, managerId: uMgr2.id, userId: uClerk2.id, message: "Cat6 cable rolls were dispatched without a signed delivery note. This has been flagged in the April audit.",       level: WarningLevel.CRITICAL, status: WarningStatus.ACTIVE },
    { warehouseId: wAddis.id,    managerId: uMgr1.id, userId: uTech.id,   message: "Maintenance schedule for UPS units was missed last week. Please update the maintenance log immediately.",           level: WarningLevel.INFO,     status: WarningStatus.RESOLVED },
    { warehouseId: wHawassa.id,  managerId: uMgr1.id, userId: uClerk3.id, message: "4G Data SIM stock has reached zero. Please submit a replenishment transfer request through the transfer module.",   level: WarningLevel.WARNING,  status: WarningStatus.ACTIVE },
  ]})
  console.log("   ✓ User warnings ready")

  // ── 9. FIRE EVENTS ─────────────────────────────────────────────────────────
  // Last week — Room 2 had a brief alarm (historical, all acknowledged)
  const fire1Time = new Date(daysAgo(7).getTime() + 2  * 60_000)
  const fire2Time = new Date(daysAgo(7).getTime() + 4  * 60_000)
  const fire3Time = new Date(daysAgo(7).getTime() + 22 * 60_000)
  const ackTime   = new Date(daysAgo(7).getTime() + 10 * 60_000)

  await prisma.fireEvent.create({ data: { room: "Room 2", status: FireStatus.SUSPICIOUS,     smokeLevel: 620, temperature: 38.5, message: "Fire suspected | smoke=620 temp=38.5 flame=490", warehouseId: wAddis.id, acknowledged: true, acknowledgedAt: ackTime,  createdAt: fire1Time, updatedAt: fire1Time } })
  await prisma.fireEvent.create({ data: { room: "Room 2", status: FireStatus.FIRE_CONFIRMED,  smokeLevel: 890, temperature: 62.1, message: "FIRE CONFIRMED | smoke=890 temp=62.1 flame=812", warehouseId: wAddis.id, acknowledged: true, acknowledgedAt: ackTime,  createdAt: fire2Time, updatedAt: fire2Time } })
  await prisma.fireEvent.create({ data: { room: "Room 2", status: FireStatus.CLEARED,         smokeLevel:  95, temperature: 28.2, message: "Fire cleared | smoke=95 temp=28.2 flame=12",     warehouseId: wAddis.id, acknowledged: true, acknowledgedAt: ackTime,  createdAt: fire3Time, updatedAt: fire3Time } })

  // Current state — all 3 rooms showing normal readings
  const now = hoursAgo(0)
  await prisma.fireEvent.create({ data: { room: "Room 1", status: FireStatus.NORMAL, smokeLevel: 42, temperature: 24.8, message: "Normal | smoke=42 temp=24.8 flame=15", warehouseId: wAddis.id, acknowledged: false, createdAt: now, updatedAt: now } })
  await prisma.fireEvent.create({ data: { room: "Room 2", status: FireStatus.NORMAL, smokeLevel: 38, temperature: 25.1, message: "Normal | smoke=38 temp=25.1 flame=8",  warehouseId: wAddis.id, acknowledged: false, createdAt: now, updatedAt: now } })
  await prisma.fireEvent.create({ data: { room: "Room 3", status: FireStatus.NORMAL, smokeLevel: 51, temperature: 26.0, message: "Normal | smoke=51 temp=26.0 flame=22", warehouseId: wAddis.id, acknowledged: false, createdAt: now, updatedAt: now } })
  console.log("   ✓ Fire events ready")

  // ── 10. Update warehouse currentStock totals ───────────────────────────────
  for (const wid of [wAddis.id, wDireDawa.id, wHawassa.id, wBahirDar.id]) {
    const agg = await prisma.inventoryItem.aggregate({ where: { warehouseId: wid }, _sum: { quantity: true } })
    await prisma.warehouse.update({ where: { id: wid }, data: { currentStock: agg._sum.quantity ?? 0 } })
  }
  console.log("   ✓ Warehouse stock counts updated")

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log("\n✅  Seed complete!")
  console.log("\n👤  Login credentials:")
  console.log("    Admin      : admin@ethiotelecom.et     / admin123")
  console.log("    Manager 1  : manager@ethiotelecom.et   / manager123  (Addis Ababa)")
  console.log("    Manager 2  : manager2@ethiotelecom.et  / manager123  (Dire Dawa)")
  console.log("    Clerk 1    : clerk@ethiotelecom.et     / clerk123    (Addis Ababa)")
  console.log("    Clerk 2    : clerk2@ethiotelecom.et    / clerk123    (Dire Dawa)")
  console.log("    Clerk 3    : clerk3@ethiotelecom.et    / clerk123    (Hawassa)")
  console.log("    Technician : tech@ethiotelecom.et      / tech123     (Addis Ababa)")
  console.log("    Auditor    : auditor@ethiotelecom.et   / audit123")
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function upsertCat(name: string, description: string) {
  return prisma.category.upsert({ where: { name }, update: { description }, create: { name, description } })
}

async function findOrCreateWarehouse(name: string, location: string, address: string, phone: string, capacity: number, status: WarehouseStatus) {
  const existing = await prisma.warehouse.findFirst({ where: { name } })
  if (existing) return existing
  return prisma.warehouse.create({ data: { name, location, address, phone, capacity, currentStock: 0, status } })
}

function upsertItem(sku: string, name: string, description: string, quantity: number, minStock: number, maxStock: number, unitPrice: number, supplier: string, status: ItemStatus, categoryId: string, warehouseId: string) {
  const data = { name, description, quantity, minStock, maxStock, unitPrice, supplier, status, categoryId, warehouseId }
  return prisma.inventoryItem.upsert({ where: { sku }, update: data, create: { sku, ...data } })
}

// ─── Run ─────────────────────────────────────────────────────────────────────
main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1) })
