"use client"

import type React from "react"

import { useAuth } from "@/context/auth-context"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { redirect } from "next/navigation"
import { useEffect, useState } from "react"
import { FireAlertProvider } from "@/context/fire-alert-context"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const { user, loading } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      redirect("/login")
    }
  }, [user, loading])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <FireAlertProvider>
      <div className="flex h-screen bg-background">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <div className={`
          fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>
        
        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-auto p-3 sm:p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </FireAlertProvider>
  )
}
