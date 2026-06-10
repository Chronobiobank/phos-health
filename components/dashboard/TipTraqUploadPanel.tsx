'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'

import { runTipTraqEdfUpload, type TipTraqUploadResult } from '@/lib/tiptraq/run-edf-upload'

type UploadState = {
  status: 'idle' | 'uploading' | 'processing' | 'complete' | 'error'
  progress: number
  result?: TipTraqUploadResult
  error?: string
}

const STATUS_MESSAGES: Record<UploadState['status'], string | null> = {
  idle: null,
  uploading: 'Uploading to secure storage...',
  processing: 'Processing your night...',
  complete: null,
  error: null,
}

function friendlyError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error)
  if (/not valid JSON|Unexpected token|413/i.test(message)) {
    return 'Upload failed. Hard-refresh and try again.'
  }
  return message || 'Upload failed. Please try again.'
}

export function TipTraqUploadPanel() {
  const router = useRouter()
  const [state, setState] = useState<UploadState>({ status: 'idle', progress: 0 })
  const [isDragging, setIsDragging] = useState(false)

  const processFile = useCallback(
    async (file: File) => {
      setState({ status: 'uploading', progress: 35 })

      try {
        setState({ status: 'processing', progress: 75 })
        const result = await runTipTraqEdfUpload(file)
        setState({ status: 'complete', progress: 100, result })
        router.refresh()
      } catch (error) {
        setState({ status: 'error', progress: 0, error: friendlyError(error) })
      }
    },
    [router],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const picked = e.dataTransfer.files[0]
      if (picked) void processFile(picked)
    },
    [processFile],
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const picked = e.target.files?.[0]
      if (picked) void processFile(picked)
    },
    [processFile],
  )

  const reset = () => setState({ status: 'idle', progress: 0 })

  return (
    <div className="tiptraq-upload" data-tiptraq-upload="signed-flow-v3">
      {state.status === 'idle' && (
        <div
          className={`tiptraq-upload__drop dash-card${isDragging ? ' tiptraq-upload__drop--active' : ''}`}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <p className="tiptraq-upload__title">Upload a night</p>
          <p className="support tiptraq-upload__hint">Drop your TipTraQ EDF file or choose one.</p>
          <label className="btn btn--primary tiptraq-upload__picker">
            Choose file
            <input
              type="file"
              accept=".edf,application/edf,application/octet-stream"
              onChange={handleFileInput}
              className="tiptraq-upload__input"
            />
          </label>
          <p className="dash-card__label tiptraq-upload__meta">.edf · one night · max 50MB</p>
        </div>
      )}

      {['uploading', 'processing'].includes(state.status) && (
        <div className="tiptraq-upload__progress dash-card">
          <p className="tiptraq-upload__status">{STATUS_MESSAGES[state.status]}</p>
          <div className="tiptraq-upload__bar" aria-hidden="true">
            <div className="tiptraq-upload__bar-fill" style={{ width: `${state.progress}%` }} />
          </div>
        </div>
      )}

      {state.status === 'complete' && state.result && (
        <div className="tiptraq-upload__result dash-card dash-card--featured">
          <p className="dash-card__label">
            Night {state.result.rolling.nights_count} · {state.result.night.date}
          </p>
          <p className="tiptraq-upload__phase">
            Body clock phase at <strong>{state.result.night.dlmo_time}</strong>
          </p>
          <p className="support">{state.result.night.chronotype_signal}</p>
          <p className="support">
            {state.result.rolling.confidence_label} confidence · {state.result.rolling.confidence_score}%
          </p>
          {state.result.calibration ? (
            <p className="support">{state.result.calibration.displayLabel}</p>
          ) : null}
          <button type="button" className="btn btn--primary tiptraq-upload__again" onClick={reset}>
            Upload another night →
          </button>
        </div>
      )}

      {state.status === 'error' && (
        <div className="tiptraq-upload__error dash-card">
          <p className="tiptraq-upload__error-copy">{state.error}</p>
          <button type="button" className="btn btn--primary" onClick={reset}>
            Try again
          </button>
        </div>
      )}
    </div>
  )
}
