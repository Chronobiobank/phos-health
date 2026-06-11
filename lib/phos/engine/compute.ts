import {
  averageSleepMidpoint,
  averageSteps,
  averageWakeTime,
  socialJetLagMinutes,
} from '@/lib/phos/engine/phone'
import type {
  DomainResult,
  LightTimeCue,
  MemberTier,
  PhoneObservation,
  PhotonicAgeComputation,
  PremiumD1Input,
} from '@/lib/phos/engine/types'
import {
  adjustLightWindowForLocation,
  dailyCueCopyForLightWindow,
} from '@/lib/patient/light-window'
import { approximateEarliestOutdoorLightMinutes } from '@/lib/patient/timezone'

const IDEAL_SLEEP_MIDPOINT_MINUTES = 3 * 60 + 30

function round1(value: number): number {
  return Math.round(value * 10) / 10
}

function confidenceLabel(score: number): string {
  if (score >= 80) return 'High'
  if (score >= 55) return 'Moderate'
  return 'Wide'
}

function addMinutesToTime(time: string, minutes: number): string {
  const [hours, mins] = time.split(':').map(Number)
  const total = hours * 60 + mins + minutes
  const normalized = ((total % 1440) + 1440) % 1440
  return `${String(Math.floor(normalized / 60)).padStart(2, '0')}:${String(normalized % 60).padStart(2, '0')}`
}

function buildLightTimeCue(wakeTime: string | null): LightTimeCue {
  const anchor = wakeTime ? addMinutesToTime(wakeTime, 30) : '08:30'
  const peak = addMinutesToTime(anchor, 390)
  const fuel = addMinutesToTime(anchor, 660)
  const dim = addMinutesToTime(anchor, 780)

  return {
    start: anchor,
    end: peak,
    cueType: 'Anchor',
    cueCopy: `Catch first light, before ${anchor}.`,
    timeline: [
      { time: anchor, label: 'Anchor', icon: 'anchor', active: true },
      { time: peak, label: 'Peak', icon: 'peak' },
      { time: fuel, label: 'Fuel', icon: 'fuel' },
      { time: dim, label: 'Dim', icon: 'dim' },
    ],
  }
}

function winterLightPenalty(latitude: number, timeZone?: string): number {
  const absLat = Math.abs(latitude)
  let penalty = absLat > 55 ? 0.35 : absLat > 50 ? 0.3 : absLat > 45 ? 0.2 : absLat > 35 ? 0.15 : 0.1

  if (timeZone && timeZone !== 'UTC') {
    const sunriseMinutes = approximateEarliestOutdoorLightMinutes(timeZone)
    if (sunriseMinutes >= 7 * 60 + 15) penalty += 0.05
    if (sunriseMinutes >= 7 * 60 + 45) penalty += 0.05
  }

  return penalty
}

function computeFreeDomains(
  observations: PhoneObservation[],
  latitude = 51.5,
  timeZone?: string,
): { domains: DomainResult[]; confidenceScore: number; confidenceBandMinutes: number } {
  const midpoint = averageSleepMidpoint(observations)
  const jetLag = socialJetLagMinutes(observations)
  const steps = averageSteps(observations)

  const phaseDeviationHours =
    midpoint == null ? 1.5 : Math.abs(midpoint - IDEAL_SLEEP_MIDPOINT_MINUTES) / 60
  const d1Contribution = Math.min(2.8, phaseDeviationHours * 0.55)
  const d2Contribution = Math.min(1.8, jetLag / 45)
  const winterPenalty = winterLightPenalty(latitude, timeZone)
  const activityPenalty = steps != null && steps < 6500 ? 0.45 : 0.15
  const d3Contribution = Math.min(1.6, winterPenalty + activityPenalty)

  const observationBonus = Math.min(12, observations.length / 3)
  const confidenceScore = Math.round(Math.min(48, 28 + observationBonus))
  const confidenceBandMinutes = confidenceScore >= 40 ? 120 : 150

  const domains: DomainResult[] = [
    {
      key: 'd1',
      label: 'Body clock phase',
      value: round1(phaseDeviationHours),
      unit: 'h drift',
      source: 'phone_sleep_midpoint',
      confidence: Math.round(confidenceScore * 0.7),
      lostLightYearsContribution: round1(d1Contribution),
    },
    {
      key: 'd2',
      label: 'Social jet lag',
      value: Math.round(jetLag),
      unit: 'min',
      source: 'phone_sleep_timing',
      confidence: Math.round(confidenceScore * 0.85),
      lostLightYearsContribution: round1(d2Contribution),
    },
    {
      key: 'd3',
      label: 'Personal light',
      value: round1(d3Contribution),
      unit: 'index',
      source: 'inferred_light',
      confidence: Math.round(confidenceScore * 0.55),
      lostLightYearsContribution: round1(d3Contribution),
    },
  ]

  return { domains, confidenceScore, confidenceBandMinutes }
}

