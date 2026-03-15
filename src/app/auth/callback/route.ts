import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { logActivity } from '@/lib/activity'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  
  // Read invite token from URL or Cookie
  const cookieStore = cookies()
  const inviteToken = searchParams.get('invite') || cookieStore.get('invite_token')?.value

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=No code provided`)
  }

  try {
    const supabase = createClient()
    const adminClient = createAdminClient()
    
    // Exchange code for session
    const { data: { session }, error: authError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (authError || !session) {
      console.error('[AuthCallback] Exchange error:', authError)
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(authError?.message || 'Authentication failed')}`)
    }

    const user = session.user

    // ── STEP 0: Ensure profile exists (fallback if trigger failed) ──
    const { data: existingProfile } = await adminClient
      .from('profiles')
      .select('id, status, full_name, role')
      .eq('id', user.id)
      .maybeSingle()

    if (!existingProfile) {
      console.warn(`[AuthCallback] Profile missing for user ${user.id}, creating fallback...`)
      const { error: insertError } = await adminClient
        .from('profiles')
        .insert({
          id: user.id,
          full_name: user.user_metadata?.full_name || null,
          email: user.email,
          avatar_url: user.user_metadata?.avatar_url || null,
          role: 'engineer', // Default role
          status: 'pending', // Default status
        })
      
      if (insertError) {
        console.error(`[AuthCallback] Error creating fallback profile:`, insertError)
      }
    }

    // Update last login
    await adminClient
      .from('profiles')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', user.id)

    // ── STEP 1: Process Invitation if token exists ──
    if (inviteToken) {
      console.log(`[AuthCallback] Processing invite token: ${inviteToken}`)
      
      const now = new Date().toISOString()
      const { data: invite } = await adminClient
        .from('invite_links')
        .select('*')
        .eq('token', inviteToken)
        .eq('is_active', true)
        .is('used_at', null)
        .or(`expires_at.is.null,expires_at.gt.${now}`)
        .maybeSingle()

      if (invite) {
        console.log(`[AuthCallback] Token valid, activating user: ${user.id}`)
        
        // 1. Activate user
        await adminClient
          .from('profiles')
          .update({ 
             status: 'active',
             role: 'business_developer', // Invites are for BDs
             invited_by: invite.created_by
          })
          .eq('id', user.id)

        // 2. Mark invite as used
        await adminClient
          .from('invite_links')
          .update({ 
            used_at: new Date().toISOString(),
            usage_count: (invite.usage_count || 0) + 1 
          })
          .eq('id', invite.id)

        // 3. Log registration
        await logActivity(adminClient, user.id, 'login', 'Registered via invitation')
        
        // Clear the cookie
        cookieStore.delete('invite_token')

        return NextResponse.redirect(`${origin}/complete-profile`)
      } else {
        console.warn(`[AuthCallback] Invite token invalid or expired: ${inviteToken}`)
      }
    }

    // ── STEP 2: Handle regular login flow ──
    const { data: profile } = await adminClient
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
    await logActivity(adminClient, user.id, 'login', 'تسجيل دخول للنظام')

    return NextResponse.redirect(`${origin}${next}`)

  } catch (error) {
    console.error('[AuthCallback] Unexpected error:', error)
    return NextResponse.redirect(`${origin}/login?error=Unexpected error color occurred`)
  }
}


