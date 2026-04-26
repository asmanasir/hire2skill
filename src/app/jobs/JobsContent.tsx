'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CATEGORY_BY_KEY, toCategoryKey } from '@/lib/categories'
import { categoryIconProps } from '@/lib/category-icon'
import { useLanguage } from '@/context/LanguageContext'

export type PublicJob = {
  id: string
  posterId: string
  posterName: string
  title: string
  description: string
  category: string
  location: string
  budget: number | null
  createdAt: string
  proposalCount: number
}

function getJobsUi(locale: 'no' | 'en' | 'da' | 'sv') {
  if (locale === 'no') {
    return {
      pageTitle: 'Finn jobber',
      pageSubtitle: 'Bla gjennom kundeannonser og send forslag med pris.',
      searchPlaceholder: 'Søk på tittel, kategori, sted',
      modalTitle: 'Send forslag',
      proposalPlaceholder: 'Skriv kort hvorfor du passer og når du kan starte…',
      offerPlaceholder: 'Din foreslåtte pris (NOK)',
      cancel: 'Avbryt',
      sendProposal: 'Send forslag',
      sending: 'Sender…',
      emptySearch: 'Ingen åpne jobber matcher søket ditt.',
      postNew: 'Legg ut ny jobb',
      noDetails: 'Ingen flere detaljer oppgitt.',
      detailsInChat: 'Detaljer avklares i chat.',
      helpNeeded: 'hjelp ønskes',
      by: 'av',
      budgetLabel: (v: number) => `${v} NOK budsjett`,
      budgetNegotiable: 'Budsjett kan forhandles',
      errProposalRequired: 'Skriv en kort forslagstekst.',
      errAlreadyPending: 'Du har allerede sendt et ventende forslag på denne jobben.',
      errOwnPost: 'Du kan ikke sende forslag på din egen jobb.',
      errSendFailed: 'Kunne ikke sende forslag.',
      proposalsLabel: (n: number) => (n === 1 ? '1 forslag' : `${n} forslag`),
    }
  }
  if (locale === 'da') {
    return {
      pageTitle: 'Find job',
      pageSubtitle: 'Gennemse kundeopslag og send dit forslag med pris.',
      searchPlaceholder: 'Søg efter titel, kategori, sted',
      modalTitle: 'Send forslag',
      proposalPlaceholder: 'Skriv kort hvorfor du passer, og hvornår du kan starte…',
      offerPlaceholder: 'Din tilbudspris (NOK)',
      cancel: 'Annuller',
      sendProposal: 'Send forslag',
      sending: 'Sender…',
      emptySearch: 'Ingen åbne job matcher din søgning.',
      postNew: 'Opret nyt job',
      noDetails: 'Ingen ekstra detaljer angivet.',
      detailsInChat: 'Detaljer aftales i chatten.',
      helpNeeded: 'hjælp søges',
      by: 'af',
      budgetLabel: (v: number) => `${v} NOK budget`,
      budgetNegotiable: 'Budget kan forhandles',
      errProposalRequired: 'Skriv en kort forslagstekst.',
      errAlreadyPending: 'Du har allerede sendt et afventende forslag til dette job.',
      errOwnPost: 'Du kan ikke sende forslag til dit eget job.',
      errSendFailed: 'Kunne ikke sende forslag.',
      proposalsLabel: (n: number) => (n === 1 ? '1 forslag' : `${n} forslag`),
    }
  }
  if (locale === 'sv') {
    return {
      pageTitle: 'Hitta jobb',
      pageSubtitle: 'Bläddra bland kundannonser och skicka ditt förslag med pris.',
      searchPlaceholder: 'Sök på titel, kategori, plats',
      modalTitle: 'Skicka förslag',
      proposalPlaceholder: 'Skriv kort varför du passar och när du kan börja…',
      offerPlaceholder: 'Ditt prisförslag (NOK)',
      cancel: 'Avbryt',
      sendProposal: 'Skicka förslag',
      sending: 'Skickar…',
      emptySearch: 'Inga öppna jobb matchar din sökning.',
      postNew: 'Lägg upp nytt jobb',
      noDetails: 'Inga fler detaljer angivna.',
      detailsInChat: 'Detaljer bekräftas i chatten.',
      helpNeeded: 'hjälp sökes',
      by: 'av',
      budgetLabel: (v: number) => `${v} NOK budget`,
      budgetNegotiable: 'Budget kan förhandlas',
      errProposalRequired: 'Skriv en kort förslagstext.',
      errAlreadyPending: 'Du har redan skickat ett väntande förslag för detta jobb.',
      errOwnPost: 'Du kan inte skicka förslag på ditt eget jobb.',
      errSendFailed: 'Kunde inte skicka förslag.',
      proposalsLabel: (n: number) => (n === 1 ? '1 förslag' : `${n} förslag`),
    }
  }
  return {
    pageTitle: 'Find Jobs',
    pageSubtitle: 'Browse customer posts and send your proposal with price.',
    searchPlaceholder: 'Search by title, category, location',
    modalTitle: 'Send proposal',
    proposalPlaceholder: 'Write why you are a good fit and when you can start…',
    offerPlaceholder: 'Your offered price (NOK)',
    cancel: 'Cancel',
    sendProposal: 'Send proposal',
    sending: 'Sending…',
    emptySearch: 'No open jobs match your search.',
    postNew: 'Post a new job',
    noDetails: 'No additional details provided.',
    detailsInChat: 'Task details will be confirmed in chat.',
    helpNeeded: 'help needed',
    by: 'by',
    budgetLabel: (v: number) => `${v} NOK budget`,
    budgetNegotiable: 'Budget negotiable',
    errProposalRequired: 'Please write a short proposal message.',
    errAlreadyPending: 'You already sent a pending proposal for this job.',
    errOwnPost: 'You cannot send a proposal to your own job.',
    errSendFailed: 'Could not send proposal.',
    proposalsLabel: (n: number) => (n === 1 ? '1 proposal' : `${n} proposals`),
  }
}

