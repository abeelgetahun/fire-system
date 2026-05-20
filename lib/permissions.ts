export type UserRole = "ADMIN" | "WAREHOUSE_MANAGER" | "INVENTORY_CLERK" | "TECHNICIAN" | "AUDITOR"

export interface Permission {
  resource: string
  actions: string[]
  scope?: "global" | "warehouse" | "own"
}

export interface RoleDefinition {
  name: string
  description: string
  permissions: Permission[]
  warehouseScoped: boolean
}

export const ROLE_DEFINITIONS: Record<UserRole, RoleDefinition> = {
  ADMIN: {
    name: "System Administrator",
    description: "Full system access with user and warehouse management capabilities",
    warehouseScoped: false,
    permissions: [
      { resource: "users", actions: ["create", "read", "update", "delete"], scope: "global" },
      { resource: "warehouses", actions: ["create", "read", "update", "delete"], scope: "global" },
      { resource: "inventory", actions: ["create", "read", "update", "delete"], scope: "global" },
  { resource: "warehouse-images", actions: ["create", "read", "update", "delete"], scope: "global" },
      { resource: "transfers", actions: ["create", "read", "update", "delete", "approve"], scope: "global" },
      { resource: "audits", actions: ["create", "read", "update", "delete"], scope: "global" },
      { resource: "reports", actions: ["create", "read", "update", "delete"], scope: "global" },
      { resource: "settings", actions: ["read", "update"], scope: "global" },
      { resource: "dashboard", actions: ["read"], scope: "global" },
      { resource: "categories", actions: ["create", "read", "update", "delete"], scope: "global" },
    ],
  },
  WAREHOUSE_MANAGER: {
    name: "Warehouse Manager",
    description: "Manages warehouse operations and staff",
    warehouseScoped: true,
    permissions: [
  { resource: "users", actions: ["read", "create", "update"], scope: "warehouse" }, // Manage users in their warehouse
  { resource: "user-warnings", actions: ["create", "read", "update"], scope: "warehouse" }, // Manage user warnings
  { resource: "warehouse-images", actions: ["create", "read", "update", "delete"], scope: "warehouse" },
      { resource: "warehouses", actions: ["read", "update"], scope: "warehouse" },
      { resource: "inventory", actions: ["create", "read", "update", "delete"], scope: "warehouse" },
      { resource: "transfers", actions: ["create", "read", "update", "approve"], scope: "warehouse" },
      { resource: "audits", actions: ["create", "read", "update"], scope: "warehouse" },
      { resource: "reports", actions: ["create", "read"], scope: "warehouse" },
      { resource: "dashboard", actions: ["read"], scope: "warehouse" },
      { resource: "categories", actions: ["read"], scope: "global" },
    ],
  },
  INVENTORY_CLERK: {
    name: "Inventory Clerk",
    description: "Handles daily warehouse tasks and inventory management",
    warehouseScoped: true,
    permissions: [
      { resource: "inventory", actions: ["create", "read", "update"], scope: "warehouse" },
      { resource: "transfers", actions: ["read"], scope: "warehouse" }, // Can only read transfers, not create them
      { resource: "audits", actions: ["read"], scope: "warehouse" },
      { resource: "reports", actions: ["read"], scope: "warehouse" },
      { resource: "dashboard", actions: ["read"], scope: "warehouse" },
      { resource: "categories", actions: ["read"], scope: "global" },
      { resource: "warehouses", actions: ["read"], scope: "warehouse" }, // Can read their assigned warehouse
    ],
  },
  TECHNICIAN: {
    name: "System Technician",
    description: "Provides technical support and equipment maintenance",
    warehouseScoped: false,
    permissions: [
      { resource: "inventory", actions: ["read"], scope: "global" },
      { resource: "transfers", actions: ["read"], scope: "global" },
      { resource: "reports", actions: ["read"], scope: "global" },
      { resource: "dashboard", actions: ["read"], scope: "global" },
      { resource: "categories", actions: ["read"], scope: "global" },
    ],
  },
  AUDITOR: {
    name: "System Auditor",
    description: "Performs audits and generates compliance reports",
    warehouseScoped: false,
    permissions: [
      { resource: "audits", actions: ["create", "read", "update", "delete"], scope: "global" },
      { resource: "inventory", actions: ["read"], scope: "global" },
      { resource: "warehouses", actions: ["read"], scope: "global" },
      { resource: "reports", actions: ["create", "read"], scope: "global" },
      { resource: "dashboard", actions: ["read"], scope: "global" },
      { resource: "categories", actions: ["read"], scope: "global" },
    ],
  },
}

