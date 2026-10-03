-- WebWindows visitor analytics schema v1.
-- Applied explicitly by tools/Invoke-WebWindowsTrustMigration.ps1.
-- Raw request IPs are restricted to the authenticated SystemManager analytics view.

CREATE TABLE IF NOT EXISTS webwindows_visitor_sessions (
  id BIGINT NOT NULL AUTO_INCREMENT,
  visitor_key CHAR(36) NOT NULL,
  session_key CHAR(36) NOT NULL,
  user_id BIGINT NULL,
  username_snapshot VARCHAR(80) NOT NULL DEFAULT '',
  visitor_type VARCHAR(20) NOT NULL DEFAULT 'anonymous',
  ip_address VARCHAR(45) NOT NULL DEFAULT '',
  country_code VARCHAR(8) NOT NULL DEFAULT '',
  country_name VARCHAR(80) NOT NULL DEFAULT '',
  region_name VARCHAR(120) NOT NULL DEFAULT '',
  city_name VARCHAR(120) NOT NULL DEFAULT '',
  entry_path VARCHAR(500) NOT NULL DEFAULT '',
  referrer VARCHAR(1000) NOT NULL DEFAULT '',
  timezone_name VARCHAR(80) NOT NULL DEFAULT '',
  language_name VARCHAR(40) NOT NULL DEFAULT '',
  device_type VARCHAR(20) NOT NULL DEFAULT 'desktop',
  user_agent VARCHAR(500) NOT NULL DEFAULT '',
  page_views INT NOT NULL DEFAULT 1,
  active_seconds INT NOT NULL DEFAULT 0,
  started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ended_at DATETIME NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_visitor_session_key (session_key),
  KEY idx_visitor_sessions_started (started_at,id),
  KEY idx_visitor_sessions_visitor (visitor_key,started_at),
  KEY idx_visitor_sessions_user (user_id,started_at),
  KEY idx_visitor_sessions_type (visitor_type,started_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS webwindows_visitor_feature_stats (
  id BIGINT NOT NULL AUTO_INCREMENT,
  visitor_session_id BIGINT NOT NULL,
  feature_key VARCHAR(120) NOT NULL,
  feature_name VARCHAR(160) NOT NULL DEFAULT '',
  open_count INT NOT NULL DEFAULT 0,
  active_seconds INT NOT NULL DEFAULT 0,
  first_seen_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_visitor_feature_session (visitor_session_id,feature_key),
  KEY idx_visitor_feature_key (feature_key,last_seen_at),
  KEY idx_visitor_feature_session (visitor_session_id,last_seen_at),
  CONSTRAINT fk_visitor_feature_session
    FOREIGN KEY (visitor_session_id) REFERENCES webwindows_visitor_sessions(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
