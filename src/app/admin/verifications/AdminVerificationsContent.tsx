'use client'

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

type Submission = {
  id: string
  display_name: string | null
  verification_status: string
  verification_doc_url: string | null
  verification_submitted_at: string | null
  verification_note: string | null
  location: string | null
  categories: string[] | null
  avg_rating: number | null
  tasks_done: number | null
}

const STATUS_COLORS: Record<string, string> = {
  pending:  'bg-yellow-50 text-yellow-700 border-yellow-200',
  verified: 'bg-green-50 text-green-700 border-green-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
}

export default function AdminVerificationsContent({ submissions: init }: { submissions: Submission[] }) {
  const [items, setItems] = useState(init)
  const [docUrl, setDocUrl] = useState<string | null>(null)
  const [noteInput, setNoteInput] = useState('')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function getDocUrl(path: string) {
    const supabase = createClient()
    const { data } = await supabase.storage.from('id-documents').createSignedUrl(path, 60)
    setDocUrl(data?.signedUrl ?? null)
  }

  async function updateStatus(id: string, status: 'verified' | 'rejected', note?: string) {
    setLoading(true)
    const supabase = createClient()
    await supabase.from('profiles').update({
      verification_status: status,
      verification_note: note ?? null,
    }).eq('id', id)
    setItems(prev => prev.map(i => i.id === id ? { ...i, verification_status: status, verification_note: note ?? null } : i))
    setActiveId(null)
    setNoteInput('')
    setLoading(false)
  }

  const pending  = items.filter(i => i.verification_status === 'pending')
  const resolved = items.filter(i => i.verification_status !== 'pending')

  function Row({ item }: { item: Submission }) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="font-bold text-gray-900">{item.display_name ?? 'Unknown'}</p>
            <p className="text-xs text-gray-400 mt-0.5">{item.location ?? '—'} · {(item.categories ?? []).slice(0, 2).join(', ') || '—'}</p>
            <p className="text-xs text-gray-400">{item.tasks_done ?? 0} tasks · {item.avg_rating?.toFixed(1) ?? '—'} rating</p>
          </div>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border capitalize ${STATUS_COLORS[item.verification_status] ?? ''}`}>
            {item.verification_status}
          </span>
        </div>

        {item.verification_submitted_at && (
          <p className="text-xs text-gray-400">
            Submitted {new Date(item.verification_submitted_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        )}

        {item.verification_note && (
          <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">Rejection note: {item.verification_note}</p>
        )}

        <div className="flex flex-wrap gap-2">
          {item.verification_doc_url && (
            <button onClick={() => getDocUrl(item.verification_doc_url!)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              View Document
            </button>
          )}
          {item.verification_status === 'pending' && (
            <>
              <button onClick={() => updateStatus(item.id, 'verified')} disabled={loading}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 transition-colors">
                Approve
              </button>
              <button onClick={() => setActiveId(item.id)} disabled={loading}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 transition-colors">
                Reject
              </button>
            </>
          )}
        </div>

        {activeId === item.id && (
          <div className="space-y-2 pt-1">
            <input value={noteInput} onChange={e => setNoteInput(e.target.value)}
              placeholder="Rejection reason (shown to user)…"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-red-400" />
            <div className="flex gap-2">
              <button onClick={() => updateStatus(item.id, 'rejected', noteInput)} disabled={loading}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 transition-colors">
                Confirm Reject
              </button>
              <button onClick={() => { setActiveId(null); setNoteInput('') }}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-6 py-10 space-y-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Identity Verification</h1>
          <p className="text-sm text-gray-500 mt-1">Review submitted documents and approve or reject</p>
        </div>

        {/* Pending */}
        <section>
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">
            Pending review ({pending.length})
          </h2>
          {pending.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center text-sm text-gray-400">
              No pending submissions
            </div>
          ) : (
            <div className="space-y-4">
              {pending.map(i => <Row key={i.id} item={i} />)}
            </div>
          )}
        </section>

        {/* Resolved */}
        {resolved.length > 0 && (
          <section>
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">
              Resolved ({resolved.length})
            </h2>
            <div className="space-y-4">
              {resolved.map(i => <Row key={i.id} item={i} />)}
            </div>
          </section>
        )}
      </div>

      {/* Doc viewer modal */}
      {docUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={() => setDocUrl(null)}>
          <div className="max-w-2xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <p className="text-sm font-bold text-gray-700">ID Document</p>
              <button onClick={() => setDocUrl(null)} className="text-gray-400 hover:text-gray-700 text-xl leading-none">×</button>
            </div>
            {docUrl.endsWith('.pdf') ? (
              <iframe src={docUrl} className="w-full h-[500px]" />
            ) : (
              <Image src={docUrl} alt="ID document" width={1200} height={900} className="w-full object-contain max-h-[500px]" />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
