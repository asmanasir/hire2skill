import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

// Save a push subscription for the current user
export async function POST(req: NextRequest) {
  const supabase = await createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { endpoint, p256dh, auth } = await req.json()
  if (!endpoint || !p256dh || !auth)
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  await admin.from('push_subscriptions').upsert(
    { user_id: user.id, endpoint, p256dh, auth },
    { onConflict: 'endpoint' },
  )

  return NextResponse.json({ ok: true })
}

// Remove a push subscription (called on SW unregister)
export async function DELETE(req: NextRequest) {
  const supabase = await createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { endpoint } = await req.json()
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
  await admin.from('push_subscriptions').delete().eq('endpoint', endpoint).eq('user_id', user.id)

  return NextResponse.json({ ok: true })
}