function computePremiumDomains(
  premium: PremiumD1Input,
  observations: PhoneObservation[],
): { domains: DomainResult[]; confidenceScore: number; confidenceBandMinutes: number } {
  const jetLag = socialJetLagMinutes(observations)
  const phaseMinutes = premium.mluxPhaseMinutes ?? 21 * 60 + 30
  const phaseDeviationHours = Math.abs(phaseMinutes - (21 * 60 + 30)) / 60
  const d1Contribution = Math.min(2.2, phaseDeviationHours * 0.4)
  const d2Contribution = Math.min(1.5, jetLag / 50)

  const confidenceScore = premium.confidenceScore ?? 75
  const confidenceBandMinutes = premium.confidenceBandMinutes ?? 60

  const domains: DomainResult[] = [
    {
      key: 'd1',
      label: 'Body clock phase',
      value: round1(phaseDeviationHours),
      unit: 'h drift',
      source: 'tiptraq_proxy_dlmo',
      confidence: confidenceScore,
      lostLightYearsContribution: round1(d1Contribution),
    },
    {
      key: 'd2',
      label: 'Social jet lag',
      value: Math.round(jetLag),
      unit: 'min',
      source: 'phone_sleep_timing',
      confidence: Math.min(90, confidenceScore + 5),
      lostLightYearsContribution: round1(d2Contribution),
    },
    {
      key: 'd3',
      label: 'Personal light',
      value: 0.4,
      unit: 'index',
      source: 'inferred_light',
      confidence: 45,
      lostLightYearsContribution: 0.4,
    },
  ]

  return { domains, confidenceScore, confidenceBandMinutes }
}

export function computePhotonicAge(input: {
  tier: MemberTier
  calendarAge: number
  observations: PhoneObservation[]
  latitude?: number
  timeZone?: string
  premium?: PremiumD1Input | null
}): PhotonicAgeComputation {
  const { tier, calendarAge, observations, latitude = 51.5, timeZone, premium } = input

  const usePremium = tier === 'premium' && premium?.mluxPhaseMinutes != null
  const { domains, confidenceScore, confidenceBandMinutes } = usePremium
    ? computePremiumDomains(premium!, observations)
    : computeFreeDomains(observations, latitude, timeZone)

  const lostLightYears = round1(
    Math.min(
      14,
      domains.reduce((sum, domain) => sum + domain.lostLightYearsContribution, 0),
    ),
  )
  const photonicAge = round1(calendarAge + lostLightYears)
  const wakeTime = averageWakeTime(observations)
  const lightTime =
    usePremium && premium?.lightWindowStart && premium?.lightWindowEnd
      ? (() => {
          const rawStart = premium.lightWindowStart.slice(0, 5)
          const rawEnd = premium.lightWindowEnd.slice(0, 5)
          const adjusted =
            timeZone && timeZone !== 'UTC'
              ? adjustLightWindowForLocation(rawStart, rawEnd, timeZone)
              : { start: rawStart, end: rawEnd }

          return {
            start: adjusted.start,
            end: adjusted.end,
            cueType: 'Anchor',
            cueCopy: dailyCueCopyForLightWindow(adjusted.start),
            timeline: buildLightTimeCue(adjusted.start).timeline.map((stop, index) => ({
              ...stop,
              active: index === 0,
            })),
          }
        })()
      : buildLightTimeCue(wakeTime)

  return {
    tier: usePremium ? 'premium' : tier,
    calendarAge,
    photonicAge,
    lostLightYears,
    confidenceScore,
    confidenceBandMinutes,
    confidenceLabel: usePremium ? (premium?.confidenceLabel ?? confidenceLabel(confidenceScore)) : confidenceLabel(confidenceScore),
    domains,
    lightTime,
    provenance: {
      observationCount: observations.length,
      latitude,
      timeZone: timeZone ?? null,
      premiumAttached: usePremium,
    },
  }
}
