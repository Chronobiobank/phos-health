import Wordmark from '@/components/Wordmark'

export function Footer() {
  return (
    <footer className="snap-end" style={{ borderTop: '1px solid var(--rule)' }}>
      <div
        className="container--wide"
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
          <p className="display-sm" style={{ fontStyle: 'italic', marginTop: '10px' }}>
            Photonic Operating System
          </p>
          <p className="label" style={{ color: 'var(--dim)', marginTop: '8px' }}>
            Light Matters
          </p>
        </div>

        <div className="label" style={{ color: 'var(--dim)', textAlign: 'right', lineHeight: 2 }}>
          © 2026 The Circadian Foundation
          <br />
          Auckland, New Zealand
          <br />
          phos.org.uk
        </div>
      </div>
    </footer>
  )
}
