-- Apply after 003 and before deploying admin_api/news.asp and public news endpoints.
DROP PROCEDURE IF EXISTS webwindows_news_004;
DELIMITER //
CREATE PROCEDURE webwindows_news_004()
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'webwindows_news'
      AND COLUMN_NAME = 'publish_at'
  ) THEN
    ALTER TABLE webwindows_news ADD COLUMN publish_at DATETIME NULL;
  END IF;
END//
DELIMITER ;
CALL webwindows_news_004();
DROP PROCEDURE webwindows_news_004;

UPDATE webwindows_news SET publish_at=created_at WHERE publish_at IS NULL;
CREATE TABLE IF NOT EXISTS webwindows_news_categories (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT IGNORE INTO webwindows_news_categories(name)
  SELECT DISTINCT category FROM webwindows_news WHERE category IS NOT NULL AND TRIM(category)<>'';
