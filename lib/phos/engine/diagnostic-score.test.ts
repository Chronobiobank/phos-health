import { describe, expect, it } from 'vitest'

import {
  computeD1PhaseDrift,
  computeD2SocialJetLag,
  computeD3PersonalLight,
  recommendProtocol,
  scoreFromDiagnostic,
} from '@/lib/phos/engine/diagnostic-score'
import type { DiagnosticAnswers } from '@/lib/phos/engine/diagnostic-types'
import {
  addMinutesToClock,
  circularMinutesDiff,
  normalizeMinutes,
  parseClockToMinutes,
  sleepMidpointMinutes,
} from '@/lib/phos/engine/time'

/** Aligned sleeper: midpoint normalises to 03:30 ideal. */
const IDEAL: DiagnosticAnswers = {
  calendarAge: 40,
  latitude: 48,
  weekdayWakeTime: '07:30',
  weekdaySleepOnset: '23:30',
  weekendSleepShiftMinutes: 15,
  eveningScreenHours: 0.5,
  outdoorMinutesDaily: 75,
}

describe('time helpers', () => {
  it('parses and formats clock values', () => {
    expect(parseClockToMinutes('07:30')).toBe(450)
    expect(addMinutesToClock('07:00', 30)).toBe('07:30')
  })

  it('handles overnight sleep midpoints', () => {
    const midpoint = sleepMidpointMinutes('23:30', '07:30')
    expect(normalizeMinutes(midpoint)).toBe(3 * 60 + 30)
  })

  it('measures circular distance across midnight', () => {
    expect(circularMinutesDiff(0, 1380)).toBe(60)
  })
})

describe('domain calculators', () => {
  it('scores zero D1 drift at ideal midpoint', () => {
    const result = computeD1PhaseDrift(3 * 60 + 30)
    expect(result.phaseDeviationHours).toBe(0)
    expect(result.contribution).toBe(0)
  })

  it('caps D1 contribution at 2.8', () => {
    const result = computeD1PhaseDrift(15 * 60)
    expect(result.contribution).toBe(2.8)
  })

  it('scores social jet lag linearly up to cap', () => {
    expect(computeD2SocialJetLag(210, 210).contribution).toBe(0)
    expect(computeD2SocialJetLag(210, 255).contribution).toBe(1)
    expect(computeD2SocialJetLag(210, 600).contribution).toBe(1.8)
  })

  it('penalises high latitude, screens, and low outdoor time in D3', () => {
    const harsh = computeD3PersonalLight({
      latitude: 56,
      eveningScreenHours: 4,
      outdoorMinutesDaily: 5,
    })
    const mild = computeD3PersonalLight({
      latitude: 40,
      eveningScreenHours: 0,
      outdoorMinutesDaily: 90,
    })

    expect(harsh.contribution).toBeGreaterThan(mild.contribution)
    expect(harsh.contribution).toBeLessThanOrEqual(1.6)
  })
})

