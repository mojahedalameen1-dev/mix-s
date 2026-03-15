"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Lock, User, ArrowRight, Shield, Eye, EyeOff } from "lucide-react"

export default function AdminLoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/admin-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      if (res.ok) {
        router.push("/admin")
        router.refresh()
      } else {
        setError("اسم المستخدم أو كلمة المرور غير صحيحة")
        setPassword("")
      }
    } catch {
      setError("حدث خطأ في الاتصال. حاول مجدداً.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden" dir="rtl">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] -z-10" />
      
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-white rounded-[40px] p-10 shadow-2xl border border-slate-100 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-primary/10 rounded-[24px] flex items-center justify-center mx-auto border border-primary/20 shadow-inner">
              <Shield className="w-10 h-10 text-primary" />
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-black tracking-tighter text-slate-900">لوحة التحكم</h1>
              <p className="text-slate-500 font-medium">خاص بالمسؤول فقط</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">اسم المستخدم</label>
              <div className="relative">
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="أدخل اسم المستخدم"
                  className="w-full pr-12 pl-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-900 focus:outline-none focus:border-primary/40 focus:bg-white transition-all"
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">كلمة المرور</label>
              <div className="relative">
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور"
                  className="w-full pr-12 pl-12 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-900 focus:outline-none focus:border-primary/40 focus:bg-white transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-5 py-3 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold text-center"
              >
                {error}
              </motion.div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full flex items-center justify-center gap-3 py-5 bg-primary text-primary-foreground rounded-2xl font-black text-lg shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:pointer-events-none group"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>دخول الإدارة</span>
                  <ArrowRight className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-[10px] text-slate-300 font-medium uppercase tracking-widest">
            ADMIN ACCESS ONLY · MIX-AA
          </p>
        </div>
      </motion.div>
    </div>
  )
}
