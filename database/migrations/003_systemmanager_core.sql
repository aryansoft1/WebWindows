-- Apply after 001 and 002, before deploying the SystemManager APIs.
-- Existing user accounts remain permanent. Commercial capacity terms are separate.

DROP PROCEDURE IF EXISTS webwindows_systemmanager_003;
DELIMITER //
CREATE PROCEDURE webwindows_systemmanager_003()
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'webwindows_datacenters'
      AND COLUMN_NAME = 'user_quota_mb'
  ) THEN
    ALTER TABLE webwindows_datacenters
      ADD COLUMN user_quota_mb INT NOT NULL DEFAULT 1024;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'webwindows_datacenters'
      AND COLUMN_NAME = 'last_check_detail'
  ) THEN
    ALTER TABLE webwindows_datacenters
      ADD COLUMN last_check_detail VARCHAR(255) NULL;
  END IF;
END//
DELIMITER ;
CALL webwindows_systemmanager_003();
DROP PROCEDURE webwindows_systemmanager_003;

UPDATE webwindows_users SET expired_at=NULL WHERE expired_at IS NOT NULL;
