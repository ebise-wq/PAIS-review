import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

export interface Doc {
  title: string;
  version?: string;
  updated?: string;
  authors?: string;
  source?: string;
  body: string;
}

/** Loads a standalone markdown document from content/, e.g. "guide". */
export function getDoc(name: string): Doc | undefined {
  const file = path.join(process.cwd(), 'content', `${name}.md`);
  if (!fs.existsSync(file)) return undefined;

  const { data, content } = matter(fs.readFileSync(file, 'utf8'));
  const updated =
    data.updated instanceof Date ? data.updated.toISOString().slice(0, 10) : data.updated;

  return {
    title: String(data.title ?? name),
    version: data.version != null ? String(data.version) : undefined,
    updated: updated ? String(updated) : undefined,
    authors: data.authors ? String(data.authors) : undefined,
    source: data.source ? String(data.source) : undefined,
    body: content.trim(),
  };
}

/** Raw file text, frontmatter included — what the /admin page editor reads and writes back. */
export function getDocSource(name: string): string | undefined {
  const file = path.join(process.cwd(), 'content', `${name}.md`);
  if (!fs.existsSync(file)) return undefined;
  return fs.readFileSync(file, 'utf8');
}

/**
 * Fills {{GUIDE_VERSION}} and {{SITE_URL}} so a served document never carries a
 * hand-maintained copy of the version number. There is one place the version lives —
 * content/guide.md — and everything else reads it from there.
 */
export function renderTemplate(body: string, siteUrl: string): string {
  const guideVersion = getDoc('guide')?.version ?? 'unversioned';
  return body
    .replaceAll('{{GUIDE_VERSION}}', guideVersion)
    .replaceAll('{{SITE_URL}}', siteUrl.replace(/\/$/, ''));
}

/** The version of the guide as currently deployed. */
export function currentGuideVersion(): string | undefined {
  return getDoc('guide')?.version;
}

/**
 * Rewrites the guide's `version:` and `updated:` frontmatter lines. The version is the
 * methods version — it covers the guide, the reviewing instructions and the project
 * prompt together — so a change to any of them bumps it here, in the one place it lives.
 */
export function withGuideVersion(guideSource: string, version: string, updated: string): string {
  const end = guideSource.indexOf('\n---', 3);
  if (!guideSource.startsWith('---') || end === -1) {
    throw new Error('The guide has no frontmatter block to update.');
  }
  let head = guideSource.slice(0, end);
  const tail = guideSource.slice(end);

  const setLine = (key: string, value: string) => {
    const pattern = new RegExp(`^${key}:.*$`, 'm');
    head = pattern.test(head) ? head.replace(pattern, `${key}: ${value}`) : `${head}\n${key}: ${value}`;
  };
  setLine('version', JSON.stringify(version));
  setLine('updated', updated);

  return head + tail;
}

/** Wraps a changelog line the way the rest of the file is wrapped, for readable diffs. */
function wrap(text: string, width: number, indent: string): string {
  const out: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > width && line) {
      out.push(line);
      line = indent + word;
    } else {
      line = candidate;
    }
  }
  if (line) out.push(line);
  return out.join('\n');
}

/**
 * Adds an entry at the top of the guide's changelog, so saving a change from /admin
 * logs it instead of leaving that to be remembered. Creates the section if the guide
 * has none yet.
 */
export function withChangelogEntry(
  guideSource: string,
  version: string,
  date: string,
  note: string,
): string {
  const entry = wrap(`- **${version}** (${date}) — ${note.trim().replace(/\s+/g, ' ')}`, 92, '  ');
  const heading = /^## Changelog[ \t]*$/m.exec(guideSource);

  if (!heading) return `${guideSource.trimEnd()}\n\n## Changelog\n\n${entry}\n`;

  const after = heading.index + heading[0].length;
  const rest = guideSource.slice(after).replace(/^\n+/, '');
  return `${guideSource.slice(0, after)}\n\n${entry}\n${rest}`;
}

/** Where the Claude Code review skill lives: the instructions reviews are now written with. */
export const SKILL_PATH = '.claude/skills/review/SKILL.md';

/** The review skill as a file (for /review-skill.md) and its text without the frontmatter (for the page). */
export function getSkill(): { source: string; body: string } | undefined {
  const file = path.join(process.cwd(), SKILL_PATH);
  if (!fs.existsSync(file)) return undefined;
  const source = fs.readFileSync(file, 'utf8');
  return { source, body: matter(source).content.trim() };
}
