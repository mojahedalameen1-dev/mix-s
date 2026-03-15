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
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                     request.nextUrl.pathname.startsWith('/invite') ||
                     request.nextUrl.pathname.startsWith('/complete-profile')
  const isAdminPage = request.nextUrl.pathname.startsWith('/admin')

  // If no user and not an auth page, redirect to login
  if (!user && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If user exists and trying to access login, redirect to home
  if (user && request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (user && isAdminPage) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, full_name, status')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Final check: If active user has no full_name, redirect to /complete-profile (except on auth pages)
  if (user && !isAuthPage && request.nextUrl.pathname !== '/') {
     const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, status')
      .eq('id', user.id)
      .single()
    
    if (profile?.status === 'active' && !profile?.full_name && request.nextUrl.pathname !== '/complete-profile') {
      return NextResponse.redirect(new URL('/complete-profile', request.url))
    }
  }

  return response
}
