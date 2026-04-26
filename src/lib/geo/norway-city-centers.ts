/** Approximate city centers (WGS84) for helper `location` → map pins. */
export const NORWAY_OVERVIEW_CENTER: [number, number] = [65.2, 12.5]

const CENTERS: Record<string, [number, number]> = {
  oslo: [59.9139, 10.7522],
  bergen: [60.393, 5.3241],
  trondheim: [63.4305, 10.3951],
  stavanger: [58.97, 5.7331],
  tromsø: [69.6492, 18.9553],
  tromso: [69.6492, 18.9553],
  kristiansand: [58.1467, 7.9956],
  drammen: [59.7439, 10.2045],
  fredrikstad: [59.2181, 10.9298],
  bodø: [67.2804, 14.4049],
  bodo: [67.2804, 14.4049],
  ålesund: [62.4722, 6.1549],
  alesund: [62.4722, 6.1549],
  norway: NORWAY_OVERVIEW_CENTER,
}

export function cityCenterLatLng(cityKey: string): [number, number] {
  const k = cityKey.toLowerCase().trim()
  if (CENTERS[k]) return CENTERS[k]
  const ascii = k.normalize('NFD').replace(/\p{M}/gu, '')
  if (CENTERS[ascii]) return CENTERS[ascii]
  return NORWAY_OVERVIEW_CENTER
}

function hasValidCoords(lat: number | null | undefined, lng: number | null | undefined): boolean {
  if (lat == null || lng == null) return false
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return false
  return true
}

/** Prefer stored geocoded coordinates; otherwise city center + jitter. */
export function latLngForTasker(
  cityKey: string,
  lat: number | null | undefined,
  lng: number | null | undefined,
  seed: string,
  index: number,
): [number, number] {
  if (hasValidCoords(lat, lng)) {
    return jitterLatLng([lat!, lng!], seed, index, 0.00055)
  }
  return jitterLatLng(cityCenterLatLng(cityKey), seed, index)
}

/** Average of pin positions (cluster marker). */
export function centroidLatLng(positions: [number, number][], cityKey: string): [number, number] {
  if (positions.length === 0) return cityCenterLatLng(cityKey)
  const s = positions.reduce((acc, [la, lo]) => [acc[0] + la, acc[1] + lo] as [number, number], [0, 0])
  return [s[0] / positions.length, s[1] / positions.length]
}

/** Small deterministic offset so many helpers in one city don’t stack. */
export function jitterLatLng(base: [number, number], seed: string, index: number, scale = 0.014): [number, number] {
  let h = 2166136261
  const s = `${seed}:${index}`
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  const u1 = (h >>> 0) / 4294967296
  const u2 = (Math.imul(h, 1597334677) >>> 0) / 4294967296
  const angle = u1 * Math.PI * 2
  const r = 0.35 + u2 * 0.65
  const dx = Math.cos(angle) * r * scale
  const dy = Math.sin(angle) * r * scale * 0.75
  return [base[0] + dy, base[1] + dx]
}
