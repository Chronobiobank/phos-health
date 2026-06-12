/**
 * Signed-in production route audit for Sean James.
 * Usage: node scripts/audit-signed-in-routes.mjs
 */

import { createServerClient } from '@supabase/ssr'
import { loadPhosAdmin, SEAN } from './sean-auth.mjs'

const BASE = process.env.AUDIT_BASE_URL ?? 'https://phos.org.uk'

function createCookieJar() {
  const jar = new Map()
  return {
    getAll() {
      return [...jar.entries()].map(([name, value]) => ({ name, value }))
    },
    setAll(cookiesToSet) {
      for (const { name, value } of cookiesToSet) {
        jar.set(name, value)
      }
    },
    header() {
      return [...jar.entries()].map(([name, value]) => `${name}=${value}`).join('; ')
    },
    size() {
      return jar.size
    },
  }
}

async function signIn(env) {
  const jar = createCookieJar()
  const supabase = createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (cookiesToSet) => jar.setAll(cookiesToSet),
    },
  })

  const password = env.SEAN_TEMP_PASSWORD
  if (!password) throw new Error('SEAN_TEMP_PASSWORD not set in .env.local')

  const { error } = await supabase.auth.signInWithPassword({ email: SEAN.email, password })
  if (error) throw new Error(`Sign-in failed: ${error.message}`)

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) throw new Error('No session after sign-in')

  if (jar.size() === 0) {
    const ref = new URL(env.NEXT_PUBLIC_SUPABASE_URL).hostname.split('.')[0]
    jar.set(
      `sb-${ref}-auth-token`,
      JSON.stringify({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at,
        expires_in: session.expires_in,
        token_type: session.token_type,
        user: session.user,
      }),
    )
  }

  return { jar, userId: session.user.id }
}

async function fetchRoute(path, jar) {
  const started = Date.now()
  const url = `${BASE}${path}`
  const response = await fetch(url, {
    redirect: 'manual',
    headers: {
      Cookie: jar.header(),
      'User-Agent': 'phos-signed-in-audit/1.0',
    },
  })

  const location = response.headers.get('location')
  let body = ''
  if (response.status !== 307 && response.status !== 308 && response.status !== 302) {
    body = await response.text()
  }

  return {
    path,
    status: response.status,
    location,
    body,
    elapsed: Date.now() - started,
  }
}

async function fetchSnapshot(jar) {
  const response = await fetch(`${BASE}/api/dashboard/snapshot`, {
    headers: {
      Cookie: jar.header(),
      'User-Agent': 'phos-signed-in-audit/1.0',
    },
  })

  if (!response.ok) {
    return { ok: false, status: response.status, snapshot: null }
  }

  return { ok: true, status: response.status, snapshot: await response.json() }
}

function icon(pass, partial) {
  if (pass) return '✅'
  if (partial) return '⚠️'
  return '❌'
}

function auditDashboard(snapshotRes, pageRes) {
  const snap = snapshotRes.snapshot
  const partial = []
  const fails = []

  if (pageRes.status === 307 || pageRes.status === 302) {
    fails.push(`redirected to ${pageRes.location}`)
  } else if (pageRes.status !== 200) {
    fails.push(`HTTP ${pageRes.status}`)
  }

  if (!snapshotRes.ok) {
    fails.push(`snapshot API ${snapshotRes.status}`)
  } else if (!snap || snap.isSample) {
    fails.push('snapshot is sample data')
  } else if ((snap.nightsCount ?? 0) < 3) {
    partial.push(`only ${snap.nightsCount ?? 0} nights in snapshot`)
  }

  if (snap && !snap.isSample && snap.photonicAge == null) {
    partial.push('photonic age missing')
  }

  const pass = fails.length === 0 && (snap?.nightsCount ?? 0) >= 3
  const partialOnly = fails.length === 0 && partial.length > 0

  return {
    verdict: icon(pass, partialOnly && !pass),
    label: pass ? 'renders correctly' : partialOnly ? 'partial' : 'error',
    detail: [...fails, ...partial].join('; ') || `3 nights, photonic age ${snap?.photonicAge}`,
  }
}

function auditDailyCue(pageRes, snapshotRes) {
  const fails = []
  const partial = []

  if (pageRes.status === 307 || pageRes.status === 302) {
    fails.push(`redirected to ${pageRes.location}`)
  } else if (pageRes.status !== 200) {
    fails.push(`HTTP ${pageRes.status}`)
  }

  if (!pageRes.body.includes('Light Time for today')) {
    fails.push('missing daily cue headline')
  }
  if (!pageRes.body.includes('Meal and sleep windows')) {
    fails.push('missing meal/sleep section')
  }
  if (!pageRes.body.includes('Start protocol')) {
    partial.push('shop protocol links not found in HTML')
  }

  const snap = snapshotRes.snapshot
  if (snap && !snap.isSample && pageRes.body.includes('lost light years')) {
    // live data surfaced
  } else if (pageRes.body.includes('Terry')) {
    partial.push('may be showing mock/Terry data')
  }

  const pass = fails.length === 0 && partial.length === 0
  const partialOnly = fails.length === 0 && partial.length > 0

  return {
    verdict: icon(pass, partialOnly),
    label: pass ? 'renders correctly' : partialOnly ? 'partial' : 'error',
    detail: [...fails, ...partial].join('; ') || 'meal/sleep windows and shop rows present',
  }
}

