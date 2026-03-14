"use client"

import { motion } from "framer-motion"

interface StatProgressProps {
  progress: number
}

export default function StatProgress({ progress }: StatProgressProps) {
  return (
    <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/5 p-1 relative">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(progress, 100)}%` }}
        transition={{ duration: 1.5, ease: "circOut" }}
        className="h-full premium-gradient rounded-full shadow-[0_0_20px_rgba(var(--primary),0.4)] relative z-10" 
      />
    </div>
  )
}
