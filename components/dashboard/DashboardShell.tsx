import { DashboardShellHeader } from '@/components/dashboard/DashboardShellHeader'

type DashboardShellProps = {
  children: React.ReactNode
  signedIn: boolean
}

export function DashboardShell({ children, signedIn }: DashboardShellProps) {
  return (
    <div className="dashboard-shell">
      <DashboardShellHeader signedIn={signedIn} />
      <main className="dashboard-shell__main">{children}</main>
    </div>
  )
}
