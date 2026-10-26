import type { FactCheckTally, TokenTotals } from './session-stats';
export type Confidence = 'high' | 'moderate' | 'low';
export type Importance = 'high' | 'moderate' | 'low';

/**
 * What is being reviewed. This decides how the verdict is expressed:
 * a single paper gets a 1–10 score — a preprint is a paper, marked `preprint: true`;
 * preliminary findings (abstracts, unpublished data, announcements) get a coarse
 * ordinal, because a decimal grade on that is false precision; a literature review
 * gets neither, because "how good is this body of evidence" is not the same question
 * the score was built to answer.
 */
export type ReviewKind = 'paper' | 'literature' | 'preliminary';

export const REVIEW_KINDS: ReviewKind[] = ['paper', 'literature', 'preliminary'];

export const KIND_LABELS: Record<ReviewKind, string> = {
  paper: 'Paper',
  literature: 'Literature review',
  preliminary: 'Preliminary findings',
};

/**
 * How much a person changed the review after the model wrote it. Set by the editor at
 * publishing, never by the model, which cannot know.
 */
export type HumanInput = 'none' | 'minor' | 'moderate' | 'major';

export const HUMAN_INPUT_LEVELS: HumanInput[] = ['none', 'minor', 'moderate', 'major'];

export const HUMAN_INPUT_LABELS: Record<HumanInput, string> = {
  none: 'None',
  minor: 'Minor',
  moderate: 'Moderate',
  major: 'Major',
};

export function isHumanInput(value: unknown): value is HumanInput {
  return typeof value === 'string' && (HUMAN_INPUT_LEVELS as string[]).includes(value);
}

export interface Access {
  /** The whole paper, not only the abstract. */
  fullText?: boolean;
  figures?: boolean;
  supplement?: boolean;
}

export const ACCESS_PARTS = ['fullText', 'figures', 'supplement'] as const;

/** Reads `access` from frontmatter: yes/no, true/false. Unknown keys and values are dropped. */
export function accessOf(value: unknown): Access | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const out: Access = {};
  for (const part of ACCESS_PARTS) {
    const raw = (value as Record<string, unknown>)[part];
    const v = typeof raw === 'string' ? raw.trim().toLowerCase() : raw;
    if (v === true || v === 'yes' || v === 'true') out[part] = true;
    else if (v === false || v === 'no' || v === 'false') out[part] = false;
  }
  return Object.keys(out).length ? out : undefined;
}

/** "Full text and figures; not the supplement", for the review page. */
export function accessSummary(access: Access): string {
  const names: Record<(typeof ACCESS_PARTS)[number], string> = { fullText: 'full text', figures: 'figures', supplement: 'supplement' };
  const seen = ACCESS_PARTS.filter((p) => access[p] === true).map((p) => names[p]);
  const notSeen = ACCESS_PARTS.filter((p) => access[p] === false).map((p) => names[p]);
  const list = (items: string[]) => (items.length > 1 ? `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}` : items[0]);
  const parts = [seen.length ? list(seen) : '', notSeen.length ? `not the ${list(notSeen)}` : ''].filter(Boolean);
  const out = parts.join('; ');
  return out.charAt(0).toUpperCase() + out.slice(1);
}

/**
 * A small mapping of counts from frontmatter ({input: 120, output: 30}), or undefined if
 * any expected key is missing or not a whole number. Used for the process records.
 */
export function countsOf<K extends string>(value: unknown, keys: readonly K[]): Record<K, number> | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const record = value as Record<string, unknown>;
  const out = {} as Record<K, number>;
  for (const key of keys) {
    const n = Number(record[key]);
    if (!Number.isInteger(n) || n < 0) return undefined;
    out[key] = n;
  }
  return out;
}

export function sessionOf(value: unknown): { minutes?: number; url?: string } | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const record = value as Record<string, unknown>;
  const minutes = Number(record.minutes);
  const url = typeof record.url === 'string' && /^https:\/\//.test(record.url) ? record.url : undefined;
  const out = { ...(Number.isInteger(minutes) && minutes >= 0 ? { minutes } : {}), ...(url ? { url } : {}) };
  return Object.keys(out).length ? out : undefined;
}

export const TOKEN_KEYS = ['input', 'output', 'cacheRead', 'cacheWrite'] as const;
export const FACT_CHECK_KEYS = ['major', 'moderate', 'minor', 'fixed'] as const;

/** What the model read, as one list, whether the review records it the current way or the old one. */
export function readList(review: Pick<ReviewFrontmatter, 'read' | 'access' | 'sources'>): string[] {
  if (review.read?.length) return review.read;
  return [...(review.access ? [accessSummary(review.access)] : []), ...(review.sources ?? [])];
}

/** The coarse ordinal used for preliminary findings. */
export type Signal = 'promising' | 'mixed' | 'unconvincing' | 'too-early';

export const SIGNALS: Signal[] = ['promising', 'mixed', 'unconvincing', 'too-early'];

export const SIGNAL_LABELS: Record<Signal, string> = {
  promising: 'Promising',
  mixed: 'Mixed',
  unconvincing: 'Unconvincing',
  'too-early': 'Too early',
};

/**
 * Something outside the paper that bears on how to read it — a funder's history, a
 * market reaction, an undisclosed tie. Published as fact about named people and
 * companies, so `source` matters: an unsourced note is an allegation.
 */
