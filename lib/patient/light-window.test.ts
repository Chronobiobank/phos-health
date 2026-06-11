import { describe, expect, it } from 'vitest'

import { adjustLightWindowForLocation } from '@/lib/patient/light-window'

describe('adjustLightWindowForLocation', () => {
  it('clamps pre-sunrise Auckland windows to local winter sunrise', () => {
    const adjusted = adjustLightWindowForLocation('04:52', '06:52', 'Pacific/Auckland')

    expect(adjusted.start).toBe('07:15')
    expect(adjusted.end).toBe('09:15')
  })

  it('leaves London windows unchanged when already after sunrise', () => {
    const adjusted = adjustLightWindowForLocation('08:00', '10:00', 'Europe/London')

    expect(adjusted.start).toBe('08:00')
    expect(adjusted.end).toBe('10:00')
  })

  it('does not adjust when timezone is unknown', () => {
    const adjusted = adjustLightWindowForLocation('04:52', '06:52', 'UTC')

    expect(adjusted.start).toBe('04:52')
    expect(adjusted.end).toBe('06:52')
  })
})
