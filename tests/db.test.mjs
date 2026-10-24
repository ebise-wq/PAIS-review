// Comments, votes, hearts, moderation and ratings against a real Postgres. Runs only when
// TEST_DATABASE_URL names a database on this machine, so it can never touch the live one.
// The GitHub checks start a throwaway Postgres for it; locally it is skipped without one.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

const url = process.env.TEST_DATABASE_URL ?? '';
const local = /^postgres(ql)?:\/\/[^@/]*@?(localhost|127\.0\.0\.1)[:/]/.test(url);
const skip = local ? false : 'set TEST_DATABASE_URL to a local Postgres to run these';
// In the GitHub checks these must run: a misnamed variable must not pass by skipping them.
if (process.env.CI && !local) throw new Error('TEST_DATABASE_URL must name a local Postgres in CI.');

let lib;
let db;
if (local) {
  // The site takes any Postgres URL it finds; leave it only this one.
  for (const name of Object.keys(process.env)) if (/^postgres/i.test(process.env[name] ?? '')) delete process.env[name];
  process.env.DATABASE_URL = url;
  lib = await import('../src/lib/comments.ts');
  db = await import('../src/lib/db.ts');
}

// Every test works on its own made-up review, so runs never see each other's rows.
const slug = () => `test-${crypto.randomUUID()}`;
const post = (target, extra = {}) =>
  lib.createComment({
    targetType: 'review',
    targetSlug: target,
    targetVersion: '0.8.5',
    parentId: null,
    username: 'reader',
    body: `A comment ${crypto.randomUUID()}`,
    voter: 'voter-a',
    ip: '192.0.2.1',
    ...extra,
  });

after(async () => {
  if (!local) return;
  await db.query(`delete from comments where target_slug like 'test-%'`);
  await db.query(`delete from ratings where review_slug like 'test-%'`);
  await db.closeDb();
});

test('a new comment starts with its author’s own upvote', { skip }, async () => {
  const target = slug();
  await post(target);
  const [comment] = await lib.listComments('review', target, 'voter-a');
  assert.equal(comment.karma, 1);
  assert.deepEqual(comment.mine, { karma: 1 });
  assert.equal(comment.version, '0.8.5');
});

test('replies nest under their parent, and cannot cross to another review', { skip }, async () => {
  const target = slug();
  const parentId = await post(target);
  await post(target, { parentId, voter: 'voter-b' });
  const [comment] = await lib.listComments('review', target, null);
  assert.equal(comment.replies.length, 1);
  await assert.rejects(post(slug(), { parentId }), /cannot be replied to/);
});

test('upvotes, agree votes and hearts count separately; a vote can change or be taken back', { skip }, async () => {
  const target = slug();
  const id = await post(target);
  await lib.vote(id, 'voter-b', 'karma', -1);
  await lib.vote(id, 'voter-c', 'karma', 1);
  await lib.vote(id, 'voter-b', 'agree', 1);
  await lib.vote(id, 'voter-c', 'agree', -1);
  await lib.vote(id, 'voter-b', 'heart', 1);
  let [comment] = await lib.listComments('review', target, 'voter-b');
  assert.deepEqual(
    { karma: comment.karma, agree: comment.agree, disagree: comment.disagree, hearts: comment.hearts },
    { karma: 1, agree: 1, disagree: 1, hearts: 1 },
  );
  assert.deepEqual(comment.mine, { karma: -1, agree: 1, heart: 1 });

  await lib.vote(id, 'voter-b', 'karma', 1); // changed mind
  await lib.vote(id, 'voter-b', 'heart', 0); // taken back
  [comment] = await lib.listComments('review', target, 'voter-b');
  assert.equal(comment.karma, 3);
  assert.equal(comment.hearts, 0);
  assert.deepEqual(comment.mine, { karma: 1, agree: 1 });
});

test('a hidden comment loses its text for readers, keeps its place if it has replies, and stays visible to admins', { skip }, async () => {
  const target = slug();
  const withReply = await post(target);
  await post(target, { parentId: withReply, voter: 'voter-b' });
  const alone = await post(target, { voter: 'voter-c' });
  await lib.setHidden(withReply, true);
  await lib.setHidden(alone, true);

  const forReaders = await lib.listComments('review', target, null);
  assert.equal(forReaders.length, 1);
  assert.equal(forReaders[0].body, '');
  assert.equal(forReaders[0].replies.length, 1);

  const forAdmin = await lib.listComments('review', target, null, { includeHidden: true });
  assert.equal(forAdmin.length, 2);
  assert.ok(forAdmin.every((comment) => comment.body));
});

test('deleting a comment takes its replies with it, and says how many', { skip }, async () => {
  const target = slug();
  const root = await post(target);
  const reply = await post(target, { parentId: root, voter: 'voter-b' });
  await post(target, { parentId: reply, voter: 'voter-c' });
  await post(target, { voter: 'voter-d' });
  assert.equal(await lib.countSubtree(root), 3);
  assert.equal(await lib.deleteComment(root), 3);
  assert.equal((await lib.listComments('review', target, null)).length, 1);
});

test('posting too fast, or the same text twice, is refused', { skip }, async () => {
  const target = slug();
  const voter = `voter-${crypto.randomUUID()}`;
  await post(target, { voter, body: 'The same words twice', ip: null });
  assert.match(await lib.isRateLimited(voter, null, 'The same words twice'), /already posted/);
  for (let i = 1; i < lib.LIMITS.perVoter; i++) await post(target, { voter, ip: null });
  assert.match(await lib.isRateLimited(voter, null, 'Something new'), /posting quickly/);
  assert.ok(!(await lib.isRateLimited(`voter-${crypto.randomUUID()}`, null, 'Something new')));
});

test('one rating per reader per review, which they can change; the index sees the totals', { skip }, async () => {
  const target = slug();
  await lib.setRating(target, 'voter-a', 2);
  await lib.setRating(target, 'voter-b', 5);
  await lib.setRating(target, 'voter-a', 4);
  assert.deepEqual(await lib.getRating(target, 'voter-a'), { average: 4.5, count: 2, mine: 4 });

  await post(target);
  const hidden = await post(target, { voter: 'voter-b' });
  await lib.setHidden(hidden, true);
  const totals = (await lib.listEngagement())[target];
  assert.equal(totals.comments, 1);
  assert.equal(totals.ratingAverage, 4.5);
  assert.equal(totals.ratingCount, 2);
});
