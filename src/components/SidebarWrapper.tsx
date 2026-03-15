"use client"

import { usePathname } from "next/navigation"
import Sidebar from "./Sidebar"

export default function SidebarWrapper({ role }: { role: string }) {
  const pathname = usePathname()
  
  // Hide sidebar on the login page for both root and admin
  const isLoginPage = pathname === "/login" || pathname === "/admin/login"
  
  if (isLoginPage) return null
  
  return <Sidebar role={role} />
}
