import { describe, expect, it } from 'vitest'

import {
  addMinutesToClock,
  circularMinutesDiff,
  formatMinutesAsClock,
  normalizeMinutes,
  parseClockToMinutes,
  sleepDurationMinutes,
  sleepMidpointMinutes,
} from '@/lib/phos/engine/time'

describe('time utilities', () => {
  it('rejects invalid clock strings', () => {
    expect(parseClockToMinutes('25:00')).toBeNull()
    expect(parseClockToMinutes('7am')).toBeNull()
  })

  it('computes overnight sleep duration', () => {
    expect(sleepDurationMinutes('23:00', '07:00')).toBe(480)
  })

  it('normalises minute overflow', () => {
    expect(normalizeMinutes(1500)).toBe(60)
    expect(formatMinutesAsClock(1500)).toBe('01:00')
  })

  it('adds minutes across midnight', () => {
    expect(addMinutesToClock('23:30', 60)).toBe('00:30')
  })

  it('finds shortest arc between two times', () => {
    expect(circularMinutesDiff(30, 1410)).toBe(60)
    expect(circularMinutesDiff(30, 210)).toBe(180)
  })

  it('aligns a classic sleep window to the 03:30 midpoint', () => {
    expect(normalizeMinutes(sleepMidpointMinutes('23:30', '07:30'))).toBe(210)
  })
})
