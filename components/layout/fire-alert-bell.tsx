"use client"

import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock,
  Flame,
  MapPin,
  RefreshCw,
  Thermometer,
  Wind,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  formatFireAlertTime,
  getFireSeverity,
  useFireAlerts,
  type RoomFireStatus,
} from "@/context/fire-alert-context"
import { cn } from "@/lib/utils"

export function FireAlertBell() {
  const {
    activeAlerts,
    unacknowledgedCount,
    overallStatus,
    offline,
    loading,
    fetchStatus,
  } = useFireAlerts()
  const hasAlerts = unacknowledgedCount > 0
  const isCritical = overallStatus === "FIRE"
  const Icon = hasAlerts ? Flame : Bell

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={hasAlerts ? `${unacknowledgedCount} fire alerts` : "Notifications"}
          className={cn(
            "relative rounded-full transition-all",
            hasAlerts && "bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/60",
            isCritical && "fire-alert-pulse"
          )}
        >
          <Icon
            className={cn(
              "h-4 w-4 sm:h-5 sm:w-5",
              isCritical && "fire-alert-shake"
            )}
          />
          {hasAlerts && (
            <Badge className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[10px] text-white shadow-lg ring-2 ring-background">
              {unacknowledgedCount > 9 ? "9+" : unacknowledgedCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-[22rem] overflow-hidden p-0 shadow-xl">
        <div
          className={cn(
            "border-b px-4 py-3",
            hasAlerts
              ? "border-red-100 bg-gradient-to-r from-red-50 to-orange-50 dark:border-red-900 dark:from-red-950/50 dark:to-orange-950/50"
              : "bg-background"
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                {hasAlerts ? (
                  <Flame className="h-4 w-4 text-red-600" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                )}
                <h3 className="text-sm font-semibold">
                  {hasAlerts ? "Fire alerts" : "Notifications"}
                </h3>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {hasAlerts
                  ? "Unacknowledged sensor events need attention."
                  : "All fire sensors are clear."}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={fetchStatus}
              className="h-8 w-8 rounded-full"
              aria-label="Refresh fire alerts"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            </Button>
          </div>
        </div>

        {offline ? (
          <div className="p-4 text-sm text-muted-foreground">
            Sensor feed is offline. Check the bridge connection and try refreshing.
          </div>
        ) : hasAlerts ? (
          <div className="max-h-80 overflow-y-auto p-2">
            {activeAlerts.map((alert) => (
              <FireAlertRow key={`${alert.room}-${alert.status}-${alert.lastUpdated}`} alert={alert} />
            ))}
          </div>
        ) : (
          <div className="p-5 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <p className="mt-3 text-sm font-medium">No active fire alerts</p>
            <p className="mt-1 text-xs text-muted-foreground">
              New sensor events will appear here instantly after the next live refresh.
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

function FireAlertRow({ alert }: { alert: RoomFireStatus }) {
  const { acknowledgeRoom, acknowledgingRoom } = useFireAlerts()
  const critical = alert.status === "FIRE_CONFIRMED"

  return (
    <div
      className={cn(
        "rounded-xl border p-3 transition-colors",
        critical
          ? "border-red-200 bg-red-50/80 dark:border-red-800 dark:bg-red-950/40"
          : "border-amber-200 bg-amber-50/80 dark:border-amber-800 dark:bg-amber-950/40"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "mt-0.5 rounded-full p-2 text-white",
            critical ? "bg-red-600" : "bg-amber-500"
          )}
        >
          {critical ? (
            <Flame className="h-4 w-4" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-semibold">{alert.room}</p>
            <Badge
              variant="outline"
              className={cn(
                "shrink-0 border bg-card text-[10px]",
                critical ? "border-red-200 text-red-700" : "border-amber-200 text-amber-700"
              )}
            >
              {getFireSeverity(alert.status)}
            </Badge>
          </div>

          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {alert.message ?? (critical ? "Fire confirmed by sensor" : "Smoke levels are elevated")}
          </p>

          <div className="mt-3 grid gap-1.5 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              {formatFireAlertTime(alert.lastUpdated)}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3 w-3" />
              Warehouse sensor node
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {alert.temperature != null && (
              <Badge variant="outline" className="border-border bg-card text-[10px]">
                <Thermometer className="mr-1 h-3 w-3" />
                {alert.temperature}
              </Badge>
            )}
            {alert.smokeLevel != null && (
              <Badge variant="outline" className="border-border bg-card text-[10px]">
                <Wind className="mr-1 h-3 w-3" />
                {alert.smokeLevel}
              </Badge>
            )}
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => acknowledgeRoom(alert.room)}
              disabled={acknowledgingRoom === alert.room}
              className="ml-auto h-7 border-border bg-card text-xs hover:bg-muted"
            >
              {acknowledgingRoom === alert.room ? "Ack..." : "Acknowledge"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
