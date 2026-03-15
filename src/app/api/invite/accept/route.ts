import { NextResponse, type NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(new URL('/login?error=Invalid invite link', request.url))
  }

  const response = NextResponse.redirect(new URL('/login', request.url))
  
  // Set the secure cookie
  response.cookies.set('sb-invite-token', token, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 10, // 10 minutes
    sameSite: 'lax'
  })

  console.log(`[InviteAPI] Token cookie set for: ${token}`)
  
  return response
}
