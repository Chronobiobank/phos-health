import type { Metadata } from 'next'
import Link from 'next/link'

import { Footer } from '@/components/Footer'
import { Nav } from '@/components/Nav'

export const metadata: Metadata = {
  title: 'Terms · PHOS Circadian Health',
  description: 'Terms of service for PHOS workforce circadian health programmes.',
}

export default function TermsPage() {
  return (
    <main data-nav-theme="light">
      <Nav />

      <section className="legal-page">
        <div className="container legal-page__content">
          <p className="section-number">Terms</p>
          <h1 className="section-title">Programme terms</h1>
          <p className="support">
            The 90-day guarantee applies to qualifying firm deployments. Full terms provided at
            contract.
          </p>
          <p className="support" style={{ marginTop: '16px' }}>
            Enquiries:{' '}
            <a href="mailto:hello@phos.org.uk">hello@phos.org.uk</a>
          </p>
          <div className="copy-actions">
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
