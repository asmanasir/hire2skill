import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import { getPublicSupabaseEnv } from '@/lib/env/public'

function resolveNextPath(raw: string | null): string | null {
  if (!raw) return null
  if (!raw.startsWith('/')) return null
  if (raw.startsWith('//')) return null
  return raw
}

function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach(({ name, value }) => {
    to.cookies.set(name, value)
  })
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type')
  const nextPath = resolveNextPath(searchParams.get('next'))
  const { url, anonKey } = getPublicSupabaseEnv()

  if (!code) {
    if (type === 'recovery') {
      return NextResponse.redirect(`${origin}/reset-password`)
    }
    return NextResponse.redirect(`${origin}/onboarding`)
  }

  const redirectUrl =
    type === 'recovery'
      ? `${origin}/reset-password`
      : `${origin}/onboarding`

  let response = NextResponse.redirect(redirectUrl)

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        response = NextResponse.redirect(redirectUrl)
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.session) {
    return NextResponse.redirect(`${origin}/login?error=auth`)
  }

  if (type === 'recovery') {
    return response
  }

  if (!data.user) {
    return NextResponse.redirect(`${origin}/login?error=auth`)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', data.user.id)
    .maybeSingle()

  const path = profile && nextPath ? nextPath : profile ? '/' : '/onboarding'
  const out = NextResponse.redirect(`${origin}${path}`)
  copyCookies(response, out)
  return out
}