export interface ContextNote {
  note: string;
  source?: string;
}

/** Frontmatter as authored in content/reviews/*.md */
export interface ReviewFrontmatter {
  title: string;
  authors?: string;
  journal?: string;
  year?: number;
  doi?: string;
  url?: string;
  /** Free tags, e.g. ["ME/CFS", "Long Covid"] — drive the index filters. */
  conditions?: string[];
  studyType?: string;
  /** Tag id from the designs in content/tags.json: what kind of study it is. */
  design?: string;
  /** Tag ids from the topics in content/tags.json: what it is about. Any number. */
  topics?: string[];
  kind: ReviewKind;
  /** Papers only: not yet peer reviewed. Graded like any other paper, and marked as such. */
  preprint?: boolean;
  /** 1–10, in 0.5 steps. Papers only. */
  score?: number;
  /** Coarse ordinal. Preliminary findings only. */
  signal?: Signal;
  /** One sentence. The single most useful thing a reader can take away. */
  verdict: string;
  /** Optional: how sure the verdict is, given what the source actually reports. */
  confidence?: Confidence;
  /** Optional: how much it would matter if the finding held up. */
  importance?: Importance;
  strengths?: string[];
  weaknesses?: string[];
  context?: ContextNote[];
  /**
   * Methodological points this paper surfaced that the guide does not cover. Collected by
   * the editor for the next guide version; never applied to the review or the guide
   * automatically.
   */
  guideNotes?: string[];
  reviewedOn: string;
  guideVersion?: string;
  model?: string;
  /**
   * The reasoning effort the model ran at (e.g. "high"), where the tool exposes one. The same
   * model can review quite differently at different efforts, so it is part of who wrote it.
   */
  effort?: string;
  /**
   * Everything the model actually opened while writing, one line each, saying what it was
   * and how it was read: "Full text, from the publisher's PDF", "Figures 3 and 5, viewed as
   * images", a link. Not what exists. A review written from the abstract alone reads the
   * same as one written from the full paper; this is how a reader tells them apart.
   */
  read?: string[];
  /** Older reviews: fixed yes/no fields, replaced by `read`. Still shown where present. */
  access?: Access;
  /** Older reviews: everything else the model consulted, alongside `access`. */
  sources?: string[];
  /**
   * How the review was made, recorded by scripts/session-stats.mjs from the session that
   * wrote it: token use, time taken, and what the blind fact check found. Not shown on
   * the page; there for later analysis. Absent on reviews written before it was recorded.
   */
  tokens?: TokenTotals;
  session?: { minutes?: number; url?: string };
  factCheck?: FactCheckTally;
  /** How much the editor changed the model's text. Absent on reviews published before it was recorded. */
  humanInput?: HumanInput;
  /** Set true while drafting; excluded from the site. */
  draft?: boolean;
}

export interface Review extends ReviewFrontmatter {
  slug: string;
  body: string;
}

export type Tone = 'strong' | 'solid' | 'borderline' | 'weak' | 'fatal' | 'neutral';

export interface Verdict {
  /** Big text in the badge: a number for papers, a word otherwise. */
  headline: string;
  /** Small text under it. */
  label: string;
  tone: Tone;
  /** Papers show "/ 10" under the number; nothing else does. */
  showDenominator: boolean;
}

/**
 * Bands exist to stop small score differences reading as meaningful.
 * Anything under 5 does not pass, matching how the reviews already use "FAIL".
 */
export function scoreBand(score: number): { label: string; tone: Tone } {
  if (score >= 8) return { label: 'Strong', tone: 'strong' };
  if (score >= 6.5) return { label: 'Solid', tone: 'solid' };
  if (score >= 5) return { label: 'Borderline', tone: 'borderline' };
  if (score >= 3) return { label: 'Fails', tone: 'weak' };
  return { label: 'Fatal flaws', tone: 'fatal' };
}

const SIGNAL_TONES: Record<Signal, Tone> = {
  promising: 'strong',
  mixed: 'borderline',
  unconvincing: 'weak',
  'too-early': 'neutral',
};

export function formatScore(score: number): string {
  return Number.isInteger(score) ? String(score) : score.toFixed(1);
}

/** How a review's verdict is rendered on the badge, whatever kind it is. */
export function verdictOf(review: Pick<ReviewFrontmatter, 'kind' | 'score' | 'signal'>): Verdict {
  if (review.kind === 'paper' && typeof review.score === 'number') {
    const band = scoreBand(review.score);
    return {
      headline: formatScore(review.score),
      label: band.label,
      tone: band.tone,
      showDenominator: true,
    };
  }

  if (review.kind === 'preliminary' && review.signal) {
    return {
      headline: SIGNAL_LABELS[review.signal],
      label: 'Preliminary',
      tone: SIGNAL_TONES[review.signal],
      showDenominator: false,
    };
  }

  return { headline: 'Review', label: 'Literature', tone: 'neutral', showDenominator: false };
}

/** "claude-opus-5-5 (high effort)", or the model alone when no effort was recorded. */
export function modelLabel(review: { model?: string; effort?: string }, fallback: string): string {
  if (!review.model) return fallback;
  return review.effort ? `${review.model} (${review.effort} effort)` : review.model;
}
