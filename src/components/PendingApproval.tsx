"use client"

import { motion } from "framer-motion"
import { Clock } from "lucide-react"

export default function PendingApproval() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4" dir="rtl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg p-10 text-center space-y-6 bg-card rounded-3xl border shadow-2xl"
      >
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <Clock className="w-10 h-10 text-primary animate-pulse" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">جارٍ مراجعة حسابك</h1>
          <p className="text-muted-foreground text-lg">
            أهلاً بك في فريق MIX-AA! يقوم المسؤول حالياً بمراجعة طلب انضمامك. سيتم إشعارك فور تفعيل الحساب.
          </p>
        </div>

        <div className="pt-4">
          <div className="inline-block px-4 py-2 bg-muted rounded-full text-sm font-medium">
            الحالة: قيد الانتظار (Pending)
          </div>
        </div>
      </motion.div>
    </div>
  )
}
