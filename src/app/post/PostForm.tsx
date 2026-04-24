'use client'

import React, { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import {
  SprayCan, Truck, GraduationCap, Package, Wrench, PartyPopper, Monitor, Leaf,
  PawPrint, ChefHat, ShoppingBag, Wind, Scissors, Baby, Car, PaintBucket,
  Paintbrush, Wand2, Snowflake, Dog, Sofa, AppWindow, Camera, Dumbbell,
  HeartHandshake, Music,
} from 'lucide-react'

// ── All service categories with icons ────────────────────────────────────────
const CATEGORIES: { key: string; bg: string; color: string; Icon: React.ElementType }[] = [
  { key: 'Cleaning',           bg: '#F0FDF4', color: '#16A34A', Icon: SprayCan },
  { key: 'Moving',             bg: '#EFF6FF', color: '#2563EB', Icon: Truck },
  { key: 'Tutoring',           bg: '#FFFBEB', color: '#D97706', Icon: GraduationCap },
  { key: 'Delivery',           bg: '#FFF7ED', color: '#EA580C', Icon: Package },
  { key: 'Handyman',           bg: '#F5F3FF', color: '#7C3AED', Icon: Wrench },
  { key: 'Events',             bg: '#FFF1F2', color: '#E11D48', Icon: PartyPopper },
  { key: 'IT & Tech',          bg: '#F0F9FF', color: '#0284C7', Icon: Monitor },
  { key: 'Gardening',          bg: '#F0FDF4', color: '#15803D', Icon: Leaf },
  { key: 'Pet Care',           bg: '#FFF7ED', color: '#F97316', Icon: PawPrint },
  { key: 'Cooking',            bg: '#FEF2F2', color: '#DC2626', Icon: ChefHat },
  { key: 'Shopping',           bg: '#F5F3FF', color: '#8B5CF6', Icon: ShoppingBag },
  { key: 'Knitting',           bg: '#FDF4FF', color: '#C026D3', Icon: Wind },
  { key: 'Sewing',             bg: '#ECFEFF', color: '#0891B2', Icon: Scissors },
  { key: 'Kids Care',          bg: '#FEFCE8', color: '#CA8A04', Icon: Baby },
  { key: 'Car Wash',           bg: '#F0F9FF', color: '#0EA5E9', Icon: Car },
  { key: 'Painting',           bg: '#EEF2FF', color: '#4F46E5', Icon: PaintBucket },
  { key: 'Makeup Artist',      bg: '#FDF2F8', color: '#DB2777', Icon: Paintbrush },
  { key: 'Hair Dresser',       bg: '#F3E8FF', color: '#7E22CE', Icon: Wand2 },
  { key: 'Snow Removal',       bg: '#EFF6FF', color: '#0369A1', Icon: Snowflake },
  { key: 'Dog Walking',        bg: '#FEF9C3', color: '#92400E', Icon: Dog },
  { key: 'Furniture Assembly', bg: '#F5F3FF', color: '#6D28D9', Icon: Sofa },
  { key: 'Window Cleaning',    bg: '#ECFEFF', color: '#0E7490', Icon: AppWindow },
  { key: 'Photography',        bg: '#FFF1F2', color: '#BE123C', Icon: Camera },
  { key: 'Personal Training',  bg: '#F0FDF4', color: '#166534', Icon: Dumbbell },
  { key: 'Elder Care',         bg: '#FFF7ED', color: '#C2410C', Icon: HeartHandshake },
  { key: 'Music Lessons',      bg: '#EEF2FF', color: '#4338CA', Icon: Music },
]

// ── Norwegian cities & districts for location autocomplete ───────────────────
const NORWAY_LOCATIONS = [
  // Oslo – Central
  'Oslo – Sentrum', 'Oslo – Grünerløkka', 'Oslo – Grønland', 'Oslo – Tøyen',
  'Oslo – Gamlebyen', 'Oslo – Sørenga', 'Oslo – Tjuvholmen', 'Oslo – Aker Brygge',
  'Oslo – Bislett', 'Oslo – St. Hanshaugen',

  // Oslo – West
  'Oslo – Frogner', 'Oslo – Majorstuen', 'Oslo – Skøyen', 'Oslo – Lysaker',
  'Oslo – Bygdøy', 'Oslo – Ullern', 'Oslo – Montebello', 'Oslo – Smestad',
  'Oslo – Røa', 'Oslo – Vinderen', 'Oslo – Hovseter', 'Oslo – Holmenkollen',
  'Oslo – Bestun', 'Oslo – Huseby',

  // Oslo – North / Northwest
  'Oslo – Sagene', 'Oslo – Sandaker', 'Oslo – Storo', 'Oslo – Nydalen',
  'Oslo – Sinsen', 'Oslo – Grefsen', 'Oslo – Kjelsås', 'Oslo – Tåsen',
  'Oslo – Disen', 'Oslo – Frysja',

  // Oslo – East (Alna)
  'Oslo – Alna', 'Oslo – Furuset', 'Oslo – Lindeberg', 'Oslo – Trosterud',
  'Oslo – Ellingsrudåsen', 'Oslo – Haugerud', 'Oslo – Teisen', 'Oslo – Rødtvet',
  'Oslo – Ulven', 'Oslo – Løren',

  // Oslo – Northeast (Grorud / Stovner)
  'Oslo – Grorud', 'Oslo – Ammerud', 'Oslo – Romsås', 'Oslo – Kalbakken',
  'Oslo – Rommen', 'Oslo – Stovner', 'Oslo – Haugenstua', 'Oslo – Vestli',
  'Oslo – Karihaugen', 'Oslo – Fossum', 'Oslo – Skytterkollen',

  // Oslo – Bjerke
  'Oslo – Bjerke', 'Oslo – Veitvet', 'Oslo – Carl Berner', 'Oslo – Refstad',
  'Oslo – Helsfyr', 'Oslo – Valle Hovin',

  // Oslo – South (Østensjø / Nordstrand)
  'Oslo – Nordstrand', 'Oslo – Ljan', 'Oslo – Ekeberg', 'Oslo – Lambertseter',
  'Oslo – Manglerud', 'Oslo – Ryen', 'Oslo – Bryn', 'Oslo – Oppsal',
  'Oslo – Bøler', 'Oslo – Skullerud', 'Oslo – Bogerud', 'Oslo – Godlia',

  // Oslo – Far South (Søndre Nordstrand)
  'Oslo – Holmlia', 'Oslo – Mortensrud', 'Oslo – Bjørndal', 'Oslo – Prinsdal',
  'Oslo – Ljansbrekka', 'Oslo – Langåra',

  // Bergen – neighborhoods
  'Bergen – Sentrum', 'Bergen – Bergenhus', 'Bergen – Sandviken', 'Bergen – Nygårdshøyden',
  'Bergen – Nordnes', 'Bergen – Møhlenpris', 'Bergen – Fana', 'Bergen – Nesttun',
  'Bergen – Paradis', 'Bergen – Rådal', 'Bergen – Ytrebygda', 'Bergen – Søreide',
  'Bergen – Fyllingsdalen', 'Bergen – Spelhaugen', 'Bergen – Laksevåg',
  'Bergen – Loddefjord', 'Bergen – Olsvik', 'Bergen – Åsane', 'Bergen – Flaktveit',
  'Bergen – Hylkje', 'Bergen – Arna', 'Bergen – Indre Arna',

  // Trondheim – neighborhoods
  'Trondheim – Midtbyen', 'Trondheim – Nedre Elvehavn', 'Trondheim – Brattøra',
  'Trondheim – Møllenberg', 'Trondheim – Rosenborg', 'Trondheim – Strindheim',
  'Trondheim – Ranheim', 'Trondheim – Åsvang', 'Trondheim – Lerkendal',
  'Trondheim – Singsaker', 'Trondheim – Nardo', 'Trondheim – Flatåsen',
  'Trondheim – Heimdal', 'Trondheim – Saupstad', 'Trondheim – Kattem',
  'Trondheim – Byåsen', 'Trondheim – Kolstad', 'Trondheim – Tillerbyen',

  // Stavanger – neighborhoods
  'Stavanger – Sentrum', 'Stavanger – Stavanger Øst', 'Stavanger – Storhaug',
  'Stavanger – Hillevåg', 'Stavanger – Hundvåg', 'Stavanger – Madla',
  'Stavanger – Tasta', 'Stavanger – Eiganes', 'Stavanger – Våland',
  'Stavanger – Paradis', 'Stavanger – Hafrsfjord',

  // Drammen – neighborhoods
  'Drammen – Bragernes', 'Drammen – Strømsø', 'Drammen – Fjell',
  'Drammen – Konnerud', 'Drammen – Åskollen', 'Drammen – Gulskogen',

  // Other major cities
  'Kristiansand', 'Tromsø', 'Sandnes', 'Fredrikstad', 'Sarpsborg',
  'Bodø', 'Sandefjord', 'Ålesund', 'Tønsberg', 'Moss', 'Hamar',
  'Porsgrunn', 'Skien', 'Arendal', 'Haugesund', 'Larvik', 'Halden',
  'Lillehammer', 'Molde', 'Harstad', 'Gjøvik', 'Horten', 'Kongsberg',

  // Oslo suburbs / municipalities
  'Bærum', 'Asker', 'Jessheim', 'Lillestrøm', 'Lørenskog', 'Ski',
  'Oppegård', 'Ås', 'Nesodden', 'Frogn', 'Vestby', 'Ullensaker',
  'Nannestad', 'Eidsvoll', 'Nittedal', 'Rælingen', 'Skedsmo',

  // Stavanger region
  'Karmøy', 'Sola', 'Askøy', 'Fjell', 'Lindås',

  // Inland / Innlandet
  'Kongsvinger', 'Elverum', 'Brumunddal', 'Moelv', 'Reinsvoll',

  // Trøndelag
  'Namsos', 'Steinkjer', 'Levanger', 'Verdalsøra', 'Stjørdal',

  // Northern Norway
  'Alta', 'Hammerfest', 'Vadsø', 'Kirkenes', 'Narvik',
  'Finnsnes', 'Svolvær', 'Leknes', 'Mosjøen', 'Mo i Rana',
]

type Errors = {
  title?: string
  description?: string
  category?: string
  price?: string
  location?: string
}

export default function PostForm() {
  const router = useRouter()
  const { t } = useLanguage()
  const p = t.post

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [price, setPrice] = useState('')
  const [location, setLocation] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  // Category dropdown state
  const [catOpen, setCatOpen] = useState(false)
  const catRef = useRef<HTMLDivElement>(null)

  // Location autocomplete state
  const [locSuggestions, setLocSuggestions] = useState<string[]>([])
  const [showLocSuggestions, setShowLocSuggestions] = useState(false)
  const locRef = useRef<HTMLDivElement>(null)

  const selectedCat = CATEGORIES.find(c => c.key === category)

  // Close dropdowns on outside click
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setCatOpen(false)
      if (locRef.current && !locRef.current.contains(e.target as Node)) setShowLocSuggestions(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  function handleLocationChange(val: string) {
    setLocation(val)
    if (val.trim().length >= 1) {
      const matches = NORWAY_LOCATIONS.filter(l =>
        l.toLowerCase().includes(val.toLowerCase())
      ).slice(0, 8)
      setLocSuggestions(matches)
      setShowLocSuggestions(matches.length > 0)
    } else {
      setShowLocSuggestions(false)
    }
  }

  function selectLocation(val: string) {
    setLocation(val)
    setShowLocSuggestions(false)
  }

  function validate(): Errors {
    const e: Errors = {}
    if (!title || title.trim().length < 3) e.title = p.errors.title
    if (!description || description.trim().length < 10) e.description = p.errors.description
    if (!category) e.category = p.errors.category
    if (!location || location.trim().length < 2) e.location = p.errors.location
    if (price && isNaN(Number(price))) e.price = p.errors.price
    if (price && Number(price) < 0) e.price = p.errors.price
    return e
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setServerError('')
    const fieldErrors = validate()
    if (Object.keys(fieldErrors).length > 0) { setErrors(fieldErrors); return }
    setErrors({})
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setServerError(p.errors.notLoggedIn); setLoading(false); return }

    const { error } = await supabase.from('posts').insert({
      user_id: user.id,
      title: title.trim(),
      description: description.trim(),
      category,
      price: price ? Number(price) : null,
      location: location.trim(),
    })

    if (error) { setServerError(error.message); setLoading(false); return }

    router.push(`/taskers?category=${encodeURIComponent(category)}&posted=1`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {serverError && (
        <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
          {serverError}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-zinc-700">
          {p.titleField} <span className="text-red-500">*</span>
        </label>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)}
          placeholder={p.placeholder.title}
          className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-blue-100 ${
            errors.title ? 'border-red-400' : 'border-zinc-200 focus:border-blue-400'
          }`} />
        {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-zinc-700">
          {p.description} <span className="text-red-500">*</span>
        </label>
        <textarea rows={4} value={description} onChange={e => setDescription(e.target.value)}
          placeholder={p.placeholder.description}
          className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 resize-none transition ${
            errors.description ? 'border-red-400' : 'border-zinc-200 focus:border-blue-400'
          }`} />
        {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
      </div>

      {/* Category + Price row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

        {/* Custom category picker */}
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-zinc-700">
            {p.category} <span className="text-red-500">*</span>
          </label>
          <div ref={catRef} className="relative">
            {/* Trigger button */}
            <button type="button" onClick={() => setCatOpen(v => !v)}
              className={`w-full flex items-center gap-2.5 rounded-xl border px-4 py-2.5 text-sm text-left transition focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white ${
                errors.category ? 'border-red-400' : catOpen ? 'border-blue-400' : 'border-zinc-200 hover:border-zinc-300'
              }`}>
              {selectedCat ? (
                <>
                  <span className="flex items-center justify-center h-6 w-6 rounded-md shrink-0"
                    style={{ background: selectedCat.bg }}>
                    <selectedCat.Icon size={14} color={selectedCat.color} strokeWidth={1.75} />
                  </span>
                  <span className="font-medium text-zinc-800">{selectedCat.key}</span>
                </>
              ) : (
                <span className="text-zinc-400">{p.selectCategory}</span>
              )}
              <svg className="ml-auto shrink-0 transition-transform" style={{ transform: catOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </button>

            {/* Dropdown grid */}
            {catOpen && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-zinc-200 rounded-2xl shadow-xl p-3 grid grid-cols-3 gap-1.5 max-h-72 overflow-y-auto">
                {CATEGORIES.map(cat => (
                  <button key={cat.key} type="button"
                    onClick={() => { setCategory(cat.key); setCatOpen(false); setErrors(e => ({ ...e, category: undefined })) }}
                    className="flex flex-col items-center gap-1.5 rounded-xl p-2.5 text-xs font-semibold transition-all border-2"
                    style={category === cat.key
                      ? { borderColor: cat.color, background: cat.bg, color: cat.color }
                      : { borderColor: 'transparent', background: '#F9FAFB', color: '#374151' }}>
                    <span className="flex items-center justify-center h-8 w-8 rounded-lg"
                      style={{ background: cat.bg }}>
                      <cat.Icon size={16} color={cat.color} strokeWidth={1.75} />
                    </span>
                    <span className="text-center leading-tight">{cat.key}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category}</p>}
        </div>

        {/* Price */}
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-zinc-700">
            {p.price} <span className="text-zinc-400 font-normal">{p.priceHint}</span>
          </label>
          <input type="number" min="0" step="any" value={price} onChange={e => setPrice(e.target.value)}
            placeholder={p.placeholder.price}
            className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 transition ${
              errors.price ? 'border-red-400' : 'border-zinc-200 focus:border-blue-400'
            }`} />
          {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price}</p>}
        </div>
      </div>

      {/* Location with autocomplete */}
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-zinc-700">
          {p.location} <span className="text-red-500">*</span>
        </label>
        <div ref={locRef} className="relative">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            <input type="text" value={location}
              onChange={e => handleLocationChange(e.target.value)}
              onFocus={() => { if (location.length >= 1) setShowLocSuggestions(locSuggestions.length > 0) }}
              placeholder={p.placeholder.location}
              className={`w-full rounded-xl border pl-9 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 transition ${
                errors.location ? 'border-red-400' : 'border-zinc-200 focus:border-blue-400'
              }`} />
          </div>

          {/* Suggestions dropdown */}
          {showLocSuggestions && locSuggestions.length > 0 && (
            <ul className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-zinc-200 rounded-xl shadow-lg overflow-hidden">
              {locSuggestions.map(loc => (
                <li key={loc}>
                  <button type="button" onMouseDown={() => selectLocation(loc)}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left hover:bg-blue-50 transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    <span className="font-medium text-zinc-700">{loc}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {errors.location && <p className="mt-1 text-xs text-red-500">{errors.location}</p>}
      </div>

      {/* Submit */}
      <button type="submit" disabled={loading}
        style={{ background: 'linear-gradient(90deg,#2563EB,#38BDF8)', opacity: loading ? 0.6 : 1 }}
        className="w-full rounded-xl px-4 py-3 text-sm font-bold text-white transition">
        {loading ? p.submitting : p.submit}
      </button>
    </form>
  )
}
