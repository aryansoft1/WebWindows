-- Per-user storage allocation for each WebWindows data center.
-- Existing and new data centers retain the historical 1 GB allocation.
ALTER TABLE webwindows_datacenters
  ADD COLUMN user_quota_mb INT UNSIGNED NOT NULL DEFAULT 1024
  COMMENT 'Per-user private storage quota in MiB (minimum 1024)';

UPDATE webwindows_datacenters
SET user_quota_mb = 1024
WHERE user_quota_mb IS NULL OR user_quota_mb < 1024;
