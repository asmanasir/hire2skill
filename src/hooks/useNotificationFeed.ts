'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type NotificationRole = 'helper' | 'poster' | null
export type NotificationFeedItem = {
  id: string
  text: string
  href: string
  createdAt: string
  type: 'booking' | 'message'
}

export function useNotificationFeed(userId: string) {
  const readStorageKey = `h2s.readNotifications.${userId}`
  const [role, setRole] = useState<NotificationRole>(null)
  const [items, setItems] = useState<NotificationFeedItem[]>([])
  const [readIds, setReadIds] = useState<Set<string>>(new Set())

  const addReadIds = useCallback((ids: string[]) => {
    if (ids.length === 0) return
    setReadIds((prev) => {
      const next = new Set(prev)
      for (const id of ids) next.add(id)
      return next
    })
  }, [])

  const loadNotifications = useCallback(
    async (supabase = createClient()) => {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).single()
      const resolvedRole = (profile?.role ?? null) as NotificationRole
      setRole(resolvedRole)
      if (!resolvedRole) {
        setItems([])
        return
      }

      const partyColumn = resolvedRole === 'helper' ? 'helper_id' : 'poster_id'
      const { data: bookingRows } = await supabase
        .from('bookings')
        .select('id, poster_id, helper_id, status, created_at, updated_at')
        .eq(partyColumn, userId)
        .order('created_at', { ascending: false })
        .limit(30)

      const bookings = bookingRows ?? []
      const otherIds = [...new Set(bookings.map((b) => (resolvedRole === 'helper' ? b.poster_id : b.helper_id)))]
      const bookingIds = bookings.map((b) => b.id)

      const [{ data: profiles }, { data: unreadMessages }] = await Promise.all([
        otherIds.length > 0
          ? supabase.from('profiles').select('id, display_name').in('id', otherIds)
          : Promise.resolve({ data: [] as { id: string; display_name: string | null }[] }),
        bookingIds.length > 0
          ? supabase
              .from('messages')
              .select('id, booking_id, sender_id, created_at')
              .in('booking_id', bookingIds)
              .neq('sender_id', userId)
              .is('read_at', null)
              .order('created_at', { ascending: false })
              .limit(60)
          : Promise.resolve({ data: [] as { id: string; booking_id: string; sender_id: string; created_at: string }[] }),
      ])

      const nameById = Object.fromEntries((profiles ?? []).map((p) => [p.id, p.display_name ?? 'Someone']))
      const bookingById = Object.fromEntries(bookings.map((b) => [b.id, b]))
      const next: NotificationFeedItem[] = []

      for (const b of bookings) {
        const otherId = resolvedRole === 'helper' ? b.poster_id : b.helper_id
        const who = nameById[otherId] ?? 'Someone'
        const stamp = b.updated_at ?? b.created_at
        if (resolvedRole === 'helper' && b.status === 'pending') {
          next.push({
            id: `booking:${b.id}:pending:${stamp}`,
            text: `${who} sent you a request`,
            href: `/chat/${b.id}`,
            createdAt: stamp,
            type: 'booking',
          })
        }
        if (b.status === 'accepted' || b.status === 'declined' || b.status === 'cancelled' || b.status === 'completed') {
          const txt =
            b.status === 'accepted'
              ? `${who} accepted`
              : b.status === 'declined'
                ? `${who} declined`
                : b.status === 'cancelled'
                  ? `${who} cancelled this job`
                  : `${who} marked this as completed`
          next.push({
            id: `booking:${b.id}:${b.status}:${stamp}`,
            text: txt,
            href: `/chat/${b.id}`,
            createdAt: stamp,
            type: 'booking',
          })
        }
      }

      const seenBookingMsg = new Set<string>()
      for (const m of unreadMessages ?? []) {
        if (seenBookingMsg.has(m.booking_id)) continue
        seenBookingMsg.add(m.booking_id)
        const booking = bookingById[m.booking_id]
        if (!booking) continue
        const otherId = booking.poster_id === userId ? booking.helper_id : booking.poster_id
        const who = nameById[otherId] ?? 'Someone'
        next.push({
          id: `message:${m.id}`,
          text: `${who} sent you a message`,
          href: `/chat/${m.booking_id}`,
          createdAt: m.created_at,
          type: 'message',
        })
      }

      next.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      setItems(next.slice(0, 20))
    },
    [userId],
  )

  useEffect(() => {
    const supabase = createClient()
    let active = true

    queueMicrotask(() => {
      try {
        const raw = typeof window !== 'undefined' ? window.localStorage.getItem(readStorageKey) : null
        if (raw) setReadIds(new Set(JSON.parse(raw) as string[]))
      } catch {
        // ignore storage parse errors
      }
      void loadNotifications(supabase)
    })

    const helperChannel = supabase
      .channel(`request-bell-helper-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings', filter: `helper_id=eq.${userId}` },
        () => {
          if (active) void loadNotifications(supabase)
        },
      )
      .subscribe()

    const posterChannel = supabase
      .channel(`request-bell-poster-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings', filter: `poster_id=eq.${userId}` },
        () => {
          if (active) void loadNotifications(supabase)
        },
      )
      .subscribe()

    const messagesChannel = supabase
      .channel(`request-bell-messages-${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        () => {
          if (active) void loadNotifications(supabase)
        },
      )
      .subscribe()

    return () => {
      active = false
      void supabase.removeChannel(helperChannel)
      void supabase.removeChannel(posterChannel)
      void supabase.removeChannel(messagesChannel)
    }
  }, [loadNotifications, readStorageKey, userId])

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(readStorageKey, JSON.stringify(Array.from(readIds)))
      }
    } catch {
      // ignore storage write errors
    }
  }, [readIds, readStorageKey])

  const unreadCount = useMemo(() => items.filter((i) => !readIds.has(i.id)).length, [items, readIds])

  return { role, items, readIds, addReadIds, unreadCount, loadNotifications }
}
