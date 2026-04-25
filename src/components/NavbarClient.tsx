'use client'

import Link from 'next/link'
import { LogoHorizontal } from './SkillLinkLogo'
import LanguageSwitcher from './LanguageSwitcher'
import ThemeToggle from './ThemeToggle'
import LogoutButton from './LogoutButton'
import RequestBell from './RequestBell'
import ExploreMenu from './ExploreMenu'
import MessagesNavLink from './MessagesNavLink'
import { useLanguage } from '@/context/LanguageContext'

export default function NavbarClient({
  userId,
  userEmail,
  unreadCount,
}: {
  userId: string | null
  userEmail: string | null
  unreadCount: number
}) {
  const { t } = useLanguage()
  const isLoggedIn = Boolean(userId)

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-50 shadow-sm"
      style={{ background: 'var(--sl-nav-bg)', borderColor: 'var(--sl-nav-border)' }}>
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href={isLoggedIn ? '/dashboard' : '/'} className="hover:opacity-90 transition-opacity">
          <LogoHorizontal />
        </Link>

        <div className="flex items-center gap-2 sm:gap-5">
          <ExploreMenu />

          {isLoggedIn && userId ? (
            <>
              <Link href="/dashboard" className="hidden sm:block text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors">
                {t.dashboard.tabOverview}
              </Link>
              <MessagesNavLink userId={userId} initialUnreadCount={unreadCount} />
              <Link href="/profile" className="hidden sm:block text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors">
                {t.nav.profile}
              </Link>
              <RequestBell userId={userId} />
              <div className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full text-white text-sm font-bold shadow-sm" style={{ background: 'linear-gradient(135deg,#1E3A8A,#38BDF8)' }}>
                {userEmail?.[0].toUpperCase()}
              </div>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="hidden sm:block text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                {t.nav.login}
              </Link>
              <Link
                href="/signup"
                className="rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(90deg,#2563EB,#38BDF8)' }}
              >
                {t.signup.submit}
              </Link>
            </>
          )}

          <Link
            href="/post"
            className="hidden sm:block rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(90deg,#F59E0B,#FBBF24)' }}
          >
            {t.nav.postJob}
          </Link>

          <ThemeToggle />
          <LanguageSwitcher />
        </div>
      </div>
    </nav>
  )
}

