'use client'

import { useCallback } from 'react'

import { buildGpSummaryText } from '@/lib/pathway/content'
import type { PathwayLane } from '@/lib/pathway/lanes'

type PathwayGpSummaryProps = {
  lane: PathwayLane
}

export function PathwayGpSummary({ lane }: PathwayGpSummaryProps) {
  const downloadSummary = useCallback(() => {
    const text = buildGpSummaryText(lane, new Date())
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'phos-gp-conversation-summary.txt'
    anchor.click()
    URL.revokeObjectURL(url)
  }, [lane])

  return (
    <div className="pathway-gp-summary">
      <button type="button" className="btn btn--primary" onClick={downloadSummary}>
        Download GP summary →
      </button>
      <p className="support pathway-gp-summary__note">
        Plain language only. No clinical verdict and no risk percentage.
      </p>
    </div>
  )
}
