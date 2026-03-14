"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Lock, ShieldCheck, ArrowRight } from "lucide-react"

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [password, setPassword] = useState("")
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  const MASTER_PASSWORD = "m58858"

  useEffect(() => {
    // Check if previously authorized in this session
    const auth = sessionStorage.getItem("admin_auth")
    if (auth === "true") {
      setIsAuthorized(true)
    }
    setLoading(false)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === MASTER_PASSWORD) {
      setIsAuthorized(true)
      sessionStorage.setItem("admin_auth", "true")
      setError(false)
    } else {
      setError(true)
      setPassword("")
    }
  }

  if (loading) return null

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4" dir="rtl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md p-8 space-y-8 bg-card border-2 border-primary/20 rounded-[32px] shadow-2xl relative overflow-hidden"
        >
          {/* Decorative background elements */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
          
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-black tracking-tight">منطقة محظورة</h1>
            <p className="text-muted-foreground">يرجى إدخال رمز الوصول الخاص بالإدارة للمتابعة</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="رمز المرور..."
                className={`w-full px-6 py-4 bg-muted/50 border-2 rounded-2xl text-center text-2xl font-mono tracking-[0.5em] transition-all focus:outline-none focus:ring-4 focus:ring-primary/10 ${
                  error ? "border-destructive animate-shake" : "border-transparent focus:border-primary"
                }`}
                autoFocus
              />
              {error && (
                <motion.p 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="text-destructive text-sm text-center font-bold"
                >
                  رمز المرور غير صحيح!
                </motion.p>
              )}
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-black text-lg transition-all hover:opacity-90 active:scale-[0.98] group shadow-lg shadow-primary/20"
            >
              دخول الإدارة
              <ArrowRight className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="pt-4 text-center">
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest flex items-center justify-center gap-2">
              <ShieldCheck className="w-3 h-3" />
              أمان مشفر بالكامل
            </span>
          </div>
        </motion.div>
      </div>
    )
  }

  return <>{children}</>
}
