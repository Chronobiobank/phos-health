'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import { saveAssessmentSession, type AssessmentSessionPayload } from '@/lib/assessments/session'
import { scrollToPageTop } from '@/lib/scroll-home'

type FormState = {
  chronological_age: string
  postcode: string
  wake_time: string
  sleep_time: string
  screen_after_9pm: boolean | null
  outdoor_hours: string
  current_d3: boolean | null
  current_d3_dose: string
  consented_chronobiobank: boolean
}

const INITIAL: FormState = {
  chronological_age: '',
  postcode: '',
  wake_time: '07:30',
  sleep_time: '23:30',
  screen_after_9pm: null,
  outdoor_hours: '1.0',
  current_d3: null,
  current_d3_dose: '',
  consented_chronobiobank: false,
}

const STEP_COUNT = 7

export function ScoreFlow() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormState>(INITIAL)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const progress = useMemo(() => Math.round((step / STEP_COUNT) * 100), [step])

  useEffect(() => {
    scrollToPageTop()
  }, [step])

  function continueStep() {
    setError(null)

    if (step === 1) {
      const age = Number(form.chronological_age)
      if (!Number.isFinite(age) || age < 16 || age > 100) {
        setError('Enter an age between 16 and 100.')
        return
      }
    }

    if (step === 2 && !form.postcode.trim()) {
      setError('Enter your home postcode.')
      return
    }

    if (step === 5 && form.screen_after_9pm === null) {
      setError('Choose yes or no.')
      return
    }

    if (step === 6) {
      const hours = Number(form.outdoor_hours)
      if (!Number.isFinite(hours) || hours < 0 || hours > 16) {
        setError('Enter outdoor hours between 0 and 16.')
        return
      }
    }

    if (step === 7) {
      if (form.current_d3 === null) {
        setError('Choose yes or no.')
        return
      }
      if (form.current_d3 && !form.current_d3_dose.trim()) {
        setError('Enter your daily D3 dose in IU.')
        return
      }
      void submitAssessment()
      return
    }

    setStep((current) => current + 1)
  }

  async function submitAssessment() {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postcode: form.postcode.trim(),
          chronological_age: Number(form.chronological_age),
          sleep_time: form.sleep_time,
          wake_time: form.wake_time,
          screen_after_9pm: form.screen_after_9pm === true,
          outdoor_hours: Number(form.outdoor_hours),
          current_d3: form.current_d3 === true,
          current_d3_dose: form.current_d3 ? Number(form.current_d3_dose) : null,
          consented_chronobiobank: form.consented_chronobiobank,
        }),
      })

      const payload = (await response.json()) as AssessmentSessionPayload & { error?: string }

      if (!response.ok || !payload.assessmentId) {
        setError(payload.error ?? 'Could not save your assessment.')
        setLoading(false)
        return
      }

      saveAssessmentSession(payload)

      router.push(`/protocol?id=${payload.assessmentId}`)
    } catch {
      setError('Could not save your assessment.')
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="container auth-page__content">
        <p className="eyebrow">
          Question {step} of {STEP_COUNT}
        </p>

        <div
          className="dash-card"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Diagnostic progress ${progress} percent`}
          style={{ padding: 0, overflow: 'hidden', marginBottom: 'var(--stack-md)' }}
        >
          <div
            style={{
              height: 4,
              width: `${progress}%`,
              background: 'var(--corona)',
              transition: 'width 0.2s ease',
            }}
          />
        </div>

        {step === 1 ? (
          <>
            <h1 className="section-title">How old are you?</h1>
            <p className="support">Your calendar age sets the baseline.</p>
            <label className="auth-form__field dash-card" style={{ marginTop: 'var(--stack-lg)' }}>
              <span className="dash-card__label">Age in years</span>
              <input
                className="auth-form__input"
                type="number"
                min={16}
                max={100}
                inputMode="numeric"
                value={form.chronological_age}
                onChange={(event) =>
                  setForm((current) => ({ ...current, chronological_age: event.target.value }))
                }
              />
            </label>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <h1 className="section-title">Where do you live?</h1>
            <p className="support">We use latitude only. Your postcode is never stored.</p>
            <label className="auth-form__field dash-card" style={{ marginTop: 'var(--stack-lg)' }}>
              <span className="dash-card__label">UK postcode</span>
              <input
                className="auth-form__input"
                type="text"
                autoComplete="postal-code"
                spellCheck={false}
                value={form.postcode}
                onChange={(event) => setForm((current) => ({ ...current, postcode: event.target.value }))}
              />
            </label>
          </>
        ) : null}

        {step === 3 ? (
          <>
            <h1 className="section-title">When do you wake on weekdays?</h1>
            <p className="support">Your anchor window starts here.</p>
            <label className="auth-form__field dash-card" style={{ marginTop: 'var(--stack-lg)' }}>
              <span className="dash-card__label">Wake time</span>
              <input
                className="auth-form__input"
                type="time"
                value={form.wake_time}
                onChange={(event) => setForm((current) => ({ ...current, wake_time: event.target.value }))}
              />
            </label>
          </>
        ) : null}

        {step === 4 ? (
          <>
            <h1 className="section-title">When do you fall asleep on weekdays?</h1>
            <p className="support">Sleep onset sets your body clock phase.</p>
            <label className="auth-form__field dash-card" style={{ marginTop: 'var(--stack-lg)' }}>
              <span className="dash-card__label">Sleep time</span>
              <input
                className="auth-form__input"
                type="time"
                value={form.sleep_time}
                onChange={(event) => setForm((current) => ({ ...current, sleep_time: event.target.value }))}
              />
            </label>
          </>
        ) : null}

        {step === 5 ? (
          <>
            <h1 className="section-title">Do you use screens after 9pm?</h1>
            <p className="support">Evening light delays your clock.</p>
            <div className="auth-form" style={{ marginTop: 'var(--stack-lg)' }}>
              <button
                type="button"
                className={`btn ${form.screen_after_9pm === true ? 'btn--primary' : 'btn--outline'}`}
                onClick={() => setForm((current) => ({ ...current, screen_after_9pm: true }))}
              >
                Yes
              </button>
              <button
                type="button"
                className={`btn ${form.screen_after_9pm === false ? 'btn--primary' : 'btn--outline'}`}
                onClick={() => setForm((current) => ({ ...current, screen_after_9pm: false }))}
              >
                No
              </button>
            </div>
          </>
        ) : null}

        {step === 6 ? (
          <>
            <h1 className="section-title">How many hours outdoors each day?</h1>
            <p className="support">Daylight sets your light budget.</p>
            <label className="auth-form__field dash-card" style={{ marginTop: 'var(--stack-lg)' }}>
              <span className="dash-card__label">Outdoor hours</span>
              <input
                className="auth-form__input"
                type="number"
                min={0}
                max={16}
                step={0.5}
                inputMode="decimal"
                value={form.outdoor_hours}
                onChange={(event) =>
                  setForm((current) => ({ ...current, outdoor_hours: event.target.value }))
                }
              />
            </label>
          </>
        ) : null}

        {step === 7 ? (
          <>
            <h1 className="section-title">Are you taking vitamin D3?</h1>
            <p className="support">We store dose only if you answer yes.</p>
            <div className="auth-form" style={{ marginTop: 'var(--stack-lg)' }}>
              <button
                type="button"
                className={`btn ${form.current_d3 === true ? 'btn--primary' : 'btn--outline'}`}
                onClick={() => setForm((current) => ({ ...current, current_d3: true }))}
              >
                Yes
              </button>
              <button
                type="button"
                className={`btn ${form.current_d3 === false ? 'btn--primary' : 'btn--outline'}`}
                onClick={() =>
                  setForm((current) => ({ ...current, current_d3: false, current_d3_dose: '' }))
                }
              >
                No
              </button>
            </div>

            {form.current_d3 ? (
              <label className="auth-form__field dash-card" style={{ marginTop: 'var(--stack-md)' }}>
                <span className="dash-card__label">Daily D3 dose (IU)</span>
                <input
                  className="auth-form__input"
                  type="number"
                  min={0}
                  max={10000}
                  inputMode="numeric"
                  value={form.current_d3_dose}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, current_d3_dose: event.target.value }))
                  }
                />
              </label>
            ) : null}

            <label
              className="auth-form__field dash-card"
              style={{ marginTop: 'var(--stack-md)', display: 'flex', gap: 12, alignItems: 'flex-start' }}
            >
              <input
                type="checkbox"
                checked={form.consented_chronobiobank}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    consented_chronobiobank: event.target.checked,
                  }))
                }
                style={{ marginTop: 4 }}
              />
              <span className="support" style={{ maxWidth: 'none' }}>
                I consent to contribute de-identified data to Chronobiobank.
              </span>
            </label>
          </>
        ) : null}

        {error ? <p className="support auth-form__message">{error}</p> : null}

        <div className="copy-actions">
          {step > 1 ? (
            <button
              type="button"
              className="btn btn--outline"
              disabled={loading}
              onClick={() => {
                setError(null)
                setStep((current) => current - 1)
              }}
            >
              Back
            </button>
          ) : null}
          <button
            type="button"
            className="btn btn--primary"
            disabled={loading}
            onClick={() => void continueStep()}
          >
            {loading ? 'Saving...' : step === STEP_COUNT ? 'See your protocol' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}
