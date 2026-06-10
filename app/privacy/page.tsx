import type { Metadata } from 'next'
import Link from 'next/link'

import { Footer } from '@/components/Footer'
import { Nav } from '@/components/Nav'

export const metadata: Metadata = {
  title: 'Privacy · PHOS Circadian Health',
  description: 'How PHOS handles personal and workforce health data.',
}

export default function PrivacyPage() {
  return (
    <main data-nav-theme="light">
      <Nav />

      <section className="legal-page">
        <div className="container legal-page__content">
          <p className="section-number">Privacy</p>
          <h1 className="section-title">Your data stays yours</h1>
          <p className="support">
            TipTraQ study data is encrypted in transit and at rest. HR sees team summaries, never
            raw sleep recordings.
          </p>
          <p className="support" style={{ marginTop: '16px' }}>
            Questions:{' '}
            <a href="mailto:hello@phos.org.uk">hello@phos.org.uk</a>
          </p>
          <div style={{ marginTop: '32px' }}>
            <Link href="/#hero" className="btn btn--outline">
              Back to home
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
