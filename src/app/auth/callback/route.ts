import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

function resolveNextPath(raw: string | null): string | null {
  if (!raw) return null
  if (!raw.startsWith('/')) return null
  if (raw.startsWith('//')) return null
  return raw
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type')
  const nextPath = resolveNextPath(searchParams.get('next'))

  if (code) {
    const supabase = await createClient()
    const { data } = await supabase.auth.exchangeCodeForSession(code)

    if (type === 'recovery') {
      return NextResponse.redirect(`${origin}/reset-password`)
    }

    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .maybeSingle()

      if (profile && nextPath) {
        return NextResponse.redirect(`${origin}${nextPath}`)
      }
      return NextResponse.redirect(`${origin}${profile ? '/dashboard' : '/onboarding'}`)
    }
  }

  if (type === 'recovery') {
    return NextResponse.redirect(`${origin}/reset-password`)
  }

  return NextResponse.redirect(`${origin}/onboarding`)
}
