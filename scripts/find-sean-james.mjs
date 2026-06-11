import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

const envCandidates = [
  process.env.ENV_FILE,
  resolve('..', 'dios-health', '.env.local'),
  resolve('..', 'dios-health', '.env.production.local'),
  '.env.production.local',
  '.env.local',
].filter(Boolean)

const envPath = envCandidates.find((candidate) => existsSync(candidate))
if (!envPath) {
  console.error('NO_ENV_FILE')
  process.exit(1)
}

const envText = readFileSync(envPath, 'utf8')
for (const line of envText.split(/\r?\n/)) {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) {
    const key = match[1].trim()
    let value = match[2].trim()
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1)
    }
    process.env[key] = value
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error(`MISSING_KEYS from ${envPath}`)
  process.exit(1)
}

async function query(path) {
  const response = await fetch(`${url}/rest/v1/${path}`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
  })
  const text = await response.text()
  if (!response.ok) {
    throw new Error(`${response.status} ${text.slice(0, 300)}`)
  }
  return text ? JSON.parse(text) : null
}

const usersResponse = await fetch(`${url}/auth/v1/admin/users?per_page=200`, {
  headers: {
    apikey: key,
    Authorization: `Bearer ${key}`,
  },
})

const usersBody = await usersResponse.json()
const users = usersBody.users || usersBody

const SEAN_EMAIL = 's.james@tutamail.com'

const seanUsers = users.filter((user) => {
  const name = (user.user_metadata?.full_name || user.raw_user_meta_data?.full_name || '').toLowerCase()
  const email = (user.email || '').toLowerCase()
  return email === SEAN_EMAIL || name.includes('sean james') || email.includes('sean')
})

const nights = await query('tiptraq_nights?select=patient_id,report_date,created_at&order=created_at.desc')
const counts = {}

for (const night of nights) {
  counts[night.patient_id] = (counts[night.patient_id] || 0) + 1
}

const profiles = await query('profiles?select=id,full_name,role')
const profileById = Object.fromEntries(profiles.map((profile) => [profile.id, profile]))

const threeNightPatients = Object.entries(counts)
  .filter(([, count]) => count === 3)
  .map(([patientId, count]) => ({
    patient_id: patientId,
    nights_count: count,
    full_name: profileById[patientId]?.full_name || null,
    email: users.find((user) => user.id === patientId)?.email || null,
  }))

console.log(
  JSON.stringify(
    {
      envPath,
      seanUsers: seanUsers.map((user) => ({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.raw_user_meta_data?.full_name || null,
        created_at: user.created_at,
        deleted_at: user.deleted_at || null,
      })),
      threeNightPatients,
      allNightCounts: Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .map(([patientId, count]) => ({
          patient_id: patientId,
          nights_count: count,
          full_name: profileById[patientId]?.full_name || null,
          email: users.find((user) => user.id === patientId)?.email || null,
        })),
    },
    null,
    2,
  ),
)
