'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { formatPrice, getShopSku, type ShopSkuId } from '@/lib/shop/catalog'

type ShopCheckoutButtonProps = {
  skuId: ShopSkuId
  pricePence: number
  ctaLabel?: string
}

export function ShopCheckoutButton({ skuId, pricePence, ctaLabel }: ShopCheckoutButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const sku = getShopSku(skuId)

  const buttonLabel =
    ctaLabel ??
    (sku?.category === 'protocol' ? 'Start protocol →' : `Order ${formatPrice(pricePence)} →`)

  async function checkout() {
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/shop/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sku: skuId }),
      })
      const payload = (await response.json()) as { error?: string; message?: string; kit_serial?: string }

      if (response.status === 401) {
        router.push(`/auth/signin?next=/shop`)
        return
      }

      if (!response.ok) {
        setMessage(payload.error ?? 'Checkout failed.')
        return
      }

      setMessage(payload.message ?? `Kit ${payload.kit_serial} assigned.`)
      router.refresh()
    } catch {
      setMessage('Checkout failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="shop-checkout">
      <button type="button" className="btn btn--primary shop-page__cta" onClick={checkout} disabled={loading}>
        {loading ? 'Processing…' : buttonLabel}
      </button>
      {message ? <p className="support shop-checkout__message">{message}</p> : null}
    </div>
  )
}
