-- Apply after 005, before deploying developer content APIs.
CREATE TABLE IF NOT EXISTS webwindows_developer_content (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  content_type VARCHAR(20) NOT NULL,
  slug VARCHAR(80) NOT NULL,
  version_number INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  body TEXT NOT NULL,
  sample_url VARCHAR(500) NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  published_at DATETIME NULL,
  UNIQUE KEY uq_developer_content_version(content_type,slug,version_number),
  INDEX idx_developer_content_public(status,content_type,published_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
