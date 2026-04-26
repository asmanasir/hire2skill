import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * GoTrue may expect `signup` for first-time / unverified users and `email` for returning
 * passwordless logins. Trying both avoids "invalid code" when templates or Confirm email vary.
 */
export async function verifyEmailOtpWithFallback(supabase: SupabaseClient, email: string, token: string) {
  const types = ['signup', 'email'] as const
  let lastMessage = ''
  for (const type of types) {
    const { data, error } = await supabase.auth.verifyOtp({ email, token, type })
    if (!error && data.session?.user) {
      return { data, error: null as null }
    }
    if (error?.message) lastMessage = error.message
  }
  return { data: null, error: { message: lastMessage || 'Invalid or expired code.' } }
}
