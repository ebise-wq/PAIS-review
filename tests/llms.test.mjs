import { test } from 'node:test';
import assert from 'node:assert/strict';
import { llmsTxt } from '../src/lib/llms.ts';

test('lists each review with its raw markdown, grade and verdict, then the method', () => {
  const out = llmsTxt({
    siteName: 'PAIS Reviews',
    description: 'Reviews of\nresearch.',
    siteUrl: 'https://example.org/',
    reviews: [
      { slug: 'a', title: 'Paper A', kind: 'paper', score: 4, verdict: 'Weak.' },
      { slug: 'b', title: 'Trial B', kind: 'preliminary', signal: 'unconvincing', verdict: 'No effect.' },
    ],
  });
  assert.match(out, /^# PAIS Reviews\n\n> Reviews of research\.\n/);
  assert.match(out, /- \[Paper A\]\(https:\/\/example\.org\/reviews\/a\.md\): 4\/10, Fails\. Weak\./);
  assert.match(out, /- \[Trial B\]\(https:\/\/example\.org\/reviews\/b\.md\): Unconvincing, Preliminary\. No effect\./);
  assert.match(out, /- \[Review guide\]\(https:\/\/example\.org\/guide\.md\)/);
});
