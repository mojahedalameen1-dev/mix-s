"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Copy, Check, Trash2, Clock, Plus, ExternalLink, ShieldCheck, Mail, Send, Calendar } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface InviteLink {
  id: string
  token: string
  label: string
  expires_at: string | null
  is_active: boolean
  usage_count: number
  created_at: string
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
    
    const token = Math.random().toString(36).substring(2, 11) + '-' + Math.random().toString(36).substring(2, 6)
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
    <div className="space-y-8">
      {/* Premium Creation Section */}
      <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[32px] overflow-hidden shadow-2xl shadow-zinc-200/50 dark:shadow-none">
        <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Plus className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-black text-zinc-900 dark:text-white">إصدار رابط جديد</h2>
              <p className="text-xs text-zinc-500 font-medium">قم بإنشاء رابط دعوة مؤقت للفريق</p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-zinc-400 uppercase tracking-widest mr-1">وصف الرابط</label>
              <input 
                value={newLinkLabel}
                onChange={(e) => setNewLinkLabel(e.target.value)}
                placeholder="مثال: مطور أعمال - الرياض"
                className="w-full px-6 py-4 bg-zinc-100 dark:bg-zinc-800/50 rounded-2xl border-2 border-transparent focus:border-primary/50 focus:bg-white dark:focus:bg-zinc-800 transition-all font-bold outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-zinc-400 uppercase tracking-widest mr-1">صلاحية الرابط</label>
              <div className="relative">
                <select 
                  value={expiration}
                  onChange={(e) => setExpiration(e.target.value)}
                  className="w-full px-6 py-4 bg-zinc-100 dark:bg-zinc-800/50 rounded-2xl border-2 border-transparent focus:border-primary/50 focus:bg-white dark:focus:bg-zinc-800 transition-all font-bold outline-none appearance-none"
                >
                  <option value="24h">24 ساعة (اختبار سريع)</option>
                  <option value="7d">أسبوع واحد (توظيف)</option>
                  <option value="30d">شهر كامل (موسم)</option>
                  <option value="permanent">دائم (رابط إداري)</option>
                </select>
                <Clock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <button 
            onClick={createLink}
            disabled={loading || !newLinkLabel}
            className="w-full py-5 premium-gradient text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:brightness-110 active:scale-[0.98] transition-all shadow-xl shadow-primary/30 disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? <Plus className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
            إنشاء وتفعيل الرابط
          </button>
        </div>
      </section>

      {/* Active Links Grid */}
      <div className="grid grid-cols-1 gap-6">
        <h3 className="text-sm font-black text-zinc-400 uppercase tracking-[0.2em] px-4">السجلات النشطة</h3>
        <AnimatePresence mode="popLayout">
          {links.map((link) => {
            const isExpired = link.expires_at && new Date(link.expires_at) < new Date()
            
            return (
              <motion.div
                key={link.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`relative group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-[28px] flex flex-col md:flex-row items-center gap-6 transition-all ${
                  isExpired ? "opacity-40 grayscale" : "hover:border-primary/30 hover:shadow-xl hover:shadow-zinc-200/40 dark:hover:shadow-none"
                }`}
              >
                <div className="flex-1 w-full space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-black text-zinc-900 dark:text-white">{link.label}</span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      isExpired ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"
                    }`}>
                      {isExpired ? "منتهي" : "نشط"}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-6 text-[11px] font-bold text-zinc-500">
                    <span className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      {link.expires_at ? `ينتهي: ${new Date(link.expires_at).toLocaleDateString("ar-EG")}` : "رابط دائم"}
                    </span>
                    <span className="flex items-center gap-2">
                      <ExternalLink className="w-3.5 h-3.5" />
                      استخدم {link.usage_count} مرة
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className="flex-1 md:w-48 px-4 py-3 bg-zinc-50 dark:bg-white/5 rounded-xl font-mono text-[10px] text-zinc-400 truncate">
                    {link.token}
                  </div>
                  
                  <button 
                    onClick={() => copyToClipboard(link.token, link.id)}
                    className={`p-4 rounded-2xl transition-all shadow-lg ${
                      copiedId === link.id 
                        ? "bg-emerald-500 text-white shadow-emerald-500/20" 
                        : "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:scale-110 active:scale-90"
                    }`}
                  >
                    {copiedId === link.id ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>

                  <button 
                    onClick={() => deleteLink(link.id)}
                    className="p-4 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/10 opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
        
        {links.length === 0 && (
          <div className="py-20 text-center bg-zinc-50 dark:bg-zinc-900/50 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[40px]">
            <div className="flex flex-col items-center gap-4 opacity-30">
              <ShieldCheck className="w-16 h-16" />
              <p className="text-lg font-black italic">لا توجد روابط نشطة حالياً</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
