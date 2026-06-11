import { NextResponse } from 'next/server'

import { ensureMemberRecord } from '@/lib/phos/sync-photonic-profile'
import type { ShopSkuId } from '@/lib/shop/catalog'
import { fulfilShopOrder } from '@/lib/shop/fulfil-order'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

type CheckoutBody = {
  sku?: string
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Sign in required.' }, { status: 401 })
  }

  let body: CheckoutBody = {}
  try {
    body = (await request.json()) as CheckoutBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const sku = body.sku as ShopSkuId | undefined
  if (!sku || (sku !== 'photonic-panel' && sku !== 'photonic-sleep-study')) {
    return NextResponse.json({ error: 'Invalid product.' }, { status: 400 })
  }

  await ensureMemberRecord(supabase, user.id, user.user_metadata?.full_name as string | undefined)

  let admin
  try {
    admin = createAdminClient()
  } catch {
    return NextResponse.json({ error: 'Checkout is not configured.' }, { status: 503 })
  }

  const { result, error } = await fulfilShopOrder(admin, user.id, sku)

  if (error || !result) {
    return NextResponse.json({ error: error ?? 'Checkout failed.' }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    order_id: result.orderId,
    sku: result.sku,
    kit_serial: result.kitSerial,
    kit_type: result.kitType,
    fulfilment_email: result.fulfilmentEmail,
    message: `Order confirmed. Kit ${result.kitSerial} is bound to your profile. ${result.fulfilmentEmail} will arrange fulfilment.`,
  })
}
