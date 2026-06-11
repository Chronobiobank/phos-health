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
          <h1 className="display-xl">Is light stealing your youth?</h1>
          <p className="lede">
            88,000 people discovered how light controls your true age.
          </p>
          <div className="copy-actions">
            <Link href="#science" className="btn btn--outline">
              See the proof
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
          <div className="copy-actions">
            <Link href="/evidence" className="btn btn--primary">
              Read the science →
            </Link>
          </div>
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
          <h2 className="section-title">Reclaim the years light stole.</h2>
          <p className="lede">
            Reset your body clock tonight. Those lost years can still be closed.
          </p>
        </div>
      </section>

      {/* Beat 4 — The calculator */}
      <section id="diagnostic" className="fade-in snap-section photonic-age-panel" data-nav-theme="light">
        <div className="container photonic-age-panel__content">
          <p className="section-number">03</p>
          <h2 className="section-title">Ready for your Photonic Age?</h2>
          <p className="lede">
            Two minutes unlock your score and personalised protocol to follow.
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
          <h2 className="section-title">Your data, your control forever.</h2>
          <p className="lede">
            After your score, opt into Chronobiobank charity. Never sold to corporations.
          </p>
          <div className="fact-tiles">
            <article className="fact-tile">
              <h3 className="fact-tile__head">Not for profit, for progress.</h3>
            </article>
            <article className="fact-tile">
              <h3 className="fact-tile__head">Your data fuels research in trust.</h3>
            </article>
            <article className="fact-tile">
              <h3 className="fact-tile__head">Founding members shape light health.</h3>
            </article>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
