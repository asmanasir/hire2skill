import { NextResponse } from 'next/server'

const USER_AGENT = 'Hire2Skill/1.0 (https://hire2skill.com)'

/**
 * Geocode a Norwegian address via Nominatim (OpenStreetMap).
 * Use from the app after the user saves their service location — not for bulk scraping.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as { address?: string }
    const address = typeof body.address === 'string' ? body.address.trim() : ''
    if (address.length < 3) {
      return NextResponse.json({ error: 'Address too short' }, { status: 400 })
    }

    const url = new URL('https://nominatim.openstreetmap.org/search')
    url.searchParams.set('format', 'json')
    url.searchParams.set('limit', '1')
    url.searchParams.set('countrycodes', 'no')
    url.searchParams.set('q', address)

    const res = await fetch(url.toString(), {
      headers: {
        Accept: 'application/json',
        'User-Agent': USER_AGENT,
      },
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Geocoding service error' }, { status: 502 })
    }

    const rows = (await res.json()) as { lat?: string; lon?: string; display_name?: string }[]
    const first = rows[0]
    if (!first?.lat || !first?.lon) {
      return NextResponse.json({ error: 'No results for this address' }, { status: 404 })
    }

    const lat = Number(first.lat)
    const lon = Number(first.lon)
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return NextResponse.json({ error: 'Invalid coordinates' }, { status: 502 })
    }

    return NextResponse.json({
      lat,
      lon,
      label: typeof first.display_name === 'string' ? first.display_name : undefined,
    })
  } catch {
    return NextResponse.json({ error: 'Geocoding failed' }, { status: 500 })
  }
}
