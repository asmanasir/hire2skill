'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { createClient } from '@/lib/supabase/client'
import type { BookingItem, Post } from './page'

type Props = {
  email: string
  postCount: number
  recentPosts: Post[]
  posted: boolean
  role: 'helper' | 'poster' | null
  bookings: BookingItem[]
  pendingCount: number
}

const STATUS_META: Record<string, { label: string; bg: string; color: string }> = {
  pending:   { label: 'Pending',   bg: '#FFFBEB', color: '#92400E' },
  accepted:  { label: 'Accepted',  bg: '#F0FDF4', color: '#15803D' },
  declined:  { label: 'Declined',  bg: '#FEF2F2', color: '#DC2626' },
  completed: { label: 'Completed', bg: '#EFF6FF', color: '#1D4ED8' },
  cancelled: { label: 'Cancelled', bg: '#F9FAFB', color: '#6B7280' },
}

const POST_STATUS_META: Record<string, { label: string; bg: string; color: string }> = {
  open:      { label: 'Open',      bg: '#F0FDF4', color: '#15803D' },
  closed:    { label: 'Closed',    bg: '#F9FAFB', color: '#6B7280' },
  cancelled: { label: 'Cancelled', bg: '#FEF2F2', color: '#DC2626' },
}

type FilterOption = 'all' | 'pending' | 'accepted' | 'declined' | 'cancelled' | 'completed'
const ALL_FILTERS: FilterOption[] = ['all', 'pending', 'accepted', 'declined', 'completed', 'cancelled']

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function Avatar({ name, avatarUrl, size = 10 }: { name: string | null; avatarUrl: string | null; size?: number }) {
  const initials = (name ?? '?').split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('')
  const colors = ['#2563EB', '#16A34A', '#7C3AED', '#D97706', '#E11D48', '#0284C7']
  const bg = colors[(name ?? '').charCodeAt(0) % colors.length]
  const cls = `h-${size} w-${size} rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0`
  if (avatarUrl) return <img src={avatarUrl} alt={name ?? ''} className={`${cls} object-cover`} />
  return <div className={cls} style={{ background: bg }}>{initials}</div>
}

