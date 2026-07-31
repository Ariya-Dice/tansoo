import { handleCors, corsHeaders } from '../_shared/cors.ts';
import { getSupabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { zibalRequest, zibalStartUrl } from '../_shared/zibal.ts';
import {
  clientErrorMessage,
  normalizeOrderItems,
  validateCustomer,
  type CustomerInput,
} from '../_shared/orderValidation.ts';

interface RequestBody {
  customerDetails: CustomerInput;
  items: Array<{ productId: number; quantity: number }>;
  /** @deprecated ignored — server calculates total */
  totalAmount?: number;
}

interface DbProduct {
  id: number;
  model: string;
  goods_type: string;
  type: string;
  color: string;
  price: number;
  stock: number;
}

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const merchant = Deno.env.get('ZIBAL_MERCHANT');
    if (!merchant) {
      console.error('request-payment: ZIBAL_MERCHANT not configured');
      throw new Error('config_error');
    }

    const body = (await req.json()) as RequestBody;
    const customerDetails = validateCustomer(body.customerDetails);
    const lineItems = normalizeOrderItems(body.items);

    const supabase = getSupabaseAdmin();
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!.replace(/\/+$/, '');
    const callbackUrl = `${supabaseUrl}/functions/v1/verify-payment`;

    const productIds = lineItems.map((i) => i.productId);
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, model, goods_type, type, color, price, stock')
      .in('id', productIds);

    if (productsError || !products?.length) {
      console.error('request-payment: products fetch failed', productsError?.message);
      return jsonError('product_not_found', 400);
    }

    const productMap = new Map<number, DbProduct>();
    for (const p of products as DbProduct[]) {
      productMap.set(Number(p.id), p);
    }

    let totalAmount = 0;
    const orderItemsPayload: Array<{
      product_id: number;
      product_model: string;
      product_goods_type: string;
      product_color: string;
      quantity: number;
      unit_price: number;
    }> = [];

    for (const line of lineItems) {
      const product = productMap.get(line.productId);
      if (!product) {
        return jsonError('product_not_found', 400);
      }

      const unitPrice = Number(product.price ?? 0);
      const stock = Number(product.stock ?? 0);

      if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
        return jsonError('invalid_order', 400);
      }
      if (stock < line.quantity) {
        return jsonError('insufficient_stock', 400);
      }

      totalAmount += unitPrice * line.quantity;
      orderItemsPayload.push({
        product_id: line.productId,
        product_model: String(product.model ?? ''),
        product_goods_type: String(product.goods_type || product.type || ''),
        product_color: String(product.color ?? ''),
        quantity: line.quantity,
        unit_price: unitPrice,
      });
    }

    if (totalAmount <= 0) {
      return jsonError('invalid_items', 400);
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_name: customerDetails.name,
        customer_phone: customerDetails.phone,
        customer_email: customerDetails.email ?? '',
        customer_address: customerDetails.address,
        customer_note: customerDetails.note ?? '',
        total_amount: totalAmount,
        status: 'pending',
      })
      .select('id, order_number')
      .single();

    if (orderError || !order) {
      console.error('request-payment: order insert failed', orderError?.message);
      return jsonError('invalid_order', 500);
    }

    const orderItems = orderItemsPayload.map((item) => ({
      order_id: order.id,
      ...item,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);

    if (itemsError) {
      console.error('request-payment: order_items insert failed', itemsError.message);
      await supabase.from('orders').delete().eq('id', order.id);
      return jsonError('invalid_order', 500);
    }

    const amountRials = Math.round(totalAmount * 10);
    const orderLabel = order.order_number ?? order.id;

    const zibal = await zibalRequest({
      merchant,
      amount: amountRials,
      callbackUrl,
      description: `سفارش ${orderLabel}`,
      orderId: order.id,
      mobile: customerDetails.phone,
    });

    if (zibal.result !== 100 || !zibal.trackId) {
      console.error('request-payment: zibal failed', zibal.result, zibal.message);
      await supabase.from('orders').update({ status: 'failed' }).eq('id', order.id);
      return new Response(
        JSON.stringify({
          error: 'خطا در ایجاد تراکنش پرداخت. لطفاً دوباره تلاش کنید.',
        }),
        {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    await supabase
      .from('orders')
      .update({ zibal_track_id: zibal.trackId })
      .eq('id', order.id);

    return new Response(
      JSON.stringify({
        orderId: order.id,
        orderNumber: order.order_number,
        trackId: zibal.trackId,
        paymentUrl: zibalStartUrl(zibal.trackId),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (err) {
    const code = err instanceof Error ? err.message : 'invalid_order';
    console.error('request-payment error:', code);
    const status = code.startsWith('invalid_') || code === 'insufficient_stock' || code === 'product_not_found'
      ? 400
      : 500;
    return jsonError(code, status);
  }
});

function jsonError(code: string, status: number): Response {
  return new Response(
    JSON.stringify({ error: clientErrorMessage(code) }),
    {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    },
  );
}
