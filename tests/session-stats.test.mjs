import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sessionUrl, sumUsage } from '../src/lib/session-stats.ts';
import { factCheckSummary, parseProcess, readableCount } from '../src/lib/process.ts';

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
  assert.deepEqual(totals, { tokens: { input: 20, output: 10, cacheRead: 200, cacheWrite: 40 }, calls: 2, minutes: 15 });
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
