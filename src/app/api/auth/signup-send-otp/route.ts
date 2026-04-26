import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { normalizeEmail, getEmailGuardReason } from '@/lib/email-guard'
import { getPublicSupabaseEnv, PUBLIC_ENV } from '@/lib/env/public'
import { createAdminClient } from '@/lib/supabase/admin'

export type SignupSendOtpErrorReason =
  | 'email_blocked'
  | 'already_registered'
  | 'email_check_failed'
  | 'invalid_email'
  | 'blocked_domain'
  | 'provider'

type SendOtpResult = { ok: true } | { ok: false; reason: SignupSendOtpErrorReason; message?: string; status?: number; code?: string }

/** Coalesce concurrent POSTs for the same email so Supabase only sees one OTP request (avoids instant 429 from double-fire). */
const inflightByEmail = new Map<string, Promise<SendOtpResult>>()

function siteOrigin(request: Request): string {
  const reqOrigin = new URL(request.url).origin
  if (reqOrigin.includes('localhost') || reqOrigin.includes('127.0.0.1')) {
    return reqOrigin
  }
  const fromEnv = PUBLIC_ENV.NEXT_PUBLIC_SITE_URL ?? PUBLIC_ENV.NEXT_PUBLIC_APP_URL
  if (fromEnv) return fromEnv.replace(/\/$/, '')
  return reqOrigin
}

async function isOnDenylist(email: string): Promise<boolean> {
  const domain = email.split('@')[1] ?? ''
  const admin = createAdminClient()
  const { data: emailHit } = await admin
    .from('email_denylist')
    .select('active')
    .eq('active', true)
    .eq('email', email)
    .limit(1)
    .maybeSingle()
  if (emailHit?.active) return true
  const { data: domainHit } = await admin
    .from('email_denylist')
    .select('active')
    .eq('active', true)
    .eq('domain', domain)
    .limit(1)
    .maybeSingle()
  return Boolean(domainHit?.active)
}

async function isAuthEmailRegistered(email: string): Promise<boolean | null> {
  const admin = createAdminClient()
  const { data, error } = await admin.rpc('auth_email_exists', { p_email: email })
  if (!error && typeof data === 'boolean') return data
  return null
}

async function runSendSignupOtp(email: string, nextPath: string | null, request: Request): Promise<SendOtpResult> {
  try {
    if (await isOnDenylist(email)) {
      return { ok: false, reason: 'email_blocked' }
    }

    const registered = await isAuthEmailRegistered(email)
    if (registered === null) {
      return { ok: false, reason: 'email_check_failed' }
    }
    if (registered) {
      return { ok: false, reason: 'already_registered' }
    }

    const { url, anonKey } = getPublicSupabaseEnv()
    const supabase = createClient(url, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    })

    const callbackUrl = new URL('/auth/callback', siteOrigin(request))
    if (nextPath) callbackUrl.searchParams.set('next', nextPath)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: callbackUrl.toString(),
      },
    })

    if (error) {
      const err = error as { message?: string; status?: number; code?: string }
      return {
        ok: false,
        reason: 'provider',
        message: err.message,
        status: typeof err.status === 'number' ? err.status : undefined,
        code: err.code,
      }
    }

    return { ok: true }
  } catch {
    return { ok: false, reason: 'provider', message: 'Something went wrong. Try again.' }
  }
}

function jsonFromResult(result: SendOtpResult) {
  if (result.ok) {
    return NextResponse.json({ ok: true as const })
  }
  return NextResponse.json({
    ok: false as const,
    reason: result.reason,
    message: result.message,
    status: result.status,
    code: result.code,
  })
}

export async function POST(request: Request) {
  let body: { email?: string; next?: string | null }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, reason: 'invalid_email' satisfies SignupSendOtpErrorReason }, { status: 400 })
  }

  const raw = typeof body.email === 'string' ? body.email : ''
  const email = normalizeEmail(raw)
  const nextRaw = body.next
  const nextPath =
    typeof nextRaw === 'string' && nextRaw.startsWith('/') && !nextRaw.startsWith('//') ? nextRaw : null

  const guard = getEmailGuardReason(email)
  if (guard === 'invalid_format' || !email.includes('@')) {
    return jsonFromResult({ ok: false, reason: 'invalid_email' })
  }
  if (guard === 'blocked_domain') {
    return jsonFromResult({ ok: false, reason: 'blocked_domain' })
  }

  const key = email.toLowerCase()
  const existing = inflightByEmail.get(key)
  if (existing) {
    return jsonFromResult(await existing)
  }

  const promise = runSendSignupOtp(email, nextPath, request).finally(() => {
    setTimeout(() => {
      if (inflightByEmail.get(key) === promise) inflightByEmail.delete(key)
    }, 2500)
  })

  inflightByEmail.set(key, promise)
  return jsonFromResult(await promise)
}
