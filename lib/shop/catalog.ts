export type ShopSkuId = 'photonic-panel' | 'photonic-sleep-study'

export type ShopSku = {
  id: ShopSkuId
  name: string
  tier: 'basic' | 'premium'
  tierLabel: string
  kitType: 'panel' | 'tiptraq'
  pricePence: number
  currency: 'GBP'
  summary: string
}

export const SHOP_SKUS: ShopSku[] = [
  {
    id: 'photonic-panel',
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
    name: 'Photonic Sleep Study',
    tier: 'premium',
    tierLabel: 'Premium',
    kitType: 'tiptraq',
    pricePence: 24900,
    currency: 'GBP',
    summary: 'Three home nights for your tightest Photonic Age band.',
  },
]

export function getShopSku(id: string): ShopSku | undefined {
  return SHOP_SKUS.find((sku) => sku.id === id)
}

export function formatPrice(pence: number, currency = 'GBP'): string {
  if (currency !== 'GBP') return `${pence / 100} ${currency}`
  return `£${(pence / 100).toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}
