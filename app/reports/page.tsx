"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, FileText, BarChart3, TrendingUp, Package, AlertTriangle } from "lucide-react"

// Mock reports data
const reportsData = [
  {
    id: "RPT001",
    name: "Inventory Levels Report",
    type: "Inventory",
    warehouse: "All Warehouses",
    generatedBy: "System Admin",
    generatedAt: "2024-01-16 10:30",
    status: "Ready",
    format: "PDF",
  },
  {
    id: "RPT002",
    name: "Stock Movement Summary",
    type: "Movement",
    warehouse: "Addis Ababa Central",
    generatedBy: "Alemayehu Tadesse",
    generatedAt: "2024-01-15 14:20",
    status: "Ready",
    format: "Excel",
  },
  {
    id: "RPT003",
    name: "Low Stock Alert Report",
    type: "Alert",
    warehouse: "All Warehouses",
    generatedBy: "System",
    generatedAt: "2024-01-16 08:00",
    status: "Ready",
    format: "PDF",
  },
  {
    id: "RPT004",
    name: "Audit Discrepancies",
    type: "Audit",
    warehouse: "Mekelle Central",
    generatedBy: "Hailay Gebru",
    generatedAt: "2024-01-14 16:45",
    status: "Processing",
    format: "Excel",
  },
]

const reportTypes = [
  { value: "inventory", label: "Inventory Levels" },
  { value: "movement", label: "Stock Movement" },
  { value: "audit", label: "Audit Report" },
  { value: "alert", label: "Low Stock Alert" },
  { value: "transfer", label: "Transfer Summary" },
  { value: "user", label: "User Activity" },
]

const warehouses = [
  "All Warehouses",
  "Addis Ababa Central",
  "Dire Dawa Regional",
  "Bahir Dar Branch",
  "Mekelle Central",
  "Hawassa Branch",
  "Jimma Regional",
]

const quickReports = [
  {
    title: "Current Stock Levels",
    description: "Overview of all inventory items and their current quantities",
    icon: Package,
    type: "inventory",
  },
  {
    title: "Low Stock Items",
    description: "Items that are below minimum stock levels",
    icon: AlertTriangle,
    type: "alert",
  },
  {
    title: "Stock Movements",
    description: "Recent transfers and stock movements",
    icon: TrendingUp,
    type: "movement",
  },
  {
    title: "Audit Summary",
    description: "Latest audit results and discrepancies",
    icon: BarChart3,
    type: "audit",
  },
]

export default function ReportsPage() {
  const [reports, setReports] = useState(reportsData)
  const [selectedType, setSelectedType] = useState("")
  const [selectedWarehouse, setSelectedWarehouse] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      Ready: "default",
      Processing: "secondary",
      Failed: "destructive",
      Scheduled: "outline",
    }
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>
  }

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      Inventory: "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300",
      Movement: "bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-300",
      Alert: "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300",
      Audit: "bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300",
    }
    return <Badge className={colors[type] || "bg-muted text-muted-foreground"}>{type}</Badge>
  }

  const handleGenerateReport = () => {
    const newReport = {
      id: `RPT${(reports.length + 1).toString().padStart(3, "0")}`,
      name: reportTypes.find((t) => t.value === selectedType)?.label || "Custom Report",
      type: selectedType.charAt(0).toUpperCase() + selectedType.slice(1),
      warehouse: selectedWarehouse || "All Warehouses",
      generatedBy: "Current User",
      generatedAt: new Date().toLocaleString(),
      status: "Processing",
      format: "PDF",
    }

    setReports([newReport, ...reports])

    // Reset form
    setSelectedType("")
    setSelectedWarehouse("")
    setDateFrom("")
    setDateTo("")
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
            <p className="text-muted-foreground">Generate and download comprehensive warehouse reports</p>
          </div>
        </div>

        {/* Quick Reports */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickReports.map((report, index) => (
            <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{report.title}</CardTitle>
                <report.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-3">{report.description}</p>
                <Button size="sm" className="w-full">
                  <Download className="mr-2 h-3 w-3" />
                  Generate
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Custom Report Generator */}
        <Card>
          <CardHeader>
            <CardTitle>Generate Custom Report</CardTitle>
            <CardDescription>Create customized reports based on your specific requirements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="reportType">Report Type</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="warehouse">Warehouse</Label>
                <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((warehouse) => (
                      <SelectItem key={warehouse} value={warehouse}>
                        {warehouse}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateFrom">From Date</Label>
                <Input id="dateFrom" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateTo">To Date</Label>
                <Input id="dateTo" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleGenerateReport} disabled={!selectedType}>
                <FileText className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Generated Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Generated Reports</CardTitle>
            <CardDescription>View and download previously generated reports</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead>Generated By</TableHead>
                  <TableHead>Generated At</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-mono text-sm">{report.id}</TableCell>
                    <TableCell className="font-medium">{report.name}</TableCell>
                    <TableCell>{getTypeBadge(report.type)}</TableCell>
                    <TableCell>{report.warehouse}</TableCell>
                    <TableCell>{report.generatedBy}</TableCell>
                    <TableCell>{report.generatedAt}</TableCell>
                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" disabled={report.status !== "Ready"}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
