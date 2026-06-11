import type { Metadata } from 'next'
import Link from 'next/link'

import { ShopCheckoutButton } from '@/components/shop/ShopCheckoutButton'
import { formatPrice, SHOP_SKUS } from '@/lib/shop/catalog'

export const metadata: Metadata = {
  title: 'Shop · PHOS',
  description: 'Photonic Panel and Photonic Sleep Study upgrades.',
}

export default function ShopPage() {
  return (
    <section className="dashboard-page shop-page">
      <div className="container dashboard-page__content">
        <p className="eyebrow">Upgrades</p>
        <h1 className="section-title dashboard-page__title">Tighten your confidence band</h1>
        <p className="support dashboard-page__lede">
          Same metric, narrower band, kit binds at purchase.
        </p>

        <div className="shop-page__grid">
          {SHOP_SKUS.map((sku) => (
            <article key={sku.id} className="dash-card shop-page__card">
              <p className="eyebrow">{sku.tierLabel}</p>
              <h2 className="display-md">{sku.name}</h2>
              <p className="shop-page__price">{formatPrice(sku.pricePence)}</p>
              <p className="support">{sku.summary}</p>
              <ShopCheckoutButton skuId={sku.id} pricePence={sku.pricePence} />
            </article>
          ))}
        </div>

        <p className="support shop-page__fulfilment">
          Order confirmation is sent to orders@phos.org.uk for fulfilment.
        </p>

        <div className="copy-actions">
          <Link href="/dashboard" className="btn btn--outline">
            Back to dashboard
          </Link>
        </div>
      </div>
    </section>
  )
}
