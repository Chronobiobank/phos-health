/**
 * Migrate Sean James account data from DIOS Supabase to PHOS Supabase.
 *
 * Usage:
 *   node scripts/migrate-sean-dios-to-phos.mjs            # dry run (default)
 *   node scripts/migrate-sean-dios-to-phos.mjs --apply      # execute migration
 *   node scripts/migrate-sean-dios-to-phos.mjs --apply --force  # replace existing PHOS nights
 *
 * Env files (first match wins):
 *   DIOS_ENV_FILE  → ../dios-health/.env.local, ../dios-health/.env.production.local
 *   PHOS_ENV_FILE  → .env.local, .env.production.local
 *
 * Optional in .env.local:
 *   SEAN_TEMP_PASSWORD=your-chosen-password
 *
 * On --apply, SEAN_TEMP_PASSWORD always syncs to Sean's auth account
 * (create or update) and is verified with a sign-in test.
 */

import { resolve } from 'path'
import {
  SEAN,
  createAdminFromEnv,
  ensureSeanAuthUser,
  findUserByEmail,
  loadEnvFile,
  mergeEnvIntoProcess,
  resolveEnvFile,
  resolveSeanPassword,
} from './sean-auth.mjs'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function isUuid(value) {
  return typeof value === 'string' && UUID_RE.test(value)
}

const STORAGE_BUCKET = 'tiptraq-reports'

const args = new Set(process.argv.slice(2))
const APPLY = args.has('--apply')
const FORCE = args.has('--force')

function isMissingTableError(message) {
  const lower = message.toLowerCase()
  return lower.includes('schema cache') || lower.includes('does not exist')
}

async function optionalUpsert(client, table, row, options) {
  const { error } = await client.from(table).upsert(row, options)
  if (!error) return { ok: true }
  if (isMissingTableError(error.message)) return { ok: false, skipped: true }
  throw new Error(`${table} upsert failed: ${error.message}`)
}

async function resolveDiosPatientId(dios, seanUserId) {
  const { data: seanNights, error: seanError } = await dios
    .from('tiptraq_nights')
    .select('id, report_date, created_at')
    .eq('patient_id', seanUserId)
    .order('report_date', { ascending: true })

  if (seanError) throw new Error(`DIOS tiptraq_nights (Sean): ${seanError.message}`)
  if (seanNights.length > 0) {
    return { patientId: seanUserId, nights: seanNights, source: 'sean_account' }
  }

  const { data: allNights, error: allError } = await dios
    .from('tiptraq_nights')
    .select('patient_id, report_date, created_at')
    .order('created_at', { ascending: false })

  if (allError) throw new Error(`DIOS tiptraq_nights (all): ${allError.message}`)

  const counts = new Map()
  for (const night of allNights) {
    counts.set(night.patient_id, (counts.get(night.patient_id) ?? 0) + 1)
  }

  const uploaderId = [...counts.entries()]
    .filter(([patientId, count]) => patientId !== seanUserId && count === 3)
    .map(([patientId]) => patientId)[0]

  if (!uploaderId) {
    throw new Error('No TipTraQ nights on Sean and no other patient with exactly 3 nights in DIOS.')
  }

  const { data: uploaderNights, error: uploaderError } = await dios
    .from('tiptraq_nights')
    .select('id, report_date, created_at')
    .eq('patient_id', uploaderId)
    .order('report_date', { ascending: true })

  if (uploaderError) throw new Error(`DIOS tiptraq_nights (uploader): ${uploaderError.message}`)

  return { patientId: uploaderId, nights: uploaderNights, source: 'uploader_account' }
}

function remapStoragePath(path, fromId, toId) {
  if (!path) return null
  if (path.startsWith(`${fromId}/`)) return `${toId}/${path.slice(fromId.length + 1)}`
  return path.split(fromId).join(toId)
}

function stripNightForInsert(night, phosPatientId, diosPatientId) {
  const { id: _id, patient_id: _patientId, ...rest } = night
  return {
    ...rest,
    patient_id: phosPatientId,
    pdf_path: remapStoragePath(rest.pdf_path, diosPatientId, phosPatientId),
  }
}

function stripMluxForInsert(mlux, phosPatientId) {
  const { id: _id, patient_id: _patientId, created_at: _createdAt, ...rest } = mlux
  return {
    ...rest,
    patient_id: phosPatientId,
    last_updated: new Date().toISOString(),
  }
}

