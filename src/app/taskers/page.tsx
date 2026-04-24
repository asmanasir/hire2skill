import { createClient } from '@/lib/supabase/server'
import TaskersContent from './TaskersContent'

const SAMPLE_TASKERS = [
  { id: 's1',  display_name: 'Maria K.',   bio: 'Professional cleaner with 5 years experience. I bring my own supplies and love a spotless home.', hourly_rate: 350, categories: ['Cleaning'], location: 'Oslo', verified: true, tasks_done: 52, rating: 4.9, response_hours: 1 },
  { id: 's2',  display_name: 'Erik R.',    bio: 'Strong and reliable. I have a van and help with moves, heavy lifting, and furniture assembly.', hourly_rate: 500, categories: ['Moving', 'Furniture Assembly'], location: 'Bergen', verified: true, tasks_done: 38, rating: 4.8, response_hours: 2 },
  { id: 's3',  display_name: 'Amina S.',   bio: 'Math and science tutor for all ages. Native English speaker. 4 years tutoring experience.', hourly_rate: 400, categories: ['Tutoring', 'Music Lessons'], location: 'Oslo', verified: true, tasks_done: 74, rating: 5.0, response_hours: 1 },
  { id: 's4',  display_name: 'Jonas B.',   bio: 'IT professional. I fix computers, set up networks, and help with phones and smart devices.', hourly_rate: 450, categories: ['IT & Tech'], location: 'Trondheim', verified: false, tasks_done: 29, rating: 4.7, response_hours: 3 },
  { id: 's5',  display_name: 'Sara L.',    bio: 'Event coordinator and portrait photographer. Birthdays, corporate events, and photoshoots.', hourly_rate: 380, categories: ['Events', 'Photography'], location: 'Oslo', verified: true, tasks_done: 41, rating: 4.8, response_hours: 2 },
  { id: 's6',  display_name: 'Mikkel T.',  bio: 'Handyman for all small repairs — painting, shelves, furniture assembly, plumbing fixes.', hourly_rate: 420, categories: ['Handyman', 'Furniture Assembly'], location: 'Stavanger', verified: true, tasks_done: 63, rating: 4.9, response_hours: 1 },
  { id: 's7',  display_name: 'Leila H.',   bio: 'Dog walker and pet sitter. Available weekdays and weekends. Insured and first-aid certified.', hourly_rate: 250, categories: ['Dog Walking', 'Pet Care'], location: 'Oslo', verified: true, tasks_done: 87, rating: 5.0, response_hours: 1 },
  { id: 's8',  display_name: 'Tor A.',     bio: 'Snow removal and garden maintenance all year round. I have my own equipment and a truck.', hourly_rate: 400, categories: ['Snow Removal', 'Gardening'], location: 'Oslo', verified: true, tasks_done: 115, rating: 4.9, response_hours: 2 },
  { id: 's9',  display_name: 'Hana M.',    bio: 'Certified personal trainer. Home visits, park sessions, or online. All fitness levels welcome.', hourly_rate: 550, categories: ['Personal Training'], location: 'Bergen', verified: true, tasks_done: 33, rating: 4.8, response_hours: 3 },
  { id: 's10', display_name: 'Kari N.',    bio: 'Friendly companion and errand runner for the elderly. Patience, care, and reliability are my strengths.', hourly_rate: 280, categories: ['Elder Care', 'Shopping'], location: 'Trondheim', verified: true, tasks_done: 58, rating: 5.0, response_hours: 1 },
  { id: 's11', display_name: 'Lars P.',    bio: 'Professional window cleaner. Residential and commercial. Rope access certified for high buildings.', hourly_rate: 350, categories: ['Window Cleaning', 'Cleaning'], location: 'Oslo', verified: false, tasks_done: 44, rating: 4.7, response_hours: 4 },
  { id: 's12', display_name: 'Nadia C.',   bio: 'IKEA-certified furniture assembler. Fast, tidy, and I always double-check the instructions.', hourly_rate: 320, categories: ['Furniture Assembly'], location: 'Oslo', verified: true, tasks_done: 72, rating: 4.9, response_hours: 2 },
]

export default async function TaskersPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams
  const supabase = await createClient()

  const query = supabase
    .from('profiles')
    .select('*')
    .eq('role', 'helper')
    .is('deleted_at', null)
    .order('tasks_done', { ascending: false })
    .limit(20)

  const { data: profiles } = category
    ? await query.contains('categories', [category])
    : await query

  // Use real DB data when any real helpers exist; fall back to sample only when DB is empty
  const hasRealData = profiles && profiles.length > 0
  const taskers = hasRealData
    ? profiles
    : SAMPLE_TASKERS.filter(t => !category || t.categories.includes(category))

  return <TaskersContent taskers={taskers} activeCategory={category ?? null} />
}
