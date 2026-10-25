/**
 * Grade last, shown first. A review is written analysis first, executive summary last, and
 * the summary ends by stating the grade. The stored file keeps that writing order; the page
 * moves the summary to the top, and the grade is read out of its last line.
 *
 * Older reviews open with the summary and state the grade only in the frontmatter. Both
 * shapes are accepted: the closing summary is optional, and when it is absent everything
 * falls back to the frontmatter as before.
 *
 * No imports beyond types, so the tests can load this file with plain Node.
 */
import type { Signal } from './types';

const SUMMARY_HEADING = /^##\s+executive summary\s*$/i;

/** The `##` headings of a body with their line numbers, skipping fenced code. */
function h2Lines(lines: string[]): number[] {
  const found: number[] = [];
  let inFence = false;
  lines.forEach((line, index) => {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      return;
    }
    if (!inFence && /^##\s+/.test(line)) found.push(index);
  });
  return found;
}

export interface ClosingSummary {
  /** The body without the summary, in writing order. */
  analysis: string;
  /** The summary section, heading included. */
  summary: string;
}

/**
 * The executive summary, if it is the body's last `##` section. A summary anywhere else is
 * the older layout and is left where it is.
 */
export function closingSummary(body: string): ClosingSummary | null {
  const lines = body.trim().split('\n');
  const headings = h2Lines(lines);
  const last = headings[headings.length - 1];
  if (last === undefined || !SUMMARY_HEADING.test(lines[last])) return null;
  // A body that is only a summary has nothing to move it above.
  if (headings.length === 1) return null;
  return {
    analysis: lines.slice(0, last).join('\n').trim(),
    summary: lines.slice(last).join('\n').trim(),
  };
}

/** The body as the page shows it: the closing summary moved to the top. */
export function displayOrder(body: string): string {
  const found = closingSummary(body);
  return found ? `${found.summary}\n\n${found.analysis}` : body;
}

export type StatedGrade = { score: number } | { signal: Signal } | null;

/**
 * Reads the grade from the summary's last non-empty line: "Grade: 3 / 10." for a paper,
 * "Signal: promising." for preliminary findings. Markdown emphasis around it is ignored.
 * A line that starts like a grade but cannot be read throws, rather than being skipped:
 * a grade that silently fails to parse would fall back to the frontmatter unnoticed.
 */
export function statedGrade(summary: string, signals: readonly string[]): StatedGrade {
  const lines = summary
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const lastLine = lines[lines.length - 1] ?? '';
  const plain = lastLine.replace(/[*_]/g, '').trim();

  if (/^grade\s*:/i.test(plain)) {
    const match = /^grade\s*:\s*(\d+(?:\.\d+)?)\s*(?:\/|out of)\s*10\s*\.?$/i.exec(plain);
    const score = match ? Number(match[1]) : NaN;
    if (!Number.isFinite(score) || score < 1 || score > 10 || (score * 2) % 1 !== 0) {
      throw new Error(
        `The executive summary's last line reads "${lastLine}". Write it as "Grade: 6.5 / 10." — 1 to 10, in steps of 0.5.`,
      );
    }
    return { score };
  }

  if (/^signal\s*:/i.test(plain)) {
    const value = plain
      .replace(/^signal\s*:\s*/i, '')
      .replace(/\.$/, '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-');
    if (!signals.includes(value)) {
      throw new Error(
        `The executive summary's last line reads "${lastLine}". The signal must be one of ${signals.join(', ')}.`,
      );
    }
    return { signal: value as Signal };
  }

  return null;
}

/**
 * The grade a review states in its closing summary, checked against its frontmatter. When
 * both state one and they differ, this throws: a review whose displayed grade does not match
 * its own text is the failure this site exists to point at.
 */
export function reconcileGrade(
  body: string,
  frontmatter: { score?: unknown; signal?: unknown },
  signals: readonly string[],
): StatedGrade {
  const found = closingSummary(body);
  if (!found) return null;
  const stated = statedGrade(found.summary, signals);
  if (!stated) return null;

  if ('score' in stated && frontmatter.score != null && frontmatter.score !== '') {
    const front = Number(frontmatter.score);
    if (front !== stated.score) {
      throw new Error(
        `The executive summary gives ${stated.score} / 10 but the frontmatter says score: ${String(frontmatter.score)}. Make them agree.`,
      );
    }
  }
  if ('signal' in stated && frontmatter.signal != null && frontmatter.signal !== '') {
    const front = String(frontmatter.signal).trim().toLowerCase().replace(/\s+/g, '-');
    if (front !== stated.signal) {
      throw new Error(
        `The executive summary gives the signal "${stated.signal}" but the frontmatter says signal: ${String(frontmatter.signal)}. Make them agree.`,
      );
    }
  }
  return stated;
}
