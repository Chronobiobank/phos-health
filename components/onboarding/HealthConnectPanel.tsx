'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { DashboardPanelTiles } from '@/components/dashboard/DashboardPanel'

type ConnectSource = 'demo' | 'apple_healthkit' | 'google_health_connect'

const SOURCES: Array<{ id: ConnectSource; label: string; note: string }> = [
  {
    id: 'apple_healthkit',
    label: 'Apple Health',
    note: 'Sleep and activity history from your iPhone.',
  },
  {
    id: 'google_health_connect',
    label: 'Google Health Connect',
    note: 'Sleep and activity history from Android.',
  },
  {
    id: 'demo',
    label: 'Try demo data',
    note: 'Preview your Photonic Age with sample sleep history.',
  },
]

export function HealthConnectPanel() {
  const router = useRouter()
  const [loading, setLoading] = useState<ConnectSource | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function connect(source: ConnectSource) {
    setLoading(source)
    setError(null)

    try {
      const response = await fetch('/api/health/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source }),
      })
      const payload = (await response.json()) as { error?: string }

      if (!response.ok) {
        setError(payload.error ?? 'Could not sync health data.')
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('Could not sync health data.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <>
      <DashboardPanelTiles columns={1} className="onboarding-connect__options">
        {SOURCES.map((source) => (
          <button
            key={source.id}
            type="button"
            className="dash-card dash-tile onboarding-connect__option"
            onClick={() => connect(source.id)}
            disabled={loading != null}
          >
            <span className="display-md onboarding-connect__option-label">{source.label}</span>
            <span className="support onboarding-connect__option-note">{source.note}</span>
            <span className="onboarding-connect__option-action">
              {loading === source.id ? 'Syncing…' : 'Connect →'}
            </span>
          </button>
        ))}
      </DashboardPanelTiles>

      {error ? (
        <article className="dash-card dash-tile">
          <p className="support onboarding-connect__error">{error}</p>
        </article>
      ) : null}

      <article className="dash-card dash-tile">
        <p className="support onboarding-connect__footnote">
          Native HealthKit and Health Connect sync ships in the mobile app. Web uses demo data until
          then.
        </p>
      </article>

      <div className="dash-panel__footer copy-actions">
        <Link href="/dashboard" className="btn btn--outline">
          Skip to dashboard
        </Link>
      </div>
    </>
  )
}
