import { FireStatus } from "@prisma/client"
import { prisma } from "@/lib/prisma"

const ROOMS = ["Room 1", "Room 2", "Room 3"]
const ALERT_STATUSES: FireStatus[] = [FireStatus.SUSPICIOUS, FireStatus.FIRE_CONFIRMED]

/** Snapshot of live dashboard data injected into the Gemini system prompt. */
export async function getLiveSystemContext(): Promise<string> {
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000)

    const [
      totalWarehouses,
      totalItems,
      totalUsers,
      pendingTransfers,
      lowStockItems,
      outOfStockItems,
      latestFireEvents,
    ] = await Promise.all([
      prisma.warehouse.count({ where: { status: "ACTIVE" } }),
      prisma.inventoryItem.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.stockTransfer.count({ where: { status: "PENDING" } }),
      prisma.inventoryItem.count({
        where: {
          AND: [
            { quantity: { gt: 0 } },
            { quantity: { lte: prisma.inventoryItem.fields.minStock } },
          ],
        },
      }),
      prisma.inventoryItem.count({ where: { quantity: 0 } }),
      prisma.fireEvent.findMany({
        where: { room: { in: ROOMS } },
        orderBy: { createdAt: "desc" },
        distinct: ["room"],
      }),
    ])

    const activeAlerts = latestFireEvents.filter(
      (event) =>
        !event.acknowledged && ALERT_STATUSES.includes(event.status)
    )

    const sensorSummary = ROOMS.map((room) => {
      const latest = latestFireEvents.find((e) => e.room === room)
      return latest
        ? `${room}: ${latest.status} (smoke ${latest.smokeLevel}, temp ${latest.temperature}°C)`
        : `${room}: no recent reading`
    }).join("; ")

    const resolvedToday = await prisma.fireEvent.count({
      where: {
        OR: [
          { acknowledgedAt: { gte: since } },
          { status: "CLEARED", createdAt: { gte: since } },
        ],
      },
    })

    return `
CURRENT LIVE DATA (as of ${new Date().toISOString()}):
- Active warehouses: ${totalWarehouses}
- Inventory items: ${totalItems}
- Active users: ${totalUsers}
- Pending stock transfers: ${pendingTransfers}
- Low-stock items: ${lowStockItems}
- Out-of-stock items: ${outOfStockItems}
- Active fire alerts (unacknowledged): ${activeAlerts.length}
- Fire alerts resolved in last 24h: ${resolvedToday}
- Affected zones (if any): ${activeAlerts.map((e) => e.room).join(", ") || "none"}
- Sensor status by room: ${sensorSummary}

Use this data when answering questions about current stats, alerts, or inventory. If data is unavailable, say you don't have live numbers right now.
`.trim()
  } catch (error) {
    console.error("Failed to build live chatbot context:", error)
    return "CURRENT LIVE DATA: unavailable (database error). Answer from general system knowledge only."
  }
}
