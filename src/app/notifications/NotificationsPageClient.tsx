'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import { useNotificationFeed } from '@/hooks/useNotificationFeed'
import NotificationFeedList from '@/components/NotificationFeedList'

function safeNextPath(raw: string | null): string | null {
  if (!raw || !raw.startsWith('/') || raw.includes('//')) return null
  if (raw.includes(':')) return null
  return raw
}

export default function NotificationsPageClient({ userId }: { userId: string }) {
  const { t } = useLanguage()
  const p = t.notificationsPage
  const searchParams = useSearchParams()
  const nextPath = safeNextPath(searchParams.get('next'))
  const { role, items, readIds, addReadIds, unreadCount } = useNotificationFeed(userId)

  if (!role) {
    return (
      <div className="mx-auto max-w-lg px-4 py-10">
        <p className="text-sm text-gray-500">{p.needRole}</p>
        <Link href="/profile" className="mt-4 inline-block text-sm font-semibold text-blue-600">
          {p.openProfile}
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6 pb-24">
      <h1 className="text-xl font-extrabold text-gray-900">{p.title}</h1>
      <p className="text-xs text-gray-500 mt-1">{p.unread(unreadCount)}</p>

      {nextPath && (
        <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/80 px-4 py-3">
          <p className="text-xs text-gray-600 mb-2">{p.relatedHint}</p>
          <Link
            href={nextPath}
            className="inline-flex text-sm font-bold text-blue-700 hover:text-blue-800"
          >
            {p.openRelated} →
          </Link>
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <NotificationFeedList
          variant="page"
          items={items}
          readIds={readIds}
          addReadIds={addReadIds}
          emptyLabel={p.empty}
        />
      </div>
    </div>
  )
}
