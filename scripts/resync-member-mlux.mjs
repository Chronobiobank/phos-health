/**
 * Recompute stored MLux light window using member location (e.g. Auckland sunrise clamp).
 *
 * Usage:
 *   node scripts/resync-member-mlux.mjs
 *   node scripts/resync-member-mlux.mjs --email=s.james@tutamail.com
 */

import {
  createAdminFromEnv,
  findUserByEmail,
  loadEnvFile,
  mergeEnvIntoProcess,
  resolveEnvFile,
  SEAN,
} from './sean-auth.mjs'

const WINTER_SUNRISE = {
  'Pacific/Auckland': 7 * 60 + 15,
  'Europe/London': 7 * 60 + 30,
}

const CITY_TIMEZONES = [
  ['auckland', 'Pacific/Auckland'],
  ['wellington', 'Pacific/Auckland'],
  ['christchurch', 'Pacific/Auckland'],
]

const COUNTRY_TIMEZONES = {
  'new zealand': 'Pacific/Auckland',
  'united kingdom': 'Europe/London',
}

const emailArg = process.argv.find((arg) => arg.startsWith('--email='))
const email = emailArg?.slice('--email='.length) ?? SEAN.email

function resolveTimeZone(city, country) {
  const cityKey = (city ?? '').trim().toLowerCase()
  const countryKey = (country ?? '').trim().toLowerCase()

  for (const [match, timeZone] of CITY_TIMEZONES) {
    if (cityKey.includes(match)) return timeZone
  }

  return COUNTRY_TIMEZONES[countryKey] ?? 'UTC'
}

function toMinutes(clock) {
  const [hours, minutes] = clock.slice(0, 5).split(':').map(Number)
  return hours * 60 + minutes
}

function toClock(minutes) {
  const normalised = ((minutes % 1440) + 1440) % 1440
  const hours = Math.floor(normalised / 60)
  const mins = normalised % 60
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}

function adjustLightWindow(start, end, timeZone) {
  if (!timeZone || timeZone === 'UTC') return { start, end }

  const earliestOutdoor = WINTER_SUNRISE[timeZone] ?? 6 * 60 + 30
  const startMinutes = toMinutes(start)
  const endMinutes = toMinutes(end)

  if (startMinutes >= earliestOutdoor) return { start, end }

  const duration = ((endMinutes - startMinutes + 1440) % 1440) || 120
  const clampedStart = earliestOutdoor
  const clampedEnd = (clampedStart + Math.max(duration, 120)) % 1440

  return { start: toClock(clampedStart), end: toClock(clampedEnd) }
}

async function loadLocation(client, memberId) {
  const { data: member } = await client
    .from('members')
    .select('location_city, location_country, latitude')
    .eq('id', memberId)
    .maybeSingle()

  if (member?.location_city || member?.location_country) {
    return {
      timeZone: resolveTimeZone(member.location_city, member.location_country),
      latitude: member.latitude ?? -36.85,
      city: member.location_city,
      country: member.location_country,
    }
  }

  const { data: patient } = await client
    .from('patient_profiles')
    .select('location_city, location_country')
    .eq('id', memberId)
    .maybeSingle()

  return {
    timeZone: resolveTimeZone(patient?.location_city, patient?.location_country),
    latitude: -36.85,
    city: patient?.location_city,
    country: patient?.location_country,
  }
}

async function main() {
  const envFile = resolveEnvFile(process.env.PHOS_ENV_FILE, ['.env.local', '.env.production.local'])
  mergeEnvIntoProcess(loadEnvFile(envFile))

  const admin = createAdminFromEnv()
  const user = await findUserByEmail(admin, email)
  if (!user) throw new Error(`No auth user for ${email}`)

  const location = await loadLocation(admin, user.id)
  const { data: mlux, error: mluxError } = await admin
    .from('mlux_profiles')
    .select('light_dose_window_start, light_dose_window_end')
    .eq('patient_id', user.id)
    .maybeSingle()

  if (mluxError) throw new Error(mluxError.message)
  if (!mlux?.light_dose_window_start || !mlux?.light_dose_window_end) {
    throw new Error('No MLux light window stored for this member.')
  }

  const rawStart = mlux.light_dose_window_start.slice(0, 5)
  const rawEnd = mlux.light_dose_window_end.slice(0, 5)
  const adjusted = adjustLightWindow(rawStart, rawEnd, location.timeZone)

  const { error: updateError } = await admin
    .from('mlux_profiles')
    .update({
      light_dose_window_start: `${adjusted.start}:00`,
      light_dose_window_end: `${adjusted.end}:00`,
      last_updated: new Date().toISOString(),
    })
    .eq('patient_id', user.id)

  if (updateError) throw new Error(updateError.message)

  await admin
    .from('members')
    .upsert(
      {
        id: user.id,
        location_city: location.city ?? SEAN.locationCity,
        location_country: location.country ?? SEAN.locationCountry,
        latitude: location.latitude,
      },
      { onConflict: 'id' },
    )

  console.log(`Updated light window for ${email}`)
  console.log(
    JSON.stringify(
      {
        timeZone: location.timeZone,
        location: `${location.city ?? SEAN.locationCity}, ${location.country ?? SEAN.locationCountry}`,
        before: `${rawStart} to ${rawEnd}`,
        after: `${adjusted.start} to ${adjusted.end}`,
      },
      null,
      2,
    ),
  )
}

main().catch((error) => {
  console.error(error.message ?? error)
  process.exit(1)
})
