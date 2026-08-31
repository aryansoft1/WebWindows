-- Returns zero rows only when the Phase 2 trust schema has every required table/column/index.
SELECT requirement
FROM (
  SELECT 'table:webwindows_schema_migrations' AS requirement, 'webwindows_schema_migrations' AS object_name, 'table' AS object_type
  UNION ALL SELECT 'table:webwindows_submission_validations', 'webwindows_submission_validations', 'table'
  UNION ALL SELECT 'table:webwindows_review_decisions', 'webwindows_review_decisions', 'table'
  UNION ALL SELECT 'table:webwindows_published_releases', 'webwindows_published_releases', 'table'
  UNION ALL SELECT 'table:webwindows_published_release_events', 'webwindows_published_release_events', 'table'
  UNION ALL SELECT 'table:webwindows_catalog_release_bindings', 'webwindows_catalog_release_bindings', 'table'
  UNION ALL SELECT 'column:webwindows_function_submissions.active_validation_id', 'webwindows_function_submissions.active_validation_id', 'column'
  UNION ALL SELECT 'column:webwindows_submission_validations.source_manifest_integrity_version', 'webwindows_submission_validations.source_manifest_integrity_version', 'column'
  UNION ALL SELECT 'column:webwindows_review_decisions.source_manifest_integrity_version', 'webwindows_review_decisions.source_manifest_integrity_version', 'column'
  UNION ALL SELECT 'column:webwindows_published_releases.source_manifest_integrity_version', 'webwindows_published_releases.source_manifest_integrity_version', 'column'
  UNION ALL SELECT 'column:webwindows_catalog_release_bindings.source_manifest_integrity_version', 'webwindows_catalog_release_bindings.source_manifest_integrity_version', 'column'
  UNION ALL SELECT 'index:webwindows_published_releases.uk_published_release_version', 'webwindows_published_releases.uk_published_release_version', 'index'
  UNION ALL SELECT 'index:webwindows_published_releases.uk_published_release_review', 'webwindows_published_releases.uk_published_release_review', 'index'
  UNION ALL SELECT 'index:webwindows_catalog_release_bindings.uk_catalog_binding_entry', 'webwindows_catalog_release_bindings.uk_catalog_binding_entry', 'index'
) requirements
WHERE CASE object_type
  WHEN 'table' THEN NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = DATABASE() AND table_name = object_name AND engine = 'InnoDB'
  )
  WHEN 'column' THEN NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND CONCAT(table_name, '.', column_name) = object_name
  )
  WHEN 'index' THEN NOT EXISTS (
    SELECT 1 FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND CONCAT(table_name, '.', index_name) = object_name
      AND non_unique = 0
  )
END;
