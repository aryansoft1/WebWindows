-- WebWindows Developer Platform trust schema v1.
-- Applied explicitly by tools/Invoke-WebWindowsTrustMigration.ps1; never SOURCE from an HTTP request.

CREATE TABLE IF NOT EXISTS webwindows_schema_migrations (
  migration_id VARCHAR(120) NOT NULL,
  checksum_sha256 CHAR(64) NOT NULL,
  applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  success TINYINT(1) NOT NULL,
  PRIMARY KEY (migration_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS webwindows_developers (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  display_name VARCHAR(120) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  api_key_hash VARCHAR(64) NULL,
  api_key_prefix VARCHAR(20) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_webwindows_developer_user (user_id),
  KEY idx_webwindows_developer_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS webwindows_function_submissions (
  id BIGINT NOT NULL AUTO_INCREMENT,
  developer_id BIGINT NOT NULL,
  app_id VARCHAR(160) NOT NULL,
  app_version VARCHAR(40) NOT NULL,
  manifest_base64 LONGTEXT NOT NULL,
  integrity_sha256 VARCHAR(64) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'submitted',
  review_note VARCHAR(255) NOT NULL DEFAULT '',
  package_size BIGINT NOT NULL DEFAULT 0,
  package_sha256 VARCHAR(64) NOT NULL DEFAULT '',
  package_uploaded_at DATETIME NULL,
  validation_status VARCHAR(30) NOT NULL DEFAULT 'not-validated',
  active_validation_id BIGINT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  reviewed_by BIGINT NULL,
  reviewed_at DATETIME NULL,
  PRIMARY KEY (id),
  KEY idx_function_submission_developer (developer_id,id),
  KEY idx_function_submission_status (status,id),
  KEY idx_function_submission_app (app_id,app_version)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS webwindows_function_packages (
  id BIGINT NOT NULL AUTO_INCREMENT,
  submission_id BIGINT NOT NULL,
  developer_id BIGINT NOT NULL,
  original_filename VARCHAR(180) NOT NULL,
  package_blob LONGBLOB NOT NULL,
  package_size BIGINT NOT NULL,
  package_sha256 VARCHAR(64) NOT NULL DEFAULT '',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_function_package_submission (submission_id),
  KEY idx_function_package_developer (developer_id,id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS webwindows_function_ownership (
  app_id VARCHAR(160) NOT NULL,
  developer_id BIGINT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (app_id),
  KEY idx_function_ownership_developer (developer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS webwindows_submission_validations (
  id BIGINT NOT NULL AUTO_INCREMENT,
  submission_id BIGINT NOT NULL,
  developer_id BIGINT NOT NULL,
  package_sha256 VARCHAR(64) NOT NULL,
  source_manifest_sha256 VARCHAR(64) NULL,
  source_manifest_integrity_version INT NOT NULL,
  validator_version VARCHAR(20) NOT NULL,
  passed TINYINT(1) NOT NULL,
  report_base64 LONGTEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_submission_validation_submission (submission_id,id),
  KEY idx_submission_validation_package (package_sha256)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS webwindows_review_decisions (
  id BIGINT NOT NULL AUTO_INCREMENT,
  review_decision_id VARCHAR(64) NOT NULL,
  submission_id BIGINT NOT NULL,
  publisher_id BIGINT NOT NULL,
  app_id VARCHAR(160) NOT NULL,
  app_version VARCHAR(40) NOT NULL,
  package_sha256 VARCHAR(64) NOT NULL,
  source_manifest_sha256 VARCHAR(64) NOT NULL,
  source_manifest_integrity_version INT NOT NULL,
  validation_record_id BIGINT NOT NULL,
  validation_report_id VARCHAR(80) NOT NULL,
  manifest_version INT NOT NULL,
  sdk_version VARCHAR(20) NULL,
  requested_permissions_base64 LONGTEXT NOT NULL,
  approved_permissions_base64 LONGTEXT NOT NULL,
  denied_permissions_base64 LONGTEXT NOT NULL,
  review_policy_version INT NOT NULL,
  decision VARCHAR(20) NOT NULL,
  review_note VARCHAR(255) NOT NULL DEFAULT '',
  reviewer_type VARCHAR(30) NOT NULL,
  reviewed_by BIGINT NULL,
  reviewer_identity VARCHAR(160) NOT NULL,
  risk_summary_base64 LONGTEXT NOT NULL,
  supersedes_id BIGINT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_review_decision_identity (review_decision_id),
  KEY idx_review_decision_submission (submission_id,id),
  KEY idx_review_decision_package (package_sha256)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS webwindows_published_releases (
  id BIGINT NOT NULL AUTO_INCREMENT,
  published_release_id VARCHAR(64) NOT NULL,
  submission_id BIGINT NOT NULL,
  publisher_id BIGINT NOT NULL,
  app_id VARCHAR(160) NOT NULL,
  app_version VARCHAR(40) NOT NULL,
  package_sha256 VARCHAR(64) NOT NULL,
  source_manifest_sha256 VARCHAR(64) NOT NULL,
  source_manifest_integrity_version INT NOT NULL,
  manifest_version INT NOT NULL,
  sdk_version VARCHAR(20) NULL,
  validation_record_id BIGINT NOT NULL,
  validation_report_id VARCHAR(80) NOT NULL,
  review_decision_id BIGINT NOT NULL,
  approved_permissions_base64 LONGTEXT NOT NULL,
  review_policy_version INT NOT NULL,
  release_status VARCHAR(24) NOT NULL DEFAULT 'active',
  published_by BIGINT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_published_release_identity (published_release_id),
  UNIQUE KEY uk_published_release_version (app_id,app_version),
  UNIQUE KEY uk_published_release_review (review_decision_id),
  KEY idx_published_release_package (package_sha256)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS webwindows_published_release_events (
  id BIGINT NOT NULL AUTO_INCREMENT,
  published_release_id BIGINT NOT NULL,
  release_status VARCHAR(24) NOT NULL,
  event_note VARCHAR(255) NOT NULL DEFAULT '',
  acted_by BIGINT NULL,
  actor_identity VARCHAR(160) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_release_event_release (published_release_id,id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS webwindows_function_catalog_versions (
  id BIGINT NOT NULL AUTO_INCREMENT,
  catalog_version VARCHAR(40) NOT NULL,
  catalog_json LONGTEXT NOT NULL,
  storage_encoding VARCHAR(12) NOT NULL DEFAULT 'base64',
  publish_note VARCHAR(255) NOT NULL DEFAULT '',
  published_by BIGINT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_function_catalog_active (is_active,id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS webwindows_catalog_release_bindings (
  id BIGINT NOT NULL AUTO_INCREMENT,
  catalog_revision_id BIGINT NOT NULL,
  catalog_entry_id VARCHAR(160) NOT NULL,
  source_type VARCHAR(30) NOT NULL,
  release_binding_state VARCHAR(30) NOT NULL,
  published_release_id BIGINT NULL,
  published_release_identity VARCHAR(64) NULL,
  package_sha256 VARCHAR(64) NULL,
  source_manifest_sha256 VARCHAR(64) NULL,
  source_manifest_integrity_version INT NULL,
  manifest_version INT NULL,
  sdk_version VARCHAR(20) NULL,
  review_decision_identity VARCHAR(64) NULL,
  approved_permissions_base64 LONGTEXT NULL,
  review_policy_version INT NULL,
  package_download_url VARCHAR(500) NULL,
  release_status VARCHAR(24) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_catalog_binding_entry (catalog_revision_id,catalog_entry_id),
  UNIQUE KEY uk_catalog_binding_release (catalog_revision_id,published_release_identity),
  KEY idx_catalog_binding_release_identity (published_release_identity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Upgrade columns that existed before the frozen trust schema. The helper is dropped before completion.
DROP PROCEDURE IF EXISTS webwindows_add_column_if_missing;
DELIMITER $$
CREATE PROCEDURE webwindows_add_column_if_missing(
  IN table_name_value VARCHAR(64),
  IN column_name_value VARCHAR(64),
  IN alter_statement_value TEXT
)
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = table_name_value
      AND column_name = column_name_value
  ) THEN
    SET @webwindows_schema_sql = alter_statement_value;
    PREPARE webwindows_schema_statement FROM @webwindows_schema_sql;
    EXECUTE webwindows_schema_statement;
    DEALLOCATE PREPARE webwindows_schema_statement;
  END IF;
END$$
DELIMITER ;

CALL webwindows_add_column_if_missing('webwindows_function_submissions', 'package_size',
  'ALTER TABLE webwindows_function_submissions ADD COLUMN package_size BIGINT NOT NULL DEFAULT 0');
CALL webwindows_add_column_if_missing('webwindows_function_submissions', 'package_sha256',
  'ALTER TABLE webwindows_function_submissions ADD COLUMN package_sha256 VARCHAR(64) NOT NULL DEFAULT ''''');
CALL webwindows_add_column_if_missing('webwindows_function_submissions', 'package_uploaded_at',
  'ALTER TABLE webwindows_function_submissions ADD COLUMN package_uploaded_at DATETIME NULL');
CALL webwindows_add_column_if_missing('webwindows_function_submissions', 'validation_status',
  'ALTER TABLE webwindows_function_submissions ADD COLUMN validation_status VARCHAR(30) NOT NULL DEFAULT ''not-validated''');
CALL webwindows_add_column_if_missing('webwindows_function_submissions', 'active_validation_id',
  'ALTER TABLE webwindows_function_submissions ADD COLUMN active_validation_id BIGINT NULL');
CALL webwindows_add_column_if_missing('webwindows_submission_validations', 'source_manifest_integrity_version',
  'ALTER TABLE webwindows_submission_validations ADD COLUMN source_manifest_integrity_version INT NOT NULL DEFAULT 0');
CALL webwindows_add_column_if_missing('webwindows_review_decisions', 'source_manifest_integrity_version',
  'ALTER TABLE webwindows_review_decisions ADD COLUMN source_manifest_integrity_version INT NOT NULL DEFAULT 0');
CALL webwindows_add_column_if_missing('webwindows_published_releases', 'source_manifest_integrity_version',
  'ALTER TABLE webwindows_published_releases ADD COLUMN source_manifest_integrity_version INT NOT NULL DEFAULT 0');
CALL webwindows_add_column_if_missing('webwindows_catalog_release_bindings', 'source_manifest_integrity_version',
  'ALTER TABLE webwindows_catalog_release_bindings ADD COLUMN source_manifest_integrity_version INT NULL DEFAULT 0');
CALL webwindows_add_column_if_missing('webwindows_function_catalog_versions', 'storage_encoding',
  'ALTER TABLE webwindows_function_catalog_versions ADD COLUMN storage_encoding VARCHAR(12) NOT NULL DEFAULT ''raw'' AFTER catalog_json');

DROP PROCEDURE webwindows_add_column_if_missing;

UPDATE webwindows_function_submissions
SET validation_status = 'legacy-unverified'
WHERE status = 'published' AND validation_status = 'not-validated';

UPDATE webwindows_function_catalog_versions
SET is_active = 0
WHERE is_active = 1 AND storage_encoding <> 'base64';
