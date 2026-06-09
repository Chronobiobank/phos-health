'use client'

import { useEffect } from 'react'
import Link from 'next/link'

import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import { PhotonicAgeScroll } from '@/components/PhotonicAgeScroll'
import { CostCalculator } from '@/components/CostCalculator'

export default function Home() {
  useEffect(() => {
    const elements = document.querySelectorAll('.fade-in')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1 },
    )
    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <main>
      <Nav />

      {/* ── Hero ── */}
      <section className="fade-in hero snap-section">
        <video
          className="hero__video"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
        >
          <source src="/hero/first-light.mp4" type="video/mp4" />
        </video>
        <div className="hero__veil" aria-hidden="true" />
        <div className="container hero__content">
          <p className="label">Photonic OS</p>

          <h1 className="display-xl" style={{ marginTop: '28px' }}>
            Reclaim
            <br />
            <span className="text-spectrum" style={{ whiteSpace: 'nowrap' }}>
              Lost&nbsp;Time
            </span>
          </h1>

          <p className="display-sm" style={{ marginTop: '24px', maxWidth: '520px' }}>
            Light deprivation is costing you years. PHOS measures exactly how many, and shows you
            how to reclaim them.
          </p>

          <div style={{ marginTop: '40px' }}>
            <Link href="/research/photonic-age" className="btn btn--primary">
              Read the methodology →
            </Link>
          </div>
        </div>
      </section>

      <hr style={{ border: 'none', borderTop: '1px solid var(--rule)', margin: 0 }} />

      {/* ── 01 · The Biology ── */}
      <section className="fade-in snap-section" style={{ paddingTop: 'clamp(48px, 8vh, 80px)', paddingBottom: 'clamp(40px, 6vh, 64px)' }}>
        <div className="container">
          <p className="section-number">01</p>
          <h2 className="section-title">Three facts your organisation has not been told</h2>

          <div style={{ padding: '32px 0', borderBottom: '1px solid var(--rule)' }}>
            <p className="label">01</p>
            <h3 className="display-md" style={{ marginTop: '10px' }}>
              Every cell in your organisation runs on light.
            </h3>
            <div className="prose" style={{ marginTop: '16px' }}>
              <p>
                20,000 neurons in the hypothalamus time every process in the body by morning
                light. Cortisol, melatonin, insulin, immunity: all of it runs on the schedule
                light sets.
              </p>
            </div>
          </div>

          <div style={{ padding: '32px 0', borderBottom: '1px solid var(--rule)' }}>
            <p className="label">02</p>
            <h3 className="display-md" style={{ marginTop: '10px' }}>
              Modern life broke the signal.
            </h3>
            <div className="prose" style={{ marginTop: '16px' }}>
              <p>
                Bright screens at night, dim days indoors, irregular schedules. The body runs on
                the wrong time: chronically, silently.
              </p>
            </div>
          </div>

          <div style={{ padding: '32px 0' }}>
            <p className="label">03</p>
            <h3 className="display-md" style={{ marginTop: '10px' }}>
              Hibernation is what follows.
            </h3>
            <div className="prose" style={{ marginTop: '16px' }}>
              <p>
                A suppressed signal turns every system down a gear: cognition, immunity,
                metabolism. This is what misalignment does to your workforce, every working day.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 02 · Photonic Age ── */}
      <section className="snap-section" style={{ background: 'var(--cosmos)' }}>
        <div className="fade-in container" style={{ paddingTop: 'clamp(48px, 8vh, 80px)' }}>
          <p className="section-number">02</p>
          <h2 className="section-title">Photonic Age</h2>

          <p className="lede">
            Your age, measured in light. The gap from your calendar age is your Lost Light Years.
          </p>
        </div>

        <PhotonicAgeScroll />

        <div className="fade-in container" style={{ paddingBottom: 'clamp(48px, 8vh, 80px)' }}>
          <div className="prose">
            <p>
              Measured across three domains with TipTraQ, at home, in three nights. No blood
              tests. No clinic.
            </p>
          </div>
        </div>
      </section>

      {/* ── 03 · The Commercial Case ── */}
      <section className="fade-in snap-section" style={{ paddingTop: 'clamp(48px, 8vh, 80px)', paddingBottom: 'clamp(48px, 8vh, 80px)' }}>
        <div className="container">
          <p className="section-number">03</p>
          <h2 className="section-title">What Lost Light Years costs your firm</h2>

          <p className="lede">
            Lost Light Years are a commercial metric. Each one costs an estimated 15 percent of
            sustained cognitive performance.
          </p>

          <div className="formula-box">
            <div className="formula-label">Corporate cost formula</div>
            <div className="formula-content">
              <p className="formula-line formula-line--primary">
                Annual cost per person&nbsp;&nbsp;=&nbsp;&nbsp;Lost Light Years&nbsp;&nbsp;×&nbsp;&nbsp;Annual
                salary&nbsp;&nbsp;×&nbsp;&nbsp;0.15
              </p>
              <p className="formula-line formula-line--secondary">
                Source: Hafner et al. (2016) · RAND Europe · Why Sleep Matters
              </p>
            </div>
          </div>

          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Organisation</td>
                  <td>Top-tier London law firm</td>
                </tr>
                <tr>
                  <td>Senior professionals</td>
                  <td>150 fee earners</td>
                </tr>
                <tr>
                  <td>Average annual salary</td>
                  <td>£120,000</td>
                </tr>
                <tr>
                  <td>Average Lost Light Years</td>
                  <td>3.8 years</td>
                </tr>
                <tr>
                  <td>Productivity coefficient</td>
                  <td>15%</td>
                </tr>
                <tr className="highlight">
                  <td>Annual revenue impact</td>
                  <td>£2.7 million</td>
                </tr>
              </tbody>
            </table>
          </div>

          <CostCalculator />

          <div className="prose" style={{ marginTop: '32px' }}>
            <p>
              This is conservative. It excludes healthcare costs, attrition, and the compounding
              cost of impaired decisions.
            </p>
          </div>
        </div>
      </section>

      {/* ── 04 · White Paper ── */}
      <section
        className="fade-in snap-section"
        style={{ background: 'var(--cosmos)', paddingTop: 'clamp(48px, 8vh, 80px)', paddingBottom: 'clamp(48px, 8vh, 80px)' }}
      >
        <div className="container">
          <p className="section-number">04</p>
          <h2 className="section-title">The methodology, published</h2>

          <div className="callout">
            <p className="paper-title">
              Photonic Age: A Methodology for Measuring Lost Light Years and the Hidden Cost of
              Circadian Misalignment
            </p>
            <p style={{ marginTop: '18px' }}>
              The full methodology: scientific foundations, a worked clinical example, and the
              commercial translation into revenue impact.
            </p>
            <p className="byline" style={{ marginTop: '22px' }}>
              <strong>Grant Munro</strong> · NIHI Fellow, University of Auckland
              <br />
              The Circadian Foundation · Auckland, New Zealand · June 2026
            </p>
          </div>

          <div style={{ marginTop: '32px' }}>
            <Link href="/research/photonic-age" className="btn btn--primary">
              Read the white paper →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
