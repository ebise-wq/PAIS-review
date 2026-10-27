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
let backup;
if (local) {
  // The site takes any Postgres URL it finds; leave it only this one.
  for (const name of Object.keys(process.env)) if (/^postgres/i.test(process.env[name] ?? '')) delete process.env[name];
  process.env.DATABASE_URL = url;
  lib = await import('../src/lib/comments.ts');
  backup = await import('../src/lib/backup.ts');
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

test('an edit is marked, keeps the earlier text, and saving the same text changes nothing', { skip }, async () => {
  const target = slug();
  const id = await post(target, { body: 'First version of the point' });
  assert.equal(await lib.editComment(id, 'Second version of the point'), true);
  assert.equal(await lib.editComment(id, 'Second version of the point'), false);
  const [comment] = await lib.listComments('review', target, 'voter-a');
  assert.equal(comment.body, 'Second version of the point');
  assert.ok(comment.editedAt);
  assert.deepEqual((await lib.commentHistory(id)).map((h) => h.body), ['First version of the point']);
});

test('only the author’s browser sees a comment as its own', { skip }, async () => {
  const target = slug();
  await post(target);
  assert.equal((await lib.listComments('review', target, 'voter-a'))[0].own, true);
  assert.equal((await lib.listComments('review', target, 'voter-b'))[0].own, false);
  assert.equal((await lib.listComments('review', target, null))[0].own, false);
  assert.equal((await lib.commentAuthor(Number((await lib.listComments('review', target, null))[0].id))).voter, 'voter-a');
});

test('retracting and resolving can be undone, and the thread markdown says so', { skip }, async () => {
  const target = slug();
  const id = await post(target);
  await lib.setRetracted(id, true);
  await lib.setResolved(id, true);
  let [comment] = await lib.listComments('review', target, null);
  assert.equal(comment.retracted, true);
  assert.equal(comment.resolved, true);
  assert.match(lib.renderCommentsMarkdown([comment]), /\[retracted by its author\] \[resolved\]/);
  await lib.setRetracted(id, false);
  await lib.setResolved(id, false);
  [comment] = await lib.listComments('review', target, null);
  assert.equal(comment.retracted, false);
  assert.equal(comment.resolved, false);
});

test('a removed comment and its replies are kept aside, with their votes', { skip }, async () => {
  const target = slug();
  const root = await post(target);
  await post(target, { parentId: root, voter: 'voter-b' });
  await lib.vote(root, 'voter-c', 'heart', 1);
  await lib.deleteComment(root);
  const kept = await db.query(
    `select data from comments_removed where data->'comment'->>'target_slug' = $1 order by comment_id`,
    [target],
  );
  assert.equal(kept.length, 2);
  assert.equal(kept[0].data.votes.length, 2); // the author's own upvote and the heart
});

test('a backup puts back what was lost, and leaves what is still there alone', { skip }, async () => {
  const target = slug();
  const root = await post(target, { body: 'Worth keeping' });
  await post(target, { parentId: root, voter: 'voter-b', body: 'A reply worth keeping' });
  await lib.editComment(root, 'Worth keeping, edited');
  await lib.setRating(target, 'voter-a', 4);
  const saved = JSON.parse(JSON.stringify(await backup.exportAll())); // as the downloaded file

  await db.query(`delete from comments where target_slug = $1`, [target]);
  await db.query(`delete from ratings where review_slug = $1`, [target]);
  const added = await backup.restoreAll(saved);
  assert.ok(added.comments >= 2 && added.ratings >= 1 && added.comment_edits >= 1);

  const [comment] = await lib.listComments('review', target, 'voter-a');
  assert.equal(comment.body, 'Worth keeping, edited');
  assert.equal(comment.replies[0].body, 'A reply worth keeping');
  assert.equal(comment.karma, 1);
  assert.deepEqual(await lib.commentHistory(root).then((h) => h.map((e) => e.body)), ['Worth keeping']);
  assert.equal((await lib.getRating(target, 'voter-a')).mine, 4);

  const again = await backup.restoreAll(saved);
  assert.ok(Object.values(again).every((n) => n === 0));
  assert.ok((await post(target)) > root); // new comments get fresh ids
});
