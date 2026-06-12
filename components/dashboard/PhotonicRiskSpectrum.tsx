'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

import {
  dotStyleForSeverity,
  isElevatedSeverity,
  SPECTRUM_SEVERITY_LABELS,
  spectrumDotWrapStyle,
} from '@/lib/phos/risk-spectrum/indicators'
import type { SpectrumNode, SpectrumNodeId } from '@/lib/phos/risk-spectrum/types'

type PhotonicRiskSpectrumProps = {
  nodes: SpectrumNode[]
}

function SpectrumDot({
  node,
  isOpen,
  onSelect,
}: {
  node: SpectrumNode
  isOpen: boolean
  onSelect: () => void
}) {
  const style = dotStyleForSeverity(node.severity)
  const isSevere = node.severity === 'severe'

  return (
    <button
      type="button"
      onClick={onSelect}
      className="photonic-risk-spectrum__dot-btn"
      aria-expanded={isOpen}
      aria-label={`${node.label}, ${node.severity}`}
    >
      <span className="photonic-risk-spectrum__dot-wrap" style={spectrumDotWrapStyle(style.size)}>
        {isSevere ? (
          <>
            <motion.span
              className="photonic-risk-spectrum__pulse-ring"
              style={{ borderColor: style.border }}
              animate={{ scale: [0.75, 1.75], opacity: [0.85, 0] }}
              transition={{ duration: 2.2, ease: 'easeOut', repeat: Infinity }}
              aria-hidden
            />
            <motion.span
              className="photonic-risk-spectrum__pulse-ring"
              style={{ borderColor: style.border }}
              animate={{ scale: [0.75, 1.75], opacity: [0.85, 0] }}
              transition={{ duration: 2.2, ease: 'easeOut', repeat: Infinity, delay: 0.8 }}
              aria-hidden
            />
          </>
        ) : null}
        <span
          className={`photonic-risk-spectrum__dot${isOpen ? ' photonic-risk-spectrum__dot--open' : ''}`}
          style={{
            ...spectrumDotWrapStyle(style.size),
            backgroundColor: style.fill,
            borderColor: style.border,
            borderWidth: style.borderWidth,
          }}
        />
      </span>
    </button>
  )
}

export function PhotonicRiskSpectrum({ nodes }: PhotonicRiskSpectrumProps) {
  const [openNodeId, setOpenNodeId] = useState<SpectrumNodeId | null>(null)
  const openNode = nodes.find((node) => node.id === openNodeId) ?? null

  const toggleNode = (id: SpectrumNodeId) => {
    setOpenNodeId((current) => (current === id ? null : id))
  }

  return (
    <div className="photonic-risk-spectrum">
      <div className="photonic-risk-spectrum__axis">
        <span>Mild acute drift</span>
        <span>Chronic disease risk</span>
      </div>

      <div className="photonic-risk-spectrum__columns">
        <div className="photonic-risk-spectrum__track" aria-hidden />
        {nodes.map((node) => (
          <div key={node.id} className="photonic-risk-spectrum__column">
            <div className="photonic-risk-spectrum__dot-cell">
              <SpectrumDot node={node} isOpen={openNodeId === node.id} onSelect={() => toggleNode(node.id)} />
            </div>
            <button
              type="button"
              onClick={() => toggleNode(node.id)}
              className={`photonic-risk-spectrum__label-btn${
                isElevatedSeverity(node.severity) ? ' photonic-risk-spectrum__label-btn--concern' : ''
              }`}
            >
              <span className="photonic-risk-spectrum__label-stack">
                <span className="photonic-risk-spectrum__label-line photonic-risk-spectrum__label-line--primary">
                  {node.labelLines[0]}
                </span>
                <span className="photonic-risk-spectrum__label-line photonic-risk-spectrum__label-line--secondary">
                  {node.labelLines[1]}
                </span>
              </span>
            </button>
          </div>
        ))}
      </div>

      <div className="photonic-risk-spectrum__legend" role="list" aria-label="Risk severity key">
        {SPECTRUM_SEVERITY_LABELS.map(({ severity, label }) => {
          const style = dotStyleForSeverity(severity)
          return (
            <span key={severity} className="photonic-risk-spectrum__legend-item">
              <span className="photonic-risk-spectrum__legend-dot-wrap">
                <span
                  className="photonic-risk-spectrum__legend-dot"
                  style={{
                    backgroundColor: style.fill,
                    borderColor: style.border,
                    borderWidth: style.borderWidth,
                  }}
                />
              </span>
              <span>{label}</span>
            </span>
          )
        })}
      </div>

      {openNode ? (
        <article className="photonic-risk-spectrum__detail dash-card">
          <p className="dash-card__label">{openNode.label}</p>
          <p className="dash-card__copy">{openNode.reason}</p>
          <p className="dash-card__copy photonic-risk-spectrum__action">{openNode.action}</p>
        </article>
      ) : null}
    </div>
  )
}
