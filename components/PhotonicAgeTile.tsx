function Operand({ value, label }: { value: string; label: string }) {
  return (
    <div className="age-tile__operand">
      <p className="age-tile__cycle-value">{value}</p>
      <p className="age-tile__caption">{label}</p>
    </div>
  )
}

export function PhotonicAgeTile() {
  return (
    <div
      className="photonic-age-panel__tile"
      aria-label="2.9 Light Years plus 1.3 Dark Years equals 4.2 years lost to hibernation. Photonic Age 47.2, Calendar Age 43."
    >
      <div className="age-tile age-tile--equation">
        <div className="age-tile__formula">
          <Operand value="2.9" label="Light Years" />
          <span className="age-tile__op" aria-hidden="true">
            +
          </span>
          <Operand value="1.3" label="Dark Years" />
          <span className="age-tile__op" aria-hidden="true">
            =
          </span>
          <div className="age-tile__lost">
            <p className="age-tile__cycle-value">4.2</p>
            <p className="age-tile__note age-tile__note--accent">years lost to hibernation</p>
          </div>
        </div>

        <div className="age-tile__outcome">
          <p className="age-tile__primary">47.2</p>
          <p className="age-tile__caption">Photonic Age</p>
          <p className="age-tile__ref">(Calendar Age 43)</p>
        </div>
      </div>
    </div>
  )
}
