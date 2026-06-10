import type { Metadata } from 'next'
import Link from 'next/link'

import { Footer } from '@/components/Footer'
import { Nav } from '@/components/Nav'

export const metadata: Metadata = {
  title: 'Let light back in · PHOS Circadian Health',
  description: 'From £495 per professional. Measurable results in 90 days or your money back.',
}

export default function ContactPage() {
  return (
    <main data-nav-theme="dark">
      <Nav />

      <section id="hibernation" className="detail-page contact-page hibernation-panel">
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
        <div className="container detail-page__content contact-page__content">
          <p className="section-number" style={{ color: 'rgba(255, 255, 255, 0.72)' }}>
            05
          </p>
          <h1 className="section-title">Let light back in</h1>
          <p className="support">From £495 per professional. Measurable results in 90 days or your money back.</p>

          <p className="support contact-page__email">
            <a href="mailto:hello@phos.org.uk">hello@phos.org.uk</a>
          </p>

          <div className="detail-page__actions">
            <a href="mailto:hello@phos.org.uk?subject=Book%20free%20demo" className="btn btn--primary">
              Book free demo →
            </a>
            <Link href="/" className="btn btn--outline">
              Back to home
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
