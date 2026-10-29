// The catalogue's record handling always runs; the sync runs against a real Postgres only
// when TEST_DATABASE_URL names one on this machine, as in db.test.mjs.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { accessOf, conditionsOf, kindOf, toRow } from '../src/lib/catalogue.ts';

test('kinds: preprints, reviews by label or title, commentary, research', () => {
  assert.equal(kindOf('PPR', [], 'Anything'), 'preprint');
  assert.equal(kindOf('MED', ['Review', 'Journal Article'], 'Long COVID'), 'review');
  assert.equal(kindOf('MED', ['Journal Article'], 'Effect of vaccination on long covid: systematic review'), 'review');
  assert.equal(kindOf('MED', ['Editorial'], 'Long covid'), 'commentary');
  assert.equal(kindOf('MED', ['research-article', 'Journal Article'], 'Muscle abnormalities worsen after PEM'), 'research');
});

test('conditions are read from title and abstract, with hyphen and spacing variants', () => {
  assert.deepEqual(conditionsOf('Post COVID-19 condition and myalgic encephalomyelitis'), ['ME/CFS', 'Long COVID']);
  assert.deepEqual(conditionsOf('Fatigue in PASC'), ['Long COVID']);
  assert.deepEqual(conditionsOf('Q fever fatigue syndrome'), ['Other']);
  assert.deepEqual(conditionsOf('Post-COVID era education'), []);
  assert.deepEqual(conditionsOf('The passcode study'), []);
});

test('access: open licence, free copy, or paywalled, with the best link', () => {
  assert.deepEqual(accessOf({ isOpenAccess: 'Y', pmcid: 'PMC1' }), { access: 'open', best_url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC1/' });
  assert.deepEqual(
    accessOf({ isOpenAccess: 'N', fullTextUrlList: { fullTextUrl: [{ availabilityCode: 'F', documentStyle: 'pdf', url: 'https://x/a.pdf' }, { availabilityCode: 'F', documentStyle: 'html', url: 'https://x/a' }] } }),
    { access: 'free', best_url: 'https://x/a' },
  );
  assert.deepEqual(accessOf({ isOpenAccess: 'N', doi: '10.1/x' }), { access: 'paywalled', best_url: 'https://doi.org/10.1/x' });
});

const record = (id, extra = {}) => ({
  id: String(id),
  source: 'MED',
  pmid: String(id),
  doi: `10.1/ABC${id}`,
  title: `Long COVID study ${id}.`,
  abstractText: '<h4>Background</h4>Patients with ME/CFS.',
  authorString: 'Smith A, Jones B.',
  journalInfo: { journal: { title: 'Journal' } },
  pubYear: '2023',
  firstPublicationDate: '2023-05-01',
  pubTypeList: { pubType: ['Journal Article'] },
  citedByCount: id * 10,
  isOpenAccess: 'N',
  ...extra,
});

test('a Europe PMC record becomes a row', () => {
  const row = toRow(record(7, { commentCorrectionList: { commentCorrection: [{ type: 'Retraction in' }] } }));
  assert.equal(row.id, 'MED:7');
  assert.equal(row.doi, '10.1/abc7');
  assert.equal(row.title, 'Long COVID study 7');
  assert.equal(row.abstract, 'Background Patients with ME/CFS.');
  assert.deepEqual(row.conditions, ['ME/CFS', 'Long COVID']);
  assert.equal(row.in_title, true);
  assert.equal(row.retracted, true);
  assert.equal(row.year, 2023);
  assert.equal(row.cited_by, 70);
});

const url = process.env.TEST_DATABASE_URL ?? '';
const local = /^postgres(ql)?:\/\/[^@/]*@?(localhost|127\.0\.0\.1)[:/]/.test(url);
const skip = local ? false : 'set TEST_DATABASE_URL to a local Postgres to run these';
if (process.env.CI && !local) throw new Error('TEST_DATABASE_URL must name a local Postgres in CI.');

let lib;
let db;
if (local) {
  for (const name of Object.keys(process.env)) if (/^postgres/i.test(process.env[name] ?? '')) delete process.env[name];
  process.env.DATABASE_URL = url;
  lib = await import('../src/lib/catalogue.ts');
  db = await import('../src/lib/db.ts');
  after(() => db.closeDb());
}

test('the sync reads page by page, resumes, finishes a pass, then waits a week', { skip }, async () => {
  await db.query('delete from papers');
  await db.query(`update catalogue_sync set cursor = null, pass_done = null, pass_started = null, seen_in_pass = 0, last_error = null`);
  // Three pages of two records; the last page's cursor repeats, which ends the pass.
  const pages = { '*': ['c1', [1, 2]], c1: ['c2', [3, 4]], c2: ['c2', [5]] };
  const calls = [];
  const fetchJson = async (u) => {
    const cursor = new URL(u).searchParams.get('cursorMark');
    calls.push(cursor);
    const [next, ids] = pages[cursor];
    return { hitCount: 5, nextCursorMark: next, resultList: { result: ids.map((id) => record(id)) } };
  };

  let result = await lib.syncCatalogue({ pages: 1, fetchJson });
  assert.equal(result.done, 'page');
  assert.equal(result.seenInPass, 2);
  result = await lib.syncCatalogue({ pages: 5, fetchJson });
  assert.equal(result.done, 'pass-complete');
  assert.equal(result.seenInPass, 5);
  assert.deepEqual(calls, ['*', 'c1', 'c2']);

  result = await lib.syncCatalogue({ pages: 5, fetchJson });
  assert.equal(result.done, 'up-to-date');
  assert.equal(calls.length, 3);

  // Re-reading a record updates it rather than duplicating it.
  pages['*'] = ['*', [1]];
  const changed = fetchJson;
  result = await lib.syncCatalogue({ pages: 1, force: true, fetchJson: changed });
  assert.equal(result.done, 'pass-complete');
  const stats = await lib.catalogueStats();
  assert.equal(stats.total, 5);
  assert.equal(stats.byCondition['Long COVID'], 5);

  const top = await lib.topUnreviewed(['10.1/ABC5'], 3);
  assert.deepEqual(top.map((p) => p.doi), ['10.1/abc4', '10.1/abc3', '10.1/abc2']);
  const csv = await lib.catalogueCsv();
  assert.match(csv.split('\n')[1], /^10\.1\/abc5,/);
});

test('a failed fetch is recorded and the cursor kept', { skip }, async () => {
  await db.query(`update catalogue_sync set cursor = 'keep', last_error = null`);
  await assert.rejects(lib.syncCatalogue({ fetchJson: async () => { throw new Error('Europe PMC answered 503.'); } }));
  const state = await lib.syncState();
  assert.equal(state.cursor, 'keep');
  assert.equal(state.last_error, 'Europe PMC answered 503.');
  await db.query(`update catalogue_sync set cursor = null`);
});
