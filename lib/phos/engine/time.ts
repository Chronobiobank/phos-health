/** Parse HH:MM (24h) to minutes from midnight. */
export function parseClockToMinutes(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim())
  if (!match) return null

  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null

  return hours * 60 + minutes
}

/** Format minutes from midnight as HH:MM. */
export function formatMinutesAsClock(minutes: number): string {
  const normalized = ((minutes % 1440) + 1440) % 1440
  const hours = Math.floor(normalized / 60)
  const mins = normalized % 60
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}

export function addMinutesToClock(time: string, deltaMinutes: number): string {
  const base = parseClockToMinutes(time)
  if (base == null) return time
  return formatMinutesAsClock(base + deltaMinutes)
}

/** Sleep duration in minutes when onset and wake may cross midnight. */
export function sleepDurationMinutes(onset: string, wake: string): number {
  const onsetMinutes = parseClockToMinutes(onset)
  const wakeMinutes = parseClockToMinutes(wake)
  if (onsetMinutes == null || wakeMinutes == null) return 480

  if (wakeMinutes > onsetMinutes) return wakeMinutes - onsetMinutes
  return 1440 - onsetMinutes + wakeMinutes
}

export function sleepMidpointMinutes(onset: string, wake: string): number {
  const onsetMinutes = parseClockToMinutes(onset)
  if (onsetMinutes == null) return 3 * 60 + 30

  const duration = sleepDurationMinutes(onset, wake)
  return onsetMinutes + duration / 2
}

/** Shortest distance between two clock positions on a 24h dial. */
export function circularMinutesDiff(a: number, b: number): number {
  const diff = Math.abs(a - b)
  return Math.min(diff, 1440 - diff)
}

export function normalizeMinutes(minutes: number): number {
  return ((minutes % 1440) + 1440) % 1440
}
