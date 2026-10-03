"""Apply only frozen trust migration 001 and its MySQL 5.6 index prerequisite.
Credentials are read from process environment; backups never contain credentials.
Existing catalogs are backed up and checked byte-for-byte after migration.
"""
import argparse
import datetime
import hashlib
import json
import os
from pathlib import Path
import re
import sys


def statements(sql):
    delimiter = ';'
    pending = []
    for line in sql.splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith('--'):
            continue
        if stripped.upper().startswith('DELIMITER '):
            if pending:
                raise ValueError('Unexpected delimiter change')
            delimiter = stripped.split(None, 1)[1]
            continue
        pending.append(line)
        if stripped.endswith(delimiter):
            text = '\n'.join(pending)
            yield text[:-len(delimiter)].strip()
            pending = []
    if pending:
        raise ValueError('Unterminated migration statement')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--apply', action='store_true')
    args = parser.parse_args()
    required = ['WEBWINDOWS_DB_HOST', 'WEBWINDOWS_DB_USER', 'WEBWINDOWS_DB_PASSWORD', 'WEBWINDOWS_DB_DATABASE']
    missing = [name for name in required if not os.environ.get(name)]
    if missing:
        raise RuntimeError('Missing variables: ' + ', '.join(missing))
    import pymysql
    root = Path(__file__).resolve().parent.parent
    source_path = root / 'database/migrations/001_webwindows_trust_schema.sql'
    source_bytes = source_path.read_bytes()
    source_checksum = hashlib.sha256(source_bytes).hexdigest()
    gate = (root / 'inc/trust-schema.asp').read_text(encoding='utf-8-sig')
    expected = re.search(r'WEBWINDOWS_TRUST_SCHEMA_CHECKSUM = "([a-f0-9]{64})"', gate).group(1)
    if source_checksum != expected:
        raise RuntimeError('Frozen migration checksum does not match application gate')
    compatibility = root / 'database/migrations/008_mysql56_trust_index_compat.sql'
    verify = (root / 'database/migrations/verify_webwindows_trust_schema.sql').read_text(encoding='utf-8-sig')
    connection = pymysql.connect(host=os.environ[required[0]], user=os.environ[required[1]], password=os.environ[required[2]], database=os.environ[required[3]], charset='utf8mb4', connect_timeout=30, read_timeout=3600, write_timeout=3600, autocommit=True)
    try:
        with connection.cursor() as cursor:
            cursor.execute(verify)
            missing_objects = [row[0] for row in cursor.fetchall()]
            cursor.execute('SELECT VERSION()')
            version = cursor.fetchone()[0]
            print(json.dumps({'version': version, 'missing': missing_objects}))
            if not args.apply:
                return
            cursor.execute("SELECT COUNT(*) FROM webwindows_function_catalog_versions WHERE is_active=1 AND storage_encoding <> 'base64'")
            if cursor.fetchone()[0]:
                raise RuntimeError('Active legacy raw catalog needs separate reconciliation; nothing applied')
            cursor.execute("SHOW COLUMNS FROM webwindows_function_submissions LIKE 'validation_status'")
            validation_exists = cursor.fetchone() is not None
            legacy_filter = " AND validation_status='not-validated'" if validation_exists else ""
            cursor.execute("SELECT COUNT(*) FROM webwindows_function_submissions WHERE status='published'" + legacy_filter)
            if cursor.fetchone()[0]:
                raise RuntimeError('Legacy published submissions need separate reconciliation; nothing applied')
            cursor.execute('SHOW GRANTS FOR CURRENT_USER')
            grants = ' '.join(row[0].split(' ON ')[0] for row in cursor.fetchall()).upper()
            if 'ALL PRIVILEGES' not in grants and 'CREATE ROUTINE' not in grants:
                raise RuntimeError('CREATE ROUTINE privilege required for frozen migration')
            affected_tables = ['webwindows_function_catalog_versions', 'webwindows_function_submissions']
            snapshot = {}
            for table in affected_tables:
                cursor.execute('SHOW CREATE TABLE ' + table)
                schema = cursor.fetchone()[1]
                cursor.execute('SELECT * FROM ' + table + ' ORDER BY id')
                rows = cursor.fetchall()
                snapshot[table] = {'schema': schema, 'columns': [item[0] for item in cursor.description], 'rows': rows}
            backup_dir = root / '.deployment-backups' / ('trust-schema-' + datetime.datetime.now().strftime('%Y%m%d-%H%M%S'))
            backup_dir.mkdir(parents=True, exist_ok=False)
            (backup_dir / 'before.json').write_text(json.dumps({'version': version, 'missing': missing_objects, 'tables': snapshot}, ensure_ascii=False, default=str), encoding='utf-8')
            print('backup=' + str(backup_dir))
            compat_needed = version.startswith('5.6.')
            if compat_needed:
                for sql in statements(compatibility.read_text(encoding='utf-8-sig')):
                    cursor.execute(sql)
                print('MySQL 5.6 full unique-index prerequisite created')
            for index, sql in enumerate(statements(source_bytes.decode('utf-8-sig')), 1):
                cursor.execute(sql)
                (backup_dir / 'checkpoint.json').write_text(json.dumps({'migration': source_path.stem, 'completed_statement': index, 'checksum': source_checksum}), encoding='utf-8')
            cursor.execute(verify)
            missing_after = cursor.fetchall()
            if missing_after:
                raise RuntimeError('Schema verification incomplete: ' + repr(missing_after))
            for table in affected_tables:
                columns = ','.join('`' + column.replace('`', '``') + '`' for column in snapshot[table]['columns'])
                cursor.execute('SELECT ' + columns + ' FROM ' + table + ' ORDER BY id')
                if cursor.fetchall() != snapshot[table]['rows']:
                    raise RuntimeError('Existing data changed: ' + table)
            records = [(source_path.stem, source_checksum)]
            if compat_needed:
                records.append((compatibility.stem, hashlib.sha256(compatibility.read_bytes()).hexdigest()))
            for migration_id, checksum in records:
                cursor.execute('SELECT checksum_sha256,success FROM webwindows_schema_migrations WHERE migration_id=%s', (migration_id,))
                existing = cursor.fetchone()
                if existing is not None and existing != (checksum, 1):
                    raise RuntimeError('Migration history drift: ' + migration_id)
                if existing is None:
                    cursor.execute('INSERT INTO webwindows_schema_migrations(migration_id,checksum_sha256,success) VALUES(%s,%s,1)', (migration_id, checksum))
            cursor.execute('SELECT COUNT(*) FROM webwindows_schema_migrations WHERE migration_id=%s AND checksum_sha256=%s AND success=1', (source_path.stem, source_checksum))
            if cursor.fetchone()[0] != 1:
                raise RuntimeError('Application trust gate did not verify')
            print('VERIFIED: trust schema, full unique indexes, application checksum gate, unchanged catalog/submission data')
    finally:
        connection.close()


if __name__ == '__main__':
    main()
