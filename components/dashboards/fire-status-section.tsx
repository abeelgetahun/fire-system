"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Flame,
  MapPin,
  RefreshCw,
  Router,
  ShieldCheck,
  Thermometer,
  Wifi,
  WifiOff,
  Wind,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  formatFireAlertTime,
  getFireSeverity,
  useFireAlerts,
  type FireStatus,
  type RoomFireStatus,
} from "@/context/fire-alert-context"
import { apiClient } from "@/lib/api-client"
import { cn } from "@/lib/utils"

interface FireDetectionStats {
  activeAlerts: number
  resolvedToday: number
  affectedZones: string[]
  avgResponseTimeSeconds: number
  sensors: {
    total: number
    online: number
    offline: number
    rooms: Array<{
      room: string
      online: boolean
      status: FireStatus
      lastSeen: string | null
    }>
  }
  recentEvents: FireEventLogItem[]
}

interface FireEventLogItem {
  id: string
  room: string
  status: FireStatus
  message: string | null
  smokeLevel: number | null
  temperature: number | null
  acknowledged: boolean
  acknowledgedAt: string | null
  createdAt: string
}

const EMPTY_STATS: FireDetectionStats = {
  activeAlerts: 0,
  resolvedToday: 0,
  affectedZones: [],
  avgResponseTimeSeconds: 0,
  sensors: {
    total: 3,
    online: 0,
    offline: 3,
    rooms: [],
  },
  recentEvents: [],
}

const STATUS_LABELS: Record<FireStatus, string> = {
  NORMAL: "Normal",
  SUSPICIOUS: "Warning",
  FIRE_CONFIRMED: "Critical",
  CLEARED: "Cleared",
}

const STATUS_STYLES: Record<FireStatus, string> = {
  NORMAL: "border-emerald-200 bg-emerald-50 text-emerald-700",
  CLEARED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  SUSPICIOUS: "border-amber-200 bg-amber-50 text-amber-700",
  FIRE_CONFIRMED: "border-red-200 bg-red-50 text-red-700",
}

