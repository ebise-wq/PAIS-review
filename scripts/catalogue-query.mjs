#!/usr/bin/env node
/**
 * Reads the paper catalogue from a Claude Code session. Sessions cannot open an ordinary
 * Postgres connection, so this queries Neon over HTTPS, as a role that can only read the
 * catalogue tables. Set CATALOGUE_DATABASE_URL in the environment; see docs/catalogue.md.
 *
 *   npm run -s catalogue-query -- "select title, cited_by from papers order by cited_by desc limit 10"
 *   npm run -s catalogue-query -- --file query.sql --csv > out.csv
 *
 * Options: --file <path> reads the query from a file; --csv or --json print every row in
 * full; otherwise a table of at most --limit rows (default 50), long values cut short.
 */
import fs from 'node:fs';
import { neon } from '@neondatabase/serverless';
import { formatCsv, formatTable, refuseUnlessReadOnly } from '../src/lib/catalogue-query.ts';

const args = process.argv.slice(2);
const take = (name) => {
  const at = args.indexOf(name);
  return at === -1 ? undefined : args.splice(at, 2)[1];
};
const flag = (name) => {
  const at = args.indexOf(name);
  if (at !== -1) args.splice(at, 1);
  return at !== -1;
};
const file = take('--file');
const limit = Number(take('--limit') ?? 50);
const asCsv = flag('--csv');
const asJson = flag('--json');
const sql = file ? fs.readFileSync(file, 'utf8') : args.join(' ');

const url = process.env.CATALOGUE_DATABASE_URL;
if (!url) {
  console.error('CATALOGUE_DATABASE_URL is not set. It holds the read-only catalogue role\'s connection string; see docs/catalogue.md.');
  process.exit(1);
}
const refused = refuseUnlessReadOnly(sql);
if (refused) {
  console.error(refused);
  process.exit(1);
}

let rows;
try {
  rows = await neon(url).query(sql);
} catch (error) {
  console.error(`Query failed: ${error instanceof Error ? error.message : error}`);
  process.exit(2);
}

if (asJson) process.stdout.write(JSON.stringify(rows, null, 2) + '\n');
else if (asCsv) process.stdout.write(formatCsv(rows));
else {
  process.stdout.write(formatTable(rows.slice(0, limit)));
  if (rows.length > limit) console.log(`… ${rows.length - limit} more rows. Add a LIMIT, raise --limit, or use --csv.`);
}
