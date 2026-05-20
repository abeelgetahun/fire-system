"use client"

import { Search, User, Menu, X, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/context/auth-context"
import { FireAlertBell } from "@/components/layout/fire-alert-bell"
import { useState } from "react"
import { useTheme } from "next-themes"

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth()
  const [searchOpen, setSearchOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  const initials = ((user?.name || "")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("") || "U").toUpperCase()

  const getRoleDisplay = (role: string) => {
    const roleMap: Record<string, string> = {
      ADMIN: "Administrator",
      WAREHOUSE_MANAGER: "Warehouse Manager",
      INVENTORY_CLERK: "Inventory Clerk",
      TECHNICIAN: "Technician",
      AUDITOR: "Auditor",
    }
    return roleMap[role] || role
  }

  const getRoleBadgeVariant = (role: string) => {
    const variantMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      ADMIN: "destructive",
      WAREHOUSE_MANAGER: "default",
      INVENTORY_CLERK: "secondary",
      TECHNICIAN: "outline",
      AUDITOR: "secondary",
    }
    return variantMap[role] || "default"
  }

  return (
    <header className="flex items-center justify-between px-3 sm:px-4 lg:px-6 py-3 sm:py-4 bg-background border-b">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Search - Desktop */}
      <div className="hidden sm:flex items-center space-x-4 flex-1 lg:ml-0">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search inventory, warehouses..."
            className="pl-10 w-full sm:w-80"
          />
        </div>
      </div>

      {/* Mobile search toggle */}
      <div className="flex-1 flex justify-center sm:hidden">
        {searchOpen ? (
          <div className="flex items-center space-x-2 w-full max-w-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search..."
                className="pl-10 w-full"
                autoFocus
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="h-5 w-5" />
          </Button>
        )}
      </div>

      <div className="flex items-center space-x-1 sm:space-x-2">
        <FireAlertBell />

        {/* Dark mode toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2 px-1 sm:px-2">
              <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                <AvatarImage src={user?.avatar || "/placeholder.svg"} />
                <AvatarFallback className="text-xs sm:text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium truncate max-w-24 lg:max-w-none">{user?.name}</p>
                <Badge variant={getRoleBadgeVariant(user?.role || "")} className="text-xs">
                  {getRoleDisplay(user?.role || "")}
                </Badge>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div>
                <p className="font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{getRoleDisplay(user?.role || "")}</p>
                {user?.warehouse && (
                  <p className="text-xs text-muted-foreground">{user.warehouse.name}</p>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
