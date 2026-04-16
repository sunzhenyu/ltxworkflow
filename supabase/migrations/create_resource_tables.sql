-- ============================================================
-- Tutorials: step-by-step how-to guides
-- ============================================================
create table if not exists tutorials (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text not null,
  content text not null,
  tags text[] default '{}',
  author_name text default 'ltx workflow',
  source_url text,
  source_title text,
  source_published_at timestamptz,
  is_published boolean default true,
  seo_title text,
  seo_description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists tutorials_slug_idx on tutorials(slug);
create index if not exists tutorials_source_published_at_idx on tutorials(source_published_at desc);
create index if not exists tutorials_is_published_idx on tutorials(is_published) where is_published = true;
alter table tutorials enable row level security;
create policy "Public can read published tutorials" on tutorials for select using (is_published = true);

-- ============================================================
-- Community: Reddit / Discord hot discussions
-- ============================================================
create table if not exists community (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text not null,
  content text not null,
  tags text[] default '{}',
  author_name text default 'ltx workflow',
  source_url text,
  source_title text,
  source_published_at timestamptz,
  is_published boolean default true,
  seo_title text,
  seo_description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists community_slug_idx on community(slug);
create index if not exists community_source_published_at_idx on community(source_published_at desc);
create index if not exists community_is_published_idx on community(is_published) where is_published = true;
alter table community enable row level security;
create policy "Public can read published community" on community for select using (is_published = true);

-- ============================================================
-- Showcase: example video generations
-- ============================================================
create table if not exists showcase (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text not null,
  content text not null,
  tags text[] default '{}',
  author_name text default 'ltx workflow',
  source_url text,
  source_title text,
  source_published_at timestamptz,
  is_published boolean default true,
  seo_title text,
  seo_description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists showcase_slug_idx on showcase(slug);
create index if not exists showcase_source_published_at_idx on showcase(source_published_at desc);
create index if not exists showcase_is_published_idx on showcase(is_published) where is_published = true;
alter table showcase enable row level security;
create policy "Public can read published showcase" on showcase for select using (is_published = true);

-- ============================================================
-- Research: arxiv papers on LTX / video generation
-- ============================================================
create table if not exists research (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text not null,
  content text not null,
  tags text[] default '{}',
  author_name text default 'ltx workflow',
  source_url text,
  source_title text,
  source_published_at timestamptz,
  is_published boolean default true,
  seo_title text,
  seo_description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists research_slug_idx on research(slug);
create index if not exists research_source_published_at_idx on research(source_published_at desc);
create index if not exists research_is_published_idx on research(is_published) where is_published = true;
alter table research enable row level security;
create policy "Public can read published research" on research for select using (is_published = true);

-- ============================================================
-- Tools: ComfyUI nodes, extensions, related tools
-- ============================================================
create table if not exists tools (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text not null,
  content text not null,
  tags text[] default '{}',
  author_name text default 'ltx workflow',
  source_url text,
  source_title text,
  source_published_at timestamptz,
  is_published boolean default true,
  seo_title text,
  seo_description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists tools_slug_idx on tools(slug);
create index if not exists tools_source_published_at_idx on tools(source_published_at desc);
create index if not exists tools_is_published_idx on tools(is_published) where is_published = true;
alter table tools enable row level security;
create policy "Public can read published tools" on tools for select using (is_published = true);