export default function JobsContent({
  jobs,
  currentUserId,
}: {
  jobs: PublicJob[]
  currentUserId: string | null
}) {
  const { locale } = useLanguage()
  const ui = useMemo(() => getJobsUi(locale), [locale])
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [activeJob, setActiveJob] = useState<PublicJob | null>(null)
  const [message, setMessage] = useState('')
  const [offer, setOffer] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return jobs
    return jobs.filter(j =>
      j.title.toLowerCase().includes(q) ||
      j.category.toLowerCase().includes(q) ||
      j.location.toLowerCase().includes(q) ||
      j.description.toLowerCase().includes(q),
    )
  }, [jobs, query])

  function isMissingPostIdColumnError(message?: string) {
    if (!message) return false
    const lower = message.toLowerCase()
    return (
      lower.includes('post_id') &&
      (lower.includes('column') || lower.includes('schema cache') || lower.includes('could not find'))
    )
  }

  function normalizeTitle(job: PublicJob) {
    const raw = job.title.trim()
    if (!raw || raw.length < 8 || /^[a-z]{2,8}$/i.test(raw)) return `${job.category} ${ui.helpNeeded}`
    return raw
  }

  function splitDetails(job: PublicJob) {
    const text = job.description.trim()
    if (!text) return { summary: '', details: ui.noDetails }
    const [first, ...rest] = text.split('\n\n')
    if (first.includes(':') && first.includes(' · ')) {
      return {
        summary: first,
        details: rest.join('\n\n').trim() || ui.detailsInChat,
      }
    }
    return { summary: '', details: text }
  }

  async function sendProposal() {
    if (!activeJob) return
    if (!currentUserId) {
      router.push(`/login?next=/jobs`)
      return
    }
    if (activeJob.posterId === currentUserId) {
      setError(ui.errOwnPost)
      return
    }
    if (!message.trim()) {
      setError(ui.errProposalRequired)
      return
    }
    setSending(true)
    setError('')
    const supabase = createClient()
    const jobRef = `[JOB:${activeJob.id}]`
    const fullMessage = `${jobRef} ${message.trim()}`

    let existingPending: { id: string }[] | null = null
    let duplicateCheckedByPostId = true
    {
      const checkByPostId = await supabase
        .from('bookings')
        .select('id')
        .eq('post_id', activeJob.id)
        .eq('poster_id', activeJob.posterId)
        .eq('helper_id', currentUserId)
        .eq('status', 'pending')
        .limit(1)

      if (isMissingPostIdColumnError(checkByPostId.error?.message)) {
        duplicateCheckedByPostId = false
        const checkByMessageRef = await supabase
          .from('bookings')
          .select('id')
          .eq('poster_id', activeJob.posterId)
          .eq('helper_id', currentUserId)
          .eq('status', 'pending')
          .ilike('message', `${jobRef}%`)
          .limit(1)
        existingPending = checkByMessageRef.data
      } else {
        existingPending = checkByPostId.data
      }
    }

    if ((existingPending ?? []).length > 0) {
      setSending(false)
      setError(ui.errAlreadyPending)
      return
    }

    let booking: { id: string } | null = null
    let bookingError: { message?: string } | null = null
    if (duplicateCheckedByPostId) {
      const inserted = await supabase
        .from('bookings')
        .insert({
          post_id: activeJob.id,
          poster_id: activeJob.posterId,
          helper_id: currentUserId,
          status: 'pending',
          budget: offer ? Number(offer) : null,
          message: fullMessage,
        })
        .select('id')
        .single()
      booking = inserted.data
      bookingError = inserted.error
    } else {
      const inserted = await supabase
        .from('bookings')
        .insert({
          poster_id: activeJob.posterId,
          helper_id: currentUserId,
          status: 'pending',
          budget: offer ? Number(offer) : null,
          message: fullMessage,
        })
        .select('id')
        .single()
      booking = inserted.data
      bookingError = inserted.error
    }

    if (isMissingPostIdColumnError(bookingError?.message)) {
      const retryWithoutPostId = await supabase
        .from('bookings')
        .insert({
          poster_id: activeJob.posterId,
          helper_id: currentUserId,
          status: 'pending',
          budget: offer ? Number(offer) : null,
          message: fullMessage,
        })
        .select('id')
        .single()
      booking = retryWithoutPostId.data
      bookingError = retryWithoutPostId.error
    }

    if (bookingError || !booking) {
      setSending(false)
      setError(bookingError?.message ?? ui.errSendFailed)
      return
    }

    try {
      await supabase.from('messages').insert({
        booking_id: booking.id,
        sender_id: currentUserId,
        body: fullMessage,
      })
    } catch {
      // Optional bootstrap message; booking still exists.
    }

    setSending(false)
    setActiveJob(null)
    setMessage('')
    setOffer('')
    router.push('/dashboard?requestSent=1')
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      {activeJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button type="button" className="absolute inset-0 bg-black/45" onClick={() => setActiveJob(null)} />
          <div className="relative w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-extrabold text-gray-900">{ui.modalTitle}</h3>
            <p className="text-sm text-gray-500 mt-1">{activeJob.title}</p>
            <div className="mt-4 space-y-3">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder={ui.proposalPlaceholder}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
              <input
                type="number"
                value={offer}
                onChange={(e) => setOffer(e.target.value)}
                placeholder={ui.offerPlaceholder}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                min="0"
              />
              {error && <p className="text-xs text-red-600">{error}</p>}
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setActiveJob(null)} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600">
                {ui.cancel}
              </button>
              <button
                type="button"
                onClick={sendProposal}
                disabled={sending}
                className="rounded-xl px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
                style={{ background: 'linear-gradient(90deg,#2563EB,#38BDF8)' }}
              >
                {sending ? ui.sending : ui.sendProposal}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-7 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">{ui.pageTitle}</h1>
          <p className="text-sm text-gray-500 mt-1">{ui.pageSubtitle}</p>
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={ui.searchPlaceholder}
          className="w-full sm:w-80 rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
          <p className="text-sm text-gray-500">{ui.emptySearch}</p>
          <Link href="/post" className="inline-block mt-3 text-sm font-semibold text-blue-600 hover:underline">
            {ui.postNew}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map(job => (
            <article key={job.id} className="rounded-xl border border-gray-200 bg-white p-3.5 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h2 className="text-sm font-extrabold text-gray-900 leading-snug">{normalizeTitle(job)}</h2>
                  <p className="text-[11px] text-gray-400 mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                    <span>
                      {job.location} · {job.category} · {ui.by} {job.posterName}
                    </span>
                    <span className="rounded-full bg-slate-100 px-1.5 py-px text-[10px] font-semibold text-slate-600 tabular-nums">
                      {ui.proposalsLabel(job.proposalCount)}
                    </span>
                  </p>
                </div>
                {(() => {
                  const cat = CATEGORY_BY_KEY[toCategoryKey(job.category)] ?? CATEGORY_BY_KEY.handyman
                  const CatIcon = cat.Icon
                  return (
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: cat.bg }}>
                      <CatIcon {...categoryIconProps(15, cat.color)} />
                    </div>
                  )
                })()}
              </div>
              {(() => {
                const parsed = splitDetails(job)
                const points = parsed.summary ? parsed.summary.split(' · ').slice(0, 2) : []
                return (
                  <>
                    {points.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {points.map((p) => (
                          <span key={p} className="rounded-full bg-blue-50 px-2 py-px text-[10px] font-semibold text-blue-700">
                            {p}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                      {parsed.details}
                    </p>
                  </>
                )
              })()}
              <span className="text-[10px] text-gray-400">{new Date(job.createdAt).toLocaleDateString()}</span>
              <div className="flex items-center justify-between gap-2 mt-auto pt-1">
                <span className="text-xs font-bold text-green-700 truncate">
                  {job.budget ? ui.budgetLabel(job.budget) : ui.budgetNegotiable}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveJob(job)
                    setError('')
                    setMessage('')
                    setOffer('')
                  }}
                  className="rounded-lg px-3 py-1.5 text-xs font-bold text-white shrink-0"
                  style={{ background: 'linear-gradient(90deg,#2563EB,#38BDF8)' }}
                >
                  {ui.sendProposal}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}

