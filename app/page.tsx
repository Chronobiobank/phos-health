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
    <main>
      <Nav />

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
          <source src="/first-light.mp4" type="video/mp4" />
        </video>
        <div className="hero__veil" aria-hidden="true" />
        <div className="container hero__content">
          <h1 className="display-xl">Is light stealing your youth?</h1>
          <p className="lede">
            UK Biobank studied eighty eight thousand people on light and ageing.
          </p>
          <div className="copy-actions">
            <Link href={FREE_SCORE_HREF} className="btn btn--primary">
              Get your free score →
            </Link>
          </div>
        </div>
      </section>

      <section id="science" className="fade-in snap-section biology-panel" data-nav-theme="dark">
        <div className="container biology-panel__content">
          <p className="section-number">01</p>
          <h2 className="section-title">Brighter nights already shorten lives.</h2>
          <div className="fact-tiles">
            <article className="fact-tile">
              <h3 className="fact-tile__head">Mortality up thirty four percent.</h3>
              <p className="fact-tile__cite">UK Biobank cohort, population level only.</p>
            </article>
            <article className="fact-tile">
              <h3 className="fact-tile__head">Diabetes up fifty three percent.</h3>
              <p className="fact-tile__cite">UK Biobank cohort, population level only.</p>
            </article>
            <article className="fact-tile">
              <h3 className="fact-tile__head">Five diseases tied to night light.</h3>
              <p className="fact-tile__cite">UK Biobank cohort, population level only.</p>
            </article>
          </div>
          <div className="copy-actions">
            <Link href="/research/photonic-age" className="btn btn--primary">
              Read the science →
            </Link>
          </div>
        </div>
      </section>

      <section
        id="free"
        className="fade-in snap-section landing-free-panel photonic-age-panel"
        data-nav-theme="light"
      >
        <div className="container photonic-age-panel__content">
          <p className="section-number">02</p>
          <h2 className="section-title">Social jet lag in two minutes.</h2>
          <p className="support">Free, no device, no bloods. Wide honest band.</p>
          <div className="copy-actions">
            <Link href={FREE_SCORE_HREF} className="btn btn--primary">
              Get your free score →
            </Link>
          </div>
        </div>
      </section>

      <section
        id="pricing"
        className="fade-in snap-section landing-pricing-panel photonic-age-panel"
        data-nav-theme="light"
      >
        <div className="container photonic-age-panel__content">
          <p className="section-number">03</p>
          <h2 className="section-title">The precision ladder, priced.</h2>
          <p className="support">Same Photonic Age, tighter confidence as you climb.</p>
          <LandingPricingLadder />
        </div>
      </section>

      <section id="close" className="fade-in snap-section landing-close-panel" data-nav-theme="dark">
        <div className="container landing-close-panel__content">
          <p className="section-number">05</p>
          <h2 className="section-title">Start with your free score.</h2>
          <p className="support">Know your Photonic Age before you spend a penny.</p>
          <div className="copy-actions">
            <Link href={FREE_SCORE_HREF} className="btn btn--primary">
              Get your free score →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
