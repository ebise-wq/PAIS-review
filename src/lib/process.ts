/**
 * How a review was made: a small file beside it, content/reviews/<slug>.process.json.
 * Kept out of the review's frontmatter so the review stays readable, and so new kinds of
 * record can be added without touching the reviews. The review page shows it under "How
 * this review was made". Pure functions; the build, the script and the tests share them.
 */
import type { TokenTotals } from './session-stats';
import type { Snapshot } from './changes';

export const SEVERITIES = ['major', 'moderate', 'minor'] as const;
export type Severity = (typeof SEVERITIES)[number];

export const OUTCOMES = ['fixed', 'partly', 'disputed'] as const;
export type Outcome = (typeof OUTCOMES)[number];

export const SEVERITY_LABELS: Record<Severity, string> = { major: 'Major', moderate: 'Moderate', minor: 'Minor' };
export const OUTCOME_LABELS: Record<Outcome, string> = { fixed: 'Fixed', partly: 'Partly fixed', disputed: 'Disputed' };

/** One issue the blind fact check reported, and what the reviewing model did about it. */
export interface Finding {
  severity: Severity;
  /** What the review said, quoted. */
  claim: string;
  /** What the fact check reported was wrong with it. */
  issue: string;
  /** What the source says, quoted, where the fact check gave it. */
  source?: string;
  outcome: Outcome;
  /** Why the reviewing model disagreed, or fixed it only in part. Short. */
  response?: string;
}

export interface ReviewProcess {
  tokens?: TokenTotals;
  /** Active minutes, and the claude.ai link for a cloud session. */
  session?: { minutes?: number; url?: string };
  /** Present once a fact check has run, even if it found nothing. */
  factCheck?: { findings: Finding[] };
  /**
   * The review as Claude handed it over, after its own fact check, before anyone else
   * changed it. Recorded once; the page compares the current review against it.
   */
  original?: Snapshot & { savedAt: string };
  /** The repository version the review was written under: its instructions and skill. */
  commit?: string;
  /** Dated notes on changes made after the review was handed over: corrections, re-grades. */
  changes?: { date: string; summary: string }[];
}

const text = (value: unknown, max: number) =>
  typeof value === 'string' && value.trim() ? value.replace(/\s+/g, ' ').trim().slice(0, max) : undefined;
const count = (value: unknown) => (Number.isInteger(value) && (value as number) >= 0 ? (value as number) : undefined);

