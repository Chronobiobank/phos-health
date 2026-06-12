import { labelLinesForNode, RISK_SPECTRUM_LABELS } from '@/lib/phos/risk-spectrum/labels'
import { UK_BIOBANK_COHORT } from '@/lib/phos/risk-spectrum/uk-biobank'
import {
  scoreForSeverity,
  severityFromMeanAhi,
} from '@/lib/phos/risk-spectrum/indicators'
import type {
  BuildPhotonicRiskSpectrumInput,
  SpectrumNode,
  SpectrumSeverity,
} from '@/lib/phos/risk-spectrum/types'

function apnoeaReason(
  severity: SpectrumSeverity,
  meanAhi: number | null,
  nights: number,
  hasTipTraq: boolean,
  highSympathetic: boolean,
): string {
  if (!hasTipTraq) return 'No TipTraQ nights yet. Sleep apnoea cannot be scored.'
  if (meanAhi == null) return 'TipTraQ breathing data is still aggregating across your nights.'

  const span = nights >= 5 ? 'Five-night' : nights === 1 ? 'Latest' : `${nights}-night`
  const sns =
    highSympathetic && severity !== 'weak'
      ? ' High overnight sympathetic load adds body clock drag alongside breathing disruption.'
      : ''

  switch (severity) {
    case 'weak':
      return `${span} mean AHI ${meanAhi}. Below clinical sleep apnoea threshold.${sns}`
    case 'mild':
      return `${span} mean AHI ${meanAhi}. Mild obstructive sleep apnoea band.${sns}`
    case 'moderate':
      return `${span} mean AHI ${meanAhi}. Moderate sleep apnoea band.${sns}`
    case 'severe':
      return `${span} mean AHI ${meanAhi}. Severe sleep apnoea band.${sns}`
  }
}

/**
 * Seven-node light-dark risk spectrum (DIOS ChronosomaticSpectrum lineage).
 * Severity uses TipTraQ, lost light years, and chronotype proxies aligned to UK Biobank findings.
 */