export function FireStatusSection({ variant = "compact" }: { variant?: "compact" | "full" }) {
  const {
    activeAlerts,
    rooms,
    overallStatus,
    offline,
    loading,
    lastRefresh,
    fetchStatus,
    acknowledgeRoom,
    acknowledgingRoom,
  } = useFireAlerts()
  const [stats, setStats] = useState<FireDetectionStats>(EMPTY_STATS)
  const [statsLoading, setStatsLoading] = useState(true)

  const fetchStats = async () => {
    try {
      const data = await apiClient.getFireDetectionStats()
      setStats({ ...EMPTY_STATS, ...data })
    } catch (error) {
      console.error("Failed to fetch fire detection stats:", error)
    } finally {
      setStatsLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    const interval = window.setInterval(fetchStats, overallStatus === "NORMAL" ? 15000 : 5000)

    return () => window.clearInterval(interval)
  }, [overallStatus])

  const affectedZones = activeAlerts.map((alert) => alert.room)
  const affectedZoneText = affectedZones.length ? affectedZones.join(", ") : "No zones under alert"
  const sensorOnlineCount = offline ? 0 : stats.sensors.online
  const sensorOfflineCount = offline ? stats.sensors.total : stats.sensors.offline
  const sensorHealthPercent = stats.sensors.total
    ? Math.round((sensorOnlineCount / stats.sensors.total) * 100)
    : 0

  const latestFireEvent = useMemo(
    () =>
      stats.recentEvents.find(
        (event) => event.status === "FIRE_CONFIRMED" || event.status === "SUSPICIOUS"
      ),
    [stats.recentEvents]
  )

  return (
    <section className={cn("space-y-4 sm:space-y-6", variant === "full" && "space-y-6")}>
      <div
        className={cn(
          "overflow-hidden rounded-3xl border shadow-xl",
          overallStatus === "FIRE"
            ? "border-red-200 bg-gradient-to-br from-red-950 via-red-800 to-orange-700 text-white"
            : overallStatus === "WARNING"
              ? "border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50 to-white"
              : "border-emerald-100 bg-gradient-to-br from-white via-emerald-50 to-blue-50"
        )}
      >
        <div className="relative p-5 sm:p-6 lg:p-8">
          <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/20 blur-2xl" />
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  "rounded-2xl p-3 shadow-lg",
                  overallStatus === "FIRE"
                    ? "bg-white/15 text-white ring-1 ring-white/25"
                    : overallStatus === "WARNING"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-emerald-100 text-emerald-700"
                )}
              >
                {overallStatus === "FIRE" ? (
                  <Flame className="h-7 w-7 fire-alert-shake" />
                ) : overallStatus === "WARNING" ? (
                  <AlertTriangle className="h-7 w-7" />
                ) : (
                  <ShieldCheck className="h-7 w-7" />
                )}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-bold tracking-tight">Fire Status Command Center</h2>
                  <Badge
                    className={cn(
                      "border",
                      overallStatus === "FIRE"
                        ? "border-white/25 bg-white/15 text-white"
                        : overallStatus === "WARNING"
                          ? "border-amber-200 bg-amber-100 text-amber-800"
                          : "border-emerald-200 bg-emerald-100 text-emerald-800"
                    )}
                  >
                    {overallStatus === "FIRE"
                      ? "Critical response"
                      : overallStatus === "WARNING"
                        ? "Warning state"
                        : "All clear"}
                  </Badge>
                </div>
                <p
                  className={cn(
                    "mt-2 max-w-2xl text-sm",
                    overallStatus === "FIRE" ? "text-white/80" : "text-muted-foreground"
                  )}
                >
                  Live telemetry from the Proteus/Arduino bridge, with response metrics calculated from stored fire events.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant={overallStatus === "FIRE" ? "secondary" : "outline"}
                onClick={() => {
                  fetchStatus()
                  fetchStats()
                }}
                className={cn(overallStatus === "FIRE" && "bg-white text-red-700 hover:bg-white/90")}
              >
                <RefreshCw className={cn("h-4 w-4", (loading || statsLoading) && "animate-spin")} />
                Refresh
              </Button>
              {variant === "compact" && (
                <Button asChild variant={overallStatus === "FIRE" ? "secondary" : "default"}>
                  <Link href="/warehouse-status">
                    View Details
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:gap-4 lg:grid-cols-5">
        <FireMetricCard
          href="/warehouse-status"
          title="Active Fire Alerts"
          value={activeAlerts.length}
          description="Currently unresolved"
          icon={<Flame className="h-5 w-5" />}
          tone={activeAlerts.length > 0 ? "critical" : "safe"}
        />
        <FireMetricCard
          href="/warehouse-status"
          title="Resolved Today"
          value={stats.resolvedToday}
          description="Acknowledged or cleared in 24h"
          icon={<CheckCircle2 className="h-5 w-5" />}
          tone="safe"
        />
        <FireMetricCard
          href="/warehouse-status"
          title="Affected Zones"
          value={affectedZones.length}
          description={affectedZoneText}
          icon={<MapPin className="h-5 w-5" />}
          tone={affectedZones.length > 0 ? "warning" : "safe"}
        />
        <FireMetricCard
          href="/warehouse-status"
          title="Avg. Response Time"
          value={formatDuration(stats.avgResponseTimeSeconds)}
          description="Alert trigger to acknowledgement"
          icon={<Clock className="h-5 w-5" />}
          tone={stats.avgResponseTimeSeconds > 300 ? "warning" : "neutral"}
        />
        <FireMetricCard
          href="/warehouse-status"
          title="Sensor Status"
          value={`${sensorOnlineCount}/${stats.sensors.total}`}
          description={`${sensorOnlineCount} online, ${sensorOfflineCount} offline`}
          icon={<Router className="h-5 w-5" />}
          tone={sensorOfflineCount > 0 ? "warning" : "safe"}
        />
      </div>

      {variant === "full" && (
        <>
          <LiveFireFlowDiagram rooms={rooms} offline={offline} />

          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <Card className="border-0 bg-white/90 shadow-xl">
            <CardHeader className="pb-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    Live Zone Monitor
                  </CardTitle>
                  <CardDescription>
                    Updated {lastRefresh.toLocaleTimeString()} from `/api/fire-detection`
                  </CardDescription>
                </div>
                <Badge
                  className={cn(
                    "w-fit",
                    offline
                      ? "bg-red-100 text-red-700"
                      : "bg-emerald-100 text-emerald-700"
                  )}
                >
                  {offline ? (
                    <WifiOff className="mr-1 h-3 w-3" />
                  ) : (
                    <Wifi className="mr-1 h-3 w-3" />
                  )}
                  {offline ? "Bridge offline" : "Bridge online"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                {rooms.map((room) => (
                  <LiveZoneCard
                    key={room.room}
                    room={room}
                    onAcknowledge={() => acknowledgeRoom(room.room)}
                    acknowledging={acknowledgingRoom === room.room}
                  />
                ))}
              </div>

              <div className="rounded-2xl border bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">Sensor Network Health</p>
                    <p className="text-xs text-muted-foreground">
                      {sensorOnlineCount} online out of {stats.sensors.total} configured rooms
                    </p>
                  </div>
                  <span className="text-sm font-bold">{sensorHealthPercent}%</span>
                </div>
                <Progress value={sensorHealthPercent} className="h-2" />
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {stats.sensors.rooms.map((sensor) => (
                    <div key={sensor.room} className="flex items-center justify-between rounded-xl bg-white p-3 text-xs">
                      <span className="font-medium">{sensor.room}</span>
                      <Badge
                        variant="outline"
                        className={sensor.online ? STATUS_STYLES[sensor.status] : "border-slate-200 bg-slate-100 text-slate-500"}
                      >
                        {sensor.online ? STATUS_LABELS[sensor.status] : "Offline"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            </Card>

            <Card className="border-0 bg-white/90 shadow-xl">
            <CardHeader>
              <CardTitle>Fire Alert Log</CardTitle>
              <CardDescription>
                Latest events received from the Arduino bridge
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.recentEvents.length === 0 ? (
                <div className="rounded-2xl border border-dashed p-8 text-center">
                  <ShieldCheck className="mx-auto h-8 w-8 text-emerald-500" />
                  <p className="mt-3 text-sm font-medium">No fire events logged yet</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Start the bridge to seed room status and begin tracking telemetry.
                  </p>
                </div>
              ) : (
                <div className="max-h-[34rem] space-y-3 overflow-y-auto pr-1">
                  {stats.recentEvents.map((event) => (
                    <FireEventRow key={event.id} event={event} />
                  ))}
                </div>
              )}
            </CardContent>
            </Card>
          </div>
        </>
      )}

      {variant === "compact" && latestFireEvent && (
        <Card className="border-0 bg-white/80 shadow-lg">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-red-50 p-2 text-red-600">
                <Flame className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold">Latest fire telemetry: {latestFireEvent.room}</p>
                <p className="text-xs text-muted-foreground">
                  {STATUS_LABELS[latestFireEvent.status]} at {formatFireAlertTime(latestFireEvent.createdAt)}
                </p>
              </div>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href="/warehouse-status">Open alert log</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </section>
  )
}

function FireMetricCard({
  href,
  title,
  value,
  description,
  icon,
  tone,
}: {
  href: string
  title: string
  value: string | number
  description: string
  icon: ReactNode
  tone: "critical" | "warning" | "safe" | "neutral"
}) {
  const styles = {
    critical: "border-red-200 bg-gradient-to-br from-red-50 to-white text-red-700",
    warning: "border-amber-200 bg-gradient-to-br from-amber-50 to-white text-amber-700",
    safe: "border-emerald-200 bg-gradient-to-br from-emerald-50 to-white text-emerald-700",
    neutral: "border-blue-200 bg-gradient-to-br from-blue-50 to-white text-blue-700",
  }

  return (
    <Link href={href} className="group block">
      <Card className={cn("h-full overflow-hidden border shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl", styles[tone])}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="rounded-2xl bg-white/80 p-2 shadow-sm">{icon}</div>
            <ArrowUpRight className="h-4 w-4 opacity-50 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide opacity-75">{title}</p>
          <p className="mt-1 text-3xl font-bold text-slate-950">{value}</p>
          <p className="mt-2 line-clamp-2 text-xs text-slate-500">{description}</p>
        </CardContent>
      </Card>
    </Link>
  )
}

function LiveFireFlowDiagram({
  rooms,
  offline,
}: {
  rooms: RoomFireStatus[]
  offline: boolean
}) {
  const roomLayout = [
    { room: "Room 1", y: 82 },
    { room: "Room 2", y: 178 },
    { room: "Room 3", y: 274 },
  ]
  const statusLayout = {
    critical: { label: "Critical", y: 74, color: "#ef4444" },
    warning: { label: "Warning", y: 146, color: "#f59e0b" },
    safe: { label: "Safe", y: 218, color: "#10b981" },
    offline: { label: "Offline", y: 290, color: "#94a3b8" },
  }
  const displayRooms = roomLayout.map(({ room, y }) => ({
    y,
    data:
      rooms.find((candidate) => candidate.room === room) ??
      ({
        room,
        status: "NORMAL",
        message: null,
        temperature: null,
        smokeLevel: null,
        lastUpdated: null,
        acknowledged: false,
      } satisfies RoomFireStatus),
  }))

  return (
    <Card className="overflow-hidden border-0 bg-white/90 shadow-xl">
      <CardHeader className="pb-0">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Live Room Flow
            </CardTitle>
            <CardDescription>
              Sankey-style view of all three room sensors flowing into their current safety state.
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className={offline ? "border-red-200 bg-red-50 text-red-700" : "border-blue-200 bg-blue-50 text-blue-700"}
          >
            {offline ? "Feed paused" : "Live updating"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        <div className="overflow-hidden rounded-3xl border bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-2 shadow-inner">
          <svg
            viewBox="0 0 960 360"
            role="img"
            aria-label="Live fire status flow for Room 1, Room 2, and Room 3"
            className="h-[22rem] w-full"
          >
            <defs>
              <filter id="flow-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="5" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <rect x="0" y="0" width="960" height="360" rx="28" fill="url(#fireFlowBg)" opacity="0" />
            <g opacity="0.45">
              <circle cx="120" cy="60" r="110" fill="#2563eb" opacity="0.12" />
              <circle cx="850" cy="300" r="140" fill="#ef4444" opacity="0.08" />
            </g>

            <NodeBox x={44} y={142} width={160} height={76} title="Sensor Feed" subtitle="Arduino bridge" tone="source" />

            {Object.entries(statusLayout).map(([key, status]) => (
              <NodeBox
                key={key}
                x={754}
                y={status.y - 26}
                width={158}
                height={52}
                title={status.label}
                subtitle={key === "safe" ? "Normal/Cleared" : "Current state"}
                color={status.color}
              />
            ))}

            {displayRooms.map(({ data, y }) => {
              const flow = getRoomFlow(data, offline)
              const statusY = statusLayout[flow.bucket].y
              const firstPath = `M 204 180 C 284 180, 296 ${y}, 360 ${y}`
              const secondPath = `M 500 ${y} C 590 ${y}, 630 ${statusY}, 754 ${statusY}`

              return (
                <g key={data.room}>
                  <path
                    d={firstPath}
                    fill="none"
                    stroke={flow.color}
                    strokeLinecap="round"
                    strokeWidth={flow.width + 10}
                    opacity="0.12"
                  />
                  <path
                    d={secondPath}
                    fill="none"
                    stroke={flow.color}
                    strokeLinecap="round"
                    strokeWidth={flow.width + 10}
                    opacity="0.12"
                  />
                  <path
                    className="fire-flow-link"
                    d={firstPath}
                    fill="none"
                    stroke={flow.color}
                    strokeLinecap="round"
                    strokeWidth={flow.width}
                    opacity="0.82"
                    filter={flow.bucket === "critical" ? "url(#flow-glow)" : undefined}
                  />
                  <path
                    className="fire-flow-link"
                    d={secondPath}
                    fill="none"
                    stroke={flow.color}
                    strokeLinecap="round"
                    strokeWidth={flow.width}
                    opacity="0.82"
                    filter={flow.bucket === "critical" ? "url(#flow-glow)" : undefined}
                  />

                  <NodeBox
                    x={360}
                    y={y - 28}
                    width={140}
                    height={56}
                    title={data.room}
                    subtitle={flow.label}
                    color={flow.color}
                    active={flow.bucket === "critical"}
                  />

                  <text x="520" y={y - 12} fill="#cbd5e1" fontSize="12" fontWeight="600">
                    {data.temperature != null ? `Temp ${data.temperature}` : "Temp --"}
                  </text>
                  <text x="520" y={y + 10} fill="#94a3b8" fontSize="12">
                    {data.smokeLevel != null ? `Smoke ${data.smokeLevel}` : "Smoke --"}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        <div className="mt-4 grid gap-2 text-xs text-muted-foreground sm:grid-cols-4">
          {Object.entries(statusLayout).map(([key, status]) => (
            <div key={key} className="flex items-center gap-2 rounded-xl border bg-white p-3">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: status.color }} />
              <span className="font-medium text-slate-700">{status.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function NodeBox({
  x,
  y,
  width,
  height,
  title,
  subtitle,
  tone,
  color = "#38bdf8",
  active = false,
}: {
  x: number
  y: number
  width: number
  height: number
  title: string
  subtitle: string
  tone?: "source"
  color?: string
  active?: boolean
}) {
  const fill = tone === "source" ? "#0f172a" : "#020617"

  return (
    <g className="transition-all duration-700">
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx="18"
        fill={fill}
        stroke={color}
        strokeOpacity={active ? 0.9 : 0.45}
        strokeWidth={active ? 2 : 1}
      />
      <rect
        x={x + 10}
        y={y + 12}
        width="8"
        height={height - 24}
        rx="4"
        fill={color}
        opacity={active ? 1 : 0.75}
      />
      <text x={x + 28} y={y + 29} fill="#f8fafc" fontSize="14" fontWeight="700">
        {title}
      </text>
      <text x={x + 28} y={y + 49} fill="#94a3b8" fontSize="11">
        {subtitle}
      </text>
    </g>
  )
}

function getRoomFlow(room: RoomFireStatus, offline: boolean) {
  if (offline) {
    return {
      bucket: "offline" as const,
      label: "Offline",
      color: "#94a3b8",
      width: 12,
    }
  }

  if (room.status === "FIRE_CONFIRMED") {
    return {
      bucket: "critical" as const,
      label: "Critical",
      color: "#ef4444",
      width: 24,
    }
  }

  if (room.status === "SUSPICIOUS") {
    return {
      bucket: "warning" as const,
      label: "Warning",
      color: "#f59e0b",
      width: 18,
    }
  }

  return {
    bucket: "safe" as const,
    label: STATUS_LABELS[room.status],
    color: "#10b981",
    width: 14,
  }
}

function LiveZoneCard({
  room,
  onAcknowledge,
  acknowledging,
}: {
  room: RoomFireStatus
  onAcknowledge: () => void
  acknowledging: boolean
}) {
  const alerting = room.status === "FIRE_CONFIRMED" || room.status === "SUSPICIOUS"
  const critical = room.status === "FIRE_CONFIRMED"

  return (
    <div
      className={cn(
        "rounded-2xl border p-4 shadow-sm",
        STATUS_STYLES[room.status],
        critical && "fire-alert-pulse"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-slate-950">{room.room}</p>
          <Badge variant="outline" className={cn("mt-2", STATUS_STYLES[room.status])}>
            {alerting ? getFireSeverity(room.status) : STATUS_LABELS[room.status]}
          </Badge>
        </div>
        {critical ? (
          <Flame className="h-5 w-5 text-red-600" />
        ) : alerting ? (
          <AlertTriangle className="h-5 w-5 text-amber-600" />
        ) : (
          <ShieldCheck className="h-5 w-5 text-emerald-600" />
        )}
      </div>
      <p className="mt-3 min-h-10 text-xs text-slate-600">
        {room.message ?? "No active hazard reported from this room."}
      </p>
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-600">
        {room.temperature != null && (
          <Badge variant="outline" className="bg-white">
            <Thermometer className="mr-1 h-3 w-3" />
            {room.temperature}
          </Badge>
        )}
        {room.smokeLevel != null && (
          <Badge variant="outline" className="bg-white">
            <Wind className="mr-1 h-3 w-3" />
            {room.smokeLevel}
          </Badge>
        )}
      </div>
      <div className="mt-4 flex items-center justify-between gap-2">
        <span className="text-[11px] text-slate-500">
          {formatFireAlertTime(room.lastUpdated)}
        </span>
        {alerting && !room.acknowledged && (
          <Button size="sm" variant="outline" onClick={onAcknowledge} disabled={acknowledging}>
            {acknowledging ? "Ack..." : "Acknowledge"}
          </Button>
        )}
      </div>
    </div>
  )
}

function FireEventRow({ event }: { event: FireEventLogItem }) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{event.room}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatFireAlertTime(event.createdAt)}
          </p>
        </div>
        <Badge variant="outline" className={STATUS_STYLES[event.status]}>
          {STATUS_LABELS[event.status]}
        </Badge>
      </div>
      {event.message && (
        <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
          {event.message}
        </p>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        {event.temperature != null && <span>Temp {event.temperature}</span>}
        {event.smokeLevel != null && <span>Smoke {event.smokeLevel}</span>}
        <span>{event.acknowledged ? "Acknowledged" : "Open"}</span>
      </div>
    </div>
  )
}

function formatDuration(seconds: number) {
  if (!seconds) return "0s"
  if (seconds < 60) return `${seconds}s`

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  if (minutes < 60) {
    return remainingSeconds ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  return remainingMinutes ? `${hours}h ${remainingMinutes}m` : `${hours}h`
}
