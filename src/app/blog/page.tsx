import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Tips, guides, and news from the SkillLink team. Get more from your helpers and grow your earnings as a tasker.',
}

const POSTS = [
  {
    slug: '#',
    category: 'For Helpers',
    title: '10 tips to get more bookings on SkillLink',
    excerpt: 'A complete profile, fast response times, and five-star first impressions — here\'s how top helpers fill their calendars.',
    date: 'April 18, 2026',
    readTime: '5 min read',
    emoji: '⭐',
  },
  {
    slug: '#',
    category: 'For Posters',
    title: 'How to write a task post that gets great responses',
    excerpt: 'Clear descriptions, realistic budgets, and good photos — the difference between one reply and ten.',
    date: 'April 12, 2026',
    readTime: '4 min read',
    emoji: '✍️',
  },
  {
    slug: '#',
    category: 'Home Tips',
    title: 'Spring cleaning checklist: every room, covered',
    excerpt: 'The complete room-by-room guide to a thorough spring clean — including the spots everyone forgets.',
    date: 'April 5, 2026',
    readTime: '6 min read',
    emoji: '🌸',
  },
  {
    slug: '#',
    category: 'Moving',
    title: 'How to prepare for a stress-free move in Norway',
    excerpt: 'From booking a mover early to packing room by room — a practical timeline for your next home move.',
    date: 'March 28, 2026',
    readTime: '7 min read',
    emoji: '🚚',
  },
  {
    slug: '#',
    category: 'For Helpers',
    title: 'Setting your hourly rate: what helpers in Norway earn',
    excerpt: 'A look at average rates by category, how to price competitively, and when to charge more.',
    date: 'March 20, 2026',
    readTime: '5 min read',
    emoji: '💰',
  },
  {
    slug: '#',
    category: 'Safety',
    title: 'Staying safe when using home service platforms',
    excerpt: 'What to check before letting someone into your home, and how SkillLink\'s verification protects you.',
    date: 'March 14, 2026',
    readTime: '4 min read',
    emoji: '🔒',
  },
]

const CATEGORIES = ['All', 'For Helpers', 'For Posters', 'Home Tips', 'Moving', 'Safety']

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero */}
      <div className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-4xl px-6 py-14 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">SkillLink Blog</h1>
          <p className="text-gray-500 text-lg">Tips, guides, and news for helpers and task posters across Norway.</p>
        </div>
      </div>

      {/* Category filter (visual only) */}
      <div className="mx-auto max-w-4xl px-6 pt-8">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c, i) => (
            <span key={c}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold cursor-pointer transition-colors ${
                i === 0
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
              }`}>
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* Posts grid */}
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {POSTS.map(post => (
            <Link key={post.title} href={post.slug}
              className="group bg-white rounded-2xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-lg transition-all duration-200 flex flex-col gap-3">
              <div className="h-12 w-12 rounded-xl flex items-center justify-center text-2xl bg-gray-50">
                {post.emoji}
              </div>
              <div>
                <span className="text-xs font-semibold text-blue-600">{post.category}</span>
                <h2 className="font-bold text-gray-900 mt-1 leading-snug group-hover:text-blue-600 transition-colors">
                  {post.title}
                </h2>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed flex-1">{post.excerpt}</p>
              <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-400">{post.date}</span>
                <span className="text-xs text-gray-400">{post.readTime}</span>
              </div>
            </Link>
          ))}
        </div>

        <p className="text-center text-sm text-gray-400 mt-12 py-8">
          More articles coming soon. Check back regularly.
        </p>
      </div>

    </div>
  )
}