function auditStreams(pageRes, snapshotRes) {
  const fails = []
  const partial = []
  const snap = snapshotRes.snapshot

  if (pageRes.status === 307 || pageRes.status === 302) {
    fails.push(`redirected to ${pageRes.location}`)
  } else if (pageRes.status !== 200) {
    fails.push(`HTTP ${pageRes.status}`)
  }

  if (!pageRes.body.includes('Uploaded nights')) {
    fails.push('missing uploaded nights section')
  }

  const nights = snap?.nights ?? []
  const datesInHtml = nights.filter((n) => pageRes.body.includes(n.date)).length

  if (nights.length >= 3 && datesInHtml >= 3) {
    // ok
  } else if (nights.length >= 3) {
    partial.push(`${nights.length} nights in API but ${datesInHtml} dates visible in HTML`)
  } else if (!pageRes.body.includes('No nights uploaded yet')) {
    partial.push(`${nights.length} nights in snapshot`)
  } else {
    fails.push('no nights listed')
  }

  const pass = fails.length === 0 && partial.length === 0
  const partialOnly = fails.length === 0 && partial.length > 0

  return {
    verdict: icon(pass, partialOnly),
    label: pass ? 'renders correctly' : partialOnly ? 'partial' : 'error',
    detail: [...fails, ...partial].join('; ') || `${nights.length} nights listed`,
  }
}

function auditShop(pageRes) {
  const fails = []
  const partial = []

  if (pageRes.status !== 200) {
    fails.push(`HTTP ${pageRes.status}`)
  }
  if (!pageRes.body.includes('Start your supplement stack')) {
    fails.push('missing protocol section')
  }
  if (!pageRes.body.includes('PHOS VD3') || !pageRes.body.includes('PHOS MG')) {
    fails.push('protocol products missing')
  }
  if (pageRes.body.includes('No Stripe yet')) {
    partial.push('Stripe checkout not wired')
  }

  const pass = fails.length === 0 && partial.length === 0
  const partialOnly = fails.length === 0 && partial.length > 0

  return {
    verdict: icon(pass, partialOnly),
    label: pass ? 'renders correctly' : partialOnly ? 'partial' : 'error',
    detail: [...fails, ...partial].join('; ') || 'protocol products visible',
  }
}

function auditChronobiobank(pageRes) {
  const fails = []
  const partial = []

  if (pageRes.status !== 200) {
    fails.push(`HTTP ${pageRes.status}`)
  }
  if (pageRes.body.includes('Sign in</a> to join')) {
    fails.push('sign-in gate shown while authenticated')
  }
  if (!pageRes.body.includes('Your status')) {
    fails.push('consent status panel missing')
  }
  if (!pageRes.body.includes('Not contributing') && !pageRes.body.includes('Contributing')) {
    partial.push('contribution status unclear')
  }

  const pass = fails.length === 0 && partial.length === 0
  const partialOnly = fails.length === 0 && partial.length > 0

  return {
    verdict: icon(pass, partialOnly),
    label: pass ? 'renders correctly' : partialOnly ? 'partial' : 'error',
    detail: [...fails, ...partial].join('; ') || 'consent status shown',
  }
}

async function main() {
  const { env } = loadPhosAdmin()
  console.log(`\nPHOS signed-in route audit — ${BASE}`)
  console.log(`Sean: ${SEAN.email}\n${'='.repeat(52)}\n`)

  const { jar, userId } = await signIn(env)
  console.log(`Signed in (${userId})\n`)

  const snapshotRes = await fetchSnapshot(jar)
  const [dashboard, dailyCue, streams, shop, chronobiobank] = await Promise.all([
    fetchRoute('/dashboard', jar),
    fetchRoute('/daily-cue', jar),
    fetchRoute('/dashboard/streams', jar),
    fetchRoute('/shop', jar),
    fetchRoute('/chronobiobank', jar),
  ])

  const results = [
    { route: '/dashboard', ...auditDashboard(snapshotRes, dashboard) },
    { route: '/daily-cue', ...auditDailyCue(dailyCue, snapshotRes) },
    { route: '/dashboard/streams', ...auditStreams(streams, snapshotRes) },
    { route: '/shop', ...auditShop(shop) },
    { route: '/chronobiobank', ...auditChronobiobank(chronobiobank) },
  ]

  for (const row of results) {
    console.log(`${row.verdict} ${row.route} — ${row.label}`)
    if (row.detail) console.log(`    ${row.detail}`)
  }

  console.log(`\n${'='.repeat(52)}`)
  console.log(`Snapshot API: ${snapshotRes.ok ? '200' : snapshotRes.status}`)
  if (snapshotRes.snapshot) {
    const s = snapshotRes.snapshot
    console.log(
      `  nights=${s.nightsCount ?? 0} photonicAge=${s.photonicAge ?? '—'} lostLightYears=${s.lostLightYears ?? '—'}`,
    )
  }

  const errors = results.filter((r) => r.label === 'error').length
  if (errors > 0) process.exit(1)
}

main().catch((error) => {
  console.error(error.message ?? error)
  process.exit(1)
})
