'use client'

import { useState } from 'react'

export function KitAssignPanel() {
  const [serial, setSerial] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function assignKit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/kits/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serial: serial.trim() }),
      })
      const payload = (await response.json()) as { error?: string; serial?: string; kit_type?: string }

      if (!response.ok) {
        setMessage(payload.error ?? 'Could not assign kit.')
        return
      }

      setMessage(`Kit ${payload.serial} (${payload.kit_type}) is bound to your profile.`)
      setSerial('')
    } catch {
      setMessage('Could not assign kit.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="kit-assign dash-card dash-tile" onSubmit={assignKit}>
      <h2 className="display-md kit-assign__title">Bind sleep study kit</h2>
      <p className="support kit-assign__lede">
        Enter the serial on your Photonic Sleep Study box so inbound reports route to you.
      </p>
      <label className="kit-assign__field">
        <span className="dash-card__label">Kit serial</span>
        <input
          className="kit-assign__input"
          name="serial"
          value={serial}
          onChange={(event) => setSerial(event.target.value)}
          placeholder="TQ-DEMO-001"
          autoComplete="off"
          required
        />
      </label>
      <button type="submit" className="btn btn--primary" disabled={loading}>
        {loading ? 'Binding…' : 'Bind kit →'}
      </button>
      {message ? <p className="support kit-assign__message">{message}</p> : null}
    </form>
  )
}
