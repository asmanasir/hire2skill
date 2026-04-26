'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, X } from 'lucide-react'
import { SERVICES } from '@/lib/services'
import type { ElementType } from 'react'
import {
  AppWindow,
  Baby,
  Barbell,
  Bell,
  Broom,
  Camera,
  Car,
  ChalkboardTeacher,
  Confetti,
  CookingPot,
  Couch,
  Dog,
  Fan,
  FlowerTulip,
  HairDryer,
  Hammer,
  HandHeart,
  House,
  Ladder,
  Lamp,
  Lightning,
  MusicNotes,
  Needle,
  PaintBrushBroad,
  PaintRoller,
  Package,
  PawPrint,
  PersonSimpleRun,
  Pipe,
  ShoppingBag,
  Snowflake,
  Sparkle,
  SteeringWheel,
  Toolbox,
  Trash,
  Truck,
  TShirt,
  Wall,
  Wrench,
  Yarn,
} from '@phosphor-icons/react'
import { categoryIconProps } from '@/lib/category-icon'

const FILTERS: { label: string; categories: string[] }[] = [
  { label: 'All', categories: [] },
  {
    label: 'Home & Cleaning',
    categories: ['Cleaning', 'Window Cleaning', 'Snow Removal', 'Gardening'],
  },
  {
    label: 'Handyman',
    categories: ['Handyman', 'Furniture Assembly', 'Painting'],
  },
  {
    label: 'Moving',
    categories: ['Moving'],
  },
  {
    label: 'Tech',
    categories: ['IT & Tech'],
  },
  {
    label: 'Kids & Pets',
    categories: ['Tutoring', 'Driving Lessons', 'Kids Care', 'Elder Care', 'Pet Care', 'Dog Walking', 'Personal Training', 'Music Lessons'],
  },
  {
    label: 'Events & More',
    categories: ['Events', 'Photography', 'Cooking', 'Baking', 'Makeup Artist', 'Hair Dresser', 'Shopping', 'Delivery', 'Car Wash', 'Knitting', 'Sewing'],
  },
]

const SERVICE_ICON_BY_SLUG: Record<string, ElementType> = {
  cleaning: Broom,
  moving: Truck,
  tutoring: ChalkboardTeacher,
  handyman: Hammer,
  'furniture-assembly': Couch,
  gardening: FlowerTulip,
  'it-tech': AppWindow,
  events: Confetti,
  'pet-care': PawPrint,
  'dog-walking': Dog,
  'snow-removal': Snowflake,
  cooking: CookingPot,
  photography: Camera,
  'personal-training': PersonSimpleRun,
  'window-cleaning': AppWindow,
  painting: PaintRoller,
  'elder-care': HandHeart,
  'kids-care': Baby,
  'music-lessons': MusicNotes,
  shopping: ShoppingBag,
  delivery: Package,
  'makeup-artist': PaintBrushBroad,
  'hair-dresser': HairDryer,
  'car-wash': Car,
  knitting: Yarn,
  sewing: Needle,
  'tv-mounting': AppWindow,
  plumbing: Pipe,
  'electrical-help': Lightning,
  'drywall-repair': Wall,
  'flooring-tiling': House,
  'appliance-repair': Wrench,
  'ceiling-fan': Fan,
  'air-conditioning': Fan,
  'shelf-installation': Ladder,
  'blinds-installation': Lamp,
  'baby-proofing': Baby,
  'light-installation': Sparkle,
  carpentry: Toolbox,
  'cabinet-installation': Toolbox,
  'fence-repair': Wrench,
  'deck-restoration': House,
  'home-theater': AppWindow,
  'home-repairs': Wrench,
  'closet-organization': TShirt,
  'doorbell-installation': Bell,
  'home-maintenance': Wrench,
  'yard-work': FlowerTulip,
  packing: Package,
  'junk-removal': Trash,
  'furniture-rearranging': Couch,
  'heavy-lifting': Barbell,
  'single-item-moving': Truck,
  'spring-cleaning': Broom,
  'picture-hanging': PaintBrushBroad,
  'driving-lessons': SteeringWheel,
  baking: CookingPot,
  'wait-in-line': PersonSimpleRun,
}

