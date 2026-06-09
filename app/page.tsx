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
            Lost
            <br />
            <span className="text-spectrum">Light</span>
            <br />
            Years
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
      <section className="fade-in snap-section" style={{ paddingTop: '80px', paddingBottom: '64px' }}>
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
                The suprachiasmatic nucleus — 20,000 neurons in the hypothalamus — receives light
                signals from the retina every morning and uses them to time almost every biological
                process in the body. Cortisol. Melatonin. Insulin. Core body temperature. Immune
                activation. All of it runs on the schedule that light sets.
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
                Artificial lighting at night delays circadian phase. Insufficient bright light
                during the day fails to entrain the master clock. Irregular schedules and global
                travel force the body to run on times that bear no relationship to local solar
                time. The result is chronic misalignment: not acute, not dramatic, but persistent
                and silent.
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
                When the circadian signal is suppressed, the body reduces amplitude across every
                downstream system. Cognitive performance. Immune response. Metabolic regulation.
                The organism runs in a lower gear. This is the biology of hibernation. It is not
                metaphor. It is what chronic light misalignment does to your workforce, every
                working day.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 02 · Photonic Age ── */}
      <section className="snap-section" style={{ background: 'var(--cosmos)' }}>
        <div className="fade-in container" style={{ paddingTop: '80px' }}>
          <p className="section-number">02</p>
          <h2 className="section-title">Photonic Age</h2>

          <div className="prose">
            <p>
              Photonic Age is a biographical metric that quantifies an individual&apos;s
              accumulated deficit of circadian-aligned light exposure, expressed as an age offset
              from their chronological age. The gap between the two is their Lost Light Years.
            </p>
          </div>
        </div>

        <PhotonicAgeScroll />

        <div className="fade-in container" style={{ paddingBottom: '80px' }}>
          <div className="prose">
            <p>
              PHOS calculates Photonic Age from three domains: circadian phase alignment, social
              jet lag, and personal light exposure. The primary measurement instrument is TipTraQ,
              a three-to-seven-night home sleep study device. No blood tests. No clinical
              appointment. Three nights at home.
            </p>
          </div>
        </div>
      </section>

      {/* ── 03 · The Commercial Case ── */}
      <section className="fade-in snap-section" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
        <div className="container">
          <p className="section-number">03</p>
          <h2 className="section-title">What Lost Light Years costs your firm</h2>

          <div className="prose">
            <p>
              Lost Light Years are not merely a biological metric. They are a commercial one.
              Using Hafner et al. (2016) productivity data published by RAND Europe, each Lost
              Light Year corresponds to an estimated 15 to 20 percent reduction in sustained
              cognitive performance on executive function tasks.
            </p>
          </div>

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
              This estimate is conservative. It excludes healthcare costs, talent attrition, and
              the compounding effect of cognitive impairment on high-stakes decision-making. The
              full commercial case for circadian health intervention at organisational scale is
              substantially larger than the direct productivity figure alone.
            </p>
          </div>
        </div>
      </section>

      {/* ── 04 · White Paper ── */}
      <section
        className="fade-in snap-section"
        style={{ background: 'var(--cosmos)', paddingTop: '80px', paddingBottom: '80px' }}
      >
        <div className="container">
          <p className="section-number">04</p>
          <h2 className="section-title">The methodology, published</h2>

          <div className="callout">
            <p className="display-sm" style={{ fontStyle: 'italic', marginBottom: '16px' }}>
              Photonic Age: A Methodology for Measuring Lost Light Years and the Hidden Cost of
              Circadian Misalignment
            </p>
            <div className="prose">
              <p>
                This paper presents the three-domain methodology underpinning Photonic Age, its
                scientific foundations in published chronobiology and epidemiology, a worked
                clinical example, and the commercial translation of Lost Light Years into
                organisational revenue impact.
              </p>
            </div>
            <p className="label" style={{ marginTop: '20px' }}>
              Grant Munro · NIHI Fellow, University of Auckland · The Circadian Foundation ·
              Auckland, New Zealand · June 2026
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
