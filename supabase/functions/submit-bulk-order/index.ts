import { handleCors, corsHeaders } from '../_shared/cors.ts';
import { getSupabaseAdmin } from '../_shared/supabaseAdmin.ts';
import {
  getBulkOrderDepositAmountTomans,
  getRateLimitIpHours,
  getRateLimitIpMax,
  getRateLimitPhoneHours,
  getRateLimitPhoneMax,
} from '../_shared/bulkOrderConfig.ts';

const PHONE_RE = /^09\d{9}$/;

interface BulkOrderBody {
  action?: string;
  name?: string;
  phone?: string;
  company?: string;
  goodsType?: string;
  quantity?: string;
  note?: string;
  idempotencyKey?: string;
}

interface BulkOrderRow {
  id: number;
  name: string;
  phone: string;
  company: string;
  goods_type: string;
  quantity: string;
  note: string;
  status: string;
  created_at: string;
  zibal_track_id: number | null;
  payment_amount: number | null;
  payment_expires_at: string | null;
  paid_at: string | null;
  idempotency_key: string | null;
}

interface OrderDetails {
  name: string;
  company: string;
  goodsType: string;
  quantity: string;
  note: string;
}

function jsonResponse(
  body: Record<string, unknown>,
  status = 200,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

function depositConfigResponse(requestId: string): Response {
  try {
    const depositAmount = getBulkOrderDepositAmountTomans();

    return jsonResponse({
      depositAmount,
    });
  } catch {
    console.error(
      `[ BULK_ORDER ] CONFIG requestId=${requestId} deposit not configured`,
    );

    return jsonResponse(
      {
        error: 'تنظیمات سپرده ثبت‌نام پیکربندی نشده است.',
      },
      500,
    );
  }
}

function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '');

  let phone = digits;

  if (phone.startsWith('98') && phone.length === 12) {
    phone = `0${phone.slice(2)}`;
  } else if (phone.startsWith('9') && phone.length === 10) {
    phone = `0${phone}`;
  }

  return PHONE_RE.test(phone) ? phone : null;
}

function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');

  if (forwarded) {
    return forwarded.split(',')[0]?.trim() ?? '';
  }

  return req.headers.get('x-real-ip')?.trim() ?? '';
}

function generateRequestId(): string {
  return crypto.randomUUID();
}

function normalizeOrderValue(value: string | null | undefined): string {
  return String(value ?? '').trim();
}

function orderDetailsMatch(
  order: BulkOrderRow,
  requested: OrderDetails,
): boolean {
  return (
    normalizeOrderValue(order.name) === normalizeOrderValue(requested.name) &&
    normalizeOrderValue(order.company) ===
      normalizeOrderValue(requested.company) &&
    normalizeOrderValue(order.goods_type) ===
      normalizeOrderValue(requested.goodsType) &&
    normalizeOrderValue(order.quantity) ===
      normalizeOrderValue(requested.quantity) &&
    normalizeOrderValue(order.note) === normalizeOrderValue(requested.note)
  );
}

function orderSuccessResponse(
  order: BulkOrderRow,
) {
  return {
    bulkOrderId: order.id,
    status: order.status,
  };
}

async function expireStalePendingOrders(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  phone?: string,
): Promise<void> {
  let query = supabase
    .from('bulk_order_requests')
    .update({
      status: 'expired',
    })
    .eq('status', 'pending_payment')
    .lt(
      'payment_expires_at',
      new Date().toISOString(),
    );

  if (phone) {
    query = query.eq('phone', phone);
  }

  await query;
}

