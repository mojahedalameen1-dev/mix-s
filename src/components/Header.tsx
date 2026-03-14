"use client"

import { useState, useEffect } from "react"
import { Bell, Search, Moon, Sun } from "lucide-react"
import { Profile } from "@/types/database"
import { createClient } from "@/lib/supabase/client"
import NotificationBell from "@/components/NotificationBell"

export default function Header({ profile }: { profile: Profile }) {
  const [theme, setTheme] = useState(profile.theme_preference)
  const supabase = createClient()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    await supabase
      .from('profiles')
      .update({ theme_preference: newTheme })
      .eq('id', profile.id)
  }

  return (
    <header className="flex items-center justify-between py-4 bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-md group">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="بحث عن صفقة أو عميل..." 
            className="w-full bg-muted/50 border-none rounded-xl py-3 pr-12 pl-4 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button 
          onClick={toggleTheme}
          className="p-3 bg-muted/50 rounded-xl hover:bg-muted transition-all active:scale-95"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <NotificationBell userId={profile.id} />

        <div className="flex items-center gap-3 pr-6 border-r">
          <div className="text-left hidden sm:block">
            <p className="text-sm font-bold leading-none">{profile.full_name}</p>
            <p className="text-xs text-muted-foreground mt-1">{profile.job_title || "عضو فريق"}</p>
          </div>
          <img 
            src={profile.avatar_url || "/default-avatar.png"} 
            alt={profile.full_name || ""} 
            className="w-10 h-10 rounded-xl object-cover ring-2 ring-primary/20"
          />
        </div>
      </div>
    </header>
  )
}
