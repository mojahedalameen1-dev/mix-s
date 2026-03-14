"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { RefreshCw, Copy, Check } from "lucide-react"

export default function AdminInviteManager() {
  const [token, setToken] = useState("")
  const [copied, setCopied] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchToken()
  }, [supabase])

  const fetchToken = async () => {
    const { data } = await supabase
      .from('invite_links')
      .select('token')
      .eq('is_active', true)
      .single()
    
    if (data) setToken(data.token)
  }

  const generateNewToken = async () => {
    const newToken = Math.random().toString(36).substring(2, 15)
    // Deactivate old tokens and create new one
    await supabase.from('invite_links').update({ is_active: false }).eq('is_active', true)
    await supabase.from('invite_links').insert({ token: newToken, is_active: true })
    setToken(newToken)
  }

  const copyToClipboard = () => {
    const url = `${window.location.origin}/invite/${token}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-8 bg-card border rounded-3xl shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">إدارة رابط الدعوة</h2>
        <button 
          onClick={generateNewToken}
          className="flex items-center gap-2 text-sm text-primary font-bold hover:underline"
        >
          <RefreshCw className="w-4 h-4" />
          توليد رابط جديد
        </button>
      </div>

      <div className="flex items-center gap-4 bg-muted/50 p-4 rounded-2xl">
        <div className="flex-1 truncate font-mono text-sm">
          {window.location.origin}/invite/{token || "..."}
        </div>
        <button 
          onClick={copyToClipboard}
          className="p-3 bg-primary text-primary-foreground rounded-xl active:scale-95 transition-all"
        >
          {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
        </button>
      </div>

      <p className="text-sm text-muted-foreground">
        * ملاحظة: توليد رابط جديد سيقوم بإبطال الرابط الحالي فوراً. لا يمكن لأي شخص التسجيل بدون رابط فعال.
      </p>
    </div>
  )
}
