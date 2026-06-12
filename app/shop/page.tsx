import type { Metadata } from 'next'
import Link from 'next/link'

import { DashboardPanel, DashboardPanelTiles } from '@/components/dashboard/DashboardPanel'
import { ShopCheckoutButton } from '@/components/shop/ShopCheckoutButton'
import { formatSkuPrice, SHOP_PROTOCOL_SKUS, SHOP_UPGRADE_SKUS } from '@/lib/shop/catalog'

export const metadata: Metadata = {
  title: 'Shop · PHOS',
  description: 'Protocol supplements and Photonic Age upgrades.',
}

export default function ShopPage() {
  return (
    <section className="dashboard-page shop-page">
      <div className="container dashboard-page__content">
        <div className="phos-dashboard">
          <DashboardPanel
            eyebrow="Your protocol"
            title="Start your supplement stack"
            lede="Monthly protocols timed to your Photonic Age score. No Stripe yet."
          >
            <DashboardPanelTiles columns={3} className="shop-page__grid shop-page__grid--three">
              {SHOP_PROTOCOL_SKUS.map((sku) => (
                <article key={sku.id} id={sku.id} className="dash-card dash-tile shop-page__card">
                  <h2 className="display-md">{sku.name}</h2>
                  <p className="support">{sku.summary}</p>
                  <p className="shop-page__price">{formatSkuPrice(sku)}</p>
                  <ShopCheckoutButton
                    skuId={sku.id}
                    pricePence={sku.pricePence}
                    ctaLabel="Start protocol →"
                  />
                </article>
              ))}
            </DashboardPanelTiles>
          </DashboardPanel>

          <DashboardPanel
            eyebrow="Upgrades"
            title="Tighten your confidence band"
            lede="Same metric, narrower band, kit binds at purchase."
            titleAs="h2"
          >
            <DashboardPanelTiles columns={3} className="shop-page__grid">
              {SHOP_UPGRADE_SKUS.map((sku) => (
                <article key={sku.id} id={sku.id} className="dash-card dash-tile shop-page__card">
                  <p className="eyebrow">{sku.tierLabel}</p>
                  <h3 className="display-md">{sku.name}</h3>
                  <p className="shop-page__price">{formatSkuPrice(sku)}</p>
                  <p className="support">{sku.summary}</p>
                  <ShopCheckoutButton skuId={sku.id} pricePence={sku.pricePence} />
                </article>
              ))}
            </DashboardPanelTiles>
          </DashboardPanel>

          <DashboardPanel
            lede="Order confirmation is sent to orders@phos.org.uk for fulfilment."
            footer={
              <>
                <Link href="/protocol" className="btn btn--outline">
                  Back to protocol
                </Link>
                <Link href="/dashboard" className="btn btn--outline">
                  Back to dashboard
                </Link>
              </>
            }
          />
        </div>
      </div>
    </section>
  )
}
