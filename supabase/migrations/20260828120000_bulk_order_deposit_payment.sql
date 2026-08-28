-- Bulk order deposit payment support (minimal extension)

alter table public.bulk_order_requests
  drop constraint if exists bulk_order_requests_status_check;

alter table public.bulk_order_requests
  add constraint bulk_order_requests_status_check
  check (status in (
    'pending_payment',
    'pending',
    'contacted',
    'completed',
    'cancelled',
    'expired'
  ));

alter table public.bulk_order_requests
  add column if not exists zibal_track_id bigint,
  add column if not exists payment_amount numeric,
  add column if not exists payment_expires_at timestamptz,
  add column if not exists paid_at timestamptz,
  add column if not exists client_ip text not null default '',
  add column if not exists idempotency_key text;

create index if not exists idx_bulk_order_requests_zibal_track_id
  on public.bulk_order_requests (zibal_track_id)
  where zibal_track_id is not null;

create index if not exists idx_bulk_order_requests_client_ip_created
  on public.bulk_order_requests (client_ip, created_at desc)
  where client_ip <> '';

create index if not exists idx_bulk_order_requests_phone_status
  on public.bulk_order_requests (phone, status);

create unique index if not exists idx_bulk_order_requests_idempotency_key
  on public.bulk_order_requests (idempotency_key)
  where idempotency_key is not null;

create unique index if not exists idx_bulk_order_requests_active_payment_phone
  on public.bulk_order_requests (phone)
  where status = 'pending_payment';
