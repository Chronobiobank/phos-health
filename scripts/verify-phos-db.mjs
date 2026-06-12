/**
 * Verify PHOS Supabase project: correct ref + migration tables + Sean rows.
 * Usage: node scripts/verify-phos-db.mjs
 */

import { loadPhosAdmin, findUserByEmail, SEAN } from './sean-auth.mjs'

const PHOS_REF = 'eiwkdtpgnvvsgeguxrfa'
const DIOS_REF = 'lkfjiboswnmeoiyymqbu'

const MIGRATION_TABLES = [
  'profiles',
  'patient_profiles',
  'tiptraq_nights',
  'members',
  'consents',
  'subscriptions',
  'photonic_age_profiles',
  'cue_events',
]

function projectRefFromUrl(url) {
  const match = url?.match(/https:\/\/([^.]+)\.supabase\.co/)
  return match?.[1] ?? null
}

function projectRefFromJwt(token) {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString())
    return payload.ref ?? null
  } catch {
    return null
  }
}

async function main() {
  const { client, url, env } = loadPhosAdmin()
  const urlRef = projectRefFromUrl(url)
  const jwtRef = projectRefFromJwt(env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '')

  console.log('PHOS env URL ref:', urlRef ?? '(missing URL)')
  console.log('PHOS anon JWT ref:', jwtRef ?? '(missing anon key)')
  console.log('Expected ref:', PHOS_REF)

  if (urlRef === DIOS_REF || jwtRef === DIOS_REF) {
    console.error('\nERROR: .env.local still points at DIOS. Use PHOS keys from Settings → API.')
    process.exit(1)
  }

  if (urlRef !== PHOS_REF || jwtRef !== PHOS_REF) {
    console.error('\nERROR: PHOS Supabase URL and anon key must both target eiwkdtpgnvvsgeguxrfa.')
    process.exit(1)
  }

  console.log('\nMigration tables:')
  let missing = 0
  for (const table of MIGRATION_TABLES) {
    const { error } = await client.from(table).select('*').limit(0)
    if (error) {
      missing += 1
      console.log(`  [MISSING] ${table}: ${error.message}`)
    } else {
      console.log(`  [OK] ${table}`)
    }
  }

  const user = await findUserByEmail(client, SEAN.email)
  if (!user) {
    console.log('\nSean auth: not found (run npm run sean:migrate after 001)')
  } else {
    console.log('\nSean auth:', user.id, SEAN.email)
    for (const [table, col] of [
      ['tiptraq_nights', 'patient_id'],
      ['members', 'id'],
      ['photonic_age_profiles', 'member_id'],
    ]) {
      const { data, error } = await client.from(table).select('*').eq(col, user.id)
      console.log(`  ${table}:`, error?.message ?? `${data?.length ?? 0} row(s)`)
    }
  }

  if (missing > 0) {
    console.error(`\n${missing} table(s) missing. Run 001 then 002 in PHOS SQL Editor.`)
    process.exit(1)
  }

  console.log('\nPHOS database ready.')
}

main().catch((error) => {
  console.error(error.message ?? error)
  process.exit(1)
})
