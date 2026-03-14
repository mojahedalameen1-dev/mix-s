"use client"

export const dynamic = 'force-dynamic'

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { motion } from "framer-motion"
import { LogIn } from "lucide-react"

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      console.error(error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4" dir="rtl">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 space-y-8 bg-card rounded-2xl border shadow-xl"
      >
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-primary">MIX-AA</h1>
          <p className="text-muted-foreground">منصة إدارة المبيعات والأداء</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-primary text-primary-foreground rounded-xl font-bold transition-all hover:opacity-90 disabled:opacity-50 active:scale-[0.98]"
          >
            <LogIn className="w-5 h-5" />
            {loading ? "جاري الدخول..." : "سجّل دخولك بـ Google"}
          </button>
          
          <p className="text-center text-xs text-muted-foreground">
            لا يمكنك التسجيل إلا عبر رابط دعوة من الإدارة
          </p>
        </div>
      </motion.div>
    </div>
  )
}
