import type { DailyCueStop, PhosSnapshot } from '@/lib/phos/types'
import type { ShopProtocolSkuId, ShopUpgradeSkuId } from '@/lib/shop/catalog'

export type DailyCueShopLink = {
  id: ShopProtocolSkuId | ShopUpgradeSkuId
  name: string
  detail: string
  href: string
  cta: string
}

function cueStop(stops: DailyCueStop[], icon: DailyCueStop['icon']): DailyCueStop | undefined {
  return stops.find((stop) => stop.icon === icon)
}

export function mealSleepLine(snapshot: PhosSnapshot): string {
  const fuel = cueStop(snapshot.cueTimeline, 'fuel')?.time ?? '19:30'
  const dim = cueStop(snapshot.cueTimeline, 'dim')?.time ?? '21:30'
  return `Fuel by ${fuel} · dim from ${dim}`
}

export function supplementShopLinks(snapshot: PhosSnapshot): DailyCueShopLink[] {
  const anchor = cueStop(snapshot.cueTimeline, 'anchor')?.time ?? snapshot.lightWindow?.start ?? '08:30'
  const dim = cueStop(snapshot.cueTimeline, 'dim')?.time ?? '21:30'

  return [
    {
      id: 'phos-vd3',
      name: 'PHOS VD3',
      detail: `Take with morning light · ${anchor}`,
      href: '/shop#phos-vd3',
      cta: 'Order VD3 →',
    },
    {
      id: 'phos-mg',
      name: 'PHOS MG',
      detail: `Take at wind down · ${dim}`,
      href: '/shop#phos-mg',
      cta: 'Order MG →',
    },
    {
      id: 'phos-core',
      name: 'PHOS CORE',
      detail: `Full stack · ${anchor} and ${dim}`,
      href: '/shop#phos-core',
      cta: 'Order CORE →',
    },
  ]
}

export function measurementShopLinks(snapshot: PhosSnapshot): DailyCueShopLink[] {
  const links: DailyCueShopLink[] = []

  if (snapshot.tier !== 'basic' && snapshot.tier !== 'premium') {
    links.push({
      id: 'photonic-panel',
      name: 'Photonic Panel',
      detail: 'Blood panel for personal light',
      href: '/shop#photonic-panel',
      cta: 'Order panel →',
    })
  }

  if (snapshot.tier !== 'premium') {
    links.push({
      id: 'photonic-sleep-study',
      name: 'Photonic Sleep Study',
      detail: 'Three home nights for premium band',
      href: '/shop#photonic-sleep-study',
      cta: 'Order study →',
    })
  }

  if (links.length === 0) {
    links.push({
      id: 'photonic-panel',
      name: 'Photonic Panel',
      detail: 'Reorder or add a panel read',
      href: '/shop#photonic-panel',
      cta: 'View shop →',
    })
  }

  return links
}
