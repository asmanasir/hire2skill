'use client'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <div className="mx-auto mb-6 h-20 w-20 rounded-2xl flex items-center justify-center text-4xl"
          style={{ background: 'linear-gradient(135deg,#1E3A8A,#38BDF8)' }}>
          📶
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">You&apos;re offline</h1>
        <p className="text-gray-500 mb-8 text-sm leading-relaxed">
          No internet connection detected. Check your connection and try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-xl px-7 py-3 font-bold text-sm text-white"
          style={{ background: 'linear-gradient(135deg,#1E3A8A,#38BDF8)' }}
        >
          Try again
        </button>
      </div>
    </div>
  )
}
