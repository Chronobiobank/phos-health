'use client'

import { useState } from 'react'

const gbp = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  maximumFractionDigits: 0,
})

export function CostCalculator() {
  const [headcount, setHeadcount] = useState(150)
  const [salary, setSalary] = useState(120000)
  const [lostYears, setLostYears] = useState(3.8)

  /* Corporate cost formula: Lost Light Years × annual salary × 0.15, per person */
  const annualCost = headcount * salary * 0.15 * lostYears

  return (
    <div className="calc">
      <div className="calc__header">Model your firm</div>
      <div className="calc__body">
        <div className="calc__inputs">
          <div className="calc__field">
            <div className="calc__field-row">
              <span className="label">Senior professionals</span>
              <span className="calc__field-value">{headcount}</span>
            </div>
            <input
              type="range"
              min={50}
              max={500}
              step={10}
              value={headcount}
              aria-label="Number of senior professionals"
              onChange={(e) => setHeadcount(Number(e.target.value))}
            />
          </div>

          <div className="calc__field">
            <div className="calc__field-row">
              <span className="label">Average annual salary</span>
              <span className="calc__field-value">{gbp.format(salary)}</span>
            </div>
            <input
              type="range"
              min={60000}
              max={300000}
              step={5000}
              value={salary}
              aria-label="Average annual salary"
              onChange={(e) => setSalary(Number(e.target.value))}
            />
          </div>

          <div className="calc__field">
            <div className="calc__field-row">
              <span className="label">Average Lost Light Years</span>
              <span className="calc__field-value">{lostYears.toFixed(1)} yrs</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={6}
              step={0.1}
              value={lostYears}
              aria-label="Average Lost Light Years"
              onChange={(e) => setLostYears(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="calc__output">
          <span className="label">Estimated annual cost</span>
          <span className="calc__figure">{gbp.format(annualCost)}</span>
          <span className="calc__note">
            Lost Light Years × salary × 0.15 · Hafner et al. (2016)
          </span>
        </div>
      </div>
    </div>
  )
}
