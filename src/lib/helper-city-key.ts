/**
 * City key for grouping (map, city landing). Prefers text after the last comma
 * so "Storgata 1, Oslo" → oslo; plain "Bergen" still works.
 */
export function helperCityKey(location: string): string {
  const t = location.trim()
  if (!t) return 'norway'
  const comma = t.lastIndexOf(',')
  const segment = comma >= 0 ? t.slice(comma + 1).trim() : t
  const token = segment.toLowerCase().split(/[–\s]/)[0]?.trim() ?? ''
  return token || 'norway'
}

export const CITY_LANDING_SLUGS = ['oslo', 'bergen', 'trondheim'] as const
export type CityLandingSlug = (typeof CITY_LANDING_SLUGS)[number]

export function isCityLandingSlug(raw: string): raw is CityLandingSlug {
  const s = raw.toLowerCase()
  return (CITY_LANDING_SLUGS as readonly string[]).includes(s)
}
