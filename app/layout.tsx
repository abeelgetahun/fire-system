import type React from "react"
import type { Metadata } from "next"
import { Inter, Carter_One } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/context/auth-context"
import { Toaster } from "@/components/ui/toaster"
import SplashScreen from "@/components/layout/splash-screen"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const carterOne = Carter_One({ weight: "400", subsets: ["latin"], variable: "--font-carter-one" })

export const metadata: Metadata = {
  title: "TeleStock",
  description: "TeleStock —  Telecom Warehouse Management System",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  icons: {
    icon: [
      { url: "/assets/app_logo.png", type: "image/png" },
    ],
    apple: [{ url: "/assets/app_logo.png" }],
    shortcut: [{ url: "/assets/app_logo.png" }],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${carterOne.variable}`} suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <AuthProvider>
            <SplashScreen />
            {children}
            <Toaster />
            <Analytics />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
