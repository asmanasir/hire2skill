'use client'

import React from 'react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'

type Tasker = {
  id: string
  display_name: string
  bio: string
  hourly_rate: number
  categories: string[]
  location: string
  verified: boolean
  tasks_done: number
  rating: number
  response_hours: number
  avatar_url?: string | null
}

const CATEGORIES = [
  'All', 'Cleaning', 'Moving', 'Tutoring', 'Delivery', 'Handyman', 'Events',
  'IT & Tech', 'Gardening', 'Pet Care', 'Cooking', 'Shopping', 'Knitting',
  'Sewing', 'Kids Care', 'Car Wash', 'Painting', 'Makeup Artist', 'Hair Dresser',
]

const CAT_ICONS: Record<string, { bg: string; color: string; icon: React.ReactNode }> = {
  Cleaning:   { bg: '#F0FDF4', color: '#16A34A', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z"/></svg> },
  Moving:     { bg: '#EFF6FF', color: '#2563EB', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> },
  Tutoring:   { bg: '#FFFBEB', color: '#D97706', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg> },
  Delivery:   { bg: '#FFF7ED', color: '#EA580C', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EA580C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg> },
  Handyman:   { bg: '#F5F3FF', color: '#7C3AED', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg> },
  Events:     { bg: '#FFF1F2', color: '#E11D48', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E11D48" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect width="20" height="5" x="2" y="7"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg> },
  'IT & Tech':{ bg: '#F0F9FF', color: '#0284C7', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg> },
  Gardening:  { bg: '#F0FDF4', color: '#15803D', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22V12M12 12C12 7 8 4 3 5c0 5 3 9 9 7M12 12c0-5 4-8 9-7-1 5-4 9-9 7"/></svg> },
  'Pet Care': { bg: '#FFF7ED', color: '#F97316', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="7.5" cy="5.5" r="1.8"/><circle cx="16.5" cy="5.5" r="1.8"/><circle cx="4.5" cy="11" r="1.8"/><circle cx="19.5" cy="11" r="1.8"/><path d="M12 21c-3.5 0-6-2-6-5 0-1.5.5-2.8 2-4h8c1.5 1.2 2 2.5 2 4 0 3-2.5 5-6 5z"/></svg> },
  Cooking:    { bg: '#FEF2F2', color: '#DC2626', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3z"/><path d="M21 15v7"/></svg> },
  Shopping:   { bg: '#F5F3FF', color: '#8B5CF6', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg> },
  Knitting:   { bg: '#FDF4FF', color: '#C026D3', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C026D3" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="14" r="6"/><path d="M8 8L4 2"/><path d="M16 8L20 2"/><path d="M6 14Q9 11 12 14Q15 17 18 14"/></svg> },
  Sewing:     { bg: '#ECFEFF', color: '#0891B2', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0891B2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg> },
  'Kids Care':{ bg: '#FEFCE8', color: '#CA8A04', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#CA8A04" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><circle cx="9" cy="9" r="1" fill="#CA8A04"/><circle cx="15" cy="9" r="1" fill="#CA8A04"/></svg> },
  'Car Wash': { bg: '#F0F9FF', color: '#0EA5E9', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0EA5E9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14L7 8h10l3 6H4z"/><line x1="3" y1="14" x2="21" y2="14"/><circle cx="7.5" cy="18" r="2"/><circle cx="16.5" cy="18" r="2"/><path d="M8 3v3M12 2v3M16 3v3"/></svg> },
  Painting:       { bg: '#EEF2FF', color: '#4F46E5', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="7" rx="2"/><path d="M12 10v5"/><path d="M9 15h6"/><path d="M9 15v6M15 15v6"/></svg> },
  'Makeup Artist':{ bg: '#FDF2F8', color: '#DB2777', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DB2777" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 20V9l2-5 2 5v11H10z"/><path d="M8 20h8"/><path d="M10 13h4"/></svg> },
  'Hair Dresser':  { bg: '#F3E8FF', color: '#7E22CE', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7E22CE" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="5" rx="2"/><path d="M6 8v11M10 8v11M14 8v11M18 8v11"/><path d="M3 19h18"/></svg> },
}

const AVATAR_COLORS = ['#2563EB', '#16A34A', '#7C3AED', '#D97706', '#E11D48', '#0284C7', '#EA580C', '#0F766E']

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill={i <= Math.round(rating) ? '#F59E0B' : '#E5E7EB'}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      <span className="ml-1 text-xs font-bold text-gray-700">{rating.toFixed(1)}</span>
    </span>
  )
}

function TaskerCard({ tasker, index, bookLabel }: { tasker: Tasker; index: number; bookLabel: string }) {
  const initials = tasker.display_name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('')
  const color = AVATAR_COLORS[index % AVATAR_COLORS.length]

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-blue-400 hover:shadow-xl transition-all duration-200 flex flex-col">
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        {tasker.avatar_url ? (
          <img src={tasker.avatar_url} alt={tasker.display_name} className="h-16 w-16 rounded-2xl object-cover shrink-0" />
        ) : (
          <div className="h-16 w-16 rounded-2xl flex items-center justify-center shrink-0 text-white font-bold text-lg shadow-sm"
            style={{ background: color }}>
            {initials}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-extrabold text-gray-900 text-base">{tasker.display_name}</h3>
            {tasker.verified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700 border border-green-100">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Verified
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 mt-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span className="text-xs text-gray-400">{tasker.location}</span>
          </div>
          <div className="mt-1.5">
            <Stars rating={tasker.rating} />
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xl font-extrabold text-gray-900">{tasker.hourly_rate} NOK</p>
          <p className="text-xs text-gray-400">per hour</p>
        </div>
      </div>

      {/* Bio */}
      <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-2">{tasker.bio}</p>

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
        <span className="flex items-center gap-1.5">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          {tasker.tasks_done} tasks done
        </span>
        <span className="flex items-center gap-1.5">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          Replies in &lt; {tasker.response_hours}h
        </span>
        <div className="flex gap-1 ml-auto">
          {tasker.categories.slice(0, 2).map(c => {
            const meta = CAT_ICONS[c]
            return (
              <span key={c} className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
                style={{ background: meta?.bg ?? '#EFF6FF', color: meta?.color ?? '#2563EB' }}>
                {meta?.icon}
                {c}
              </span>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="flex gap-3 mt-auto pt-4 border-t border-gray-100">
        <Link href={`/taskers/${tasker.id}`}
          className="flex-1 rounded-xl py-2.5 text-sm font-bold text-blue-600 border-2 border-blue-600 text-center hover:bg-blue-600 hover:text-white transition-all">
          View profile
        </Link>
        <Link href={`/taskers/${tasker.id}`}
          className="flex-1 rounded-xl py-2.5 text-sm font-bold text-white text-center transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(90deg,#2563EB,#38BDF8)' }}>
          {bookLabel}
        </Link>
      </div>
    </div>
  )
}

export default function TaskersContent({ taskers, activeCategory }: { taskers: Tasker[]; activeCategory: string | null }) {
  const { t } = useLanguage()
  const searchParams = useSearchParams()
  const posted = searchParams.get('posted') === '1'
  const [selected, setSelected] = useState(activeCategory ?? 'All')
  const [showBanner, setShowBanner] = useState(posted)

  useEffect(() => {
    if (posted) {
      const timer = setTimeout(() => setShowBanner(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [posted])

  const filtered = selected === 'All' ? taskers : taskers.filter(t => t.categories.includes(selected))

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Success banner after posting */}
      {showBanner && (
        <div className="bg-green-600 text-white px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            <span className="text-sm font-semibold">Your task is posted! Browse helpers below and send a request.</span>
          </div>
          <button onClick={() => setShowBanner(false)} className="text-white/80 hover:text-white">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Find a helper near you</h1>
          <p className="text-gray-500 text-base">Verified locals ready to help — book in minutes</p>

          {/* Stats bar */}
          <div className="flex flex-wrap gap-6 mt-6 text-sm text-gray-500">
            {[
              { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, label: '2,400+ helpers' },
              { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>, label: '8,000+ tasks completed' },
              { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>, label: 'Avg. response < 2 hours' },
            ].map(s => (
              <span key={s.label} className="flex items-center gap-2">{s.icon}{s.label}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8">

        {/* Category filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setSelected(cat)}
              className="shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all border"
              style={selected === cat
                ? { background: 'linear-gradient(90deg,#2563EB,#38BDF8)', color: '#fff', borderColor: 'transparent' }
                : { background: '#fff', color: '#374151', borderColor: '#E5E7EB' }}>
              {cat}
            </button>
          ))}
        </div>

        {/* Sort + count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">
            <span className="font-bold text-gray-900">{filtered.length}</span> helpers available
          </p>
          <select className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400">
            <option>Recommended</option>
            <option>Highest rated</option>
            <option>Lowest price</option>
            <option>Most tasks done</option>
          </select>
        </div>

        {/* Tasker grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="h-16 w-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            </div>
            <p className="text-gray-500 font-medium">No helpers found for this category yet.</p>
            <Link href="/signup" className="mt-4 inline-block text-sm font-semibold text-blue-600 hover:underline">
              Be the first to sign up as a helper →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((tasker, i) => (
              <TaskerCard key={tasker.id} tasker={tasker} index={i} bookLabel={t.home?.bookNow ?? 'Book now'} />
            ))}
          </div>
        )}

        {/* CTA to become a helper */}
        <div className="mt-14 rounded-2xl border border-blue-100 bg-blue-50 px-8 py-10 text-center">
          <h3 className="text-lg font-extrabold text-gray-900 mb-2">Are you a skilled professional?</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">Join SkillLink as a helper and start earning on your own schedule.</p>
          <Link href="/signup"
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(90deg,#2563EB,#38BDF8)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
            Sign up as a helper
          </Link>
        </div>
      </div>
    </div>
  )
}
