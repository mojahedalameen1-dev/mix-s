"use client"

import { motion } from "framer-motion"

interface StatProgressProps {
  progress: number
}

export default function StatProgress({ progress }: StatProgressProps) {
  return (
    <div className="h-4 bg-white/5 rounded-full p-1 overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(progress, 100)}%` }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="h-full bg-gradient-to-r from-primary to-blue-400 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)]" 
      />
    </div>
  )
}
