import { buildPhotonicRiskSpectrum } from '@/lib/phos/risk-spectrum/build-nodes'

/** Sample spectrum for unsigned / mock dashboard states. */
export const TERRY_MOCK_RISK_SPECTRUM = buildPhotonicRiskSpectrum({
  lostLightYears: 4.2,
  lightAlignmentScore: 42,
  chronotypeEvening: true,
  hasTipTraq: false,
  tipTraqNightsCount: 0,
  meanAhi: null,
  latestNight: null,
  hasBloodPanel: false,
  vitaminDLow: false,
})
