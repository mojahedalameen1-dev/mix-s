"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { RefreshCw, Copy, Check, Trash2, Clock, Plus, ExternalLink, Calendar } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface InviteLink {
  id: string
  token: string
  label: string
  expires_at: string | null
  is_active: boolean
  usage_count: number
}

export default function AdminInviteManager() {
  const [links, setLinks] = useState<InviteLink[]>([])
  const [newLinkLabel, setNewLinkLabel] = useState("")
  const [expiration, setExpiration] = useState("24h")
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchLinks()
  }, [supabase])

  const fetchLinks = async () => {
    const { data } = await supabase
      .from('invite_links')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) setLinks(data)
  }

  const createLink = async () => {
    if (!newLinkLabel) return
    setLoading(true)
    
    const token = Math.random().toString(36).substring(2, 11)
    let expiresAt: Date | null = new Date()
    
    if (expiration === "24h") expiresAt.setHours(expiresAt.getHours() + 24)
    else if (expiration === "7d") expiresAt.setDate(expiresAt.getDate() + 7)
    else if (expiration === "30d") expiresAt.setDate(expiresAt.getDate() + 30)
    else expiresAt = null

    await supabase.from('invite_links').insert({
      token,
      label: newLinkLabel,
      expires_at: expiresAt?.toISOString(),
      is_active: true
    })

    setNewLinkLabel("")
    fetchLinks()
    setLoading(false)
  }

  const deleteLink = async (id: string) => {
    await supabase.from('invite_links').delete().eq('id', id)
    fetchLinks()
  }

  const copyToClipboard = (token: string, id: string) => {
    const url = `${window.location.origin}/invite/${token}`
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Create Link Form */}
      <div className="p-8 bg-card/50 backdrop-blur-xl border-2 border-primary/10 rounded-[32px] shadow-xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <Plus className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-2xl font-black">إنشاء رابط دعوة جديد</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2 col-span-1 md:col-span-1">
            <label className="text-xs font-bold text-muted-foreground mr-2">وصف الرابط (مثل: للمطورين الجدد)</label>
            <input 
              value={newLinkLabel}
              onChange={(e) => setNewLinkLabel(e.target.value)}
              placeholder="اسم الرابط..."
              className="w-full px-5 py-4 bg-muted/50 rounded-2xl border-2 border-transparent focus:border-primary focus:outline-none transition-all font-medium"
            />
          </div>

          <div className="space-y-2 col-span-1">
            <label className="text-xs font-bold text-muted-foreground mr-2">مدة الصلاحية</label>
            <select 
              value={expiration}
              onChange={(e) => setExpiration(e.target.value)}
              className="w-full px-5 py-4 bg-muted/50 rounded-2xl border-2 border-transparent focus:border-primary focus:outline-none transition-all font-medium appearance-none"
            >
              <option value="24h">24 ساعة</option>
              <option value="7d">7 أيام</option>
              <option value="30d">30 يوماً</option>
              <option value="permanent">بدون نهاية</option>
            </select>
          </div>

          <div className="flex items-end">
            <button 
              onClick={createLink}
              disabled={loading || !newLinkLabel}
              className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20"
            >
              {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : "إنشاء الرابط"}
            </button>
          </div>
        </div>
      </div>

      {/* Links List */}
      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence>
          {links.map((link) => {
            const isExpired = link.expires_at && new Date(link.expires_at) < new Date()
            
            return (
              <motion.div
                key={link.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`p-6 bg-card border-2 rounded-[24px] transition-all group flex flex-col md:flex-row items-center gap-4 ${
                  isExpired ? "opacity-50 grayscale border-muted" : "border-primary/5 hover:border-primary/20 shadow-sm"
                }`}
              >
                <div className="flex-1 w-full text-right">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-black text-lg">{link.label}</span>
                    {isExpired && (
                      <span className="px-2 py-0.5 bg-destructive/10 text-destructive rounded-md text-[10px] font-bold">منتهي</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
                    <span className="flex items-center gap-1.5 ">
                      <Clock className="w-3 h-3" />
                      {link.expires_at ? new Date(link.expires_at).toLocaleDateString("ar-EG") : "صلاحية دائماً"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <ExternalLink className="w-3 h-3" />
                      {link.usage_count} استخدام
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <div className="flex-1 md:w-64 px-4 py-3 bg-muted/30 rounded-xl font-mono text-xs truncate">
                    .../invite/{link.token}
                  </div>
                  
                  <button 
                    onClick={() => copyToClipboard(link.token, link.id)}
                    className={`p-3 rounded-xl transition-all ${
                      copiedId === link.id ? "bg-emerald-500 text-white" : "bg-primary/10 text-primary hover:bg-primary/20"
                    }`}
                  >
                    {copiedId === link.id ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>

                  <button 
                    onClick={() => deleteLink(link.id)}
                    className="p-3 bg-destructive/5 text-destructive rounded-xl hover:bg-destructive/10 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
        
        {links.length === 0 && (
          <div className="p-12 text-center bg-muted/20 border-2 border-dashed rounded-[32px] text-muted-foreground italic">
            لا توجد روابط دعوة حالياً. أنشئ رابطاً لبدء استقبال فريقك.
          </div>
        )}
      </div>
    </div>
  )
}
