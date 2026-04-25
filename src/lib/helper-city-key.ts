/** First token of location string (matches map zones / city pages). */
export function helperCityKey(location: string): string {
  return location.toLowerCase().split(/[–\s]/)[0].trim()
}

export const CITY_LANDING_SLUGS = ['oslo', 'bergen', 'trondheim'] as const
export type CityLandingSlug = (typeof CITY_LANDING_SLUGS)[number]

export function isCityLandingSlug(raw: string): raw is CityLandingSlug {
  const s = raw.toLowerCase()
  return (CITY_LANDING_SLUGS as readonly string[]).includes(s)
}
