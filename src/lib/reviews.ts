import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { parseProcess, type ReviewProcess } from './process';
import { reconcileGrade } from './hoist';
import { HUMAN_INPUT_LEVELS, REVIEW_KINDS, SIGNALS, accessOf, isHumanInput, type ContextNote, type Review, type ReviewFrontmatter, type ReviewKind, type Signal } from './types';

const REVIEWS_DIR = path.join(process.cwd(), 'content', 'reviews');

function coerce(data: Record<string, unknown>, slug: string, body: string): ReviewFrontmatter {
  const title = typeof data.title === 'string' ? data.title.trim() : '';
  if (!title) throw new Error(`${slug}: frontmatter is missing "title"`);

  const rawKind = typeof data.kind === 'string' ? data.kind.trim().toLowerCase() : 'paper';
  if (!(REVIEW_KINDS as string[]).includes(rawKind)) {
    throw new Error(`${slug}: "kind" must be one of ${REVIEW_KINDS.join(', ')}, got ${rawKind}`);
  }
  const kind = rawKind as ReviewKind;

  // A grade stated at the end of a closing executive summary must match the frontmatter,
  // and stands in for it when the frontmatter has none.
  let stated;
  try {
    stated = reconcileGrade(body, data, SIGNALS);
  } catch (error) {
    throw new Error(`${slug}: ${error instanceof Error ? error.message : String(error)}`);
  }
  if (stated && 'score' in stated && kind !== 'paper') {
    throw new Error(`${slug}: the executive summary ends with a grade, but a ${kind} review takes no score`);
  }
  if (stated && 'signal' in stated && kind !== 'preliminary') {
    throw new Error(`${slug}: the executive summary ends with a signal, but only preliminary findings take one`);
  }
  if (stated && 'score' in stated && data.score == null) data = { ...data, score: stated.score };
  if (stated && 'signal' in stated && data.signal == null) data = { ...data, signal: stated.signal };

  let score: number | undefined;
  if (kind === 'paper') {
    const parsedScore = typeof data.score === 'number' ? data.score : Number(data.score);
    if (!Number.isFinite(parsedScore) || parsedScore < 1 || parsedScore > 10) {
      throw new Error(`${slug}: "score" must be a number from 1 to 10, got ${String(data.score)}`);
    }
    score = parsedScore;
  }

  let signal: Signal | undefined;
  if (kind === 'preliminary') {
    const rawSignal =
      typeof data.signal === 'string' ? data.signal.trim().toLowerCase().replace(/\s+/g, '-') : '';
    if (!(SIGNALS as string[]).includes(rawSignal)) {
      throw new Error(`${slug}: "signal" must be one of ${SIGNALS.join(', ')}, got ${rawSignal}`);
    }
    signal = rawSignal as Signal;
  }

  if (data.preprint != null && data.preprint !== false && kind !== 'paper') {
    throw new Error(`${slug}: "preprint: true" only applies to kind: paper — a preprint is graded as a paper`);
  }
  const preprint = data.preprint === true;

  let humanInput: ReviewFrontmatter['humanInput'];
  if (data.humanInput != null) {
    const raw = String(data.humanInput).trim().toLowerCase();
    if (!isHumanInput(raw)) {
      throw new Error(`${slug}: "humanInput" must be one of ${HUMAN_INPUT_LEVELS.join(', ')}, got ${raw}`);
    }
    humanInput = raw;
  }

  const verdict = typeof data.verdict === 'string' ? data.verdict.trim() : '';
  if (!verdict) throw new Error(`${slug}: frontmatter is missing "verdict"`);

  // gray-matter turns unquoted YAML dates into Date objects; normalise to YYYY-MM-DD.
  const reviewedOn =
    data.reviewedOn instanceof Date
      ? data.reviewedOn.toISOString().slice(0, 10)
      : String(data.reviewedOn ?? '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(reviewedOn)) {
    throw new Error(`${slug}: "reviewedOn" must be a YYYY-MM-DD date`);
  }

  const strings = (value: unknown): string[] =>
    Array.isArray(value) ? value.map((v) => String(v).trim()).filter(Boolean) : [];

  const contextNotes = (value: unknown): ContextNote[] =>
    Array.isArray(value)
      ? value
          .map((entry): ContextNote | undefined => {
            if (typeof entry === 'string') return entry.trim() ? { note: entry.trim() } : undefined;
            if (entry && typeof entry === 'object') {
              const record = entry as Record<string, unknown>;
              const note = String(record.note ?? '').trim();
              const source = String(record.source ?? '').trim();
              if (!note) return undefined;
              return source ? { note, source } : { note };
            }
            return undefined;
          })
          .filter((entry): entry is ContextNote => entry !== undefined)
      : [];

  return {
    title,
    authors: typeof data.authors === 'string' ? data.authors : undefined,
    journal: typeof data.journal === 'string' ? data.journal : undefined,
    year: Number.isFinite(Number(data.year)) ? Number(data.year) : undefined,
    doi: typeof data.doi === 'string' && data.doi ? data.doi : undefined,
    url: typeof data.url === 'string' && data.url ? data.url : undefined,
    conditions: strings(data.conditions),
    studyType: typeof data.studyType === 'string' ? data.studyType : undefined,
    design: typeof data.design === 'string' && data.design.trim() ? data.design.trim() : undefined,
    topics: strings(data.topics),
    kind,
    ...(preprint ? { preprint } : {}),
    score,
    signal,
    verdict,
    confidence: data.confidence as ReviewFrontmatter['confidence'],
    importance: data.importance as ReviewFrontmatter['importance'],
    strengths: strings(data.strengths),
    weaknesses: strings(data.weaknesses),
    context: contextNotes(data.context),
    guideNotes: strings(data.guideNotes),
    reviewedOn,
    guideVersion: data.guideVersion != null ? String(data.guideVersion) : undefined,
    model: typeof data.model === 'string' ? data.model : undefined,
    effort: typeof data.effort === 'string' && data.effort.trim() ? data.effort.trim().toLowerCase() : undefined,
    read: strings(data.read),
    access: accessOf(data.access),
    sources: strings(data.sources),
    humanInput,
    draft: data.draft === true,
  };
}

