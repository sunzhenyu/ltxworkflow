-- Reduce welcome credits from 15 → 8 to control CAC.
--   8 credits = exactly one default-duration LTX 2.3 Fast generation
--   (6s or 8s), at fal cost ≈ $0.32 per new signup.
-- Existing user_credits rows are NOT touched — only future first-time grants.

create or replace function get_or_init_credits(p_user_id text)
returns integer as $$
declare
  v_row_count integer;
  v_balance integer;
begin
  insert into user_credits (user_id, balance)
  values (p_user_id, 8)
  on conflict (user_id) do nothing;

  get diagnostics v_row_count = row_count;

  if v_row_count = 1 then
    insert into credit_transactions (user_id, delta, reason)
    values (p_user_id, 8, 'welcome');
  end if;

  select balance into v_balance from user_credits where user_id = p_user_id;
  return v_balance;
end;
$$ language plpgsql;
