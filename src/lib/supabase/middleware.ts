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

  // Use getSession() instead of getUser() for middleware performance and reliability check
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user

  const pathname = request.nextUrl.pathname
  const isAuthPage = pathname.startsWith('/login') || 
                     pathname.startsWith('/invite') ||
                     pathname.startsWith('/complete-profile') ||
                     pathname.startsWith('/auth/callback')
  const isAdminPage = pathname.startsWith('/admin')

  console.log(`[Middleware] Path: ${pathname}, User: ${user?.id || 'none'}`)

  // Direct redirect if no user session found for protected routes
  if (!user && !isAuthPage) {
    console.log(`[Middleware] No session found for ${pathname}, redirecting to /login`)
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If session exists but on login page, go home
  if (user && pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Admin route protection
  if (user && isAdminPage) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, status')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'admin') {
      console.warn(`[Middleware] Access Denied for ${user.id} to ${pathname}: ${profileError?.message || 'Not Admin'}`)
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return response
}
