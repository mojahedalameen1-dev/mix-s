"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Copy, Check, Trash2, Clock, Plus, ExternalLink, ShieldCheck, Mail, Send, Calendar, Users } from "lucide-react"
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
      <section className="glass-card rounded-[32px] overflow-hidden border-white/10 relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
        
        <div className="p-8 border-b border-white/5 flex items-center justify-between relative capitalize">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/10">
              <Plus className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">إصدار رابط جديد</h2>
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-0.5">Invite Link Engine v2.0</p>
            </div>
          </div>
          <div className="hidden md:block">
             <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-black flex items-center gap-2">
                <div className="w-1 h-1 bg-emerald-500 rounded-full animate-ping" />
                النظام نشط
             </div>
          </div>
        </div>

        <div className="p-8 space-y-8 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mr-1">وصف الرابط</label>
              <div className="relative group/input">
                <input 
                  value={newLinkLabel}
                  onChange={(e) => setNewLinkLabel(e.target.value)}
                  placeholder="مثال: مطور أعمال - الرياض"
                  className="w-full px-6 py-4 bg-zinc-900/50 dark:bg-black/40 rounded-2xl border border-white/5 focus:border-primary/50 focus:bg-zinc-900 transition-all font-bold outline-none text-zinc-200"
                />
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within/input:text-primary transition-colors" />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mr-1">فترة الصلاحية</label>
              <div className="relative group/select">
                <select 
                  value={expiration}
                  onChange={(e) => setExpiration(e.target.value)}
                  className="w-full px-6 py-4 bg-zinc-900/50 dark:bg-black/40 rounded-2xl border border-white/5 focus:border-primary/50 focus:bg-zinc-900 transition-all font-bold outline-none appearance-none text-zinc-200 cursor-pointer"
                >
                  <option value="24h">24 ساعة (اختبار سريع)</option>
                  <option value="7d">أسبوع واحد (توظيف)</option>
                  <option value="30d">شهر كامل (موسم)</option>
                  <option value="permanent">دائم (رابط إداري)</option>
                </select>
                <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-2">
                   <Clock className="w-5 h-5 text-zinc-600 group-focus-within/select:text-primary transition-colors" />
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={createLink}
            disabled={loading || !newLinkLabel}
            className="w-full py-5 premium-gradient text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:premium-gradient-hover active:scale-[0.99] transition-all shadow-2xl shadow-primary/20 disabled:opacity-30 disabled:grayscale disabled:pointer-events-none group/btn"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>جاري المعالجة...</span>
              </div>
            ) : (
              <>
                <span>إنشاء وتفعيل الرابط</span>
                <Send className="w-5 h-5 group-hover:-translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      </section>

      {/* Active Links Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-4">
           <div className="flex items-center gap-3">
              <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">السجلات النشطة</h3>
              <div className="h-px w-8 bg-zinc-800" />
              <span className="text-[10px] font-black text-primary">{links.length} سجل</span>
           </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence mode="popLayout">
            {links.map((link) => {
              const isExpired = link.expires_at && new Date(link.expires_at) < new Date()
              
              return (
                <motion.div
                  key={link.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`relative group glass-card p-5 rounded-3xl flex flex-col md:flex-row items-center gap-6 transition-all duration-500 ${
                    isExpired ? "opacity-30 grayscale" : "hover:scale-[1.01] hover:border-primary/20"
                  }`}
                >
                  <div className="w-14 h-14 bg-zinc-900/80 rounded-2xl flex items-center justify-center border border-white/5 shadow-inner">
                    <ExternalLink className={`w-6 h-6 ${isExpired ? "text-zinc-600" : "text-primary opacity-60"}`} />
                  </div>

                  <div className="flex-1 w-full space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-black text-white italic">{link.label}</span>
                      <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-black tracking-widest uppercase border ${
                        isExpired 
                          ? "bg-red-500/5 text-red-500/60 border-red-500/10" 
                          : "bg-emerald-500/5 text-emerald-500 border-emerald-500/20"
                      }`}>
                        {isExpired ? "Expired" : "Active"}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-5 text-[10px] font-bold text-zinc-500">
                      <span className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-lg">
                        <Calendar className="w-3 h-3 text-zinc-600" />
                        {link.expires_at ? new Date(link.expires_at).toLocaleDateString("ar-EG") : "صلاحية مفتوحة"}
                      </span>
                      <span className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-lg">
                        <Users className="w-3 h-3 text-zinc-600" />
                        الاستخدام: {link.usage_count}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="flex-1 md:w-40 px-4 py-3 bg-black/40 border border-white/5 rounded-2xl font-mono text-[9px] text-zinc-500 group-hover:text-zinc-300 transition-colors truncate">
                      {link.token}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => copyToClipboard(link.token, link.id)}
                        className={`w-12 h-12 rounded-2xl transition-all shadow-xl flex items-center justify-center group/copy ${
                          copiedId === link.id 
                            ? "bg-emerald-500 text-white shadow-emerald-500/20 scale-110" 
                            : "bg-zinc-900 border border-white/5 text-white hover:bg-zinc-800 hover:border-primary/30"
                        }`}
                      >
                        {copiedId === link.id ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                      </button>

                      <button 
                        onClick={() => deleteLink(link.id)}
                        className="w-12 h-12 bg-red-500/5 border border-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-xl shadow-red-500/10 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                        title="حذف الرابط"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
          
          {links.length === 0 && (
            <div className="py-24 text-center glass-card border-dashed border-white/5 rounded-[48px] relative overflow-hidden">
               <div className="absolute inset-0 noise-bg opacity-[0.02] pointer-events-none" />
               <div className="flex flex-col items-center gap-6 relative z-10">
                  <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center shadow-2xl border border-white/5 animate-float">
                    <ShieldCheck className="w-10 h-10 text-zinc-700" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xl font-black text-white tracking-tight">لا توجد روابط نشطة</p>
                    <p className="text-xs text-zinc-500 font-bold max-w-[200px] mx-auto leading-relaxed">
                      ابدأ بإصدار أول رابط دعوة لفريقك من خلال النموذج أعلاه.
                    </p>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
