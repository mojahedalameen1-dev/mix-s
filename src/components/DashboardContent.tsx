"use client"

import { useState } from "react"
import { Profile } from "@/types/database"
import WelcomeScreen from "@/components/WelcomeScreen"
import Sidebar from "@/components/Sidebar"
import Header from "@/components/Header"
import QuickStats from "@/components/QuickStats"
import PerformanceChart from "@/components/PerformanceChart"
import Leaderboard from "@/components/Leaderboard"
import { getGreeting } from "@/utils/greeting"

interface DashboardContentProps {
  profile: Profile;
}

export default function DashboardContent({ profile }: DashboardContentProps) {
  const [showWelcome, setShowWelcome] = useState(!profile.has_seen_welcome)
  const greeting = getGreeting(profile.full_name || "")

  if (showWelcome) {
    return <WelcomeScreen userName={profile.full_name?.split(' ')[0] || ""} onFinish={() => setShowWelcome(false)} />
  }

  return (
    <div className="flex h-screen bg-background text-foreground" dir="rtl">
      <Sidebar role={profile.role} />
      
      <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-8">
        <Header profile={profile} />
        
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">{greeting}</h2>
          <p className="text-muted-foreground">داشبوردك الخاص بـ MIX-AA</p>
        </div>

        <QuickStats profile={profile} />

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <PerformanceChart profile={profile} />
            {/* Additional main content cards can go here */}
          </div>
          <div className="space-y-8">
            <Leaderboard />
          </div>
        </div>
      </main>
    </div>
  )
}
