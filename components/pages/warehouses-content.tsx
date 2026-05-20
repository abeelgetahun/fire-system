"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { useAuth } from "@/context/auth-context"
import { hasPermission } from "@/lib/permissions"
import { apiClient } from "@/lib/api-client"
import { Plus, Search, Edit, Trash2, Building2, Package } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Warehouse {
  id: string
  name: string
  location: string
  address: string
  phone?: string
  capacity: number
  currentStock: number
  status: string
  manager?: {
    id: string
    name: string
    email: string
  }
  _count?: {
    inventoryItems: number
    users: number
  }
  createdAt: string
}

export function WarehousesContent() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isNewWarehouseOpen, setIsNewWarehouseOpen] = useState(false)
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null)
  const [newWarehouse, setNewWarehouse] = useState({
    name: "",
    location: "",
    address: "",
    phone: "",
    capacity: 1000,
    status: "ACTIVE",
  })

  useEffect(() => {
    fetchWarehouses()
  }, [])

  const fetchWarehouses = async () => {
    try {
      setLoading(true)
      const data = await apiClient.getWarehouses()
      setWarehouses(data)
    } catch (error) {
      console.error("Failed to fetch warehouses:", error)
      toast({
        title: "Error",
        description: "Failed to fetch warehouses",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateWarehouse = async () => {
    try {
      await apiClient.createWarehouse(newWarehouse)
      toast({
        title: "Success",
        description: "Warehouse created successfully",
      })
      setNewWarehouse({
        name: "",
        location: "",
        address: "",
        phone: "",
        capacity: 1000,
        status: "ACTIVE",
      })
      setIsNewWarehouseOpen(false)
      fetchWarehouses()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create warehouse",
        variant: "destructive",
      })
    }
  }

  const handleUpdateWarehouse = async () => {
    if (!editingWarehouse) return

    try {
      await apiClient.updateWarehouse(editingWarehouse.id, {
        name: editingWarehouse.name,
        location: editingWarehouse.location,
        address: editingWarehouse.address,
        phone: editingWarehouse.phone,
        capacity: editingWarehouse.capacity,
        status: editingWarehouse.status,
      })
      toast({
        title: "Success",
        description: "Warehouse updated successfully",
      })
      setEditingWarehouse(null)
      fetchWarehouses()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update warehouse",
        variant: "destructive",
      })
    }
  }

  const handleDeleteWarehouse = async (id: string) => {
    if (!confirm("Are you sure you want to delete this warehouse?")) return

    try {
      await apiClient.deleteWarehouse(id)
      toast({
        title: "Success",
        description: "Warehouse deleted successfully",
      })
      fetchWarehouses()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete warehouse",
        variant: "destructive",
      })
    }
  }

  const filteredWarehouses = warehouses.filter((warehouse) => {
    const matchesSearch =
      warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      warehouse.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || warehouse.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      ACTIVE: "default",
      MAINTENANCE: "secondary",
      INACTIVE: "destructive",
    }
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>
  }

  const getCapacityPercentage = (current: number, capacity: number) => {
    return Math.round((current / capacity) * 100)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Warehouses</h1>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Warehouses</h1>
          <p className="text-muted-foreground">Manage warehouse locations and capacity</p>
        </div>
  {user && hasPermission(user.role, "warehouses", "create") && (
          <Dialog open={isNewWarehouseOpen} onOpenChange={setIsNewWarehouseOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Warehouse
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Warehouse</DialogTitle>
                <DialogDescription>Create a new warehouse location.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Warehouse Name</Label>
                  <Input
                    id="name"
                    value={newWarehouse.name}
                    onChange={(e) => setNewWarehouse({ ...newWarehouse, name: e.target.value })}
                    placeholder="Enter warehouse name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={newWarehouse.location}
                    onChange={(e) => setNewWarehouse({ ...newWarehouse, location: e.target.value })}
                    placeholder="City, Region"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={newWarehouse.address}
                    onChange={(e) => setNewWarehouse({ ...newWarehouse, address: e.target.value })}
                    placeholder="Full address"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={newWarehouse.phone}
                      onChange={(e) => setNewWarehouse({ ...newWarehouse, phone: e.target.value })}
                      placeholder="+251-XX-XXX-XXXX"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={newWarehouse.capacity}
                      onChange={(e) => setNewWarehouse({ ...newWarehouse, capacity: Number.parseInt(e.target.value) })}
                      placeholder="1000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={newWarehouse.status}
                    onValueChange={(value) => setNewWarehouse({ ...newWarehouse, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewWarehouseOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateWarehouse}>Add Warehouse</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Warehouses</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{warehouses.length}</div>
            <p className="text-xs text-muted-foreground">
              {warehouses.filter((w) => w.status === "ACTIVE").length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {warehouses.reduce((sum, w) => sum + w.capacity, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Items capacity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {warehouses.reduce((sum, w) => sum + w.currentStock, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Items in stock</p>
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
                  placeholder="Search warehouses..."
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
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Warehouses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Warehouse Locations</CardTitle>
          <CardDescription>
            Showing {filteredWarehouses.length} of {warehouses.length} warehouses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Warehouse</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWarehouses.map((warehouse) => (
                <TableRow key={warehouse.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{warehouse.name}</div>
                      <div className="text-sm text-muted-foreground">{warehouse.location}</div>
                      <div className="text-xs text-muted-foreground">{warehouse.address}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {warehouse.manager ? (
                      <div>
                        <div className="font-medium">{warehouse.manager.name}</div>
                        <div className="text-sm text-muted-foreground">{warehouse.manager.email}</div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">No manager assigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {warehouse.currentStock.toLocaleString()} / {warehouse.capacity.toLocaleString()}
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 mt-1">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${getCapacityPercentage(warehouse.currentStock, warehouse.capacity)}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {getCapacityPercentage(warehouse.currentStock, warehouse.capacity)}% utilized
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-center">
                      <div className="font-medium">{warehouse._count?.inventoryItems || 0}</div>
                      <div className="text-xs text-muted-foreground">Items</div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(warehouse.status)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {user && hasPermission(user.role, "warehouses", "update") && (
                        <Button variant="ghost" size="sm" onClick={() => setEditingWarehouse(warehouse)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {user && hasPermission(user.role, "warehouses", "delete") && (
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteWarehouse(warehouse.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Warehouse Dialog */}
      <Dialog open={!!editingWarehouse} onOpenChange={() => setEditingWarehouse(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Warehouse</DialogTitle>
            <DialogDescription>Update warehouse information.</DialogDescription>
          </DialogHeader>
          {editingWarehouse && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Warehouse Name</Label>
                <Input
                  id="edit-name"
                  value={editingWarehouse.name}
                  onChange={(e) => setEditingWarehouse({ ...editingWarehouse, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
                  value={editingWarehouse.location}
                  onChange={(e) => setEditingWarehouse({ ...editingWarehouse, location: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-address">Address</Label>
                <Input
                  id="edit-address"
                  value={editingWarehouse.address}
                  onChange={(e) => setEditingWarehouse({ ...editingWarehouse, address: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input
                    id="edit-phone"
                    value={editingWarehouse.phone || ""}
                    onChange={(e) => setEditingWarehouse({ ...editingWarehouse, phone: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-capacity">Capacity</Label>
                  <Input
                    id="edit-capacity"
                    type="number"
                    value={editingWarehouse.capacity}
                    onChange={(e) =>
                      setEditingWarehouse({ ...editingWarehouse, capacity: Number.parseInt(e.target.value) })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={editingWarehouse.status}
                  onValueChange={(value) => setEditingWarehouse({ ...editingWarehouse, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingWarehouse(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateWarehouse}>Update Warehouse</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
