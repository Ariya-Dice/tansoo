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
    console.log('========== REQUEST PAYMENT START ==========');

    console.log('STEP 1 - Checking Environment Variables');

    const merchant = Deno.env.get('ZIBAL_MERCHANT');
    console.log('ZIBAL_MERCHANT exists:', !!merchant);

    console.log('SUPABASE_URL:', Deno.env.get('SUPABASE_URL'));
    console.log(
      'SUPABASE_SERVICE_ROLE_KEY exists:',
      !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
    );

    if (!merchant) {
      throw new Error('ZIBAL_MERCHANT is not configured');
    }

    console.log('STEP 2 - Reading Request Body');

    const body = (await req.json()) as RequestBody;
    const { customerDetails, items, totalAmount } = body;

    console.log('Customer:', customerDetails);
    console.log('Items:', items);
    console.log('Total Amount:', totalAmount);

    if (
      !customerDetails?.name?.trim() ||
      !customerDetails?.phone?.trim() ||
      !customerDetails?.address?.trim()
    ) {
      return new Response(
        JSON.stringify({ error: 'نام، شماره تماس و آدرس الزامی است' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        },
      );
    }

    if (
      !Array.isArray(items) ||
      items.length === 0 ||
      !Number.isFinite(totalAmount) ||
      totalAmount <= 0
    ) {
      return new Response(
        JSON.stringify({ error: 'سبد خرید نامعتبر است' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        },
      );
    }

    console.log('STEP 3 - Creating Supabase Admin Client');

    const supabase = getSupabaseAdmin();

    console.log('Supabase Admin Client Created');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!.replace(/\/+$/, '');
    const callbackUrl = `${supabaseUrl}/functions/v1/verify-payment`;

    console.log('Callback URL:', callbackUrl);

    console.log('STEP 4 - Creating Order');

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

    console.log('Order Result:', order);
    console.log('Order Error:', orderError);

    if (orderError || !order) {
      throw new Error(orderError?.message ?? 'Failed to create order');
    }

    console.log('STEP 5 - Creating Order Items');

    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      product_model: item.model,
      product_goods_type: item.goodsType,
      product_color: item.color,
      quantity: item.quantity,
      unit_price: item.unitPrice,
    }));

    console.log('Order Items:', orderItems);

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    console.log('Order Items Error:', itemsError);

    if (itemsError) {
      await supabase.from('orders').delete().eq('id', order.id);
      throw new Error(itemsError.message);
    }

    console.log('STEP 6 - Calling Zibal');

    const amountRials = Math.round(totalAmount * 10);

    console.log('Amount (Rials):', amountRials);

    const zibal = await zibalRequest({
      merchant,
      amount: amountRials,
      callbackUrl,
      description: `سفارش ${order.id}`,
      orderId: order.id,
      mobile: customerDetails.phone.trim(),
    });

    console.log('Zibal Response:', zibal);

    if (zibal.result !== 100 || !zibal.trackId) {
      console.log('Zibal Error:', zibal);

      await supabase
        .from('orders')
        .update({ status: 'failed' })
        .eq('id', order.id);

      return new Response(
        JSON.stringify({
          error: zibal.message ?? 'خطا در ایجاد تراکنش زیبال',
          code: zibal.result,
        }),
        {
          status: 502,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        },
      );
    }

    console.log('STEP 7 - Updating Order');

    await supabase
      .from('orders')
      .update({
        zibal_track_id: zibal.trackId,
      })
      .eq('id', order.id);

    console.log('STEP 8 - Success');

    return new Response(
      JSON.stringify({
        orderId: order.id,
        trackId: zibal.trackId,
        paymentUrl: zibalStartUrl(zibal.trackId),
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (err) {
    console.error('========== REQUEST PAYMENT ERROR ==========');
    console.error(err);
    console.error(
      'Message:',
      err instanceof Error ? err.message : String(err),
    );
    console.error('Stack:', err instanceof Error ? err.stack : '');

    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : 'Internal server error',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  }
});