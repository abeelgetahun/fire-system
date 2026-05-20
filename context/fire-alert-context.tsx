"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { AlertTriangle, Flame, MapPin, ShieldAlert } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export type FireStatus = "NORMAL" | "SUSPICIOUS" | "FIRE_CONFIRMED" | "CLEARED"
export type OverallFireStatus = "NORMAL" | "WARNING" | "FIRE"

export interface RoomFireStatus {
  eventId?: string | null
  room: string
  status: FireStatus
  message: string | null
  temperature: number | null
  smokeLevel: number | null
  lastUpdated: string | null
  acknowledged: boolean
}

interface FireStatusData {
  rooms: RoomFireStatus[]
  overallStatus: OverallFireStatus
  unacknowledgedCount?: number
  latestAlertAt?: string | null
}

interface FireAlertContextValue {
  rooms: RoomFireStatus[]
  activeAlerts: RoomFireStatus[]
  latestCriticalAlert: RoomFireStatus | null
  overallStatus: OverallFireStatus
  unacknowledgedCount: number
  loading: boolean
  offline: boolean
  lastRefresh: Date
  acknowledgingRoom: string | null
  fetchStatus: () => Promise<void>
  acknowledgeRoom: (room: string) => Promise<void>
}

const FireAlertContext = createContext<FireAlertContextValue | undefined>(undefined)
const SEEN_ALERTS_KEY = "telestock.seen-fire-alerts"

export function isActiveFireAlert(room: RoomFireStatus) {
  return (
    !room.acknowledged &&
    (room.status === "SUSPICIOUS" || room.status === "FIRE_CONFIRMED")
  )
}

export function getFireSeverity(status: FireStatus) {
  if (status === "FIRE_CONFIRMED") return "Critical"
  if (status === "SUSPICIOUS") return "Medium"
  return "Low"
}

export function getFireAlertKey(room: RoomFireStatus) {
  return `${room.eventId ?? room.room}:${room.status}:${room.lastUpdated ?? "pending"}`
}

export function formatFireAlertTime(value: string | null) {
  if (!value) return "Just now"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Just now"

  return date.toLocaleString()
}

function sortByLatestAlert(a: RoomFireStatus, b: RoomFireStatus) {
  return new Date(b.lastUpdated ?? 0).getTime() - new Date(a.lastUpdated ?? 0).getTime()
}

export function FireAlertProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<FireStatusData>({
    rooms: [],
    overallStatus: "NORMAL",
    unacknowledgedCount: 0,
    latestAlertAt: null,
  })
  const [loading, setLoading] = useState(true)
  const [offline, setOffline] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [acknowledgingRoom, setAcknowledgingRoom] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/fire-detection", { cache: "no-store" })

      if (!res.ok) {
        setOffline(true)
        return
      }

      const json: FireStatusData = await res.json()
      setData({
        rooms: json.rooms ?? [],
        overallStatus: json.overallStatus ?? "NORMAL",
        unacknowledgedCount: json.unacknowledgedCount ?? 0,
        latestAlertAt: json.latestAlertAt ?? null,
      })
      setOffline(false)
    } catch {
      setOffline(true)
    } finally {
      setLoading(false)
      setLastRefresh(new Date())
    }
  }, [])

  useEffect(() => {
    fetchStatus()
    const interval = window.setInterval(
      fetchStatus,
      data.overallStatus === "NORMAL" ? 15000 : 5000
    )

    return () => window.clearInterval(interval)
  }, [data.overallStatus, fetchStatus])

  const activeAlerts = useMemo(
    () => data.rooms.filter(isActiveFireAlert).sort(sortByLatestAlert),
    [data.rooms]
  )

  const latestCriticalAlert = useMemo(
    () => activeAlerts.find((room) => room.status === "FIRE_CONFIRMED") ?? null,
    [activeAlerts]
  )

  const unacknowledgedCount =
    data.unacknowledgedCount ?? activeAlerts.length

  const acknowledgeRoom = useCallback(
    async (room: string) => {
      setAcknowledgingRoom(room)

      try {
        const token = window.localStorage.getItem("token")
        const res = await fetch("/api/fire-detection", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ room }),
        })

        if (!res.ok) {
          throw new Error("Unable to acknowledge fire alert")
        }

        await fetchStatus()
        toast({
          title: "Fire alert acknowledged",
          description: `${room} has been marked as acknowledged.`,
        })
      } catch {
        toast({
          title: "Could not acknowledge alert",
          description: "Please check the sensor connection and try again.",
          variant: "destructive",
        })
      } finally {
        setAcknowledgingRoom(null)
      }
    },
    [fetchStatus, toast]
  )

  const value = useMemo<FireAlertContextValue>(
    () => ({
      rooms: data.rooms,
      activeAlerts,
      latestCriticalAlert,
      overallStatus: data.overallStatus,
      unacknowledgedCount,
      loading,
      offline,
      lastRefresh,
      acknowledgingRoom,
      fetchStatus,
      acknowledgeRoom,
    }),
    [
      data.rooms,
      activeAlerts,
      latestCriticalAlert,
      data.overallStatus,
      unacknowledgedCount,
      loading,
      offline,
      lastRefresh,
      acknowledgingRoom,
      fetchStatus,
      acknowledgeRoom,
    ]
  )

  return (
    <FireAlertContext.Provider value={value}>
      <FireAlertExperience />
      {children}
    </FireAlertContext.Provider>
  )
}

