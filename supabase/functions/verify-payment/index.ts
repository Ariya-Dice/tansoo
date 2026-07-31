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

Deno.serve(async (req) => {
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
      orderIdParam != null
        ? (await supabase.from('orders').select('*').eq('id', orderIdParam).maybeSingle()).data
        : null;

    if (!order) {
      order = (await supabase.from('orders').select('*').eq('zibal_track_id', trackId).maybeSingle()).data;
    }

    if (!order) {
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
