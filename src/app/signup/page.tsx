'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import { getEmailGuardReason, normalizeEmail } from '@/lib/email-guard'
import { getAuthOtpLength } from '@/lib/auth/otp-config'
import { verifyEmailOtpWithFallback } from '@/lib/auth/verify-email-otp'
import { LogoIcon } from '@/components/SkillLinkLogo'
import { SixCharPasswordInput } from '@/components/SixCharPasswordInput'
import { OtpDigitInput } from '@/components/OtpDigitInput'
import {
  fetchEmailRegistered,
  getSignupOtpCooldownRemainingMs,
  isSignupOtpSendRateLimitedError,
  recordSignupOtpRateLimitBackoff,
  recordSignupOtpRequest,
  userFacingOtpRateLimitMessage,
} from '@/lib/auth/fetch-email-registered'

/** Prevents a second `signInWithOtp` from touch+click or fast double-tap after the first call finishes. */
const SIGNUP_OTP_NETWORK_DEBOUNCE_MS = 950

function resolveNextPath(raw: string | null): string | null {
  if (!raw) return null
  if (!raw.startsWith('/')) return null
  if (raw.startsWith('//')) return null
  return raw
}

function withOtpThrottleHint(main: string, hint: string) {
  const m = main.trim()
  const h = hint.trim()
  if (!h) return m
  return `${m}\n\n${h}`
}

type SignupSendOtpJson =
  | { ok: true }
  | { ok: false; reason: string; message?: string; status?: number; code?: string }

async function postSignupSendOtp(email: string, next: string | null): Promise<SignupSendOtpJson> {
  const res = await fetch('/api/auth/signup-send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, next: next ?? undefined }),
  })
  try {
    return (await res.json()) as SignupSendOtpJson
  } catch {
    return { ok: false, reason: 'provider', message: 'Invalid response from server.' }
  }
}

function AuthMark() {
  return (
    <div className="mx-auto mb-2 flex justify-center" aria-hidden>
      <LogoIcon size={44} />
    </div>
  )
}

