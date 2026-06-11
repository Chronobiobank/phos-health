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
          <h1 className="display-xl">Your light is ageing you.</h1>
          <p className="lede">
            Your body clock drifts when light is wrong. Photonic Age measures how far.
          </p>
          <div className="copy-actions">
            <Link href="/score" className="btn btn--primary">
              Get your number →
            </Link>
            <Link href="/score?context=d3" className="btn btn--outline">
              On D3? Start here →
            </Link>
          </div>
        </div>
      </section>

      <section id="science" className="fade-in snap-section biology-panel" data-nav-theme="dark">
        <div className="container biology-panel__content">
          <p className="section-number">01</p>
          <h2 className="section-title">Your nights are costing years.</h2>
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
            Same cohort in PNAS, The Lancet, and JAMA reached the same conclusion.
          </p>
        </div>
      </section>

      <section
        id="metric"
        className="fade-in snap-section photonic-age-panel"
        data-nav-theme="light"
      >
        <div className="container photonic-age-panel__content">
          <p className="section-number">02</p>
          <h2 className="section-title">One number upstream of everything.</h2>
          <p className="lede">
            Epigenetic clocks score damage done. Photonic Age scores the light causing it.
          </p>
        </div>
      </section>

      <section id="diagnostic" className="fade-in snap-section photonic-age-panel" data-nav-theme="light">
        <div className="container photonic-age-panel__content">
          <p className="section-number">03</p>
          <h2 className="section-title">What is your number?</h2>
          <p className="lede">
            Seven questions, two minutes, no blood draw. Your protocol follows immediately.
          </p>
          <div className="copy-actions">
            <Link href="/score" className="btn btn--primary">
              Calculate now →
            </Link>
          </div>
        </div>
      </section>

      <section
        id="chronobiobank"
        className="fade-in snap-section hibernation-panel"
        data-nav-theme="dark"
      >
        <div className="hibernation-panel__veil" aria-hidden="true" />
        <div className="container hibernation-panel__content">
          <p className="section-number">04</p>
          <h2 className="section-title">Your data stays yours forever.</h2>
          <p className="lede">
            Chronobiobank Limited is a charity. Every assessment builds medicine without selling you.
          </p>
          <div className="fact-tiles">
            <article className="fact-tile">
              <h3 className="fact-tile__head">Investors never own your record.</h3>
            </article>
            <article className="fact-tile">
              <h3 className="fact-tile__head">Advertisers never buy your light.</h3>
            </article>
            <article className="fact-tile">
              <h3 className="fact-tile__head">You choose who sees it.</h3>
            </article>
          </div>
          <div className="copy-actions">
            <Link href="/score" className="btn btn--primary">
              Join and calculate →
            </Link>
          </div>
        </div>
      </section>

      <div className="container trust-line">
        <p className="support trust-line__copy">
          Registered charity. Your light data held in trust, never sold.
        </p>
      </div>

      <Footer />
    </main>
  )
}