async function copyStorageObject(dios, phos, sourcePath, destPath, dryRun) {
  if (!sourcePath || !destPath || sourcePath === destPath) return { copied: false, skipped: true }

  if (dryRun) {
    console.log(`  [dry-run] storage ${sourcePath} → ${destPath}`)
    return { copied: true, skipped: false }
  }

  const { data: blob, error: downloadError } = await dios.storage.from(STORAGE_BUCKET).download(sourcePath)
  if (downloadError) {
    console.warn(`  storage download failed (${sourcePath}): ${downloadError.message}`)
    return { copied: false, skipped: false, error: downloadError.message }
  }

  const { error: uploadError } = await phos.storage.from(STORAGE_BUCKET).upload(destPath, blob, {
    upsert: true,
    contentType: blob.type || 'application/octet-stream',
  })

  if (uploadError) {
    console.warn(`  storage upload failed (${destPath}): ${uploadError.message}`)
    return { copied: false, skipped: false, error: uploadError.message }
  }

  return { copied: true, skipped: false }
}

async function ensurePhosProfiles(phos, phosUserId, diosPatientProfile, dryRun) {
  const profileRows = {
    profiles: {
      id: phosUserId,
      role: 'patient',
      full_name: SEAN.fullName,
    },
    patient_profiles: {
      id: phosUserId,
      date_of_birth: diosPatientProfile?.date_of_birth ?? SEAN.dateOfBirth,
      location_city: diosPatientProfile?.location_city ?? SEAN.locationCity,
      location_country: diosPatientProfile?.location_country ?? SEAN.locationCountry,
    },
    members: {
      id: phosUserId,
      full_name: SEAN.fullName,
      date_of_birth: diosPatientProfile?.date_of_birth ?? SEAN.dateOfBirth,
      location_city: diosPatientProfile?.location_city ?? SEAN.locationCity,
      location_country: diosPatientProfile?.location_country ?? SEAN.locationCountry,
    },
  }

  if (dryRun) return profileRows

  for (const [table, row] of Object.entries(profileRows)) {
    if (table === 'members') {
      const result = await optionalUpsert(phos, table, row, { onConflict: 'id' })
      if (result.skipped) continue
    } else {
      const { error } = await phos.from(table).upsert(row, { onConflict: 'id' })
      if (error) throw new Error(`PHOS ${table} upsert failed: ${error.message}`)
    }
  }

  await optionalUpsert(
    phos,
    'consents',
    {
      member_id: phosUserId,
      consent_type: 'service',
      granted: true,
      granted_at: new Date().toISOString(),
    },
    { onConflict: 'member_id,consent_type' },
  )

  return profileRows
}

async function migrateNights(phos, nights, phosUserId, diosPatientId, dryRun, sameProject) {
  if (sameProject) {
    if (diosPatientId === phosUserId) {
      return {
        mode: 'already_linked',
        relinked: nights.length,
        reportDates: nights.map((night) => night.report_date),
      }
    }

    if (dryRun) {
      return {
        mode: 'relink',
        relinked: nights.length,
        reportDates: nights.map((night) => night.report_date),
      }
    }

    for (const night of nights) {
      const { error } = await phos
        .from('tiptraq_nights')
        .update({
          patient_id: phosUserId,
          pdf_path: remapStoragePath(night.pdf_path, diosPatientId, phosUserId),
        })
        .eq('id', night.id)

      if (error) throw new Error(`PHOS tiptraq_nights relink failed (${night.id}): ${error.message}`)
    }

    return {
      mode: 'relink',
      relinked: nights.length,
      reportDates: nights.map((night) => night.report_date),
    }
  }

  let existing = []
  if (isUuid(phosUserId)) {
    const { data, error: existingError } = await phos
      .from('tiptraq_nights')
      .select('id, report_date')
      .eq('patient_id', phosUserId)

    if (existingError) throw new Error(`PHOS existing nights: ${existingError.message}`)
    existing = data ?? []
  }

  const existingDates = new Set(existing.map((night) => night.report_date))
  const toInsert = []
  const toReplace = []

  for (const night of nights) {
    if (existingDates.has(night.report_date)) {
      toReplace.push(night)
    } else {
      toInsert.push(night)
    }
  }

  if (existing.length > 0 && toReplace.length > 0 && !FORCE) {
    throw new Error(
      `PHOS already has ${existing.length} night(s) for Sean. Re-run with --force to replace overlapping dates.`,
    )
  }

  if (dryRun) {
    return {
      inserted: toInsert.length + (FORCE ? toReplace.length : 0),
      skipped: FORCE ? 0 : toReplace.length,
      reportDates: nights.map((night) => night.report_date),
    }
  }

  if (FORCE && toReplace.length > 0) {
    const replaceDates = toReplace.map((night) => night.report_date)
    const { error: deleteError } = await phos
      .from('tiptraq_nights')
      .delete()
      .eq('patient_id', phosUserId)
      .in('report_date', replaceDates)
    if (deleteError) throw new Error(`PHOS night delete failed: ${deleteError.message}`)
  }

  const payload = [...toInsert, ...(FORCE ? toReplace : [])].map((night) =>
    stripNightForInsert(night, phosUserId, diosPatientId),
  )

  if (payload.length === 0) {
    return { inserted: 0, skipped: toReplace.length, reportDates: nights.map((night) => night.report_date) }
  }

  const { error: insertError } = await phos.from('tiptraq_nights').insert(payload)
  if (insertError) throw new Error(`PHOS tiptraq_nights insert failed: ${insertError.message}`)

  return {
    mode: 'insert',
    inserted: payload.length,
    skipped: FORCE ? 0 : toReplace.length,
    reportDates: nights.map((night) => night.report_date),
  }
}

