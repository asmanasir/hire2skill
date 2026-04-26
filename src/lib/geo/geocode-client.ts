export type GeocodeResult = { lat: number; lon: number; label?: string }

export async function geocodeAddressNorway(address: string): Promise<GeocodeResult | null> {
  const q = address.trim()
  if (q.length < 3) return null

  const res = await fetch('/api/geo/geocode', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address: q }),
  })

  if (!res.ok) return null

  const data = (await res.json()) as { lat?: number; lon?: number; label?: string }
  if (typeof data.lat !== 'number' || typeof data.lon !== 'number') return null
  if (!Number.isFinite(data.lat) || !Number.isFinite(data.lon)) return null

  return { lat: data.lat, lon: data.lon, label: data.label }
}
