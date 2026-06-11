import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

function loadEnvFile(filePath) {
  if (!filePath || !existsSync(filePath)) return { path: filePath, env: null }
  const env = {}
  for (const line of readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^([^#=]+)=(.*)$/)
    if (!match) continue
    let value = match[2].trim()
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1)
    env[match[1].trim()] = value
  }
  return { path: filePath, env }
}

function report(label, { path, env }, requireSeanPassword) {
  if (!env) {
    console.log(`${label}: missing (${path})`)
    return false
  }
  const hasCore = Boolean(env.NEXT_PUBLIC_SUPABASE_URL) && Boolean(env.SUPABASE_SERVICE_ROLE_KEY)
  const hasSean = !requireSeanPassword || Boolean(env.SEAN_TEMP_PASSWORD)
  console.log(`${label}: ${path}`)
  if (requireSeanPassword) {
    console.log(`  SEAN_TEMP_PASSWORD: ${env.SEAN_TEMP_PASSWORD ? `set (${env.SEAN_TEMP_PASSWORD.length} chars)` : 'NOT SET'}`)
  }
  console.log(`  NEXT_PUBLIC_SUPABASE_URL: ${env.NEXT_PUBLIC_SUPABASE_URL ? 'set' : 'NOT SET'}`)
  console.log(`  SUPABASE_SERVICE_ROLE_KEY: ${env.SUPABASE_SERVICE_ROLE_KEY ? 'set' : 'NOT SET'}`)
  return hasCore && hasSean
}

const phosCandidates = ['.env.local', '.env.production.local']
const phos =
  phosCandidates
    .map((file) => loadEnvFile(file))
    .find(({ env }) => env) ?? loadEnvFile('.env.local')
const dios = loadEnvFile(resolve('..', 'dios-health', '.env.local'))

console.log('Migration env check\n')
const phosOk = report('PHOS', phos, true)
const diosOk = report('DIOS', dios, false)
console.log('')
console.log(phosOk && diosOk ? 'READY for migrate dry-run' : 'NOT READY — fix missing vars above')
