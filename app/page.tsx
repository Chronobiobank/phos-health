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
      <section id="hero" className="fade-in hero snap-section" data-nav-theme="dark">
        <video
          className="hero__video"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
        >
          <source src="/lights%20in%20motion.mp4" type="video/mp4" />
        </video>
        <div className="hero__veil" aria-hidden="true" />
        <div className="container hero__content">
          <h1 className="display-xl">
            Reclaim
            <br />
            <em style={{ whiteSpace: 'nowrap' }}>lost&nbsp;time</em>
          </h1>

          <p className="display-sm" style={{ marginTop: '24px', maxWidth: '520px' }}>
            Light deprivation drains your productivity. PHOS measures exactly how, and shows you how
            to reclaim it.
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
      <section id="biology" className="fade-in snap-section biology-panel" data-nav-theme="light">
        <div className="container biology-panel__content">
          <p className="section-number">01</p>
          <h2 className="section-title">Unspoken facts</h2>

          <div className="fact-tiles">
            <article className="fact-tile">
              <h3 className="fact-tile__head">Light powers every human cell.</h3>
              <p className="fact-tile__support">
                20,000 neurons set the body&apos;s entire schedule by morning light.
              </p>
            </article>

            <article className="fact-tile">
              <h3 className="fact-tile__head">Modern life broke the signal.</h3>
              <p className="fact-tile__support">
                Bright nights, dim days, irregular hours. The body runs out of sync.
              </p>
            </article>

            <article className="fact-tile">
              <h3 className="fact-tile__head">Hibernation is what follows.</h3>
              <p className="fact-tile__support">
                Cognition, immunity, and metabolism drop a gear, every working day.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* ── 02 · Photonic Age ── */}
      <section
        id="photonic-age"
        className="fade-in snap-section photonic-age-panel"
        data-nav-theme="light"
      >
        <div className="container photonic-age-panel__content">
          <p className="section-number">02</p>
          <h2 className="section-title">Photonic Age</h2>
          <PhotonicAgeTile />
        </div>
      </section>

      {/* ── 03 · TipTraQ ── */}
      <section id="tiptraq" className="fade-in tiptraq-panel snap-section" data-nav-theme="dark">
        <img
          className="tiptraq-panel__image"
          src="/tiptraq/tiptraq.jpg"
          alt=""
          aria-hidden="true"
        />
        <div className="tiptraq-panel__veil" aria-hidden="true" />
        <div className="container tiptraq-panel__content">
          <p className="section-number" style={{ color: 'rgba(255, 255, 255, 0.72)' }}>
            03
          </p>
          <h2 className="section-title" style={{ marginTop: '12px' }}>
            Sleep tests offer deep insight
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

      {/* ── 04 · Model your firm ── */}
      <section
        id="model-your-firm"
        className="fade-in snap-section model-firm-panel"
        data-nav-theme="light"
      >
        <div className="container model-firm-panel__content">
          <p className="section-number">04</p>
          <h2 className="section-title">Model your firm</h2>
          <p className="support">Set headcount, salary, and Lost Light Years.</p>
          <CostCalculator />
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
          <source src="/first-light.mp4" type="video/mp4" />
        </video>
        <div className="hero__veil" aria-hidden="true" />
        <div className="container hibernation-panel__content">
          <p className="section-number" style={{ color: 'rgba(255, 255, 255, 0.72)' }}>
            05
          </p>
          <h2 className="section-title" style={{ marginTop: '12px' }}>
            Reclaim lost productivity in 90 days or your money back.
          </h2>
          <div style={{ marginTop: '36px' }}>
            <a href="mailto:hello@phos.health?subject=Book%20free%20demo" className="btn btn--primary">
              Book free demo →
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
