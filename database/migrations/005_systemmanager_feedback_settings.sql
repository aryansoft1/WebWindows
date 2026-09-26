-- Apply after 004, before deploying feedback, dashboard, and settings APIs.
CREATE TABLE IF NOT EXISTS webwindows_feedback (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NULL,
  submitter VARCHAR(100) NOT NULL,
  contact VARCHAR(255) NOT NULL,
  subject VARCHAR(200) NOT NULL,
  urgency VARCHAR(12) NOT NULL DEFAULT 'normal',
  rating TINYINT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_feedback_status_time(status,created_at),
  INDEX idx_feedback_user(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS webwindows_feedback_messages (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  feedback_id BIGINT NOT NULL,
  author_role VARCHAR(12) NOT NULL,
  body TEXT NOT NULL,
  attachment_url VARCHAR(1000) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_feedback_message(feedback_id,created_at),
  CONSTRAINT fk_feedback_message FOREIGN KEY(feedback_id)
    REFERENCES webwindows_feedback(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS webwindows_admin_settings (
  setting_key VARCHAR(64) NOT NULL PRIMARY KEY,
  setting_value VARCHAR(1000) NOT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT IGNORE INTO webwindows_admin_settings(setting_key,setting_value) VALUES
  ('system_name','WebWindows 管理后台'),
  ('admin_idle_minutes','30');

CREATE TABLE IF NOT EXISTS webwindows_admin_audit (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  actor_id BIGINT NULL,
  action_name VARCHAR(64) NOT NULL,
  result_name VARCHAR(24) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_admin_audit_time(created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
