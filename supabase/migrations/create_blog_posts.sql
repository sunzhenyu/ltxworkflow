-- Blog posts table for ltxworkflow.com
create table if not exists blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text not null,
  content text not null, -- Markdown format
  category text not null,
  tags text[] default '{}',
  cover_image text, -- Cover image URL (optional)
  author_name text default 'ltx workflow',
  author_avatar text,
  read_time_minutes int not null,
  published_at timestamptz not null,
  updated_at timestamptz default now(),
  view_count int default 0,
  is_published boolean default true,
  seo_title text,
  seo_description text,
  created_at timestamptz default now()
);

-- Indexes for performance
create index if not exists blog_posts_slug_idx on blog_posts(slug);
create index if not exists blog_posts_published_at_idx on blog_posts(published_at desc);
create index if not exists blog_posts_category_idx on blog_posts(category);
create index if not exists blog_posts_is_published_idx on blog_posts(is_published) where is_published = true;

-- RLS policies (Row Level Security)
alter table blog_posts enable row level security;

-- Public read access for published posts
create policy "Public can read published posts"
  on blog_posts for select
  using (is_published = true);

-- Comment for documentation
comment on table blog_posts is 'Blog posts for ltxworkflow.com - tutorials, guides, and LTX 2.3 content';
