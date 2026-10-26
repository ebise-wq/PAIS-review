import matter from 'gray-matter';
import { createHash, timingSafeEqual } from 'node:crypto';
import {
  HUMAN_INPUT_LEVELS,
  REVIEW_KINDS,
  SIGNALS,
  accessOf,
  isHumanInput,
  type ContextNote,
  type HumanInput,
  type ReviewFrontmatter,
  type ReviewKind,
  type Signal,
} from './types';
import { reconcileGrade } from './hoist';

const SLUG_MAX = 80;

export function slugify(value: string): string {
  const base = value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (base.length <= SLUG_MAX) return base;

  // Trim back to the last whole word, so a long title does not end mid-syllable
  // in a public URL. Falls back to a hard cut if the first word is itself huge.
  const cut = base.slice(0, SLUG_MAX);
  const lastBoundary = cut.lastIndexOf('-');
  return (lastBoundary > SLUG_MAX / 2 ? cut.slice(0, lastBoundary) : cut).replace(/-+$/, '');
}

/** Constant-time password check. Hashing first keeps the comparison length-independent. */
export function passwordMatches(supplied: string, expected: string): boolean {
  const digest = (value: string) => createHash('sha256').update(value, 'utf8').digest();
  return timingSafeEqual(digest(supplied), digest(expected));
}

export interface BuiltReview {
  slug: string;
  markdown: string;
  /** Normalised frontmatter, for previewing the card before publishing. */
  review: ReviewFrontmatter;
}

const strings = (value: unknown): string[] =>
  Array.isArray(value) ? value.map((v) => String(v).trim()).filter(Boolean) : [];

const text = (value: unknown): string | undefined => {
  const out = typeof value === 'string' ? value.trim() : value != null ? String(value).trim() : '';
  return out || undefined;
};

const level = (value: unknown): 'high' | 'moderate' | 'low' | undefined => {
  const out = typeof value === 'string' ? value.trim().toLowerCase() : '';
  return out === 'high' || out === 'moderate' || out === 'low' ? out : undefined;
};

const kindOf = (value: unknown): ReviewKind => {
  const out = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (!out) return 'paper';
  // A preprint is a paper; "kind: preprint" is read as that rather than rejected.
  if (out === 'preprint') return 'paper';
  if ((REVIEW_KINDS as string[]).includes(out)) return out as ReviewKind;
  throw new Error(`"kind" must be one of ${REVIEW_KINDS.join(', ')}, got ${String(value)}.`);
};

const humanInputOf = (value: unknown): HumanInput | undefined => {
  if (value == null || value === '') return undefined;
  const out = String(value).trim().toLowerCase();
  if (isHumanInput(out)) return out;
  throw new Error(`"humanInput" must be one of ${HUMAN_INPUT_LEVELS.join(', ')}, got ${String(value)}.`);
};

const signalOf = (value: unknown): Signal | undefined => {
  const out = typeof value === 'string' ? value.trim().toLowerCase().replace(/\s+/g, '-') : '';
  if (!out) return undefined;
  if ((SIGNALS as string[]).includes(out)) return out as Signal;
  throw new Error(`"signal" must be one of ${SIGNALS.join(', ')}, got ${String(value)}.`);
};

/** Accepts either a bare string or {note, source}; always stores the object form. */
const contextOf = (value: unknown): ContextNote[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry): ContextNote | undefined => {
      if (typeof entry === 'string') {
        const note = entry.trim();
        return note ? { note } : undefined;
      }
      if (entry && typeof entry === 'object') {
        const record = entry as Record<string, unknown>;
        const note = text(record.note);
        if (!note) return undefined;
        const source = text(record.source);
        // Omit the key entirely rather than setting undefined: js-yaml refuses to dump it.
        return source ? { note, source } : { note };
      }
      return undefined;
    })
    .filter((entry): entry is ContextNote => entry !== undefined);
};

/**
 * Parses a complete review file — the whole thing Claude writes, frontmatter and all —
 * and normalises it into the file that gets committed. There are no separate form
 * fields: everything comes from the pasted frontmatter, so what you publish is exactly
 * what you reviewed.
 *
 * `slugOverride` only renames the file; it never changes the content.
 * `fallbackGuideVersion` is stamped only when the review does not state one itself, so a
 * review written under an older guide keeps its own version.
 */
