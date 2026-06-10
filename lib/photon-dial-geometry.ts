export const PHOTON_DIAL = {
  width: 168,
  height: 96,
  cx: 84,
  cy: 78,
  r: 60,
  innerR: 50,
} as const

export function photonSemicirclePath(
  cx: number,
  cy: number,
  r: number,
  close = false,
): string {
  const path = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`
  return close ? `${path} L ${cx} ${cy} Z` : path
}

export function photonDialAngle(ratio: number): number {
  return Math.PI * (1 - ratio)
}

export function photonDialPoint(
  cx: number,
  cy: number,
  r: number,
  ratio: number,
): { x: number; y: number } {
  const angle = photonDialAngle(ratio)
  return {
    x: cx + r * Math.cos(angle),
    y: cy - r * Math.sin(angle),
  }
}
