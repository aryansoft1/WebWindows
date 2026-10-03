-- Read only. Run this and inspect its output before migration 007.
SET NAMES utf8mb4;
SELECT TABLE_NAME,COLUMN_NAME,CHARACTER_SET_NAME,COLLATION_NAME,DATA_TYPE
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA=DATABASE() AND (
  (TABLE_NAME='webwindows_news_categories' AND COLUMN_NAME='name') OR
  (TABLE_NAME='webwindows_news' AND COLUMN_NAME='category'));
SELECT id,name,HEX(name) AS name_hex,
  CONVERT(CAST(name AS BINARY) USING utf8mb4) AS decoded_raw_utf8
FROM webwindows_news_categories ORDER BY id;
SELECT category,HEX(category) AS category_hex,COUNT(*) AS newsCount
FROM webwindows_news
WHERE category IS NOT NULL AND TRIM(category)<>''
GROUP BY category,HEX(category) ORDER BY newsCount DESC;
