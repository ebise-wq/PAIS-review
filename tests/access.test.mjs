import { test } from 'node:test';
import assert from 'node:assert/strict';
import { accessOf, accessSummary, readList } from '../src/lib/types.ts';

test('reads yes/no and true/false, and nothing else', () => {
  assert.deepEqual(accessOf({ fullText: 'Yes', figures: 'no', supplement: 'maybe' }), { fullText: true, figures: false });
  assert.equal(accessOf('full text'), undefined);
  assert.equal(accessOf({}), undefined);
});

test('says what was read and what was not, in a sentence', () => {
  assert.equal(accessSummary({ fullText: true, figures: true, supplement: false }), 'Full text and figures; not the supplement');
  assert.equal(accessSummary({ fullText: false }), 'Not the full text');
  assert.equal(accessSummary({ fullText: true, figures: true, supplement: true }), 'Full text, figures and supplement');
});

test('what was read is one list, from the free list or from the older yes/no fields', () => {
  assert.deepEqual(readList({ read: ['Full text', 'Figure 2, as an image'] }), ['Full text', 'Figure 2, as an image']);
  assert.deepEqual(readList({ access: { fullText: true, figures: false }, sources: ['https://example.org'] }), [
    'Full text; not the figures',
    'https://example.org',
  ]);
  assert.deepEqual(readList({}), []);
});