async function migrateMlux(phos, dios, diosPatientId, phosUserId, dryRun, sameProject) {
  const { data: mlux, error } = await dios.from('mlux_profiles').select('*').eq('patient_id', diosPatientId).maybeSingle()
  if (error) throw new Error(`DIOS mlux_profiles: ${error.message}`)
  if (!mlux) return { copied: false, reason: 'no mlux row in DIOS' }

  if (sameProject && diosPatientId !== phosUserId) {
    if (dryRun) return { copied: true, mode: 'relink', patient_id: phosUserId }

    const { data: existingSeanMlux } = await phos
      .from('mlux_profiles')
      .select('patient_id')
      .eq('patient_id', phosUserId)
      .maybeSingle()

    if (existingSeanMlux) {
      await phos.from('mlux_profiles').delete().eq('patient_id', diosPatientId)
      return { copied: true, mode: 'relink', keptExisting: true }
    }

    const { error: relinkError } = await phos
      .from('mlux_profiles')
      .update({ patient_id: phosUserId, last_updated: new Date().toISOString() })
      .eq('patient_id', diosPatientId)

    if (relinkError) throw new Error(`PHOS mlux_profiles relink failed: ${relinkError.message}`)
    return { copied: true, mode: 'relink', patient_id: phosUserId }
  }

  const row = stripMluxForInsert(mlux, phosUserId)
  if (dryRun) return { copied: true, mode: 'copy', row }

  const { error: upsertError } = await phos.from('mlux_profiles').upsert(row, { onConflict: 'patient_id' })
  if (upsertError) throw new Error(`PHOS mlux_profiles upsert failed: ${upsertError.message}`)
  return { copied: true, mode: 'copy', row }
}

async function ensurePremiumTier(phos, phosUserId, dryRun) {
  const row = { member_id: phosUserId, tier: 'premium', status: 'active' }
  if (dryRun) return row
  const result = await optionalUpsert(phos, 'subscriptions', row, { onConflict: 'member_id' })
  if (result.skipped) return { ...row, skipped: true }
  return row
}

