import { DashboardShellHeader } from '@/components/dashboard/DashboardShellHeader'
import { DashboardShellVideo } from '@/components/dashboard/DashboardShellVideo'

type DashboardShellProps = {
  children: React.ReactNode
  signedIn: boolean
}

export function DashboardShell({ children, signedIn }: DashboardShellProps) {
  return (
    <div className="dashboard-shell dashboard-shell--video">
      <DashboardShellVideo />
      <DashboardShellHeader signedIn={signedIn} />
      <main className="dashboard-shell__main">{children}</main>
    </div>
  )
}
