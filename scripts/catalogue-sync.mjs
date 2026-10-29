#!/usr/bin/env node
/**
 * Fills or refreshes the paper catalogue from a session or a laptop, without waiting for the
 * daily run: carries on from where the last run stopped until the pass is complete.
 *
 *   DATABASE_URL=postgres://... npm run -s catalogue-sync [-- --pages N] [-- --force]
 *
 * --force starts a new pass even if the last one finished within the week.
 */
import { closeDb, dbConfigured } from '../src/lib/db.ts';
import { syncCatalogue } from '../src/lib/catalogue.ts';

const args = process.argv.slice(2);
const at = args.indexOf('--pages');
const limit = at === -1 ? Infinity : Number(args[at + 1]);
let force = args.includes('--force');
if (!dbConfigured()) {
  console.error('Set DATABASE_URL to the Postgres database first.');
  process.exit(1);
}
let pages = 0;
for (;;) {
  const result = await syncCatalogue({ pages: 1, force });
  force = false;
  pages++;
  console.log(`${result.done}: +${result.fetched}, ${result.seenInPass} of ${result.hitCount ?? '?'} this pass`);
  if (result.done !== 'page' || pages >= limit) break;
}
await closeDb();
