import { FireStatus } from "@prisma/client"
import { prisma } from "@/lib/prisma"

const ALERT_STATUSES: FireStatus[] = [FireStatus.SUSPICIOUS, FireStatus.FIRE_CONFIRMED]

/** Runs a promise and returns null instead of throwing, so one bad query never kills the whole context. */
async function safe<T>(label: string, p: Promise<T>): Promise<T | null> {
  try {
    return await p
  } catch (err) {
    console.error(`[chatbot-context] "${label}" query failed:`, err)
    return null
  }
}

function fmt(d: Date | null | undefined): string {
  if (!d) return "—"
  return new Date(d).toLocaleString("en-US", {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: false,
  })
}

/** Rich live snapshot injected into the Gemini system prompt. Each section degrades independently. */
export async function getLiveSystemContext(): Promise<string> {
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000)

  // Run all queries in parallel; each is individually fault-tolerant
  const [
    warehouses,
    activeFireEvents,
    recentFireEvents,
    sensorReadings,
    lowStockItems,
    outOfStockItems,
    pendingTransfers,
    users,
  ] = await Promise.all([
    safe("warehouses", prisma.warehouse.findMany({
      select: {
        name: true, location: true, status: true,
        capacity: true, currentStock: true,
        manager: { select: { name: true } },
      },
      orderBy: { name: "asc" },
    })),

    safe("activeFireEvents", prisma.fireEvent.findMany({
      where: { status: { in: ALERT_STATUSES }, acknowledged: false },
      select: {
        room: true, status: true, smokeLevel: true,
        temperature: true, message: true, createdAt: true,
        warehouse: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    })),

    safe("recentFireEvents", prisma.fireEvent.findMany({
      where: { createdAt: { gte: since24h } },
      select: {
        room: true, status: true, smokeLevel: true,
        temperature: true, acknowledged: true,
        acknowledgedAt: true, createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    })),

    safe("sensorReadings", prisma.fireEvent.findMany({
      orderBy: { createdAt: "desc" },
      distinct: ["room"],
      select: {
        room: true, status: true, smokeLevel: true,
        temperature: true, createdAt: true,
      },
    })),

    safe("lowStockItems", prisma.inventoryItem.findMany({
      where: { status: "LOW_STOCK" },
      select: {
        name: true, sku: true, quantity: true, minStock: true,
        warehouse: { select: { name: true } },
        category: { select: { name: true } },
      },
      orderBy: { quantity: "asc" },
      take: 30,
    })),

    safe("outOfStockItems", prisma.inventoryItem.findMany({
      where: { status: "OUT_OF_STOCK" },
      select: {
        name: true, sku: true,
        warehouse: { select: { name: true } },
        category: { select: { name: true } },
      },
      orderBy: { name: "asc" },
      take: 30,
    })),

    safe("pendingTransfers", prisma.stockTransfer.findMany({
      where: { status: "PENDING" },
      select: {
        quantity: true, requestDate: true, notes: true,
        item: { select: { name: true, sku: true } },
        fromWarehouse: { select: { name: true } },
        toWarehouse: { select: { name: true } },
        requestedBy: { select: { name: true } },
      },
      orderBy: { requestDate: "desc" },
      take: 20,
    })),

    safe("users", prisma.user.findMany({
      where: { isActive: true },
      select: {
        name: true, email: true, role: true,
        warehouse: { select: { name: true } },
      },
      orderBy: { name: "asc" },
      take: 50,
    })),
  ])

  // ── Build context sections ──────────────────────────────────────────────────

  const sections: string[] = [
    `LIVE SYSTEM DATA — snapshot at ${new Date().toISOString()}`,
    "════════════════════════════════════════",
  ]

  // Fire & Safety
  if (activeFireEvents === null) {
    sections.push("## FIRE & SAFETY\n⚠️  Could not load fire alert data.")
  } else if (activeFireEvents.length === 0) {
    sections.push("## FIRE & SAFETY\nNo active fire alerts. All rooms are clear.")
  } else {
    const lines = activeFireEvents.map(
      (e) =>
        `  • ${e.room}${e.warehouse ? ` (${e.warehouse.name})` : ""}: ${e.status}` +
        `  smoke=${e.smokeLevel ?? "—"}, temp=${e.temperature ?? "—"}°C` +
        `  since ${fmt(e.createdAt)}` +
        (e.message ? `  — "${e.message}"` : "")
    )
    sections.push(`## FIRE & SAFETY\n⚠️  ACTIVE FIRE ALERTS (${activeFireEvents.length}):\n${lines.join("\n")}`)
  }

  // Sensor status
  if (sensorReadings === null) {
    sections.push("## SENSOR STATUS\nCould not load sensor data.")
  } else if (sensorReadings.length === 0) {
    sections.push("## SENSOR STATUS\nNo sensor readings available.")
  } else {
    const lines = sensorReadings.map(
      (s) =>
        `  • ${s.room}: ${s.status}  smoke=${s.smokeLevel ?? "—"}, temp=${s.temperature ?? "—"}°C  (updated: ${fmt(s.createdAt)})`
    )
    sections.push(`## SENSOR STATUS BY ROOM\n${lines.join("\n")}`)
  }

  // Recent fire events (24 h)
  if (recentFireEvents === null) {
    sections.push("## FIRE EVENTS — LAST 24H\nCould not load recent fire events.")
  } else if (recentFireEvents.length === 0) {
    sections.push("## FIRE EVENTS — LAST 24H\nNo fire events in the past 24 hours.")
  } else {
    const lines = recentFireEvents.map(
      (e) =>
        `  • ${fmt(e.createdAt)}  ${e.room}  ${e.status}` +
        `  smoke=${e.smokeLevel ?? "—"}, temp=${e.temperature ?? "—"}°C` +
        (e.acknowledged
          ? `  ✓ acknowledged ${fmt(e.acknowledgedAt)}`
          : "  ✗ not acknowledged")
    )
    sections.push(`## FIRE EVENTS — LAST 24H (${recentFireEvents.length})\n${lines.join("\n")}`)
  }

  // Warehouses
  if (warehouses === null) {
    sections.push("## WAREHOUSES\nCould not load warehouse data.")
  } else {
    const lines = warehouses.map(
      (w) =>
        `  • ${w.name} — ${w.location}  status=${w.status}` +
        `  stock=${w.currentStock}/${w.capacity}` +
        (w.manager ? `  manager=${w.manager.name}` : "  no manager")
    )
    sections.push(`## WAREHOUSES (${warehouses.length})\n${lines.join("\n")}`)
  }

  // Out of stock
  if (outOfStockItems === null) {
    sections.push("## OUT-OF-STOCK ITEMS\nCould not load inventory data.")
  } else if (outOfStockItems.length === 0) {
    sections.push("## OUT-OF-STOCK ITEMS\nNone — all items have stock.")
  } else {
    const lines = outOfStockItems.map(
      (i) =>
        `  • ${i.name} (SKU: ${i.sku})  warehouse=${i.warehouse.name}  category=${i.category.name}`
    )
    sections.push(`## OUT-OF-STOCK ITEMS (${outOfStockItems.length})\n${lines.join("\n")}`)
  }

  // Low stock
  if (lowStockItems === null) {
    sections.push("## LOW-STOCK ITEMS\nCould not load inventory data.")
  } else if (lowStockItems.length === 0) {
    sections.push("## LOW-STOCK ITEMS\nNone.")
  } else {
    const lines = lowStockItems.map(
      (i) =>
        `  • ${i.name} (SKU: ${i.sku})  qty=${i.quantity}  minStock=${i.minStock}` +
        `  warehouse=${i.warehouse.name}  category=${i.category.name}`
    )
    sections.push(`## LOW-STOCK ITEMS (${lowStockItems.length})\n${lines.join("\n")}`)
  }

  // Pending transfers
  if (pendingTransfers === null) {
    sections.push("## PENDING TRANSFERS\nCould not load transfer data.")
  } else if (pendingTransfers.length === 0) {
    sections.push("## PENDING TRANSFERS\nNone.")
  } else {
    const lines = pendingTransfers.map(
      (t) =>
        `  • ${t.item.name} (SKU: ${t.item.sku})  qty=${t.quantity}` +
        `  from=${t.fromWarehouse.name} → ${t.toWarehouse.name}` +
        `  requested by ${t.requestedBy.name} on ${fmt(t.requestDate)}` +
        (t.notes ? `  notes="${t.notes}"` : "")
    )
    sections.push(`## PENDING STOCK TRANSFERS (${pendingTransfers.length})\n${lines.join("\n")}`)
  }

  // Users
  if (users === null) {
    sections.push("## USERS\nCould not load user data.")
  } else {
    const lines = users.map(
      (u) =>
        `  • ${u.name} (${u.email})  role=${u.role}` +
        (u.warehouse ? `  warehouse=${u.warehouse.name}` : "  no warehouse")
    )
    sections.push(`## ACTIVE USERS (${users.length})\n${lines.join("\n")}`)
  }

  sections.push(
    "Use the data above to answer user questions precisely with exact names, numbers, and timestamps. " +
    "Do NOT say you cannot access the database — the data above IS the live database. " +
    "If a section says 'Could not load', acknowledge only that specific data is temporarily unavailable."
  )

  return sections.join("\n\n")
}
