import Link from 'next/link'

import Wordmark from '@/components/Wordmark'

export function Nav() {
  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'var(--void)',
        borderBottom: '1px solid var(--rule)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <div
        className="container--wide"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          gap: 'var(--space-sm)',
          paddingTop: '14px',
          paddingBottom: '14px',
        }}
      >
        <Link
          href="/"
          aria-label="PHOS home"
          style={{ display: 'inline-flex', justifySelf: 'start' }}
        >
          <Wordmark />
        </Link>

        <span className="nav-sub" style={{ justifySelf: 'center' }}>
          Circadian Health
        </span>

        <Link
          href="/research/photonic-age"
          className="btn btn--outline"
          style={{ justifySelf: 'end' }}
        >
          Why PHOS?
        </Link>
      </div>
    </nav>
  )
}
