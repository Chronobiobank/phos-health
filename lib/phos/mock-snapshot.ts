import type { PhosSnapshot } from '@/lib/phos/types'

export const TERRY_MOCK_SNAPSHOT: PhosSnapshot = {
  subjectName: 'Terry',
  calendarAge: 43,
  photonicAge: 47.2,
  lostLightYears: 4.2,
  nightsCount: 3,
  confidenceScore: 62,
  confidenceLabel: 'Moderate',
  chronotype: 'Late anchor',
  lightWindow: { start: '10:00', end: '16:00' },
  metrics: [
    { label: 'Light time', value: '2.9 h', note: 'Bright light per day' },
    { label: 'Dark time', value: '6.8 h', note: 'True dark per night' },
    { label: 'Sleep efficiency', value: '84%', note: 'Three-night average' },
    { label: 'Social jet lag', value: '38 min', note: 'Workday vs free-day shift' },
    { label: 'Circadian alignment', value: '62%', note: 'Phase vs internal clock' },
    { label: 'Recovery index', value: '71', note: 'Overnight restoration score' },
  ],
  nights: [
    { id: 'sample-1', date: '2026-06-08', sleepEfficiency: 82, tstMinutes: 392, dlmoTime: '21:45' },
    { id: 'sample-2', date: '2026-06-09', sleepEfficiency: 85, tstMinutes: 408, dlmoTime: '21:30' },
    { id: 'sample-3', date: '2026-06-10', sleepEfficiency: 84, tstMinutes: 401, dlmoTime: '21:38' },
  ],
  isSample: true,
  canUpload: false,
}
