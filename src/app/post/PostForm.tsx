'use client'

import React, { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'

// ── All service categories with icons ────────────────────────────────────────
const CATEGORIES: { key: string; bg: string; color: string; icon: React.ReactNode }[] = [
  { key: 'Cleaning',      bg: '#F0FDF4', color: '#16A34A', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z"/></svg> },
  { key: 'Moving',        bg: '#EFF6FF', color: '#2563EB', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> },
  { key: 'Tutoring',      bg: '#FFFBEB', color: '#D97706', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg> },
  { key: 'Delivery',      bg: '#FFF7ED', color: '#EA580C', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg> },
  { key: 'Handyman',      bg: '#F5F3FF', color: '#7C3AED', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg> },
  { key: 'Events',        bg: '#FFF1F2', color: '#E11D48', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E11D48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect width="20" height="5" x="2" y="7"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg> },
  { key: 'IT & Tech',     bg: '#F0F9FF', color: '#0284C7', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg> },
  { key: 'Gardening',     bg: '#F0FDF4', color: '#15803D', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22V12M12 12C12 7 8 4 3 5c0 5 3 9 9 7M12 12c0-5 4-8 9-7-1 5-4 9-9 7"/></svg> },
  { key: 'Pet Care',      bg: '#FFF7ED', color: '#F97316', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="7.5" cy="5.5" r="1.8"/><circle cx="16.5" cy="5.5" r="1.8"/><circle cx="4.5" cy="11" r="1.8"/><circle cx="19.5" cy="11" r="1.8"/><path d="M12 21c-3.5 0-6-2-6-5 0-1.5.5-2.8 2-4h8c1.5 1.2 2 2.5 2 4 0 3-2.5 5-6 5z"/></svg> },
  { key: 'Cooking',       bg: '#FEF2F2', color: '#DC2626', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3z"/><path d="M21 15v7"/></svg> },
  { key: 'Shopping',      bg: '#F5F3FF', color: '#8B5CF6', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg> },
  { key: 'Knitting',      bg: '#FDF4FF', color: '#C026D3', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C026D3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="14" r="6"/><path d="M8 8L4 2"/><path d="M16 8L20 2"/><path d="M6 14Q9 11 12 14Q15 17 18 14"/></svg> },
  { key: 'Sewing',        bg: '#ECFEFF', color: '#0891B2', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0891B2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg> },
  { key: 'Kids Care',     bg: '#FEFCE8', color: '#CA8A04', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#CA8A04" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><circle cx="9" cy="9" r="1" fill="#CA8A04"/><circle cx="15" cy="9" r="1" fill="#CA8A04"/></svg> },
  { key: 'Car Wash',      bg: '#F0F9FF', color: '#0EA5E9', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14L7 8h10l3 6H4z"/><line x1="3" y1="14" x2="21" y2="14"/><circle cx="7.5" cy="18" r="2"/><circle cx="16.5" cy="18" r="2"/><path d="M8 3v3M12 2v3M16 3v3"/></svg> },
  { key: 'Painting',      bg: '#EEF2FF', color: '#4F46E5', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="7" rx="2"/><path d="M12 10v5"/><path d="M9 15h6"/><path d="M9 15v6M15 15v6"/></svg> },
  { key: 'Makeup Artist', bg: '#FDF2F8', color: '#DB2777', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DB2777" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 20V9l2-5 2 5v11H10z"/><path d="M8 20h8"/><path d="M10 13h4"/></svg> },
  { key: 'Hair Dresser',  bg: '#F3E8FF', color: '#7E22CE', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7E22CE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="5" rx="2"/><path d="M6 8v11M10 8v11M14 8v11M18 8v11"/><path d="M3 19h18"/></svg> },
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
                    {selectedCat.icon}
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
                      {cat.icon}
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
