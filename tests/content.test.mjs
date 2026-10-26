// The files the site is built from. A broken one fails here before it fails a deploy.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseReview } from '../src/lib/reviews.ts';
import { parseBacklog, serializeBacklog } from '../src/lib/backlog.ts';
import { parseOverrides } from '../src/lib/site-text-schema.ts';
import { getDoc } from '../src/lib/doc.ts';
import { parseTagList } from '../src/lib/tags.ts';
import { parseProcess } from '../src/lib/process.ts';

test('every review file parses', () => {
  const files = fs.readdirSync('content/reviews').filter((f) => f.endsWith('.md'));
  assert.ok(files.length > 0);
  for (const f of files) parseReview(fs.readFileSync(`content/reviews/${f}`, 'utf8'), f.replace(/\.md$/, ''));
});

test('the guide has a version and a changelog', () => {
  const guide = getDoc('guide');
  assert.match(guide.version ?? '', /^\d+\.\d+(\.\d+)?$/);
  assert.match(guide.body, /^## Changelog$/m);
});

test('the backlog is in the form the admin panel writes', () => {
  const source = fs.readFileSync('content/backlog.md', 'utf8');
  assert.equal(serializeBacklog(parseBacklog(source)), source);
});

test('the stored site text has no problems', () => {
  const { problems } = parseOverrides(JSON.parse(fs.readFileSync('content/site-text.json', 'utf8')));
  assert.deepEqual(problems, []);
});

test('the tag list reads cleanly, and every tag on a review is on it', () => {
  const { tags, problems } = parseTagList(JSON.parse(fs.readFileSync('content/tags.json', 'utf8')));
  assert.deepEqual(problems, []);
  const conditions = new Set(tags.conditions.map((t) => t.label));
  const designs = new Set(tags.designs.map((t) => t.id));
  const topics = new Set(tags.topics.map((t) => t.id));
  for (const f of fs.readdirSync('content/reviews').filter((name) => name.endsWith('.md'))) {
    const review = parseReview(fs.readFileSync(`content/reviews/${f}`, 'utf8'), f.replace(/\.md$/, ''));
    for (const name of review.conditions ?? []) assert.ok(conditions.has(name), `${f}: condition ${name} is not in the tag list`);
    if (review.design) assert.ok(designs.has(review.design), `${f}: unknown design ${review.design}`);
    for (const id of review.topics ?? []) assert.ok(topics.has(id), `${f}: unknown topic ${id}`);
  }
});

test('every record of how a review was made reads cleanly and belongs to a review', () => {
  for (const f of fs.readdirSync('content/reviews').filter((name) => name.endsWith('.process.json'))) {
    assert.ok(fs.existsSync(`content/reviews/${f.replace(/\.process\.json$/, '.md')}`), `${f} has no review`);
    const { problems } = parseProcess(JSON.parse(fs.readFileSync(`content/reviews/${f}`, 'utf8')));
    assert.deepEqual(problems, [], f);
  }
});
