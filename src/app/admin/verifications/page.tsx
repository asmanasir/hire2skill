import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminVerificationsContent from './AdminVerificationsContent'

export const dynamic = 'force-dynamic'

export default async function AdminVerificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) redirect('/')

  const { data: pending } = await supabase
    .from('profiles')
    .select('id, display_name, verification_status, verification_doc_url, verification_submitted_at, verification_note, location, categories, avg_rating, tasks_done')
    .in('verification_status', ['pending', 'verified', 'rejected'])
    .order('verification_submitted_at', { ascending: true })

  return <AdminVerificationsContent submissions={pending ?? []} />
}