async function checkRateLimits(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  phone: string,
  clientIp: string,
  requestId: string,
): Promise<Response | null> {
  const phoneSince = new Date(
    Date.now() -
      getRateLimitPhoneHours() *
        60 *
        60 *
        1000,
  ).toISOString();

  const {
    count: phoneCount,
    error: phoneError,
  } = await supabase
    .from('bulk_order_requests')
    .select('id', {
      count: 'exact',
      head: true,
    })
    .eq('phone', phone)
    .gte('created_at', phoneSince);

  if (phoneError) {
    console.error(
      `[ BULK_ORDER ] RATE_LIMIT_CHECK requestId=${requestId} phone query failed`,
      phoneError.message,
    );

    return jsonResponse(
      {
        error: 'خطا در بررسی محدودیت درخواست.',
      },
      500,
    );
  }

  if (
    (phoneCount ?? 0) >=
    getRateLimitPhoneMax()
  ) {
    console.log(
      `[ BULK_ORDER ] RATE_LIMIT_CHECK requestId=${requestId} phone limit exceeded phone=${phone}`,
    );

    return jsonResponse(
      {
        error:
          'تعداد درخواست‌های شما در ۲۴ ساعت گذشته بیش از حد مجاز است. لطفاً بعداً تلاش کنید.',
      },
      429,
    );
  }

  if (!clientIp) {
    return null;
  }

  const ipSince = new Date(
    Date.now() -
      getRateLimitIpHours() *
        60 *
        60 *
        1000,
  ).toISOString();

  const {
    count: ipCount,
    error: ipError,
  } = await supabase
    .from('bulk_order_requests')
    .select('id', {
      count: 'exact',
      head: true,
    })
    .eq('client_ip', clientIp)
    .gte('created_at', ipSince);

  if (ipError) {
    console.error(
      `[ BULK_ORDER ] RATE_LIMIT_CHECK requestId=${requestId} ip query failed`,
      ipError.message,
    );

    return jsonResponse(
      {
        error: 'خطا در بررسی محدودیت درخواست.',
      },
      500,
    );
  }

  if (
    (ipCount ?? 0) >=
    getRateLimitIpMax()
  ) {
    console.log(
      `[ BULK_ORDER ] RATE_LIMIT_CHECK requestId=${requestId} ip limit exceeded`,
    );

    return jsonResponse(
      {
        error:
          'تعداد درخواست‌ها از این شبکه بیش از حد مجاز است. لطفاً بعداً تلاش کنید.',
      },
      429,
    );
  }

  console.log(
    `[ BULK_ORDER ] RATE_LIMIT_CHECK requestId=${requestId} ok`,
  );

  return null;
}

async function cancelLegacyPendingPaymentOrders(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  phone: string,
  requestId: string,
): Promise<void> {
  const { error } = await supabase
    .from('bulk_order_requests')
    .update({
      status: 'cancelled',
    })
    .eq('phone', phone)
    .eq('status', 'pending_payment');

  if (error) {
    console.error(
      `[ BULK_ORDER ] CANCEL_LEGACY_PAYMENT requestId=${requestId} failed`,
      error.message,
    );
  }
}

