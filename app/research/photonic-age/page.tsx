import type { Metadata } from 'next'
import Link from 'next/link'

import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import { PhotonicAgeTile } from '@/components/PhotonicAgeTile'

export const metadata: Metadata = {
  title: 'Photonic Age · White Paper · PHOS',
  description:
    'The methodology for measuring Lost Light Years and the hidden cost of circadian misalignment.',
}


export default function PhotonicAgePaper() {
  return (
    <main data-nav-theme="light">
      <Nav />

      {/* ── Paper header ── */}
      <section style={{ paddingTop: 'clamp(120px, 16vh, 180px)', paddingBottom: '48px' }}>
        <div className="container">
          <p className="label">White paper · June 2026</p>

          <h1 className="paper-title" style={{ marginTop: '20px', maxWidth: '34ch' }}>
            Photonic Age: A Methodology for Measuring Lost Light Years and the Hidden Cost of
            Circadian Misalignment
          </h1>

          <p className="byline" style={{ marginTop: '22px' }}>
            <strong>Grant Munro</strong> · NIHI Fellow, University of Auckland
            <br />
            The Circadian Foundation · Auckland, New Zealand
          </p>

          <div style={{ marginTop: '36px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link href="#abstract" className="btn btn--primary">
              Read the methodology →
            </Link>
            <Link href="/" className="btn btn--outline">
              ← Back to PHOS
            </Link>
          </div>
        </div>
      </section>

      <hr style={{ border: 'none', borderTop: '1px solid var(--rule)', margin: 0 }} />

      {/* ── Abstract ── */}
      <section id="abstract" style={{ paddingTop: '64px', paddingBottom: '64px', scrollMarginTop: 'var(--nav-height)' }}>
        <div className="container">
          <p className="section-number">Abstract</p>
          <div className="callout" style={{ marginTop: '16px' }}>
            <p>
              Photonic Age quantifies an individual&apos;s accumulated deficit of
              circadian-aligned light exposure as an age offset from chronological age. The gap
              between the two is their Lost Light Years. This paper presents the three-domain
              methodology, its foundations in published chronobiology and epidemiology, a worked
              clinical example, and the commercial translation of Lost Light Years into
              organisational revenue impact.
            </p>
          </div>
        </div>
      </section>

      {/* ── 01 · Method ── */}
      <section style={{ background: 'var(--cosmos)', paddingTop: '64px', paddingBottom: '64px' }}>
        <div className="container">
          <p className="section-number">01</p>
          <h2 className="section-title">Three domains</h2>

          <div className="domain-block">
            <div className="domain-header">
              <span className="domain-name">Domain A · Circadian phase alignment</span>
            </div>
            <div className="domain-row">
              <span className="domain-key">Measures</span>
              <span className="domain-val">
                How closely sleep timing tracks the body&apos;s internal clock, anchored to DLMO
                estimates.
              </span>
            </div>
            <div className="domain-row">
              <span className="domain-key">Source</span>
              <span className="domain-val">TipTraQ sleep architecture, three to seven nights.</span>
            </div>
          </div>

          <div className="domain-block">
            <div className="domain-header">
              <span className="domain-name">Domain B · Social jet lag</span>
            </div>
            <div className="domain-row">
              <span className="domain-key">Measures</span>
              <span className="domain-val">
                The shift between workday and free-day sleep timing: the body living in two time
                zones at once.
              </span>
            </div>
            <div className="domain-row">
              <span className="domain-key">Source</span>
              <span className="domain-val">Sleep midpoint variance across the study window.</span>
            </div>
          </div>

          <div className="domain-block">
            <div className="domain-header">
              <span className="domain-name">Domain C · Personal light exposure</span>
            </div>
            <div className="domain-row">
              <span className="domain-key">Measures</span>
              <span className="domain-val">
                Daily bright-light dose and true-dark duration against circadian need.
              </span>
            </div>
            <div className="domain-row">
              <span className="domain-key">Source</span>
              <span className="domain-val">Light Time and Dark Time, logged and modelled.</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 02 · Worked example ── */}
      <section className="worked-example-section">
        <div className="container">
          <p className="section-number">02</p>
          <h2 className="section-title">Worked example</h2>

          <PhotonicAgeTile ctaHref="/shop" ctaLabel="Tighten your band →" />
        </div>
      </section>

      {/* ── 03 · Commercial translation ── */}
      <section style={{ background: 'var(--cosmos)', paddingTop: '64px', paddingBottom: '64px' }}>
        <div className="container">
          <p className="section-number">03</p>
          <h2 className="section-title">Commercial translation</h2>

          <p className="lede">
            Each Lost Light Year costs an estimated 15 percent of sustained cognitive performance.
          </p>

          <div className="formula-box">
            <div className="formula-label">Corporate cost formula</div>
            <div className="formula-content">
              <p className="formula-line formula-line--primary">
                Annual cost per person&nbsp;&nbsp;=&nbsp;&nbsp;Lost Light
                Years&nbsp;&nbsp;×&nbsp;&nbsp;Annual salary&nbsp;&nbsp;×&nbsp;&nbsp;0.15
              </p>
              <p className="formula-line formula-line--secondary">
                Source: Hafner et al. (2016) · RAND Europe · Why Sleep Matters
              </p>
            </div>
          </div>

          <p className="support" style={{ marginTop: '28px' }}>
            The full derivation, sensitivity analysis, and references are in the paper.
          </p>

          <div style={{ marginTop: '32px' }}>
            <Link href="/for-firms" className="btn btn--primary">
              Model your firm →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
