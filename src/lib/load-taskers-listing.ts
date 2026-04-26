import { createClient } from '@/lib/supabase/server'
import { FEATURES } from '@/lib/features'

export type TaskerListItem = {
  id: string
  display_name: string
  bio: string
  hourly_rate: number
  categories: string[]
  location: string
  latitude: number | null
  longitude: number | null
  verified: boolean
  tasks_done: number
  rating: number
  review_count: number
  response_hours: number
  avatar_url: string | null
  languages: string[]
  brings_tools: boolean
  can_invoice: boolean
}

const SAMPLE_TASKERS = [
  { id: 's1',  display_name: 'Maria K.',   bio: 'Professional cleaner with 5 years experience. I bring my own supplies and love a spotless home.', hourly_rate: 350, categories: ['Cleaning'], location: 'Oslo', verified: true, tasks_done: 52, rating: 4.9, response_hours: 1, languages: ['no', 'en'], brings_tools: true, can_invoice: false },
  { id: 's2',  display_name: 'Erik R.',    bio: 'Strong and reliable. I have a van and help with moves, heavy lifting, and furniture assembly.', hourly_rate: 500, categories: ['Moving', 'Furniture Assembly'], location: 'Bergen', verified: true, tasks_done: 38, rating: 4.8, response_hours: 2, languages: ['no', 'en'], brings_tools: true, can_invoice: true },
  { id: 's3',  display_name: 'Amina S.',   bio: 'Math and science tutor for all ages. Native English speaker. 4 years tutoring experience.', hourly_rate: 400, categories: ['Tutoring', 'Music Lessons'], location: 'Oslo', verified: true, tasks_done: 74, rating: 5.0, response_hours: 1, languages: ['en'], brings_tools: false, can_invoice: false },
  { id: 's4',  display_name: 'Jonas B.',   bio: 'IT professional. I fix computers, set up networks, and help with phones and smart devices.', hourly_rate: 450, categories: ['IT & Tech'], location: 'Trondheim', verified: false, tasks_done: 29, rating: 4.7, response_hours: 3, languages: ['no', 'en'], brings_tools: true, can_invoice: true },
  { id: 's5',  display_name: 'Sara L.',    bio: 'Event coordinator and portrait photographer. Birthdays, corporate events, and photoshoots.', hourly_rate: 380, categories: ['Events', 'Photography'], location: 'Oslo', verified: true, tasks_done: 41, rating: 4.8, response_hours: 2, languages: ['no'], brings_tools: true, can_invoice: true },
  { id: 's6',  display_name: 'Mikkel T.',  bio: 'Handyman for all small repairs — painting, shelves, furniture assembly, plumbing fixes.', hourly_rate: 420, categories: ['Handyman', 'Furniture Assembly'], location: 'Stavanger', verified: true, tasks_done: 63, rating: 4.9, response_hours: 1, languages: ['no'], brings_tools: true, can_invoice: true },
  { id: 's7',  display_name: 'Leila H.',   bio: 'Dog walker and pet sitter. Available weekdays and weekends. Insured and first-aid certified.', hourly_rate: 250, categories: ['Dog Walking', 'Pet Care'], location: 'Oslo', verified: true, tasks_done: 87, rating: 5.0, response_hours: 1, languages: ['no', 'en'], brings_tools: false, can_invoice: false },
  { id: 's8',  display_name: 'Tor A.',     bio: 'Snow removal and garden maintenance all year round. I have my own equipment and a truck.', hourly_rate: 400, categories: ['Snow Removal', 'Gardening'], location: 'Oslo', verified: true, tasks_done: 115, rating: 4.9, response_hours: 2, languages: ['no'], brings_tools: true, can_invoice: true },
  { id: 's9',  display_name: 'Hana M.',    bio: 'Certified personal trainer. Home visits, park sessions, or online. All fitness levels welcome.', hourly_rate: 550, categories: ['Personal Training'], location: 'Bergen', verified: true, tasks_done: 33, rating: 4.8, response_hours: 3, languages: ['en'], brings_tools: false, can_invoice: false },
  { id: 's10', display_name: 'Kari N.',    bio: 'Friendly companion and errand runner for the elderly. Patience, care, and reliability are my strengths.', hourly_rate: 280, categories: ['Elder Care', 'Shopping'], location: 'Trondheim', verified: true, tasks_done: 58, rating: 5.0, response_hours: 1, languages: ['no'], brings_tools: false, can_invoice: false },
  { id: 's11', display_name: 'Lars P.',    bio: 'Professional window cleaner. Residential and commercial. Rope access certified for high buildings.', hourly_rate: 350, categories: ['Window Cleaning', 'Cleaning'], location: 'Oslo', verified: false, tasks_done: 44, rating: 4.7, response_hours: 4, languages: ['no', 'en'], brings_tools: true, can_invoice: true },
  { id: 's12', display_name: 'Nadia C.',   bio: 'IKEA-certified furniture assembler. Fast, tidy, and I always double-check the instructions.', hourly_rate: 320, categories: ['Furniture Assembly'], location: 'Oslo', verified: true, tasks_done: 72, rating: 4.9, response_hours: 2, languages: ['en'], brings_tools: true, can_invoice: false },
]

