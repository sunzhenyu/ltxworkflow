-- Newsletter subscribers — local source of truth for the email list.
-- Beehiiv (or any ESP) is forwarded to via env vars; we always own the data.

create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  source text,
  is_confirmed boolean not null default true,
  is_unsubscribed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists newsletter_subscribers_email_idx on newsletter_subscribers (email);
create index if not exists newsletter_subscribers_active_idx on newsletter_subscribers (is_unsubscribed, created_at desc);

drop trigger if exists newsletter_subscribers_updated_at on newsletter_subscribers;
create trigger newsletter_subscribers_updated_at
  before update on newsletter_subscribers
  for each row execute function set_updated_at();
