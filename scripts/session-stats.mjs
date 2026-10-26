#!/usr/bin/env node
/**
 * Records how a review was made in <slug>.process.json beside it: token use and active
 * time from this Claude Code session's transcript. The fact-check findings in that file
 * are written by the review skill before this runs; they are kept, and checked.
 *
 *   npm run -s session-stats -- content/reviews/<file>.md
 *
 * The transcript is found from CLAUDE_CODE_SESSION_ID, or pass --transcript <path>. The
 * totals cover the whole session, including any other work done in it, so write one
 * review per session.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { sessionUrl, sumUsage } from '../src/lib/session-stats.ts';
import { factCheckSummary, parseProcess, readableCount, totalTokens } from '../src/lib/process.ts';

const args = process.argv.slice(2);
const option = (name) => {
  const at = args.indexOf(name);
  return at === -1 ? undefined : args.splice(at, 2)[1];
};
const transcriptArg = option('--transcript');
const [reviewPath] = args;
if (!reviewPath || !reviewPath.endsWith('.md') || !fs.existsSync(reviewPath)) {
  console.error('Usage: session-stats <review.md> [--transcript <file.jsonl>]');
  process.exit(1);
}
const recordPath = reviewPath.replace(/\.md$/, '.process.json');

function findTranscript() {
  if (transcriptArg) return transcriptArg;
  const dir = path.join(os.homedir(), '.claude', 'projects', process.cwd().replace(/[^A-Za-z0-9]/g, '-'));
  const id = process.env.CLAUDE_CODE_SESSION_ID;
  if (id && fs.existsSync(path.join(dir, `${id}.jsonl`))) return path.join(dir, `${id}.jsonl`);
  // Not told which: the most recently written transcript for this folder.
  const newest = fs.existsSync(dir)
    ? fs
        .readdirSync(dir)
        .filter((f) => f.endsWith('.jsonl'))
        .map((f) => path.join(dir, f))
        .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0]
    : undefined;
  if (!newest) throw new Error(`No session transcript found in ${dir}. Pass --transcript <file>.`);
  return newest;
}

/** The main transcript, plus any subagent transcripts kept in a folder named after it. */
function transcriptFiles(main) {
  const files = [main];
  const extra = main.replace(/\.jsonl$/, '');
  const walk = (dir) => {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.jsonl')) files.push(full);
    }
  };
  walk(extra);
  return files;
}

const files = transcriptFiles(findTranscript());
const lines = files.flatMap((file) => fs.readFileSync(file, 'utf8').split('\n'));
const totals = sumUsage(lines);

const existing = fs.existsSync(recordPath) ? JSON.parse(fs.readFileSync(recordPath, 'utf8')) : {};
const url = sessionUrl(process.env.CLAUDE_CODE_REMOTE_SESSION_ID);
const record = {
  ...existing,
  tokens: totals.tokens,
  session: { minutes: totals.minutes, ...(url ? { url } : {}) },
};
fs.writeFileSync(recordPath, `${JSON.stringify(record, null, 2)}\n`);

const { process: parsed, problems } = parseProcess(record);
console.log(
  `${recordPath}: ${readableCount(totalTokens(totals.tokens))} tokens over ${totals.calls} model calls ` +
    `(${files.length} transcript file${files.length === 1 ? '' : 's'}), ${totals.minutes} active minutes. ` +
    (parsed.factCheck ? `Fact check: ${factCheckSummary(parsed.factCheck.findings)}` : 'No fact check recorded yet.'),
);
for (const problem of problems) console.error(`  Problem: ${problem}`);
if (!parsed.factCheck || problems.length) process.exit(1);
