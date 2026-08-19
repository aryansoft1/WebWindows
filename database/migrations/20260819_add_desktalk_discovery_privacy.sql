-- Account-level DeskTalk discovery preference.
-- Hidden accounts remain able to use DeskTalk, but are omitted from the
-- server-authoritative presence/recommendation feed.
CREATE TABLE IF NOT EXISTS webwindows_desktalk_preferences (
  user_id BIGINT UNSIGNED NOT NULL,
  undiscoverable TINYINT(1) NOT NULL DEFAULT 0,
  updated_at DATETIME NOT NULL,
  PRIMARY KEY (user_id),
  KEY idx_desktalk_undiscoverable (undiscoverable)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
