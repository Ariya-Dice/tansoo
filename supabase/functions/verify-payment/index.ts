import { getSupabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { zibalVerify } from '../_shared/zibal.ts';

function frontendBase(): string {
  const url = Deno.env.get('FRONTEND_URL') ?? 'http://localhost:5173';
  return url.replace(/\/+$/, '');
}

function redirect(path: string): Response {
  return new Response(null, {
    status: 302,
    headers: { Location: path },
  });
}

async function deductStock(orderId: string) {
  const supabase = getSupabaseAdmin();

  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('product_id, quantity')
    .eq('order_id', orderId);

  if (itemsError || !items?.length) {
    throw new Error(itemsError?.message ?? 'Order items not found');
  }

  const required: Record<number, number> = {};
  for (const row of items) {
    const pid = Number(row.product_id);
    const qty = Number(row.quantity);
    required[pid] = (required[pid] ?? 0) + qty;
  }

  for (const [productIdStr, quantity] of Object.entries(required)) {
    const productId = Number(productIdStr);
    const { data: current, error: readError } = await supabase
      .from('products')
      .select('id, stock')
      .eq('id', productId)
      .single();

    if (readError || !current) {
      throw new Error(`Product not found: ${productId}`);
    }

    const currentStock = Number(current.stock ?? 0);
    if (currentStock < quantity) {
      throw new Error(`Insufficient stock for product ${productId}`);
    }

    const nextStock = currentStock - quantity;
    const { data: updated, error: updateError } = await supabase
      .from('products')
      .update({ stock: nextStock })
      .eq('id', productId)
      .eq('stock', currentStock)
      .select('id')
      .maybeSingle();

    if (updateError || !updated) {
      throw new Error(`Stock update conflict for product ${productId}`);
    }
  }
}

Deno.serve(async (req) => {
  const base = frontendBase();

  try {
    const url = new URL(req.url);
    const success = url.searchParams.get('success');
    const trackIdRaw = url.searchParams.get('trackId');
    const orderId = url.searchParams.get('orderId');

    if (!trackIdRaw) {
      return redirect(`${base}/#/payment/failed?reason=missing_track_id`);
    }

    const trackId = Number(trackIdRaw);
    if (!Number.isFinite(trackId)) {
      return redirect(`${base}/#/payment/failed?reason=invalid_track_id`);
    }

    const merchant = Deno.env.get('ZIBAL_MERCHANT');
    if (!merchant) {
      return redirect(`${base}/#/payment/failed?reason=config`);
    }

    const supabase = getSupabaseAdmin();

    let order =
      orderId != null
        ? (await supabase.from('orders').select('*').eq('id', orderId).maybeSingle()).data
        : null;

    if (!order) {
      order = (await supabase.from('orders').select('*').eq('zibal_track_id', trackId).maybeSingle()).data;
    }

    if (!order) {
      return redirect(`${base}/#/payment/failed?reason=order_not_found`);
    }

    if (success !== '1') {
      await supabase.from('orders').update({ status: 'failed' }).eq('id', order.id);
      return redirect(`${base}/#/payment/failed?orderId=${order.id}`);
    }

    const verify = await zibalVerify({ merchant, trackId });

    if (verify.result !== 100) {
      await supabase.from('orders').update({ status: 'failed' }).eq('id', order.id);
      return redirect(`${base}/#/payment/failed?orderId=${order.id}&code=${verify.result}`);
    }

    if (order.status !== 'paid') {
      await deductStock(order.id);

      await supabase
        .from('orders')
        .update({
          status: 'paid',
          zibal_ref_number: verify.refNumber != null ? String(verify.refNumber) : null,
          paid_at: new Date().toISOString(),
        })
        .eq('id', order.id);
    }

    return redirect(`${base}/#/payment/success?orderId=${order.id}`);
  } catch (err) {
    console.error('verify-payment error:', err);
    return redirect(`${base}/#/payment/failed?reason=server_error`);
  }
});
