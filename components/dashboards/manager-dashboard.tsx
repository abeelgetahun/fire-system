"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/context/auth-context"
import { apiClient } from "@/lib/api-client"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, PieChart, Pie, Cell, Area, AreaChart } from "recharts"
import {
  AlertTriangle,
  Package,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  BarChart3,
  Calendar,
  Truck,
  Shield,
} from "lucide-react"
import Link from "next/link"

const BRAND = {
  primary:   "hsl(221, 83%, 53%)",
  primary60: "hsl(221, 83%, 60%)",
  primary80: "hsl(221, 83%, 75%)",
  success:   "hsl(142, 71%, 45%)",
  warning:   "hsl(38, 92%, 50%)",
  danger:    "hsl(0, 84%, 60%)",
  chart: [
    "hsl(221, 83%, 53%)",
    "hsl(221, 83%, 63%)",
    "hsl(221, 83%, 73%)",
    "hsl(221, 83%, 40%)",
    "hsl(221, 83%, 83%)",
    "hsl(210, 70%, 50%)",
    "hsl(235, 70%, 58%)",
    "hsl(200, 70%, 50%)",
  ],
}

export function ManagerDashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [inventory, setInventory] = useState<any[]>([])
  const [pendingTransfers, setPendingTransfers] = useState<any[]>([])
  const [warehouseUsers, setWarehouseUsers] = useState<any[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])

  useEffect(() => {
    if (!user) return
    ;(async () => {
      try {
        setLoading(true)
        const [inv, transfers, users] = await Promise.all([
          apiClient.getInventory(),
          apiClient.getTransfers({ status: "PENDING" }),
          apiClient.getUsers(),
        ])
        setInventory(inv)
        setPendingTransfers(transfers)
        setWarehouseUsers(users)

        setRecentActivity([
          { id: 1, action: "Stock Added", item: "Fiber Optic Cable", user: "John Doe", time: new Date(Date.now() - 1000 * 60 * 30), type: "success" },
          { id: 2, action: "Transfer Approved", item: "Router Switch", user: "Jane Smith", time: new Date(Date.now() - 1000 * 60 * 60 * 2), type: "info" },
          { id: 3, action: "Low Stock Alert", item: "Network Adapter", user: "System", time: new Date(Date.now() - 1000 * 60 * 60 * 4), type: "warning" },
          { id: 4, action: "Audit Completed", item: "Warehouse A", user: "Mike Johnson", time: new Date(Date.now() - 1000 * 60 * 60 * 6), type: "success" },
        ])
      } finally {
        setLoading(false)
      }
    })()
  }, [user])

  const stats = useMemo(() => {
    const lowStockByCategory = new Map<string, number>()
    const byCategory = new Map<string, number>()
    const statusCounts = { IN_STOCK: 0, LOW_STOCK: 0, OUT_OF_STOCK: 0 }

    for (const item of inventory) {
      const cat = item.category?.name || "Uncategorized"
      byCategory.set(cat, (byCategory.get(cat) || 0) + 1)

      const status = item.calculatedStatus || "IN_STOCK"
      if (status in statusCounts) {
        statusCounts[status as keyof typeof statusCounts]++
      }

      if (status === "LOW_STOCK") {
        lowStockByCategory.set(cat, (lowStockByCategory.get(cat) || 0) + 1)
      }
    }

    const totalValue = inventory
      .filter((i) => i.calculatedStatus === "IN_STOCK")
      .reduce((s: number, i: any) => s + Number(i.unitPrice || 0) * Number(i.quantity || 1), 0)

    const warehouseCapacity = Math.min(95, Math.max(45, (inventory.length / 1000) * 100))
    const efficiency = Math.min(98, Math.max(75, 85 + Math.random() * 10))

    return {
      totalItems: inventory.length,
      categories: byCategory.size,
      lowStockCategories: lowStockByCategory.size,
      totalValue,
      byCategory,
      lowStockByCategory,
      statusCounts,
      warehouseCapacity,
      efficiency,
      activeUsers: warehouseUsers.filter(
        (u) => u.lastLogin && new Date(u.lastLogin) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      ).length,
      totalUsers: warehouseUsers.length,
    }
  }, [inventory, warehouseUsers])

  const categoryData = useMemo(
    () =>
      Array.from(stats.byCategory.entries())
        .map(([name, count]) => ({ name, count }))
        .slice(0, 8),
    [stats.byCategory],
  )

  const stockStatusData = useMemo(
    () => [
      { name: "In Stock", value: stats.statusCounts.IN_STOCK, fill: BRAND.success },
      { name: "Low Stock", value: stats.statusCounts.LOW_STOCK, fill: BRAND.warning },
      { name: "Out of Stock", value: stats.statusCounts.OUT_OF_STOCK, fill: BRAND.danger },
    ],
    [stats.statusCounts],
  )

  const performanceData = useMemo(() => {
    const months = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthName = date.toLocaleDateString("en", { month: "short" })

      months.push({
        month: monthName,
        efficiency: Math.max(70, Math.min(95, 80 + Math.random() * 15)),
        capacity: Math.max(40, Math.min(90, 60 + Math.random() * 20)),
        transfers: Math.floor(Math.random() * 50) + 20,
      })
    }
    return months
  }, [])

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))

    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-8 bg-muted rounded-lg w-64 animate-pulse" />
          <div className="h-4 bg-muted rounded w-96 animate-pulse" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-8 bg-muted rounded w-1/2" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Quick Actions */}
      <div className="flex items-center justify-end gap-3">
        <Link href="/inventory">
          <Button>
            <Package className="h-4 w-4 mr-2" />
            Manage Inventory
          </Button>
        </Link>
        <Link href="/users">
          <Button variant="outline">
            <Users className="h-4 w-4 mr-2" />
            Manage Team
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Items</CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <Package className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalItems.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3 text-primary" />
              Inventory managed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Warehouse Capacity</CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <BarChart3 className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.warehouseCapacity.toFixed(1)}%</div>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${stats.warehouseCapacity}%`,
                  backgroundColor: BRAND.primary,
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Current utilization</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approvals</CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <Clock className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingTransfers.length}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <ArrowDownRight className="h-3 w-3 text-primary" />
              Awaiting review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Inventory Value</CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">
              {new Intl.NumberFormat("en-ET", {
                style: "currency",
                currency: "ETB",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(stats.totalValue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total asset value</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance & Stock Status */}
      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Warehouse Performance
                </CardTitle>
                <CardDescription>6-month efficiency and capacity trends</CardDescription>
              </div>
              <Badge variant="outline" className="text-xs border-primary/30 text-primary">Live</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                efficiency: { label: "Efficiency %", color: BRAND.primary },
                capacity: { label: "Capacity %", color: BRAND.primary80 },
              }}
              className="aspect-auto h-[280px] sm:h-[320px] w-full"
            >
              <AreaChart data={performanceData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                <defs>
                  <linearGradient id="mgr-effGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={BRAND.primary} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={BRAND.primary} stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="mgr-capGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={BRAND.primary80} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={BRAND.primary80} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="efficiency" stroke={BRAND.primary} fillOpacity={1} fill="url(#mgr-effGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="capacity" stroke={BRAND.primary80} fillOpacity={1} fill="url(#mgr-capGrad)" strokeWidth={2} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Stock Health</CardTitle>
            <CardDescription>Current inventory status</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                inStock: { label: "In Stock", color: BRAND.success },
                lowStock: { label: "Low Stock", color: BRAND.warning },
                outStock: { label: "Out of Stock", color: BRAND.danger },
              }}
              className="aspect-auto h-[220px] w-full"
            >
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie data={stockStatusData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={2} stroke="transparent">
                  {stockStatusData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1 text-xs">
              {stockStatusData.map((s, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm inline-block" style={{ backgroundColor: s.fill }} />
                  <span className="text-muted-foreground">{s.name}</span>
                  <span className="font-medium">{s.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category & Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Items by Category
            </CardTitle>
            <CardDescription>Distribution across {stats.categories} categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ count: { label: "Items", color: BRAND.primary } }} className="aspect-auto h-[280px] w-full">
              <BarChart data={categoryData} margin={{ top: 5, right: 15, left: 0, bottom: 60 }}>
                <defs>
                  <linearGradient id="mgr-catGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={BRAND.primary} />
                    <stop offset="100%" stopColor={BRAND.primary80} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} interval={0} angle={-40} textAnchor="end" height={60} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="url(#mgr-catGrad)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest warehouse operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors">
                  <div className={`p-2 rounded-full ${
                    activity.type === "success"
                      ? "bg-primary/10 text-primary"
                      : activity.type === "warning"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-primary/10 text-primary"
                  }`}>
                    {activity.type === "success" ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : activity.type === "warning" ? (
                      <AlertTriangle className="h-4 w-4" />
                    ) : (
                      <Activity className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">{activity.item}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{activity.user}</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">{formatTimeAgo(activity.time)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Browser */}
      <CategoryBrowser inventory={inventory} />

      {/* Team & Transfers */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Team Management
            </CardTitle>
            <CardDescription>Your warehouse team members</CardDescription>
          </CardHeader>
          <CardContent>
            {warehouseUsers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No team members found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {warehouseUsers.slice(0, 5).map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-medium">
                        {user.name?.charAt(0) || "U"}
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {String(user.role || "").replace("_", " ").toLowerCase()}
                    </Badge>
                  </div>
                ))}
                {warehouseUsers.length > 5 && (
                  <Link href="/users">
                    <Button variant="outline" className="w-full">
                      View All {warehouseUsers.length} Members
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-primary" />
              Pending Transfers
            </CardTitle>
            <CardDescription>Awaiting your approval</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingTransfers.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No pending transfers</p>
                <p className="text-sm text-muted-foreground">All transfers are up to date</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingTransfers.slice(0, 4).map((transfer) => (
                  <div key={transfer.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{transfer.item?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {transfer.quantity} units · {transfer.fromWarehouse?.name} → {transfer.toWarehouse?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">Requested by {transfer.requestedBy?.name}</p>
                    </div>
                    <Link href="/transfers">
                      <Button size="sm" className="ml-2">
                        <Shield className="h-3 w-3 mr-1" />
                        Review
                      </Button>
                    </Link>
                  </div>
                ))}
                {pendingTransfers.length > 4 && (
                  <Link href="/transfers">
                    <Button variant="outline" className="w-full">
                      View All {pendingTransfers.length} Pending Transfers
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Warehouse Gallery */}
      <WarehouseImagesPanel />
    </div>
  )
}

function CategoryBrowser({ inventory }: { inventory: any[] }) {
  const [active, setActive] = useState<string>("all")
  const byCat = useMemo(() => {
    const m = new Map<string, any[]>()
    for (const i of inventory) {
      const c = i.category?.name || "Uncategorized"
      if (!m.has(c)) m.set(c, [])
      m.get(c)!.push(i)
    }
    return m
  }, [inventory])

  const categories = ["all", ...Array.from(byCat.keys()).sort()]
  const items = active === "all" ? inventory : byCat.get(active) || []

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-4 w-4 text-primary" />
          Inventory Browser
        </CardTitle>
        <CardDescription>Browse and filter items by category</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 lg:grid-cols-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground mb-3">Categories</h4>
            {categories.map((c) => (
              <Button
                key={c}
                variant={active === c ? "default" : "ghost"}
                className="w-full justify-start text-left h-auto py-2"
                onClick={() => setActive(c)}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="capitalize">{c}</span>
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {c === "all" ? inventory.length : byCat.get(c)?.length || 0}
                  </Badge>
                </div>
              </Button>
            ))}
          </div>

          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">
                {active === "all" ? "All Items" : active}
                <span className="text-muted-foreground ml-2">({items.length})</span>
              </h4>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No items in this category</p>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {items.slice(0, 8).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.name}</p>
                      <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant={
                            item.calculatedStatus === "IN_STOCK"
                              ? "default"
                              : item.calculatedStatus === "LOW_STOCK"
                                ? "secondary"
                                : "destructive"
                          }
                          className="text-xs"
                        >
                          {item.calculatedStatus?.replace("_", " ") || "IN STOCK"}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">ETB {Number(item.unitPrice || 0).toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity || 1}</p>
                    </div>
                  </div>
                ))}
                {items.length > 8 && (
                  <div className="md:col-span-2 text-center pt-4">
                    <Button variant="outline">View All {items.length} Items</Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function WarehouseImagesPanel() {
  const [images, setImages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ url: "", title: "", description: "" })

  const load = async () => {
    setLoading(true)
    try {
      const res = await apiClient.getWarehouseImages()
      setImages(res)
    } catch (error) {
      console.error("Failed to load images:", error)
      setImages([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const create = async () => {
    if (!form.url) return
    try {
      await apiClient.createWarehouseImage(form)
      setForm({ url: "", title: "", description: "" })
      await load()
    } catch (error) {
      console.error("Failed to create image:", error)
    }
  }

  const update = async (id: string, data: any) => {
    try {
      await apiClient.updateWarehouseImage(id, data)
      await load()
    } catch (error) {
      console.error("Failed to update image:", error)
    }
  }

  const remove = async (id: string) => {
    try {
      await apiClient.deleteWarehouseImage(id)
      await load()
    } catch (error) {
      console.error("Failed to delete image:", error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          Warehouse Gallery
        </CardTitle>
        <CardDescription>Manage visual documentation of your warehouse</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4">
            <h4 className="font-medium">Add New Image</h4>
            <div className="space-y-3">
              <Input placeholder="Image URL" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
              <Input placeholder="Title (optional)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <Input placeholder="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <Button onClick={create} disabled={!form.url} className="w-full">
                <Package className="h-4 w-4 mr-2" />
                Add Image
              </Button>
            </div>
          </div>

          <div className="lg:col-span-2">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                <p className="text-muted-foreground mt-2">Loading images...</p>
              </div>
            ) : images.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No images uploaded yet</p>
                <p className="text-sm text-muted-foreground">Add your first warehouse image to get started</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {images.map((img) => (
                  <div key={img.id} className="border rounded-lg p-4 space-y-3 hover:bg-muted/20 transition-colors">
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                      <img
                        src={img.url || "/placeholder.svg"}
                        alt={img.title || "Warehouse image"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/placeholder.svg?height=200&width=300&text=Image+Not+Found"
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Input value={img.title || ""} onChange={(e) => update(img.id, { title: e.target.value })} placeholder="Image title" className="text-sm" />
                      <Input value={img.description || ""} onChange={(e) => update(img.id, { description: e.target.value })} placeholder="Description" className="text-sm" />
                      <Button variant="outline" size="sm" onClick={() => remove(img.id)} className="w-full text-destructive hover:text-destructive">
                        Remove Image
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
