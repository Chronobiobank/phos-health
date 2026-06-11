/**
 * Reset Sean James password via Supabase Admin API.
 *
 * Usage:
 *   node scripts/reset-sean-password.mjs
 *
 * Requires .env.local with Supabase service role + SEAN_TEMP_PASSWORD.
 */

import {
  SEAN,
  ensureSeanAuthUser,
  loadPhosAdmin,
  resolveSeanPassword,
} from './sean-auth.mjs'

const { client: admin, env, envPath } = loadPhosAdmin()
const password = resolveSeanPassword(env)

if (!password) {
  console.error('Set SEAN_TEMP_PASSWORD in .env.local before running this script.')
  process.exit(1)
}

const result = await ensureSeanAuthUser(admin, { dryRun: false, password })

console.log(
  JSON.stringify(
    {
      ok: true,
      envPath,
      userId: result.user.id,
      email: SEAN.email,
      created: result.created,
      passwordSynced: result.passwordSynced,
      signInTest: result.signInTest,
    },
    null,
    2,
  ),
)

if (!result.signInTest?.ok) {
  process.exit(1)
}
