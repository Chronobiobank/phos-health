import Link from 'next/link'

import Wordmark from '@/components/Wordmark'

export function Nav() {
  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: 'rgba(255, 255, 255, 0.45)',
        borderBottom: '1px solid rgba(220, 220, 232, 0.5)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
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
