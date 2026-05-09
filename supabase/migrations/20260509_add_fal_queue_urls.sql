-- Store the exact status_url and response_url that fal hands us back on submit.
-- We were previously reconstructing these from the model endpoint, which
-- doesn't match fal's queue routing — fal serves status/result against the
-- bare app id (e.g. fal-ai/ltx-2.3) regardless of which sub-route was used
-- to submit (.../image-to-video, .../image-to-video/fast, etc.). The
-- mismatched URLs 404'd silently and polling never saw COMPLETED.

alter table generations add column if not exists fal_status_url text;
alter table generations add column if not exists fal_response_url text;
