/**
 * What changed between the review Claude handed over and the one on the site: the
 * judgement fields one by one, and the text paragraph by paragraph, word by word where a
 * paragraph was edited. Also the method changes made since a review was written.
 * Pure functions; the review page renders the result.
 */
import { diffArrays, diffWords } from 'diff';

export interface Snapshot {
  score?: number;
  signal?: string;
  verdict: string;
  strengths: string[];
  weaknesses: string[];
  body: string;
}

/** One stretch of text: unchanged, added or removed. */
export interface Piece {
  kind: 'same' | 'added' | 'removed';
  text: string;
}

export interface FieldChange {
  field: 'Grade' | 'Verdict' | 'Strengths' | 'Weaknesses';
  pieces: Piece[];
}

export interface Changes {
  fields: FieldChange[];
  /** Edited, added or removed paragraphs of the text, each as a word-level diff. */
  paragraphs: Piece[][];
}

const words = (before: string, after: string): Piece[] =>
  diffWords(before, after).map((part) => ({
    kind: part.added ? 'added' : part.removed ? 'removed' : 'same',
    text: part.value,
  }));

/** Paragraphs as a reader sees them: markdown marks taken out, links reduced to their text. */
const paragraphsOf = (body: string) =>
  body
    .split(/\n\s*\n/)
    .map((p) =>
      p
        .replace(/^#{1,6}\s+/gm, '')
        .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
        .replace(/(\*\*|__|`)/g, '')
        .trim(),
    )
    .filter(Boolean);

const grade = (s: Snapshot) => (s.score !== undefined ? `${s.score} / 10` : (s.signal ?? ''));

/** Items in a list that were dropped or added (reworded items show as both). */
function listChange(before: string[], after: string[]): Piece[] {
  return [
    ...before.filter((item) => !after.includes(item)).map((text) => ({ kind: 'removed' as const, text })),
    ...after.filter((item) => !before.includes(item)).map((text) => ({ kind: 'added' as const, text })),
  ];
}

export function compareReviews(before: Snapshot, after: Snapshot): Changes {
  const fields: FieldChange[] = [];
  if (grade(before) !== grade(after)) {
    fields.push({ field: 'Grade', pieces: [{ kind: 'removed', text: grade(before) }, { kind: 'added', text: grade(after) }] });
  }
  if (before.verdict.trim() !== after.verdict.trim()) fields.push({ field: 'Verdict', pieces: words(before.verdict, after.verdict) });
  for (const field of ['Strengths', 'Weaknesses'] as const) {
    const key = field === 'Strengths' ? 'strengths' : 'weaknesses';
    const pieces = listChange(before[key], after[key]);
    if (pieces.length) fields.push({ field, pieces });
  }

  // Paragraphs first, so a moved or untouched paragraph is not compared word by word; then
  // each run of removed paragraphs is paired with the run of added ones that replaced it.
  const paragraphs: Piece[][] = [];
  const parts = diffArrays(paragraphsOf(before.body), paragraphsOf(after.body));
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part.added && !part.removed) continue;
    const next = parts[i + 1];
    if (part.removed && next?.added) {
      const pairs = Math.max(part.value.length, next.value.length);
      for (let j = 0; j < pairs; j++) {
        const was = part.value[j];
        const now = next.value[j];
        if (was !== undefined && now !== undefined) paragraphs.push(words(was, now));
        else if (was !== undefined) paragraphs.push([{ kind: 'removed', text: was }]);
        else if (now !== undefined) paragraphs.push([{ kind: 'added', text: now }]);
      }
      i++;
    } else {
      for (const text of part.value) paragraphs.push([{ kind: part.added ? 'added' : 'removed', text }]);
    }
  }
  return { fields, paragraphs };
}

export function hasChanges(changes: Changes): boolean {
  return changes.fields.length > 0 || changes.paragraphs.length > 0;
}

// ---------- the method, since a review was written ----------

export interface MethodChange {
  version: string;
  date: string;
  text: string;
}

/** The guide's text and its changelog section, apart. */
export function splitChangelog(body: string): { main: string; changelog: string | null } {
  const match = /^## Changelog[ \t]*$/m.exec(body);
  if (!match) return { main: body, changelog: null };
  return {
    main: body.slice(0, match.index).trimEnd(),
    changelog: body.slice(match.index + match[0].length).trim(),
  };
}

/** Entries like "- **0.8.6** (2026-10-25) — text", from the guide's changelog. */
export function parseChangelog(changelog: string): MethodChange[] {
  const entries: MethodChange[] = [];
  // Each entry runs to the next entry or the end of the text; an entry wraps over lines.
  for (const match of changelog.matchAll(/^- \*\*([\d.]+)\*\* \(([\d-]+)\) — ([\s\S]*?)(?=\n- \*\*|(?![\s\S]))/gm)) {
    entries.push({ version: match[1], date: match[2], text: match[3].replace(/\s+/g, ' ').trim() });
  }
  return entries;
}

export function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d) return d;
  }
  return 0;
}

/** Method changes made after the version a review was written under, newest first. */
export function methodChangesSince(version: string, changelog: MethodChange[]): MethodChange[] {
  return changelog.filter((entry) => compareVersions(entry.version, version) > 0);
}
