import { describe, expect, it } from 'vitest'

import { mealSleepLine, measurementShopLinks, supplementShopLinks } from '@/lib/daily-cue/schedule'
import { TERRY_MOCK_SNAPSHOT } from '@/lib/phos/mock-snapshot'

describe('daily cue schedule', () => {
  it('builds meal and sleep line from timeline', () => {
    expect(mealSleepLine(TERRY_MOCK_SNAPSHOT)).toMatch(/Fuel by \d{2}:\d{2} · dim from \d{2}:\d{2}/)
  })

  it('links supplements to shop anchors', () => {
    const links = supplementShopLinks(TERRY_MOCK_SNAPSHOT)
    expect(links).toHaveLength(3)
    expect(links[0].href).toBe('/shop#phos-vd3')
    expect(links[1].href).toBe('/shop#phos-mg')
  })

  it('shows sleep study upgrade for premium tier members', () => {
    const premium = { ...TERRY_MOCK_SNAPSHOT, tier: 'premium' as const }
    const links = measurementShopLinks(premium)
    expect(links.some((link) => link.id === 'photonic-sleep-study')).toBe(false)
  })
})
