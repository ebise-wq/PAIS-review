import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sessionUrl, sumUsage } from '../src/lib/session-stats.ts';
import { factCheckSummary, parseProcess, readableCount } from '../src/lib/process.ts';
import { costOf, formatDollars, priceKey, sessionCost } from '../src/lib/pricing.ts';

const line = (id, usage, timestamp) => JSON.stringify({ type: 'assistant', timestamp, message: { id, usage } });

test('a model call is counted once, however many lines repeat it; long pauses are not counted as time', () => {
  const usage = { input_tokens: 10, output_tokens: 5, cache_read_input_tokens: 100, cache_creation_input_tokens: 20 };
  const totals = sumUsage([
    line('msg_1', { ...usage, output_tokens: 1 }, '2026-10-26T10:00:00Z'),
    line('msg_1', usage, '2026-10-26T10:00:01Z'),
    line('msg_2', usage, '2026-10-26T10:05:00Z'),
    '{"type":"user","timestamp":"2026-10-28T09:00:00Z"}',
    'not json',
  ]);
  const tokens = { input: 20, output: 10, cacheRead: 200, cacheWrite: 40, cacheWrite1h: 0 };
  assert.deepEqual(totals, { tokens, byModel: { unknown: tokens }, calls: 2, minutes: 15 });
});

test('tokens are also totalled per model, with one-hour cache writes counted apart', () => {
  const call = (id, model, usage) => JSON.stringify({ type: 'assistant', message: { id, model, usage } });
  const usage = { input_tokens: 1, output_tokens: 2, cache_read_input_tokens: 3, cache_creation_input_tokens: 10, cache_creation: { ephemeral_1h_input_tokens: 6 } };
  const totals = sumUsage([
    call('a', 'claude-opus-5-5', usage),
    call('b', 'claude-opus-5-5', usage),
    call('c', 'claude-haiku-5-5', usage),
    call('d', '<synthetic>', { input_tokens: 0, output_tokens: 0 }),
  ]);
  assert.deepEqual(Object.keys(totals.byModel).sort(), ['claude-haiku-5-5', 'claude-opus-5-5']);
  assert.deepEqual(totals.byModel['claude-opus-5-5'], { input: 2, output: 4, cacheRead: 6, cacheWrite: 20, cacheWrite1h: 12 });
  assert.equal(totals.tokens.cacheWrite1h, 18);
});

test('cost at API prices: each model at its own rate, cache writes by duration', () => {
  const million = { input: 1e6, output: 1e6, cacheRead: 1e6, cacheWrite: 1e6, cacheWrite1h: 0 };
  // Opus 5.5: $4 in, $20 out, $0.20 cache read, five-minute write at 1.25 × $4.
  assert.equal(costOf(million, 'claude-opus-5-5'), 4 + 20 + 0.2 + 5);
  // Older records do not split writes: they are priced as one-hour writes (2 × input).
  const { cacheWrite1h, ...unsplit } = million;
  assert.equal(costOf(unsplit, 'claude-opus-5-5[1m]'), 4 + 20 + 0.2 + 8);
  assert.equal(costOf(million, 'some-other-model'), undefined);
  assert.equal(priceKey('anthropic.claude-sonnet-5-5'), 'claude-sonnet-5-5');
  // With a per-model breakdown, the review's own model is not used.
  assert.equal(sessionCost(million, { 'claude-sonnet-5-5': million }, 'claude-opus-5-5'), 2 + 10 + 0.2 + 2.5);
  assert.equal(sessionCost(million, undefined, 'claude-opus-5-5'), 4 + 20 + 0.2 + 5);
  assert.equal(sessionCost(million, { 'claude-opus-5-5': million, mystery: million }, undefined), undefined);
  assert.equal(formatDollars(1234.567), '$1,234.57');
  assert.equal(formatDollars(0.001), 'under $0.01');
});

test('the per-model totals are read back from the record', () => {
  const t = { input: 1, output: 2, cacheRead: 3, cacheWrite: 4, cacheWrite1h: 4 };
  const { process, problems } = parseProcess({ tokens: t, tokensByModel: { 'claude-opus-5-5': t, bad: { input: 'x' } } });
  assert.deepEqual(process.tokensByModel, { 'claude-opus-5-5': t });
  assert.equal(problems.length, 1);
});

test('a cloud session id becomes its claude.ai address', () => {
  assert.equal(sessionUrl('cse_015Jbq9NHe9Pzk5njtJKiJHL'), 'https://claude.ai/code/session_015Jbq9NHe9Pzk5njtJKiJHL');
  assert.equal(sessionUrl(undefined), undefined);
});

const finding = (severity, outcome, extra = {}) => ({ severity, outcome, claim: 'n=103', issue: 'The source says 102.', ...extra });

test('the record is read field by field; a bad finding is dropped with a reason, not fatal', () => {
  const { process, problems } = parseProcess({
    tokens: { input: 1, output: 2, cacheRead: 3, cacheWrite: 4 },
    session: { minutes: 48, url: 'https://claude.ai/code/session_x' },
    factCheck: {
      findings: [
        finding('major', 'fixed'),
        finding('minor', 'disputed', { response: 'Table 1 gives 103.' }),
        { severity: 'huge', outcome: 'fixed', claim: 'x', issue: 'y' },
        finding('moderate', 'partly'),
      ],
    },
  });
  assert.deepEqual(process.tokens, { input: 1, output: 2, cacheRead: 3, cacheWrite: 4 });
  assert.equal(process.factCheck.findings.length, 3);
  assert.equal(problems.length, 2); // the bad severity, and "partly" without a response
});

test('the summary says, per severity, what happened to each issue', () => {
  assert.equal(
    factCheckSummary([finding('major', 'fixed'), finding('moderate', 'fixed'), finding('moderate', 'disputed'), finding('minor', 'fixed'), finding('minor', 'fixed')]),
    '1 major (fixed); 2 moderate (1 fixed, 1 disputed); 2 minor (fixed)',
  );
  assert.equal(factCheckSummary([]), 'No issues found.');
  assert.equal(readableCount(2_430_000), '2.4 million');
});
