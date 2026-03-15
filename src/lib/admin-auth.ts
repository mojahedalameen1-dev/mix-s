// Admin credentials — stored server-side only
export const ADMIN_USERNAME = 'admin'
export const ADMIN_PASSWORD = 'm58858'
export const ADMIN_SESSION_COOKIE = 'mix_admin_session'

// Generate the session value consistently
export const ADMIN_SESSION_VALUE = 'authorized_' + Buffer.from(ADMIN_USERNAME + ADMIN_PASSWORD).toString('base64')

/**
 * Validates if the provided cookie value matches the expected admin session.
 */
export function isValidAdminSession(cookieValue: string | undefined): boolean {
  if (!cookieValue) return false
  return cookieValue === ADMIN_SESSION_VALUE
}
