// Run with: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { closingSummary, displayOrder, reconcileGrade, statedGrade } from '../src/lib/hoist.ts';

const SIGNALS = ['promising', 'mixed', 'unconvincing', 'too-early'];

const newFormat = (last) => `## Study design

No control group.

## Final assessment

Reasons both ways.

## Executive summary

An uncontrolled study.

${last}`;

const oldFormat = `## Executive summary

An uncontrolled study.

## Study design

No control group.

## Final assessment

Grade: 3 / 10.`;

test('grade present: read from the closing summary', () => {
  assert.deepEqual(reconcileGrade(newFormat('**Grade: 3.5 / 10.**'), {}, SIGNALS), { score: 3.5 });
  assert.deepEqual(reconcileGrade(newFormat('Grade: 7 out of 10'), {}, SIGNALS), { score: 7 });
});

test('grade present and agreeing with the frontmatter', () => {
  assert.deepEqual(reconcileGrade(newFormat('Grade: 3 / 10.'), { score: 3 }, SIGNALS), { score: 3 });
  assert.deepEqual(reconcileGrade(newFormat('Grade: 3 / 10.'), { score: '3' }, SIGNALS), { score: 3 });
});

test('body and frontmatter disagree: fails loudly', () => {
  assert.throws(() => reconcileGrade(newFormat('Grade: 3 / 10.'), { score: 3.5 }, SIGNALS), /Make them agree/);
  assert.throws(
    () => reconcileGrade(newFormat('Signal: promising.'), { signal: 'mixed' }, SIGNALS),
    /Make them agree/,
  );
});

test('grade absent: nothing stated, frontmatter is left to decide', () => {
  assert.equal(reconcileGrade(newFormat('No grade line here.'), { score: 4 }, SIGNALS), null);
});

test('malformed grade: throws rather than falling back', () => {
  assert.throws(() => statedGrade('## Executive summary\n\nGrade: three', SIGNALS), /Grade: 6.5 \/ 10/);
  assert.throws(() => statedGrade('## Executive summary\n\nGrade: 6.3 / 10.', SIGNALS), /steps of 0.5/);
  assert.throws(() => statedGrade('## Executive summary\n\nGrade: 11 / 10.', SIGNALS), /1 to 10/);
  assert.throws(() => statedGrade('## Executive summary\n\nGrade: 0 / 10.', SIGNALS), /1 to 10/);
  assert.throws(() => statedGrade('## Executive summary\n\nSignal: great.', SIGNALS), /must be one of/);
});

test('signal for preliminary findings', () => {
  assert.deepEqual(reconcileGrade(newFormat('Signal: too early.'), {}, SIGNALS), { signal: 'too-early' });
});

test('old-format file: left exactly as it is', () => {
  assert.equal(closingSummary(oldFormat), null);
  assert.equal(displayOrder(oldFormat), oldFormat);
  assert.equal(reconcileGrade(oldFormat, { score: 3 }, SIGNALS), null);
});

test('new-format file: summary shown first, analysis order kept', () => {
  const shown = displayOrder(newFormat('Grade: 3 / 10.'));
  assert.match(shown, /^## Executive summary\n\nAn uncontrolled study\.\n\nGrade: 3 \/ 10\.\n\n## Study design/);
  assert.ok(shown.indexOf('## Study design') < shown.indexOf('## Final assessment'));
});

test('a heading inside a code fence is not a section', () => {
  const body = `## Study design\n\n\`\`\`\n## Executive summary\n\`\`\`\n\nText.`;
  assert.equal(closingSummary(body), null);
});

test('a body that is only a summary is not moved', () => {
  assert.equal(closingSummary('## Executive summary\n\nGrade: 5 / 10.'), null);
});
