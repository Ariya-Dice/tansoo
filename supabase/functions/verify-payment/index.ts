import { getSupabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { zibalVerify } from '../_shared/zibal.ts';
import { tomansToRials } from '../_shared/bulkOrderConfig.ts';

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

interface BulkOrderRow {
  id: number;
  status: string;
  zibal_track_id: number | null;
  payment_amount: number | null;
  payment_expires_at: string | null;
  paid_at: string | null;
}

async function expireBulkOrderIfStale(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  bulkOrder: BulkOrderRow,
): Promise<BulkOrderRow> {
  if (bulkOrder.status !== 'pending_payment' || !bulkOrder.payment_expires_at) {
    return bulkOrder;
  }

  if (new Date(bulkOrder.payment_expires_at).getTime() <= Date.now()) {
    await supabase
      .from('bulk_order_requests')
      .update({ status: 'expired' })
      .eq('id', bulkOrder.id)
      .eq('status', 'pending_payment');

    return { ...bulkOrder, status: 'expired' };
  }

  return bulkOrder;
}

async function verifyBulkOrderPayment(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  bulkOrder: BulkOrderRow,
  trackId: number,
  success: string | null,
  requestId: string,
): Promise<Response> {
  const base = frontendBase();
  const successQuery = `bulkOrderId=${bulkOrder.id}`;

  console.log(`[ BULK_PAYMENT ] VERIFY_START requestId=${requestId} bulkOrderId=${bulkOrder.id}`);

  if (bulkOrder.status === 'pending' && bulkOrder.paid_at) {
    console.log(`[ BULK_PAYMENT ] VERIFY_SUCCESS requestId=${requestId} already paid`);
    return redirect(`${base}/#/bulk-order/success?${successQuery}`);
  }

  if (bulkOrder.status === 'expired') {
    return redirect(`${base}/#/payment/failed?${successQuery}&reason=expired`);
  }

  if (bulkOrder.status !== 'pending_payment') {
    return redirect(`${base}/#/payment/failed?${successQuery}&reason=invalid_status`);
  }

  const current = await expireBulkOrderIfStale(supabase, bulkOrder);
  if (current.status === 'expired') {
    return redirect(`${base}/#/payment/failed?${successQuery}&reason=expired`);
  }

  if (success !== '1') {
    return redirect(`${base}/#/payment/failed?${successQuery}`);
  }

  if (current.zibal_track_id != null && Number(current.zibal_track_id) !== trackId) {
    console.error(
      `[ BULK_PAYMENT ] VERIFY_FAIL requestId=${requestId} track mismatch`,
      current.id,
      current.zibal_track_id,
      trackId,
    );
    return redirect(`${base}/#/payment/failed?${successQuery}&reason=track_mismatch`);
  }

  const merchant = Deno.env.get('ZIBAL_MERCHANT');
  if (!merchant) {
    console.error(`[ BULK_PAYMENT ] VERIFY_FAIL requestId=${requestId} ZIBAL_MERCHANT missing`);
    return redirect(`${base}/#/payment/failed?${successQuery}&reason=config`);
  }

  const verify = await zibalVerify({ merchant, trackId });

  if (verify.result !== 100) {
    console.error(`[ BULK_PAYMENT ] VERIFY_FAIL requestId=${requestId} zibal`, verify.result);
    return redirect(`${base}/#/payment/failed?${successQuery}&code=${verify.result}`);
  }

  const expectedRials = tomansToRials(Number(current.payment_amount ?? 0));
  const paidRials = verify.amount != null ? Math.round(Number(verify.amount)) : null;

  if (paidRials != null && paidRials !== expectedRials) {
    console.error(
      `[ BULK_PAYMENT ] VERIFY_FAIL requestId=${requestId} amount mismatch`,
      current.id,
      paidRials,
      expectedRials,
    );
    return redirect(`${base}/#/payment/failed?${successQuery}&reason=amount_mismatch`);
  }

  const paidAt = new Date().toISOString();
  const { data: updated, error: updateError } = await supabase
    .from('bulk_order_requests')
    .update({
      status: 'pending',
      paid_at: paidAt,
    })
    .eq('id', current.id)
    .eq('status', 'pending_payment')
    .select('id, status, paid_at')
    .maybeSingle();

  if (updateError) {
    console.error(`[ BULK_PAYMENT ] VERIFY_FAIL requestId=${requestId} update failed`, updateError.message);
    return redirect(`${base}/#/payment/failed?${successQuery}&reason=server_error`);
  }

  if (!updated) {
    const { data: recheck } = await supabase
      .from('bulk_order_requests')
      .select('id, status, paid_at')
      .eq('id', current.id)
      .maybeSingle();

    if (recheck?.status === 'pending' && recheck.paid_at) {
      console.log(`[ BULK_PAYMENT ] VERIFY_SUCCESS requestId=${requestId} idempotent`);
      return redirect(`${base}/#/bulk-order/success?${successQuery}`);
    }

    return redirect(`${base}/#/payment/failed?${successQuery}&reason=server_error`);
  }

  console.log(`[ BULK_PAYMENT ] VERIFY_SUCCESS requestId=${requestId} bulkOrderId=${current.id}`);
  console.log(`[ BULK_PAYMENT ] ORDER_MARKED_PAID requestId=${requestId} bulkOrderId=${current.id}`);

  return redirect(`${base}/#/bulk-order/success?${successQuery}`);
}

Deno.serve(async (req) => {
  const requestId = crypto.randomUUID();
  const base = frontendBase();

  try {
    const url = new URL(req.url);
    const success = url.searchParams.get('success');
    const trackIdRaw = url.searchParams.get('trackId');
    const orderIdParam = url.searchParams.get('orderId');

    if (!trackIdRaw) {
      return redirect(`${base}/#/payment/failed?reason=missing_track_id`);
    }

    const trackId = Number(trackIdRaw);
    if (!Number.isFinite(trackId)) {
      return redirect(`${base}/#/payment/failed?reason=invalid_track_id`);
    }

    const merchant = Deno.env.get('ZIBAL_MERCHANT');
    if (!merchant) {
      console.error('verify-payment: ZIBAL_MERCHANT not configured');
      return redirect(`${base}/#/payment/failed?reason=config`);
    }

    const supabase = getSupabaseAdmin();

    let order =
      orderIdParam != null && !String(orderIdParam).startsWith('bulk-')
        ? (await supabase.from('orders').select('*').eq('id', orderIdParam).maybeSingle()).data
        : null;

    if (!order) {
      order = (await supabase.from('orders').select('*').eq('zibal_track_id', trackId).maybeSingle()).data;
    }

    if (!order) {
      const bulkOrderIdFromParam =
        orderIdParam != null && String(orderIdParam).startsWith('bulk-')
          ? Number(String(orderIdParam).slice(5))
          : null;

      let bulkOrder: BulkOrderRow | null = null;

      if (bulkOrderIdFromParam != null && Number.isFinite(bulkOrderIdFromParam)) {
        bulkOrder = (
          await supabase
            .from('bulk_order_requests')
            .select('id, status, zibal_track_id, payment_amount, payment_expires_at, paid_at')
            .eq('id', bulkOrderIdFromParam)
            .maybeSingle()
        ).data as BulkOrderRow | null;
      }

      if (!bulkOrder) {
        bulkOrder = (
          await supabase
            .from('bulk_order_requests')
            .select('id, status, zibal_track_id, payment_amount, payment_expires_at, paid_at')
            .eq('zibal_track_id', trackId)
            .maybeSingle()
        ).data as BulkOrderRow | null;
      }

      if (bulkOrder) {
        return verifyBulkOrderPayment(supabase, bulkOrder, trackId, success, requestId);
      }

      return redirect(`${base}/#/payment/failed?reason=order_not_found`);
    }

    const successQuery = `orderId=${order.id}&orderNumber=${encodeURIComponent(order.order_number ?? '')}`;

    if (order.status === 'paid') {
      return redirect(`${base}/#/payment/success?${successQuery}`);
    }

    if (success !== '1') {
      if (order.status === 'pending') {
        await supabase.from('orders').update({ status: 'failed' }).eq('id', order.id);
      }
      return redirect(`${base}/#/payment/failed?orderId=${order.id}`);
    }

    if (order.zibal_track_id != null && Number(order.zibal_track_id) !== trackId) {
      console.error('verify-payment: trackId mismatch', order.id, order.zibal_track_id, trackId);
      await supabase.from('orders').update({ status: 'failed' }).eq('id', order.id);
      return redirect(`${base}/#/payment/failed?orderId=${order.id}&reason=track_mismatch`);
    }

    const verify = await zibalVerify({ merchant, trackId });

    if (verify.result !== 100) {
      console.error('verify-payment: zibal verify failed', order.id, verify.result);
      await supabase.from('orders').update({ status: 'failed' }).eq('id', order.id);
      return redirect(`${base}/#/payment/failed?orderId=${order.id}&code=${verify.result}`);
    }

    const expectedRials = Math.round(Number(order.total_amount) * 10);
    const paidRials = verify.amount != null ? Math.round(Number(verify.amount)) : null;

    if (paidRials != null && paidRials !== expectedRials) {
      console.error('verify-payment: amount mismatch', order.id, paidRials, expectedRials);
      await supabase.from('orders').update({ status: 'failed' }).eq('id', order.id);
      return redirect(`${base}/#/payment/failed?orderId=${order.id}&reason=amount_mismatch`);
    }

    const refNumber = verify.refNumber != null ? String(verify.refNumber) : null;

    const { data: rpcResult, error: rpcError } = await supabase.rpc('complete_order_payment', {
      p_order_id: order.id,
      p_zibal_ref_number: refNumber,
    });

    if (rpcError) {
      console.error('verify-payment: complete_order_payment failed', order.id, rpcError.message);

      if (rpcError.message.includes('insufficient_stock')) {
        await supabase.from('orders').update({ status: 'failed' }).eq('id', order.id);
        return redirect(`${base}/#/payment/failed?orderId=${order.id}&reason=stock`);
      }

      return redirect(`${base}/#/payment/failed?orderId=${order.id}&reason=server_error`);
    }

    if (rpcResult === 'already_paid') {
      return redirect(`${base}/#/payment/success?${successQuery}`);
    }

    return redirect(`${base}/#/payment/success?${successQuery}`);
  } catch (err) {
    console.error('verify-payment error:', err instanceof Error ? err.message : err);
    return redirect(`${base}/#/payment/failed?reason=server_error`);
  }
});
