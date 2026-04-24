import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileContent from './ProfileContent'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/profile')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: posts } = await supabase
    .from('posts')
    .select('id, title, category, status, created_at')
    .eq('user_id', user.id)
    .neq('status', 'cancelled')
    .order('created_at', { ascending: false })

  return (
    <ProfileContent
      user={{ id: user.id, email: user.email ?? '', created_at: user.created_at }}
      profile={profile ?? null}
      posts={posts ?? []}
    />
  )
}
