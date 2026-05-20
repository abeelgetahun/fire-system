"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api-client"
import { AlertTriangle, CheckCircle, Calendar, TrendingUp, ArrowUpRight } from "lucide-react"

export function AuditorDashboard() {
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
        scheduledAudits: 3,
        completedAudits: 8,
        discrepanciesFound: 12,
        complianceScore: 94,
        pendingReports: 2,
      })
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
      setStats({
        scheduledAudits: 3,
        completedAudits: 8,
        discrepanciesFound: 12,
        complianceScore: 94,
        pendingReports: 2,
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
      {/* Quick Action */}
      <div className="flex items-center justify-end">
        <Button>
          <Calendar className="h-4 w-4 mr-2" />
          Schedule Audit
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Scheduled Audits</CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.scheduledAudits || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed Audits</CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <CheckCircle className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.completedAudits || 0}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3 text-primary" />
              This quarter
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Discrepancies</CardTitle>
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.discrepanciesFound || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Found this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Compliance Score</CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.complianceScore || 0}%</div>
            <p className="text-xs text-muted-foreground mt-1">Overall rating</p>
          </CardContent>
        </Card>
      </div>

      {/* Audit Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Audits</CardTitle>
          <CardDescription>Scheduled audit activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/40 transition-colors">
              <div className="space-y-1">
                <p className="font-medium">Addis Ababa Central - Full Audit</p>
                <p className="text-sm text-muted-foreground">Scheduled for January 20, 2024</p>
                <p className="text-xs text-muted-foreground">Expected duration: 2 days</p>
              </div>
              <Badge variant="secondary">Scheduled</Badge>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/40 transition-colors">
              <div className="space-y-1">
                <p className="font-medium">Dire Dawa Regional - Spot Check</p>
                <p className="text-sm text-muted-foreground">Scheduled for January 25, 2024</p>
                <p className="text-xs text-muted-foreground">Expected duration: 4 hours</p>
              </div>
              <Badge variant="secondary">Scheduled</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports & Compliance */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pending Reports</CardTitle>
            <CardDescription>Audit reports awaiting completion</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
                <div>
                  <p className="font-medium">Bahir Dar Branch Audit</p>
                  <p className="text-sm text-muted-foreground">Due: January 18, 2024</p>
                </div>
                <Badge variant="destructive">Overdue</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
                <div>
                  <p className="font-medium">Mekelle Central Review</p>
                  <p className="text-sm text-muted-foreground">Due: January 22, 2024</p>
                </div>
                <Badge variant="secondary">Pending</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Compliance Trends</CardTitle>
            <CardDescription>Monthly compliance performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { month: "December 2023", score: 96 },
                { month: "November 2023", score: 92 },
                { month: "October 2023", score: 89 },
              ].map(({ month, score }) => (
                <div key={month} className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
                  <span className="text-sm font-medium">{month}</span>
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-bold">{score}%</div>
                    <ArrowUpRight className="h-3 w-3 text-primary" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
