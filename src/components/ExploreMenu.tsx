'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

export default function ExploreMenu() {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current) return
      if (!rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('mousedown', onPointerDown)
    return () => window.removeEventListener('mousedown', onPointerDown)
  }, [])

  return (
    <div ref={rootRef} className="relative hidden sm:block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors select-none"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        Explore
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div
          className="absolute left-0 top-full mt-2 w-44 rounded-xl border p-1 z-50 shadow-lg"
          style={{
            background: 'var(--sl-bg-card)',
            borderColor: 'var(--sl-border)',
          }}
          role="menu"
        >
          <Link href="/services" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors">
            Services
          </Link>
          <Link href="/taskers" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors">
            Find Helpers
          </Link>
          <Link href="/jobs" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors">
            Find Jobs
          </Link>
        </div>
      )}
    </div>
  )
}

