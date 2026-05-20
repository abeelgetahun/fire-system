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
  Plus,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  FileText,
  MapPin,
  Clock,
  Shield,
  Truck,
  Target,
  Activity,
  Calendar,
  Download,
  X,
} from "lucide-react"
import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { FireStatusPanel } from "./fire-status-panel"

const iconMap = {
  LayoutDashboard: LayoutDashboard,
  Building2: Building2,
  Package: Package,
  ArrowLeftRight: ArrowLeftRight,
  ClipboardCheck: ClipboardCheck,
  Users: Users,
  BarChart3: BarChart3,
  Settings: Settings,
  User: UserIcon,
  Activity: Activity,
}

interface SidebarProps {
  onClose?: () => void
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname()
  const { user } = useAuth()
  const [pendingCount, setPendingCount] = useState(0)
  const [lowStockCount, setLowStockCount] = useState(0)
  const [teamCount, setTeamCount] = useState(0)

  useEffect(() => {
    if (!user) return
    if (user.role === "WAREHOUSE_MANAGER") {
      fetchManagerStats(user.warehouseId)
    }
  }, [user])

  const fetchManagerStats = async (warehouseId?: string) => {
    try {
      const [transfers, inventory, users] = await Promise.all([
        apiClient.getTransfers({ status: "PENDING" }),
        apiClient.getInventory(),
        apiClient.getUsers(),
      ])
      setPendingCount(Array.isArray(transfers) ? transfers.length : 0)
      setLowStockCount(
        Array.isArray(inventory) ? inventory.filter((item) => item.calculatedStatus === "LOW_STOCK").length : 0,
      )
      setTeamCount(Array.isArray(users) ? users.filter((u) => u.warehouseId === warehouseId).length : 0)
    } catch {
      // silent
    }
  }

  if (!user) return null

  const accessibleRoutes = getAccessibleRoutes(user.role)

