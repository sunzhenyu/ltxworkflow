-- Credits ledger + generations log for the LTX online generation product.
-- 1 credit = 1 second of 1080p Fast video (matches fal LTX 2.3 i2v fast at $0.04/s).
-- New users get 15 free credits on first balance read.

-- ============================================================
-- Tables
-- ============================================================

create table if not exists user_credits (
  user_id text primary key,
  balance integer not null default 0 check (balance >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  delta integer not null,                -- positive (grant/purchase) or negative (spend)
  reason text not null,                  -- 'welcome' | 'purchase' | 'spend' | 'refund' | 'adjust'
  ref_id text,                           -- generation id, creem subscription id, etc.
  created_at timestamptz not null default now()
);

create index if not exists idx_credit_transactions_user
  on credit_transactions(user_id, created_at desc);
create index if not exists idx_credit_transactions_reason
  on credit_transactions(reason);

create table if not exists generations (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  mode text not null,                    -- 'i2v' | 't2v'
  model text not null,                   -- 'ltx-2.3-fast' | 'ltx-2.3' etc.
  prompt text,
  image_url text,                        -- start frame for i2v
  end_image_url text,                    -- optional end frame
  resolution text not null,              -- '1080p' | '1440p' | '2160p'
  duration_seconds integer not null check (duration_seconds > 0),
  status text not null default 'pending',-- 'pending' | 'running' | 'completed' | 'failed'
  video_url text,                        -- fal-returned mp4 URL (used directly, no proxy)
  fal_request_id text,
  credits_charged integer not null default 0,
  fal_cost_usd numeric(10, 4),           -- bookkeeping: what fal billed us
  error_message text,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  expires_at timestamptz                 -- best-effort estimate of fal URL expiry
);

create index if not exists idx_generations_user
  on generations(user_id, created_at desc);
create index if not exists idx_generations_status on generations(status);
create index if not exists idx_generations_request on generations(fal_request_id);

-- ============================================================
-- Triggers
-- ============================================================

drop trigger if exists user_credits_updated_at on user_credits;
create trigger user_credits_updated_at
  before update on user_credits
  for each row execute function set_updated_at();

-- ============================================================
-- Atomic helpers (called via supabase.rpc(...) from app code)
-- ============================================================

-- Read balance, lazily granting 15 welcome credits on first call.
-- Idempotent: subsequent calls just return the current balance.
create or replace function get_or_init_credits(p_user_id text)
returns integer as $$
declare
  v_row_count integer;
  v_balance integer;
begin
  insert into user_credits (user_id, balance)
  values (p_user_id, 15)
  on conflict (user_id) do nothing;

  get diagnostics v_row_count = row_count;

  if v_row_count = 1 then
    insert into credit_transactions (user_id, delta, reason)
    values (p_user_id, 15, 'welcome');
  end if;

  select balance into v_balance from user_credits where user_id = p_user_id;
  return v_balance;
end;
$$ language plpgsql;

-- Try to deduct credits atomically. Returns new balance, or -1 if insufficient.
create or replace function try_deduct_credits(
  p_user_id text,
  p_amount integer,
  p_reason text,
  p_ref_id text default null
) returns integer as $$
declare
  v_new_balance integer;
begin
  if p_amount <= 0 then
    raise exception 'amount must be positive';
  end if;

  update user_credits
  set balance = balance - p_amount
  where user_id = p_user_id and balance >= p_amount
  returning balance into v_new_balance;

  if v_new_balance is null then
    return -1;
  end if;

  insert into credit_transactions (user_id, delta, reason, ref_id)
  values (p_user_id, -p_amount, p_reason, p_ref_id);

  return v_new_balance;
end;
$$ language plpgsql;

-- Grant credits (purchase / refund / manual adjust).
create or replace function grant_credits(
  p_user_id text,
  p_amount integer,
  p_reason text,
  p_ref_id text default null
) returns integer as $$
declare
  v_new_balance integer;
begin
  if p_amount <= 0 then
    raise exception 'amount must be positive';
  end if;

  insert into user_credits (user_id, balance)
  values (p_user_id, p_amount)
  on conflict (user_id) do update
    set balance = user_credits.balance + p_amount,
        updated_at = now()
  returning balance into v_new_balance;

  insert into credit_transactions (user_id, delta, reason, ref_id)
  values (p_user_id, p_amount, p_reason, p_ref_id);

  return v_new_balance;
end;
$$ language plpgsql;
