'use client'

import { useEffect } from 'react'
import Link from 'next/link'

import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import { PhotonicAgeTile } from '@/components/PhotonicAgeTile'
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
      <section className="fade-in hero snap-section" data-nav-theme="dark">
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
          <h1 className="display-xl">
            Reclaim
            <br />
            <em style={{ whiteSpace: 'nowrap' }}>lost&nbsp;time</em>
          </h1>

          <p className="display-sm" style={{ marginTop: '24px', maxWidth: '520px' }}>
            Light deprivation is costing you years. PHOS measures exactly how many, and shows you
            how to reclaim them.
          </p>

          <div style={{ marginTop: '40px' }}>
            <Link href="/research/photonic-age" className="btn btn--primary">
              Why light matters →
            </Link>
          </div>
        </div>
      </section>

      <hr style={{ border: 'none', borderTop: '1px solid var(--rule)', margin: 0 }} />

      {/* ── 01 · The Biology ── */}
      <section
        id="biology"
        className="fade-in snap-section"
        data-nav-theme="light"
        style={{ paddingTop: 'clamp(48px, 8vh, 80px)', paddingBottom: 'clamp(40px, 6vh, 64px)' }}
      >
        <div className="container">
          <p className="section-number">01</p>
          <h2 className="section-title">Unspoken facts</h2>

          <div style={{ padding: '32px 0', borderBottom: '1px solid var(--rule)' }}>
            <h3 className="display-md">
              Light powers every human cell.
            </h3>
            <p className="support" style={{ marginTop: '14px' }}>
              20,000 neurons set the body&apos;s entire schedule by morning light.
            </p>
          </div>

          <div style={{ padding: '32px 0', borderBottom: '1px solid var(--rule)' }}>
            <h3 className="display-md">
              Modern life broke the signal.
            </h3>
            <p className="support" style={{ marginTop: '14px' }}>
              Bright nights, dim days, irregular hours. The body runs on the wrong time.
            </p>
          </div>

          <div style={{ padding: '32px 0' }}>
            <h3 className="display-md">
              Hibernation is what follows.
            </h3>
            <p className="support" style={{ marginTop: '14px' }}>
              Cognition, immunity, and metabolism drop a gear, every working day.
            </p>
          </div>
        </div>
      </section>

      {/* ── 02 · Photonic Age ── */}
      <section
        id="photonic-age"
        className="fade-in snap-section photonic-age-panel"
        data-nav-theme="light"
      >
        <div
          className="container"
          style={{ paddingTop: 'clamp(48px, 8vh, 80px)', paddingBottom: 'clamp(48px, 8vh, 80px)' }}
        >
          <p className="section-number">02</p>
          <h2 className="section-title">Photonic Age</h2>

          <p className="lede">
            Your age, measured in light. The gap from your calendar age is your Lost Light Years.
          </p>

          <PhotonicAgeTile />
        </div>
      </section>

      {/* ── 03 · TipTraQ ── */}
      <section id="tiptraq" className="fade-in tiptraq-panel snap-section" data-nav-theme="dark">
        <div
          className="tiptraq-panel__image"
          style={{ backgroundImage: 'url(/tiptraq/tiptraq.jpg)' }}
          aria-hidden="true"
        />
        <div className="tiptraq-panel__veil" aria-hidden="true" />
        <div className="container tiptraq-panel__content">
          <p className="section-number" style={{ color: 'rgba(255, 255, 255, 0.72)' }}>
            03
          </p>
          <h2 className="section-title" style={{ marginTop: '12px' }}>
            Sleep tests tell us all we need to know
          </h2>

          <p className="lede" style={{ marginTop: '20px' }}>
            Your Photonic Age score comes from clinical-grade home tests, no lab visit or blood
            test.
          </p>

          <div style={{ marginTop: '36px' }}>
            <Link href="/#tiptraq" className="btn btn--primary">
              How we measure it →
            </Link>
          </div>
        </div>
      </section>

      {/* ── 04 · The Commercial Case ── */}
      <section
        id="commercial-case"
        className="fade-in snap-section"
        data-nav-theme="light"
        style={{ paddingTop: 'clamp(48px, 8vh, 80px)', paddingBottom: 'clamp(48px, 8vh, 80px)' }}
      >
        <div className="container">
          <p className="section-number">04</p>
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

          <p className="support" style={{ marginTop: '28px' }}>
            This is conservative. It excludes healthcare, attrition, and impaired decisions.
          </p>
        </div>
      </section>

      {/* ── 05 · Turn off hibernation ── */}
      <section
        id="hibernation"
        className="fade-in hibernation-panel snap-section"
        data-nav-theme="dark"
      >
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
        <div className="container hibernation-panel__content">
          <p className="section-number" style={{ color: 'rgba(255, 255, 255, 0.72)' }}>
            05
          </p>
          <h2 className="section-title" style={{ marginTop: '12px' }}>
            Turn off hibernation
          </h2>
          <p className="support" style={{ marginTop: '20px' }}>
            Three nights of TipTraQ data ends biological winter.
          </p>
          <div style={{ marginTop: '36px' }}>
            <Link href="/#commercial-case" className="btn btn--primary">
              Calculate your cost →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
