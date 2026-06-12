import type { PhosSnapshot } from '@/lib/phos/types'
import { TERRY_MOCK_RISK_SPECTRUM } from '@/lib/phos/risk-spectrum/mock-spectrum'

export const TERRY_MOCK_SNAPSHOT: PhosSnapshot = {
  subjectName: 'Terry',
  calendarAge: 43,
  photonicAge: 47.2,
  lostLightYears: 4.2,
  nightsCount: 0,
  tier: 'free',
  confidenceScore: 38,
  confidenceLabel: 'Wide',
  confidenceBandMinutes: 150,
  chronotype: 'Late anchor',
  lightWindow: { start: '08:30', end: '15:00' },
  dailyCueType: 'Anchor',
  dailyCueCopy: 'Catch first light, before 08:30.',
  cueTimeline: [
    { time: '08:30', label: 'Anchor', icon: 'anchor', active: true },
    { time: '15:00', label: 'Peak', icon: 'peak' },
    { time: '19:30', label: 'Fuel', icon: 'fuel' },
    { time: '21:30', label: 'Dim', icon: 'dim' },
  ],
  metrics: [
    { label: 'Body clock phase', value: '1.4 h drift', note: 'Phone sleep midpoint' },
    { label: 'Social jet lag', value: '38 min', note: 'Workday vs free-day shift' },
    { label: 'Personal light', value: '0.8 index', note: 'Inferred from activity' },
    { label: 'Confidence band', value: '±150 min', note: 'Wide, Free tier' },
    { label: 'Tier', value: 'Free', note: 'Health app connected' },
    { label: 'Observations', value: '90 days', note: 'Sleep history synced' },
  ],
  nights: [],
  riskSpectrum: TERRY_MOCK_RISK_SPECTRUM,
  isSample: true,
  hasPhoneData: false,
  canUpload: false,
  onboardingPath: '/onboarding',
}
