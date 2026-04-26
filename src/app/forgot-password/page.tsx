'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getEmailGuardReason, normalizeEmail } from '@/lib/email-guard'
import { useLanguage } from '@/context/LanguageContext'
import { fetchEmailRegistered } from '@/lib/auth/fetch-email-registered'

export default function ForgotPasswordPage() {
  const { t } = useLanguage()
  const L = t.login
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [noAccount, setNoAccount] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setNoAccount(false)
    setLoading(true)
    const normalizedEmail = normalizeEmail(email)
    const emailGuardReason = getEmailGuardReason(normalizedEmail)
    if (emailGuardReason === 'invalid_format') {
      setError('Please enter a valid email address.')
      setLoading(false)
      return
    }
    if (emailGuardReason === 'blocked_domain') {
      setError('Please use a real email inbox. Test/disposable domains are blocked.')
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
        setError('This email is temporarily blocked due to previous delivery failures. Please contact support.')
        setLoading(false)
        return
      }
    }

    const registered = await fetchEmailRegistered(normalizedEmail)
    if (registered === false) {
      setNoAccount(true)
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    })

    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">

        {sent ? (
          /* ── Success state ── */
          <div className="text-center">
            <div className="h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: 'linear-gradient(135deg,#F0FDF4,#BBF7D0)' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </div>
            <h2 className="text-xl font-extrabold text-gray-900 mb-2">Check your email</h2>
            <p className="text-sm text-gray-500 mb-1">
              We sent a password reset link to
            </p>
            <p className="text-sm font-semibold text-gray-800 mb-6">{email}</p>
            <p className="text-xs text-gray-400 mb-2">
              Didn&apos;t get it? Check your spam folder or{' '}
              <button onClick={() => setSent(false)} className="text-blue-600 font-semibold hover:underline">
                try again
              </button>
            </p>
            <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 mb-4 text-left">
              <p className="text-xs font-semibold text-amber-700 mb-1">Note</p>
              <p className="text-xs text-amber-600">
                Email delivery requires SMTP to be configured in Supabase. If you don&apos;t receive the email within a few minutes, ask the site admin to reset your password manually.
              </p>
            </div>
            <Link href="/login"
              className="block w-full rounded-xl py-3 text-sm font-bold text-center border-2 border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors">
              ← Back to login
            </Link>
          </div>
        ) : (
          /* ── Form state ── */
          <>
            <div className="mb-6">
              <div className="h-12 w-12 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: 'linear-gradient(135deg,#EFF6FF,#BFDBFE)' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Forgot your password?</h1>
              <p className="text-sm text-gray-500">
                Enter your email and we&apos;ll send you a link to reset it.
              </p>
            </div>

            {noAccount && (
              <div
                className="mb-4 flex gap-2.5 rounded-xl border border-red-200 bg-red-50/95 px-4 py-3 text-sm text-red-900"
                role="alert"
              >
                <span
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-200 text-xs font-bold text-red-800"
                  aria-hidden
                >
                  !
                </span>
                <p className="min-w-0 leading-snug">
                  {L.accountNotFoundIntro}{' '}
                  <Link
                    href="/signup"
                    className="font-semibold text-blue-700 underline decoration-blue-600/40 underline-offset-2 hover:text-blue-900"
                  >
                    {L.accountNotFoundLink}
                  </Link>
                  .
                </p>
              </div>
            )}

            {error && !noAccount && (
              <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">Email address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value)
                    setNoAccount(false)
                  }}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: 'linear-gradient(90deg,#2563EB,#38BDF8)' }}
              >
                {loading ? 'Sending...' : 'Send reset link'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Remember your password?{' '}
              <Link href="/login" className="font-semibold text-blue-600 hover:underline">
                Log in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
