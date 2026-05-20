import { NextResponse } from "next/server"
import { FireStatus } from "@prisma/client"
import { prisma } from "@/lib/prisma"

const ROOMS = ["Room 1", "Room 2", "Room 3"]
const ALERT_STATUSES: FireStatus[] = [FireStatus.SUSPICIOUS, FireStatus.FIRE_CONFIRMED]

export async function GET() {
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000)

    const [latestEvents, resolvedEvents, responseEvents, recentEvents] =
      await Promise.all([
        prisma.fireEvent.findMany({
          where: { room: { in: ROOMS } },
          orderBy: { createdAt: "desc" },
          distinct: ["room"],
        }),
        prisma.fireEvent.findMany({
          where: {
            OR: [
              { acknowledgedAt: { gte: since } },
              { status: "CLEARED", createdAt: { gte: since } },
            ],
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        }),
        prisma.fireEvent.findMany({
          where: {
            status: { in: ALERT_STATUSES },
            acknowledgedAt: { not: null },
          },
          orderBy: { acknowledgedAt: "desc" },
          take: 100,
        }),
        prisma.fireEvent.findMany({
          orderBy: { createdAt: "desc" },
          take: 20,
          select: {
            id: true,
            room: true,
            status: true,
            message: true,
            smokeLevel: true,
            temperature: true,
            acknowledged: true,
            acknowledgedAt: true,
            createdAt: true,
          },
        }),
      ])

    const activeAlerts = latestEvents.filter(
      (event) =>
        !event.acknowledged &&
        ALERT_STATUSES.includes(event.status)
    )
    const affectedZones = activeAlerts.map((event) => event.room)
    const resolvedIds = new Set(resolvedEvents.map((event) => event.id))
    const responseDurations = responseEvents
      .map((event) => {
        if (!event.acknowledgedAt) return null
        return event.acknowledgedAt.getTime() - event.createdAt.getTime()
      })
      .filter((duration): duration is number => duration !== null && duration >= 0)

    const avgResponseTimeSeconds = responseDurations.length
      ? Math.round(
          responseDurations.reduce((total, duration) => total + duration, 0) /
            responseDurations.length /
            1000
        )
      : 0

    const sensorStatuses = ROOMS.map((room) => {
      const latest = latestEvents.find((event) => event.room === room)

      return {
        room,
        online: Boolean(latest),
        status: latest?.status ?? "NORMAL",
        lastSeen: latest?.createdAt ?? null,
      }
    })

    return NextResponse.json({
      activeAlerts: activeAlerts.length,
      resolvedToday: resolvedIds.size,
      affectedZones,
      avgResponseTimeSeconds,
      sensors: {
        total: ROOMS.length,
        online: sensorStatuses.filter((sensor) => sensor.online).length,
        offline: sensorStatuses.filter((sensor) => !sensor.online).length,
        rooms: sensorStatuses,
      },
      recentEvents,
    })
  } catch (error) {
    console.error("Get fire detection stats error:", error)
    return NextResponse.json({
      activeAlerts: 0,
      resolvedToday: 0,
      affectedZones: [],
      avgResponseTimeSeconds: 0,
      sensors: {
        total: ROOMS.length,
        online: 0,
        offline: ROOMS.length,
        rooms: ROOMS.map((room) => ({ room, online: false, status: "NORMAL", lastSeen: null })),
      },
      recentEvents: [],
    })
  }
}
