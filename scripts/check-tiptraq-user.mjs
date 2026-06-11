import { createClient } from '@supabase/supabase-js'
import { findUserByEmail, loadPhosAdmin } from './sean-auth.mjs'

const email = process.argv.find((a) => a.startsWith('--email='))?.slice(8) ?? 's.james@tutamail.com'

function loadAnonClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

async function main() {
  const { client: admin } = loadPhosAdmin()
  const user = await findUserByEmail(admin, email)
  if (!user) throw new Error(`No user for ${email}`)

  console.log('User:', user.id, email)

  const tables = [
    ['tiptraq_nights', 'patient_id'],
    ['mlux_profiles', 'patient_id'],
    ['patient_profiles', 'id'],
    ['profiles', 'id'],
    ['photonic_age_profiles', 'member_id'],
  ]

  for (const [table, col] of tables) {
    const { data, error } = await admin.from(table).select('*').eq(col, user.id)
    console.log(`${table}:`, error?.message ?? `${data?.length ?? 0} row(s)`)
    if (table === 'tiptraq_nights' && data?.length) {
      console.log('  report_dates:', data.map((n) => n.report_date).join(', '))
    }
  }

  // Simulate RLS as authenticated user would see
  const password = process.env.SEAN_TEMP_PASSWORD
  if (password) {
    const anon = loadAnonClient()
    const { error: signInError } = await anon.auth.signInWithPassword({ email, password })
    if (signInError) {
      console.log('Anon sign-in failed:', signInError.message)
      return
    }
    const { data: nights, error: nightsError } = await anon
      .from('tiptraq_nights')
      .select('id, report_date')
      .eq('patient_id', user.id)
    console.log('RLS tiptraq_nights (as user):', nightsError?.message ?? `${nights?.length ?? 0} row(s)`)
  } else {
    console.log('Set SEAN_TEMP_PASSWORD to test RLS reads')
  }
}

main().catch((e) => {
  console.error(e.message ?? e)
  process.exit(1)
})
