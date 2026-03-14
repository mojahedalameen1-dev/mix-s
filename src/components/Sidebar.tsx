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
    <aside className="hidden md:flex flex-col w-72 h-full bg-zinc-50 dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 relative z-[60]">
      <div className="p-10">
        <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter leading-none italic uppercase">
          Mix<span className="text-primary">-AA</span>
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => {
          if (item.adminOnly && role !== 'admin') return null
          
          const isActive = pathname === item.path || (item.path === '/dashboard' && pathname === '/')
          
          return (
            <Link 
              key={item.path} 
              href={item.path}
              prefetch={true}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all group ${
                isActive 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 font-bold" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "" : "group-hover:scale-110 transition-transform"}`} />
              <span className="text-lg">{item.label}</span>
              {isActive && (
                <motion.div 
                  layoutId="active-pill"
                  className="mr-auto w-1.5 h-6 bg-primary-foreground rounded-full"
                />
              )}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 mt-auto">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-all group"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-lg font-medium">تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  )
}
