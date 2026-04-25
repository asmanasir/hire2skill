'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Role = 'helper' | 'poster' | null
type BellItem = {
  id: string
  text: string
  href: string
  createdAt: string
}

export default function RequestBell({ userId }: { userId: string }) {
  const [count, setCount] = useState(0)
  const [role, setRole] = useState<Role>(null)
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<BellItem[]>([])
  const [unreadItems, setUnreadItems] = useState(0)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createClient()
    let active = true

    async function loadRoleAndCount() {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()
      const resolvedRole = (profile?.role ?? null) as Role
      if (!active) return
      setRole(resolvedRole)
      if (!resolvedRole) {
        setCount(0)
        return
      }
      const { count: c } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq(resolvedRole === 'helper' ? 'helper_id' : 'poster_id', userId)
        .eq('status', resolvedRole === 'helper' ? 'pending' : 'accepted')
      if (active) setCount(c ?? 0)
    }

    void loadRoleAndCount()

    function pushItem(text: string, href: string, createdAt?: string) {
      setItems(prev => [
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          text,
          href,
          createdAt: createdAt ?? new Date().toISOString(),
        },
        ...prev,
      ].slice(0, 12))
      setUnreadItems(v => v + 1)
    }

    async function profileName(id: string) {
      const { data } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', id)
        .single()
      return data?.display_name ?? 'Someone'
    }

    const helperChannel = supabase
      .channel(`request-bell-helper-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings', filter: `helper_id=eq.${userId}` },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async (payload: any) => {
          if (payload?.eventType === 'INSERT' && payload?.new?.status === 'pending') {
            const who = await profileName(payload.new.poster_id)
            pushItem(`${who} sent you a request`, '/dashboard', payload.new.created_at)
          }
          void loadRoleAndCount()
        },
      )
      .subscribe()

    const posterChannel = supabase
      .channel(`request-bell-poster-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings', filter: `poster_id=eq.${userId}` },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async (payload: any) => {
          if (payload?.eventType === 'UPDATE') {
            const before = payload?.old?.status
            const after = payload?.new?.status
            if (before !== after && (after === 'accepted' || after === 'declined')) {
              const who = await profileName(payload.new.helper_id)
              pushItem(
                after === 'accepted'
                  ? `${who} accepted your request`
                  : `${who} declined your request`,
                '/dashboard',
                payload.new.updated_at ?? payload.new.created_at,
              )
            }
          }
          void loadRoleAndCount()
        },
      )
      .subscribe()

    const messagesChannel = supabase
      .channel(`request-bell-messages-${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async (payload: any) => {
          const bookingId = payload?.new?.booking_id as string | undefined
          const senderId = payload?.new?.sender_id as string | undefined
          if (!bookingId || !senderId || senderId === userId) return
          const { data: booking } = await supabase
            .from('bookings')
            .select('poster_id, helper_id')
            .eq('id', bookingId)
            .single()
          if (!booking) return
          const isParticipant = booking.poster_id === userId || booking.helper_id === userId
          if (!isParticipant) return
          const who = await profileName(senderId)
          pushItem(`${who} sent you a new message`, `/chat/${bookingId}`, payload.new.created_at)
        },
      )
      .subscribe()

    return () => {
      active = false
      void supabase.removeChannel(helperChannel)
      void supabase.removeChannel(posterChannel)
      void supabase.removeChannel(messagesChannel)
    }
  }, [userId])

  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (!panelRef.current) return
      if (!panelRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocMouseDown)
    return () => document.removeEventListener('mousedown', onDocMouseDown)
  }, [])

  const totalBadge = useMemo(() => count + unreadItems, [count, unreadItems])

  if (!role) return null

  return (
    <div ref={panelRef} className="hidden sm:block relative">
      <button
        type="button"
        onClick={() => {
          setOpen(v => !v)
          setUnreadItems(0)
        }}
        className="inline-flex relative h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors"
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell size={16} />
        {totalBadge > 0 && (
          <span className="absolute -top-1.5 -right-1.5 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] leading-none font-bold text-white min-w-[16px] text-center">
            {totalBadge > 99 ? '99+' : totalBadge}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-gray-200 bg-white shadow-xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <p className="text-sm font-bold text-gray-900">Notifications</p>
            <Link href="/dashboard" className="text-xs font-semibold text-blue-600 hover:underline" onClick={() => setOpen(false)}>
              Open dashboard
            </Link>
          </div>
          {items.length === 0 ? (
            <p className="px-4 py-6 text-xs text-gray-400">No new notifications yet.</p>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {items.map(item => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50"
                >
                  <p className="text-sm text-gray-700">{item.text}</p>
                  <p className="text-[11px] text-gray-400 mt-1">{new Date(item.createdAt).toLocaleString()}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
