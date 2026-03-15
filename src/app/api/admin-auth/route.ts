import { NextResponse, type NextRequest } from 'next/server'

// Admin credentials — stored server-side only, never exposed to client
const ADMIN_USERNAME = 'admin'
const ADMIN_PASSWORD = 'm58858'
const SESSION_COOKIE = 'mix_admin_session'
const SESSION_VALUE = 'authorized_' + Buffer.from(ADMIN_USERNAME + ADMIN_PASSWORD).toString('base64')

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const response = NextResponse.json({ success: true })
      response.cookies.set(SESSION_COOKIE, SESSION_VALUE, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
      return response
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  } catch {
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 })
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.set('mix_admin_session', '', { maxAge: 0, path: '/' })
  return response
}

// Helper to validate admin session (used by middleware)
export function isValidAdminSession(sessionCookie: string | undefined): boolean {
  if (!sessionCookie) return false
  const expected = 'authorized_' + Buffer.from(ADMIN_USERNAME + ADMIN_PASSWORD).toString('base64')
  return sessionCookie === expected
}
