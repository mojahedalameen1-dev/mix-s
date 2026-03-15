import { SupabaseClient } from '@supabase/supabase-js'

export type ActivityAction = 
  | 'login' 
  | 'client_created' 
  | 'client_updated' 
  | 'sale_created' 
  | 'sale_updated' 
  | 'meeting_created' 
  | 'profile_completed'
  | 'invite_created'

export async function logActivity(
  supabase: SupabaseClient,
  userId: string,
  actionType: ActivityAction,
  description: string,
  options: {
    entityType?: string
    entityId?: string
    metadata?: any
  } = {}
) {
  try {
    const { error } = await supabase
      .from('activity_logs')
      .insert({
        user_id: userId,
        action_type: actionType,
        description,
        entity_type: options.entityType,
        entity_id: options.entityId,
        metadata: options.metadata
      })

    if (error) {
      console.error(`[ActivityLog] Error logging ${actionType}:`, error)
    }
  } catch (err) {
    console.error(`[ActivityLog] Unexpected error logging ${actionType}:`, err)
  }
}
