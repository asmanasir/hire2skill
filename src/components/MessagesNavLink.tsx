'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Props = {
  userId: string
  initialUnreadCount: number
}

export default function MessagesNavLink({ userId, initialUnreadCount }: Props) {
  const supabase = useMemo(() => createClient(), [])
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount)
  const refreshTimerRef = useRef<number | null>(null)

  const loadUnreadCount = useCallback(async () => {
    try {
      const { data: bookings } = await supabase
        .from('bookings')
        .select('id')
        .or(`helper_id.eq.${userId},poster_id.eq.${userId}`)

      const bookingIds = (bookings ?? []).map((b) => b.id)
      if (bookingIds.length === 0) {
        setUnreadCount(0)
        return
      }

      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .in('booking_id', bookingIds)
        .neq('sender_id', userId)
        .is('read_at', null)

      setUnreadCount(count ?? 0)
    } catch {
      // Keep last known badge state on transient realtime/query errors.
    }
  }, [supabase, userId])

  const scheduleRefresh = useCallback(() => {
    if (refreshTimerRef.current != null) window.clearTimeout(refreshTimerRef.current)
    refreshTimerRef.current = window.setTimeout(() => {
      void loadUnreadCount()
    }, 180)
  }, [loadUnreadCount])

  useEffect(() => {
    const initialLoadTimer = window.setTimeout(() => {
      void loadUnreadCount()
    }, 0)

    const messagesChannel = supabase
      .channel(`nav-messages-${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
        scheduleRefresh()
      })
      .subscribe()

    const bookingsChannel = supabase
      .channel(`nav-bookings-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings', filter: `helper_id=eq.${userId}` },
        () => scheduleRefresh(),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings', filter: `poster_id=eq.${userId}` },
        () => scheduleRefresh(),
      )
      .subscribe()

    return () => {
      window.clearTimeout(initialLoadTimer)
      if (refreshTimerRef.current != null) window.clearTimeout(refreshTimerRef.current)
      void supabase.removeChannel(messagesChannel)
      void supabase.removeChannel(bookingsChannel)
    }
  }, [loadUnreadCount, scheduleRefresh, supabase, userId])

  return (
    <Link href="/chat" className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors">
      Messages
      {unreadCount > 0 && (
        <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-[11px] font-bold text-white leading-none">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  )
}
