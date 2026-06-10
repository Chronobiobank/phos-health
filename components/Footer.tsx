import Link from 'next/link'

import Wordmark from '@/components/Wordmark'
import { SITE_LINKS } from '@/lib/site-links'

export function Footer() {
  return (
    <footer className="snap-end" style={{ borderTop: '1px solid var(--rule)' }}>
      <div
        className="container"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 'var(--space-md)',
          paddingTop: '48px',
          paddingBottom: '56px',
        }}
      >
        <div>
          <Wordmark />
          <p className="display-sm" style={{ marginTop: '10px' }}>
            Circadian Health
          </p>
          <p className="label" style={{ color: 'var(--dim)', marginTop: '8px' }}>
            Reclaim Lost Time
          </p>
        </div>

        <div
          role="navigation"
          aria-label="Footer"
          className="footer-nav"
          style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
        >
          {SITE_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="label" style={{ color: 'var(--muted)' }}>
              {link.label}
            </Link>
          ))}
        </div>

        <div className="label" style={{ color: 'var(--dim)', textAlign: 'right', lineHeight: 2 }}>
          © 2026 PHOS
          <br />
          phos.org.uk
        </div>
      </div>
    </footer>
  )
}
