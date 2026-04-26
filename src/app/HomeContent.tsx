'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '@/context/LanguageContext'
import { CheckCircle2, Clock3, MapPin, MessageCircle, Search, Users, X, Zap } from 'lucide-react'
import { CATEGORY_BY_KEY, CATEGORY_KEYS, CATEGORY_LABEL_BY_KEY, toCategoryKey } from '@/lib/categories'
import { categoryIconProps } from '@/lib/category-icon'
import IconBadge from '@/components/IconBadge'

import type { RealHelper } from './page'

type Job = { title: string; location: string; price: number | null; category: string; urgent?: boolean }

const CAT_FILTER_GROUPS = [
  { label: 'All',            keys: [] as string[] },
  { label: 'Home',           keys: ['cleaning', 'windowcleaning', 'snowremoval', 'gardening', 'painting'] },
  { label: 'Handyman',       keys: ['handyman', 'furnitureassembly'] },
  { label: 'Moving',         keys: ['moving', 'delivery'] },
  { label: 'Tech',           keys: ['it'] },
  { label: 'Care & Lessons', keys: ['tutoring', 'drivinglessons', 'kidscare', 'eldercare', 'petcare', 'dogwalking', 'personaltraining', 'musiclessons'] },
  { label: 'Events & More',  keys: ['events', 'photography', 'cooking', 'baking', 'makeup', 'hairdresser', 'shopping', 'carwash', 'knitting', 'sewing'] },
]

// ── Inline Norway flag SVG (no emoji) ──────────────────────────────────────
function NorwayFlag({ size = 16 }: { size?: number }) {
  const w = Math.round(size * 1.5)
  return (
    <svg width={w} height={size} viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: 2, display: 'block' }}>
      <rect width="24" height="16" fill="#EF2B2D" />
      <rect x="6" width="4" height="16" fill="white" />
      <rect y="6" width="24" height="4" fill="white" />
      <rect x="7" width="2" height="16" fill="#003087" />
      <rect y="7" width="24" height="2" fill="#003087" />
    </svg>
  )
}

// ── Star rating ─────────────────────────────────────────────────────────────
function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={i <= Math.round(rating) ? '#F59E0B' : '#E5E7EB'}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      <span className="ml-1 text-xs font-semibold text-gray-600">{rating.toFixed(1)}</span>
    </span>
  )
}


// ── Sample tasker profiles (displayed as helpers) ───────────────────────────
const SAMPLE_TASKERS = [
  { initials: 'MK', name: 'Maria K.', rating: 4.9, tasks: 52, reply: '< 1h', location: 'Oslo', category: 'cleaning', price: 350 },
  { initials: 'ER', name: 'Erik R.', rating: 4.8, tasks: 38, reply: '< 2h', location: 'Bergen', category: 'moving', price: 500 },
  { initials: 'AS', name: 'Amina S.', rating: 5.0, tasks: 74, reply: '< 30m', location: 'Oslo', category: 'tutoring', price: 400 },
]

const AVATAR_COLORS = ['#2563EB', '#16A34A', '#7C3AED', '#D97706', '#E11D48', '#0284C7']

// ── Job card (TaskRabbit style) ─────────────────────────────────────────────
function TaskCard({ job, bookLabel, negotiableLabel }: { job: Job; bookLabel: string; negotiableLabel: string }) {
  const initials = job.title.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('')
  const color = AVATAR_COLORS[Math.abs(job.title.charCodeAt(0)) % AVATAR_COLORS.length]
  const cat = CATEGORY_BY_KEY[toCategoryKey(job.category)] ?? CATEGORY_BY_KEY.handyman
  const CatIcon = cat.Icon

  return (
    <Link href="/jobs" className="group flex flex-col rounded-2xl bg-white border border-gray-200 p-5 hover:border-blue-400 hover:shadow-xl transition-all duration-200">
      {/* Header: avatar + info */}
      <div className="flex items-start gap-4 mb-4">
        <div className="h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 text-white font-bold text-sm shadow-sm"
          style={{ background: color }}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{job.title}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span className="text-xs text-gray-400">{job.location}</span>
          </div>
        </div>
        <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: cat.bg }}>
          <CatIcon {...categoryIconProps(18, cat.color)} />
        </div>
      </div>

      {/* Rating + reply time */}
      <div className="flex items-center gap-3 mb-4">
        <Stars rating={4.7 + (job.title.charCodeAt(0) % 3) * 0.1} />
        <span className="text-xs text-gray-400">·</span>
        <span className="flex items-center gap-1 text-xs text-gray-400">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          &lt; 2h
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
        <span className="text-lg font-extrabold" style={{ color: '#16A34A' }}>
          {job.price ? `${job.price} NOK` : negotiableLabel}
        </span>
        <span className="rounded-xl px-4 py-2 text-sm font-bold text-white transition-opacity group-hover:opacity-90"
          style={{ background: 'var(--sl-gradient-primary)' }}>
          {bookLabel}
        </span>
      </div>
    </Link>
  )
}

