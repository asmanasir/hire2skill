const BASIC_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i

const BLOCKED_DOMAINS = new Set([
  'example.com',
  'example.org',
  'example.net',
  'test.com',
  'invalid.com',
  'mailinator.com',
  'yopmail.com',
  'tempmail.com',
  'temp-mail.org',
  'guerrillamail.com',
  '10minutemail.com',
])

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase()
}

export type EmailGuardReason = 'invalid_format' | 'blocked_domain'

export function getEmailGuardReason(email: string): EmailGuardReason | null {
  const normalized = normalizeEmail(email)
  if (!BASIC_EMAIL_RE.test(normalized)) return 'invalid_format'

  const domain = normalized.split('@')[1] ?? ''
  if (!domain || BLOCKED_DOMAINS.has(domain)) return 'blocked_domain'

  return null
}
