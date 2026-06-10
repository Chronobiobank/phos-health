import { useId } from 'react'

import {
  PHOTON_DIAL,
  photonDialPoint,
  photonSemicirclePath,
} from '@/lib/photon-dial-geometry'

type DayWindowArcProps = {
  startMinutes: number
  endMinutes: number
  dayStart?: number
  dayEnd?: number
}

export function DayWindowArc({
  startMinutes,
  endMinutes,
  dayStart = 6 * 60,
  dayEnd = 20 * 60,
}: DayWindowArcProps) {
  const rawId = useId()
  const dialId = rawId.replace(/:/g, '')
  const daySpan = dayEnd - dayStart
  const windowStart = Math.max(startMinutes - dayStart, 0)
  const windowEnd = Math.min(endMinutes - dayStart, daySpan)
  const windowWidth = Math.max(windowEnd - windowStart, 0)
  const startRatio = windowStart / daySpan
  const widthRatio = windowWidth / daySpan
  const endRatio = startRatio + widthRatio

  const { width, height, cx, cy, r, innerR } = PHOTON_DIAL
  const arcPath = photonSemicirclePath(cx, cy, r)
  const innerPath = photonSemicirclePath(cx, cy, innerR)
  const fillPath = photonSemicirclePath(cx, cy, r, true)
  const startPoint = photonDialPoint(cx, cy, r, startRatio)
  const endPoint = photonDialPoint(cx, cy, r, endRatio)
  const windowPercent = widthRatio * 100
  const windowOffset = startRatio * 100

  return (
    <svg
      className="photon-dial__svg photon-dial__svg--day"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${dialId}-window`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--stellar)" />
          <stop offset="100%" stopColor="var(--lilac-medium)" />
        </linearGradient>
        <radialGradient id={`${dialId}-wash`} cx="50%" cy="100%" r="72%">
          <stop offset="0%" stopColor="var(--lilac-light)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--void)" stopOpacity="0" />
        </radialGradient>
      </defs>

      <line
        x1={cx - r - 6}
        y1={cy + 0.5}
        x2={cx + r + 6}
        y2={cy + 0.5}
        className="photon-dial__baseline"
      />

      <path d={fillPath} fill={`url(#${dialId}-wash)`} className="photon-dial__wash" />

      <path d={innerPath} className="photon-dial__inner" />

      <path d={arcPath} pathLength="100" className="photon-dial__track" />

      <path
        d={arcPath}
        pathLength="100"
        className="photon-dial__window"
        stroke={`url(#${dialId}-window)`}
        strokeDasharray={`${windowPercent} 100`}
        strokeDashoffset={-windowOffset}
      />

      <circle cx={startPoint.x} cy={startPoint.y} r={3.5} className="photon-dial__cap photon-dial__cap--start" />
      <circle cx={endPoint.x} cy={endPoint.y} r={3.5} className="photon-dial__cap photon-dial__cap--end" />
    </svg>
  )
}
