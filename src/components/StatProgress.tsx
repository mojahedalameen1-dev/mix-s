"use client"

import { motion } from "framer-motion"

interface StatProgressProps {
  progress: number
}

export default function StatProgress({ progress }: StatProgressProps) {
  return (
    <div className="h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200 p-1 relative">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(progress, 100)}%` }}
        transition={{ duration: 1.5, ease: "circOut" }}
        className="h-full premium-gradient rounded-full relative z-10" 
      />
    </div>
  )
}