/** Reads the file's contents. Anything malformed is dropped with a note, never thrown. */
export function parseProcess(raw: unknown): { process: ReviewProcess; problems: string[] } {
  const problems: string[] = [];
  const process: ReviewProcess = {};
  const record = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};

  const tokens = record.tokens as Record<string, unknown> | undefined;
  if (tokens) {
    const parts = { input: count(tokens.input), output: count(tokens.output), cacheRead: count(tokens.cacheRead), cacheWrite: count(tokens.cacheWrite) };
    if (Object.values(parts).every((n) => n !== undefined)) process.tokens = parts as TokenTotals;
    else problems.push('"tokens" needs input, output, cacheRead and cacheWrite as whole numbers.');
  }

  const session = record.session as Record<string, unknown> | undefined;
  if (session) {
    const minutes = count(session.minutes);
    const url = typeof session.url === 'string' && /^https:\/\//.test(session.url) ? session.url : undefined;
    if (minutes !== undefined || url) process.session = { ...(minutes !== undefined ? { minutes } : {}), ...(url ? { url } : {}) };
  }

  const factCheck = record.factCheck as Record<string, unknown> | undefined;
  if (factCheck) {
    const list = Array.isArray(factCheck.findings) ? factCheck.findings : [];
    const findings: Finding[] = [];
    list.forEach((entry, index) => {
      const item = entry && typeof entry === 'object' ? (entry as Record<string, unknown>) : {};
      const severity = SEVERITIES.find((s) => s === item.severity);
      const outcome = OUTCOMES.find((o) => o === item.outcome);
      const claim = text(item.claim, 1000);
      const issue = text(item.issue, 1500);
      const response = text(item.response, 800);
      if (!severity || !outcome || !claim || !issue) {
        problems.push(`Fact-check finding ${index + 1} needs severity, claim, issue and outcome; skipped.`);
        return;
      }
      if (outcome !== 'fixed' && !response) problems.push(`Fact-check finding ${index + 1} is ${outcome} but gives no response.`);
      const source = text(item.source, 1000);
      findings.push({ severity, claim, issue, ...(source ? { source } : {}), outcome, ...(response ? { response } : {}) });
    });
    process.factCheck = { findings };
  }

  const original = record.original as Record<string, unknown> | undefined;
  if (original) {
    const strings = (value: unknown) => (Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : []);
    const score = typeof original.score === 'number' ? original.score : undefined;
    const signal = typeof original.signal === 'string' ? original.signal : undefined;
    if (typeof original.body === 'string' && typeof original.verdict === 'string' && typeof original.savedAt === 'string') {
      process.original = {
        savedAt: original.savedAt,
        ...(score !== undefined ? { score } : {}),
        ...(signal ? { signal } : {}),
        verdict: original.verdict,
        strengths: strings(original.strengths),
        weaknesses: strings(original.weaknesses),
        body: original.body,
      };
    } else problems.push('"original" needs savedAt, verdict and body.');
  }

  if (typeof record.commit === 'string') {
    if (/^[0-9a-f]{7,40}$/.test(record.commit)) process.commit = record.commit;
    else problems.push('"commit" is not a git commit id.');
  }

  if (record.changes !== undefined) {
    const list = Array.isArray(record.changes) ? record.changes : [];
    process.changes = list.flatMap((entry, index) => {
      const item = entry && typeof entry === 'object' ? (entry as Record<string, unknown>) : {};
      const date = typeof item.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(item.date) ? item.date : undefined;
      const summary = text(item.summary, 600);
      if (!date || !summary) {
        problems.push(`Change ${index + 1} needs a YYYY-MM-DD date and a summary; skipped.`);
        return [];
      }
      return [{ date, summary }];
    });
  }

  return { process, problems };
}

/** Per severity: how many were reported, and what happened to them. */
export function tallyFindings(findings: Finding[]): Record<Severity, Record<Outcome, number> & { total: number }> {
  const empty = () => ({ total: 0, fixed: 0, partly: 0, disputed: 0 });
  const out = { major: empty(), moderate: empty(), minor: empty() };
  for (const finding of findings) {
    out[finding.severity].total += 1;
    out[finding.severity][finding.outcome] += 1;
  }
  return out;
}

/**
 * "1 major (fixed); 2 moderate (1 fixed, 1 disputed); no minor issues", or that the fact
 * check found nothing. Severities with nothing reported are left out unless all are.
 */
export function factCheckSummary(findings: Finding[]): string {
  if (findings.length === 0) return 'No issues found.';
  const tally = tallyFindings(findings);
  return SEVERITIES.filter((s) => tally[s].total > 0)
    .map((s) => {
      const t = tally[s];
      const what = OUTCOMES.filter((o) => t[o] > 0).map((o) => (t[o] === t.total ? OUTCOME_LABELS[o].toLowerCase() : `${t[o]} ${OUTCOME_LABELS[o].toLowerCase()}`));
      return `${t.total} ${s} (${what.join(', ')})`;
    })
    .join('; ');
}

export function totalTokens(tokens: TokenTotals): number {
  return tokens.input + tokens.output + tokens.cacheRead + tokens.cacheWrite;
}

/** 2,400,000 → "2.4 million"; 85,000 → "85,000". */
export function readableCount(n: number): string {
  return n >= 1e6 ? `${(n / 1e6).toFixed(1)} million` : n.toLocaleString('en-GB');
}
