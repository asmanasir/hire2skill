function readFlag(name: string, fallback: boolean): boolean {
  const raw = process.env[name]
  if (raw == null) return fallback
  const normalized = raw.trim().toLowerCase()
  return normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on'
}

function readIntInRange(name: string, fallback: number, min: number, max: number): number {
  const raw = process.env[name]
  if (raw == null) return fallback
  const parsed = Number.parseInt(raw, 10)
  if (!Number.isFinite(parsed)) return fallback
  return Math.min(max, Math.max(min, parsed))
}

export const FEATURES = {
  enableDemoData: readFlag('NEXT_PUBLIC_ENABLE_DEMO_DATA', process.env.NODE_ENV !== 'production'),
  enableSms2fa: readFlag('NEXT_PUBLIC_ENABLE_SMS_2FA', false),
  enableBankId: readFlag('NEXT_PUBLIC_ENABLE_BANKID', false),
  enablePayments: readFlag('NEXT_PUBLIC_ENABLE_PAYMENTS', false),
  recentJobsWindowHours: readIntInRange('NEXT_PUBLIC_RECENT_JOBS_WINDOW_HOURS', 48, 1, 168),
} as const

