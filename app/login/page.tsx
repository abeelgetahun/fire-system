"use client"

import type React from "react"

import Image from "next/image"
import appLogo from "@/assets/app_logo.png"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Building2, HelpCircle, Loader2 } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showDemoCredentials, setShowDemoCredentials] = useState(false)
  const [particles, setParticles] = useState<
    { left: string; top: string; width: string; height: string; background: string; animationDelay: string; animationDuration: string }[]
  >([])
  const { login } = useAuth()
  const router = useRouter()

  // Generate particles only on the client to avoid SSR hydration mismatch
  useEffect(() => {
    setParticles(
      Array.from({ length: 50 }, () => ({
        left:              `${Math.random() * 100}%`,
        top:               `${Math.random() * 100}%`,
        width:             `${2 + Math.random() * 4}px`,
        height:            `${2 + Math.random() * 4}px`,
        background:        `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 255, ${0.1 + Math.random() * 0.3})`,
        animationDelay:    `${Math.random() * 10}s`,
        animationDuration: `${5 + Math.random() * 10}s`,
      }))
    )
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const success = await login(email, password)
      if (success) {
        router.push("/dashboard")
      } else {
        setError("Email and password don't match")
      }
    } catch (err) {
      setError("Email and password don't match")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Ultra-Advanced Animated Background */}
      <div className="absolute inset-0">
        {/* Dynamic Multi-Layer Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900 via-purple-900 to-fuchsia-900"></div>
        <div className="absolute inset-0 bg-gradient-to-tl from-blue-900/80 via-indigo-900/60 to-cyan-900/40 animate-gradient-shift"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-pink-900/30 via-transparent to-emerald-900/30 animate-gradient-pulse"></div>

        {/* Animated Mesh Gradient Orbs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-radial from-blue-500/30 to-transparent rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute top-20 right-0 w-80 h-80 bg-gradient-radial from-purple-500/40 to-transparent rounded-full blur-3xl animate-float-reverse"></div>
        <div className="absolute bottom-0 left-20 w-72 h-72 bg-gradient-radial from-pink-500/35 to-transparent rounded-full blur-3xl animate-float-diagonal"></div>
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-gradient-radial from-cyan-500/30 to-transparent rounded-full blur-3xl animate-float-bounce"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-gradient-radial from-emerald-500/25 to-transparent rounded-full blur-3xl animate-float-spin"></div>

        {/* Advanced Geometric Shapes */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-3xl blur-xl animate-morph-1 rotate-45"></div>
        <div className="absolute top-32 right-20 w-24 h-24 bg-gradient-to-tl from-pink-400/25 to-violet-600/25 rounded-2xl blur-lg animate-morph-2"></div>
        <div className="absolute bottom-32 left-32 w-20 h-20 bg-gradient-to-r from-cyan-400/30 to-blue-600/30 rounded-full blur-xl animate-morph-3"></div>
        <div className="absolute bottom-10 right-10 w-28 h-28 bg-gradient-to-bl from-emerald-400/20 to-teal-600/20 rounded-3xl blur-lg animate-morph-4 rotate-12"></div>

        {/* Dynamic Particle System — client-only to avoid hydration mismatch */}
        <div className="absolute inset-0">
          {particles.map((p, i) => (
            <div
              key={i}
              className="absolute rounded-full animate-particle-float"
              style={p}
            />
          ))}
        </div>

        {/* Animated Neural Network Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(59, 130, 246, 0.5)" />
              <stop offset="50%" stopColor="rgba(147, 51, 234, 0.5)" />
              <stop offset="100%" stopColor="rgba(236, 72, 153, 0.5)" />
            </linearGradient>
          </defs>
          <g className="animate-network-pulse">
            <line x1="10%" y1="20%" x2="30%" y2="40%" stroke="url(#lineGradient)" strokeWidth="1" />
            <line x1="30%" y1="40%" x2="60%" y2="30%" stroke="url(#lineGradient)" strokeWidth="1" />
            <line x1="60%" y1="30%" x2="80%" y2="60%" stroke="url(#lineGradient)" strokeWidth="1" />
            <line x1="20%" y1="70%" x2="50%" y2="80%" stroke="url(#lineGradient)" strokeWidth="1" />
            <line x1="50%" y1="80%" x2="90%" y2="20%" stroke="url(#lineGradient)" strokeWidth="1" />
            <circle cx="10%" cy="20%" r="3" fill="rgba(59, 130, 246, 0.6)" className="animate-pulse" />
            <circle cx="30%" cy="40%" r="3" fill="rgba(147, 51, 234, 0.6)" className="animate-pulse" />
            <circle cx="60%" cy="30%" r="3" fill="rgba(236, 72, 153, 0.6)" className="animate-pulse" />
            <circle cx="80%" cy="60%" r="3" fill="rgba(16, 185, 129, 0.6)" className="animate-pulse" />
            <circle cx="20%" cy="70%" r="3" fill="rgba(245, 101, 101, 0.6)" className="animate-pulse" />
          </g>
        </svg>

        {/* Advanced Wave Animation */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          <svg className="relative block w-full h-32" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <defs>
              <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(59, 130, 246, 0.3)" />
                <stop offset="100%" stopColor="rgba(147, 51, 234, 0.1)" />
              </linearGradient>
            </defs>
            <path
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
              fill="url(#waveGradient)"
              className="animate-wave-1"
            />
            <path
              d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
              fill="rgba(147, 51, 234, 0.2)"
              className="animate-wave-2"
            />
            <path
              d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
              fill="rgba(236, 72, 153, 0.15)"
              className="animate-wave-3"
            />
          </svg>
        </div>

        {/* Hexagonal Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.4'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              animation: "hexagon-drift 25s linear infinite",
            }}
          ></div>
        </div>

        {/* Spotlight Effect */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/40"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-radial from-white/5 to-transparent rounded-full blur-3xl animate-spotlight"></div>
      </div>

      {/* Original Content with Enhanced Glass Effect */}
      <div className="relative z-10 min-h-screen flex items-center justify-center py-4 sm:py-6 md:py-12 px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-4 sm:space-y-6 md:space-y-8">
          <div className="text-center flex flex-col items-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full blur-2xl animate-pulse"></div>
              <div className="absolute inset-0 bg-white/10 rounded-full blur-xl animate-ping"></div>
              <Image
                src={appLogo || "/placeholder.svg"}
                alt="TeleStock Logo"
                className="relative h-16 sm:h-24 w-auto object-contain drop-shadow-2xl"
                priority
              />
            </div>
            <h2 className="font-brand mt-4 sm:mt-6 text-2xl sm:text-3xl md:text-4xl text-white leading-tight px-2 sm:px-0 drop-shadow-2xl animate-text-glow">
              TeleStock
            </h2>
            <div className="mt-3 flex flex-col items-center gap-3">
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <span className="text-sm text-white/90 text-center drop-shadow-lg">Sign in to your account</span>
                <button
                  type="button"
                  onClick={() => setShowDemoCredentials(!showDemoCredentials)}
                  aria-label="Toggle demo accounts"
                  className="inline-flex items-center justify-center rounded-full px-3 py-1.5 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 shadow-2xl text-xs font-medium border border-white/30 hover:border-white/50 hover:scale-105 transform"
                >
                  <HelpCircle className="mr-1.5 h-4 w-4" />
                  {showDemoCredentials ? "Hide demo accounts" : "View demo accounts"}
                </button>
              </div>

              {showDemoCredentials && (
                <div className="mt-2 w-full max-w-sm mx-auto animate-fade-in">
                  <div className="rounded-xl border border-white/30 bg-white/10 backdrop-blur-xl text-white shadow-2xl hover:shadow-3xl transition-all duration-300 hover:bg-white/15">
                    <div className="p-4">
                      <p className="font-medium text-sm mb-2 flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-blue-300" /> Demo accounts
                      </p>
                      <p className="text-xs text-white/80 mb-3">
                        Use corporate emails like <span className="font-medium text-white">name@telecom.et</span>
                      </p>
                      <div className="space-y-2 text-xs">
                        <div className="flex flex-col sm:flex-row sm:justify-between hover:bg-white/5 rounded p-1 transition-colors">
                          <span className="font-medium">Admin:</span>
                          <span className="break-all text-white/90">admin@telecom.et / admin123</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between hover:bg-white/5 rounded p-1 transition-colors">
                          <span className="font-medium">Manager:</span>
                          <span className="break-all text-white/90">manager@telecom.et / manager123</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between hover:bg-white/5 rounded p-1 transition-colors">
                          <span className="font-medium">Clerk:</span>
                          <span className="break-all text-white/90">clerk@telecom.et / clerk123</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Card className="shadow-2xl bg-white/95 dark:bg-card/95 backdrop-blur-xl border-white/30 dark:border-border/30 hover:shadow-3xl transition-all duration-300 hover:bg-white/98 dark:hover:bg-card/98">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl sm:text-2xl">Login</CardTitle>
              <CardDescription>Use your corporate email.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@telecom.et"
                    className="h-11 transition-all duration-200 focus:scale-[1.02] focus:shadow-lg"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="h-11 transition-all duration-200 focus:scale-[1.02] focus:shadow-lg"
                    required
                  />
                </div>

                {error && (
                  <Alert variant="destructive" role="alert" aria-live="polite" className="animate-shake">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full h-11 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient-shift {
          0%, 100% { transform: translateX(0%) translateY(0%) rotate(0deg); }
          25% { transform: translateX(5%) translateY(-5%) rotate(1deg); }
          50% { transform: translateX(-3%) translateY(3%) rotate(-1deg); }
          75% { transform: translateX(-5%) translateY(-3%) rotate(0.5deg); }
        }

        @keyframes gradient-pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }

        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) translateX(0px) scale(1); }
          33% { transform: translateY(-30px) translateX(20px) scale(1.1); }
          66% { transform: translateY(20px) translateX(-15px) scale(0.9); }
        }

        @keyframes float-reverse {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          50% { transform: translateY(40px) translateX(-30px) rotate(180deg); }
        }

        @keyframes float-diagonal {
          0%, 100% { transform: translateY(0px) translateX(0px) scale(1); }
          25% { transform: translateY(-20px) translateX(25px) scale(1.2); }
          50% { transform: translateY(30px) translateX(50px) scale(0.8); }
          75% { transform: translateY(-10px) translateX(25px) scale(1.1); }
        }

        @keyframes float-bounce {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-50px) scale(1.3); }
        }

        @keyframes float-spin {
          0% { transform: translateX(-50%) translateY(-50%) rotate(0deg) scale(1); }
          100% { transform: translateX(-50%) translateY(-50%) rotate(360deg) scale(1.2); }
        }

        @keyframes morph-1 {
          0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; transform: rotate(45deg) scale(1); }
          50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; transform: rotate(225deg) scale(1.2); }
        }

        @keyframes morph-2 {
          0%, 100% { border-radius: 40% 60% 60% 40% / 60% 30% 60% 40%; transform: scale(1); }
          50% { border-radius: 60% 40% 40% 60% / 40% 70% 40% 70%; transform: scale(1.3); }
        }

        @keyframes morph-3 {
          0%, 100% { border-radius: 50%; transform: scale(1) rotate(0deg); }
          33% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; transform: scale(1.2) rotate(120deg); }
          66% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; transform: scale(0.8) rotate(240deg); }
        }

        @keyframes morph-4 {
          0%, 100% { border-radius: 20% 80% 30% 70% / 50% 60% 40% 50%; transform: rotate(12deg) scale(1); }
          50% { border-radius: 80% 20% 70% 30% / 60% 40% 60% 40%; transform: rotate(192deg) scale(1.1); }
        }

        @keyframes particle-float {
          0%, 100% { transform: translateY(0px) translateX(0px) scale(1); opacity: 0.1; }
          25% { transform: translateY(-100px) translateX(50px) scale(1.2); opacity: 0.4; }
          50% { transform: translateY(-200px) translateX(-30px) scale(0.8); opacity: 0.6; }
          75% { transform: translateY(-150px) translateX(80px) scale(1.1); opacity: 0.3; }
        }

        @keyframes network-pulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.8; }
        }

        @keyframes wave-1 {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100px); }
        }

        @keyframes wave-2 {
          0% { transform: translateX(0); }
          100% { transform: translateX(100px); }
        }

        @keyframes wave-3 {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50px); }
        }

        @keyframes hexagon-drift {
          0% { transform: translateX(0) translateY(0); }
          100% { transform: translateX(-60px) translateY(-60px); }
        }

        @keyframes spotlight {
          0%, 100% { transform: translateX(0) translateY(0) scale(1); opacity: 0.1; }
          50% { transform: translateX(100px) translateY(-50px) scale(1.5); opacity: 0.3; }
        }

        @keyframes text-glow {
          0%, 100% { text-shadow: 0 0 20px rgba(255, 255, 255, 0.5); }
          50% { text-shadow: 0 0 30px rgba(255, 255, 255, 0.8), 0 0 40px rgba(59, 130, 246, 0.5); }
        }

        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .animate-gradient-shift { animation: gradient-shift 8s ease-in-out infinite; }
        .animate-gradient-pulse { animation: gradient-pulse 4s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 6s ease-in-out infinite; }
        .animate-float-reverse { animation: float-reverse 8s ease-in-out infinite; }
        .animate-float-diagonal { animation: float-diagonal 7s ease-in-out infinite; }
        .animate-float-bounce { animation: float-bounce 4s ease-in-out infinite; }
        .animate-float-spin { animation: float-spin 10s linear infinite; }
        .animate-morph-1 { animation: morph-1 8s ease-in-out infinite; }
        .animate-morph-2 { animation: morph-2 6s ease-in-out infinite; }
        .animate-morph-3 { animation: morph-3 9s ease-in-out infinite; }
        .animate-morph-4 { animation: morph-4 7s ease-in-out infinite; }
        .animate-particle-float { animation: particle-float 8s ease-in-out infinite; }
        .animate-network-pulse { animation: network-pulse 3s ease-in-out infinite; }
        .animate-wave-1 { animation: wave-1 10s ease-in-out infinite; }
        .animate-wave-2 { animation: wave-2 8s ease-in-out infinite reverse; }
        .animate-wave-3 { animation: wave-3 12s ease-in-out infinite; }
        .animate-spotlight { animation: spotlight 6s ease-in-out infinite; }
        .animate-text-glow { animation: text-glow 3s ease-in-out infinite; }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
        .animate-shake { animation: shake 0.5s ease-in-out; }
        
        .bg-gradient-radial {
          background: radial-gradient(circle at center, var(--tw-gradient-stops));
        }

        .shadow-3xl {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </div>
  )
}
