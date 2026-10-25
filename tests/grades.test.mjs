import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseGradeScheme } from '../src/lib/grades.ts';

test('the grade scheme is read from the instructions, with the site’s band labels', () => {
  const bands = parseGradeScheme(fs.readFileSync('content/instructions.md', 'utf8'));
  assert.deepEqual(bands.map((b) => `${b.range} ${b.label}`), [
    '8–10 Strong',
    '6.5–7.9 Solid',
    '5–6.4 Borderline',
    '3–4.9 Fails',
    '0–2.9 Fatal flaws',
  ]);
  assert.match(bands[3].text, /^The design cannot separate .+ natural history\.$/);
});

test('no scheme section, no bands', () => {
  assert.deepEqual(parseGradeScheme('## Something else\n\n- **1–2** — x'), []);
});
