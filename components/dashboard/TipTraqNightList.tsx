'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import type { PhosNightRow } from '@/lib/phos/types'

type TipTraqNightListProps = {
  nights: PhosNightRow[]
  canDelete: boolean
}

export function TipTraqNightList({ nights, canDelete }: TipTraqNightListProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!nights.length) {
    return <p className="support">No nights uploaded yet.</p>
  }

  async function handleDelete(id: string) {
    if (id.startsWith('sample-')) return

    setDeletingId(id)
    setError(null)

    try {
      const response = await fetch(`/api/tiptraq/nights/${id}`, { method: 'DELETE' })
      const payload = (await response.json()) as { error?: string }

      if (!response.ok) {
        throw new Error(payload.error ?? 'Delete failed')
      }

      router.refresh()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Delete failed')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="tiptraq-night-list">
      <ol className="tiptraq-night-list__items">
        {nights.map((night) => (
          <li key={night.id} className="tiptraq-night-list__item dash-card">
            <div>
              <p className="dash-card__label">{night.date}</p>
              <p className="tiptraq-night-list__stats">
                {night.sleepEfficiency != null ? `${night.sleepEfficiency}% sleep efficiency` : 'Processing'}
                {night.dlmoTime ? ` · phase ${night.dlmoTime}` : ''}
              </p>
            </div>
            {canDelete && !night.id.startsWith('sample-') ? (
              <button
                type="button"
                className="btn btn--outline tiptraq-night-list__delete"
                disabled={deletingId === night.id}
                onClick={() => void handleDelete(night.id)}
              >
                {deletingId === night.id ? 'Removing...' : 'Remove'}
              </button>
            ) : null}
          </li>
        ))}
      </ol>
      {error ? <p className="support tiptraq-night-list__error">{error}</p> : null}
    </div>
  )
}
