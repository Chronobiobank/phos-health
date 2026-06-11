import { EmployerShellHeader } from '@/components/org/EmployerShellHeader'

type EmployerShellProps = {
  children: React.ReactNode
  signedIn: boolean
  organisationName?: string
}

export function EmployerShell({ children, signedIn, organisationName }: EmployerShellProps) {
  return (
    <div className="dashboard-shell employer-shell">
      <EmployerShellHeader signedIn={signedIn} />
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
