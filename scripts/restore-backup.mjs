#!/usr/bin/env node
/**
 * Puts a backup downloaded from /admin back into a database:
 *
 *   DATABASE_URL=postgres://… npm run -s restore-backup -- pais-review-backup-2026-10-26.json
 *
 * Rows already in the database are left alone; only missing ones are added, so it is safe
 * to run against a database that lost some rows, or an empty new one.
 */
import fs from 'node:fs';
import { restoreAll } from '../src/lib/backup.ts';
import { closeDb, dbConfigured } from '../src/lib/db.ts';

const [file] = process.argv.slice(2);
if (!file || !fs.existsSync(file)) {
  console.error('Usage: DATABASE_URL=… restore-backup <backup.json>');
  process.exit(1);
}
if (!dbConfigured()) {
  console.error('Set DATABASE_URL to the database to restore into.');
  process.exit(1);
}
const added = await restoreAll(JSON.parse(fs.readFileSync(file, 'utf8')));
console.log('Rows added:', added);
await closeDb();
