"use client"

import { cn } from "@/lib/utils"
import { Flame, ShieldCheck, AlertTriangle, CheckCircle, RefreshCw, WifiOff } from "lucide-react"
import { useFireAlerts, type FireStatus, type OverallFireStatus } from "@/context/fire-alert-context"

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS: Record<
  FireStatus,
  { dot: string; ring: string; text: string; label: string; Icon: typeof Flame; pulse: boolean }
> = {
  NORMAL:         { dot: "bg-emerald-500", ring: "ring-emerald-200", text: "text-emerald-700", label: "Clear",   Icon: ShieldCheck,   pulse: false },
  CLEARED:        { dot: "bg-emerald-500", ring: "ring-emerald-200", text: "text-emerald-700", label: "Cleared", Icon: CheckCircle,   pulse: false },
  SUSPICIOUS:     { dot: "bg-amber-500",   ring: "ring-amber-200",   text: "text-amber-700",   label: "Warning", Icon: AlertTriangle, pulse: true  },
  FIRE_CONFIRMED: { dot: "bg-red-500",     ring: "ring-red-200",     text: "text-red-700",     label: "FIRE!",   Icon: Flame,         pulse: true  },
}

const HEADER: Record<OverallFireStatus, string> = {
  NORMAL:  "from-emerald-600 to-teal-700",
  WARNING: "from-amber-500  to-orange-600",
  FIRE:    "from-red-600    to-red-700",
}

const LINE: Record<OverallFireStatus, string> = {
  NORMAL:  "bg-slate-200",
  WARNING: "bg-amber-300",
  FIRE:    "bg-red-300",
}

// ── Component ─────────────────────────────────────────────────────────────────
export function FireStatusPanel() {
  const {
    rooms,
    overallStatus,
    loading,
    offline,
    lastRefresh,
    fetchStatus,
    acknowledgeRoom,
    acknowledgingRoom,
  } = useFireAlerts()

  return (
    <div
      id="fire-monitor-panel"
      className="mx-2 rounded-xl overflow-hidden border border-slate-200/80 shadow-sm bg-white"
    >
      {/* ── Header ── */}
      <div
        className={cn(
          "px-3 py-2.5 bg-gradient-to-r text-white transition-all duration-700",
          HEADER[overallStatus],
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Flame className={cn("h-3.5 w-3.5", overallStatus === "FIRE" && "animate-pulse")} />
            <span className="text-[11px] font-bold uppercase tracking-widest">Fire Monitor</span>
          </div>

          <div className="flex items-center gap-1.5">
            {overallStatus !== "NORMAL" && (
              <span className="animate-pulse rounded-full bg-white/25 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide">
                {overallStatus === "FIRE" ? "ALERT" : "WARN"}
              </span>
            )}
            <button
              onClick={fetchStatus}
              title="Refresh now"
              className="rounded p-0.5 opacity-60 hover:opacity-100 hover:bg-white/20 transition-all"
            >
              <RefreshCw className="h-3 w-3" />
            </button>
          </div>
        </div>

        <p className="mt-0.5 text-[10px] font-medium opacity-75 leading-none">
          {overallStatus === "NORMAL"  && "All warehouse zones clear"}
          {overallStatus === "WARNING" && "Smoke detected — monitoring"}
          {overallStatus === "FIRE"    && "FIRE DETECTED — act immediately!"}
        </p>
      </div>

      {/* ── Room flow ── */}
      <div className="px-3.5 pt-3 pb-2">
        {loading ? (
          <div className="py-3 text-center text-[11px] text-slate-400 animate-pulse">
            Reading sensors…
          </div>
        ) : offline ? (
          <div className="py-3 flex items-center justify-center gap-2 text-slate-400">
            <WifiOff className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="text-[11px]">Simulator offline</span>
          </div>
        ) : (
          rooms.map((room, idx) => {
            const cfg   = STATUS[room.status] ?? STATUS.NORMAL
            const Icon  = cfg.Icon
            const isAlert = room.status === "FIRE_CONFIRMED" || room.status === "SUSPICIOUS"
            const isLast  = idx === rooms.length - 1

            return (
              <div key={room.room} className="flex gap-2.5">
                {/* ── Timeline column ── */}
                <div className="flex flex-col items-center flex-shrink-0">
                  {/* Dot */}
                  <div
                    className={cn(
                      "w-[18px] h-[18px] rounded-full flex items-center justify-center ring-2 mt-0.5",
                      "transition-all duration-500 ease-in-out",
                      cfg.dot,
                      cfg.ring,
                      cfg.pulse && "animate-pulse",
                    )}
                  >
                    <Icon className="h-2.5 w-2.5 text-white" />
                  </div>

                  {/* Connector line */}
                  {!isLast && (
                    <div
                      className={cn(
                        "w-px mt-1 mb-1 transition-colors duration-700",
                        LINE[overallStatus],
                      )}
                      style={{ minHeight: "22px" }}
                    />
                  )}
                </div>

                {/* ── Room info ── */}
                <div className={cn("flex-1 min-w-0", !isLast ? "pb-1" : "pb-0")}>
                  {/* Name + badge row */}
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[11px] font-semibold text-slate-700 leading-[18px]">
                        {room.room}
                      </span>
                      <span
                        className={cn(
                          "text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full",
                          "transition-all duration-500 ease-in-out",
                          room.status === "FIRE_CONFIRMED"
                            ? "bg-red-100 text-red-700 ring-1 ring-red-200"
                            : room.status === "SUSPICIOUS"
                            ? "bg-amber-100 text-amber-700 ring-1 ring-amber-200"
                            : "bg-emerald-100 text-emerald-700",
                        )}
                      >
                        {cfg.label}
                      </span>
                    </div>

                    {isAlert && !room.acknowledged && (
                      <button
                        onClick={() => acknowledgeRoom(room.room)}
                        disabled={acknowledgingRoom === room.room}
                        className={cn(
                          "flex-shrink-0 text-[9px] font-semibold border rounded px-1.5 py-0.5",
                          "transition-all duration-200 hover:scale-105 disabled:opacity-50",
                          cfg.text,
                          "border-current/30 hover:bg-current/5",
                        )}
                      >
                        {acknowledgingRoom === room.room ? "…" : "Ack"}
                      </button>
                    )}
                  </div>

                  {/* Sensor readings — only if available */}
                  {(room.temperature != null || room.smokeLevel != null) && (
                    <div className="flex gap-2.5 mt-0.5">
                      {room.temperature != null && (
                        <span className="text-[9px] text-slate-400 tabular-nums">
                          {room.temperature}°C
                        </span>
                      )}
                      {room.smokeLevel != null && (
                        <span className="text-[9px] text-slate-400 tabular-nums">
                          smoke&nbsp;{room.smokeLevel}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* ── Footer ── */}
      <div className="px-3.5 py-1.5 border-t border-slate-100 bg-slate-50/50">
        <p className="text-[9px] text-slate-400">
          {offline
            ? "Run bridge.py to connect"
            : `Updated ${lastRefresh.toLocaleTimeString()}`}
        </p>
      </div>
    </div>
  )
}
