"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { BADGES } from "@/utils/badges"

export function useBadges(userId: string) {
  const [userBadges, setUserBadges] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    const fetchBadges = async () => {
      const { data } = await supabase
        .from('badges')
        .select('*')
        .eq('engineer_id', userId)
      
      if (data) setUserBadges(data)
    }

    fetchBadges()
  }, [userId, supabase])

  const checkAndAwardBadges = async (type: 'deal_closed' | 'meeting_held' | 'target_progress', value?: any) => {
    // This logic should ideally be on the server/trigger for security
    // But we'll implement a client-side checker that calls a server action/function
    console.log(`Checking badges for ${type}`)
  }

  return { userBadges, checkAndAwardBadges }
}
