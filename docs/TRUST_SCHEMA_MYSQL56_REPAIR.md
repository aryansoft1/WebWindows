# MySQL 5.6 trust schema repair

Production MySQL 5.6 uses the 767-byte InnoDB index limit. Frozen migration 001 needs an 800-byte utf8mb4 release version key. Migration 008 prepares the same table with an ASCII version column, consistent with the package validator, retaining the complete unique key within 680 bytes. Run this prerequisite before 001; do not edit the frozen migration or relax the application trust gate.

The targeted runner reads WEBWINDOWS_DB_HOST, WEBWINDOWS_DB_USER, WEBWINDOWS_DB_PASSWORD and WEBWINDOWS_DB_DATABASE from the process environment. It requires PyMySQL and CREATE ROUTINE permission.

```powershell
py tools/repair-trust-schema-mysql56.py
py tools/repair-trust-schema-mysql56.py --apply
```

The first command only reports missing schema objects. Apply backs up catalog/submission schema and rows under the ignored .deployment-backups/trust-schema-* directory, executes 008 then the unchanged 001, and records each completed statement in checkpoint.json. It verifies the schema and compares existing rows before registering successful migration checksums. MySQL DDL commits individually; interrupted execution can resume using the idempotent statements after reviewing its checkpoint. Stop on checksum drift or data mismatch.

This repair does not replay migrations 003–007 or approve/publish developer submissions. The public catalog endpoint may seed a newer bundled catalog through its existing behavior; historical catalog rows remain preserved.
