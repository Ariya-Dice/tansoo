import { handleCors, corsHeaders } from '../_shared/cors.ts';
import { getSupabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { zibalRequest, zibalStartUrl } from '../_shared/zibal.ts';

interface CartItemInput {
  productId: number;
  model: string;
  goodsType: string;
  color: string;
  quantity: number;
  unitPrice: number;
}

interface RequestBody {
  customerDetails: {
    name: string;
    phone: string;
    email?: string;
    address: string;
    note?: string;
  };
  items: CartItemInput[];
  totalAmount: number;
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
      throw new Error('ZIBAL_MERCHANT is not configured');
    }

    const body = (await req.json()) as RequestBody;
    const { customerDetails, items, totalAmount } = body;

    if (!customerDetails?.name?.trim() || !customerDetails?.phone?.trim() || !customerDetails?.address?.trim()) {
      return new Response(JSON.stringify({ error: 'نام، شماره تماس و آدرس الزامی است' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!Array.isArray(items) || items.length === 0 || !Number.isFinite(totalAmount) || totalAmount <= 0) {
      return new Response(JSON.stringify({ error: 'سبد خرید نامعتبر است' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = getSupabaseAdmin();
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!.replace(/\/+$/, '');
    const callbackUrl = `${supabaseUrl}/functions/v1/verify-payment`;

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_name: customerDetails.name.trim(),
        customer_phone: customerDetails.phone.trim(),
        customer_email: (customerDetails.email ?? '').trim(),
        customer_address: customerDetails.address.trim(),
        customer_note: (customerDetails.note ?? '').trim(),
        total_amount: totalAmount,
        status: 'pending',
      })
      .select('id')
      .single();

    if (orderError || !order) {
      throw new Error(orderError?.message ?? 'Failed to create order');
    }

    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      product_model: item.model,
      product_goods_type: item.goodsType,
      product_color: item.color,
      quantity: item.quantity,
      unit_price: item.unitPrice,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    if (itemsError) {
      await supabase.from('orders').delete().eq('id', order.id);
      throw new Error(itemsError.message);
    }

    // Zibal expects amount in Rials; storefront prices are in Toman.
    const amountRials = Math.round(totalAmount * 10);

    const zibal = await zibalRequest({
      merchant,
      amount: amountRials,
      callbackUrl,
      description: `سفارش ${order.id}`,
      orderId: order.id,
      mobile: customerDetails.phone.trim(),
    });

    if (zibal.result !== 100 || !zibal.trackId) {
      await supabase.from('orders').update({ status: 'failed' }).eq('id', order.id);
      return new Response(
        JSON.stringify({ error: zibal.message ?? 'خطا در ایجاد تراکنش زیبال', code: zibal.result }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    await supabase
      .from('orders')
      .update({ zibal_track_id: zibal.trackId })
      .eq('id', order.id);

    return new Response(
      JSON.stringify({
        orderId: order.id,
        trackId: zibal.trackId,
        paymentUrl: zibalStartUrl(zibal.trackId),
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('request-payment error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
