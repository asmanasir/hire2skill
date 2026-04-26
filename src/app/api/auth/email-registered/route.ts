import { NextResponse } from 'next/server'
import { normalizeEmail } from '@/lib/email-guard'
import { createAdminClient } from '@/lib/supabase/admin'

const LIST_PAGE_SIZE = 200
const LIST_MAX_PAGES = 40

/** When auth_email_exists RPC is missing or errors (e.g. migration not applied), scan admin users. */
async function emailExistsViaAdminList(
  admin: ReturnType<typeof createAdminClient>,
  emailNorm: string,
): Promise<boolean | null> {
  try {
    for (let page = 1; page <= LIST_MAX_PAGES; page++) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: LIST_PAGE_SIZE })
      if (error || !data?.users) return null
      const { users } = data
      for (const u of users) {
        if (u.email && normalizeEmail(u.email) === emailNorm) return true
      }
      if (users.length < LIST_PAGE_SIZE) return false
    }
    return null
  } catch {
    return null
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({} as { email?: string }))
    const raw = typeof body.email === 'string' ? body.email : ''
    const email = normalizeEmail(raw)
    if (!email.includes('@')) {
      return NextResponse.json({ ok: true, registered: false }, { status: 200 })
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase.rpc('auth_email_exists', { p_email: email })

    if (!error && typeof data === 'boolean') {
      return NextResponse.json({ ok: true, registered: data }, { status: 200 })
    }

    const fallback = await emailExistsViaAdminList(supabase, email)
    if (fallback !== null) {
      return NextResponse.json({ ok: true, registered: fallback }, { status: 200 })
    }

    return NextResponse.json({ ok: false }, { status: 200 })
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 })
  }
}