/**
 * One review from its raw file text. Used where the deployed copy may be behind — the admin
 * preview reads a draft straight from the repository, so it shows a minute before a rebuild.
 * Throws with a named error on bad frontmatter, the same as the build.
 */
export function parseReview(raw: string, slug: string): Review {
  const { data, content } = matter(raw);
  return { ...coerce(data, slug, content), slug, body: content.trim() };
}

/** The record of how a review was made, if it has one. A broken file is reported, not fatal. */
export function readProcess(slug: string): ReviewProcess | undefined {
  const file = path.join(REVIEWS_DIR, `${slug}.process.json`);
  if (!fs.existsSync(file)) return undefined;
  try {
    const { process, problems } = parseProcess(JSON.parse(fs.readFileSync(file, 'utf8')));
    for (const problem of problems) console.warn(`${slug}.process.json: ${problem}`);
    return process;
  } catch (error) {
    console.error(`${slug}.process.json is not valid JSON; leaving it out.`, error);
    return undefined;
  }
}

export function getAllReviews(options: { includeDrafts?: boolean } = {}): Review[] {
  if (!fs.existsSync(REVIEWS_DIR)) return [];

  return fs
    .readdirSync(REVIEWS_DIR)
    .filter((file) => file.endsWith('.md'))
    .map((file) => {
      const slug = file.replace(/\.md$/, '');
      const raw = fs.readFileSync(path.join(REVIEWS_DIR, file), 'utf8');
      const { data, content } = matter(raw);
      const process = readProcess(slug);
      return { ...coerce(data, slug, content), slug, body: content.trim(), ...(process ? { process } : {}) };
    })
    .filter((review) => options.includeDrafts || !review.draft)
    .sort((a, b) => b.reviewedOn.localeCompare(a.reviewedOn) || a.title.localeCompare(b.title));
}

/** Raw file text for a published review. Drafts return undefined, as on the site. */
export function getReviewSource(slug: string): string | undefined {
  if (!/^[a-z0-9-]+$/.test(slug)) return undefined;
  if (!getReview(slug)) return undefined;
  const file = path.join(REVIEWS_DIR, `${slug}.md`);
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : undefined;
}

export function getReview(slug: string, options: { includeDrafts?: boolean } = {}): Review | undefined {
  return getAllReviews(options).find((review) => review.slug === slug);
}

export function getAllConditions(reviews: Review[]): string[] {
  return [...new Set(reviews.flatMap((r) => r.conditions ?? []))].sort((a, b) => a.localeCompare(b));
}

export function citationOf(review: Review): string {
  return [review.authors, review.journal, review.year].filter(Boolean).join(' · ');
}

export function paperLink(review: Review): string | undefined {
  if (review.url) return review.url;
  if (review.doi) return `https://doi.org/${review.doi.replace(/^https?:\/\/doi\.org\//, '')}`;
  return undefined;
}
