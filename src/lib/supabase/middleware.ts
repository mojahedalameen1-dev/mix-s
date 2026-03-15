import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isValidAdminSession, ADMIN_SESSION_COOKIE } from '@/lib/admin-auth'

export async function updateSession(request: NextRequest) {
  try {
    let response = NextResponse.next({
      request: { headers: request.headers },
    })

    const pathname = request.nextUrl.pathname
    const adminCookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value

    // 1. Skip middleware for API routes and public assets
    if (
      pathname.startsWith('/api/') || 
      pathname.startsWith('/_next') || 
      pathname.includes('/favicon.ico') ||
      pathname === '/unauthorized'
    ) {
      return response
    }

    // ── PUBLIC ROUTES ──────────────────
    if (pathname.startsWith('/invite') || pathname.startsWith('/auth') || pathname === '/login' || pathname === '/pending-approval') {
      return response
    }

    // ── ADMIN ROUTES ──────────────────
    if (pathname.startsWith('/admin')) {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) { return request.cookies.get(name)?.value },
            set(name: string, value: string, options: CookieOptions) {
              request.cookies.set({ name, value, ...options })
            },
            remove(name: string, options: CookieOptions) {
              request.cookies.set({ name, value: '', ...options })
            },
          },
        }
      )

      const { data: { user } } = await supabase.auth.getUser()
      let userIsAdmin = false
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        userIsAdmin = profile?.role === 'admin'
      }

      const hasAdminCookie = isValidAdminSession(adminCookie)

      if (pathname === '/admin/login') {
        if (hasAdminCookie || userIsAdmin) {
          return NextResponse.redirect(new URL('/admin', request.url))
        }
        return response
      }

      if (!hasAdminCookie && !userIsAdmin) {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }

      return response
    }

    // ── BUSINESS DEVELOPER (BD) ROUTES ──────────────────
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

    // Redirect unauthenticated users to login
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Fetch profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, status, role')
      .eq('id', user.id)
      .single()

    // If user is admin (BD role), they shouldn't be here if accessing admin pages, 
    // but this middleware handles the root and generic pages.

    // ── PROFILE COMPLETION & STATUS CHECKS ──────────────────
    if (pathname === '/complete-profile') {
      if (profile?.full_name) {
        return NextResponse.redirect(new URL('/', request.url))
      }
      return response
    }

    if (profile?.status === 'pending') {
      return NextResponse.redirect(new URL('/pending-approval', request.url))
    }

    if (profile?.status === 'active' && !profile?.full_name) {
      return NextResponse.redirect(new URL('/complete-profile', request.url))
    }

    // If they are deactivated
    if (profile?.status === 'deactivated') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    return response
  } catch (error) {
    console.error('Middleware Error:', error)
    // Redirect to login on failure to ensure security
    return NextResponse.redirect(new URL('/login', request.url))
  }
}
