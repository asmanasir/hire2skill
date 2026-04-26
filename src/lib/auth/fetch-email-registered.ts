/** Server knows if the email is registered (Supabase RPC). Returns null if the check failed. */
export async function fetchEmailRegistered(email: string): Promise<boolean | null> {
  const regRes = await fetch('/api/auth/email-registered', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  const regJson = (await regRes.json()) as { ok?: boolean; registered?: boolean }
  if (!regRes.ok || regJson.ok !== true || typeof regJson.registered !== 'boolean') {
    return null
  }
  return regJson.registered
}

/** Aligns with typical Supabase Auth email OTP throttling (~1/min per address). */
export const SIGNUP_OTP_MIN_INTERVAL_MS = 60_000

/** Epoch ms: do not call `signInWithOtp` again for this email until this time (v2 storage). */
function signupOtpNotBeforeKey(email: string) {
  return `h2s.signupOtpNotBefore:2:${email.toLowerCase()}`
}

function scheduleSignupOtpNotBefore(email: string, delayMs: number) {
  if (typeof window === 'undefined') return
  try {
    const delay = Math.max(1000, delayMs)
    const key = signupOtpNotBeforeKey(email)
    const proposed = Date.now() + delay
    const rawExisting = sessionStorage.getItem(key)
    const existing = rawExisting ? parseInt(rawExisting, 10) : NaN
    const notBefore =
      Number.isNaN(existing) || existing < Date.now() ? proposed : Math.max(existing, proposed)
    sessionStorage.setItem(key, String(notBefore))
  } catch {
    /* ignore quota / private mode */
  }
}

export function getSignupOtpCooldownRemainingMs(email: string): number {
  if (typeof window === 'undefined') return 0
  try {
    const raw = sessionStorage.getItem(signupOtpNotBeforeKey(email))
    if (!raw) return 0
    const notBefore = parseInt(raw, 10)
    if (Number.isNaN(notBefore)) return 0
    return Math.max(0, notBefore - Date.now())
  } catch {
    return 0
  }
}

/** Call after a successful signup OTP send so we do not immediately fire a duplicate before the UI advances. */
export function recordSignupOtpRequest(email: string) {
  scheduleSignupOtpNotBefore(email, SIGNUP_OTP_MIN_INTERVAL_MS)
}

/** Parse "wait N seconds" / "after N seconds" from GoTrue-style messages. */
export function parseOtpRateLimitWaitMsFromMessage(message: string): number | null {
  const t = message.trim()
  if (!t) return null
  let m = t.match(/after\s+(\d+)\s*(?:second|seconds|sec)\b/i)
  if (m) return parseInt(m[1], 10) * 1000
  m = t.match(/wait\s+(\d+)\s*(?:second|seconds|sec)\b/i)
  if (m) return parseInt(m[1], 10) * 1000
  m = t.match(/(\d+)\s*(?:second|seconds|sec)\s+before\b/i)
  if (m) return parseInt(m[1], 10) * 1000
  m = t.match(/(\d+)\s*(?:minute|minutes|min)\b/i)
  if (m) return parseInt(m[1], 10) * 60_000
  return null
}

/** After a 429 / throttle response, align client cooldown with the server so we do not double-hit Supabase. */
export function recordSignupOtpRateLimitBackoff(
  email: string,
  err: { message?: string | null; status?: number },
) {
  const delay = parseOtpRateLimitWaitMsFromMessage(err.message ?? '') ?? SIGNUP_OTP_MIN_INTERVAL_MS
  scheduleSignupOtpNotBefore(email, delay)
}

/** Heuristic match for Supabase / GoTrue email-OTP throttle copy. Kept strict to avoid false positives:
 * many auth errors mention "for security purposes" but are not send-rate limits. */
export function isOtpEmailRateLimitedMessage(message: string): boolean {
  const m = message.toLowerCase()
  if (
    m.includes('over_email_send_rate_limit') ||
    m.includes('email_rate_limit') ||
    m.includes('email rate limit')
  ) {
    return true
  }
  if (m.includes('rate limit') || m.includes('too many requests') || m.includes('too many emails')) {
    return true
  }
  if (m.includes('only request this after') || m.includes('only request this once')) {
    return true
  }
  if (/\b429\b/.test(m)) {
    return true
  }
  if (m.includes('too fast') || m.includes('cooldown')) {
    return true
  }
  if (m.includes('seconds before') && (m.includes('request') || m.includes('another'))) {
    return true
  }
  if (m.includes('for security purposes')) {
    return (
      m.includes('only request') ||
      (m.includes('after') && (m.includes('second') || m.includes('minute'))) ||
      (m.includes('wait') && (m.includes('second') || m.includes('minute')))
    )
  }
  return false
}

/** Prefer HTTP status / error code when the client exposes them (Supabase AuthApiError). */
export function isSignupOtpSendRateLimitedError(err: {
  message?: string | null
  status?: number
  code?: string | null
}): boolean {
  if (typeof err.status === 'number' && err.status === 429) return true
  const code = (err.code ?? '').toString().toLowerCase()
  if (code.includes('over_email_send') || code.includes('rate_limit') || code.includes('too_many')) {
    return true
  }
  return isOtpEmailRateLimitedMessage(err.message ?? '')
}

/** Prefer the provider message when it includes a concrete wait hint; otherwise use i18n fallback. */
export function userFacingOtpRateLimitMessage(apiMessage: string, fallback: string): string {
  const t = apiMessage.trim()
  if (!t) return fallback
  const lower = t.toLowerCase()
  const looksActionable =
    /(\d+\s*(second|minute|min|sek|minutt)|try again|after\s+\d|vent|försök)/i.test(lower)
  if (looksActionable && t.length <= 240) return t
  return fallback
}

/** `signInWithOtp` with shouldCreateUser:false when the email has no auth user (wording varies by Supabase version). */
export function isLoginOtpNoExistingUserMessage(message: string): boolean {
  const m = message.toLowerCase()
  return (
    m.includes('signups not allowed') ||
    m.includes('signup not allowed') ||
    m.includes('sign up not allowed') ||
    m.includes('user not found')
  )
}
