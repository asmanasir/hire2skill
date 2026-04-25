import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import TaskersContent from '@/app/taskers/TaskersContent'
import { loadTaskersListing } from '@/lib/load-taskers-listing'
import { isCityLandingSlug, type CityLandingSlug } from '@/lib/helper-city-key'

function resolveMetaLocale(acceptLanguage: string | null): 'no' | 'da' | 'sv' | 'en' {
  if (!acceptLanguage) return 'no'
  const lower = acceptLanguage.toLowerCase()
  if (lower.includes('nb') || lower.includes('nn') || lower.includes('no')) return 'no'
  if (lower.includes('da')) return 'da'
  if (lower.includes('sv')) return 'sv'
  return 'en'
}

function cityMeta(city: CityLandingSlug, locale: 'no' | 'da' | 'sv' | 'en') {
  const names = { oslo: 'Oslo', bergen: 'Bergen', trondheim: 'Trondheim' }
  const n = names[city]
  switch (locale) {
    case 'no':
      return {
        title: `Lokale hjelpere i ${n}`,
        description: `Finn verifiserte hjelpere i ${n}. Rengjøring, flytting, handverk, IT-hjelp og mer — book trygg hjelp på Hire2Skill.`,
      }
    case 'da':
      return {
        title: `Lokale hjælpere i ${n}`,
        description: `Find verificerede hjælpere i ${n}. Rengøring, flytning, handværk, IT-hjælp og mere — book tryg hjælp på Hire2Skill.`,
      }
    case 'sv':
      return {
        title: `Lokala hjälpare i ${n}`,
        description: `Hitta verifierade hjälpare i ${n}. Städning, flytt, hantverk, IT-support och mer — boka trygg hjälp på Hire2Skill.`,
      }
    default:
      return {
        title: `Local helpers in ${n}`,
        description: `Find verified helpers in ${n}. Cleaning, moving, handyman, IT help and more — book trusted local help on Hire2Skill.`,
      }
  }
}

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }) {
  const { city: raw } = await params
  const city = raw.toLowerCase()
  if (!isCityLandingSlug(city)) return {}
  const headerStore = await headers()
  const locale = resolveMetaLocale(headerStore.get('accept-language'))
  const copy = cityMeta(city, locale)
  return {
    title: copy.title,
    description: copy.description,
    openGraph: {
      title: `${copy.title} | Hire2Skill`,
      description: copy.description,
      url: `https://hire2skill.com/cities/${city}`,
      locale: locale === 'no' ? 'nb_NO' : locale === 'da' ? 'da_DK' : locale === 'sv' ? 'sv_SE' : 'en_GB',
    },
  }
}

export default async function CityHelpersPage({
  params,
  searchParams,
}: {
  params: Promise<{ city: string }>
  searchParams: Promise<{ category?: string }>
}) {
  const { city: raw } = await params
  const city = raw.toLowerCase()
  if (!isCityLandingSlug(city)) notFound()

  const { category } = await searchParams
  const { taskers, activeCategory } = await loadTaskersListing(category ?? null)

  return <TaskersContent taskers={taskers} activeCategory={activeCategory} citySlug={city} />
}
