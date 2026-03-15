import { NextResponse, type NextRequest } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { isValidAdminSession, ADMIN_SESSION_COOKIE } from "@/lib/admin-auth"
import { logActivity } from "@/lib/activity"

export async function POST(request: NextRequest) {
  try {
    // 1. Verify Admin Session
    const adminCookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value
    if (!isValidAdminSession(adminCookie)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { label, expiresAt } = await request.json()
    if (!label) {
      return NextResponse.json({ error: "Label is required" }, { status: 400 })
    }

    const supabase = createAdminClient()

    // 2. Generate Token
    const token = Math.random().toString(36).substring(2, 11) + '-' + Math.random().toString(36).substring(2, 6)

    // 3. Insert Invite Link
    const { data: invite, error } = await supabase
      .from('invite_links')
      .insert({
        token,
        label,
        expires_at: expiresAt,
        is_active: true,
        created_by: '316f0351-26d1-4b4f-9d00-73cf9e2c8231' // Hardcoded Admin ID
      })
      .select()
      .single()

    if (error) throw error

    // 4. Log Activity
    await logActivity(
      supabase,
      '316f0351-26d1-4b4f-9d00-73cf9e2c8231',
      'invite_created',
      `تم إنشاء رابط دعوة جديد: ${label}`,
      { metadata: { label, expires: expiresAt } }
    )

    return NextResponse.json({ success: true, invite })
  } catch (error: any) {
    console.error('Error creating invite link:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
