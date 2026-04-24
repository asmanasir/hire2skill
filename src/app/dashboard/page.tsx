import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardContent from './DashboardContent'

export type Post = {
  id: string
  title: string
  category: string
  location: string
  status: string
  created_at: string
}

export type BookingItem = {
  id: string
  created_at: string
  status: string
  message: string
  scheduled_date: string | null
  budget: number | null
  poster_id: string
  helper_id: string
  other_display_name: string | null
  other_avatar_url: string | null
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ posted?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { posted } = await searchParams

  const [{ count: postCount }, { data: recentPosts }, { data: profile }] = await Promise.all([
    supabase.from('posts').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('posts').select('id, title, category, location, status, created_at')
      .eq('user_id', user.id).order('created_at', { ascending: false }).limit(30),
    supabase.from('profiles').select('role').eq('id', user.id).single(),
  ])

  const role = (profile?.role ?? null) as 'helper' | 'poster' | null

  let bookings: BookingItem[] = []

  try {
    if (role === 'helper') {
      const { data: raw } = await supabase
        .from('bookings')
        .select('id, created_at, status, message, scheduled_date, budget, poster_id, helper_id')
        .eq('helper_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30)

      if (raw && raw.length > 0) {
        const ids = [...new Set(raw.map(b => b.poster_id))]
        const { data: profiles } = await supabase
          .from('profiles').select('id, display_name, avatar_url').in('id', ids)
        const map = Object.fromEntries((profiles ?? []).map(p => [p.id, p]))
        bookings = raw.map(b => ({
          ...b,
          other_display_name: map[b.poster_id]?.display_name ?? null,
          other_avatar_url: map[b.poster_id]?.avatar_url ?? null,
        }))
      }
    } else {
      const { data: raw } = await supabase
        .from('bookings')
        .select('id, created_at, status, message, scheduled_date, budget, poster_id, helper_id')
        .eq('poster_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30)

      if (raw && raw.length > 0) {
        const ids = [...new Set(raw.map(b => b.helper_id))]
        const { data: profiles } = await supabase
          .from('profiles').select('id, display_name, avatar_url').in('id', ids)
        const map = Object.fromEntries((profiles ?? []).map(p => [p.id, p]))
        bookings = raw.map(b => ({
          ...b,
          other_display_name: map[b.helper_id]?.display_name ?? null,
          other_avatar_url: map[b.helper_id]?.avatar_url ?? null,
        }))
      }
    }
  } catch {
    // bookings table not yet created — degrade gracefully
  }

  const pendingCount = bookings.filter(b => b.status === 'pending').length

  return (
    <DashboardContent
      email={user.email ?? ''}
      postCount={postCount ?? 0}
      recentPosts={recentPosts ?? []}
      posted={posted === '1'}
      role={role}
      bookings={bookings}
      pendingCount={pendingCount}
    />
  )
}
