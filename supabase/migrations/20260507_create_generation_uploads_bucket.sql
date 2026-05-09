-- Storage bucket for user-uploaded source images. fal.ai fetches the public URL.
-- 10 MB cap, common image MIME types only.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'generation-uploads',
  'generation-uploads',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
