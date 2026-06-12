/** Dia-style flowing gradient blobs behind dashboard shell tiles and nav. */
export function DashboardShellVideo() {
  return (
    <div className="dashboard-shell__backdrop" aria-hidden="true">
      <div className="dashboard-shell__video dashboard-shell__ambient" aria-hidden="true">
        <div className="dashboard-shell__ambient-blob dashboard-shell__ambient-blob--teal" />
        <div className="dashboard-shell__ambient-blob dashboard-shell__ambient-blob--blue" />
        <div className="dashboard-shell__ambient-blob dashboard-shell__ambient-blob--violet" />
        <div className="dashboard-shell__ambient-blob dashboard-shell__ambient-blob--magenta" />
        <div className="dashboard-shell__ambient-blob dashboard-shell__ambient-blob--amber" />
      </div>
    </div>
  )
}