async function main() {
  const diosEnvPath = resolveEnvFile(process.env.DIOS_ENV_FILE, [
    resolve('..', 'dios-health', '.env.local'),
    resolve('..', 'dios-health', '.env.production.local'),
  ])
  const phosEnvPath = resolveEnvFile(process.env.PHOS_ENV_FILE, [
    '.env.local',
    '.env.production.local',
  ])

  if (!diosEnvPath) throw new Error('DIOS env not found. Set DIOS_ENV_FILE or add ../dios-health/.env.local')
  if (!phosEnvPath) throw new Error('PHOS env not found. Set PHOS_ENV_FILE or add .env.local')

  const diosEnv = loadEnvFile(diosEnvPath)
  const phosEnv = loadEnvFile(phosEnvPath)
  mergeEnvIntoProcess(phosEnv)

  const { client: dios, url: diosUrl } = createAdminFromEnv(diosEnv, 'DIOS', diosEnvPath)
  const { client: phos, url: phosUrl } = createAdminFromEnv(phosEnv, 'PHOS', phosEnvPath)
  const sameProject = diosUrl.replace(/\/$/, '') === phosUrl.replace(/\/$/, '')

  console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY RUN'}${FORCE ? ' (force)' : ''}`)
  console.log(`DIOS env: ${diosEnvPath}`)
  console.log(`PHOS env: ${phosEnvPath}`)
  console.log(`Same Supabase project: ${sameProject}`)

  const diosSean = await findUserByEmail(dios, SEAN.email)
  if (!diosSean) {
    throw new Error(`Sean not found in DIOS auth (${SEAN.email}). Run repair-sean-james-dios.sql first.`)
  }

  const { patientId: diosPatientId, nights: nightSummary, source: nightSource } = await resolveDiosPatientId(
    dios,
    diosSean.id,
  )

  const { data: fullNights, error: nightsError } = await dios
    .from('tiptraq_nights')
    .select('*')
    .eq('patient_id', diosPatientId)
    .order('report_date', { ascending: true })

  if (nightsError) throw new Error(`DIOS full nights fetch: ${nightsError.message}`)

  const { data: diosPatientProfile } = await dios
    .from('patient_profiles')
    .select('date_of_birth, location_city, location_country')
    .eq('id', diosSean.id)
    .maybeSingle()

  const phosPassword = resolveSeanPassword(phosEnv)
  const phosAuth = await ensureSeanAuthUser(phos, { dryRun: !APPLY, password: phosPassword })
  const phosUserId = phosAuth.user.id

  if (!APPLY) {
    const profilePlan = await ensurePhosProfiles(phos, phosUserId, diosPatientProfile, true)
    const nightPlan = await migrateNights(phos, fullNights, phosUserId, diosPatientId, true, sameProject)
    const mluxPlan = await migrateMlux(phos, dios, diosPatientId, phosUserId, true, sameProject)
    const subscriptionPlan = await ensurePremiumTier(phos, phosUserId, true)

    const storagePairs = fullNights
      .map((night) => {
        const sourcePath = night.pdf_path
        const destPath = remapStoragePath(sourcePath, diosPatientId, phosUserId)
        return sourcePath && destPath ? { sourcePath, destPath } : null
      })
      .filter(Boolean)

    console.log(
      JSON.stringify(
        {
          ok: true,
          dryRun: true,
          sameProject,
          diosSean: { id: diosSean.id, email: diosSean.email },
          diosPatientId,
          nightSource,
          nightSummary,
          phosUser: {
            id: phosUserId,
            email: SEAN.email,
            willCreate: phosAuth.created,
            passwordWillSync: phosAuth.passwordSynced,
          },
          seanPasswordConfigured: Boolean(phosPassword),
          nightsToMigrate: fullNights.length,
          nightPlan,
          mluxPlan,
          subscriptionPlan,
          storageObjects: storagePairs,
          profilePlan,
          next: 'node scripts/migrate-sean-dios-to-phos.mjs --apply',
        },
        null,
        2,
      ),
    )
    return
  }

  const profileRows = await ensurePhosProfiles(phos, phosUserId, diosPatientProfile, false)
  const nightResult = await migrateNights(phos, fullNights, phosUserId, diosPatientId, false, sameProject)
  const mluxResult = await migrateMlux(phos, dios, diosPatientId, phosUserId, false, sameProject)
  const subscriptionResult = await ensurePremiumTier(phos, phosUserId, false)

  const storagePairs = fullNights
    .map((night) => {
      const sourcePath = night.pdf_path
      const destPath = remapStoragePath(sourcePath, diosPatientId, phosUserId)
      return sourcePath && destPath ? { sourcePath, destPath } : null
    })
    .filter(Boolean)

  let storageCopied = 0
  for (const pair of storagePairs) {
    const result = await copyStorageObject(dios, phos, pair.sourcePath, pair.destPath, false)
    if (result.copied) storageCopied += 1
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        sameProject,
        phosUserId,
        phosEmail: SEAN.email,
        authCreated: phosAuth.created,
        passwordSynced: phosAuth.passwordSynced,
        signInTest: phosAuth.signInTest,
        tempPassword: phosAuth.tempPassword,
        diosSeanId: diosSean.id,
        diosPatientId,
        nightSource,
        nights: nightResult,
        mlux: mluxResult,
        subscription: subscriptionResult,
        storageCopied,
        profileRows,
      },
      null,
      2,
    ),
  )

  if (phosAuth.tempPassword) {
    console.log('\nNew PHOS account created. Share temp password securely or reset via Supabase Auth.')
  }

  if (APPLY && !phosAuth.passwordSynced) {
    console.log('\nWarning: SEAN_TEMP_PASSWORD not set. Run: node scripts/reset-sean-password.mjs')
  }

  if (APPLY && phosAuth.signInTest && !phosAuth.signInTest.ok) {
    throw new Error(`Sean sign-in test failed: ${phosAuth.signInTest.message}`)
  }
}

main().catch((error) => {
  console.error(error.message ?? error)
  process.exit(1)
})
