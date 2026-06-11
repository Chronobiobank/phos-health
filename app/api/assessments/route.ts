import { randomUUID } from 'node:crypto'

import { NextResponse } from 'next/server'

import { buildAssessmentRow } from '@/lib/assessments/map-score'
import { latitudeFromUkPostcode } from '@/lib/assessments/postcode'
import { sessionFromAssessmentRow } from '@/lib/assessments/row-to-session'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

type AssessmentRequest = {
  postcode: string
  chronological_age: number
  sleep_time: string
  wake_time: string
  screen_after_9pm: boolean
  outdoor_hours: number
  current_d3: boolean
  current_d3_dose?: number | null
  consented_chronobiobank: boolean
}

export async function POST(request: Request) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Assessment storage is not configured.' }, { status: 503 })
  }

  let body: AssessmentRequest
  try {
    body = (await request.json()) as AssessmentRequest
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const age = Number(body.chronological_age)
  if (!Number.isFinite(age) || age < 16 || age > 100) {
    return NextResponse.json({ error: 'Age must be between 16 and 100.' }, { status: 400 })
  }

  const outdoorHours = Number(body.outdoor_hours)
  if (!Number.isFinite(outdoorHours) || outdoorHours < 0 || outdoorHours > 16) {
    return NextResponse.json({ error: 'Outdoor hours must be between 0 and 16.' }, { status: 400 })
  }

  if (!body.sleep_time || !body.wake_time) {
    return NextResponse.json({ error: 'Sleep and wake times are required.' }, { status: 400 })
  }

  if (!body.postcode?.trim()) {
    return NextResponse.json({ error: 'Postcode is required.' }, { status: 400 })
  }

  let postcodeLat: number
  try {
    postcodeLat = await latitudeFromUkPostcode(body.postcode)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Postcode lookup failed.'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  const dose =
    body.current_d3 && body.current_d3_dose != null ? Math.round(Number(body.current_d3_dose)) : null
  if (body.current_d3 && (dose == null || dose < 0 || dose > 10000)) {
    return NextResponse.json({ error: 'Enter a valid D3 dose in IU.' }, { status: 400 })
  }

  const { score: _score, ...row } = buildAssessmentRow({
    chronological_age: age,
    postcode_lat: postcodeLat,
    sleep_time: body.sleep_time,
    wake_time: body.wake_time,
    screen_after_9pm: Boolean(body.screen_after_9pm),
    outdoor_hours: outdoorHours,
    current_d3: Boolean(body.current_d3),
    current_d3_dose: dose,
    consented_chronobiobank: Boolean(body.consented_chronobiobank),
  })

  const assessmentId = randomUUID()
  const supabase = createAdminClient()
  const { error } = await supabase.from('phos_assessments').insert({ ...row, id: assessmentId })

  if (error) {
    console.error('phos_assessments insert failed', error.code, error.message)
    return NextResponse.json({ error: 'Could not save assessment.' }, { status: 500 })
  }

  return NextResponse.json(
    sessionFromAssessmentRow(assessmentId, {
      chronological_age: row.chronological_age,
      postcode_lat: row.postcode_lat,
      sleep_time: row.sleep_time,
      wake_time: row.wake_time,
      screen_after_9pm: row.screen_after_9pm,
      outdoor_hours: row.outdoor_hours,
      current_d3: row.current_d3,
      current_d3_dose: row.current_d3_dose,
      risk_level: row.risk_level,
      consented_chronobiobank: row.consented_chronobiobank,
    }),
  )
}
