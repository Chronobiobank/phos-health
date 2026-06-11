'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import type { ChronobiobankMemberState } from '@/lib/chronobiobank/types'

type ChronobiobankOptInPanelProps = {
  state: ChronobiobankMemberState
  signedIn: boolean
}

export function ChronobiobankOptInPanel({ state, signedIn }: ChronobiobankOptInPanelProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<'opt-in' | 'revoke' | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function optIn() {
    setLoading('opt-in')
    setMessage(null)

    try {
      const response = await fetch('/api/chronobiobank/opt-in', { method: 'POST' })
      const payload = (await response.json()) as { error?: string; message?: string }

      if (response.status === 401) {
        router.push('/auth/signin?next=/chronobiobank')
        return
      }

      if (!response.ok) {
        setMessage(payload.error ?? 'Could not join Chronobiobank.')
        return
      }

      setMessage(payload.message ?? 'Joined Chronobiobank.')
      router.refresh()
    } catch {
      setMessage('Could not join Chronobiobank.')
    } finally {
      setLoading(null)
    }
  }

  async function revoke() {
    setLoading('revoke')
    setMessage(null)

    try {
      const response = await fetch('/api/chronobiobank/revoke', { method: 'POST' })
      const payload = (await response.json()) as { error?: string; message?: string }

      if (!response.ok) {
        setMessage(payload.error ?? 'Could not revoke consent.')
        return
      }

      setMessage(payload.message ?? 'Consent revoked.')
      router.refresh()
    } catch {
      setMessage('Could not revoke consent.')
    } finally {
      setLoading(null)
    }
  }

  const isActive = state.consent.granted && state.contribution.active

  return (
    <div className="chronobiobank-optin">
      <article className="dash-card chronobiobank-optin__status">
        <p className="dash-card__label">Your status</p>
        <p className="display-md">{isActive ? 'Contributing' : 'Not contributing'}</p>
        {state.contribution.pseudonymId ? (
          <p className="support">Pseudonym: {state.contribution.pseudonymId}</p>
        ) : (
          <p className="support">No pseudonym until your first snapshot is synced.</p>
        )}
      </article>

      {!signedIn ? (
        <p className="support">
          <a href="/auth/signin?next=/chronobiobank">Sign in</a> to join or manage your contribution.
        </p>
      ) : isActive ? (
        <button
          type="button"
          className="btn btn--outline"
          onClick={revoke}
          disabled={loading != null}
        >
          {loading === 'revoke' ? 'Revoking…' : 'Revoke and withdraw →'}
        </button>
      ) : (
        <button
          type="button"
          className="btn btn--primary"
          onClick={optIn}
          disabled={loading != null}
        >
          {loading === 'opt-in' ? 'Joining…' : 'Join Chronobiobank →'}
        </button>
      )}

      {message ? <p className="support chronobiobank-optin__message">{message}</p> : null}

      <p className="support chronobiobank-optin__note">
        This choice is separate from your employer programme and from PHOS service terms.
      </p>
    </div>
  )
}
