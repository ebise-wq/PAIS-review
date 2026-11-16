import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cleanSql, formatCsv, formatTable, refuseUnlessReadOnly } from '../src/lib/catalogue-query.ts';

test('only single read-only statements pass', () => {
  assert.equal(refuseUnlessReadOnly('select 1;'), null);
  assert.equal(refuseUnlessReadOnly('  -- top papers\n WITH t AS (select 1) select * from t'), null);
  assert.equal(refuseUnlessReadOnly("select 'a;b' as x"), null);
  assert.equal(refuseUnlessReadOnly('explain select 1'), null);
  assert.match(refuseUnlessReadOnly('delete from papers'), /read/);
  assert.match(refuseUnlessReadOnly('select 1; drop table papers'), /One statement/);
  assert.match(refuseUnlessReadOnly('with x as (delete from papers returning *) select * from x'), /read/);
  assert.match(refuseUnlessReadOnly('   '), /empty/);
  assert.equal(cleanSql('/* c */ select 1 ; '), 'select 1');
});

test('rows print as a table with long values cut, or as full CSV', () => {
  const rows = [
    { title: 'A very long title that goes on', cited_by: 12, conditions: ['ME/CFS', 'Long COVID'] },
    { title: 'Short, "quoted"', cited_by: 3, conditions: [] },
  ];
  const table = formatTable(rows, 12);
  assert.match(table, /^title +\| cited_by \| conditions/);
  assert.match(table, /A very long… \| 12 +\| ME/);
  assert.equal(formatTable([]), '(no rows)\n');
  assert.equal(
    formatCsv(rows),
    'title,cited_by,conditions\nA very long title that goes on,12,ME/CFS; Long COVID\n"Short, ""quoted""",3,\n',
  );
});

test('the site never connects with the read-only catalogue role', async () => {
  const saved = { ...process.env };
  for (const name of Object.keys(process.env)) if (/^postgres/i.test(process.env[name] ?? '')) delete process.env[name];
  process.env.CATALOGUE_DATABASE_URL = 'postgres://reader:x@example.neon.tech/db';
  try {
    const db = await import('../src/lib/db.ts');
    assert.deepEqual(db.postgresEnvNames(), []);
    assert.equal(db.dbConfigured(), false);
  } finally {
    process.env = saved;
  }
});
