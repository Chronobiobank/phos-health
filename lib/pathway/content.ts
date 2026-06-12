import type { PathwayLane } from '@/lib/pathway/lanes'

export type PathwaySpecialistEntry = {
  name: string
  role: string
  note: string
}

export type PathwayLaneContent = {
  laneLabel: string
  contributionLine: string
  gpIntro: string
  gpTopics: string[]
  specialists: PathwaySpecialistEntry[]
}

export const PATHWAY_LANE_CONTENT: Record<PathwayLane, PathwayLaneContent> = {
  sleep: {
    laneLabel: 'sleep',
    contributionLine:
      'Your circadian misalignment is contributing to your modifiable sleep risk.',
    gpIntro: 'Bring this summary to your GP. You choose what to discuss.',
    gpTopics: [
      'Your social jet lag pattern and sleep midpoint drift from PHOS.',
      'Morning light exposure and a fixed wake time you can try now.',
      'Whether a formal sleep study is appropriate for your symptoms.',
      'How shift work or evening light may be shifting your body clock.',
    ],
    specialists: [
      {
        name: 'NHS sleep medicine clinics',
        role: 'Secondary care sleep service',
        note: 'Access is through your GP. PHOS does not arrange referrals.',
      },
      {
        name: 'The Sleep Charity',
        role: 'Sleep health information',
        note: 'Independent guidance on sleep timing and hygiene.',
      },
      {
        name: 'British Sleep Society',
        role: 'Professional sleep medicine body',
        note: 'Public education on sleep disorders and clinic pathways.',
      },
    ],
  },
  metabolic: {
    laneLabel: 'sleep and metabolic',
    contributionLine:
      'Your circadian misalignment is contributing to your modifiable sleep and metabolic risk.',
    gpIntro: 'Bring this summary to your GP. You choose what to discuss.',
    gpTopics: [
      'Your Photonic Panel timing markers and vitamin D result from PHOS.',
      'How light timing may relate to glucose and metabolic markers.',
      'Whether repeat bloods or lifestyle changes are worth discussing.',
      'Morning light and meal timing you can adjust before any prescription.',
    ],
    specialists: [
      {
        name: 'NHS metabolic medicine services',
        role: 'Diabetes and metabolic clinics',
        note: 'Referral through your GP. PHOS does not arrange care.',
      },
      {
        name: 'Society for Endocrinology',
        role: 'Patient information',
        note: 'Independent resources on hormones, glucose, and timing.',
      },
      {
        name: 'British Sleep Society',
        role: 'Sleep and metabolism overlap',
        note: 'Sleep timing links to metabolic health in published cohorts.',
      },
    ],
  },
  cardiometabolic: {
    laneLabel: 'cardiometabolic',
    contributionLine:
      'Your circadian misalignment is contributing to your modifiable cardiometabolic risk.',
    gpIntro: 'Bring this summary to your GP. You choose what to discuss.',
    gpTopics: [
      'Your three night sleep study timing and breathing pattern summary from PHOS.',
      'How body clock phase may relate to blood pressure and heart rhythm.',
      'Whether cardiology or sleep follow up is appropriate for your symptoms.',
      'Light and sleep changes you can try while waiting for NHS appointments.',
    ],
    specialists: [
      {
        name: 'NHS cardiology and sleep services',
        role: 'Cardiometabolic and sleep clinics',
        note: 'Access through your GP. PHOS does not arrange referrals.',
      },
      {
        name: 'British Heart Foundation',
        role: 'Heart health information',
        note: 'Independent guidance on symptoms and when to seek help.',
      },
      {
        name: 'British Sleep Society',
        role: 'Sleep medicine directory',
        note: 'Sleep and cardiometabolic overlap in published research.',
      },
    ],
  },
}

export function buildGpSummaryText(lane: PathwayLane, generatedAt: Date): string {
  const content = PATHWAY_LANE_CONTENT[lane]
  const dateLine = generatedAt.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const lines = [
    'PHOS GP conversation summary',
    `Prepared for you on ${dateLine}`,
    '',
    'This is information you may choose to share, not a clinical verdict.',
    '',
    content.contributionLine,
    '',
    'Topics you may want to discuss:',
    ...content.gpTopics.map((topic) => `  • ${topic}`),
    '',
    'PHOS prepares the conversation. Your GP makes the clinical call.',
    '',
    'If you have urgent symptoms, contact your GP, call NHS 111, or in an emergency call 999.',
  ]

  return lines.join('\n')
}
