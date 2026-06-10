import { useId } from 'react'

import {
  PHOTON_DIAL,
  photonDialAngle,
  photonDialPoint,
  photonSemicirclePath,
} from '@/lib/photon-dial-geometry'

type PhotonDepletionArcProps = {
  value: number
  max?: number
}

const TICKS = [0, 5, 10] as const

export function PhotonDepletionArc({ value, max = 10 }: PhotonDepletionArcProps) {
  const rawId = useId()
  const dialId = rawId.replace(/:/g, '')
  const ratio = Math.min(Math.max(value / max, 0), 1)
  const { width, height, cx, cy, r, innerR } = PHOTON_DIAL
  const arcPath = photonSemicirclePath(cx, cy, r)
  const innerPath = photonSemicirclePath(cx, cy, innerR)
  const fillPath = photonSemicirclePath(cx, cy, r, true)
  const boundary = photonDialPoint(cx, cy, r, ratio)
  const lostPercent = ratio * 100
  const remainingPercent = 100 - lostPercent

  return (
    <svg
      className="photon-dial__svg"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`${value} lost light years shown as ${Math.round(ratio * 100)} percent depletion on the photon dial.`}
    >
      <defs>
        <linearGradient id={`${dialId}-lost`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--eggplant-dark)" />
          <stop offset="100%" stopColor="var(--eggplant)" />
        </linearGradient>
        <linearGradient id={`${dialId}-remaining`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--stellar)" />
          <stop offset="100%" stopColor="var(--lilac-medium)" />
        </linearGradient>
        <radialGradient id={`${dialId}-wash`} cx="50%" cy="100%" r="72%">
          <stop offset="0%" stopColor="var(--lilac-light)" stopOpacity="0.34" />
          <stop offset="100%" stopColor="var(--void)" stopOpacity="0" />
        </radialGradient>
      </defs>

      <path d={fillPath} fill={`url(#${dialId}-wash)`} className="photon-dial__wash" />

      <path d={innerPath} className="photon-dial__inner" />

      <path d={arcPath} pathLength="100" className="photon-dial__track" />

      <path
        d={arcPath}
        pathLength="100"
        className="photon-dial__lost"
        stroke={`url(#${dialId}-lost)`}
        strokeDasharray={`${lostPercent} 100`}
      />

      <path
        d={arcPath}
        pathLength="100"
        className="photon-dial__remaining"
        stroke={`url(#${dialId}-remaining)`}
        strokeDasharray={`${remainingPercent} 100`}
        strokeDashoffset={-lostPercent}
      />

      {TICKS.map((tick) => {
        const tickRatio = tick / max
        const angle = photonDialAngle(tickRatio)
        const x1 = cx + (r - 5) * Math.cos(angle)
        const y1 = cy - (r - 5) * Math.sin(angle)
        const x2 = cx + (r + 1) * Math.cos(angle)
        const y2 = cy - (r + 1) * Math.sin(angle)
        const labelPoint = photonDialPoint(cx, cy, r + 13, tickRatio)

        return (
          <g key={tick} className="photon-dial__tick">
            <line x1={x1} y1={y1} x2={x2} y2={y2} />
            <text x={labelPoint.x} y={labelPoint.y + 3} textAnchor="middle">
              {tick}
            </text>
          </g>
        )
      })}

      <circle cx={cx - r} cy={cy} r={3} className="photon-dial__cap photon-dial__cap--start" />
      <circle cx={boundary.x} cy={boundary.y} r={4} className="photon-dial__marker" />
      <circle cx={cx + r} cy={cy} r={3} className="photon-dial__cap photon-dial__cap--end" />
    </svg>
  )
}
