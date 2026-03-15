"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { FileQuestion, ArrowRight } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-6 text-right" dir="rtl">
      <div className="max-w-md w-full bg-white border border-slate-200 p-12 rounded-[40px] shadow-2xl shadow-blue-500/5 text-center space-y-8">
        {/* Branding Logo Placeholder / Icon */}
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-blue-600/10 rounded-3xl flex items-center justify-center text-blue-600">
            <FileQuestion className="w-12 h-12" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">404</h1>
          <h2 className="text-2xl font-bold text-slate-800">الصفحة غير موجودة</h2>
          <p className="text-slate-500 font-medium leading-relaxed">
            عذراً، الرابط الذي تحاول الوصول إليه غير موجود أو تم نقله.
          </p>
        </div>

        <div className="pt-4">
          <Link 
            href="/" 
            className="flex items-center justify-center gap-3 w-full py-4 bg-blue-600 text-white rounded-2xl font-bold transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98]"
          >
            العودة للرئيسية
            <ArrowRight className="w-5 h-5 rotate-180" />
          </Link>
        </div>

        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
          أوامر الشبكة • ميكس مبيعات
        </p>
      </div>
    </div>
  )
}
