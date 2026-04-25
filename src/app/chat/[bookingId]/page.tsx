import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ChatThread from './ChatThread'

export type ChatMessage = {
  id: string
  created_at: string
  sender_id: string
  body: string
  read_at: string | null
}

export type BookingThreadMeta = {
  status: string
  budget: number | null
  message: string | null
  poster_id: string
  helper_id: string
  post_id: string | null
  post_title: string | null
  post_category: string | null
  post_location: string | null
}

function extractJobRefId(text: string | null | undefined): string | null {
  if (!text) return null
  const m = text.match(/^\s*\[JOB:([0-9a-f-]{36})\]/i)
  return m?.[1] ?? null
}

export default async function ChatThreadPage({
  params,
}: {
  params: Promise<{ bookingId: string }>
}) {
  const { bookingId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/chat/${bookingId}`)

  const { data: booking } = await supabase
    .from('bookings')
    .select('id, poster_id, helper_id, status, message, budget, post_id')
    .eq('id', bookingId)
    .single()

  if (!booking || (booking.poster_id !== user.id && booking.helper_id !== user.id)) {
    redirect('/chat')
  }

  const otherId = booking.poster_id === user.id ? booking.helper_id : booking.poster_id
  const jobId = booking.post_id ?? extractJobRefId((booking as { message?: string | null }).message ?? null)

  const [{ data: otherProfile }, { data: initialMessages }, { data: post }] = await Promise.all([
    supabase.from('profiles').select('id, display_name, avatar_url').eq('id', otherId).single(),
    supabase.from('messages')
      .select('id, created_at, sender_id, body, read_at')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: true })
      .limit(100),
    jobId
      ? supabase.from('posts').select('id, title, category, location').eq('id', jobId).maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  // Mark received unread messages as read on open
  const unreadIds = (initialMessages ?? [])
    .filter(m => m.sender_id !== user.id && !m.read_at)
    .map(m => m.id)

  if (unreadIds.length > 0) {
    await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .in('id', unreadIds)
  }

  const bookingMeta: BookingThreadMeta = {
    status: booking.status,
    budget: (booking as { budget?: number | null }).budget ?? null,
    message: (booking as { message?: string | null }).message ?? null,
    poster_id: booking.poster_id,
    helper_id: booking.helper_id,
    post_id: jobId ?? null,
    post_title: post?.title ?? null,
    post_category: post?.category ?? null,
    post_location: post?.location ?? null,
  }

  return (
    <ChatThread
      bookingId={bookingId}
      currentUserId={user.id}
      otherName={otherProfile?.display_name ?? null}
      otherAvatar={otherProfile?.avatar_url ?? null}
      initialMessages={(initialMessages ?? []) as ChatMessage[]}
      initialBooking={bookingMeta}
    />
  )
}
