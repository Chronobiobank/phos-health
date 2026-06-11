import type { SupabaseClient } from '@supabase/supabase-js'

import { resolvePatientTimeZone } from '@/lib/patient/timezone'

const CITY_LATITUDE: Array<{ match: string; latitude: number }> = [
  { match: 'auckland', latitude: -36.85 },
  { match: 'wellington', latitude: -41.29 },
  { match: 'christchurch', latitude: -43.53 },
  { match: 'hamilton', latitude: -37.79 },
  { match: 'dunedin', latitude: -45.87 },
  { match: 'sydney', latitude: -33.87 },
  { match: 'melbourne', latitude: -37.81 },
  { match: 'brisbane', latitude: -27.47 },
  { match: 'perth', latitude: -31.95 },
  { match: 'london', latitude: 51.51 },
  { match: 'manchester', latitude: 53.48 },
  { match: 'birmingham', latitude: 52.49 },
  { match: 'edinburgh', latitude: 55.95 },
  { match: 'dublin', latitude: 53.35 },
  { match: 'toronto', latitude: 43.65 },
  { match: 'vancouver', latitude: 49.28 },
]

const COUNTRY_LATITUDE: Record<string, number> = {
  'new zealand': -41.0,
  australia: -25.0,
  'united kingdom': 54.0,
  ireland: 53.4,
  singapore: 1.35,
  'united states': 39.0,
}

export type MemberLocation = {
  locationCity: string | null
  locationCountry: string | null
  timeZone: string
  latitude: number
}

export function resolveLatitudeFromLocation(
  locationCity?: string | null,
  locationCountry?: string | null,
  fallback = 51.5,
): number {
  const city = locationCity?.trim().toLowerCase() ?? ''
  const country = locationCountry?.trim().toLowerCase() ?? ''

  for (const { match, latitude } of CITY_LATITUDE) {
    if (city.includes(match)) return latitude
  }

  if (country && COUNTRY_LATITUDE[country] != null) {
    return COUNTRY_LATITUDE[country]
  }

  return fallback
}

export function memberLocationFromFields(input: {
  locationCity?: string | null
  locationCountry?: string | null
  latitude?: number | null
}): MemberLocation {
  const locationCity = input.locationCity ?? null
  const locationCountry = input.locationCountry ?? null
  const timeZone = resolvePatientTimeZone(locationCity, locationCountry)
  const latitude =
    input.latitude != null
      ? Number(input.latitude)
      : resolveLatitudeFromLocation(locationCity, locationCountry)

  return { locationCity, locationCountry, timeZone, latitude }
}

export async function loadMemberLocation(
  supabase: SupabaseClient,
  memberId: string,
): Promise<MemberLocation> {
  const { data: member } = await supabase
    .from('members')
    .select('location_city, location_country, latitude')
    .eq('id', memberId)
    .maybeSingle()

  if (member?.location_city || member?.location_country || member?.latitude != null) {
    return memberLocationFromFields({
      locationCity: member.location_city,
      locationCountry: member.location_country,
      latitude: member.latitude,
    })
  }

  const { data: patient } = await supabase
    .from('patient_profiles')
    .select('location_city, location_country')
    .eq('id', memberId)
    .maybeSingle()

  return memberLocationFromFields({
    locationCity: patient?.location_city,
    locationCountry: patient?.location_country,
  })
}
