'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
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

            {error && (
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
                  onChange={e => setEmail(e.target.value)}
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
