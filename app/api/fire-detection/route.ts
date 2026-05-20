import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const ROOMS = ["Room 1", "Room 2", "Room 3"]

// POST — called by the Python bridge script running on the PC
export async function POST(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key")
  if (!apiKey || apiKey !== process.env.FIRE_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  // Accept both "smokeLevel" (our field name) and "smoke" (Arduino's field name)
  const {
    room,
    status,
    smokeLevel,
    smoke,
    temperature,
    temp,
    message,
    warehouseId,
  } = body

  if (!room || !status) {
    return NextResponse.json({ error: "room and status are required" }, { status: 400 })
  }

  const validStatuses = ["NORMAL", "SUSPICIOUS", "FIRE_CONFIRMED", "CLEARED"]
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: `status must be one of: ${validStatuses.join(", ")}` }, { status: 400 })
  }

  const resolvedSmoke = smokeLevel ?? smoke
  const resolvedTemp  = temperature ?? temp

  const event = await prisma.fireEvent.create({
    data: {
      room,
      status,
      smokeLevel:  resolvedSmoke != null ? Number(resolvedSmoke) : undefined,
      temperature: resolvedTemp  != null ? Number(resolvedTemp)  : undefined,
      message: message ?? null,
      warehouseId: warehouseId ?? null,
    },
  })

  return NextResponse.json(event, { status: 201 })
}

// GET — polled by the frontend to display live status.
// Uses a single DB query (distinct per room) instead of 3 parallel queries
// to stay within Neon's free-tier connection pool limit.
export async function GET() {
  // One round-trip: latest event per room ordered by createdAt DESC
  const events = await prisma.fireEvent.findMany({
    where:    { room: { in: ROOMS } },
    orderBy:  { createdAt: "desc" },
    distinct: ["room"],
  })

  const rooms = ROOMS.map((room) => {
    const ev = events.find((e) => e.room === room) ?? null
    return {
      eventId:     ev?.id          ?? null,
      room,
      status:      (ev?.status ?? "NORMAL") as string,
      message:     ev?.message     ?? null,
      smokeLevel:  ev?.smokeLevel  ?? null,
      temperature: ev?.temperature ?? null,
      lastUpdated: ev?.createdAt   ?? null,
      acknowledged: ev?.acknowledged ?? false,
    }
  })

  const overallStatus = rooms.some((r) => r.status === "FIRE_CONFIRMED")
    ? "FIRE"
    : rooms.some((r) => r.status === "SUSPICIOUS")
    ? "WARNING"
    : "NORMAL"

  const activeAlerts = rooms.filter(
    (r) =>
      !r.acknowledged &&
      (r.status === "SUSPICIOUS" || r.status === "FIRE_CONFIRMED")
  )
  const latestAlertAt =
    activeAlerts
      .map((r) => r.lastUpdated)
      .filter(Boolean)
      .sort((a, b) => new Date(b as Date).getTime() - new Date(a as Date).getTime())[0] ?? null

  return NextResponse.json({
    rooms,
    overallStatus,
    unacknowledgedCount: activeAlerts.length,
    latestAlertAt,
  })
}

// PATCH — let the frontend acknowledge a fire alert
export async function PATCH(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key")
  const token = request.headers.get("authorization")

  // Either the Python bridge key or a logged-in user may acknowledge
  const isAuthorized = (apiKey && apiKey === process.env.FIRE_API_KEY) || !!token
  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const { room } = body
  if (!room) {
    return NextResponse.json({ error: "room is required" }, { status: 400 })
  }

  // Acknowledge the latest unacknowledged fire event in this room
  const latest = await prisma.fireEvent.findFirst({
    where: { room, acknowledged: false },
    orderBy: { createdAt: "desc" },
  })

  if (!latest) {
    return NextResponse.json({ message: "Nothing to acknowledge" })
  }

  const updated = await prisma.fireEvent.update({
    where: { id: latest.id },
    data: { acknowledged: true, acknowledgedAt: new Date() },
  })

  return NextResponse.json(updated)
}