type DisplayHelper = {
  id?: string
  initials: string
  name: string
  avatarUrl?: string | null
  avatarColor: string
  location: string
  catKey: string
  price: number | null
  rating: number
  tasks: number
  reply: string
}

// ── Tasker profile card ─────────────────────────────────────────────────────
function TaskerCard({ tasker, bookLabel, replyLabel, doneLabel }: { tasker: DisplayHelper; bookLabel: string; replyLabel: string; doneLabel: string }) {
  const cat = CATEGORY_BY_KEY[tasker.catKey] ?? CATEGORY_BY_KEY.handyman
  const CatIcon = cat.Icon
  const href = tasker.id ? `/taskers/${tasker.id}` : '/signup'
  return (
    <Link href={href} className="group flex flex-col rounded-2xl bg-white border border-gray-200 p-5 hover:border-blue-400 hover:shadow-xl transition-all duration-200">
      <div className="flex items-center gap-3 mb-3">
        {tasker.avatarUrl ? (
          <Image src={tasker.avatarUrl} alt={tasker.name} width={48} height={48} className="h-12 w-12 rounded-2xl object-cover shrink-0" />
        ) : (
          <div className="h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 text-white font-bold text-sm"
            style={{ background: tasker.avatarColor }}>
            {tasker.initials}
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{tasker.name}</p>
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span className="text-xs text-gray-400">{tasker.location}</span>
          </div>
        </div>
        <div className="ml-auto h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: cat.bg }}>
          <CatIcon {...categoryIconProps(20, cat.color)} />
        </div>
      </div>

      <Stars rating={tasker.rating} />

      <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
        {tasker.tasks > 0 && (
          <span className="flex items-center gap-1">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
            {tasker.tasks} {doneLabel}
          </span>
        )}
        <span className="flex items-center gap-1">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          {replyLabel} {tasker.reply}
        </span>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
        <span className="text-lg font-extrabold" style={{ color: '#16A34A' }}>
          {tasker.price ? `${tasker.price} NOK` : 'Negotiable'}
        </span>
        <span className="rounded-xl px-4 py-2 text-sm font-bold text-white transition-opacity group-hover:opacity-90"
          style={{ background: 'var(--sl-gradient-primary)' }}>
          {bookLabel}
        </span>
      </div>
    </Link>
  )
}

// ── Main export ─────────────────────────────────────────────────────────────
export default function HomeContent({
  jobs,
  helpers,
  enableDemoData,
}: {
  jobs: Job[]
  helpers: RealHelper[] | null
  enableDemoData: boolean
}) {
  const { t } = useLanguage()
  const h = t.home

  const [catSearch, setCatSearch] = useState('')
  const [catFilter, setCatFilter] = useState('All')

  const catKeys = useMemo(() => {
    const group = CAT_FILTER_GROUPS.find(g => g.label === catFilter)
    let list = group && group.keys.length > 0 ? group.keys : CATEGORY_KEYS
    if (catSearch.trim()) {
      const q = catSearch.toLowerCase()
      list = list.filter(k => (CATEGORY_LABEL_BY_KEY[k] ?? k).toLowerCase().includes(q))
    }
    return list
  }, [catSearch, catFilter])

  const seasonal = useMemo(() => {
    const m = new Date().getMonth() + 1
    const winter = m >= 11 || m <= 3
    if (!h) return { title: '', body: '' }
    return winter
      ? { title: h.seasonalWinterTitle, body: h.seasonalWinterBody }
      : { title: h.seasonalSummerTitle, body: h.seasonalSummerBody }
  }, [h])

  const how1 = h?.how1
  const how2 = h?.how2
  const how3 = h?.how3

  if (!h || !how1 || !how2 || !how3) return null

  // Build display helpers — real profiles if available, otherwise sample fallback
  const displayHelpers: DisplayHelper[] = helpers
    ? helpers.map((p, i) => {
        const initials = p.name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('')
        const catKey = p.categories.length > 0 ? toCategoryKey(p.categories[0]) : 'handyman'
        return {
          id: p.id,
          initials,
          name: p.name,
          avatarUrl: p.avatarUrl,
          avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
          location: p.location,
          catKey,
          price: p.hourlyRate,
          rating: 4.8,
          tasks: 0,
          reply: '< 2h',
        }
      })
    : (enableDemoData
      ? SAMPLE_TASKERS.map((t, i) => ({
          initials: t.initials,
          name: t.name,
          avatarUrl: null,
          avatarColor: AVATAR_COLORS[i],
          location: t.location,
          catKey: t.category,
          price: t.price,
          rating: t.rating,
          tasks: t.tasks,
          reply: t.reply,
        }))
      : [])

  const HOW_STEPS = [
    {
      num: '1',
      color: '#2563EB',
      bg: '#EFF6FF',
      title: how1.title,
      desc: how1.desc,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
        </svg>
      ),
    },
    {
      num: '2',
      color: '#7C3AED',
      bg: '#F5F3FF',
      title: how2.title,
      desc: how2.desc,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
    },
    {
      num: '3',
      color: '#16A34A',
      bg: '#F0FDF4',
      title: how3.title,
      desc: how3.desc,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      ),
    },
  ]

  const categoryPh =
    'categorySearchPlaceholder' in h && h.categorySearchPlaceholder
      ? h.categorySearchPlaceholder
      : 'Search categories…'
  const browseAllLabel = 'browseAllHelpers' in h && h.browseAllHelpers ? h.browseAllHelpers : 'All helpers'

  return (
    <div className="flex flex-col bg-gray-50">

      {/* ── Compact hero + categories (mobile: minimal copy so filters sit high) ─ */}
      <section className="bg-white border-b border-gray-100 px-4 pt-2 pb-3 sm:px-6 sm:pt-5 sm:pb-8 max-w-6xl mx-auto w-full text-center">
        <div className="mx-auto max-w-2xl">
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700 mb-2 border border-blue-100">
            <NorwayFlag size={11} />
            {h.badge}
          </span>
          <h1 className="text-lg sm:text-3xl md:text-4xl font-extrabold leading-snug tracking-tight text-gray-900 mb-0 sm:mb-1.5">
            <span className="sm:hidden text-gray-900">{h.title1}</span>
            <span className="hidden sm:inline">{h.title1}{' '}</span>
            <span className="sm:whitespace-nowrap" style={{ background: 'var(--sl-gradient-hero-text)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {h.title2}
            </span>
          </h1>
          {h.subtitle?.trim() ? (
            <p className="hidden sm:block text-sm text-gray-500 max-w-lg mx-auto leading-snug">{h.subtitle}</p>
          ) : null}
        </div>

        <div className="mx-auto max-w-3xl mt-2 sm:mt-5 mb-2 sm:mb-5">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:items-stretch">
            <div className="relative flex-1 min-w-0">
              <Search size={18} className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="search"
                value={catSearch}
                onChange={e => setCatSearch(e.target.value)}
                placeholder={categoryPh}
                autoComplete="off"
                className="w-full min-w-0 rounded-xl sm:rounded-2xl border border-gray-200 bg-gray-50 pl-11 sm:pl-12 pr-9 sm:pr-10 py-2.5 sm:py-3.5 text-sm sm:text-base text-gray-900 shadow-sm
                           focus:outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 placeholder:text-gray-400"
              />
              {catSearch && (
                <button type="button" onClick={() => setCatSearch('')}
                  className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  aria-label="Clear search">
                  <X size={18} />
                </button>
              )}
            </div>
            <Link
              href="/taskers"
              className="inline-flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl border-2 border-gray-200 bg-white px-3 py-2 text-xs sm:text-sm font-bold text-gray-700 whitespace-nowrap shrink-0 sm:px-5 sm:py-3.5
                         hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-colors">
              <Users size={16} className="text-blue-600 shrink-0 sm:h-[18px] sm:w-[18px]" strokeWidth={2} />
              {browseAllLabel}
            </Link>
          </div>
        </div>

        {/* Cities + group filters: above icon grid, sticky under nav while scrolling */}
        <div
          className="sticky top-14 z-40 -mx-4 border-y border-gray-200 bg-white/95 px-4 py-2 sm:py-3 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.08)] backdrop-blur-sm sm:-mx-6 sm:top-16 sm:px-6 supports-[backdrop-filter]:bg-white/90">
          <p className="text-[11px] sm:text-xs text-gray-500 text-center sm:text-left mb-1.5 sm:mb-2 leading-snug">
            <span className="font-semibold text-gray-600">Popular areas:</span>{' '}
            <Link href="/cities/oslo" className="hover:text-blue-600 hover:underline">Oslo</Link>
            <span className="mx-1">·</span>
            <Link href="/cities/bergen" className="hover:text-blue-600 hover:underline">Bergen</Link>
            <span className="mx-1">·</span>
            <Link href="/cities/trondheim" className="hover:text-blue-600 hover:underline">Trondheim</Link>
            <span className="mx-1">·</span>
            <Link href="/taskers" className="hover:text-blue-600 hover:underline">Stavanger</Link>
          </p>
          <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center sm:justify-start">
            {CAT_FILTER_GROUPS.map(g => (
              <button key={g.label} type="button" onClick={() => setCatFilter(g.label)}
                className="rounded-full px-3 py-1 text-xs sm:px-4 sm:py-1.5 sm:text-sm font-semibold transition-colors border"
                style={catFilter === g.label
                  ? { background: 'var(--sl-gradient-brand)', color: '#fff', borderColor: 'transparent' }
                  : { background: '#fff', color: '#4B5563', borderColor: '#E5E7EB' }}>
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {catKeys.length === 0 ? (
          <div className="text-center py-8 mt-3">
            <p className="text-gray-400 text-sm">No categories match &quot;{catSearch}&quot;</p>
            <button type="button" onClick={() => { setCatSearch(''); setCatFilter('All') }}
              className="mt-3 text-sm font-semibold text-blue-600 hover:underline">
              Show all
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-2 sm:gap-3 mt-2 sm:mt-3">
            {catKeys.map(key => {
              const cfg = CATEGORY_BY_KEY[key]
              if (!cfg) return null
              const CatIcon = cfg.Icon
              const label = CATEGORY_LABEL_BY_KEY[key] ?? (key.charAt(0).toUpperCase() + key.slice(1))
              return (
                <Link key={key} href={`/taskers?category=${encodeURIComponent(label)}`}
                  className="group flex flex-col items-center gap-1.5 rounded-lg sm:rounded-2xl bg-gray-50/80 border border-gray-200 px-1.5 py-2.5 sm:px-3 sm:py-4 sm:gap-2 hover:border-blue-400 hover:bg-white hover:shadow-md transition-all duration-200 text-center min-w-0">
                  <IconBadge size="lg" className="shadow-sm" style={{ background: cfg.bg }} withBorder={false}>
                    <CatIcon {...categoryIconProps(22, cfg.color)} />
                  </IconBadge>
                  <span className="text-[11px] sm:text-xs font-bold text-gray-800 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2">
                    {label}
                  </span>
                </Link>
              )
            })}
          </div>
        )}

        {/* Helpers & jobs first (Finn-style: listings right after categories) */}
        <div className="mt-5 pt-5 border-t border-gray-100 w-full text-left">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">Top helpers near you</h2>
              <p className="text-xs sm:text-sm text-gray-400 mt-0.5">Verified · Rated · Ready to help</p>
            </div>
            <Link href="/taskers" className="shrink-0 text-xs sm:text-sm font-semibold text-blue-600 hover:underline">
              {h.seeAll}
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {displayHelpers.map((tasker, i) => (
              <TaskerCard key={i} tasker={tasker} bookLabel={h.bookNow} replyLabel={h.replyTime} doneLabel={h.tasksDone} />
            ))}
          </div>

          <div className="flex items-center justify-between gap-3 mt-8 mb-4">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <IconBadge tone="orange" size="sm" withBorder={false}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              </IconBadge>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-extrabold text-gray-900">{h.urgentTitle}</h2>
                <p className="text-xs sm:text-sm text-gray-400 truncate sm:whitespace-normal">{h.urgentSub}</p>
              </div>
            </div>
            <Link href="/jobs" className="shrink-0 text-xs sm:text-sm font-semibold text-blue-600 hover:underline">
              {h.seeAll}
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {jobs.slice(0, 3).map((job, i) => (
              <TaskCard key={i} job={job} bookLabel={h.bookNow} negotiableLabel={h.negotiable} />
            ))}
          </div>
        </div>

        {/* Quick actions + trust chips */}
        <div className="mt-6 pt-5 border-t border-gray-100 max-w-3xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-stretch">
            <Link href="/post"
              className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 sm:py-3.5 text-sm font-extrabold text-white transition-opacity hover:opacity-90"
              style={{ background: 'var(--sl-gradient-primary)', boxShadow: 'var(--sl-shadow-primary)' }}>
              <Zap size={18} strokeWidth={2.2} />
              {h.cta1.replace('🚀 ', '')}
            </Link>
            <Link href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-6 py-3 sm:py-3.5 text-sm font-extrabold text-gray-700 transition hover:border-blue-400 hover:text-blue-600">
              <Users size={18} strokeWidth={2} />
              {h.cta2.replace(' →', '')}
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-4 sm:mt-6">
            {[
              { num: '8,000+', label: 'tasks completed', color: '#16A34A', bg: '#F0FDF4' },
              { num: '2,400+', label: 'verified helpers', color: '#2563EB', bg: '#EFF6FF' },
              { num: '4.9★', label: 'average rating', color: '#D97706', bg: '#FFFBEB' },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-2 rounded-full px-3 py-1.5 border text-left"
                style={{ background: s.bg, borderColor: s.bg }}>
                <span className="text-sm font-extrabold" style={{ color: s.color }}>{s.num}</span>
                <span className="text-[11px] text-gray-600">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Seasonal + trust (single compact card) ─────────────────────── */}
      <section className="px-4 sm:px-6 py-4 max-w-6xl mx-auto w-full">
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 sm:px-5 shadow-sm">
          <h2 className="text-base font-extrabold text-gray-900 leading-tight">{seasonal.title}</h2>
          <p className="text-sm text-gray-600 mt-1 leading-snug">{seasonal.body}</p>
          <p className="text-[11px] text-gray-500 mt-3 pt-3 border-t border-gray-100 leading-snug">
            {h.trustPricingNote}
            <span className="hidden sm:inline"> · </span>
            <br className="sm:hidden" />
            {h.trustVerifiedNote}
          </p>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="bg-white border-y border-gray-100 px-4 sm:px-6 py-8 sm:py-10">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 text-center mb-6 sm:mb-8">{h.howTitle}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4">
            {HOW_STEPS.map((step, idx) => (
              <div key={idx} className="flex flex-col items-center text-center relative">
                {idx < 2 && (
                  <div className="hidden sm:block absolute top-6 left-[calc(50%+24px)] right-[-calc(50%-24px)] h-px bg-gray-200 z-0" style={{ width: 'calc(100% - 24px)' }} />
                )}
                <div className="h-12 w-12 rounded-xl flex items-center justify-center mb-2 shadow-sm relative z-10 border-2 border-white"
                  style={{ background: step.bg, boxShadow: `0 0 0 3px ${step.bg}` }}>
                  {step.icon}
                </div>
                <h3 className="text-sm font-extrabold text-gray-900 mb-0.5">{step.title}</h3>
                <p className="text-xs text-gray-500 leading-snug max-w-[14rem] mx-auto">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Happiness guarantee (one compact row) ───────────────────────── */}
      <section className="px-4 sm:px-6 py-3 max-w-5xl mx-auto w-full">
        <div className="flex items-start gap-2.5 rounded-xl border border-green-100 bg-green-50/90 px-3 py-2.5 sm:items-center sm:gap-3">
          <div className="h-9 w-9 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
          </div>
          <p className="text-[11px] sm:text-xs text-gray-700 leading-snug text-left">
            <span className="font-bold text-gray-900">{h.guaranteeTitle}</span>
            {' '}
            {h.guaranteeBody}
          </p>
        </div>
      </section>

      {/* ── Trust stats (compact) ────────────────────────────────────────── */}
      <section className="bg-white border-y border-gray-100 px-3 sm:px-6 py-4 sm:py-5">
        <div className="mx-auto max-w-5xl">
          {h.trustTitle?.trim() ? (
            <p className="text-center text-[9px] font-bold uppercase tracking-wide text-gray-400 mb-3">{h.trustTitle}</p>
          ) : null}
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {[
              { val: '2,400+', label: h.trustStatUsers, icon: <Users size={16} strokeWidth={2.2} color="#2563EB" />, tone: 'blue' as const },
              { val: '< 2h', label: h.trustStatResponse, icon: <Clock3 size={16} strokeWidth={2.2} color="#7C3AED" />, tone: 'violet' as const },
              { val: '8,000+', label: h.trustStatTasks, icon: <CheckCircle2 size={16} strokeWidth={2.2} color="#16A34A" />, tone: 'green' as const },
              { val: '12', label: h.trustStatCities, icon: <MapPin size={16} strokeWidth={2.2} color="#EA580C" />, tone: 'orange' as const },
            ].map(s => (
              <div key={s.label} className="flex flex-col items-center text-center min-w-0">
                <IconBadge tone={s.tone} size="sm" className="mb-1 scale-90 sm:scale-100" withBorder={false}>
                  {s.icon}
                </IconBadge>
                <p className="text-sm sm:text-base font-extrabold text-gray-900 leading-none tabular-nums">{s.val}</p>
                <p className="text-[9px] sm:text-[10px] text-gray-500 mt-0.5 leading-tight px-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Hire2Skill (titles only, tight) ──────────────────────────── */}
      <section className="px-4 sm:px-6 py-5 sm:py-6 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {[
            { tone: 'blue' as const, title: h.fast.title, icon: <Zap size={20} strokeWidth={2.2} color="#2563EB" /> },
            { tone: 'green' as const, title: h.local.title, icon: <MapPin size={20} strokeWidth={2.2} color="#16A34A" /> },
            { tone: 'amber' as const, title: h.chat.title, icon: <MessageCircle size={20} strokeWidth={2.2} color="#D97706" /> },
          ].map(f => (
            <div key={f.title} className="flex flex-col items-center text-center">
              <IconBadge tone={f.tone} size="sm" className="mb-1.5" withBorder={false}>
                {f.icon}
              </IconBadge>
              <h3 className="text-[11px] sm:text-xs font-extrabold text-gray-900 leading-tight">{f.title}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA (compact) ───────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 pb-8 sm:pb-10 max-w-5xl mx-auto w-full">
        <div className="rounded-2xl px-4 py-6 sm:px-6 sm:py-8 text-center text-white relative overflow-hidden"
          style={{ background: 'var(--sl-gradient-brand)' }}>
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div className="relative z-10">
            <h2 className="text-lg sm:text-xl font-extrabold mb-1">{h.ctaTitle}</h2>
            {h.ctaSub?.trim() ? (
              <p className="text-blue-100/95 mb-4 text-xs sm:text-sm max-w-sm mx-auto leading-snug">{h.ctaSub}</p>
            ) : null}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
              <Link href="/signup"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-sm font-extrabold transition hover:bg-blue-50 shadow-md"
                style={{ color: '#1E3A8A' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1E3A8A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                {h.ctaPrimary}
              </Link>
              <Link href="/post"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/60 px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-white/10">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                {h.ctaSecondary}
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
