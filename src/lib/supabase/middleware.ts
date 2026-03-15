import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Protection logic
  const pathname = request.nextUrl.pathname
  const isAuthPage = pathname.startsWith('/login') || 
                     pathname.startsWith('/invite') ||
                     pathname.startsWith('/complete-profile') ||
                     pathname.startsWith('/auth/callback')
  const isAdminPage = pathname.startsWith('/admin')

  // If no user and not an auth page, redirect to login
  if (!user && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If user exists and trying to access login, redirect to home
  if (user && pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Admin route protection
  if (user && isAdminPage) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, full_name, status')
      .eq('id', user.id)
      .single()

    console.log(`[Middleware] Admin check for user ${user.id}: role=${profile?.role}, error=${profileError?.message || 'none'}`)

    // If we can't read the profile (RLS issue) or user is not admin, redirect
    if (!profile || profile.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Final check: If active user has no full_name, redirect to /complete-profile
  if (user && !isAuthPage && pathname !== '/') {
     const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, status')
      .eq('id', user.id)
      .single()
    
    if (profile?.status === 'active' && !profile?.full_name && pathname !== '/complete-profile') {
      return NextResponse.redirect(new URL('/complete-profile', request.url))
    }
  }

  return response
}
