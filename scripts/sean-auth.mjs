/**
 * Shared Sean James auth helpers for migration and password reset scripts.
 */

import { createClient } from '@supabase/supabase-js'
import { randomBytes } from 'crypto'
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

export const SEAN = {
  email: 's.james@tutamail.com',
  fullName: 'Sean James',
  dateOfBirth: '1978-07-17',
  locationCity: 'Auckland',
  locationCountry: 'New Zealand',
}

export function loadEnvFile(filePath) {
  if (!filePath || !existsSync(filePath)) return null
  const env = {}
  for (const line of readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^([^#=]+)=(.*)$/)
    if (!match) continue
    let value = match[2].trim()
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1)
    env[match[1].trim()] = value
  }
  return env
}

export function mergeEnvIntoProcess(env) {
  if (!env) return
  for (const [key, value] of Object.entries(env)) {
    if (process.env[key] === undefined) process.env[key] = value
  }
}

export function resolveEnvFile(explicit, candidates) {
  if (explicit && existsSync(explicit)) return explicit
  return candidates.find((candidate) => existsSync(candidate)) ?? null
}

export function resolveSeanPassword(env) {
  const value = process.env.SEAN_TEMP_PASSWORD ?? env?.SEAN_TEMP_PASSWORD
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export function createAdminFromEnv(env, label, envPath) {
  const url = env.NEXT_PUBLIC_SUPABASE_URL
  const key = env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error(`${label} (${envPath ?? 'unknown'}): missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY`)
  }
  return { client: createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }), url }
}

export function loadPhosAdmin() {
  const phosEnvPath = resolveEnvFile(process.env.PHOS_ENV_FILE, ['.env.local', '.env.production.local'])
  if (!phosEnvPath) throw new Error('PHOS env not found. Add .env.local or set PHOS_ENV_FILE.')
  const phosEnv = loadEnvFile(phosEnvPath)
  mergeEnvIntoProcess(phosEnv)
  return { ...createAdminFromEnv(phosEnv, 'PHOS', phosEnvPath), env: phosEnv, envPath: phosEnvPath }
}

export async function findUserByEmail(admin, email) {
  let page = 1
  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 })
    if (error) throw new Error(`listUsers failed: ${error.message}`)
    const match = data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase())
    if (match) return match
    if (data.users.length < 200) break
    page += 1
  }
  return null
}

export async function verifySeanSignIn(admin, email, password) {
  const { error } = await admin.auth.signInWithPassword({ email, password })
  return error ? { ok: false, message: error.message } : { ok: true }
}

/**
 * Create Sean if missing; always sync password + email confirm when password provided.
 */
export async function ensureSeanAuthUser(admin, options) {
  const { dryRun, password } = options
  const existing = await findUserByEmail(admin, SEAN.email)

  if (existing) {
    if (!password) {
      return {
        user: existing,
        created: false,
        passwordSynced: false,
        signInTest: null,
      }
    }

    if (dryRun) {
      return {
        user: existing,
        created: false,
        passwordSynced: true,
        signInTest: { ok: true, dryRun: true },
      }
    }

    const { data, error } = await admin.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      user_metadata: { full_name: SEAN.fullName },
    })
    if (error) throw new Error(`updateUser failed: ${error.message}`)

    const signInTest = await verifySeanSignIn(admin, SEAN.email, password)
    return {
      user: data.user,
      created: false,
      passwordSynced: true,
      signInTest,
    }
  }

  if (dryRun) {
    return {
      user: { id: '(new uuid on apply)', email: SEAN.email },
      created: true,
      passwordSynced: Boolean(password),
      signInTest: password ? { ok: true, dryRun: true } : null,
    }
  }

  const tempPassword = password ?? randomBytes(18).toString('base64url')
  const { data, error } = await admin.auth.admin.createUser({
    email: SEAN.email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { full_name: SEAN.fullName },
  })
  if (error) throw new Error(`createUser failed: ${error.message}`)

  const signInTest = await verifySeanSignIn(admin, SEAN.email, tempPassword)
  return {
    user: data.user,
    created: true,
    passwordSynced: true,
    tempPassword: password ? null : tempPassword,
    signInTest,
  }
}

export function defaultDiosEnvPath() {
  return resolveEnvFile(process.env.DIOS_ENV_FILE, [
    resolve('.env.dios.local'),
    resolve('..', 'dios-health', '.env.local'),
    resolve('..', 'dios-health', '.env.production.local'),
  ])
}
