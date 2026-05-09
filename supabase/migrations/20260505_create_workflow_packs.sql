-- Workflow Packs: production-tested LTX 2.3 workflows by scene
-- Pro tier unlocks downloads. Free tier shows previews + 1-2 sample workflows.

create table if not exists workflow_packs (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  scene_category text not null,
  description text not null,
  use_case text,
  workflow_json jsonb,
  prompt_template text,
  negative_prompt text,
  min_vram_gb int not null default 16,
  recommended_vram_gb int,
  compatible_models text[] default '{}',
  required_files text[] default '{}',
  difficulty text not null default 'intermediate' check (difficulty in ('beginner','intermediate','advanced')),
  generation_steps int,
  cfg_scale numeric,
  preview_image_url text,
  preview_video_url text,
  is_premium boolean not null default true,
  is_published boolean not null default false,
  view_count int not null default 0,
  download_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists workflow_packs_published_idx on workflow_packs (is_published, created_at desc);
create index if not exists workflow_packs_category_idx on workflow_packs (scene_category);

-- updated_at trigger
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists workflow_packs_updated_at on workflow_packs;
create trigger workflow_packs_updated_at
  before update on workflow_packs
  for each row execute function set_updated_at();
