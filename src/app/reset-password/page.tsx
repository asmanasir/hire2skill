'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      setDone(true)
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">

        {done ? (
          /* ── Success state ── */
          <div className="text-center">
            <div className="h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: 'linear-gradient(135deg,#F0FDF4,#BBF7D0)' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h2 className="text-xl font-extrabold text-gray-900 mb-2">Password updated!</h2>
            <p className="text-sm text-gray-500 mb-6">
              Your password has been changed successfully. You can now log in with your new password.
            </p>
            <a href="/login"
              className="block w-full rounded-xl py-3 text-sm font-bold text-white text-center transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(90deg,#2563EB,#38BDF8)' }}>
              Go to login →
            </a>
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
              <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Set new password</h1>
              <p className="text-sm text-gray-500">Choose a strong password for your account.</p>
            </div>

            {error && (
              <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">New password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">Confirm password</label>
                <input
                  type="password"
                  required
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Repeat your new password"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>

              {/* Password strength hint */}
              {password.length > 0 && (
                <div className="flex items-center gap-2">
                  {[4, 7, 10].map((threshold, i) => (
                    <div key={i} className="flex-1 h-1.5 rounded-full transition-colors"
                      style={{ background: password.length >= threshold
                        ? i === 0 ? '#EF4444' : i === 1 ? '#F59E0B' : '#16A34A'
                        : '#E5E7EB' }} />
                  ))}
                  <span className="text-xs text-gray-400 shrink-0">
                    {password.length < 4 ? 'Weak' : password.length < 7 ? 'Fair' : password.length < 10 ? 'Good' : 'Strong'}
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: 'linear-gradient(90deg,#2563EB,#38BDF8)' }}
              >
                {loading ? 'Updating...' : 'Update password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
