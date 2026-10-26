import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { compareReviews, hasChanges, methodChangesSince, parseChangelog, splitChangelog } from '../src/lib/changes.ts';

const base = {
  score: 5,
  verdict: 'A careful study with a weak control group.',
  strengths: ['Large sample'],
  weaknesses: ['No blinding', 'Short follow-up'],
  body: '## Design\n\n**It was** a trial of 103 people.\n\nUnchanged paragraph.\n\nA paragraph that goes.',
};

test('nothing changed, nothing reported', () => {
  assert.equal(hasChanges(compareReviews(base, { ...base })), false);
});

test('grade, verdict, list items and paragraphs are compared separately', () => {
  const after = {
    ...base,
    score: 4.5,
    verdict: 'A careful study with no real control group.',
    weaknesses: ['No blinding', 'Follow-up of only 12 weeks'],
    body: '## Design\n\nIt was a trial of 102 people.\n\nUnchanged paragraph.\n\nA new closing paragraph.',
  };
  const changes = compareReviews(base, after);
  assert.deepEqual(changes.fields.map((f) => f.field), ['Grade', 'Verdict', 'Weaknesses']);
  assert.deepEqual(changes.fields[0].pieces.map((p) => p.text), ['5 / 10', '4.5 / 10']);
  assert.deepEqual(changes.fields[2].pieces, [
    { kind: 'removed', text: 'Short follow-up' },
    { kind: 'added', text: 'Follow-up of only 12 weeks' },
  ]);
  assert.equal(changes.paragraphs.length, 2);
  assert.ok(changes.paragraphs[0].some((p) => p.kind === 'removed' && p.text.includes('103')));
  assert.ok(changes.paragraphs[0].some((p) => p.kind === 'added' && p.text.includes('102')));
});

test('method changes since a review are read from the real changelog', () => {
  const guide = fs.readFileSync('content/guide.md', 'utf8');
  const entries = parseChangelog(splitChangelog(guide).changelog ?? '');
  assert.ok(entries.length > 5);
  assert.match(entries[0].version, /^\d+\.\d+/);
  // Entries wrap over lines in the file; each must come through whole.
  assert.match(entries.find((e) => e.version === '0.8.6').text, /No other band changed\.$/);
  const since = methodChangesSince('0.8.4', entries);
  assert.ok(since.every((e) => e.version !== '0.8.4' && e.version !== '0.8.3'));
  assert.ok(since.some((e) => e.version === '0.8.5'));
});
