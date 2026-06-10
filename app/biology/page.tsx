import type { Metadata } from 'next'
import Link from 'next/link'

import { BiologyFacts } from '@/components/BiologyFacts'
import { Footer } from '@/components/Footer'
import { Nav } from '@/components/Nav'

export const metadata: Metadata = {
  title: 'The biology · PHOS Circadian Health',
  description: 'Why morning light sets every schedule and modern work breaks the signal.',
}

export default function BiologyPage() {
  return (
    <main data-nav-theme="dark">
      <Nav />

      <section id="biology" className="detail-page biology-page biology-panel">
        <div className="container detail-page__content">
          <p className="section-number">01</p>
          <h1 className="section-title">The biology</h1>
          <p className="support biology-page__lede">
            Every fee earner runs on a light clock.
          </p>

          <BiologyFacts />

          <div className="detail-page__actions">
            <Link href="/loss-in-light-years" className="btn btn--primary">
              See the cost →
            </Link>
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