type HelperProfileRow = {
  id: string
  display_name: string | null
  bio: string | null
  hourly_rate: number | null
  categories: string[] | null
  location: string | null
  latitude: number | null
  longitude: number | null
  verified: boolean | null
  tasks_done: number | null
  rating: number | null
  avg_rating: number | null
  review_count: number | null
  response_hours: number | null
  avatar_url: string | null
  languages: string[] | null
  brings_tools: boolean | null
  can_invoice: boolean | null
}

export async function loadTaskersListing(activeCategory?: string | null): Promise<{ taskers: TaskerListItem[]; activeCategory: string | null }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name, bio, hourly_rate, categories, location, latitude, longitude, verified, tasks_done, rating, avg_rating, review_count, response_hours, avatar_url, languages, brings_tools, can_invoice')
    .eq('role', 'helper')
    .order('tasks_done', { ascending: false })
    .limit(100)

  let ownHelperProfile: HelperProfileRow | null = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('id, display_name, bio, hourly_rate, categories, location, latitude, longitude, verified, tasks_done, rating, avg_rating, review_count, response_hours, avatar_url, languages, brings_tools, can_invoice, role')
      .eq('id', user.id)
      .single()
    if (data?.role === 'helper') {
      ownHelperProfile = {
        id: data.id,
        display_name: data.display_name,
        bio: data.bio,
        hourly_rate: data.hourly_rate,
        categories: data.categories,
        location: data.location,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        verified: data.verified,
        tasks_done: data.tasks_done,
        rating: data.rating,
        avg_rating: data.avg_rating,
        review_count: data.review_count,
        response_hours: data.response_hours,
        avatar_url: data.avatar_url,
        languages: data.languages,
        brings_tools: data.brings_tools,
        can_invoice: data.can_invoice,
      }
    }
  }

  const mergedProfiles = [...(profiles ?? [])]
  if (ownHelperProfile && !mergedProfiles.some(p => p.id === ownHelperProfile?.id)) {
    mergedProfiles.unshift(ownHelperProfile)
  }

  const hasRealData = mergedProfiles.length > 0
  const taskers: TaskerListItem[] = hasRealData
    ? mergedProfiles
        .filter(p => (p.categories?.length ?? 0) > 0)
        .map(p => ({
          id: p.id,
          display_name: p.display_name?.trim() || 'Helper',
          bio: p.bio?.trim() || 'Ready to help with local jobs and services.',
          hourly_rate: p.hourly_rate ?? 0,
          categories: p.categories ?? [],
          location: p.location?.trim() || 'Norway',
          latitude: p.latitude ?? null,
          longitude: p.longitude ?? null,
          verified: Boolean(p.verified),
          tasks_done: p.tasks_done ?? 0,
          rating: (p.avg_rating ?? p.rating ?? 0),
          review_count: p.review_count ?? 0,
          response_hours: p.response_hours ?? 24,
          avatar_url: p.avatar_url ?? null,
          languages: p.languages ?? [],
          brings_tools: Boolean(p.brings_tools),
          can_invoice: Boolean(p.can_invoice),
        }))
    : (FEATURES.enableDemoData
        ? SAMPLE_TASKERS.map(p => ({
            ...p,
            latitude: null,
            longitude: null,
            avatar_url: null,
            review_count: 0,
            languages: p.languages ?? [],
            brings_tools: Boolean(p.brings_tools),
            can_invoice: Boolean(p.can_invoice),
          }))
        : [])

  return { taskers, activeCategory: activeCategory ?? null }
}
