import {
  ZEITGEber_LIGHT_END_OFFSET,
  ZEITGEber_LIGHT_START_OFFSET,
  normalizeMinutesFromMidnight,
} from '@/lib/mlux'
import { formatMinutesAsClock, parseClockToMinutes } from '@/lib/phos/engine/time'
import { approximateEarliestOutdoorLightMinutes } from '@/lib/patient/timezone'

const DEFAULT_WINDOW_MINUTES =
  ZEITGEber_LIGHT_END_OFFSET - ZEITGEber_LIGHT_START_OFFSET

/** Clamp morning light window so anchor is never before local outdoor light is available. */
export function adjustLightWindowForLocation(
  startClock: string,
  endClock: string,
  timeZone: string,
): { start: string; end: string } {
  if (!timeZone || timeZone === 'UTC') {
    return { start: startClock, end: endClock }
  }

  const startMinutes = parseClockToMinutes(startClock)
  const endMinutes = parseClockToMinutes(endClock)
  if (startMinutes == null || endMinutes == null) {
    return { start: startClock, end: endClock }
  }

  const earliestOutdoor = approximateEarliestOutdoorLightMinutes(timeZone)
  if (startMinutes >= earliestOutdoor) {
    return { start: startClock, end: endClock }
  }

  const duration =
    normalizeMinutesFromMidnight(endMinutes - startMinutes) || DEFAULT_WINDOW_MINUTES
  const clampedStart = earliestOutdoor
  const clampedEnd = normalizeMinutesFromMidnight(
    clampedStart + Math.max(duration, DEFAULT_WINDOW_MINUTES),
  )

  return {
    start: formatMinutesAsClock(clampedStart),
    end: formatMinutesAsClock(clampedEnd),
  }
}

export function dailyCueCopyForLightWindow(startClock: string): string {
  return `Catch first light, before ${startClock}.`
}
