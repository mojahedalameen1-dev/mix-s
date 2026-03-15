import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isValidAdminSession, ADMIN_SESSION_COOKIE } from '@/lib/admin-auth'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const pathname = request.nextUrl.pathname
  const adminCookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value

  // 1. Skip middleware for API routes - let them handle their own auth
  if (pathname.startsWith('/api/')) {
    return response
  }

  // ── RULE 1 & 2: /invite/* and /auth/* are always public ──────────────────
  if (pathname.startsWith('/invite') || pathname.startsWith('/auth') || pathname === '/login') {
    return response
  }

  // ── ADMIN ROUTES — Preserving existing logic ──────────────────
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') {
      if (isValidAdminSession(adminCookie)) {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
      return response
    }

    if (!isValidAdminSession(adminCookie)) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    return response
  }

  // ── OTHER ROUTES — Use Supabase Auth (for BD users) ───────────────────
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

  // ── RULE 5: /* → requires auth + status === 'active' + full_name is not null
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, status')
    .eq('id', user.id)
    .single()

  // ── RULE 3: /complete-profile → requires auth, only if full_name is null ──
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

  return response
}
