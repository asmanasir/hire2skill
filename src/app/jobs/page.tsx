import { createClient } from '@/lib/supabase/server'
import JobsContent from './JobsContent'
import { loadJobsListing } from '@/lib/load-jobs-listing'

export const metadata = {
  title: 'Find Jobs',
  description: 'Browse open jobs posted by customers and send your proposal.',
  alternates: {
    canonical: '/jobs',
  },
}

export default async function JobsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const jobs = await loadJobsListing()
  return <JobsContent jobs={jobs} currentUserId={user?.id ?? null} />
}

