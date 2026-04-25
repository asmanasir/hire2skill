import { headers } from 'next/headers'
import TaskersContent from './TaskersContent'
import { loadTaskersListing } from '@/lib/load-taskers-listing'

function resolveMetaLocale(acceptLanguage: string | null): 'no' | 'da' | 'sv' | 'en' {
  if (!acceptLanguage) return 'no'
  const lower = acceptLanguage.toLowerCase()
  if (lower.includes('nb') || lower.includes('nn') || lower.includes('no')) return 'no'
  if (lower.includes('da')) return 'da'
  if (lower.includes('sv')) return 'sv'
  return 'en'
}

function taskersMetaByLocale(locale: 'no' | 'da' | 'sv' | 'en') {
  switch (locale) {
    case 'no':
      return {
        title: 'Finn lokale hjelpere',
        description: 'Finn verifiserte hjelpere i ditt område. Søk etter tjeneste, sted, pris og vurdering. Book rengjoring, flytting, undervisning og mer i hele Norge.',
      }
    case 'da':
      return {
        title: 'Find lokale hjælpere',
        description: 'Find verificerede hjælpere i dit område. Sog efter service, sted, pris og vurdering. Book rengoring, flytning, undervisning og mere i hele Norge.',
      }
    case 'sv':
      return {
        title: 'Hitta lokala hjalpare',
        description: 'Hitta verifierade hjalpare i ditt omrade. Sok efter tjanst, plats, pris och betyg. Boka stadning, flytt, handledning och mer i hela Norge.',
      }
    default:
      return {
        title: 'Browse Local Helpers',
        description: 'Find verified helpers in your area. Search by service, location, price and rating. Book cleaners, movers, tutors, handymen and more across Norway.',
      }
  }
}

export async function generateMetadata() {
  const headerStore = await headers()
  const locale = resolveMetaLocale(headerStore.get('accept-language'))
  const copy = taskersMetaByLocale(locale)

  return {
    title: copy.title,
    description: copy.description,
    openGraph: {
      title: `${copy.title} | Hire2Skill`,
      description: copy.description,
      url: 'https://hire2skill.com/taskers',
      locale: locale === 'no' ? 'nb_NO' : locale === 'da' ? 'da_DK' : locale === 'sv' ? 'sv_SE' : 'en_GB',
    },
  }
}

export default async function TaskersPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams
  const { taskers, activeCategory } = await loadTaskersListing(category ?? null)
  return <TaskersContent taskers={taskers} activeCategory={activeCategory} citySlug={null} />
}
