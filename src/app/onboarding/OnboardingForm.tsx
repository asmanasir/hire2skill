'use client'

import React from 'react'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/context/LanguageContext'

type Role = 'helper' | 'poster'

const CATEGORIES: { key: string; icon: React.ReactNode; bg: string; color: string }[] = [
  { key: 'Cleaning',   bg: '#F0FDF4', color: '#16A34A', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z"/></svg> },
  { key: 'Moving',     bg: '#EFF6FF', color: '#2563EB', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> },
  { key: 'Tutoring',   bg: '#FFFBEB', color: '#D97706', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg> },
  { key: 'Delivery',   bg: '#FFF7ED', color: '#EA580C', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg> },
  { key: 'Handyman',   bg: '#F5F3FF', color: '#7C3AED', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg> },
  { key: 'Events',     bg: '#FFF1F2', color: '#E11D48', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E11D48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect width="20" height="5" x="2" y="7"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg> },
  { key: 'IT & Tech',  bg: '#F0F9FF', color: '#0284C7', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg> },
  { key: 'Gardening',  bg: '#F0FDF4', color: '#15803D', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22V12M12 12C12 7 8 4 3 5c0 5 3 9 9 7M12 12c0-5 4-8 9-7-1 5-4 9-9 7"/></svg> },
  { key: 'Pet Care',   bg: '#FFF7ED', color: '#F97316', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="7.5" cy="5.5" r="1.8"/><circle cx="16.5" cy="5.5" r="1.8"/><circle cx="4.5" cy="11" r="1.8"/><circle cx="19.5" cy="11" r="1.8"/><path d="M12 21c-3.5 0-6-2-6-5 0-1.5.5-2.8 2-4h8c1.5 1.2 2 2.5 2 4 0 3-2.5 5-6 5z"/></svg> },
  { key: 'Cooking',    bg: '#FEF2F2', color: '#DC2626', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3z"/><path d="M21 15v7"/></svg> },
  { key: 'Shopping',   bg: '#F5F3FF', color: '#8B5CF6', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg> },
  { key: 'Knitting',   bg: '#FDF4FF', color: '#C026D3', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C026D3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="14" r="6"/><path d="M8 8L4 2"/><path d="M16 8L20 2"/><path d="M6 14Q9 11 12 14Q15 17 18 14"/></svg> },
  { key: 'Sewing',     bg: '#ECFEFF', color: '#0891B2', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0891B2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg> },
  { key: 'Kids Care',  bg: '#FEFCE8', color: '#CA8A04', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CA8A04" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><circle cx="9" cy="9" r="1" fill="#CA8A04"/><circle cx="15" cy="9" r="1" fill="#CA8A04"/></svg> },
  { key: 'Car Wash',   bg: '#F0F9FF', color: '#0EA5E9', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14L7 8h10l3 6H4z"/><line x1="3" y1="14" x2="21" y2="14"/><circle cx="7.5" cy="18" r="2"/><circle cx="16.5" cy="18" r="2"/><path d="M8 3v3M12 2v3M16 3v3"/></svg> },
  { key: 'Painting',      bg: '#EEF2FF', color: '#4F46E5', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="7" rx="2"/><path d="M12 10v5"/><path d="M9 15h6"/><path d="M9 15v6M15 15v6"/></svg> },
  { key: 'Makeup Artist', bg: '#FDF2F8', color: '#DB2777', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DB2777" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 20V9l2-5 2 5v11H10z"/><path d="M8 20h8"/><path d="M10 13h4"/></svg> },
  { key: 'Hair Dresser',  bg: '#F3E8FF', color: '#7E22CE', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7E22CE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="5" rx="2"/><path d="M6 8v11M10 8v11M14 8v11M18 8v11"/><path d="M3 19h18"/></svg> },
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
  const { t } = useLanguage()
  const o = t.onboarding

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
    if (categories.length === 0) { setError(o.selectCategory); return }
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
                <h1 className="text-2xl font-extrabold text-gray-900 mt-4 mb-2">{o.welcome}</h1>
                <p className="text-gray-500 text-sm">{o.subtitle}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Poster card */}
                <button onClick={() => handleRoleSelect('poster')} disabled={loading}
                  className="group flex flex-col items-center text-center rounded-2xl border-2 border-gray-200 p-6 hover:border-blue-500 hover:shadow-xl transition-all duration-200 disabled:opacity-50">
                  <div className="h-20 w-20 rounded-2xl flex items-center justify-center mb-5 shadow-sm"
                    style={{ background: 'linear-gradient(135deg,#DBEAFE,#93C5FD)' }}>
                    {/* Clipboard with task list — "I need help posting tasks" */}
                    <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#1D4ED8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                      <rect x="9" y="3" width="6" height="4" rx="1"/>
                      <path d="m9 14 2 2 4-4"/>
                      <path d="M9 10h6"/>
                    </svg>
                  </div>
                  <h3 className="font-extrabold text-gray-900 text-base mb-1.5 group-hover:text-blue-600 transition-colors">
                    {o.posterTitle}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{o.posterDesc}</p>
                </button>

                {/* Helper card */}
                <button onClick={() => handleRoleSelect('helper')} disabled={loading}
                  className="group flex flex-col items-center text-center rounded-2xl border-2 border-gray-200 p-6 hover:border-green-500 hover:shadow-xl transition-all duration-200 disabled:opacity-50">
                  <div className="h-20 w-20 rounded-2xl flex items-center justify-center mb-5 shadow-sm"
                    style={{ background: 'linear-gradient(135deg,#DCFCE7,#86EFAC)' }}>
                    {/* Person with award medal — "I can help, I have skills" */}
                    <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="8" r="6"/>
                      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
                    </svg>
                  </div>
                  <h3 className="font-extrabold text-gray-900 text-base mb-1.5 group-hover:text-green-600 transition-colors">
                    {o.helperTitle}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{o.helperDesc}</p>
                </button>
              </div>

              {loading && (
                <p className="text-center text-sm text-gray-400 mt-4">{o.settingUp}</p>
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
                <h2 className="text-xl font-extrabold text-gray-900 mt-5 mb-1">{o.setupTitle}</h2>
                <p className="text-sm text-gray-500">{o.setupSub}</p>
              </div>

              <div className="px-8 pb-8 flex flex-col gap-5">
                {/* Display name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    {o.nameLabel} <span className="text-red-400">*</span>
                  </label>
                  <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} required
                    placeholder="e.g. Maria K."
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition" />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    {o.aboutLabel} <span className="text-red-400">*</span>
                  </label>
                  <textarea rows={3} value={bio} onChange={e => setBio(e.target.value)} required
                    placeholder="Describe your experience, skills, and what makes you great at this..."
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition resize-none" />
                </div>

                {/* Categories */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {o.servicesLabel} <span className="text-red-400">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {CATEGORIES.map(({ key, icon, bg, color }) => {
                      const selected = categories.includes(key)
                      return (
                        <button key={key} type="button" onClick={() => toggleCategory(key)}
                          className="flex flex-col items-center gap-2 rounded-xl border-2 px-3 py-3 text-xs font-semibold transition-all"
                          style={selected
                            ? { borderColor: color, background: bg, color }
                            : { borderColor: '#E5E7EB', background: '#fff', color: '#374151' }}>
                          <span className="flex items-center justify-center w-8 h-8 rounded-lg"
                            style={{ background: selected ? bg : '#F9FAFB' }}>
                            {icon}
                          </span>
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
                      {o.locationLabel} <span className="text-red-400">*</span>
                    </label>
                    <input type="text" value={location} onChange={e => setLocation(e.target.value)} required
                      placeholder="e.g. Oslo"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      {o.rateLabel}
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
                  {loading ? o.saving : o.completeBtn}
                </button>

                <button type="button" onClick={() => setStep(1)}
                  className="text-center text-sm text-gray-400 hover:text-gray-600 transition-colors">
                  {o.goBack}
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

              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">{o.allSet}</h2>
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