async function findRecentPendingOrder(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  phone: string,
): Promise<BulkOrderRow | null> {
  const {
    data,
    error,
  } = await supabase
    .from('bulk_order_requests')
    .select('*')
    .eq('phone', phone)
    .eq('status', 'pending')
    .order('created_at', {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error(
      '[ BULK_ORDER ] RECENT_PENDING_CHECK failed',
      error.message,
    );

    return null;
  }

  return (data as BulkOrderRow | null) ?? null;
}

Deno.serve(async (req) => {
  const startedAt = Date.now();
  const requestId = generateRequestId();

  const cors = handleCors(req);

  if (cors) {
    return cors;
  }

  if (req.method === 'GET') {
    return depositConfigResponse(requestId);
  }

  if (req.method !== 'POST') {
    return jsonResponse(
      {
        error: 'Method not allowed',
      },
      405,
    );
  }

  let body: BulkOrderBody;

  try {
    body = (await req.json()) as BulkOrderBody;
  } catch {
    return jsonResponse(
      {
        error: 'درخواست نامعتبر است.',
      },
      400,
    );
  }

  if (body.action === 'getConfig') {
    return depositConfigResponse(requestId);
  }

  console.log(
    `[ BULK_ORDER ] START requestId=${requestId}`,
  );

  try {
    const name = String(
      body.name ?? '',
    ).trim();

    const company = String(
      body.company ?? '',
    ).trim();

    const goodsType = String(
      body.goodsType ?? '',
    ).trim();

    const quantity = String(
      body.quantity ?? '',
    ).trim();

    const note = String(
      body.note ?? '',
    ).trim();

    const idempotencyKey =
      String(
        body.idempotencyKey ?? '',
      ).trim() || null;

    const phone = normalizePhone(
      String(
        body.phone ?? '',
      ).trim(),
    );

    const clientIp = getClientIp(req);

    if (!name || name.length > 120) {
      return jsonResponse(
        {
          error:
            'نام و نام خانوادگی الزامی است.',
        },
        400,
      );
    }

    if (!phone) {
      return jsonResponse(
        {
          error:
            'شماره موبایل باید با 09 شروع شود و ۱۱ رقم باشد.',
        },
        400,
      );
    }

    if (!goodsType) {
      return jsonResponse(
        {
          error:
            'نوع کالا مشخص نشده است.',
        },
        400,
      );
    }

    if (!quantity) {
      return jsonResponse(
        {
          error:
            'تعداد سفارش مشخص نشده است.',
        },
        400,
      );
    }

    if (note.length > 5000) {
      return jsonResponse(
        {
          error:
            'توضیحات بیش از حد طولانی است.',
        },
        400,
      );
    }

    const supabase =
      getSupabaseAdmin();

    const requestedOrder: OrderDetails = {
      name,
      company,
      goodsType,
      quantity,
      note,
    };

    await expireStalePendingOrders(
      supabase,
      phone,
    );

    await cancelLegacyPendingPaymentOrders(
      supabase,
      phone,
      requestId,
    );

    /*
     * Idempotency check comes first.
     * Repeated submission of the exact same client request
     * must not create another order.
     */
    if (idempotencyKey) {
      const {
        data: existingByKey,
      } = await supabase
        .from('bulk_order_requests')
        .select('*')
        .eq(
          'idempotency_key',
          idempotencyKey,
        )
        .maybeSingle();

      if (existingByKey) {
        const existing =
          existingByKey as BulkOrderRow;

        console.log(
          `[ BULK_ORDER ] IDEMPOTENT_HIT requestId=${requestId} bulkOrderId=${existing.id}`,
        );

        if (
          existing.status ===
            'pending' ||
          existing.status ===
            'contacted' ||
          existing.status ===
            'completed' ||
          existing.status ===
            'pending_payment'
        ) {
          let orderForResponse =
            existing;

          if (
            existing.status ===
            'pending_payment'
          ) {
            const {
              data: upgraded,
            } = await supabase
              .from(
                'bulk_order_requests',
              )
              .update({
                status: 'pending',
              })
              .eq(
                'id',
                existing.id,
              )
              .select('*')
              .maybeSingle();

            if (upgraded) {
              orderForResponse =
                upgraded as BulkOrderRow;
            }
          }

          console.log(
            `[ BULK_ORDER ] TOTAL requestId=${requestId} duration=${Date.now() - startedAt}ms`,
          );

          return jsonResponse({
            success: true,
            ...orderSuccessResponse(
              orderForResponse,
            ),
            reused: true,
          });
        }
      }
    }

    /*
     * If the same phone already has an identical pending order,
     * return it instead of creating a duplicate row.
     */
    const recentPending =
      await findRecentPendingOrder(
        supabase,
        phone,
      );

    if (
      recentPending &&
      orderDetailsMatch(
        recentPending,
        requestedOrder,
      )
    ) {
      console.log(
        `[ BULK_ORDER ] REUSE_PENDING requestId=${requestId} bulkOrderId=${recentPending.id}`,
      );

      return jsonResponse({
        success: true,
        ...orderSuccessResponse(
          recentPending,
        ),
        reused: true,
      });
    }

    /*
     * Apply anti-spam rate limits only when
     * a new order actually needs to be created.
     */
    const rateLimitResponse =
      await checkRateLimits(
        supabase,
        phone,
        clientIp,
        requestId,
      );

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const {
      data: created,
      error: insertError,
    } = await supabase
      .from('bulk_order_requests')
      .insert({
        name,
        phone,
        company,
        goods_type: goodsType,
        quantity,
        note,
        status: 'pending',
        client_ip: clientIp,
        idempotency_key:
          idempotencyKey,
      })
      .select('*')
      .single();

    if (insertError) {
      if (
        insertError.code ===
        '23505'
      ) {
        if (idempotencyKey) {
          const {
            data: raced,
          } = await supabase
            .from(
              'bulk_order_requests',
            )
            .select('*')
            .eq(
              'idempotency_key',
              idempotencyKey,
            )
            .maybeSingle();

          if (raced) {
            return jsonResponse({
              success: true,
              ...orderSuccessResponse(
                raced as BulkOrderRow,
              ),
              reused: true,
            });
          }
        }

        return jsonResponse(
          {
            error:
              'یک درخواست فعال برای این شماره تماس وجود دارد.',
          },
          409,
        );
      }

      console.error(
        `[ BULK_ORDER ] ORDER_CREATED requestId=${requestId} failed`,
        insertError.message,
      );

      return jsonResponse(
        {
          error:
            'ثبت سفارش در دیتابیس انجام نشد.',
        },
        500,
      );
    }

    const order =
      created as BulkOrderRow;

    console.log(
      `[ BULK_ORDER ] ORDER_CREATED requestId=${requestId} bulkOrderId=${order.id}`,
    );

    console.log(
      `[ BULK_ORDER ] TOTAL requestId=${requestId} duration=${Date.now() - startedAt}ms`,
    );

    return jsonResponse({
      success: true,
      ...orderSuccessResponse(order),
    });
  } catch (error) {
    console.error(
      `[ BULK_ORDER ] ERROR requestId=${requestId}`,
      error instanceof Error
        ? error.message
        : error,
    );

    return jsonResponse(
      {
        error:
          'خطا در پردازش درخواست.',
      },
      500,
    );
  }
});