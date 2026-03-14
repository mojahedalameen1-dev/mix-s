"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, Briefcase, Bell, User } from "lucide-react"

export default function BottomNav() {
  const pathname = usePathname()

  const tabs = [
    { icon: LayoutDashboard, label: "الرئيسية", path: "/" },
    { icon: Users, label: "العملاء", path: "/clients" },
    { icon: Briefcase, label: "الصفقات", path: "/deals" },
    { icon: Bell, label: "الإشعارات", path: "/notifications" },
    { icon: User, label: "البروفايل", path: "/profile" },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t z-50 px-4 py-2 flex items-center justify-between pb-safe">
      {tabs.map((tab) => {
        const isActive = pathname === tab.path
        return (
          <Link 
            key={tab.path} 
            href={tab.path}
            className={`flex flex-col items-center gap-1 p-2 transition-all ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <tab.icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
            <span className="text-[10px] font-bold">{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
