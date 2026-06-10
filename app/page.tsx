'use client'

import { useEffect } from 'react'
import Link from 'next/link'

import { BiologyFacts } from '@/components/BiologyFacts'
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
          <h1 className="display-xl" style={{ maxWidth: '22ch' }}>
            Your firm is running dark.
          </h1>

          <p className="display-sm" style={{ marginTop: '24px', maxWidth: '44ch' }}>
            That darkness costs £18,000 per professional, per year.
          </p>

          <div style={{ marginTop: '40px' }}>
            <Link href="/loss-in-light-years" className="btn btn--primary">
              See the cost →
            </Link>
          </div>
        </div>
      </section>

      {/* ── 01 · The Biology ── */}
      <section id="biology" className="fade-in snap-section biology-panel" data-nav-theme="dark">
        <div className="container biology-panel__content">
          <p className="section-number">01</p>
          <h2 className="section-title">Why light matters</h2>

          <BiologyFacts />

          <div style={{ marginTop: '36px' }}>
            <Link href="/biology" className="btn btn--primary">
              Why light matters →
            </Link>
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
          <h2 className="section-title">How we quantify loss</h2>
          <PhotonicAgeTile ctaHref="/tiptraq" ctaLabel="How we measure it →" />
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
            Sleep tests give us deep insight
          </h2>

          <p className="support" style={{ marginTop: '20px' }}>
            TipTraQ maps lost light from three nights at home, not a lab.
          </p>

          <div style={{ marginTop: '36px' }}>
            <Link href="/dashboard" className="btn btn--primary">
              View demo dashboard →
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
          <p className="support">
            From £495 per professional.
          </p>
          <CostCalculator />

          <div style={{ marginTop: '36px' }}>
            <Link href="/contact" className="btn btn--primary">
              Book free demo →
            </Link>
          </div>
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
        <div className="hibernation-panel__veil" aria-hidden="true" />
        <div className="container hibernation-panel__content">
          <p className="section-number" style={{ color: 'rgba(255, 255, 255, 0.72)' }}>
            05
          </p>
          <h2 className="section-title" style={{ marginTop: '12px' }}>
            Let light back in
          </h2>
          <p className="support" style={{ marginTop: '20px' }}>
            From £495 per professional. Measurable results in 90 days or your money back.
          </p>
          <div style={{ marginTop: '36px' }}>
            <Link href="/contact" className="btn btn--primary">
              Contact us →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
