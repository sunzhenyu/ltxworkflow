-- Reduce welcome credits from 8 → 5 to cut CAC.
--   Free trials were being spent on the cheapest model (22B Distilled, 3 cr)
--   with no conversion, so each signup was pure upstream cost. 5 credits still
--   covers one cheapest-model generation but no longer funds repeat freebies.
-- Existing user_credits rows are NOT touched — only future first-time grants.

create or replace function get_or_init_credits(p_user_id text)
returns integer as $$
declare
  v_row_count integer;
  v_balance integer;
begin
  insert into user_credits (user_id, balance)
  values (p_user_id, 5)
  on conflict (user_id) do nothing;

  get diagnostics v_row_count = row_count;

  if v_row_count = 1 then
    insert into credit_transactions (user_id, delta, reason)
    values (p_user_id, 5, 'welcome');
  end if;

  select balance into v_balance from user_credits where user_id = p_user_id;
  return v_balance;
end;
$$ language plpgsql;
