'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Role = 'helper' | 'poster'

const CATEGORIES = [
  { key: 'Cleaning',   icon: '🧹' },
  { key: 'Moving',     icon: '📦' },
  { key: 'Tutoring',   icon: '📚' },
  { key: 'Delivery',   icon: '🚚' },
  { key: 'Handyman',   icon: '🔧' },
  { key: 'Events',     icon: '🎉' },
  { key: 'IT & Tech',  icon: '💻' },
  { key: 'Gardening',  icon: '🌿' },
]

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="w-full bg-gray-100 rounded-full h-2">
      <div
        className="h-2 rounded-full transition-all duration-500"
        style={{ width: `${value}%`, background: 'linear-gradient(90deg,#2563EB,#38BDF8)' }}
      />
    </div>
  )
}

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="h-2 rounded-full transition-all duration-300"
          style={{
            width: i + 1 === current ? 24 : 8,
            background: i + 1 <= current ? '#2563EB' : '#E5E7EB',
          }} />
      ))}
    </div>
  )
}

export default function OnboardingForm({ userId, userEmail }: { userId: string; userEmail: string }) {
  const defaultName = userEmail.split('@')[0]

  const [step, setStep] = useState(1)
  const [role, setRole] = useState<Role | null>(null)
  const [displayName, setDisplayName] = useState(defaultName)
  const [bio, setBio] = useState('')
  const [hourlyRate, setHourlyRate] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [location, setLocation] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const completion = role === 'helper'
    ? [displayName.trim(), bio.trim(), location.trim(), hourlyRate, categories.length > 0 ? 'y' : '']
        .filter(Boolean).length * 20
    : 100

  function toggleCategory(cat: string) {
    setCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])
  }

  async function saveProfile(r: Role, extra: Record<string, unknown> = {}) {
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: err } = await supabase.from('profiles').upsert({
      id: userId,
      role: r,
      display_name: displayName.trim() || defaultName,
      ...extra,
    })
    setLoading(false)
    if (err) { setError(err.message); return false }
    return true
  }

  async function handleRoleSelect(r: Role) {
    setRole(r)
    if (r === 'poster') {
      const ok = await saveProfile(r)
      if (ok) setStep(3)
    } else {
      setStep(2)
    }
  }

  async function handleHelperSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (categories.length === 0) { setError('Please select at least one service category.'); return }
    const ok = await saveProfile('helper', {
      bio: bio.trim(),
      hourly_rate: hourlyRate ? Number(hourlyRate) : null,
      categories,
      location: location.trim(),
    })
    if (ok) setStep(3)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: 'linear-gradient(135deg,#EFF6FF 0%,#F0F9FF 50%,#F0FDF4 100%)' }}>

      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="text-center mb-8">
          <p className="text-2xl font-extrabold" style={{ color: '#1E3A8A' }}>
            SKILL<span style={{ color: '#38BDF8' }}>LINK</span>
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">

          {/* ── STEP 1: Choose role ─────────────────────────────────────── */}
          {step === 1 && (
            <div className="p-8">
              <div className="text-center mb-8">
                <StepDots current={1} total={2} />
                <h1 className="text-2xl font-extrabold text-gray-900 mt-4 mb-2">
                  Welcome to SkillLink!
                </h1>
                <p className="text-gray-500 text-sm">How are you planning to use SkillLink?</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Poster card */}
                <button onClick={() => handleRoleSelect('poster')} disabled={loading}
                  className="group flex flex-col items-center text-center rounded-2xl border-2 border-gray-200 p-6 hover:border-blue-400 hover:shadow-lg transition-all duration-200 disabled:opacity-50">
                  <div className="h-16 w-16 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: 'linear-gradient(135deg,#EFF6FF,#BFDBFE)' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="7" width="20" height="14" rx="2"/>
                      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                    </svg>
                  </div>
                  <h3 className="font-extrabold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                    I need help
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Post tasks and hire local helpers for jobs around you
                  </p>
                </button>

                {/* Helper card */}
                <button onClick={() => handleRoleSelect('helper')} disabled={loading}
                  className="group flex flex-col items-center text-center rounded-2xl border-2 border-gray-200 p-6 hover:border-blue-400 hover:shadow-lg transition-all duration-200 disabled:opacity-50">
                  <div className="h-16 w-16 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: 'linear-gradient(135deg,#F0FDF4,#BBF7D0)' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  </div>
                  <h3 className="font-extrabold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                    I can help
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Offer your skills and earn money doing local tasks
                  </p>
                </button>
              </div>

              {loading && (
                <p className="text-center text-sm text-gray-400 mt-4">Setting up your account...</p>
              )}
              {error && (
                <p className="text-center text-sm text-red-500 mt-4">{error}</p>
              )}
            </div>
          )}

          {/* ── STEP 2: Helper profile form ─────────────────────────────── */}
          {step === 2 && (
            <form onSubmit={handleHelperSubmit}>
              {/* Progress header */}
              <div className="px-8 pt-8 pb-4">
                <div className="flex items-center justify-between mb-3">
                  <StepDots current={2} total={2} />
                  <span className="text-xs font-semibold text-gray-400">Profile {completion}% complete</span>
                </div>
                <ProgressBar value={completion} />
                <h2 className="text-xl font-extrabold text-gray-900 mt-5 mb-1">Set up your helper profile</h2>
                <p className="text-sm text-gray-500">This is what clients will see when they find you</p>
              </div>

              <div className="px-8 pb-8 flex flex-col gap-5">
                {/* Display name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Your name <span className="text-red-400">*</span>
                  </label>
                  <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} required
                    placeholder="e.g. Maria K."
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition" />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    About you <span className="text-red-400">*</span>
                  </label>
                  <textarea rows={3} value={bio} onChange={e => setBio(e.target.value)} required
                    placeholder="Describe your experience, skills, and what makes you great at this..."
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition resize-none" />
                </div>

                {/* Categories */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    What services do you offer? <span className="text-red-400">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {CATEGORIES.map(({ key, icon }) => {
                      const selected = categories.includes(key)
                      return (
                        <button key={key} type="button" onClick={() => toggleCategory(key)}
                          className="flex flex-col items-center gap-1.5 rounded-xl border-2 px-3 py-3 text-xs font-semibold transition-all"
                          style={selected
                            ? { borderColor: '#2563EB', background: '#EFF6FF', color: '#1E3A8A' }
                            : { borderColor: '#E5E7EB', background: '#fff', color: '#374151' }}>
                          <span className="text-xl">{icon}</span>
                          {key}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Location + Rate */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Location <span className="text-red-400">*</span>
                    </label>
                    <input type="text" value={location} onChange={e => setLocation(e.target.value)} required
                      placeholder="e.g. Oslo"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Hourly rate (NOK)
                    </label>
                    <input type="number" min="0" value={hourlyRate} onChange={e => setHourlyRate(e.target.value)}
                      placeholder="e.g. 350"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition" />
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{error}</p>
                )}

                <button type="submit" disabled={loading}
                  className="w-full rounded-xl py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ background: 'linear-gradient(90deg,#2563EB,#38BDF8)' }}>
                  {loading ? 'Saving profile...' : 'Complete profile →'}
                </button>

                <button type="button" onClick={() => setStep(1)}
                  className="text-center text-sm text-gray-400 hover:text-gray-600 transition-colors">
                  ← Go back
                </button>
              </div>
            </form>
          )}

          {/* ── STEP 3: Success ─────────────────────────────────────────── */}
          {step === 3 && (
            <div className="p-8 text-center">
              {/* Success icon */}
              <div className="h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: 'linear-gradient(135deg,#F0FDF4,#BBF7D0)' }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>

              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">You&apos;re all set!</h2>
              <p className="text-gray-500 text-sm mb-6">
                {role === 'helper'
                  ? 'Your helper profile is live. Clients can now find and book you.'
                  : 'Your account is ready. Start posting tasks and find help near you.'}
              </p>

              {/* Profile completion (helpers only) */}
              {role === 'helper' && (
                <div className="bg-gray-50 rounded-2xl p-5 mb-6 text-left">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-gray-700">Profile strength</span>
                    <span className="text-sm font-extrabold" style={{ color: '#2563EB' }}>{completion}%</span>
                  </div>
                  <ProgressBar value={completion} />
                  {completion < 100 && (
                    <p className="text-xs text-gray-400 mt-2">
                      Complete all fields to get more bookings and appear higher in search results.
                    </p>
                  )}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-col gap-3">
                <a href="/dashboard"
                  className="block w-full rounded-xl py-3.5 text-sm font-bold text-white text-center transition-opacity hover:opacity-90"
                  style={{ background: 'linear-gradient(90deg,#2563EB,#38BDF8)' }}>
                  {role === 'helper' ? 'Go to my dashboard →' : 'Browse helpers →'}
                </a>
                {role === 'poster' && (
                  <a href="/post"
                    className="block w-full rounded-xl py-3 text-sm font-bold text-blue-600 border-2 border-blue-200 text-center hover:bg-blue-50 transition-colors">
                    Post your first task
                  </a>
                )}
                {role === 'helper' && (
                  <a href="/taskers"
                    className="block w-full rounded-xl py-3 text-sm font-semibold text-gray-500 text-center hover:text-gray-700 transition-colors">
                    See how you appear to clients →
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          You can update all of this later from your profile settings.
        </p>
      </div>
    </div>
  )
}
