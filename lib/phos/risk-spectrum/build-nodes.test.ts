import { describe, expect, it } from 'vitest'

import { buildPhotonicRiskSpectrum } from '@/lib/phos/risk-spectrum/build-nodes'
import { UK_BIOBANK_COHORT } from '@/lib/phos/risk-spectrum/uk-biobank'

describe('buildPhotonicRiskSpectrum', () => {
  it('returns seven nodes from fatigue to cancer risk', () => {
    const nodes = buildPhotonicRiskSpectrum({
      lostLightYears: 4.2,
      lightAlignmentScore: 40,
      chronotypeEvening: true,
      hasTipTraq: true,
      tipTraqNightsCount: 3,
      meanAhi: 3,
      latestNight: {
        ahi: 3,
        non_dipper_flag: false,
        rem_delay_flag: true,
        high_sympathetic_flag: false,
      },
      hasBloodPanel: false,
      vitaminDLow: false,
    })

    expect(nodes).toHaveLength(7)
    expect(nodes.map((node) => node.id)).toEqual([
      'sleep-rhythm',
      'sleep-apnoea',
      'immune-system',
      'blood-sugar',
      'blood-pressure',
      'brain-health',
      'cancer-risk',
    ])
    expect(nodes[0].label).toBe('Fatigue and jet lag')
    expect(nodes[0].labelLines).toEqual(['Fatigue', 'jet lag'])
    expect(nodes[1].labelLines).toEqual(['Snoring', 'apnoea'])
    expect(nodes[3].label).toBe('Diabetes risk')
    expect(nodes[3].labelLines).toEqual(['Glucose', 'insulin'])
  })

  it('cites UK Biobank in diabetes node when elevated', () => {
    const nodes = buildPhotonicRiskSpectrum({
      lostLightYears: 1.5,
      lightAlignmentScore: 50,
      chronotypeEvening: true,
      hasTipTraq: true,
      tipTraqNightsCount: 3,
      meanAhi: 2,
      latestNight: null,
      hasBloodPanel: false,
      vitaminDLow: false,
    })

    const diabetes = nodes.find((node) => node.id === 'blood-sugar')
    expect(diabetes?.severity).not.toBe('weak')
    expect(diabetes?.reason).toContain('UK Biobank')
    expect(UK_BIOBANK_COHORT.lancetT2dm).toContain('type 2 diabetes')
  })

  it('escalates sleep apnoea severity with mean AHI bands', () => {
    const mild = buildPhotonicRiskSpectrum({
      lostLightYears: 0.2,
      lightAlignmentScore: 90,
      chronotypeEvening: false,
      hasTipTraq: true,
      tipTraqNightsCount: 3,
      meanAhi: 8,
      latestNight: { ahi: 8, non_dipper_flag: false, rem_delay_flag: false, high_sympathetic_flag: false },
      hasBloodPanel: false,
      vitaminDLow: false,
    }).find((node) => node.id === 'sleep-apnoea')

    const severe = buildPhotonicRiskSpectrum({
      lostLightYears: 0.2,
      lightAlignmentScore: 90,
      chronotypeEvening: false,
      hasTipTraq: true,
      tipTraqNightsCount: 3,
      meanAhi: 32,
      latestNight: { ahi: 32, non_dipper_flag: true, rem_delay_flag: true, high_sympathetic_flag: true },
      hasBloodPanel: false,
      vitaminDLow: false,
    }).find((node) => node.id === 'sleep-apnoea')

    expect(mild?.severity).toBe('mild')
    expect(severe?.severity).toBe('severe')
  })
})
