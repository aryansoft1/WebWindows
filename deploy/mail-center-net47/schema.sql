CREATE TABLE IF NOT EXISTS webwindows_mail_accounts (
  id CHAR(36) NOT NULL PRIMARY KEY,
  owner_username VARCHAR(64) NOT NULL,
  provider VARCHAR(16) NOT NULL,
  display_name VARCHAR(120) NOT NULL,
  email_address VARCHAR(254) NOT NULL,
  email_key CHAR(64) CHARACTER SET ascii NOT NULL,
  encrypted_password MEDIUMTEXT NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  UNIQUE KEY uq_ww_mail_owner_key (owner_username, email_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS webwindows_mail_state (
  account_id CHAR(36) CHARACTER SET ascii NOT NULL,
  message_uid VARCHAR(32) CHARACTER SET ascii NOT NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  updated_at DATETIME NOT NULL,
  PRIMARY KEY (account_id, message_uid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
