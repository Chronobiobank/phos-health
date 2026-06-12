export type PathwayLane = 'sleep' | 'metabolic' | 'cardiometabolic'

export const DEFAULT_PATHWAY_LANE: PathwayLane = 'sleep'

const LANE_SET = new Set<PathwayLane>(['sleep', 'metabolic', 'cardiometabolic'])

export function normalizePathwayLane(value: string | null | undefined): PathwayLane {
  if (value && LANE_SET.has(value as PathwayLane)) {
    return value as PathwayLane
  }
  return DEFAULT_PATHWAY_LANE
}

export function pathwayLaneFromTier(tier: 'free' | 'basic' | 'premium' | string | undefined): PathwayLane {
  if (tier === 'basic') return 'metabolic'
  if (tier === 'premium') return 'cardiometabolic'
  return 'sleep'
}

export function pathwayHref(lane: PathwayLane): string {
  return `/pathway?lane=${lane}`
}
