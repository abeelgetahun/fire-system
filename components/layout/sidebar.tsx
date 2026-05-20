"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/auth-context"
import { getAccessibleRoutes, getRoleDisplayName } from "@/lib/permissions"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import {
  Building2,
  Package,
  ArrowLeftRight,
  ClipboardCheck,
  Users,
  BarChart3,
  Settings,
  LayoutDashboard,
  UserIcon,
  Activity,
  MapPin,
  LogOut,
  ChevronRight,
  X,
} from "lucide-react"
import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { FireStatusPanel } from "./fire-status-panel"

const iconMap: Record<string, typeof LayoutDashboard> = {
  LayoutDashboard,
  Building2,
  Package,
  ArrowLeftRight,
  ClipboardCheck,
  Users,
  BarChart3,
  Settings,
  User: UserIcon,
  Activity,
}

interface SidebarProps {
  onClose?: () => void
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [pendingCount, setPendingCount] = useState(0)
  const [lowStockCount, setLowStockCount] = useState(0)

  useEffect(() => {
    if (!user) return
    if (user.role === "WAREHOUSE_MANAGER" || user.role === "ADMIN") {
      fetchStats()
    }
  }, [user])

  const fetchStats = async () => {
    try {
      const [transfers, inventory] = await Promise.all([
        apiClient.getTransfers({ status: "PENDING" }),
        apiClient.getInventory(),
      ])
      setPendingCount(Array.isArray(transfers) ? transfers.length : 0)
      setLowStockCount(
        Array.isArray(inventory) ? inventory.filter((item) => item.calculatedStatus === "LOW_STOCK").length : 0,
      )
    } catch {
      // silent
    }
  }

  if (!user) return null

  const accessibleRoutes = getAccessibleRoutes(user.role)
  const roleName = getRoleDisplayName(user.role)
  const initials = (user.name || "")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U"

  const getBadgeForRoute = (path: string) => {
    if (path === "/transfers" && pendingCount > 0) {
      return <Badge variant="destructive" className="h-5 min-w-5 justify-center text-[10px] px-1.5">{pendingCount}</Badge>
    }
    if (path === "/inventory" && lowStockCount > 0) {
      return <Badge variant="secondary" className="h-5 min-w-5 justify-center text-[10px] px-1.5">{lowStockCount}</Badge>
    }
    return null
  }

  return (
    <div className="flex flex-col h-full w-64 bg-card border-r">
      {/* ── Brand ── */}
      <div className="flex items-center justify-between px-5 h-16 shrink-0 border-b">
        <Link href="/dashboard" className="flex items-center gap-2.5 group" onClick={() => onClose?.()}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <span className="text-base font-brand font-semibold tracking-tight text-foreground">TeleStock</span>
            <span className="sr-only">Dashboard</span>
          </div>
        </Link>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 lg:hidden">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto scrollbar-thin py-4">
        {/* Navigation */}
        <nav className="px-3 space-y-1">
          <p className="px-3 mb-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Menu
          </p>
          {accessibleRoutes.map((route) => {
            const Icon = iconMap[route.icon] || LayoutDashboard
            const isActive = pathname === route.path
            const badge = getBadgeForRoute(route.path)

            return (
              <Link
                key={route.path}
                href={route.path}
                onClick={() => onClose?.()}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0", isActive && "text-primary")} />
                <span className="flex-1 truncate">{route.name}</span>
                {badge}
                {isActive && <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50" />}
              </Link>
            )
          })}
        </nav>

        <Separator className="my-4 mx-3" />

        {/* Fire Monitor */}
        <div className="px-3">
          <p className="px-3 mb-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Fire Monitor
          </p>
        </div>
        <FireStatusPanel />
      </div>

      {/* ── User profile (pinned to bottom) ── */}
      <div className="shrink-0 border-t p-3">
        <div className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted transition-colors">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
              {roleName}
              {user.warehouse && (
                <>
                  <span className="text-border">·</span>
                  <MapPin className="h-2.5 w-2.5 shrink-0" />
                  <span className="truncate">{user.warehouse.name}</span>
                </>
              )}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
            onClick={logout}
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
