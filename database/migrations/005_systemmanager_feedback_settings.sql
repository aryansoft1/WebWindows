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

-- Older installations already have a MyISAM feedback table with name/email/content,
-- Chinese ENUM status values, and INT identifiers. Preserve those records in place.
DROP PROCEDURE IF EXISTS webwindows_feedback_005;
DELIMITER //
CREATE PROCEDURE webwindows_feedback_005()
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='webwindows_feedback'
      AND COLUMN_NAME='name'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='webwindows_feedback'
        AND COLUMN_NAME='submitter'
    ) THEN
      ALTER TABLE webwindows_feedback
        ENGINE=InnoDB,
        CONVERT TO CHARACTER SET utf8mb4,
        MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT,
        MODIFY COLUMN user_id BIGINT NULL,
        MODIFY COLUMN urgency VARCHAR(12) NOT NULL DEFAULT 'normal',
        MODIFY COLUMN status VARCHAR(20) NOT NULL DEFAULT 'pending',
        ADD COLUMN submitter VARCHAR(100) NOT NULL DEFAULT '',
        ADD COLUMN contact VARCHAR(255) NOT NULL DEFAULT '',
        ADD COLUMN subject VARCHAR(200) NOT NULL DEFAULT '',
        ADD COLUMN rating TINYINT NULL,
        ADD COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        ADD INDEX idx_feedback_status_time(status,created_at),
        ADD INDEX idx_feedback_user(user_id);
    END IF;
    UPDATE webwindows_feedback SET
      submitter=IF(submitter='',COALESCE(NULLIF(TRIM(name),''),'匿名'),submitter),
      contact=IF(contact='',COALESCE(NULLIF(TRIM(email),''),'未提供'),contact),
      subject=IF(subject='',LEFT(COALESCE(NULLIF(TRIM(content),''),'历史反馈'),200),subject),
      rating=IF(rating IS NULL,LEAST(5,GREATEST(1,COALESCE(star,3))),rating),
      urgency=CASE urgency WHEN '高' THEN 'high' WHEN '低' THEN 'low' WHEN '中' THEN 'normal' ELSE urgency END,
      status=CASE status WHEN '未处理' THEN 'pending' WHEN '已回复' THEN 'replied' ELSE status END,
      updated_at=COALESCE(created_at,NOW())
    WHERE submitter='' OR contact='' OR subject='' OR rating IS NULL
      OR urgency IN ('高','中','低') OR status IN ('未处理','已回复');
  END IF;
END//
DELIMITER ;
CALL webwindows_feedback_005();
DROP PROCEDURE webwindows_feedback_005;

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

DROP PROCEDURE IF EXISTS webwindows_feedback_history_005;
DELIMITER //
CREATE PROCEDURE webwindows_feedback_history_005()
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='webwindows_feedback'
      AND COLUMN_NAME='content'
  ) THEN
    INSERT INTO webwindows_feedback_messages(feedback_id,author_role,body,created_at)
      SELECT f.id,'user',f.content,COALESCE(f.created_at,NOW())
      FROM webwindows_feedback f
      WHERE f.content IS NOT NULL AND TRIM(f.content)<>''
        AND NOT EXISTS (
          SELECT 1 FROM webwindows_feedback_messages m
          WHERE m.feedback_id=f.id AND m.author_role='user'
        );
  END IF;
END//
DELIMITER ;
CALL webwindows_feedback_history_005();
DROP PROCEDURE webwindows_feedback_history_005;

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
