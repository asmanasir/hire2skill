export type NotifyResult =
  | { ok: true }
  | { ok: false; status?: number; reason: 'network' | 'http'; error?: string }

export async function postNotify(payload: unknown): Promise<NotifyResult> {
  try {
    const res = await fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      let errorText: string | undefined
      try {
        const body = (await res.json()) as { error?: string }
        errorText = typeof body?.error === 'string' ? body.error : undefined
      } catch {
        // Ignore parse errors and keep generic HTTP context.
      }
      return { ok: false, status: res.status, reason: 'http', error: errorText }
    }
    return { ok: true }
  } catch {
    return { ok: false, reason: 'network' }
  }
}

export function explainNotifyFailure(result: Exclude<NotifyResult, { ok: true }>): string {
  if (result.reason === 'network') return 'Network issue while notifying.'
  const detail = result.error ?? ''
  if (detail.includes('EMAIL_PROVIDER_AUTH_FAILED')) return 'Email provider authentication failed (invalid API key).'
  if (detail.includes('EMAIL_PROVIDER_SENDER_FORBIDDEN')) return 'Sender/domain is not verified in email provider.'
  if (detail.includes('EMAIL_PROVIDER_HTTP_')) return 'Email provider temporarily rejected the request.'
  if (result.status === 429) return 'Too many notify requests right now.'
  if (result.status === 503) return 'Notification service is not configured yet.'
  if (result.status === 401 || result.status === 403) return 'Session/permission check failed for notify.'
  if (result.error) return 'Notification request failed.'
  return 'Notification request failed.'
}

