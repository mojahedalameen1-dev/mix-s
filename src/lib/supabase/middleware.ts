import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 1. Create Supabase Client
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

  // 2. Get User
  const { data: { user } } = await supabase.auth.getUser()
  
  const pathname = request.nextUrl.pathname
  const isAuthPage = pathname.startsWith('/login') || 
                     pathname.startsWith('/invite') ||
                     pathname.startsWith('/complete-profile') ||
                     pathname.startsWith('/auth/callback')
  const isAdminPage = pathname.startsWith('/admin')

  // LOGGING (Visible in Vercel Logs)
  console.log(`[Middleware] ${request.method} ${pathname} | User: ${user?.id || 'GUEST'}`)

  // 3. Conditional Redirects
  
  // Only redirect GUESTS to /login if they aren't already on an auth page
  if (!user && !isAuthPage) {
    console.log(`[Middleware] REDIRECT -> /login (reason: unauthenticated)`)
    // Allow the request to proceed if it's the root, to let app/page.tsx handle its own logic
    if (pathname !== '/') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // If logged in and at /login, go home
  if (user && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // 4. Admin Role Check
  if (user && isAdminPage) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      console.log(`[Middleware] REDIRECT -> / (reason: not admin, role: ${profile?.role})`)
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return response
}
