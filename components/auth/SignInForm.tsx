'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'

import { createClient } from '@/lib/supabase/client'

function SignInFields() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/onboarding'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setMessage(null)

    const supabase = createClient()

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      setLoading(false)
      if (error) {
        setMessage(error.message)
        return
      }
      setMessage('Account created. Check your email if confirmation is required, then sign in.')
      setMode('signin')
      return
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)

    if (error) {
      setMessage(error.message)
      return
    }

    router.push(next)
    router.refresh()
  }

  return (
    <main className="auth-page">
      <div className="container auth-page__content">
        <h1 className="section-title">Sign in to PHOS</h1>
        <p className="support">Upload and process TipTraQ nights.</p>

        <form className="auth-form dash-card" onSubmit={(event) => void handleSubmit(event)}>
          <label className="auth-form__field">
            <span className="dash-card__label">Email</span>
            <input
              className="auth-form__input"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label className="auth-form__field">
            <span className="dash-card__label">Password</span>
            <input
              className="auth-form__input"
              type="password"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          {message ? <p className="support auth-form__message">{message}</p> : null}

          <button type="submit" className="btn btn--primary auth-form__submit" disabled={loading}>
            {loading ? 'Working...' : mode === 'signup' ? 'Create account' : 'Sign in'}
          </button>

          <button
            type="button"
            className="btn btn--outline auth-form__toggle"
            onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}
          >
            {mode === 'signup' ? 'Already have an account?' : 'Need an account?'}
          </button>
        </form>

        <Link href="/dashboard" className="btn btn--outline auth-page__back">
          Back to dashboard
        </Link>
      </div>
    </main>
  )
}

export function SignInForm() {
  return (
    <Suspense
      fallback={
        <main className="auth-page">
          <div className="container auth-page__content">
            <p className="support">Loading...</p>
          </div>
        </main>
      }
    >
      <SignInFields />
    </Suspense>
  )
}
