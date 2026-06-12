'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function OrgJoinPanel() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function join(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/org/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      })
      const payload = (await response.json()) as { error?: string; message?: string }

      if (response.status === 401) {
        router.push('/auth/signin?next=/org/join')
        return
      }

      if (!response.ok) {
        setMessage(payload.error ?? 'Could not join organisation.')
        return
      }

      setMessage(payload.message ?? 'Joined your employer programme.')
      setCode('')
      router.refresh()
    } catch {
      setMessage('Could not join organisation.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="org-join dash-card dash-tile" onSubmit={join}>
      <h2 className="display-md">Join your employer programme</h2>
      <p className="support">
        Enter your firm invite code. You consent to anonymised cohort numbers only.
      </p>
      <label className="org-join__field">
        <span className="dash-card__label">Invite code</span>
        <input
          className="org-join__input"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="NORTHBRIDGE-2026"
          autoComplete="off"
          required
        />
      </label>
      <button type="submit" className="btn btn--primary" disabled={loading}>
        {loading ? 'Joining…' : 'Join programme →'}
      </button>
      {message ? <p className="support org-join__message">{message}</p> : null}
    </form>
  )
}
