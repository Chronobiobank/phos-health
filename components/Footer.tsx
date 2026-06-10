import Link from 'next/link'

import { HomeLink } from '@/components/HomeLink'
import { FOOTER_LINKS } from '@/lib/site-links'

const linkStyle = { color: 'var(--muted)' } as const

export function Footer() {
  return (
    <footer className="site-footer" style={{ borderTop: '1px solid var(--rule)' }}>
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
          <HomeLink className="footer-mark" aria-label="PHOS home">
            ʘ
          </HomeLink>
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
          {FOOTER_LINKS.map((link) =>
            link.href.startsWith('mailto:') ? (
              <a key={link.href} href={link.href} className="label" style={linkStyle}>
                {link.label}
              </a>
            ) : (
              <Link key={link.href} href={link.href} className="label" style={linkStyle}>
                {link.label}
              </Link>
            ),
          )}
        </div>

        <p className="label" style={{ color: 'var(--dim)', textAlign: 'right' }}>
          © 2026 PHOS
        </p>
      </div>
    </footer>
  )
}
