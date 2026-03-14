"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Trophy, 
  BarChart3, 
  Settings, 
  ShieldCheck,
  LogOut
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const menuItems = [
  { icon: LayoutDashboard, label: "الرئيسية", path: "/", adminOnly: false },
  { icon: Users, label: "العملاء", path: "/clients", adminOnly: false },
  { icon: Briefcase, label: "الصفقات", path: "/deals", adminOnly: false },
  { icon: Trophy, label: "التارقت العام", path: "/leaderboard", adminOnly: false },
  { icon: BarChart3, label: "الإحصائيات", path: "/analytics", adminOnly: false },
  { icon: Settings, label: "الإعدادات", path: "/profile", adminOnly: false },
  { icon: ShieldCheck, label: "لوحة الأدمن", path: "/admin", adminOnly: true },
]

export default function Sidebar({ role }: { role: string }) {
  const pathname = usePathname()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  return (
    <aside className="hidden md:flex flex-col w-72 h-full bg-zinc-950 border-l border-white/5 relative z-[60] overflow-hidden">
      {/* Dynamic background element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[100px] -z-10" />
      
      <div className="p-10 mb-8">
        <Link href="/" className="group">
          <h1 className="text-3xl font-black text-white tracking-tighter leading-none italic uppercase flex items-center gap-2">
            <span className="bg-primary px-2 py-1 rounded-lg text-white group-hover:rotate-12 transition-transform">Mix</span>
            <span className="text-primary-foreground/80 dark:text-zinc-500">Sales</span>
          </h1>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] px-4 mb-4">القائمة الرئيسية</p>
        {menuItems.map((item) => {
          if (item.adminOnly && role !== 'admin') return null
          
          const isActive = pathname === item.path || (item.path === '/dashboard' && pathname === '/')
          
          return (
            <Link 
              key={item.path} 
              href={item.path}
              prefetch={true}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 relative group ${
                isActive 
                  ? "text-primary shadow-none" 
                  : "text-zinc-500 hover:text-white"
              }`}
            >
              {isActive && (
                <motion.div 
                  layoutId="active-nav"
                  className="absolute inset-0 bg-white/[0.03] border border-white/[0.05] rounded-2xl -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              
              <div className={`p-2 rounded-xl transition-all duration-300 ${
                isActive ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110" : "bg-zinc-900 group-hover:bg-zinc-800"
              }`}>
                <item.icon className="w-4 h-4" />
              </div>
              
              <span className={`text-sm font-bold tracking-tight ${isActive ? "text-white" : ""}`}>{item.label}</span>
              
              {isActive && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="mr-auto w-1.5 h-1.5 bg-primary rounded-full shadow-lg shadow-primary/50"
                />
              )}
            </Link>
          )
        })}
      </nav>

      <div className="p-6 mt-auto border-t border-white/5 bg-zinc-950/50 backdrop-blur-md">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-zinc-500 hover:bg-red-500/10 hover:text-red-400 transition-all group font-bold"
        >
          <div className="p-2 bg-zinc-900 rounded-xl group-hover:bg-red-500/20 group-hover:text-red-400 transition-colors">
            <LogOut className="w-4 h-4" />
          </div>
          <span className="text-sm">تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  )
}
