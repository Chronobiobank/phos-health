export type ShopUpgradeSkuId = 'photonic-panel' | 'photonic-sleep-study'

export type ShopProtocolSkuId = 'phos-vd3' | 'phos-mg' | 'phos-core'

export type ShopSkuId = ShopUpgradeSkuId | ShopProtocolSkuId

export type ShopSkuCategory = 'upgrade' | 'protocol'

export type ShopKitType = 'panel' | 'tiptraq' | 'supplement'

export type ShopSku = {
  id: ShopSkuId
  category: ShopSkuCategory
  name: string
  tier?: 'basic' | 'premium'
  tierLabel?: string
  kitType: ShopKitType
  pricePence: number
  currency: 'GBP'
  summary: string
  billingPeriod?: 'month'
}

export const SHOP_PROTOCOL_SKUS: ShopSku[] = [
  {
    id: 'phos-vd3',
    category: 'protocol',
    name: 'PHOS VD3',
    kitType: 'supplement',
    pricePence: 2200,
    currency: 'GBP',
    billingPeriod: 'month',
    summary: 'Vitamin D3 timed to your morning light cue.',
  },
  {
    id: 'phos-mg',
    category: 'protocol',
    name: 'PHOS MG',
    kitType: 'supplement',
    pricePence: 1800,
    currency: 'GBP',
    billingPeriod: 'month',
    summary: 'Magnesium aligned to your evening wind-down window.',
  },
  {
    id: 'phos-core',
    category: 'protocol',
    name: 'PHOS CORE',
    kitType: 'supplement',
    pricePence: 4800,
    currency: 'GBP',
    billingPeriod: 'month',
    summary: 'Full daily stack built around your Photonic Age.',
  },
]

export const SHOP_UPGRADE_SKUS: ShopSku[] = [
  {
    id: 'photonic-panel',
    category: 'upgrade',
    name: 'Photonic Panel',
    tier: 'basic',
    tierLabel: 'Basic',
    kitType: 'panel',
    pricePence: 14900,
    currency: 'GBP',
    summary: 'Lab vitamin D panel for a tighter personal light read.',
  },
  {
    id: 'photonic-sleep-study',
    category: 'upgrade',
    name: 'Photonic Sleep Study',
    tier: 'premium',
    tierLabel: 'Premium',
    kitType: 'tiptraq',
    pricePence: 24900,
    currency: 'GBP',
    summary: 'Three home nights for your tightest Photonic Age band.',
  },
]

/** @deprecated Use SHOP_UPGRADE_SKUS */
export const SHOP_SKUS = SHOP_UPGRADE_SKUS

export const SHOP_ALL_SKUS: ShopSku[] = [...SHOP_PROTOCOL_SKUS, ...SHOP_UPGRADE_SKUS]

export function getShopSku(id: string): ShopSku | undefined {
  return SHOP_ALL_SKUS.find((sku) => sku.id === id)
}

export function formatPrice(pence: number, currency = 'GBP'): string {
  if (currency !== 'GBP') return `${pence / 100} ${currency}`
  return `£${(pence / 100).toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

export function formatSkuPrice(sku: ShopSku): string {
  const price = formatPrice(sku.pricePence, sku.currency)
  return sku.billingPeriod === 'month' ? `${price}/month` : price
}