export function buildPhotonicRiskSpectrum(input: BuildPhotonicRiskSpectrumInput): SpectrumNode[] {
  const nights = input.tipTraqNightsCount ?? (input.hasTipTraq ? 1 : 0)
  const meanAhi = input.meanAhi ?? null
  const drift = input.lostLightYears

  const sleepRhythmSeverity: SpectrumSeverity =
    drift >= 1.2 || input.chronotypeEvening ? 'mild' : drift >= 0.5 ? 'weak' : 'weak'

  const sleepApnoeaSeverity = severityFromMeanAhi(meanAhi, input.hasTipTraq)

  const bloodSugarSeverity: SpectrumSeverity =
    input.chronotypeEvening && drift >= 1.2
      ? 'moderate'
      : input.chronotypeEvening || drift >= 1.2
        ? 'mild'
        : 'weak'

  const bloodPressureSeverity: SpectrumSeverity =
    input.latestNight?.non_dipper_flag
      ? 'moderate'
      : drift >= 1.2
        ? 'mild'
        : 'weak'

  const immuneSeverity: SpectrumSeverity =
    input.hasBloodPanel && input.vitaminDLow ? 'mild' : input.hasTipTraq && drift >= 1.2 ? 'mild' : 'weak'

  const brainSeverity: SpectrumSeverity =
    input.latestNight?.rem_delay_flag || drift >= 1.2 ? 'mild' : 'weak'

  const cancerSeverity: SpectrumSeverity =
    input.lightAlignmentScore >= 70 ? 'weak' : drift >= 1.2 ? 'moderate' : 'mild'

  const nodes: Omit<SpectrumNode, 'score'>[] = [
    {
      id: 'sleep-rhythm',
      label: RISK_SPECTRUM_LABELS['sleep-rhythm'].full,
      labelLines: labelLinesForNode('sleep-rhythm'),
      severity: sleepRhythmSeverity,
      reason:
        sleepRhythmSeverity === 'weak'
          ? 'Body clock timing is close to your light window on available nights.'
          : `${drift.toFixed(1)} lost light years and ${input.chronotypeEvening ? 'evening timing' : 'rhythm drift'} match early Biobank misalignment signals.`,
      action:
        sleepRhythmSeverity === 'weak'
          ? 'Keep morning light steady to hold this pattern.'
          : 'Shift evening light earlier and protect your morning anchor window.',
    },
    {
      id: 'sleep-apnoea',
      label: RISK_SPECTRUM_LABELS['sleep-apnoea'].full,
      labelLines: labelLinesForNode('sleep-apnoea'),
      severity: sleepApnoeaSeverity,
      reason: apnoeaReason(
        sleepApnoeaSeverity,
        meanAhi,
        nights,
        input.hasTipTraq,
        Boolean(input.latestNight?.high_sympathetic_flag),
      ),
      action:
        sleepApnoeaSeverity === 'severe' || sleepApnoeaSeverity === 'moderate'
          ? 'Ask your GP about formal sleep apnoea treatment.'
          : sleepApnoeaSeverity === 'mild'
            ? 'Discuss mild sleep apnoea with your clinician on the next TipTraQ block.'
            : 'Keep monitoring overnight breathing on TipTraQ nights.',
    },
    {
      id: 'immune-system',
      label: RISK_SPECTRUM_LABELS['immune-system'].full,
      labelLines: labelLinesForNode('immune-system'),
      severity: immuneSeverity,
      reason:
        input.hasBloodPanel && input.vitaminDLow
          ? 'Serum vitamin D is low on your panel. Personal light and D status drive immune clock signalling.'
          : input.hasTipTraq
            ? 'Morning personal light supports vitamin D and immune timing. UK Biobank links weak day-night contrast to metabolic strain.'
            : 'Add a blood panel to confirm vitamin D and immune precision.',
      action:
        immuneSeverity === 'mild'
          ? 'Discuss vitamin D with your GP and increase morning daylight.'
          : 'Retest bloods on schedule to keep immune precision confirmed.',
    },
    {
      id: 'blood-sugar',
      label: RISK_SPECTRUM_LABELS['blood-sugar'].full,
      labelLines: labelLinesForNode('blood-sugar'),
      severity: bloodSugarSeverity,
      reason:
        bloodSugarSeverity === 'moderate'
          ? UK_BIOBANK_COHORT.lancetT2dm
          : bloodSugarSeverity === 'mild'
            ? UK_BIOBANK_COHORT.eveningChronotype
            : 'Glucose timing risk stays lower while light-dark alignment holds.',
      action:
        bloodSugarSeverity !== 'weak'
          ? 'Take metformin with breakfast and protect morning light when prescribed.'
          : 'Keep meals inside your light time windows.',
    },
    {
      id: 'blood-pressure',
      label: RISK_SPECTRUM_LABELS['blood-pressure'].full,
      labelLines: labelLinesForNode('blood-pressure'),
      severity: bloodPressureSeverity,
      reason:
        bloodPressureSeverity === 'moderate'
          ? input.latestNight?.non_dipper_flag
            ? 'TipTraQ shows a non-dipping overnight pattern. UK Biobank light rhythm tracks cardiovascular load.'
            : UK_BIOBANK_COHORT.lightRhythm
          : bloodPressureSeverity === 'mild'
            ? 'Rhythm drift is nudging nocturnal blood pressure timing out of phase.'
            : 'No non-dipping pattern flagged on your latest overnight read.',
      action:
        bloodPressureSeverity !== 'weak'
          ? 'Discuss blood pressure medicine timing with your clinician.'
          : 'Maintain evening wind-down to support overnight dipping.',
    },
    {
      id: 'brain-health',
      label: RISK_SPECTRUM_LABELS['brain-health'].full,
      labelLines: labelLinesForNode('brain-health'),
      severity: brainSeverity,
      reason:
        brainSeverity === 'mild'
          ? 'Delayed phase and REM timing reduce overnight brain clearance windows.'
          : 'Sleep architecture supports brain clearance on your latest tracked nights.',
      action:
        brainSeverity === 'mild'
          ? 'Protect deep sleep with earlier dim light and a fixed wake time.'
          : 'Keep sleep regularity to maintain brain health precision.',
    },
    {
      id: 'cancer-risk',
      label: RISK_SPECTRUM_LABELS['cancer-risk'].full,
      labelLines: labelLinesForNode('cancer-risk'),
      severity: cancerSeverity,
      reason:
        cancerSeverity === 'moderate'
          ? `${UK_BIOBANK_COHORT.pnasMortality} Sustained light-dark disruption raises long-horizon risk.`
          : cancerSeverity === 'mild'
            ? 'Light alignment is below target on available data. Keep day-night contrast strong.'
            : 'Light-dark alignment sits in a protective range for DNA repair timing.',
      action:
        cancerSeverity !== 'weak'
          ? 'Increase morning light and reduce late evening exposure.'
          : 'Maintain consistent light-dark cycles across the week.',
    },
  ]

  return nodes.map((node) => ({
    ...node,
    score: scoreForSeverity(node.severity),
  }))
}
