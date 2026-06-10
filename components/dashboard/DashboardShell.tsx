import Link from 'next/link'

import Wordmark from '@/components/Wordmark'

type DashboardShellProps = {
  children: React.ReactNode
  signedIn: boolean
}

export function DashboardShell({ children, signedIn }: DashboardShellProps) {
  return (
    <div className="dashboard-shell">
      <header className="dashboard-shell__bar">
        <div className="container dashboard-shell__inner">
          <Link href="/dashboard" className="dashboard-shell__logo" aria-label="PHOS dashboard">
            <Wordmark />
          </Link>
          <nav className="dashboard-shell__nav" aria-label="Dashboard">
            <Link href="/dashboard" className="dashboard-shell__link">
              Overview
            </Link>
            <Link href="/dashboard/streams" className="dashboard-shell__link">
              Upload nights
            </Link>
            {signedIn ? (
              <form action="/auth/signout" method="post">
                <button type="submit" className="dashboard-shell__link dashboard-shell__signout">
                  Sign out
                </button>
              </form>
            ) : (
              <Link href="/auth/signin" className="dashboard-shell__link">
                Sign in
              </Link>
            )}
          </nav>
        </div>
      </header>
      <main className="dashboard-shell__main">{children}</main>
    </div>
  )
}