  return (
    <div className="pb-12 w-64 bg-card border-r h-full overflow-y-auto">
      <div className="space-y-4 py-4">
        {/* Mobile close button */}
        <div className="flex justify-end px-3 lg:hidden">
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="px-3 py-2">
          {/* Brand header */}
          <div className="mb-4 p-4 bg-primary rounded-lg text-primary-foreground">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-lg">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-brand">TeleStock</h2>
                <p className="text-xs opacity-80">Warehouse Management</p>
              </div>
            </div>
            <div className="text-sm">
              <div className="font-medium">{user.name}</div>
              <div className="text-xs opacity-80">{getRoleDisplayName(user.role)}</div>
              {user.warehouse && (
                <div className="text-xs opacity-70 mt-1 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {user.warehouse.name}
                </div>
              )}
            </div>
          </div>

          {/* Main Navigation */}
          <div className="space-y-1 mb-6">
            <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Navigation
            </div>
            {accessibleRoutes.map((route) => {
              const Icon = iconMap[route.icon as keyof typeof iconMap] || LayoutDashboard
              return (
                <Link
                  key={route.path}
                  href={route.path}
                  onClick={() => onClose?.()}
                  className={cn(
                    "flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                    pathname === route.path
                      ? "bg-primary/10 text-primary border-l-2 border-primary"
                      : "text-foreground/70 hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="mr-3 h-4 w-4" />
                  {route.name}
                </Link>
              )
            })}
          </div>

          <Separator className="my-4" />

          {/* Manager-Specific Quick Actions */}
          {user.role === "WAREHOUSE_MANAGER" && (
            <>
              <div className="space-y-1 mb-6">
                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Shield className="h-3 w-3" />
                  Manager Tools
                </div>

                <Link
                  href="/transfers"
                  onClick={() => onClose?.()}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                    pathname === "/transfers"
                      ? "bg-primary/10 text-primary border-l-2 border-primary"
                      : "text-foreground/70 hover:bg-muted hover:text-foreground",
                  )}
                >
                  <div className="flex items-center">
                    <CheckCircle className="mr-3 h-4 w-4" />
                    Approve Transfers
                  </div>
                  {pendingCount > 0 && (
                    <Badge variant="destructive" className="h-5 text-xs">{pendingCount}</Badge>
                  )}
                </Link>

                <Link
                  href="/users"
                  onClick={() => onClose?.()}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                    pathname === "/users"
                      ? "bg-primary/10 text-primary border-l-2 border-primary"
                      : "text-foreground/70 hover:bg-muted hover:text-foreground",
                  )}
                >
                  <div className="flex items-center">
                    <Users className="mr-3 h-4 w-4" />
                    Manage Team
                  </div>
                  <Badge variant="outline" className="h-5 text-xs">{teamCount}</Badge>
                </Link>

                <Link
                  href="/inventory"
                  onClick={() => onClose?.()}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                    pathname === "/inventory"
                      ? "bg-primary/10 text-primary border-l-2 border-primary"
                      : "text-foreground/70 hover:bg-muted hover:text-foreground",
                  )}
                >
                  <div className="flex items-center">
                    <AlertTriangle className="mr-3 h-4 w-4" />
                    Stock Alerts
                  </div>
                  {lowStockCount > 0 && (
                    <Badge variant="secondary" className="h-5 text-xs">{lowStockCount}</Badge>
                  )}
                </Link>

                <Link
                  href="/reports"
                  onClick={() => onClose?.()}
                  className={cn(
                    "flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                    pathname === "/reports"
                      ? "bg-primary/10 text-primary border-l-2 border-primary"
                      : "text-foreground/70 hover:bg-muted hover:text-foreground",
                  )}
                >
                  <TrendingUp className="mr-3 h-4 w-4" />
                  Analytics & Reports
                </Link>

                <Link
                  href="/audit"
                  onClick={() => onClose?.()}
                  className={cn(
                    "flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                    pathname === "/audit"
                      ? "bg-primary/10 text-primary border-l-2 border-primary"
                      : "text-foreground/70 hover:bg-muted hover:text-foreground",
                  )}
                >
                  <ClipboardCheck className="mr-3 h-4 w-4" />
                  Schedule Audits
                </Link>
              </div>

              <Separator className="my-4" />

              <div className="space-y-1 mb-6">
                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Activity className="h-3 w-3" />
                  Operations
                </div>

                <Link href="/inventory/add" onClick={() => onClose?.()} className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/70 hover:bg-muted hover:text-foreground transition-all duration-150">
                  <Plus className="mr-3 h-4 w-4" />
                  Add New Item
                </Link>
                <Link href="/warehouses" onClick={() => onClose?.()} className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/70 hover:bg-muted hover:text-foreground transition-all duration-150">
                  <MapPin className="mr-3 h-4 w-4" />
                  Warehouse Layout
                </Link>
                <Link href="/activity" onClick={() => onClose?.()} className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/70 hover:bg-muted hover:text-foreground transition-all duration-150">
                  <Clock className="mr-3 h-4 w-4" />
                  Activity Log
                </Link>
                <Link href="/documents" onClick={() => onClose?.()} className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/70 hover:bg-muted hover:text-foreground transition-all duration-150">
                  <FileText className="mr-3 h-4 w-4" />
                  Documents
                </Link>
              </div>

              <Separator className="my-4" />

              {/* Quick Stats Card */}
              <div className="mx-2 p-3 bg-muted/60 rounded-lg border">
                <div className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  Today's Overview
                </div>
                <div className="space-y-2">
                  {[
                    { label: "Pending Tasks", value: pendingCount, variant: "outline" as const },
                    { label: "Team Members",  value: teamCount,    variant: "outline" as const },
                    { label: "Low Stock",     value: lowStockCount, variant: lowStockCount > 0 ? "destructive" as const : "outline" as const },
                  ].map(({ label, value, variant }) => (
                    <div key={label} className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">{label}</span>
                      <Badge variant={variant} className="h-4 text-xs">{value}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Quick Actions — non-manager roles */}
          {user.role !== "WAREHOUSE_MANAGER" && (
            <div className="space-y-1">
              <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Quick Actions
              </div>

              <Link
                href="/profile"
                onClick={() => onClose?.()}
                className={cn(
                  "flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                  pathname === "/profile"
                    ? "bg-primary/10 text-primary border-l-2 border-primary"
                    : "text-foreground/70 hover:bg-muted hover:text-foreground",
                )}
              >
                <UserIcon className="mr-3 h-4 w-4" />
                My Profile
              </Link>

              {user.role === "INVENTORY_CLERK" && (
                <>
                  <Link href="/inventory/add" onClick={() => onClose?.()} className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/70 hover:bg-muted hover:text-foreground transition-all duration-150">
                    <Plus className="mr-3 h-4 w-4" />
                    Add Inventory
                  </Link>
                  <Link href="/inventory" onClick={() => onClose?.()} className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/70 hover:bg-muted hover:text-foreground transition-all duration-150">
                    <Package className="mr-3 h-4 w-4" />
                    Update Stock
                  </Link>
                </>
              )}

              {/* ADMIN: quick actions removed — all covered by main Navigation above */}

              {user.role === "TECHNICIAN" && (
                <>
                  <Link href="/maintenance" onClick={() => onClose?.()} className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/70 hover:bg-muted hover:text-foreground transition-all duration-150">
                    <Settings className="mr-3 h-4 w-4" />
                    Maintenance Tasks
                  </Link>
                  <Link href="/equipment" onClick={() => onClose?.()} className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/70 hover:bg-muted hover:text-foreground transition-all duration-150">
                    <Truck className="mr-3 h-4 w-4" />
                    Equipment Status
                  </Link>
                </>
              )}

              {user.role === "AUDITOR" && (
                <>
                  <Link href="/audit/schedule" onClick={() => onClose?.()} className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/70 hover:bg-muted hover:text-foreground transition-all duration-150">
                    <Calendar className="mr-3 h-4 w-4" />
                    Schedule Audit
                  </Link>
                  <Link href="/audit/reports" onClick={() => onClose?.()} className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/70 hover:bg-muted hover:text-foreground transition-all duration-150">
                    <Download className="mr-3 h-4 w-4" />
                    Audit Reports
                  </Link>
                </>
              )}
            </div>
          )}
        </div>

        {/* Fire Monitor */}
        <Separator className="my-3" />
        <div className="pb-4">
          <p className="px-5 mb-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="h-3 w-3" />
            Warehouse Status
          </p>
          <FireStatusPanel />
        </div>
      </div>
    </div>
  )
}
