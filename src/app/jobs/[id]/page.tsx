import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import JsonLd from '@/components/JsonLd'
import { resolveSeoLocale } from '@/lib/seo'
import JobPostContent from './JobPostContent'

export const dynamic = 'force-dynamic'

const BASE = 'https://hire2skill.com'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: post } = await supabase
    .from('posts')
    .select('title, description, category, location')
    .eq('id', id)
    .single()

  if (!post) return {}

  const headerStore = await headers()
  const locale = resolveSeoLocale(headerStore.get('accept-language'))
  const ogLocale =
    locale === 'no' ? 'nb_NO' : locale === 'da' ? 'da_DK' : locale === 'sv' ? 'sv_SE' : 'en_GB'

  const title = post.title ?? 'Job Post'
  const description = (
    post.description?.trim() ||
    `${post.category} job in ${post.location} — find a helper on Hire2Skill.`
  ).slice(0, 155)

  return {
    title,
    description,
    openGraph: {
      title: `${title} | Hire2Skill`,
      description,
      url: `${BASE}/jobs/${id}`,
      type: 'website' as const,
      locale: ogLocale,
    },
    alternates: { canonical: `/jobs/${id}` },
  }
}

export default async function JobPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: post }, { data: { user } }] = await Promise.all([
    supabase
      .from('posts')
      .select('id, user_id, title, description, category, location, price, created_at, status')
      .eq('id', id)
      .single(),
    supabase.auth.getUser(),
  ])

  if (!post || (post.status !== null && post.status !== 'open')) notFound()

  const [{ data: poster }, { count: proposalCount }] = await Promise.all([
    supabase.from('profiles').select('display_name').eq('id', post.user_id).single(),
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('post_id', id),
  ])

  const jobSchema = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: post.title,
    description: post.description,
    datePosted: post.created_at,
    validThrough: null,
    jobLocation: {
      '@type': 'Place',
      address: { '@type': 'PostalAddress', addressLocality: post.location, addressCountry: 'NO' },
    },
    hiringOrganization: {
      '@type': 'Organization',
      name: 'Hire2Skill',
      sameAs: BASE,
    },
    ...(post.price
      ? {
          baseSalary: {
            '@type': 'MonetaryAmount',
            currency: 'NOK',
            value: { '@type': 'QuantitativeValue', value: post.price },
          },
        }
      : {}),
  }

  return (
    <>
      <JsonLd data={jobSchema} />
      <JobPostContent
        post={{
          id: post.id,
          posterId: post.user_id,
          posterName: poster?.display_name ?? 'Customer',
          title: post.title ?? 'Untitled job',
          description: post.description ?? '',
          category: post.category ?? 'General',
          location: post.location ?? 'Norway',
          budget: post.price ?? null,
          createdAt: post.created_at,
          proposalCount: proposalCount ?? 0,
        }}
        currentUserId={user?.id ?? null}
      />
    </>
  )
}
