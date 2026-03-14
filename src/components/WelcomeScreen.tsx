"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import confetti from "canvas-confetti"
import { Sparkles } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface WelcomeScreenProps {
  userName: string;
  onFinish: () => void;
}

export default function WelcomeScreen({ userName, onFinish }: WelcomeScreenProps) {
  const [step, setStep] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    // Fire confetti immediately
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    return () => clearInterval(interval)
  }, [])

  const handleStart = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase
        .from('profiles')
        .update({ has_seen_welcome: true })
        .eq('id', user.id)
    }
    onFinish()
  }

  return (
    <div className="fixed inset-0 z-[100] bg-background flex items-center justify-center overflow-hidden" dir="rtl">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 text-center space-y-8 p-12"
        >
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="w-24 h-24 bg-primary rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-primary/20"
          >
            <Sparkles className="w-12 h-12 text-primary-foreground" />
          </motion.div>

          <div className="space-y-4">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-5xl font-extrabold text-foreground"
            >
              أهلاً بك يا {userName}! 🎉
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-2xl text-muted-foreground"
            >
              نحن متحمسون جداً لبدء رحلتك معنا في MIX-AA
            </motion.p>
          </div>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            onClick={handleStart}
            className="group relative px-12 py-5 bg-primary text-primary-foreground rounded-2xl font-bold text-xl transition-all hover:scale-105 active:scale-[0.98] shadow-xl shadow-primary/20"
          >
           ابدأ رحلتك
          </motion.button>
        </motion.div>
      </AnimatePresence>

      {/* Background Animated Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-primary/5"
            style={{
              width: Math.random() * 100 + 50,
              height: Math.random() * 100 + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 50 - 25, 0],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>
    </div>
  )
}
