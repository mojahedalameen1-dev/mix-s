import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logActivity } from '@/lib/activity'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const inviteToken = searchParams.get('invite') ?? searchParams.get('state')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = createClient()
    const { data: { session }, error: authError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!authError && session) {
      const user = session.user
      
      // Update last login timestamp for all users
      await supabase
        .from('profiles')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', user.id)

      if (inviteToken) {
        console.log(`[AuthCallback] Found invite token from state: ${inviteToken}, checking validity...`)
        
        const now = new Date().toISOString()
        const { data: invite } = await supabase
          .from('invite_links')
          .select('*')
          .eq('token', inviteToken)
          .eq('is_active', true)
          .is('used_at', null)
          .or(`expires_at.is.null,expires_at.gt.${now}`)
          .maybeSingle()

        if (invite) {
          console.log(`[AuthCallback] Token valid, activating user: ${user.id}`)
          
          // 1. Activate user and set who invited them
          await supabase
            .from('profiles')
            .update({ 
               status: 'active',
               role: 'business_developer',
               invited_by: invite.created_by
            })
            .eq('id', user.id)

          // 2. Mark invite as used (single-use)
          await supabase
            .from('invite_links')
            .update({ 
              used_at: new Date().toISOString(),
              usage_count: (invite.usage_count || 0) + 1 
            })
            .eq('id', invite.id)

          // 3. Log registration activity
          await logActivity(supabase, user.id, 'login', 'Registered via invitation')
          
          return NextResponse.redirect(`${origin}/complete-profile`)
        } else {
          console.warn(`[AuthCallback] Invite token invalid or expired: ${inviteToken}`)
        }
      }

      // Check current user profile status
      const { data: profile } = await supabase
        .from('profiles')
        .select('status, full_name')
        .eq('id', user.id)
        .single()

      if (profile?.status === 'pending') {
        return NextResponse.redirect(`${origin}/pending-approval`)
      }

      if (profile?.status === 'active' && !profile.full_name) {
        return NextResponse.redirect(`${origin}/complete-profile`)
      }

      // Log regular login
      await logActivity(supabase, user.id, 'login', 'تسجيل دخول للنظام')

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=Could not authenticate user`)
}
