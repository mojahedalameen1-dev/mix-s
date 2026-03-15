"use client"

import { createClient } from "@/lib/supabase/client"
import { Shield, RotateCw, LogOut } from "lucide-react"

export default function ProfileError({ userId }: { userId: string }) {
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50/50 p-4 relative overflow-hidden" dir="rtl">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[100px] -z-10" />

      <div className="max-w-xl w-full text-center space-y-8 glass-card bg-white p-12 rounded-[48px] border-slate-100 shadow-2xl relative animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-red-50 rounded-[32px] flex items-center justify-center mx-auto border border-red-100 mb-6 group transition-all hover:scale-110">
          <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-500 shadow-inner">
             <Shield className="w-8 h-8" />
          </div>
        </div>
        
        <div className="space-y-3">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">خطأ في مزامنة الحساب</h1>
          <p className="text-slate-500 text-lg font-bold leading-relaxed">
            الحساب مرتبط بنظام الدخول، ولكن لم يتم العثور على ملف تعريف مطابق في قاعدة البيانات.
          </p>
        </div>

        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-4">
          <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <span>معرف الجلسة التقني</span>
            <span className="text-red-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              تنشيط يدوي مطلوب
            </span>
          </div>
          <div className="relative group">
            <code className="block text-sm font-mono text-slate-600 bg-white p-4 rounded-xl border border-slate-100 break-all select-all font-bold group-hover:border-primary/20 transition-all cursor-copy">
              {userId}
            </code>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          <button 
            onClick={handleSignOut}
            className="px-8 py-5 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-3 active:scale-95"
          >
            <LogOut className="w-5 h-5" />
            تسجيل الخروج
          </button>
          <button 
            onClick={handleRefresh}
            className="px-8 py-5 bg-white border-2 border-slate-100 text-slate-900 rounded-2xl font-black text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-3 active:scale-95"
          >
            <RotateCw className="w-5 h-5" />
            تحديث الصفحة
          </button>
        </div>
        
        <p className="text-xs text-slate-400 font-medium">يرجى مشاركة المعرف التقني أعلاه مع الإدارة لحل المشكلة يدوياً.</p>
      </div>
    </div>
  )
}
