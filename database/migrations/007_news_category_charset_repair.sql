-- Run only after reviewing the read-only news category encoding diagnostic.
-- This migration assumes webwindows_news.category is utf8mb4 and the raw bytes
-- in webwindows_news_categories.name are valid UTF-8 (as confirmed by HEX(name)).
-- It preserves every news row, merges duplicate category names after decoding,
-- and keeps the original category table as a rollback backup.
SET NAMES utf8mb4;
DROP PROCEDURE IF EXISTS webwindows_news_categories_007;
DELIMITER //
CREATE PROCEDURE webwindows_news_categories_007()
BEGIN
  DECLARE category_charset VARCHAR(64);
  DECLARE news_charset VARCHAR(64);
  DECLARE news_collation VARCHAR(64);
  DECLARE bad_rows BIGINT DEFAULT 0;
  DECLARE missing_rows BIGINT DEFAULT 0;
  DECLARE extra_columns BIGINT DEFAULT 0;
  DECLARE foreign_keys BIGINT DEFAULT 0;
  DECLARE category_triggers BIGINT DEFAULT 0;

  SELECT CHARACTER_SET_NAME INTO category_charset
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='webwindows_news_categories' AND COLUMN_NAME='name';
  SELECT CHARACTER_SET_NAME,COLLATION_NAME INTO news_charset,news_collation
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='webwindows_news' AND COLUMN_NAME='category';
  IF news_charset IS NULL OR news_charset <> 'utf8mb4' OR
     category_charset IS NULL OR category_charset NOT IN ('gbk','latin1','utf8','utf8mb3','utf8mb4') THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='007: unexpected news/category column charset; inspect before repair';
  END IF;
  IF category_charset = 'utf8mb4' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='007: category column already utf8mb4; diagnose connection instead';
  END IF;
  IF news_collation IS NULL OR news_collation NOT REGEXP '^utf8mb4_[A-Za-z0-9_]+$' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='007: news category collation needs manual review';
  END IF;

  SELECT COUNT(*) INTO extra_columns FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='webwindows_news_categories'
      AND COLUMN_NAME NOT IN ('id','name','created_at');
  SELECT COUNT(*) INTO foreign_keys FROM information_schema.KEY_COLUMN_USAGE
    WHERE REFERENCED_TABLE_SCHEMA=DATABASE()
      AND REFERENCED_TABLE_NAME='webwindows_news_categories';
  SELECT COUNT(*) INTO category_triggers FROM information_schema.TRIGGERS
    WHERE TRIGGER_SCHEMA=DATABASE() AND EVENT_OBJECT_TABLE='webwindows_news_categories';
  IF extra_columns <> 0 OR foreign_keys <> 0 OR category_triggers <> 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='007: category schema has extra columns, foreign keys or triggers';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE()
      AND TABLE_NAME IN ('webwindows_news_categories_007_stage','webwindows_news_categories_before_007')) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='007: stage or backup table already exists';
  END IF;

  -- Reinterpret the original bytes, rather than converting the declared GBK/
  -- latin1 value. A round trip must reproduce every original byte exactly.
  SELECT COUNT(*) INTO bad_rows FROM webwindows_news_categories
    WHERE CONVERT(CAST(name AS BINARY) USING utf8mb4) IS NULL
      OR HEX(CAST(CONVERT(CAST(name AS BINARY) USING utf8mb4) AS BINARY)) <> HEX(name)
      OR CHAR_LENGTH(CONVERT(CAST(name AS BINARY) USING utf8mb4)) > 100;
  IF bad_rows <> 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='007: category names are not losslessly decodable UTF-8';
  END IF;

  -- Match the existing news.category collation so usage joins have no implicit
  -- collation conflict. The name came from information_schema and is validated.
  SET @news_007_create = CONCAT(
    'CREATE TABLE webwindows_news_categories_007_stage (',
    'id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,',
    'name VARCHAR(100) CHARACTER SET utf8mb4 COLLATE ',news_collation,' NOT NULL UNIQUE,',
    'created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP',
    ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=',news_collation);
  PREPARE news_007_stmt FROM @news_007_create;
  EXECUTE news_007_stmt;
  DEALLOCATE PREPARE news_007_stmt;

  INSERT IGNORE INTO webwindows_news_categories_007_stage(id,name,created_at)
    SELECT id,CONVERT(CAST(name AS BINARY) USING utf8mb4),created_at
    FROM webwindows_news_categories ORDER BY id;
  SELECT COUNT(*) INTO missing_rows FROM webwindows_news_categories old_category
    LEFT JOIN webwindows_news_categories_007_stage staged
      ON staged.name=CONVERT(CAST(old_category.name AS BINARY) USING utf8mb4)
    WHERE staged.id IS NULL;
  IF missing_rows <> 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='007: a category did not survive staging';
  END IF;

  -- A news category can be absent from the category table; add it without
  -- editing or deleting the news. The UNIQUE key removes duplicates.
  INSERT IGNORE INTO webwindows_news_categories_007_stage(name)
    SELECT DISTINCT category FROM webwindows_news
    WHERE category IS NOT NULL AND TRIM(category)<>'';
  SELECT COUNT(*) INTO missing_rows FROM webwindows_news n
    LEFT JOIN webwindows_news_categories_007_stage c ON c.name=n.category
    WHERE n.category IS NOT NULL AND TRIM(n.category)<>'' AND c.id IS NULL;
  IF missing_rows <> 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='007: a news category is still missing from the staged table';
  END IF;

  -- Atomic swap; the old table remains available for rollback and audit.
  RENAME TABLE webwindows_news_categories TO webwindows_news_categories_before_007,
    webwindows_news_categories_007_stage TO webwindows_news_categories;
END//
DELIMITER ;
CALL webwindows_news_categories_007();
DROP PROCEDURE webwindows_news_categories_007;

-- Compare category usage before and after from the retained backup.
SELECT c.id,c.name,COUNT(n.id) AS newsCount
FROM webwindows_news_categories c
LEFT JOIN webwindows_news n ON n.category=c.name
GROUP BY c.id,c.name ORDER BY c.id;