describe('scoreFromDiagnostic', () => {
  it('returns photonic age as calendar age plus lost light years', () => {
    const score = scoreFromDiagnostic(IDEAL)
    expect(score.photonicAge).toBe(score.calendarAge + score.lostLightYears)
    expect(score.calendarAge).toBe(40)
  })

  it('produces a low score for an aligned profile', () => {
    const score = scoreFromDiagnostic(IDEAL)
    expect(score.lostLightYears).toBeLessThan(1.5)
    expect(score.domains).toHaveLength(3)
    expect(score.domains.find((domain) => domain.key === 'd1')?.lostLightYearsContribution).toBe(0)
  })

  it('produces a high score for misaligned sleep and light habits', () => {
    const score = scoreFromDiagnostic({
      calendarAge: 35,
      latitude: 57,
      weekdayWakeTime: '10:00',
      weekdaySleepOnset: '02:00',
      weekendSleepShiftMinutes: 120,
      eveningScreenHours: 5,
      outdoorMinutesDaily: 5,
    })

    expect(score.lostLightYears).toBeGreaterThan(4)
    expect(score.photonicAge).toBeGreaterThan(score.calendarAge + 4)
  })

  it('sums capped domain contributions into lost light years', () => {
    const score = scoreFromDiagnostic({
      calendarAge: 30,
      latitude: 60,
      weekdayWakeTime: '11:00',
      weekdaySleepOnset: '03:00',
      weekendSleepShiftMinutes: 180,
      eveningScreenHours: 6,
      outdoorMinutesDaily: 0,
    })

    const domainSum = score.domains.reduce(
      (total, domain) => total + domain.lostLightYearsContribution,
      0,
    )

    expect(score.lostLightYears).toBe(Math.round(domainSum * 10) / 10)
    expect(score.lostLightYears).toBeLessThanOrEqual(6.2)
    expect(score.domains.find((domain) => domain.key === 'd3')?.lostLightYearsContribution).toBe(1.4)
  })

  it('caps each domain independently', () => {
    expect(computeD1PhaseDrift(15 * 60).contribution).toBe(2.8)
    expect(computeD2SocialJetLag(0, 12 * 60).contribution).toBe(1.8)
    expect(
      computeD3PersonalLight({ latitude: 60, eveningScreenHours: 6, outdoorMinutesDaily: 0 }).contribution,
    ).toBe(1.35)
  })

  it('builds light time from weekday wake time', () => {
    const score = scoreFromDiagnostic(IDEAL)
    expect(score.lightTime.start).toBe('08:00')
    expect(score.lightTime.cueType).toBe('Anchor')
    expect(score.lightTime.timeline).toHaveLength(4)
    expect(score.lightTime.timeline[0].active).toBe(true)
  })

  it('recommends anchor protocol when D1 dominates', () => {
    const protocol = recommendProtocol([
      {
        key: 'd1',
        label: 'Body clock phase',
        value: 3,
        unit: 'h drift',
        source: 'test',
        confidence: 30,
        lostLightYearsContribution: 2.5,
      },
      {
        key: 'd2',
        label: 'Social jet lag',
        value: 10,
        unit: 'min',
        source: 'test',
        confidence: 30,
        lostLightYearsContribution: 0.2,
      },
      {
        key: 'd3',
        label: 'Personal light',
        value: 0.5,
        unit: 'index',
        source: 'test',
        confidence: 30,
        lostLightYearsContribution: 0.5,
      },
    ])

    expect(protocol.focus).toBe('anchor')
  })

  it('recommends light hygiene when D3 dominates', () => {
    const score = scoreFromDiagnostic({
      ...IDEAL,
      weekdayWakeTime: '07:30',
      weekdaySleepOnset: '23:30',
      weekendSleepShiftMinutes: 0,
      latitude: 58,
      eveningScreenHours: 5,
      outdoorMinutesDaily: 0,
    })

    expect(score.protocol.focus).toBe('light_hygiene')
  })

  it('uses wide confidence for questionnaire-only input', () => {
    const score = scoreFromDiagnostic(IDEAL)
    expect(score.confidenceLabel).toBe('Wide')
    expect(score.confidenceBandMinutes).toBe(150)
  })

  it('rejects invalid intake', () => {
    expect(() => scoreFromDiagnostic({ ...IDEAL, calendarAge: 12 })).toThrow(/calendarAge/)
    expect(() => scoreFromDiagnostic({ ...IDEAL, weekdayWakeTime: '7am' })).toThrow(/weekdayWakeTime/)
  })

  it('exposes provenance for downstream storage', () => {
    const score = scoreFromDiagnostic(IDEAL)
    expect(score.provenance.source).toBe('diagnostic')
    expect(score.provenance.latitude).toBe(48)
    expect(score.provenance.socialJetLagMinutes).toBeGreaterThanOrEqual(0)
  })
})
