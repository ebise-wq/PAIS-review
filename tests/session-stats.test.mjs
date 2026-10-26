import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseFactCheck, sessionUrl, sumUsage } from '../src/lib/session-stats.ts';
import { setFrontmatterField } from '../src/lib/frontmatter.ts';
import { parseReview } from '../src/lib/reviews.ts';

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

test('the fact check tally is four whole numbers, with no more fixed than found', () => {
  assert.deepEqual(parseFactCheck('0, 2, 5, 6'), { major: 0, moderate: 2, minor: 5, fixed: 6 });
  assert.throws(() => parseFactCheck('1,2,3'));
  assert.throws(() => parseFactCheck('0,0,1,2'), /More fixed/);
});

test('a cloud session id becomes its claude.ai address', () => {
  assert.equal(sessionUrl('cse_015Jbq9NHe9Pzk5njtJKiJHL'), 'https://claude.ai/code/session_015Jbq9NHe9Pzk5njtJKiJHL');
  assert.equal(sessionUrl(undefined), undefined);
});

test('the record is written on one line each and read back by the site', () => {
  let src = '---\ntitle: T\nkind: paper\nscore: 6\nverdict: "V."\nreviewedOn: 2026-10-26\n---\n\nBody.\n';
  src = setFrontmatterField(src, 'tokens', { input: 20, output: 10, cacheRead: 200, cacheWrite: 40 });
  src = setFrontmatterField(src, 'session', { minutes: 50, url: 'https://claude.ai/code/session_x' });
  src = setFrontmatterField(src, 'factCheck', { major: 0, moderate: 2, minor: 5, fixed: 6 });
  assert.match(src, /\ntokens: \{input: 20, output: 10, cacheRead: 200, cacheWrite: 40\}\n/);
  const review = parseReview(src, 't');
  assert.deepEqual(review.tokens, { input: 20, output: 10, cacheRead: 200, cacheWrite: 40 });
  assert.deepEqual(review.session, { minutes: 50, url: 'https://claude.ai/code/session_x' });
  assert.deepEqual(review.factCheck, { major: 0, moderate: 2, minor: 5, fixed: 6 });
});
