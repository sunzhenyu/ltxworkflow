-- Idempotency for purchase transactions: a single (ref_id, reason='purchase')
-- can only ever land once. Webhook double-deliveries from Creem won't double-credit.

create unique index if not exists uniq_credit_purchase_ref
  on credit_transactions (ref_id)
  where reason = 'purchase';
