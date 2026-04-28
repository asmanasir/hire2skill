import { createClient } from '@/lib/supabase/server'
import HomeContent from './HomeContent'
import JsonLd from '@/components/JsonLd'
import { FEATURES } from '@/lib/features'

export const metadata = {
  title: 'Hire2Skill — Find Local Helpers in Norway',
  description: 'Book verified local helpers for cleaning, moving, tutoring, handyman work and more. Serving Oslo, Bergen, Trondheim, Stavanger and across Norway.',
  openGraph: {
    title: 'Hire2Skill — Find Local Helpers in Norway',
    description: 'Book verified local helpers for cleaning, moving, tutoring, handyman work and more across Norway.',
    url: 'https://hire2skill.com',
    type: 'website',
  },
}

export type RealHelper = {
  id: string
  name: string
  avatarUrl: string | null
  location: string
  categories: string[]
  hourlyRate: number | null
}

export default async function Home() {
  const supabase = await createClient()
  const now = Date.now()
  const recentJobWindowMs = FEATURES.recentJobsWindowHours * 60 * 60 * 1000

  const [
    { data: recentPosts },
    { data: helperProfiles },
  ] = await Promise.all([
    supabase.from('posts')
      .select('id, title, description, category, location, price, status, created_at')
      .order('created_at', { ascending: false })
      .limit(20),
    supabase.from('profiles')
      .select('id, display_name, avatar_url, categories, location, hourly_rate')
      .eq('role', 'helper')
      .not('display_name', 'is', null)
      .not('location', 'is', null)
      .not('categories', 'is', null)
      .order('created_at', { ascending: false })
      .limit(6),
  ])

  const jobs = (recentPosts ?? [])
    .filter((p) => !['cancelled', 'completed', 'closed'].includes((p.status ?? '').toLowerCase()))
    .filter((p) => {
      const createdAt = p.created_at ? new Date(p.created_at).getTime() : 0
      return createdAt > 0 && now - createdAt <= recentJobWindowMs
    })
    .slice(0, 5)
    .map(({ status: _status, ...p }) => ({ ...p, urgent: false }))

  const helpers: RealHelper[] | null =
    helperProfiles && helperProfiles.length >= 1
      ? helperProfiles.slice(0, 3).map(p => ({
          id: p.id,
          name: p.display_name ?? 'Helper',
          avatarUrl: p.avatar_url ?? null,
          location: p.location ?? 'Norway',
          categories: (p.categories as string[] | null) ?? [],
          hourlyRate: p.hourly_rate ?? null,
        }))
      : (FEATURES.enableDemoData ? null : [])

  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Hire2Skill',
    url: 'https://hire2skill.com',
    description: 'Hire2Skill connects people with verified local helpers across Norway.',
    areaServed: { '@type': 'Country', name: 'Norway' },
  }

  return (
    <>
      <JsonLd data={orgSchema} />
      <HomeContent jobs={jobs} helpers={helpers} enableDemoData={FEATURES.enableDemoData} />
    </>
  )
}
