-- Add pro_until field to user_subscriptions table for one-time payments

alter table user_subscriptions add column if not exists pro_until timestamptz;

comment on column user_subscriptions.pro_until is 'Expiration date for one-time Pro access purchases';
