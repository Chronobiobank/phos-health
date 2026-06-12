/** Full-viewport loop behind dashboard shell tiles and nav. */
export function DashboardShellVideo() {
  return (
    <div className="dashboard-shell__backdrop" aria-hidden="true">
      <video
        className="dashboard-shell__video"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
      >
        <source src="/first-light.mp4" type="video/mp4" />
      </video>
    </div>
  )
}
