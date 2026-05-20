"use client"

import type React from "react"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Search, ClipboardCheck, AlertTriangle, CheckCircle, FileText } from "lucide-react"

// Mock audit data
const auditsData = [
  {
    id: "AUD001",
    warehouse: "Addis Ababa Central",
    auditor: "Alemayehu Tadesse",
    type: "Full Audit",
    status: "Completed",
    startDate: "2024-01-10",
    endDate: "2024-01-12",
    itemsAudited: 1250,
    discrepancies: 5,
    notes: "Minor discrepancies found in cable inventory",
  },
  {
    id: "AUD002",
    warehouse: "Dire Dawa Regional",
    auditor: "Fatuma Ahmed",
    type: "Spot Check",
    status: "In Progress",
    startDate: "2024-01-16",
    endDate: null,
    itemsAudited: 45,
    discrepancies: 0,
    notes: "Routine spot check on high-value items",
  },
  {
    id: "AUD003",
    warehouse: "Bahir Dar Branch",
    auditor: "Getachew Alemu",
    type: "Cycle Count",
    status: "Scheduled",
    startDate: "2024-01-20",
    endDate: null,
    itemsAudited: 0,
    discrepancies: 0,
    notes: "Monthly cycle count for SIM cards",
  },
  {
    id: "AUD004",
    warehouse: "Mekelle Central",
    auditor: "Hailay Gebru",
    type: "Full Audit",
    status: "Completed",
    startDate: "2024-01-05",
    endDate: "2024-01-08",
    itemsAudited: 890,
    discrepancies: 12,
    notes: "Significant discrepancies require investigation",
  },
]

const warehouses = [
  "Addis Ababa Central",
  "Dire Dawa Regional",
  "Bahir Dar Branch",
  "Mekelle Central",
  "Hawassa Branch",
  "Jimma Regional",
]

const auditTypes = ["Full Audit", "Spot Check", "Cycle Count", "Emergency Audit"]

export default function AuditPage() {
  const [audits, setAudits] = useState(auditsData)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All Status")
  const [isNewAuditOpen, setIsNewAuditOpen] = useState(false)
  const [newAudit, setNewAudit] = useState({
    warehouse: "",
    type: "",
    startDate: "",
    notes: "",
  })

  const filteredAudits = audits.filter((audit) => {
    const matchesSearch =
      audit.warehouse.toLowerCase().includes(searchTerm.toLowerCase()) ||
      audit.auditor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      audit.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "All Status" || audit.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }
    > = {
      Completed: { variant: "default", icon: <CheckCircle className="w-3 h-3 mr-1" /> },
      "In Progress": { variant: "secondary", icon: <ClipboardCheck className="w-3 h-3 mr-1" /> },
      Scheduled: { variant: "outline", icon: <ClipboardCheck className="w-3 h-3 mr-1" /> },
      Cancelled: { variant: "destructive", icon: <AlertTriangle className="w-3 h-3 mr-1" /> },
    }

    const config = variants[status] || { variant: "outline", icon: null }

    return (
      <Badge variant={config.variant} className="flex items-center">
        {config.icon}
        {status}
      </Badge>
    )
  }

  const getDiscrepancyBadge = (discrepancies: number) => {
    if (discrepancies === 0) {
      return (
        <Badge variant="default" className="bg-green-600 dark:bg-green-700">
          No Issues
        </Badge>
      )
    } else if (discrepancies <= 5) {
      return (
        <Badge variant="secondary" className="bg-yellow-500 dark:bg-yellow-600 text-yellow-950">
          {discrepancies} Minor
        </Badge>
      )
    } else {
      return <Badge variant="destructive">{discrepancies} Major</Badge>
    }
  }

  const handleCreateAudit = () => {
    const audit = {
      id: `AUD${(audits.length + 1).toString().padStart(3, "0")}`,
      warehouse: newAudit.warehouse,
      auditor: "Current User",
      type: newAudit.type,
      status: "Scheduled",
      startDate: newAudit.startDate,
      endDate: null,
      itemsAudited: 0,
      discrepancies: 0,
      notes: newAudit.notes,
    }

    setAudits([audit, ...audits])
    setNewAudit({
      warehouse: "",
      type: "",
      startDate: "",
      notes: "",
    })
    setIsNewAuditOpen(false)
  }

  const getStatusCounts = () => {
    return {
      total: audits.length,
      scheduled: audits.filter((a) => a.status === "Scheduled").length,
      inProgress: audits.filter((a) => a.status === "In Progress").length,
      completed: audits.filter((a) => a.status === "Completed").length,
    }
  }

  const statusCounts = getStatusCounts()

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Stock Audit</h1>
            <p className="text-muted-foreground">Perform and track inventory audits across warehouses</p>
          </div>
          <Dialog open={isNewAuditOpen} onOpenChange={setIsNewAuditOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Schedule Audit
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Schedule New Audit</DialogTitle>
                <DialogDescription>Create a new inventory audit for a warehouse.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="warehouse">Warehouse</Label>
                  <Select
                    value={newAudit.warehouse}
                    onValueChange={(value) => setNewAudit({ ...newAudit, warehouse: value })}
                  >
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
                  <Label htmlFor="type">Audit Type</Label>
                  <Select value={newAudit.type} onValueChange={(value) => setNewAudit({ ...newAudit, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select audit type" />
                    </SelectTrigger>
                    <SelectContent>
                      {auditTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newAudit.startDate}
                    onChange={(e) => setNewAudit({ ...newAudit, startDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={newAudit.notes}
                    onChange={(e) => setNewAudit({ ...newAudit, notes: e.target.value })}
                    placeholder="Audit purpose or special instructions"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewAuditOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateAudit}>Schedule Audit</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Audits</CardTitle>
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statusCounts.total}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{statusCounts.scheduled}</div>
              <p className="text-xs text-muted-foreground">Upcoming audits</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{statusCounts.inProgress}</div>
              <p className="text-xs text-muted-foreground">Currently auditing</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{statusCounts.completed}</div>
              <p className="text-xs text-muted-foreground">Finished audits</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search audits..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Status">All Status</SelectItem>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Audits Table */}
        <Card>
          <CardHeader>
            <CardTitle>Audit History</CardTitle>
            <CardDescription>
              Showing {filteredAudits.length} of {audits.length} audits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Audit ID</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Auditor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Items Audited</TableHead>
                  <TableHead>Discrepancies</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAudits.map((audit) => (
                  <TableRow key={audit.id}>
                    <TableCell className="font-mono text-sm">{audit.id}</TableCell>
                    <TableCell>{audit.warehouse}</TableCell>
                    <TableCell>{audit.type}</TableCell>
                    <TableCell>{audit.auditor}</TableCell>
                    <TableCell>{getStatusBadge(audit.status)}</TableCell>
                    <TableCell>{audit.itemsAudited}</TableCell>
                    <TableCell>{getDiscrepancyBadge(audit.discrepancies)}</TableCell>
                    <TableCell>{audit.startDate}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <FileText className="h-4 w-4" />
                      </Button>
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
