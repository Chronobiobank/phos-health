'use client'

import { useState } from 'react'

import { formatGbp } from '@/lib/format-gbp'

export function CostCalculator() {
  const [headcount, setHeadcount] = useState(150)
  const [salary, setSalary] = useState(120000)

  /* Corporate cost: headcount × salary × 0.15 (Hafner et al. 2016 productivity coefficient) */
  const annualCost = headcount * salary * 0.15
  const perPerson = salary * 0.15

  return (
    <div className="calc dash-card">
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
              <span className="calc__field-value">{formatGbp(salary)}</span>
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
        </div>

        <div className="calc__result">
          <div className="calc__output dash-card__nest">
            <span className="label">Estimated annual cost</span>
            <span className="calc__figure">{formatGbp(annualCost)}</span>
            <span className="calc__note">
              {formatGbp(perPerson)} per person · Hafner et al. 2016
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
