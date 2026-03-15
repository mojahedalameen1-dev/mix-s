import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isValidAdminSession, ADMIN_SESSION_COOKIE } from '@/lib/admin-auth'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const pathname = request.nextUrl.pathname
  const adminCookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value

  // ── ADMIN ROUTES — Use custom cookie (no Supabase needed) ──────────────────
  if (pathname.startsWith('/admin')) {
    // /admin/login is public
    if (pathname === '/admin/login') {
      // If already logged in as admin, redirect to dashboard
      if (isValidAdminSession(adminCookie)) {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
      return response
    }

    // All other /admin/* routes require admin session
    if (!isValidAdminSession(adminCookie)) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    return response
  }

  // ── ALL OTHER ROUTES — Use Supabase Auth (for BD users) ───────────────────
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isAuthPage = pathname.startsWith('/login') ||
                     pathname.startsWith('/invite') ||
                     pathname.startsWith('/complete-profile') ||
                     pathname.startsWith('/auth/callback')

  // Redirect unauthenticated users to login
  if (!user && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect authenticated users away from login
  if (user && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Enforce profile completion
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
