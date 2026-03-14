"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { BADGES } from "@/utils/badges"

export function useBadges(userId: string) {
  const [userBadges, setUserBadges] = useState<any[]>([])
  const supabase = createClient()

  const fetchBadges = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .eq('engineer_id', userId)
      
      if (error) throw error
      if (data) setUserBadges(data)
    } catch (error) {
      console.error('Error fetching badges:', error)
    }
  }, [userId, supabase])

  useEffect(() => {
    fetchBadges()
  }, [fetchBadges])

  const checkAndAwardBadges = async (type: 'deal_closed' | 'meeting_held' | 'target_progress', value?: any) => {
    // This logic should ideally be on the server/trigger for security
    // But we'll implement a client-side checker that calls a server action/function
    console.log(`Checking badges for ${type}`)
  }

  return { userBadges, checkAndAwardBadges }
}
