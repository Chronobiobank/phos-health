'use client'

import { useEffect } from 'react'
import Link from 'next/link'

import { Footer } from '@/components/Footer'
import {
  FREE_SCORE_HREF,
  LandingPricingLadder,
} from '@/components/landing/LandingPricingLadder'
import { Nav } from '@/components/Nav'

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
    <main className="landing">
      <Nav />

      <section id="hero" className="fade-in hero snap-section landing__snap" data-nav-theme="dark">
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
        <div className="container hero__content">
          <h1 className="display-xl">
            Win your <span className="landing-accent">best hours</span> today.
          </h1>
          <p className="support">Free score. Your window. One cue tonight.</p>
          <div className="copy-actions">
            <Link href={FREE_SCORE_HREF} className="btn btn--primary">
              Get your window →
            </Link>
          </div>
        </div>
      </section>

      <section id="outcomes" className="fade-in snap-section biology-panel landing__snap" data-nav-theme="dark">
        <div className="container biology-panel__content">
          <p className="section-number">01</p>
          <h2 className="section-title">Sleep deeper. Sharper afternoons.</h2>
          <div className="fact-tiles">
            <article className="fact-tile">
              <h3 className="fact-tile__head">Your peak window, mapped daily.</h3>
            </article>
            <article className="fact-tile">
              <h3 className="fact-tile__head">One thing to do tonight.</h3>
            </article>
            <article className="fact-tile">
              <h3 className="fact-tile__head">Circadian risk you can change.</h3>
            </article>
          </div>
          <div className="copy-actions">
            <Link href={FREE_SCORE_HREF} className="btn btn--primary">
              Get your window →
            </Link>
          </div>
        </div>
      </section>

      <section
        id="free"
        className="fade-in snap-section landing-free-panel photonic-age-panel landing__snap"
        data-nav-theme="light"
      >
        <div className="container photonic-age-panel__content">
          <p className="section-number">02</p>
          <h2 className="section-title">Your window and one move tonight.</h2>
          <p className="support">Free jet lag score plus your Daily Cue.</p>
          <div className="copy-actions">
            <Link href={FREE_SCORE_HREF} className="btn btn--primary">
              Get tonight&apos;s cue →
            </Link>
          </div>
        </div>
      </section>

      <section
        id="pricing"
        className="fade-in snap-section landing-pricing-panel photonic-age-panel landing__snap"
        data-nav-theme="light"
      >
        <div className="container photonic-age-panel__content">
          <p className="section-number">03</p>
          <h2 className="section-title">Better fix. Visible progress.</h2>
          <LandingPricingLadder />
        </div>
      </section>

      <section id="trust" className="fade-in snap-section landing-trust-panel landing__snap" data-nav-theme="light">
        <div className="container landing-trust-panel__content">
          <p className="section-number">04</p>
          <h2 className="section-title">Your data is never sold.</h2>
          <Link href="/chronobiobank" className="label landing-trust-panel__link">
            Chronobiobank →
          </Link>
        </div>
      </section>

      <section id="close" className="fade-in snap-section landing-close-panel landing__snap" data-nav-theme="dark">
        <div className="container landing-close-panel__content">
          <p className="section-number">05</p>
          <h2 className="section-title">Tonight&apos;s cue is free.</h2>
          <div className="copy-actions">
            <Link href={FREE_SCORE_HREF} className="btn btn--primary">
              Get tonight&apos;s cue →
            </Link>
          </div>
          <p className="support landing-close-panel__safety">Urgent symptoms: 111 or 999.</p>
        </div>
      </section>

      <Footer />
    </main>
  )
}
