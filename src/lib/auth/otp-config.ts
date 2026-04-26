/**
 * Must match Supabase Dashboard → Authentication → Providers → Email → OTP length.
 * Hire2Skill defaults to 8; set NEXT_PUBLIC_SUPABASE_OTP_LENGTH=6 if your project uses 6.
 */
export function getAuthOtpLength(): number {
  const n = Number(process.env.NEXT_PUBLIC_SUPABASE_OTP_LENGTH)
  if (Number.isFinite(n)) {
    const i = Math.floor(n)
    if (i >= 4 && i <= 12) return i
  }
  return 8
}
