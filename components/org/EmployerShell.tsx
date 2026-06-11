import Link from 'next/link'

import Wordmark from '@/components/Wordmark'

type EmployerShellProps = {
  children: React.ReactNode
  signedIn: boolean
  organisationName?: string
}

export function EmployerShell({ children, signedIn, organisationName }: EmployerShellProps) {
  return (
    <div className="dashboard-shell employer-shell">
      <header className="dashboard-shell__bar">
        <div className="container dashboard-shell__inner">
          <Link href="/org" className="dashboard-shell__logo" aria-label="PHOS employer dashboard">
            <Wordmark />
          </Link>
          <nav className="dashboard-shell__nav" aria-label="Employer">
            <Link href="/org" className="dashboard-shell__link">
              Cohort
            </Link>
            <Link href="/for-firms" className="dashboard-shell__link">
              Model
            </Link>
            <Link href="/dashboard" className="dashboard-shell__link">
              My profile
            </Link>
            {signedIn ? (
              <form action="/auth/signout" method="post">
                <button type="submit" className="dashboard-shell__link dashboard-shell__signout">
                  Sign out
                </button>
              </form>
            ) : (
              <Link href="/auth/signin?next=/org" className="dashboard-shell__link">
                Sign in
              </Link>
            )}
          </nav>
        </div>
      </header>
      {organisationName ? (
        <div className="employer-shell__org-bar">
          <div className="container">
            <p className="employer-shell__org-name">{organisationName}</p>
          </div>
        </div>
      ) : null}
      <main className="dashboard-shell__main">{children}</main>
    </div>
  )
}
