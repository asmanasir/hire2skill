import { NextResponse } from 'next/server'
import { normalizeEmail } from '@/lib/email-guard'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({} as { email?: string }))
    const rawEmail = typeof body.email === 'string' ? body.email : ''
    const email = normalizeEmail(rawEmail)
    if (!email.includes('@')) {
      return NextResponse.json({ ok: true, blocked: false }, { status: 200 })
    }

    const domain = email.split('@')[1] ?? ''
    const supabase = createAdminClient()
    const { data: emailHit, error: emailError } = await supabase
      .from('email_denylist')
      .select('email, domain, reason, active')
      .eq('active', true)
      .eq('email', email)
      .limit(1)
      .maybeSingle()

    if (emailError) {
      return NextResponse.json({ ok: false, blocked: false }, { status: 200 })
    }
    if (emailHit?.active) {
      return NextResponse.json({ ok: true, blocked: true, reason: emailHit.reason ?? 'blocked' }, { status: 200 })
    }

    const { data: domainHit, error: domainError } = await supabase
      .from('email_denylist')
      .select('domain, reason, active')
      .eq('active', true)
      .eq('domain', domain)
      .limit(1)
      .maybeSingle()

    if (domainError) {
      return NextResponse.json({ ok: false, blocked: false }, { status: 200 })
    }
    const blocked = Boolean(domainHit?.active)
    return NextResponse.json(
      {
        ok: true,
        blocked,
        reason: blocked ? (domainHit?.reason ?? 'blocked') : null,
      },
      { status: 200 },
    )
  } catch {
    return NextResponse.json({ ok: false, blocked: false }, { status: 200 })
  }
}
