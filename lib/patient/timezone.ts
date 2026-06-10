/** IANA timezone from patient profile location (city + country). */

const COUNTRY_TIMEZONES: Record<string, string> = {
  'new zealand': 'Pacific/Auckland',
  australia: 'Australia/Sydney',
  'united kingdom': 'Europe/London',
  ireland: 'Europe/Dublin',
  singapore: 'Asia/Singapore',
  'united states': 'America/New_York',
}

/** City names that override country-level defaults. */
const CITY_TIMEZONES: Array<{ match: string; timeZone: string }> = [
  { match: 'auckland', timeZone: 'Pacific/Auckland' },
  { match: 'wellington', timeZone: 'Pacific/Auckland' },
  { match: 'christchurch', timeZone: 'Pacific/Auckland' },
  { match: 'hamilton', timeZone: 'Pacific/Auckland' },
  { match: 'dunedin', timeZone: 'Pacific/Auckland' },
  { match: 'sydney', timeZone: 'Australia/Sydney' },
  { match: 'melbourne', timeZone: 'Australia/Melbourne' },
  { match: 'brisbane', timeZone: 'Australia/Brisbane' },
  { match: 'perth', timeZone: 'Australia/Perth' },
  { match: 'london', timeZone: 'Europe/London' },
  { match: 'manchester', timeZone: 'Europe/London' },
  { match: 'birmingham', timeZone: 'Europe/London' },
  { match: 'edinburgh', timeZone: 'Europe/London' },
  { match: 'dublin', timeZone: 'Europe/Dublin' },
  { match: 'toronto', timeZone: 'America/Toronto' },
  { match: 'vancouver', timeZone: 'America/Vancouver' },
]

export function resolvePatientTimeZone(
  locationCity?: string | null,
  locationCountry?: string | null
): string {
  const city = locationCity?.trim().toLowerCase() ?? ''
  const country = locationCountry?.trim().toLowerCase() ?? ''

  for (const { match, timeZone } of CITY_TIMEZONES) {
    if (city.includes(match)) return timeZone
  }

  if (country && COUNTRY_TIMEZONES[country]) {
    return COUNTRY_TIMEZONES[country]
  }

  return 'UTC'
}

export function dateToLocalClock(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date)

  const hour = parts.find((part) => part.type === 'hour')?.value ?? '00'
  const minute = parts.find((part) => part.type === 'minute')?.value ?? '00'
  return `${hour}:${minute}`
}

export function dateToLocalIsoDate(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)

  const year = parts.find((part) => part.type === 'year')?.value
  const month = parts.find((part) => part.type === 'month')?.value
  const day = parts.find((part) => part.type === 'day')?.value

  if (!year || !month || !day) {
    return date.toISOString().slice(0, 10)
  }

  return `${year}-${month}-${day}`
}

/** Winter-baseline earliest outdoor light (minutes from local midnight). */
export function approximateEarliestOutdoorLightMinutes(timeZone: string): number {
  const WINTER_SUNRISE: Record<string, number> = {
    'Pacific/Auckland': 7 * 60 + 15,
    'Australia/Sydney': 6 * 60 + 45,
    'Australia/Melbourne': 7 * 60 + 0,
    'Australia/Brisbane': 6 * 60 + 30,
    'Australia/Perth': 6 * 60 + 45,
    'Europe/London': 7 * 60 + 30,
    'Europe/Dublin': 7 * 60 + 45,
    'Asia/Singapore': 6 * 60 + 45,
    'America/New_York': 6 * 60 + 45,
    'America/Toronto': 7 * 60 + 15,
    'America/Vancouver': 7 * 60 + 30,
  }

  return WINTER_SUNRISE[timeZone] ?? 6 * 60 + 30
}
