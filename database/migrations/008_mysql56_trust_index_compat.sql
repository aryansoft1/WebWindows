-- MySQL 5.6 prerequisite for frozen trust migration 001.
-- Apply before 001 on hosts with 767-byte InnoDB indexes.
-- app_version is constrained to ASCII by the package validator SafeVersion.
-- Full unique index (app_id,app_version) stays intact: 160*4+40=680 bytes.
-- No prefix/truncated unique index and no global InnoDB setting changes.

CREATE TABLE IF NOT EXISTS webwindows_published_releases (
  id BIGINT NOT NULL AUTO_INCREMENT,
  published_release_id VARCHAR(64) NOT NULL,
  submission_id BIGINT NOT NULL,
  publisher_id BIGINT NOT NULL,
  app_id VARCHAR(160) NOT NULL,
  app_version VARCHAR(40) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
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
