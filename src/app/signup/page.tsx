'use client'

import { Suspense, useState } from 'react'
import HCaptcha from '@hcaptcha/react-hcaptcha'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import { getEmailGuardReason, normalizeEmail } from '@/lib/email-guard'

function resolveNextPath(raw: string | null): string | null {
  if (!raw) return null
  if (!raw.startsWith('/')) return null
  if (raw.startsWith('//')) return null
  return raw
}

function isAlreadyRegisteredResponse(data: { user: { identities?: unknown[] } | null }) {
  const identities = data.user?.identities
  return Boolean(data.user && Array.isArray(identities) && identities.length === 0)
}

function SignupPageContent() {
  const router = useRouter()
  const { t } = useLanguage()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [pendingEmail, setPendingEmail] = useState('')
  const [resending, setResending] = useState(false)
  const [captchaToken, setCaptchaToken] = useState('')
  const [loading, setLoading] = useState(false)
  const nextPath = resolveNextPath(searchParams.get('next'))
  const hcaptchaSiteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY?.trim() ?? ''
  const captchaEnabled = hcaptchaSiteKey.length > 0

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setPendingEmail('')
    setLoading(true)

    const normalizedEmail = normalizeEmail(email)
    const emailGuardReason = getEmailGuardReason(normalizedEmail)
    if (emailGuardReason === 'invalid_format') {
      setError(t.signup.invalidEmailFormat ?? 'Please enter a valid email address.')
      setLoading(false)
      return
    }
    if (emailGuardReason === 'blocked_domain') {
      setError(t.signup.invalidEmailDomain ?? 'Please use a real email inbox. Test/disposable domains are blocked.')
      setLoading(false)
      return
    }
    const eligibilityRes = await fetch('/api/auth/email-eligibility', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normalizedEmail }),
    })
    if (eligibilityRes.ok) {
      const eligibility = (await eligibilityRes.json()) as { blocked?: boolean }
      if (eligibility.blocked) {
        setError(
          t.signup.emailBlocked
            ?? 'This email cannot be used right now due to previous delivery failures. Please use another email or contact support.'
        )
        setLoading(false)
        return
      }
    }
    if (captchaEnabled && !captchaToken) {
      setError(t.signup.captchaRequired ?? 'Please complete captcha verification.')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const callbackUrl = new URL('/auth/callback', window.location.origin)
    if (nextPath) callbackUrl.searchParams.set('next', nextPath)
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        emailRedirectTo: callbackUrl.toString(),
          captchaToken: captchaEnabled ? captchaToken : undefined,
      },
    })

    if (error) {
      const lower = error.message.toLowerCase()
      if (lower.includes('already') && (lower.includes('registered') || lower.includes('exists'))) {
        setError(t.signup.alreadyExists ?? 'An account with this email already exists. Please log in.')
      } else {
        setError(error.message)
      }
    } else {
      if (isAlreadyRegisteredResponse(data)) {
        setError(t.signup.alreadyExists ?? 'An account with this email already exists. Please log in.')
      } else if (data.session) {
        setSuccess(t.signup.successSignedIn ?? 'Account created and signed in.')
        router.replace(nextPath ?? '/onboarding')
        router.refresh()
      } else {
        setPendingEmail(normalizedEmail)
        if (!data.user?.confirmation_sent_at) {
          setError(
            t.signup.emailDeliveryIssue
              ?? 'Account created, but confirmation email was not queued. Please check Supabase email settings (SMTP, Site URL, Redirect URLs).'
          )
        } else {
          setSuccess(t.signup.success)
        }
      }
      setPassword('')
    }
    setLoading(false)
  }

  async function handleResend() {
    if (!pendingEmail || resending) return
    setResending(true)
    setError('')
    const supabase = createClient()
    const callbackUrl = new URL('/auth/callback', window.location.origin)
    if (nextPath) callbackUrl.searchParams.set('next', nextPath)
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: pendingEmail,
      options: { emailRedirectTo: callbackUrl.toString() },
    })
    if (error) {
      setError(error.message)
    } else {
      setSuccess(t.signup.resendSent ?? 'Confirmation email sent again. Please check your inbox and spam folder.')
    }
    setResending(false)
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-1 text-2xl font-bold text-gray-900">{t.signup.title}</h1>
        <p className="mb-6 text-sm text-gray-500">{t.signup.subtitle}</p>
        {!captchaEnabled && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
            hCaptcha is not configured. Set `NEXT_PUBLIC_HCAPTCHA_SITE_KEY` to enable bot protection.
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
            <p>{success}</p>
            {pendingEmail && (
              <div className="mt-2">
                <p className="text-xs text-green-800/80">{t.signup.resendHelp ?? 'If no email arrives in 1-2 minutes, click resend.'}</p>
                <button
                  type="button"
                  onClick={() => void handleResend()}
                  disabled={resending}
                  className="mt-2 text-xs font-semibold text-green-900 underline disabled:opacity-60"
                >
                  {resending ? (t.signup.resending ?? 'Resending…') : (t.signup.resend ?? 'Resend confirmation email')}
                </button>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">{t.signup.email}</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={t.signup.placeholder.email}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">{t.signup.password}</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={t.signup.placeholder.password}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`btn-primary w-full py-3 ${loading ? 'opacity-60' : ''}`}
          >
            {loading ? t.signup.submitting : t.signup.submit}
          </button>
          {captchaEnabled && (
            <div className="pt-1">
              <HCaptcha
                sitekey={hcaptchaSiteKey}
                onVerify={token => setCaptchaToken(token)}
                onExpire={() => setCaptchaToken('')}
                onError={() => setError(t.signup.captchaError ?? 'Captcha verification failed. Please try again.')}
              />
            </div>
          )}
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          {t.signup.hasAccount}{' '}
          <Link href={nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : '/login'} className="font-semibold text-blue-600 hover:underline">
            {t.signup.login}
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="flex flex-1 items-center justify-center bg-gray-50 px-4 py-10" />}>
      <SignupPageContent />
    </Suspense>
  )
}
