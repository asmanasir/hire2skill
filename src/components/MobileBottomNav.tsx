import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  Home,
  Search,
  PlusCircle,
  MessageCircle,
  UserCircle,
} from 'lucide-react'

export default async function MobileBottomNav() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let unread = 0
  if (user) {
    try {
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .neq('sender_id', user.id)
        .is('read_at', null)
      unread = count ?? 0
    } catch {}
  }

  const homeHref = user ? '/dashboard' : '/'
  const msgHref  = user ? '/chat'      : '/login'
  const profHref = user ? '/profile'   : '/login'

  return (
    <nav className="sm:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-gray-200
                    flex items-stretch h-16 safe-area-inset-bottom">

      <Link href={homeHref} className="flex-1 flex flex-col items-center justify-center gap-0.5
                                        text-gray-400 hover:text-blue-600 transition-colors active:scale-95">
        <Home size={22} strokeWidth={1.8} />
        <span className="text-[10px] font-medium">{user ? 'Dashboard' : 'Home'}</span>
      </Link>

      <Link href="/taskers" className="flex-1 flex flex-col items-center justify-center gap-0.5
                                        text-gray-400 hover:text-blue-600 transition-colors active:scale-95">
        <Search size={22} strokeWidth={1.8} />
        <span className="text-[10px] font-medium">Browse</span>
      </Link>

      {/* Centre CTA */}
      <div className="flex-1 flex items-center justify-center">
        <Link href="/post"
          className="flex flex-col items-center justify-center gap-0.5 h-13 w-13
                     rounded-2xl text-white shadow-lg active:scale-95 transition-transform"
          style={{ background: 'linear-gradient(135deg,#1E3A8A,#38BDF8)', padding: '10px 12px' }}>
          <PlusCircle size={24} strokeWidth={1.8} />
          <span className="text-[10px] font-bold">Post</span>
        </Link>
      </div>

      <Link href={msgHref} className="flex-1 flex flex-col items-center justify-center gap-0.5
                                       text-gray-400 hover:text-blue-600 transition-colors active:scale-95 relative">
        <div className="relative">
          <MessageCircle size={22} strokeWidth={1.8} />
          {unread > 0 && (
            <span className="absolute -top-1.5 -right-1.5 h-4 min-w-4 rounded-full bg-blue-600
                             flex items-center justify-center text-[9px] font-bold text-white px-0.5">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </div>
        <span className="text-[10px] font-medium">Messages</span>
      </Link>

      <Link href={profHref} className="flex-1 flex flex-col items-center justify-center gap-0.5
                                        text-gray-400 hover:text-blue-600 transition-colors active:scale-95">
        <UserCircle size={22} strokeWidth={1.8} />
        <span className="text-[10px] font-medium">{user ? 'Profile' : 'Sign in'}</span>
      </Link>

    </nav>
  )
}
