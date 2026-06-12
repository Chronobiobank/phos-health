/**
 * Production smoke audit for phos.org.uk
 * Usage: node scripts/audit-production.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { loadPhosAdmin, findUserByEmail } from './sean-auth.mjs'

const BASE = process.env.AUDIT_BASE_URL ?? 'https://phos.org.uk'

const PUBLIC_ROUTES = [
  '/',
  '/score',
  '/shop',
  '/shop#protocol',
  '/shop#photonic-panel',
  '/shop#photonic-sleep-study',
  '/research/photonic-age',
  '/evidence',
  '/protocol',
  '/onboarding',
  '/chronobiobank',
  '/daily-cue',
  '/dashboard',
  '/dashboard/streams',
  '/auth/signin',
  '/auth/signin?next=/dashboard',
  '/privacy',
  '/terms',
  '/contact',
  '/for-firms',
  '/org',
  '/org/join',
  '/biology',
  '/loss-in-light-years',
  '/tiptraq',
]

const API_ROUTES = [
  { path: '/api/dashboard/snapshot', expect: [401] },
  { path: '/api/assessments', expect: [405] },
  { path: '/api/health/sync', expect: [405, 401] },
  { path: '/api/chronobiobank/opt-in', expect: [405, 401] },
  { path: '/api/shop/checkout', expect: [405, 401] },
  { path: '/api/kits/assign', expect: [405, 401] },
]

async function fetchCheck(url, options = {}) {
  const started = Date.now()
  try {
    const response = await fetch(url, {
      redirect: 'manual',
      ...options,
      headers: { 'User-Agent': 'phos-audit/1.0', ...(options.headers ?? {}) },
    })
    const elapsed = Date.now() - started
    const location = response.headers.get('location')
    let bodySnippet = ''
    if (response.status >= 400 && response.status !== 401 && response.status !== 405) {
      bodySnippet = (await response.text()).slice(0, 120).replace(/\s+/g, ' ')
    }
    return {
      ok: response.status >= 200 && response.status < 400,
      status: response.status,
      location,
      elapsed,
      bodySnippet,
    }
  } catch (error) {
    return {
      ok: false,
      status: 0,
      error: error instanceof Error ? error.message : String(error),
      elapsed: Date.now() - started,
    }
  }
}

async function auditPublicRoutes() {
  const results = []
  for (const path of PUBLIC_ROUTES) {
    const url = `${BASE}${path}`
    const result = await fetchCheck(url)
    const pass =
      result.ok ||
      (path.startsWith('/dashboard') && [307, 308, 302, 303].includes(result.status)) ||
      (path === '/daily-cue' && [307, 308, 302, 303].includes(result.status)) ||
      (path.includes('#') && result.status === 200)
    results.push({ path, ...result, pass })
  }
  return results
}

async function auditApiRoutes() {
  const results = []
  for (const route of API_ROUTES) {
    const url = `${BASE}${route.path}`
    const result = await fetchCheck(url)
    const pass = route.expect.includes(result.status)
    results.push({ path: route.path, ...result, pass, expected: route.expect.join('|') })
  }
  return results
}

async function auditAuthenticatedSnapshot() {
  const password = process.env.SEAN_TEMP_PASSWORD
  if (!password) {
    return { skipped: true, reason: 'SEAN_TEMP_PASSWORD not set' }
  }

  const { client: admin, env } = loadPhosAdmin()
  const user = await findUserByEmail(admin, 's.james@tutamail.com')
  if (!user) return { skipped: true, reason: 'Sean user not found' }

  const anon = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  const { error: signInError } = await anon.auth.signInWithPassword({
    email: 's.james@tutamail.com',
    password,
  })
  if (signInError) return { skipped: true, reason: `Sign-in failed: ${signInError.message}` }

  const { data: sessionData } = await anon.auth.getSession()
  const token = sessionData.session?.access_token
  if (!token) return { skipped: true, reason: 'No session token' }

  const snapshotRes = await fetchCheck(`${BASE}/api/dashboard/snapshot`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  // Bearer alone may not work for cookie-based route; also try cookie jar via setSession impossible in node simply
  // Use direct Supabase read as ground truth
  const { data: nights } = await admin
    .from('tiptraq_nights')
    .select('id')
    .eq('patient_id', user.id)

  return {
    skipped: false,
    snapshotStatus: snapshotRes.status,
    snapshotPass: snapshotRes.status === 401 ? 'cookie auth required (expected for bearer-only)' : snapshotRes.status === 200,
    tiptraqNightsInDb: nights?.length ?? 0,
    userId: user.id,
  }
}

async function auditLandingContent() {
  const result = await fetchCheck(`${BASE}/`)
  if (!result.ok && result.status !== 200) return { pass: false, reason: `Home ${result.status}` }
  const html = await (await fetch(`${BASE}/`)).text()
  const checks = [
    { label: 'Hero headline', pass: html.includes('Is light stealing your youth?') },
    { label: 'UK Biobank sub', pass: html.includes('UK Biobank') },
    { label: 'See the proof CTA', pass: html.includes('See the proof') },
    { label: 'Read the science CTA', pass: html.includes('Read the science') },
    { label: 'Sign up for free CTA', pass: html.includes('Sign up for free') },
    { label: 'Chronobiobank CTA', pass: html.includes('Control your data') },
  ]
  return { pass: checks.every((c) => c.pass), checks }
}

async function main() {
  console.log(`\nPHOS production audit — ${BASE}\n${'='.repeat(48)}\n`)

  const [publicRoutes, apiRoutes, landing, auth] = await Promise.all([
    auditPublicRoutes(),
    auditApiRoutes(),
    auditLandingContent(),
    auditAuthenticatedSnapshot(),
  ])

  console.log('PUBLIC ROUTES')
  for (const row of publicRoutes) {
    const icon = row.pass ? 'PASS' : 'FAIL'
    const loc = row.location ? ` → ${row.location}` : ''
    console.log(`  [${icon}] ${row.status} ${row.path}${loc} (${row.elapsed}ms)`)
    if (row.error) console.log(`         ${row.error}`)
    if (row.bodySnippet) console.log(`         ${row.bodySnippet}`)
  }

  console.log('\nAPI ROUTES (unauthenticated)')
  for (const row of apiRoutes) {
    const icon = row.pass ? 'PASS' : 'FAIL'
    console.log(`  [${icon}] ${row.status} ${row.path} (expected ${row.expected})`)
  }

  console.log('\nLANDING CONTENT')
  for (const check of landing.checks ?? []) {
    console.log(`  [${check.pass ? 'PASS' : 'FAIL'}] ${check.label}`)
  }

  console.log('\nSEAN / TIPTRAQ DATA')
  if (auth.skipped) {
    console.log(`  [SKIP] ${auth.reason}`)
  } else {
    console.log(`  [INFO] User ${auth.userId}`)
    console.log(`  [${auth.tiptraqNightsInDb >= 3 ? 'PASS' : 'FAIL'}] ${auth.tiptraqNightsInDb} TipTraQ nights in database`)
    console.log(`  [INFO] /api/dashboard/snapshot returned ${auth.snapshotStatus} (session cookie auth on browser)`)
  }

  const publicFails = publicRoutes.filter((r) => !r.pass).length
  const apiFails = apiRoutes.filter((r) => !r.pass).length
  const landingFail = landing.pass ? 0 : 1

  console.log(`\n${'='.repeat(48)}`)
  console.log(
    `Summary: ${publicFails} public route issue(s), ${apiFails} API issue(s), ${landingFail} landing issue(s)`,
  )

  if (publicFails + apiFails + landingFail > 0) process.exit(1)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
