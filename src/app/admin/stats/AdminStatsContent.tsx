'use client'

import type { PlatformStats } from './page'

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  completed: 'Completed',
  cancelled: 'Cancelled',
  declined: 'Declined',
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  accepted: 'bg-blue-50 text-blue-700 border-blue-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-gray-50 text-gray-600 border-gray-200',
  declined: 'bg-red-50 text-red-700 border-red-200',
}

function StatCard({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
      {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
    </div>
  )
}

export default function AdminStatsContent({ stats }: { stats: PlatformStats }) {
  const totalUsers = stats.totalHelpers + stats.totalPosters

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Platform Stats</h1>

      {/* Users */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">Users</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Total Users" value={totalUsers} />
          <StatCard label="Helpers" value={stats.totalHelpers} />
          <StatCard label="Posters" value={stats.totalPosters} />
          <StatCard label="New (7d)" value={stats.newUsersLast7Days} sub={`${stats.newUsersLast30Days} last 30d`} />
        </div>
      </section>

      {/* Verifications */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">Verifications</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard label="Verified Helpers" value={stats.verifiedHelpers} />
          <StatCard label="Pending Review" value={stats.pendingVerifications} />
          <StatCard
            label="Verification Rate"
            value={stats.totalHelpers > 0 ? Math.round((stats.verifiedHelpers / stats.totalHelpers) * 100) : 0}
            sub="% of helpers verified"
          />
        </div>
      </section>

      {/* Posts */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">Posts</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard label="Total Posts" value={stats.totalPosts} />
          <StatCard label="Open Posts" value={stats.openPosts} />
          <StatCard label="Reviews" value={stats.totalReviews} />
        </div>
      </section>

      {/* Bookings */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">Bookings</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard label="Total Bookings" value={stats.totalBookings} />
          {Object.entries(stats.bookingsByStatus).map(([status, count]) => (
            <div key={status} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${STATUS_COLORS[status] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                  {STATUS_LABELS[status] ?? status}
                </span>
              </div>
              <p className="mt-2 text-3xl font-bold text-gray-900">{count.toLocaleString()}</p>
              {stats.totalBookings > 0 && (
                <p className="mt-1 text-xs text-gray-400">
                  {Math.round((count / stats.totalBookings) * 100)}% of total
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
