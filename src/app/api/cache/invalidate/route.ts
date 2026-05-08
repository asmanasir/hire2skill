import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cacheDel } from '@/lib/redis'

const ALLOWED_KEYS = new Set(['taskers:list', 'jobs:open'])

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { key } = await req.json()
  if (typeof key !== 'string' || !ALLOWED_KEYS.has(key)) {
    return NextResponse.json({ error: 'Invalid key' }, { status: 400 })
  }

  await cacheDel(key)
  return NextResponse.json({ ok: true })
}