export function buildReviewFile(
  raw: string,
  slugOverride?: string,
  fallbackGuideVersion?: string,
  /** Set from the publish form, which takes precedence over anything in the frontmatter. */
  options: { humanInput?: HumanInput; draft?: boolean } = {},
): BuiltReview {
  const source = (raw ?? '').trim();
  if (!source) throw new Error('Nothing pasted yet.');

  if (!source.startsWith('---')) {
    throw new Error(
      'No frontmatter found. The review needs to start with a --- block carrying at least title, kind and verdict.',
    );
  }

  let parsed;
  try {
    parsed = matter(source);
  } catch (error) {
    throw new Error(
      `The frontmatter is not valid YAML: ${error instanceof Error ? error.message.split('\n')[0] : 'unknown error'}`,
    );
  }

  const data = parsed.data as Record<string, unknown>;

  const title = text(data.title);
  if (!title) throw new Error('Frontmatter is missing "title".');

  const kind = kindOf(data.kind);
  const preprint =
    data.preprint === true ||
    String(data.preprint ?? '').toLowerCase() === 'true' ||
    String(data.kind ?? '').trim().toLowerCase() === 'preprint';
  if (preprint && kind !== 'paper') {
    throw new Error('"preprint: true" only applies to kind: paper. A preprint is graded as a paper, with a score.');
  }

  // The grade is written last, as the closing line of the executive summary, and read
  // from there into the frontmatter. If the frontmatter also states one, they must agree.
  const stated = reconcileGrade(parsed.content, data, SIGNALS);
  if (stated && 'score' in stated && kind !== 'paper') {
    throw new Error(`The executive summary ends with a grade, but a ${kind} review takes no score.`);
  }
  if (stated && 'signal' in stated && kind !== 'preliminary') {
    throw new Error(`The executive summary ends with a signal, but only preliminary findings take one.`);
  }
  if (stated && 'score' in stated && data.score == null) data.score = stated.score;
  if (stated && 'signal' in stated && data.signal == null) data.signal = stated.signal;

  // The verdict field depends on the kind, so that a literature review is never
  // forced into a number that would not mean anything.
  let score: number | undefined;
  let signal: Signal | undefined;

  if (kind === 'paper') {
    if (data.signal != null) throw new Error('A paper review takes "score", not "signal".');
    const parsedScore = typeof data.score === 'number' ? data.score : Number(data.score);
    if (!Number.isFinite(parsedScore) || parsedScore < 1 || parsedScore > 10) {
      throw new Error(
        data.score == null
          ? 'No grade found. End the executive summary with "Grade: 6.5 / 10." (or set score in the frontmatter).'
          : `"score" must be a number from 1 to 10, got ${String(data.score)}.`,
      );
    }
    score = parsedScore;
  } else if (kind === 'preliminary') {
    if (data.score != null) {
      throw new Error(
        'Preliminary findings take "signal", not "score" — a decimal grade on unpublished data is false precision. If this is a preprint, use kind: paper with preprint: true instead; preprints are graded.',
      );
    }
    signal = signalOf(data.signal);
    if (!signal) {
      throw new Error(`Frontmatter is missing "signal". One of: ${SIGNALS.join(', ')}.`);
    }
  } else if (data.score != null || data.signal != null) {
    throw new Error('A literature review takes neither "score" nor "signal" — just a verdict.');
  }

  const verdict = text(data.verdict);
  if (!verdict) {
    throw new Error('Frontmatter is missing "verdict" — one sentence for the index page.');
  }

  const content = parsed.content.trim();
  if (!content) throw new Error('The review body is empty — only frontmatter was pasted.');

  // gray-matter turns an unquoted YAML date into a Date object.
  const reviewedOn =
    data.reviewedOn instanceof Date
      ? data.reviewedOn.toISOString().slice(0, 10)
      : String(data.reviewedOn ?? '').slice(0, 10) || new Date().toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(reviewedOn)) {
    throw new Error(`"reviewedOn" must be a YYYY-MM-DD date, got ${String(data.reviewedOn)}.`);
  }

  const year = Number(data.year);

  const review: ReviewFrontmatter = {
    title,
    authors: text(data.authors),
    journal: text(data.journal),
    year: Number.isFinite(year) && year > 0 ? year : undefined,
    doi: text(data.doi),
    url: text(data.url),
    conditions: strings(data.conditions),
    studyType: text(data.studyType),
    design: text(data.design),
    topics: strings(data.topics),
    kind,
    ...(preprint ? { preprint: true } : {}),
    score,
    signal,
    verdict,
    confidence: level(data.confidence),
    importance: level(data.importance),
    strengths: strings(data.strengths),
    weaknesses: strings(data.weaknesses),
    context: contextOf(data.context),
    guideNotes: strings(data.guideNotes),
    reviewedOn,
    guideVersion: text(data.guideVersion) ?? fallbackGuideVersion,
    model: text(data.model),
    effort: text(data.effort)?.toLowerCase(),
    read: strings(data.read),
    access: accessOf(data.access),
    sources: strings(data.sources),
    humanInput: options.humanInput ?? humanInputOf(data.humanInput),
  };

  const out: Record<string, unknown> = { ...review };
  for (const key of Object.keys(out)) {
    const value = out[key];
    if (value === undefined || (Array.isArray(value) && value.length === 0)) delete out[key];
  }

  // A draft is kept off the site until the editor publishes it from the preview.
  if (options.draft) out.draft = true;

  const slug = slugify(slugOverride || text(data.slug) || title);
  if (!slug) throw new Error('Could not work out a filename. Set one below.');

  return { slug, review, markdown: matter.stringify(content, out) };
}
