import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logActivity } from '@/lib/activity'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in search params, use it as the redirection URL after successful login
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = createClient()
    const { data: { session }, error: authError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!authError && session) {
      const user = session.user
      const supabase = createClient()
      
      // Update last login timestamp for all users
      await supabase
        .from('profiles')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', user.id)

      const inviteToken = request.headers.get('cookie')?.split('; ').find(row => row.startsWith('sb-invite-token='))?.split('=')[1]

      if (inviteToken) {
        console.log(`[AuthCallback] Found invite token: ${inviteToken}, checking validity...`)
        
        const now = new Date().toISOString()
        const { data: invite } = await supabase
          .from('invite_links')
          .select('*')
          .eq('token', inviteToken)
          .eq('is_active', true)
          .or(`expires_at.is.null,expires_at.gt.${now}`)
          .maybeSingle()

        if (invite) {
          console.log(`[AuthCallback] Token valid, auto-activating user: ${user.id}`)
          
          // 1. Activate user and set who invited them
          await supabase
            .from('profiles')
            .update({ 
               status: 'active',
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

          // 3. Log activity
          await logActivity(supabase, user.id, 'login', 'تسجيل دخول أول مرة (عبر دعوة)')
          
          // Clean up the cookie
          const response = NextResponse.redirect(`${origin}/complete-profile`)
          response.cookies.set('sb-invite-token', '', { path: '/', maxAge: 0 })
          return response
        }
      }

      // Log regular login
      await logActivity(supabase, user.id, 'login', 'تسجيل دخول للنظام')

      const response = NextResponse.redirect(`${origin}${next}`)
      return response
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=Could not authenticate user`)
}
