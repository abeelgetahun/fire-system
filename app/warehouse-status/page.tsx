"use client"

import type { ReactNode } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { FireStatusSection } from "@/components/dashboards/fire-status-section"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useFireAlerts } from "@/context/fire-alert-context"
import { Activity, Flame, RadioTower, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"

export default function WarehouseStatusPage() {
  return (
    <MainLayout>
      <WarehouseStatusContent />
    </MainLayout>
  )
}

function WarehouseStatusContent() {
  const { overallStatus, unacknowledgedCount, offline } = useFireAlerts()

  return (
    <div className="min-h-screen space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-white dark:from-background dark:via-background dark:to-background p-3 sm:p-4 lg:p-6">
      <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-slate-950 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.28),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.25),transparent_32%)]" />
        <div className="relative p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <Badge className="border border-white/15 bg-white/10 text-white">
                  <RadioTower className="mr-1 h-3.5 w-3.5" />
                  Arduino / Proteus Live Feed
                </Badge>
                <Badge
                  className={cn(
                    "border",
                    offline
                      ? "border-red-300/40 bg-red-400/15 text-red-100"
                      : "border-emerald-300/40 bg-emerald-400/15 text-emerald-100"
                  )}
                >
                  {offline ? "Bridge offline" : "Bridge online"}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Warehouse Status
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Monitor live fire signals, sensor health, response time, and the latest alert history from every configured warehouse zone.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[28rem]">
              <HeroMiniStat
                icon={<Flame className="h-5 w-5" />}
                label="Open Alerts"
                value={unacknowledgedCount}
                active={overallStatus === "FIRE"}
              />
              <HeroMiniStat
                icon={<Activity className="h-5 w-5" />}
                label="Mode"
                value={overallStatus === "FIRE" ? "Critical" : overallStatus === "WARNING" ? "Warning" : "Safe"}
                active={overallStatus !== "NORMAL"}
              />
              <HeroMiniStat
                icon={<ShieldCheck className="h-5 w-5" />}
                label="Response"
                value={overallStatus === "NORMAL" ? "Ready" : "Active"}
                active={overallStatus !== "NORMAL"}
              />
            </div>
          </div>
        </div>
      </div>

      <FireStatusSection variant="full" />
    </div>
  )
}

function HeroMiniStat({
  icon,
  label,
  value,
  active,
}: {
  icon: ReactNode
  label: string
  value: string | number
  active: boolean
}) {
  return (
    <Card className="border-white/15 bg-white/10 text-white shadow-none backdrop-blur">
      <CardContent className="p-4">
        <div className={cn("mb-3 w-fit rounded-xl p-2", active ? "bg-red-500/25" : "bg-white/10")}>
          {icon}
        </div>
        <p className="text-xs uppercase tracking-wide text-white/60">{label}</p>
        <p className="mt-1 text-xl font-bold">{value}</p>
      </CardContent>
    </Card>
  )
}
