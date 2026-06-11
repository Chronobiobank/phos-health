import type { SupabaseClient } from '@supabase/supabase-js'

import { getShopSku, type ShopSkuId } from '@/lib/shop/catalog'

const FULFILMENT_EMAIL = 'orders@phos.org.uk'

export type FulfilOrderResult = {
  orderId: string
  sku: ShopSkuId
  kitSerial: string
  kitType: 'panel' | 'tiptraq'
  fulfilmentEmail: string
}

export async function fulfilShopOrder(
  supabase: SupabaseClient,
  memberId: string,
  skuId: ShopSkuId,
): Promise<{ result: FulfilOrderResult | null; error: string | null }> {
  const sku = getShopSku(skuId)
  if (!sku) {
    return { result: null, error: 'Unknown product.' }
  }

  const { data: kit, error: kitError } = await supabase
    .from('kits')
    .select('id, serial, kit_type, status')
    .eq('kit_type', sku.kitType)
    .eq('status', 'inventory')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (kitError) {
    return { result: null, error: kitError.message }
  }

  if (!kit) {
    return { result: null, error: `${sku.name} is temporarily out of stock.` }
  }

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      member_id: memberId,
      status: 'confirmed',
      total_pence: sku.pricePence,
      currency: sku.currency,
      fulfilment_email: FULFILMENT_EMAIL,
    })
    .select('id')
    .single()

  if (orderError || !order) {
    return { result: null, error: orderError?.message ?? 'Could not create order.' }
  }

  const { error: itemError } = await supabase.from('order_items').insert({
    order_id: order.id,
    sku: sku.id,
    kit_type: sku.kitType,
    quantity: 1,
    unit_price_pence: sku.pricePence,
    kit_id: kit.id,
  })

  if (itemError) {
    await supabase.from('orders').delete().eq('id', order.id)
    return { result: null, error: itemError.message }
  }

  const { error: assignError } = await supabase.from('kit_assignments').insert({
    kit_id: kit.id,
    member_id: memberId,
  })

  if (assignError) {
    await supabase.from('order_items').delete().eq('order_id', order.id)
    await supabase.from('orders').delete().eq('id', order.id)
    return { result: null, error: assignError.message }
  }

  await supabase.from('kits').update({ status: 'assigned' }).eq('id', kit.id)

  await supabase.from('subscriptions').upsert(
    {
      member_id: memberId,
      tier: sku.tier,
      status: 'active',
    },
    { onConflict: 'member_id' },
  )

  await supabase.from('fulfilment_events').insert({
    order_id: order.id,
    member_id: memberId,
    kit_id: kit.id,
    kit_serial: kit.serial,
    sku: sku.id,
    notify_email: FULFILMENT_EMAIL,
    status: 'queued',
    payload: {
      product: sku.name,
      tier: sku.tierLabel,
      member_id: memberId,
      kit_serial: kit.serial,
    },
  })

  console.info('[Shop] Order confirmed and kit assigned', {
    orderId: order.id,
    memberId,
    sku: sku.id,
    kitSerial: kit.serial,
    notify: FULFILMENT_EMAIL,
  })

  return {
    result: {
      orderId: order.id,
      sku: sku.id,
      kitSerial: kit.serial,
      kitType: kit.kit_type,
      fulfilmentEmail: FULFILMENT_EMAIL,
    },
    error: null,
  }
}
