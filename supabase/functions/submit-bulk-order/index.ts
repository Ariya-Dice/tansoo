import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface BulkOrderBody {
  name?: string;
  phone?: string;
  company?: string;
  goodsType?: string;
  quantity?: string;
  note?: string;
}

function jsonResponse(
  body: Record<string, unknown>,
  status = 200,
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method !== 'POST') {
    return jsonResponse(
      {
        error: 'Method not allowed',
      },
      405,
    );
  }

  try {
    const body = (await req.json()) as BulkOrderBody;

    const name = String(body.name ?? '').trim();
    const phone = String(body.phone ?? '').trim();
    const company = String(body.company ?? '').trim();
    const goodsType = String(body.goodsType ?? '').trim();
    const quantity = String(body.quantity ?? '').trim();
    const note = String(body.note ?? '').trim();

    // Validation
    if (!name) {
      return jsonResponse(
        {
          error: 'نام و نام خانوادگی الزامی است.',
        },
        400,
      );
    }

    if (!phone) {
      return jsonResponse(
        {
          error: 'شماره تماس الزامی است.',
        },
        400,
      );
    }

    if (!goodsType) {
      return jsonResponse(
        {
          error: 'نوع کالا مشخص نشده است.',
        },
        400,
      );
    }

    if (!quantity) {
      return jsonResponse(
        {
          error: 'تعداد سفارش مشخص نشده است.',
        },
        400,
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get(
      'SUPABASE_SERVICE_ROLE_KEY',
    );

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error(
        'Supabase environment variables are missing.',
      );

      return jsonResponse(
        {
          error: 'تنظیمات سرور کامل نیست.',
        },
        500,
      );
    }

    /*
     * Service Role:
     * فقط داخل Edge Function استفاده می‌شود.
     * هرگز این کلید را داخل فرانت‌اند قرار نده.
     */
    const supabase = createClient(
      supabaseUrl,
      supabaseServiceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    const { data, error } = await supabase
      .from('bulk_order_requests')
      .insert({
        name,
        phone,
        company,
        goods_type: goodsType,
        quantity,
        note,
        status: 'pending',
      })
      .select(
        'id,name,phone,company,goods_type,quantity,note,status,created_at',
      )
      .single();

    if (error) {
      console.error(
        'Database insert error:',
        error,
      );

      return jsonResponse(
        {
          error: 'ثبت سفارش در دیتابیس انجام نشد.',
        },
        500,
      );
    }

    console.log(
      `Bulk order created successfully. ID: ${data.id}`,
    );

    return jsonResponse({
      success: true,
      message: 'سفارش با موفقیت ثبت شد.',
      order: data,
    });
  } catch (error) {
    console.error(
      'submit-bulk-order error:',
      error,
    );

    return jsonResponse(
      {
        error: 'خطا در پردازش درخواست.',
      },
      500,
    );
  }
});