"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import { AlertTriangle, RefreshCcw, Home } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-6 text-right" dir="rtl">
      <div className="max-w-md w-full bg-white border border-slate-200 p-12 rounded-[40px] shadow-2xl shadow-red-500/5 text-center space-y-8">
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-red-600/10 rounded-3xl flex items-center justify-center text-red-600">
            <AlertTriangle className="w-12 h-12" />
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-slate-800">عذراً، حدث خطأ غير متوقع</h2>
          <p className="text-slate-500 font-medium leading-relaxed">
            نعتذر منك، واجه النظام مشكلة تقنية أثناء معالجة طلبك. الفريق التقني يعمل على الإصلاح.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-2xl font-bold transition-all hover:bg-slate-800 active:scale-[0.98]"
          >
            <RefreshCcw className="w-5 h-5" />
            تحديث
          </button>
          <a 
            href="/" 
            className="flex items-center justify-center gap-2 py-4 bg-blue-600 text-white rounded-2xl font-bold transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98]"
          >
            <Home className="w-5 h-5" />
            الرئيسية
          </a>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                أوامر الشبكة • ميكس مبيعات
            </p>
            {error.digest && (
                <p className="text-[10px] text-slate-300 font-mono">ID: {error.digest}</p>
            )}
        </div>
      </div>
    </div>
  )
}
