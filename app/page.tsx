'use client'

import { useEffect } from 'react'
import Link from 'next/link'

import { Footer } from '@/components/Footer'
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

      {/* Beat 1 — The provocation */}
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
          <h1 className="display-xl">Your light outruns your birthday.</h1>
          <p className="lede">
            Eighty eight thousand people proved light ages you past your passport.
          </p>
          <div className="copy-actions">
            <Link href="#science" className="btn btn--outline">
              See the proof ↓
            </Link>
          </div>
        </div>
      </section>

      {/* Beat 2 — The mechanism */}
      <section id="science" className="fade-in snap-section biology-panel" data-nav-theme="dark">
        <div className="container biology-panel__content">
          <p className="section-number">01</p>
          <h2 className="section-title">Brighter nights already shorten lives.</h2>
          <div className="fact-tiles">
            <article className="fact-tile">
              <h3 className="fact-tile__head">Mortality up thirty four percent.</h3>
            </article>
            <article className="fact-tile">
              <h3 className="fact-tile__head">Diabetes risk up fifty three percent.</h3>
            </article>
            <article className="fact-tile">
              <h3 className="fact-tile__head">Five diseases tied to night light.</h3>
            </article>
          </div>
          <p className="support">
            The Windred cohort in PNAS, Lancet, and JAMA agrees.
          </p>
        </div>
      </section>

      {/* Beat 3 — The metric */}
      <section
        id="metric"
        className="fade-in snap-section photonic-age-panel"
        data-nav-theme="light"
      >
        <div className="container photonic-age-panel__content">
          <p className="section-number">02</p>
          <h2 className="section-title">Photonic Age is your body clock age.</h2>
          <p className="lede">
            Lost Light Years are the gap you can still close tonight.
          </p>
        </div>
      </section>

      {/* Beat 4 — The calculator */}
      <section id="diagnostic" className="fade-in snap-section photonic-age-panel" data-nav-theme="light">
        <div className="container photonic-age-panel__content">
          <p className="section-number">03</p>
          <h2 className="section-title">What is your number?</h2>
          <p className="lede">
            Seven questions, two minutes. Your protocol and Photonic Age follow.
          </p>
          <div className="copy-actions">
            <Link href="/score" className="btn btn--primary">
              Calculate your Photonic Age →
            </Link>
          </div>
        </div>
      </section>

      {/* Beat 5 — The bigger invitation */}
      <section
        id="chronobiobank"
        className="fade-in snap-section hibernation-panel"
        data-nav-theme="dark"
      >
        <div className="hibernation-panel__veil" aria-hidden="true" />
        <div className="container hibernation-panel__content">
          <p className="section-number">04</p>
          <h2 className="section-title">You own your data forever.</h2>
          <p className="lede">
            Opt in after your score. Chronobiobank is charity held, never sold.
          </p>
          <div className="fact-tiles">
            <article className="fact-tile">
              <h3 className="fact-tile__head">Not feeding a corporate model.</h3>
            </article>
            <article className="fact-tile">
              <h3 className="fact-tile__head">Held in charitable trust for you.</h3>
            </article>
            <article className="fact-tile">
              <h3 className="fact-tile__head">You are a founding contributor.</h3>
            </article>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
