// The publish path: what a pasted review must contain, and what is written to the file.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildReviewFile, slugify } from '../src/lib/publish.ts';

const file = (frontmatter, body = '## Study design\n\nText.\n') =>
  `---\ntitle: "A study of something"\nverdict: "One line."\nreviewedOn: 2026-10-14\n${frontmatter}\n---\n\n${body}`;
const fails = (fn, pattern) => assert.throws(fn, pattern);

test('a paper needs a score from 1 to 10', () => {
  assert.equal(buildReviewFile(file('kind: paper\nscore: 6.5')).review.score, 6.5);
  fails(() => buildReviewFile(file('kind: paper')), /No grade found/);
  fails(() => buildReviewFile(file('kind: paper\nscore: 11')), /1 to 10/);
  fails(() => buildReviewFile(file('kind: paper\nscore: 0.5')), /1 to 10/);
});

test('literature reviews take no grade; preliminary findings take a signal', () => {
  assert.equal(buildReviewFile(file('kind: literature')).review.kind, 'literature');
  fails(() => buildReviewFile(file('kind: literature\nscore: 5')), /neither/);
  assert.equal(buildReviewFile(file('kind: preliminary\nsignal: mixed')).review.signal, 'mixed');
  fails(() => buildReviewFile(file('kind: preliminary\nscore: 5')), /preprint: true instead/);
});

test('a preprint is a graded paper', () => {
  const built = buildReviewFile(file('kind: paper\npreprint: true\nscore: 6'));
  assert.equal(built.review.preprint, true);
  assert.match(built.markdown, /preprint: true/);
  assert.equal(buildReviewFile(file('kind: preprint\nscore: 5')).review.kind, 'paper');
  fails(() => buildReviewFile(file('kind: preliminary\npreprint: true\nsignal: mixed')), /only applies to kind: paper/);
});

test('human input: from the form over the frontmatter, and validated', () => {
  assert.equal(buildReviewFile(file('kind: paper\nscore: 7\nhumanInput: Minor')).review.humanInput, 'minor');
  const fromForm = buildReviewFile(file('kind: paper\nscore: 7\nhumanInput: minor'), undefined, undefined, { humanInput: 'major' });
  assert.equal(fromForm.review.humanInput, 'major');
  fails(() => buildReviewFile(file('kind: paper\nscore: 7\nhumanInput: lots')), /must be one of/);
});

test('a draft is written with draft: true, and only then', () => {
  assert.match(buildReviewFile(file('kind: paper\nscore: 7'), undefined, undefined, { draft: true }).markdown, /\ndraft: true\n/);
  assert.doesNotMatch(buildReviewFile(file('kind: paper\nscore: 7')).markdown, /draft:/);
});

test('the grade in the closing summary must agree with the frontmatter', () => {
  const body = '## Study design\n\nText.\n\n## Executive summary\n\nSummary.\n\nGrade: 5 / 10.\n';
  assert.equal(buildReviewFile(file('kind: paper\nscore: 5', body)).review.score, 5);
  fails(() => buildReviewFile(file('kind: paper\nscore: 6', body)), /Make them agree/);
  // The grade can come from the summary alone.
  assert.equal(buildReviewFile(file('kind: paper', body)).review.score, 5);
});

test('missing essentials are named', () => {
  fails(() => buildReviewFile(''), /Nothing pasted/);
  fails(() => buildReviewFile('## Just a body'), /No frontmatter/);
  fails(() => buildReviewFile('---\nverdict: "x"\nkind: literature\n---\n\nBody'), /missing "title"/);
  fails(() => buildReviewFile('---\ntitle: "x"\nkind: literature\n---\n\nBody'), /missing "verdict"/);
});

test('filenames are cut at a word boundary', () => {
  const slug = slugify('Development and validation of blood-based diagnostic biomarkers for myalgic encephalomyelitis chronic fatigue syndrome using something');
  assert.ok(slug.length <= 80);
  assert.ok(!slug.endsWith('-'));
  assert.match(slug, /^development-and-validation/);
});

test('what the model read is kept, and odd values are dropped', () => {
  const built = buildReviewFile(file('kind: paper\nscore: 7\naccess:\n  fullText: yes\n  figures: false\n  colour: blue\nsources:\n  - "https://example.org/registration"'));
  assert.deepEqual(built.review.access, { fullText: true, figures: false });
  assert.deepEqual(built.review.sources, ['https://example.org/registration']);
  assert.match(built.markdown, /access:\n {2}fullText: true\n {2}figures: false/);
  assert.equal(buildReviewFile(file('kind: paper\nscore: 7')).review.access, undefined);
});