export default function ServicesContent() {
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filter = FILTERS.find(f => f.label === activeFilter)!
    return SERVICES.filter(s => {
      const matchesCategory =
        filter.categories.length === 0 || filter.categories.includes(s.category)
      const matchesQuery =
        !q ||
        s.title.toLowerCase().includes(q) ||
        s.headline.toLowerCase().includes(q) ||
        s.subheadline.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.included.some(i => i.toLowerCase().includes(q))
      return matchesCategory && matchesQuery
    })
  }, [query, activeFilter])

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 sm:py-6">

      {/* Search + categories — highlighted panel */}
      <div
        className="mb-6 sm:mb-8 rounded-2xl border-2 border-blue-200/90 bg-gradient-to-b from-white via-white to-blue-50/50 p-3 sm:p-5 shadow-[0_8px_30px_-12px_rgba(30,58,138,0.25)] ring-1 ring-blue-100/80">
        <div className="relative max-w-2xl mx-auto mb-3 sm:mb-4">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 pointer-events-none" strokeWidth={2.25} />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search services — cleaning, plumbing, tutoring…"
            className="w-full rounded-xl border-2 border-blue-200/80 bg-white pl-12 pr-11 py-3 sm:py-3.5 text-base text-gray-900 shadow-inner shadow-blue-900/5
                       placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
              <X size={18} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          {FILTERS.map(f => (
            <button key={f.label} type="button"
              onClick={() => setActiveFilter(f.label)}
              className={`rounded-full px-3.5 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold transition-all ${
                activeFilter === f.label
                  ? 'text-white shadow-md scale-[1.02] ring-2 ring-blue-300/60 ring-offset-1 ring-offset-white'
                  : 'bg-white border-2 border-gray-200/90 text-gray-700 shadow-sm hover:border-blue-400 hover:text-blue-700 hover:shadow'
              }`}
              style={activeFilter === f.label
                ? { background: 'linear-gradient(135deg,#1E3A8A,#38BDF8)' }
                : undefined}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Result count */}
      {(query || activeFilter !== 'All') && (
        <p className="text-sm text-gray-400 text-center mb-6">
          {filtered.length === 0
            ? 'No services match your search'
            : `${filtered.length} service${filtered.length !== 1 ? 's' : ''} found`}
        </p>
      )}

      {/* Grid — compact tiles */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
          {filtered.map(s => (
            <Link key={s.slug} href={`/services/${s.slug}`}
              className="group bg-white rounded-xl border border-gray-200 p-3 sm:p-3.5 hover:border-blue-300 hover:shadow-md
                         transition-all duration-200 flex flex-col items-start gap-2 min-h-0">
              {(() => {
                const Icon = SERVICE_ICON_BY_SLUG[s.slug]
                return (
                  <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: s.accentBg }}>
                    {Icon
                      ? <Icon {...categoryIconProps(18, s.accentColor)} />
                      : <span className="text-lg sm:text-xl leading-none">{s.emoji}</span>}
                  </div>
                )
              })()}
              <div className="flex-1 min-w-0 w-full">
                <p className="font-bold text-gray-900 text-xs sm:text-sm leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                  {s.title}
                </p>
                <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5 line-clamp-2 leading-snug">
                  {s.subheadline.split('—')[0].trim()}
                </p>
              </div>
              <span className="mt-auto text-[10px] sm:text-xs font-semibold text-blue-700">
                From {s.priceMin} NOK →
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-4xl mb-4">🔍</p>
          <p className="font-bold text-gray-700 mb-2">No results for &quot;{query}&quot;</p>
          <p className="text-sm text-gray-400 mb-6">Try a different word, or browse all services.</p>
          <button onClick={() => { setQuery(''); setActiveFilter('All') }}
            className="rounded-xl px-6 py-2.5 text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#1E3A8A,#38BDF8)' }}>
            Show all services
          </button>
        </div>
      )}
    </div>
  )
}
