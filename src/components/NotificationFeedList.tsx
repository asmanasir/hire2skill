'use client'

import Link from 'next/link'
import type { NotificationFeedItem } from '@/hooks/useNotificationFeed'

type Props = {
  items: NotificationFeedItem[]
  readIds: Set<string>
  addReadIds: (ids: string[]) => void
  emptyLabel: string
  onItemNavigate?: () => void
  /** Narrow dropdown; full page omits max height */
  variant?: 'popover' | 'page'
}

export default function NotificationFeedList({
  items,
  readIds,
  addReadIds,
  emptyLabel,
  onItemNavigate,
  variant = 'popover',
}: Props) {
  if (items.length === 0) {
    return <p className="px-4 py-6 text-xs text-gray-400">{emptyLabel}</p>
  }

  const scrollClass =
    variant === 'page' ? 'overflow-y-auto' : 'max-h-80 sm:max-h-none overflow-y-auto'

  return (
    <div className={scrollClass}>
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          onClick={() => {
            addReadIds([item.id])
            onItemNavigate?.()
          }}
          className="block px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm text-gray-700">{item.text}</p>
            {!readIds.has(item.id) && <span className="mt-1 h-2 w-2 rounded-full bg-blue-600 shrink-0" />}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">{new Date(item.createdAt).toLocaleString()}</p>
        </Link>
      ))}
    </div>
  )
}