function SignupPageContent() {
  const { t } = useLanguage()
  const S = t.signup
  const loginUi = t.login
  const searchParams = useSearchParams()
  const emailRef = useRef<HTMLInputElement>(null)
  const signupOtpSendInFlightRef = useRef(false)
  const resendOtpInFlightRef = useRef(false)
  const otpLen = getAuthOtpLength()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [resending, setResending] = useState(false)
  const [loading, setLoading] = useState(false)
  const [step1Busy, setStep1Busy] = useState(false)
  const nextPath = resolveNextPath(searchParams.get('next'))

  useEffect(() => {
    if (step === 2) {
      const tid = window.setTimeout(() => document.getElementById('signup-otp')?.focus(), 50)
      return () => window.clearTimeout(tid)
    }
    if (step === 3) {
      const tid = window.setTimeout(() => document.getElementById('signup-password')?.focus(), 50)
      return () => window.clearTimeout(tid)
    }
  }, [step])

  async function redirectAfterAuth(userId: string) {
    const supabase = createClient()
    const { data: profile } = await supabase.from('profiles').select('id').eq('id', userId).maybeSingle()
    window.location.href = profile ? (nextPath ?? '/') : '/onboarding'
  }

  async function sendSignupOtp() {
    setError('')
    const el = emailRef.current
    if (el && !el.checkValidity()) {
      el.reportValidity()
      return
    }

    const normalizedEmail = normalizeEmail(email)
    const emailGuardReason = getEmailGuardReason(normalizedEmail)
    if (emailGuardReason === 'invalid_format') {
      setError(t.signup.invalidEmailFormat ?? 'Please enter a valid email address.')
      return
    }
    if (emailGuardReason === 'blocked_domain') {
      setError(t.signup.invalidEmailDomain ?? 'Please use a real email inbox. Test/disposable domains are blocked.')
      return
    }

    if (signupOtpSendInFlightRef.current) return
    signupOtpSendInFlightRef.current = true
    setStep1Busy(true)
    let reachedOtpNetwork = false
    try {
      const cooldownMs = getSignupOtpCooldownRemainingMs(normalizedEmail)
      if (cooldownMs > 0) {
        const sec = Math.max(1, Math.ceil(cooldownMs / 1000))
        setError(withOtpThrottleHint(S.otpRequestCooldownSeconds(sec), S.otpSendThrottleHint))
        return
      }

      reachedOtpNetwork = true
      const payload = await postSignupSendOtp(normalizedEmail, nextPath)

      if (payload.ok === true) {
        recordSignupOtpRequest(normalizedEmail)
        setEmail(normalizedEmail)
        setOtp('')
        setStep(2)
        return
      }

      if (payload.reason === 'email_blocked') {
        setError(
          t.signup.emailBlocked
            ?? 'This email cannot be used right now due to previous delivery failures. Please use another email or contact support.',
        )
        return
      }
      if (payload.reason === 'already_registered') {
        setError(S.alreadyExists)
        return
      }
      if (payload.reason === 'email_check_failed') {
        setError(
          S.emailCheckUnavailable
            ?? 'We could not verify this email. If you already have an account, use Log in below. Otherwise try again shortly.',
        )
        return
      }
      if (payload.reason === 'invalid_email') {
        setError(t.signup.invalidEmailFormat ?? 'Please enter a valid email address.')
        return
      }
      if (payload.reason === 'blocked_domain') {
        setError(t.signup.invalidEmailDomain ?? 'Please use a real email inbox. Test/disposable domains are blocked.')
        return
      }

      const otpErr = {
        message: payload.message ?? '',
        status: payload.status,
        code: payload.code ?? undefined,
      }
      if (isSignupOtpSendRateLimitedError(otpErr)) {
        recordSignupOtpRateLimitBackoff(normalizedEmail, otpErr)
        const regAgain = await fetchEmailRegistered(normalizedEmail)
        setError(
          regAgain === true
            ? S.alreadyExists
            : withOtpThrottleHint(
                userFacingOtpRateLimitMessage(
                  otpErr.message ?? '',
                  S.tooManyEmailAttempts ?? 'Too many email attempts. Wait a few minutes and try again.',
                ),
                S.otpSendThrottleHint,
              ),
        )
        return
      }
      setError(payload.message || 'Something went wrong. Try again.')
    } finally {
      setStep1Busy(false)
      if (reachedOtpNetwork) {
        window.setTimeout(() => {
          signupOtpSendInFlightRef.current = false
        }, SIGNUP_OTP_NETWORK_DEBOUNCE_MS)
      } else {
        signupOtpSendInFlightRef.current = false
      }
    }
  }

  async function resendSignupOtp() {
    if (!email || resending || resendOtpInFlightRef.current) return
    resendOtpInFlightRef.current = true
    setResending(true)
    setError('')
    let reachedOtpNetwork = false
    try {
      const cooldownMs = getSignupOtpCooldownRemainingMs(email)
      if (cooldownMs > 0) {
        const sec = Math.max(1, Math.ceil(cooldownMs / 1000))
        setError(withOtpThrottleHint(S.otpRequestCooldownSeconds(sec), S.otpSendThrottleHint))
        return
      }

      reachedOtpNetwork = true
      const payload = await postSignupSendOtp(email, nextPath)

      if (payload.ok === true) {
        recordSignupOtpRequest(email)
        return
      }

      if (payload.reason === 'email_blocked') {
        setError(
          t.signup.emailBlocked
            ?? 'This email cannot be used right now due to previous delivery failures. Please use another email or contact support.',
        )
        return
      }
      if (payload.reason === 'already_registered') {
        setError(S.alreadyExists)
        return
      }
      if (payload.reason === 'email_check_failed') {
        setError(
          S.emailCheckUnavailable
            ?? 'We could not verify this email. If you already have an account, use Log in below. Otherwise try again shortly.',
        )
        return
      }

      const otpErr = {
        message: payload.message ?? '',
        status: payload.status,
        code: payload.code ?? undefined,
      }
      if (isSignupOtpSendRateLimitedError(otpErr)) {
        recordSignupOtpRateLimitBackoff(email, otpErr)
        const regAgain = await fetchEmailRegistered(email)
        setError(
          regAgain === true
            ? S.alreadyExists
            : withOtpThrottleHint(
                userFacingOtpRateLimitMessage(
                  otpErr.message ?? '',
                  S.tooManyEmailAttempts ?? 'Too many email attempts. Wait a few minutes and try again.',
                ),
                S.otpSendThrottleHint,
              ),
        )
      } else {
        setError(payload.message || 'Something went wrong. Try again.')
      }
    } finally {
      setResending(false)
      if (reachedOtpNetwork) {
        window.setTimeout(() => {
          resendOtpInFlightRef.current = false
        }, SIGNUP_OTP_NETWORK_DEBOUNCE_MS)
      } else {
        resendOtpInFlightRef.current = false
      }
    }
  }

  async function verifyOtpAndContinue(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const code = otp.replace(/\D/g, '')
    if (code.length !== otpLen) {
      setError(S.otpIncomplete)
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { data, error: vErr } = await verifyEmailOtpWithFallback(supabase, email, code)

    if (vErr || !data?.session?.user) {
      setError(vErr?.message ?? S.invalidOtp)
      setLoading(false)
      return
    }

    setOtp('')
    setPassword('')
    setStep(3)
    setLoading(false)
  }

  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length !== 6) {
      setError(S.passwordMustBeSix)
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error: uErr } = await supabase.auth.updateUser({ password })
    if (uErr) {
      setError(uErr.message)
      setLoading(false)
      return
    }

    const { data: u } = await supabase.auth.getUser()
    const uid = u.user?.id
    if (!uid) {
      setError(S.sessionLost ?? 'Session expired. Please start again.')
      setLoading(false)
      return
    }

    setPassword('')
    await redirectAfterAuth(uid)
  }

  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-[#eef0f3] px-4 py-10 sm:py-14">
      <div
        className="w-full max-w-[420px] rounded-3xl border border-gray-200/80 bg-white px-6 py-8 sm:px-10 sm:py-9"
        style={{ boxShadow: '0 12px 40px rgba(15, 23, 42, 0.08)' }}
      >
        <AuthMark />
        <h1 className="text-center text-xl font-bold leading-tight tracking-tight text-gray-900 sm:text-2xl">{S.title}</h1>
        <div className="mx-auto mt-0.5 max-w-[16.25rem] text-balance sm:max-w-md">
          <p className="text-center text-[11px] leading-snug text-gray-500 sm:text-xs">{S.subtitle}</p>
          {step === 1 ? (
            <p className="mt-1 text-center text-[11px] leading-snug text-gray-600 sm:text-xs">{S.step1Intro}</p>
          ) : null}
          {step === 2 ? (
            <p className="mt-1 text-center text-[11px] leading-snug text-gray-600 sm:text-xs">{S.step2OtpIntro}</p>
          ) : null}
          {step === 3 ? (
            <p className="mt-1 text-center text-[11px] leading-snug text-gray-600 sm:text-xs">{S.step3PasswordIntro}</p>
          ) : null}
        </div>

        {error && (
          <div
            className="mt-3 whitespace-pre-line rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {error}
          </div>
        )}

        {step === 1 ? (
          <div className="mt-3 sm:mt-4">
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <label htmlFor="signup-email" className="text-sm font-semibold text-gray-900">
                {S.email}
              </label>
              <Link href="/forgot-password" className="text-xs font-semibold text-blue-600 hover:underline">
                {loginUi.forgotPassword}
              </Link>
            </div>
            <input
              id="signup-email"
              ref={emailRef}
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={S.placeholder.email}
              className="w-full rounded-xl border border-gray-200 bg-[#f0f7ff]/60 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
            <button
              type="button"
              disabled={step1Busy}
              onClick={() => void sendSignupOtp()}
              className={`mt-5 w-full rounded-full bg-gray-900 py-3.5 text-sm font-bold text-white transition hover:bg-gray-800 active:scale-[0.99] ${step1Busy ? 'opacity-60' : ''}`}
            >
              {step1Busy ? S.verifying : S.continue}
            </button>
          </div>
        ) : null}

        {step === 2 ? (
          <form onSubmit={verifyOtpAndContinue} className="mt-3 sm:mt-4">
            <p className="text-center text-xs font-medium text-gray-900 sm:text-sm">{S.creatingFor(email)}</p>
            <button
              type="button"
              onClick={() => {
                setStep(1)
                setOtp('')
                setError('')
              }}
              className="mt-3 w-full text-center text-sm font-medium text-blue-600 underline decoration-blue-600/30 underline-offset-2 hover:text-blue-700"
            >
              {S.changeEmail}
            </button>

            <div className="mt-5">
              <p className="mb-2 block text-center text-sm font-semibold text-gray-900">{S.otpLabel}</p>
              <OtpDigitInput
                id="signup-otp"
                length={otpLen}
                value={otp}
                onChange={setOtp}
                disabled={loading}
                groupAriaLabel={S.otpAria}
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.replace(/\D/g, '').length !== otpLen}
              className={`mt-6 w-full rounded-full py-3.5 text-sm font-bold text-white transition active:scale-[0.99] ${loading || otp.replace(/\D/g, '').length !== otpLen ? 'opacity-60' : 'hover:opacity-95'}`}
              style={{ background: 'linear-gradient(90deg,#111827,#1f2937)' }}
            >
              {loading ? S.verifyingOtp : S.continue}
            </button>

            <p className="mt-4 text-center text-[11px] text-gray-500 sm:text-xs">{S.otpResendHint}</p>
            <button
              type="button"
              onClick={() => void resendSignupOtp()}
              disabled={resending}
              className="mt-1 w-full text-center text-sm font-semibold text-blue-600 underline decoration-blue-600/30 underline-offset-2 disabled:opacity-60"
            >
              {resending ? S.resendingOtp : S.resendOtp}
            </button>
          </form>
        ) : null}

        {step === 3 ? (
          <form onSubmit={e => void handleSetPassword(e)} className="mt-2">
            <p className="text-center text-xs font-medium text-gray-900 sm:text-sm">{S.creatingFor(email)}</p>
            <button
              type="button"
              onClick={() => void (async () => {
                const supabase = createClient()
                await supabase.auth.signOut()
                setStep(1)
                setPassword('')
                setOtp('')
                setError('')
              })()}
              className="mt-3 w-full text-center text-sm font-medium text-blue-600 underline decoration-blue-600/30 underline-offset-2 hover:text-blue-700"
            >
              {S.startOver}
            </button>

            <div className="mt-5">
              <p className="mb-2 block text-center text-sm font-semibold text-gray-900">{S.password}</p>
              <SixCharPasswordInput
                id="signup-password"
                value={password}
                onChange={setPassword}
                disabled={loading}
                autoComplete="new-password"
                groupAriaLabel={S.passwordBoxesAria}
              />
            </div>

            <button
              type="submit"
              disabled={loading || password.length !== 6}
              className={`mt-8 w-full rounded-full py-3.5 text-sm font-bold text-white transition active:scale-[0.99] ${loading || password.length !== 6 ? 'opacity-60' : 'hover:opacity-95'}`}
              style={{ background: 'linear-gradient(90deg,#111827,#1f2937)' }}
            >
              {loading ? S.submitting : S.submit}
            </button>
          </form>
        ) : null}

        <p className="mt-6 text-center text-xs text-gray-600 sm:text-sm">
          {S.hasAccount}{' '}
          <Link
            href={nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : '/login'}
            className="font-semibold text-blue-600 underline decoration-blue-600/30 underline-offset-2 hover:text-blue-700"
          >
            {S.login}
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-full flex flex-1 items-center justify-center bg-[#eef0f3] px-4 py-10" />}>
      <SignupPageContent />
    </Suspense>
  )
}
