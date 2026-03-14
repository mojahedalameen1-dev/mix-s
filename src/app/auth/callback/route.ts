import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
      const cookieStore = request.headers.get('cookie')
      const inviteToken = request.headers.get('cookie')?.split('; ').find(row => row.startsWith('sb-invite-token='))?.split('=')[1]

      const response = NextResponse.redirect(`${origin}${next}`)

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
          // We use a small delay or retry because the trigger handle_new_user might still be processing
          await new Promise(resolve => setTimeout(resolve, 500)) 
          
          await supabase
            .from('profiles')
            .update({ status: 'active' })
            .eq('id', user.id)
        }

        // Clean up the cookie
        response.cookies.set('sb-invite-token', '', { path: '/', maxAge: 0 })
      }

      return response
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=Could not authenticate user`)
}