function FireAlertExperience() {
  const {
    activeAlerts,
    latestCriticalAlert,
    acknowledgeRoom,
    acknowledgingRoom,
  } = useFireAlerts()
  const { toast } = useToast()
  const [modalAlertKey, setModalAlertKey] = useState<string | null>(null)
  const [dismissedModalKey, setDismissedModalKey] = useState<string | null>(null)
  const seenAlertKeys = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (typeof window === "undefined") return

    try {
      const stored = window.sessionStorage.getItem(SEEN_ALERTS_KEY)
      if (stored) {
        seenAlertKeys.current = new Set(JSON.parse(stored))
      }
    } catch {
      seenAlertKeys.current = new Set()
    }
  }, [])

  useEffect(() => {
    const modalStillActive = activeAlerts.some(
      (alert) => getFireAlertKey(alert) === modalAlertKey
    )

    if (modalAlertKey && !modalStillActive) {
      setModalAlertKey(null)
    }
  }, [activeAlerts, modalAlertKey])

  useEffect(() => {
    for (const alert of activeAlerts) {
      const key = getFireAlertKey(alert)
      if (seenAlertKeys.current.has(key)) continue

      seenAlertKeys.current.add(key)
      persistSeenAlertKeys(seenAlertKeys.current)

      const critical = alert.status === "FIRE_CONFIRMED"
      toast({
        title: critical ? "Critical fire alert" : "Fire warning detected",
        description: `${alert.room} reported ${getFireSeverity(alert.status).toLowerCase()} severity at ${formatFireAlertTime(alert.lastUpdated)}.`,
        variant: "destructive",
      })

      if (critical && !modalAlertKey && dismissedModalKey !== key) {
        setModalAlertKey(key)
      }
    }
  }, [activeAlerts, dismissedModalKey, modalAlertKey, toast])

  useEffect(() => {
    if (!latestCriticalAlert || modalAlertKey) return

    const key = getFireAlertKey(latestCriticalAlert)
    if (dismissedModalKey !== key) {
      setModalAlertKey(key)
    }
  }, [dismissedModalKey, latestCriticalAlert, modalAlertKey])

  const modalAlert =
    activeAlerts.find((alert) => getFireAlertKey(alert) === modalAlertKey) ??
    (latestCriticalAlert && getFireAlertKey(latestCriticalAlert) !== dismissedModalKey
      ? latestCriticalAlert
      : null)

  const scrollToFireMonitor = () => {
    window.setTimeout(() => {
      document
        .getElementById("fire-monitor-panel")
        ?.scrollIntoView({ behavior: "smooth", block: "center" })
    }, 0)
  }

  return (
    <AlertDialog
      open={Boolean(modalAlert)}
      onOpenChange={(open) => {
        if (!open) {
          if (modalAlert) {
            setDismissedModalKey(getFireAlertKey(modalAlert))
          }
          setModalAlertKey(null)
        }
      }}
    >
      <AlertDialogContent className="max-w-xl overflow-hidden border-red-200 p-0 shadow-2xl">
        {modalAlert && (
          <>
            <div className="bg-gradient-to-r from-red-700 via-red-600 to-orange-600 px-6 py-5 text-white">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white/15 p-3 shadow-inner ring-1 ring-white/25">
                  <Flame className="h-7 w-7 fire-alert-shake" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/75">
                    Emergency Alert
                  </p>
                  <AlertDialogTitle className="mt-1 text-2xl font-bold text-white">
                    Fire alert detected
                  </AlertDialogTitle>
                </div>
              </div>
            </div>

            <div className="space-y-5 p-6">
              <AlertDialogHeader className="space-y-2 text-left">
                <AlertDialogDescription className="text-base text-slate-700">
                  Immediate attention is required. Review the affected sensor and acknowledge once your response team is aware.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <div className="grid gap-3 rounded-2xl border border-red-100 bg-red-50/70 p-4 sm:grid-cols-2">
                <FireAlertDetail
                  icon={<MapPin className="h-4 w-4" />}
                  label="Sensor / Location"
                  value={modalAlert.room}
                />
                <FireAlertDetail
                  icon={<AlertTriangle className="h-4 w-4" />}
                  label="Severity"
                  value={getFireSeverity(modalAlert.status)}
                  valueClassName="text-red-700"
                />
                <FireAlertDetail
                  icon={<ShieldAlert className="h-4 w-4" />}
                  label="Status"
                  value={modalAlert.message ?? "Fire confirmed by sensor"}
                />
                <FireAlertDetail
                  icon={<Flame className="h-4 w-4" />}
                  label="Triggered"
                  value={formatFireAlertTime(modalAlert.lastUpdated)}
                />
              </div>

              <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                {modalAlert.temperature != null && (
                  <Badge variant="outline" className="border-red-200 bg-white text-red-700">
                    Temp {modalAlert.temperature}
                  </Badge>
                )}
                {modalAlert.smokeLevel != null && (
                  <Badge variant="outline" className="border-red-200 bg-white text-red-700">
                    Smoke {modalAlert.smokeLevel}
                  </Badge>
                )}
              </div>

              <AlertDialogFooter>
                <AlertDialogCancel
                  onClick={scrollToFireMonitor}
                  className="border-slate-200 bg-white"
                >
                  View Details
                </AlertDialogCancel>
                <AlertDialogAction
                  disabled={acknowledgingRoom === modalAlert.room}
                  onClick={async (event) => {
                    event.preventDefault()
                    await acknowledgeRoom(modalAlert.room)
                    setModalAlertKey(null)
                  }}
                  className="bg-red-600 text-white hover:bg-red-700"
                >
                  {acknowledgingRoom === modalAlert.room ? "Acknowledging..." : "Acknowledge"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </div>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}

function FireAlertDetail({
  icon,
  label,
  value,
  valueClassName,
}: {
  icon: ReactNode
  label: string
  value: string
  valueClassName?: string
}) {
  return (
    <div className="flex gap-3 rounded-xl bg-white/80 p-3 ring-1 ring-red-100">
      <div className="mt-0.5 text-red-500">{icon}</div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <p className={cn("mt-1 truncate text-sm font-semibold text-slate-900", valueClassName)}>
          {value}
        </p>
      </div>
    </div>
  )
}

function persistSeenAlertKeys(keys: Set<string>) {
  if (typeof window === "undefined") return

  try {
    window.sessionStorage.setItem(
      SEEN_ALERTS_KEY,
      JSON.stringify(Array.from(keys).slice(-50))
    )
  } catch {
    // Session storage can be unavailable in private browsing; alert UI still works.
  }
}

export function useFireAlerts() {
  const context = useContext(FireAlertContext)

  if (!context) {
    throw new Error("useFireAlerts must be used within FireAlertProvider")
  }

  return context
}
