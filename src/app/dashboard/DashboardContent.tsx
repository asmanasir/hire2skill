'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { createClient } from '@/lib/supabase/client'
import type { BookingItem } from './page'

type Post = {
  id: string
  title: string
  category: string
  location: string
  created_at: string
}

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

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

function Avatar({ name, avatarUrl, size = 10 }: { name: string | null; avatarUrl: string | null; size?: number }) {
  const initials = (name ?? '?').split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('')
  const colors = ['#2563EB', '#16A34A', '#7C3AED', '#D97706', '#E11D48', '#0284C7']
  const bg = colors[(name ?? '').charCodeAt(0) % colors.length]
  const cls = `h-${size} w-${size} rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0`

  if (avatarUrl) return <img src={avatarUrl} alt={name ?? ''} className={`${cls} object-cover`} />
  return <div className={cls} style={{ background: bg }}>{initials}</div>
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
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <div className="flex items-start gap-3 mb-3">
        <Avatar name={booking.other_display_name} avatarUrl={booking.other_avatar_url} size={10} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p className="text-sm font-bold text-gray-900 truncate">
              {isHelper ? 'Request from ' : 'Request to '}
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

      <p className="text-sm text-gray-600 line-clamp-2 mb-3 pl-13">
        &ldquo;{booking.message}&rdquo;
      </p>

      <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-4">
        {booking.scheduled_date && (
          <span className="flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            {new Date(booking.scheduled_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        )}
        {booking.budget && (
          <span className="flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M9 9h4.5a2 2 0 0 1 0 4H9a2 2 0 0 0 0 4H14"/></svg>
            {booking.budget.toLocaleString()} NOK budget
          </span>
        )}
      </div>

      {/* Action buttons */}
      {booking.status === 'pending' && isHelper && (
        <div className="flex gap-2">
          <button onClick={() => updateStatus('declined')} disabled={updating}
            className="flex-1 rounded-xl py-2 text-sm font-bold border-2 border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-600 transition-colors disabled:opacity-50">
            Decline
          </button>
          <button onClick={() => updateStatus('accepted')} disabled={updating}
            className="flex-1 rounded-xl py-2 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: 'linear-gradient(90deg,#16A34A,#22C55E)' }}>
            {updating ? 'Saving...' : 'Accept'}
          </button>
        </div>
      )}

      {booking.status === 'pending' && !isHelper && (
        <button onClick={() => updateStatus('cancelled')} disabled={updating}
          className="w-full rounded-xl py-2 text-sm font-bold border-2 border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-600 transition-colors disabled:opacity-50">
          {updating ? 'Cancelling...' : 'Cancel request'}
        </button>
      )}

      {booking.status === 'accepted' && !isHelper && (
        <Link href="/chat"
          className="block w-full rounded-xl py-2 text-sm font-bold text-white text-center transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(90deg,#2563EB,#38BDF8)' }}>
          Message {booking.other_display_name}
        </Link>
      )}
    </div>
  )
}

export default function DashboardContent({ email, postCount, recentPosts, posted, role, bookings: initialBookings, pendingCount }: Props) {
  const { t } = useLanguage()
  const firstName = email.split('@')[0]
  const isHelper = role === 'helper'

  const [activeTab, setActiveTab] = useState<'overview' | 'requests'>('overview')
  const [bookings, setBookings] = useState<BookingItem[]>(initialBookings)

  function handleBookingUpdate(id: string, status: string) {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b))
  }

  const currentPending = bookings.filter(b => b.status === 'pending').length

  return (
    <main className="mx-auto max-w-5xl px-6 py-8 w-full">
      {posted && (
        <div className="mb-6 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          {t.dashboard.posted}
        </div>
      )}

      {/* Welcome */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t.dashboard.welcome}, {firstName}</h1>
        <p className="text-sm text-gray-500 mt-1">{t.dashboard.subtitle}</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-8 border-b border-gray-200">
        {(['overview', 'requests'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`relative px-4 py-2.5 text-sm font-semibold transition-colors ${
              activeTab === tab ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {tab === 'overview' ? 'Overview' : isHelper ? 'Incoming Requests' : 'My Requests'}
            {tab === 'requests' && currentPending > 0 && (
              <span className="ml-1.5 rounded-full bg-blue-600 px-1.5 py-0.5 text-xs font-bold text-white">
                {currentPending}
              </span>
            )}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-blue-600" />
            )}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: t.dashboard.stats.posts, value: postCount },
              { label: t.dashboard.stats.applications, value: bookings.length },
              { label: t.dashboard.stats.messages, value: 0 },
              { label: t.dashboard.stats.views, value: 0 },
            ].map(stat => (
              <div key={stat.label} className="rounded-xl bg-white border border-gray-200 p-5">
                <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
              {t.dashboard.quickActions}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link
                href="/post"
                className="flex items-center gap-4 rounded-xl p-5 text-white transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(90deg,#2563EB,#38BDF8)' }}
              >
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

          {/* Recent Posts */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                {t.dashboard.recentPosts}
              </h2>
              <Link href="/post" className="text-xs text-blue-600 hover:underline">{t.dashboard.newPost}</Link>
            </div>

            {recentPosts.length > 0 ? (
              <div className="flex flex-col gap-3">
                {recentPosts.map(post => (
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
                <Link
                  href="/post"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-white"
                  style={{ background: 'linear-gradient(90deg,#2563EB,#38BDF8)' }}
                >
                  {t.dashboard.createFirst}
                </Link>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'requests' && (
        <div>
          {bookings.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
              <div className="h-14 w-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>
              </div>
              <p className="text-sm font-semibold text-gray-700 mb-1">
                {isHelper ? 'No requests yet' : 'No requests sent yet'}
              </p>
              <p className="text-sm text-gray-400 mb-4">
                {isHelper
                  ? 'When someone books you, their request will appear here.'
                  : 'Find a helper and send your first request.'}
              </p>
              {!isHelper && (
                <Link href="/taskers"
                  className="inline-block rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
                  style={{ background: 'linear-gradient(90deg,#2563EB,#38BDF8)' }}>
                  Find a helper
                </Link>
              )}
            </div>
          ) : (
            <>
              {/* Status filter row */}
              <div className="flex flex-wrap gap-2 mb-6">
                {(['all', 'pending', 'accepted', 'declined'] as const).map(f => {
                  const count = f === 'all' ? bookings.length : bookings.filter(b => b.status === f).length
                  return (
                    <span key={f} className="rounded-full px-3 py-1 text-xs font-semibold bg-white border border-gray-200 text-gray-600">
                      {f.charAt(0).toUpperCase() + f.slice(1)} ({count})
                    </span>
                  )
                })}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {bookings.map(booking => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    isHelper={isHelper}
                    onUpdate={handleBookingUpdate}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </main>
  )
}
