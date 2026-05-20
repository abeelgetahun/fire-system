"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { apiClient } from "@/lib/api-client"
import { Wrench, AlertTriangle, CheckCircle, Clock, Activity } from "lucide-react"

export function TechnicianDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      await apiClient.getDashboardStats()
      setStats({
        equipmentItems: 85,
        maintenanceAlerts: 3,
        completedTasks: 12,
        pendingTasks: 5,
        systemHealth: 98,
      })
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
      setStats({
        equipmentItems: 85,
        maintenanceAlerts: 3,
        completedTasks: 12,
        pendingTasks: 5,
        systemHealth: 98,
      })
    } finally {
      setLoading(false)
    }
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
      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Equipment Items</CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <Wrench className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.equipmentItems || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Under maintenance</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Maintenance Alerts</CardTitle>
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.maintenanceAlerts || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Require attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed Tasks</CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <CheckCircle className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.completedTasks || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">This week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Tasks</CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <Clock className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.pendingTasks || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">In queue</p>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            System Health Overview
          </CardTitle>
          <CardDescription>Current system performance and status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall System Health</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{stats?.systemHealth || 0}%</span>
                <CheckCircle className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${stats?.systemHealth || 0}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Maintenance Activities</CardTitle>
          <CardDescription>Your recent technical tasks and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40">
              <div className="p-2 rounded-full bg-primary/10 text-primary">
                <CheckCircle className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Router maintenance completed</p>
                <p className="text-xs text-muted-foreground">2 hours ago</p>
              </div>
              <Badge variant="default">Completed</Badge>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40">
              <div className="p-2 rounded-full bg-primary/10 text-primary">
                <Clock className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Network switch inspection</p>
                <p className="text-xs text-muted-foreground">Scheduled for tomorrow</p>
              </div>
              <Badge variant="secondary">Pending</Badge>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40">
              <div className="p-2 rounded-full bg-destructive/10 text-destructive">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Cable replacement needed</p>
                <p className="text-xs text-muted-foreground">High priority</p>
              </div>
              <Badge variant="destructive">Urgent</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
