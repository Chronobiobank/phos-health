/* Marketing version of the DIOS SnapshotHeroRow: Light Time and Dark Time
   cells flanking a Photonic Age over Calendar Age centre stack. */

function CycleCell({
  value,
  unit,
  label,
  note,
}: {
  value: string
  unit: string
  label: string
  note: string
}) {
  return (
    <div className="age-tile__cycle">
      <p className="age-tile__cycle-value">
        {value}
        <span className="age-tile__cycle-unit">{unit}</span>
      </p>
      <p className="label">{label}</p>
      <p className="age-tile__note">{note}</p>
    </div>
  )
}

export function PhotonicAgeTile() {
  return (
    <div style={{ margin: '40px 0 0' }}>
      <div className="age-tile">
        <CycleCell value="2.9" unit="h" label="Light Time" note="bright light per day" />

        <div className="age-tile__centre">
          <p className="age-tile__primary" aria-label="Photonic Age 47.2">
            47.2
          </p>
          <p className="label">Photonic Age</p>
          <p className="age-tile__note" style={{ color: 'var(--stellar)' }}>
            4.2 years lost to hibernation
          </p>

          <hr className="age-tile__rule" aria-hidden />

          <p className="age-tile__secondary" aria-label="Calendar Age 43">
            43
          </p>
          <p className="label">Calendar Age</p>
        </div>

        <CycleCell value="6.8" unit="h" label="Dark Time" note="true dark per night" />
      </div>

      <p className="label" style={{ textAlign: 'center', marginTop: '24px' }}>
        Example: senior professional, London, 43 · three-night TipTraQ study
      </p>
    </div>
  )
}
