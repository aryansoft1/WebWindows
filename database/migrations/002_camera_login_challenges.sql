-- Camera cross-device login v1. Apply explicitly during deployment; never from an HTTP request.
CREATE TABLE IF NOT EXISTS webwindows_camera_login_challenges (
  challenge CHAR(48) NOT NULL,
  initiator_binding_hash CHAR(64) NOT NULL,
  initiator_device VARCHAR(160) NOT NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'pending',
  approved_user_id BIGINT NULL,
  exchange_token_hash CHAR(64) NULL,
  exchange_expires_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  approved_at DATETIME NULL,
  consumed_at DATETIME NULL,
  finalized_at DATETIME NULL,
  revoked_at DATETIME NULL,
  PRIMARY KEY (challenge),
  KEY idx_camera_login_expiry (status, expires_at),
  UNIQUE KEY uk_camera_login_exchange (exchange_token_hash),
  KEY idx_camera_login_user (approved_user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS webwindows_camera_login_audit (
  id BIGINT NOT NULL AUTO_INCREMENT,
  challenge_prefix CHAR(12) NOT NULL,
  action_name VARCHAR(20) NOT NULL,
  result_name VARCHAR(24) NOT NULL,
  actor_user_id BIGINT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_camera_login_audit_challenge (challenge_prefix, created_at),
  KEY idx_camera_login_audit_actor (actor_user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