export function hasPermission(
  userRole: UserRole,
  resource: string,
  action: string,
  userWarehouseId?: string,
  targetWarehouseId?: string
): boolean {
  const roleDef = ROLE_DEFINITIONS[userRole]
  if (!roleDef) return false

  const permission = roleDef.permissions.find((p) => p.resource === resource)
  if (!permission || !permission.actions.includes(action)) return false

  // Check scope-based access
  switch (permission.scope) {
    case "global":
      return true
    case "warehouse":
      // For warehouse-scoped permissions, user must have a warehouse and target must match
      if (!userWarehouseId) return false
      return !targetWarehouseId || userWarehouseId === targetWarehouseId
    case "own":
      // For own-scoped permissions, user can only access their own resources
      return true // This would need additional logic for user-specific resources
    default:
      return true
  }
}

export function canAccessWarehouse(userRole: UserRole, userWarehouseId?: string, targetWarehouseId?: string): boolean {
  const roleDef = ROLE_DEFINITIONS[userRole]
  if (!roleDef) return false

  // Admin and Auditor can access all warehouses
  if (userRole === "ADMIN" || userRole === "AUDITOR") return true

  // Technician can access all warehouses for read operations
  if (userRole === "TECHNICIAN") return true

  // Warehouse-scoped roles need matching warehouse IDs
  if (roleDef.warehouseScoped) {
    return userWarehouseId === targetWarehouseId
  }

  return false
}

export function getAccessibleRoutes(userRole: UserRole) {
  const routes: Array<{ path: string; name: string; icon: string }> = []
  const roleDef = ROLE_DEFINITIONS[userRole]

  if (!roleDef) return routes

  // Dashboard is always accessible
  routes.push({ path: "/dashboard", name: "Dashboard", icon: "LayoutDashboard" })

  // Check each resource for route access
  if (hasPermission(userRole, "warehouses", "read")) {
    routes.push({ path: "/warehouses", name: "Warehouses", icon: "Building2" })
    routes.push({ path: "/warehouse-status", name: "Warehouse Status", icon: "Activity" })
  } else {
    routes.push({ path: "/warehouse-status", name: "Warehouse Status", icon: "Activity" })
  }

  if (hasPermission(userRole, "inventory", "read")) {
    routes.push({ path: "/inventory", name: "Inventory", icon: "Package" })
  }

  if (hasPermission(userRole, "transfers", "read")) {
    routes.push({ path: "/transfers", name: "Transfers", icon: "ArrowLeftRight" })
  }

  if (hasPermission(userRole, "audits", "read")) {
    routes.push({ path: "/audit", name: "Audits", icon: "ClipboardCheck" })
  }

  if (hasPermission(userRole, "users", "read")) {
    routes.push({ path: "/users", name: "Users", icon: "Users" })
  }

  if (hasPermission(userRole, "reports", "read")) {
    routes.push({ path: "/reports", name: "Reports", icon: "BarChart3" })
  }

  if (hasPermission(userRole, "settings", "read")) {
    routes.push({ path: "/settings", name: "Settings", icon: "Settings" })
  }

  return routes
}

export function getRoleDisplayName(role: UserRole): string {
  return ROLE_DEFINITIONS[role]?.name || role.replace("_", " ")
}

export function getRoleDescription(role: UserRole): string {
  return ROLE_DEFINITIONS[role]?.description || ""
}

export function isWarehouseScopedRole(role: UserRole): boolean {
  return ROLE_DEFINITIONS[role]?.warehouseScoped || false
}

// Helper function to check if user can create transfers (managers and admins only)
export function canCreateTransfers(userRole: UserRole): boolean {
  return hasPermission(userRole, "transfers", "create")
}

// Helper function to check if user can approve transfers (managers and admins only)
export function canApproveTransfers(userRole: UserRole): boolean {
  return hasPermission(userRole, "transfers", "approve")
}

// Helper function to check if user can manage users (admins and managers)
export function canManageUsers(userRole: UserRole): boolean {
  return hasPermission(userRole, "users", "create")
}