function FilterChips({
  bookings,
  active,
  onChange,
}: {
  bookings: BookingItem[]
  active: FilterOption
  onChange: (f: FilterOption) => void
}) {
  const chips = ALL_FILTERS
    .map(f => ({
      key: f,
      label: f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1),
      count: f === 'all' ? bookings.length : bookings.filter(b => b.status === f).length,
    }))
    .filter(c => c.count > 0 || c.key === 'all')

  return (
    <div className="flex flex-wrap gap-2 mb-5">
      {chips.map(c => (
        <button key={c.key} onClick={() => onChange(c.key)}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
            active === c.key
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
          }`}>
          {c.label} <span className={active === c.key ? 'opacity-75' : 'opacity-60'}>({c.count})</span>
        </button>
      ))}
    </div>
  )
}

function BookingCard({
  booking,
  isHelper,
  onUpdate,
}: {
  booking: BookingItem
  isHelper: boolean
  onUpdate: (id: string, status: string) => void
}) {
  const [updating, setUpdating] = useState(false)
  const meta = STATUS_META[booking.status] ?? STATUS_META.pending

  async function updateStatus(status: string) {
    setUpdating(true)
    const supabase = createClient()
    await supabase.from('bookings').update({ status }).eq('id', booking.id)
    setUpdating(false)
    onUpdate(booking.id, status)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <Avatar name={booking.other_display_name} avatarUrl={booking.other_avatar_url} size={10} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p className="text-sm font-bold text-gray-900 truncate">
              {isHelper ? 'From ' : 'To '}
              <span className="text-blue-600">{booking.other_display_name ?? 'Unknown'}</span>
            </p>
            <span className="text-xs text-gray-400 shrink-0">{timeAgo(booking.created_at)}</span>
          </div>
          <span className="inline-block mt-1 rounded-full px-2.5 py-0.5 text-xs font-semibold"
            style={{ background: meta.bg, color: meta.color }}>
            {meta.label}
          </span>
        </div>
      </div>

      <p className="text-sm text-gray-600 line-clamp-2 italic">&ldquo;{booking.message}&rdquo;</p>

      {(booking.scheduled_date || booking.budget) && (
        <div className="flex flex-wrap gap-3 text-xs text-gray-400">
          {booking.scheduled_date && (
            <span className="flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              {new Date(booking.scheduled_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          )}
          {booking.budget && (
            <span className="flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M9 9h4.5a2 2 0 0 1 0 4H9a2 2 0 0 0 0 4H14"/></svg>
              {booking.budget.toLocaleString()} NOK
            </span>
          )}
        </div>
      )}

      {/* Pending: helper accepts/declines */}
      {booking.status === 'pending' && isHelper && (
        <div className="flex gap-2 pt-1">
          <button onClick={() => updateStatus('declined')} disabled={updating}
            className="flex-1 rounded-xl py-2 text-sm font-bold border-2 border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-600 transition-colors disabled:opacity-50">
            Decline
          </button>
          <button onClick={() => updateStatus('accepted')} disabled={updating}
            className="flex-1 rounded-xl py-2 text-sm font-bold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            style={{ background: 'linear-gradient(90deg,#16A34A,#22C55E)' }}>
            {updating ? 'Saving…' : 'Accept'}
          </button>
        </div>
      )}

      {/* Pending: poster cancels */}
      {booking.status === 'pending' && !isHelper && (
        <button onClick={() => updateStatus('cancelled')} disabled={updating}
          className="w-full rounded-xl py-2 text-sm font-bold border-2 border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-600 transition-colors disabled:opacity-50">
          {updating ? 'Cancelling…' : 'Cancel request'}
        </button>
      )}

      {/* Accepted: message + complete */}
      {booking.status === 'accepted' && (
        <div className="flex gap-2 pt-1">
          {!isHelper && (
            <Link href="/chat"
              className="flex-1 rounded-xl py-2 text-sm font-bold text-white text-center hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(90deg,#2563EB,#38BDF8)' }}>
              Message {booking.other_display_name?.split(' ')[0] ?? 'helper'}
            </Link>
          )}
          <button onClick={() => updateStatus('completed')} disabled={updating}
            className="flex-1 rounded-xl py-2 text-sm font-bold border-2 border-green-300 text-green-700 hover:bg-green-50 transition-colors disabled:opacity-50">
            {updating ? 'Saving…' : '✓ Mark complete'}
          </button>
        </div>
      )}
    </div>
  )
}

function EmptyState({ icon, heading, sub, cta }: {
  icon: React.ReactNode
  heading: string
  sub: string
  cta?: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
      <div className="h-14 w-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
        {icon}
      </div>
      <p className="text-sm font-semibold text-gray-700 mb-1">{heading}</p>
      <p className="text-sm text-gray-400 mb-4">{sub}</p>
      {cta}
    </div>
  )
}

const ClipboardIcon = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
    <rect x="9" y="3" width="6" height="4" rx="1"/>
  </svg>
)

export default function DashboardContent({ email, postCount, recentPosts, posted, role, bookings: initialBookings }: Props) {
  const { t } = useLanguage()
  const firstName = email.split('@')[0]
  const isHelper = role === 'helper'

  const [activeTab, setActiveTab] = useState<'overview' | 'tasks'>('overview')
  const [bookings, setBookings] = useState<BookingItem[]>(initialBookings)
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all')

  function handleTabChange(tab: 'overview' | 'tasks') {
    setActiveTab(tab)
    setActiveFilter('all')
  }

  function handleBookingUpdate(id: string, status: string) {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b))
  }

  const pendingCount = bookings.filter(b => b.status === 'pending').length
  // For helpers: show pending badge (need to action). For posters: show accepted badge (helper said yes!).
  const notifCount = isHelper ? pendingCount : bookings.filter(b => b.status === 'accepted').length

  const filteredBookings = activeFilter === 'all'
    ? bookings
    : bookings.filter(b => b.status === activeFilter)

  return (
    <main className="mx-auto max-w-5xl px-6 py-8 w-full">
      {posted && (
        <div className="mb-6 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          {t.dashboard.posted}
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t.dashboard.welcome}, {firstName}</h1>
        <p className="text-sm text-gray-500 mt-1">{t.dashboard.subtitle}</p>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 mb-8 border-b border-gray-200">
        {([
          { key: 'overview' as const, label: 'Overview' },
          { key: 'tasks' as const, label: isHelper ? 'Requests' : 'My Tasks' },
        ]).map(tab => (
          <button key={tab.key} onClick={() => handleTabChange(tab.key)}
            className={`relative px-4 py-2.5 text-sm font-semibold transition-colors ${
              activeTab === tab.key ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {tab.label}
            {tab.key === 'tasks' && notifCount > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-blue-600 min-w-4.5 h-4.5 px-1 text-[11px] font-bold text-white">
                {notifCount}
              </span>
            )}
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-blue-600" />
            )}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: t.dashboard.stats.posts, value: postCount },
              { label: isHelper ? 'Requests received' : 'Requests sent', value: bookings.length },
              { label: t.dashboard.stats.messages, value: 0 },
              { label: t.dashboard.stats.views, value: 0 },
            ].map(stat => (
              <div key={stat.label} className="rounded-xl bg-white border border-gray-200 p-5">
                <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="mb-8">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
              {t.dashboard.quickActions}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link href="/post"
                className="flex items-center gap-4 rounded-xl p-5 text-white hover:opacity-90 transition-opacity"
                style={{ background: 'linear-gradient(90deg,#2563EB,#38BDF8)' }}>
                <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </div>
                <div>
                  <p className="font-semibold text-sm">{t.dashboard.postJob}</p>
                  <p className="text-xs text-blue-100">{t.dashboard.postJobSub}</p>
                </div>
              </Link>
              <Link href="/chat" className="flex items-center gap-4 rounded-xl bg-white border border-gray-200 p-5 hover:border-blue-300 hover:bg-blue-50 transition-colors">
                <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">{t.nav.messages}</p>
                  <p className="text-xs text-gray-400">{t.dashboard.chatSub}</p>
                </div>
              </Link>
              <Link href="/profile" className="flex items-center gap-4 rounded-xl bg-white border border-gray-200 p-5 hover:border-blue-300 hover:bg-blue-50 transition-colors">
                <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">{t.nav.profile}</p>
                  <p className="text-xs text-gray-400">{t.dashboard.profileSub}</p>
                </div>
              </Link>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                {t.dashboard.recentPosts}
              </h2>
              <Link href="/post" className="text-xs text-blue-600 hover:underline">{t.dashboard.newPost}</Link>
            </div>
            {recentPosts.length > 0 ? (
              <div className="flex flex-col gap-3">
                {recentPosts.slice(0, 5).map(post => (
                  <div key={post.id} className="flex items-center justify-between rounded-xl bg-white border border-gray-200 px-5 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{post.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{post.location} · {post.category}</p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(post.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
                <p className="text-sm text-gray-400 mb-3">{t.dashboard.noPosts}</p>
                <Link href="/post"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-white"
                  style={{ background: 'linear-gradient(90deg,#2563EB,#38BDF8)' }}>
                  {t.dashboard.createFirst}
                </Link>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── HELPER: REQUESTS TAB ── */}
      {activeTab === 'tasks' && isHelper && (
        <div>
          {bookings.length === 0 ? (
            <EmptyState
              icon={ClipboardIcon}
              heading="No requests yet"
              sub="When someone books you, their request will appear here."
            />
          ) : (
            <>
              <FilterChips bookings={bookings} active={activeFilter} onChange={setActiveFilter} />
              {filteredBookings.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-400">
                  No {activeFilter} requests
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredBookings.map(b => (
                    <BookingCard key={b.id} booking={b} isHelper={true} onUpdate={handleBookingUpdate} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── POSTER: MY TASKS TAB ── */}
      {activeTab === 'tasks' && !isHelper && (
        <div className="flex flex-col gap-10">

          {/* Section 1: Posted tasks */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                Posted Tasks ({recentPosts.length})
              </h2>
              <Link href="/post" className="text-xs font-semibold text-blue-600 hover:underline">
                + New task
              </Link>
            </div>

            {recentPosts.length > 0 ? (
              <div className="flex flex-col gap-3">
                {recentPosts.map(post => {
                  const pm = POST_STATUS_META[post.status] ?? POST_STATUS_META.open
                  return (
                    <div key={post.id}
                      className="flex items-center justify-between rounded-xl bg-white border border-gray-200 px-5 py-4 hover:border-blue-200 transition-colors">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{post.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{post.location} · {post.category}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-4">
                        <span className="hidden sm:inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold"
                          style={{ background: pm.bg, color: pm.color }}>
                          {pm.label}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(post.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </span>
                        <Link
                          href={`/taskers?category=${encodeURIComponent(post.category)}`}
                          className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white whitespace-nowrap hover:opacity-90 transition-opacity"
                          style={{ background: 'linear-gradient(90deg,#2563EB,#38BDF8)' }}>
                          Find helper →
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <EmptyState
                icon={ClipboardIcon}
                heading="No tasks posted yet"
                sub="Post a task to start receiving help from local helpers."
                cta={
                  <Link href="/post"
                    className="inline-block rounded-xl px-5 py-2.5 text-sm font-bold text-white hover:opacity-90 transition-opacity"
                    style={{ background: 'linear-gradient(90deg,#2563EB,#38BDF8)' }}>
                    Post your first task
                  </Link>
                }
              />
            )}
          </section>

          {/* Section 2: Helpers contacted */}
          <section>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
              Helpers Contacted ({bookings.length})
            </h2>

            {bookings.length === 0 ? (
              <EmptyState
                icon={ClipboardIcon}
                heading="No helpers contacted yet"
                sub="Browse helpers and send a request to get started."
                cta={
                  <Link href="/taskers"
                    className="inline-block rounded-xl px-5 py-2.5 text-sm font-bold text-white hover:opacity-90 transition-opacity"
                    style={{ background: 'linear-gradient(90deg,#2563EB,#38BDF8)' }}>
                    Browse helpers
                  </Link>
                }
              />
            ) : (
              <>
                <FilterChips bookings={bookings} active={activeFilter} onChange={setActiveFilter} />
                {filteredBookings.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-400">
                    No {activeFilter} requests
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredBookings.map(b => (
                      <BookingCard key={b.id} booking={b} isHelper={false} onUpdate={handleBookingUpdate} />
                    ))}
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      )}
    </main>
  )
}
