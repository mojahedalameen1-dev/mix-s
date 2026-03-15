"use client"

import { createClient } from "@/lib/supabase/client"
import { Chrome } from "lucide-react"

export function LoginButton({ token }: { token: string }) {
  const supabase = createClient()

  const handleLogin = async () => {
    // Store token in cookie for 10 minutes to survive OAuth redirect
    document.cookie = `invite_token=${token}; path=/; max-age=600; SameSite=Lax`

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <button 
      onClick={handleLogin}
      className="flex items-center justify-center gap-3 w-full py-5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl font-black transition-all hover:opacity-90 shadow-xl shadow-zinc-900/10"
    >
      <Chrome className="w-6 h-6" />
      التسجيل عبر Google
    </button>
  )
}
