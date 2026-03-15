"use client"

import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"

export default function AdminLogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch("/api/admin-auth", { method: "DELETE" })
    router.push("/admin/login")
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
    >
      <LogOut className="w-4 h-4" />
      خروج
    </button>
  )
}
