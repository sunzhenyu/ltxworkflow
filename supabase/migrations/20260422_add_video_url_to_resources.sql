-- Add video_url field to all resource tables to support embedded videos

alter table tutorials add column if not exists video_url text;
alter table community add column if not exists video_url text;
alter table showcase add column if not exists video_url text;
alter table research add column if not exists video_url text;
alter table tools add column if not exists video_url text;

comment on column tutorials.video_url is 'YouTube, Bilibili, or other video platform URL for embedded video player';
comment on column community.video_url is 'YouTube, Bilibili, or other video platform URL for embedded video player';
comment on column showcase.video_url is 'YouTube, Bilibili, or other video platform URL for embedded video player';
comment on column research.video_url is 'YouTube, Bilibili, or other video platform URL for embedded video player';
comment on column tools.video_url is 'YouTube, Bilibili, or other video platform URL for embedded video player';
