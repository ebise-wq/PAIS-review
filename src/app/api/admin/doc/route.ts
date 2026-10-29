import { NextResponse } from 'next/server';
import matter from 'gray-matter';
import { SKILL_PATH, getDoc, getDocSource, getSkill, withChangelogEntry, withGuideVersion } from '@/lib/doc';
import { isSignedIn } from '@/lib/session';
import { GithubError, getFile, getFileSha, getGithubConfig, putFile } from '@/lib/github';
import { bumpVersion, isChangeKind, validateNote } from '@/lib/version';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Standalone pages editable from /admin. Reviews go through /api/admin/publish instead. */
const EDITABLE_PAGES = new Set(['about', 'methods', 'guide', 'instructions', 'skill', 'backlog']);

/** Where each page lives in the repository. The review skill sits where Claude Code looks for it. */
function pathOf(name: string): string {
  return name === 'skill' ? SKILL_PATH : `content/${name}.md`;
}

/** The deployed copy, for when the repository cannot be read. */
function localSource(name: string): string | undefined {
  return name === 'skill' ? getSkill()?.source : getDocSource(name);
}

/**
 * The documents that together are "the method". They share one version number,
 * kept in the guide's frontmatter, and a change to any of them must bump it — reviews
 * record which version they were written under, and an unbumped edit makes older reviews
 * look like they met the current standard.
 */
const VERSIONED_PAGES = new Set(['guide', 'instructions', 'skill']);

function fail(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

/** A page's current raw markdown, plus the methods version so the editor can offer the next one. */
export async function GET(request: Request) {
  const name = new URL(request.url).searchParams.get('name');
  if (!name || !EDITABLE_PAGES.has(name)) return fail('Unknown page.', 400);

  // From the repository when publishing is set up: a page saved a minute ago then shows its
  // new text rather than the copy from before the rebuild, and the sha lets the save refuse
  // to overwrite a version this tab has not seen.
  let content = localSource(name);
  let sha: string | null = null;
  let guideVersion = getDoc('guide')?.version ?? null;
  const github = getGithubConfig();
  if (github) {
    try {
      const file = await getFile(github, pathOf(name));
      if (file) {
        content = file.content;
        sha = file.sha;
      }
      if (VERSIONED_PAGES.has(name)) {
        const guide = name === 'guide' ? file : await getFile(github, 'content/guide.md');
        const value = guide ? (matter(guide.content).data as Record<string, unknown>).version : undefined;
        if (value != null) guideVersion = String(value);
      }
    } catch {
      // Fall back to the deployed copy; the save still checks for conflicts.
    }
  }
  if (content === undefined) return fail(`${pathOf(name)} does not exist.`, 404);

  return NextResponse.json({
    name,
    content,
    sha,
    versioned: VERSIONED_PAGES.has(name),
    guideVersion,
  });
}

export async function POST(request: Request) {
  if (!(await isSignedIn())) return fail('Sign in first.', 401);

  const github = getGithubConfig();
  if (!github) {
    return fail(
      'Publishing is not configured. Set ADMIN_PASSWORD, GITHUB_TOKEN and GITHUB_REPO.',
      503,
    );
  }

  let input: { name?: string; content?: string; change?: string; note?: string; sha?: string | null };
  try {
    input = await request.json();
  } catch {
    return fail('Could not read the request.', 400);
  }

  const name = input.name;
  if (!name || !EDITABLE_PAGES.has(name)) return fail('Unknown page.', 400);

  const content = (input.content ?? '').trim();
  if (!content.startsWith('---')) {
    return fail('The page must keep its --- frontmatter block at the top.', 400);
  }

  // Claude Code finds the skill by the name and description in its frontmatter.
  if (name === 'skill') {
    let data: Record<string, unknown> = {};
    try {
      data = matter(content).data as Record<string, unknown>;
    } catch {
      return fail('The frontmatter is not valid YAML.', 400);
    }
    if (data.name !== 'review' || typeof data.description !== 'string' || !data.description.trim()) {
      return fail('Keep "name: review" and the description in the frontmatter: Claude Code uses them to find the skill.', 400);
    }
  }

  const today = new Date().toISOString().slice(0, 10);
  const versioned = VERSIONED_PAGES.has(name);

  let saveContent = content;
  let guideUpdate: string | undefined;
  let newVersion: string | undefined;

  try {
    if (versioned) {
      const change = input.change;
      if (!isChangeKind(change)) {
        return fail('Say what kind of change this is before saving.', 400);
      }
      const note = (input.note ?? '').trim();
      const noteProblem = validateNote(note);
      if (noteProblem) return fail(noteProblem, 400);

      // The version and the changelog come from the repository, not from this
      // deployment: a save made before the last one has finished building would
      // otherwise bump from a stale number and log two entries under it.
      const guideFile = await getFile(github, 'content/guide.md');
      if (!guideFile) return fail('content/guide.md is missing from the repository.', 500);

      let liveVersion: string | undefined;
      try {
        const value = (matter(guideFile.content).data as Record<string, unknown>).version;
        liveVersion = value == null ? undefined : String(value).trim();
      } catch {
        return fail("The guide's frontmatter is not valid YAML.", 400);
      }

      // Saving the guide replaces the whole file, changelog included. If the editor
      // loaded it before an earlier save landed, saving now would drop the entries
      // made in between, so refuse rather than lose them.
      if (name === 'guide') {
        let editedVersion: string | undefined;
        try {
          const value = (matter(content).data as Record<string, unknown>).version;
          editedVersion = value == null ? undefined : String(value).trim();
        } catch {
          return fail('The frontmatter you pasted is not valid YAML.', 400);
        }
        if (editedVersion !== liveVersion) {
          return fail(
            `The guide has changed since you opened it — the repository is on v${liveVersion ?? '?'} and you are editing v${editedVersion ?? '?'}. Reload the page to pick up the current text, then make your change again.`,
            409,
          );
        }
      }

      newVersion = bumpVersion(liveVersion, change);

      // The guide carries both the version and the changelog, so it is always written.
      // Editing the guide itself folds all three changes into one commit.
      const base = name === 'guide' ? content : guideFile.content;
      const stamped = withChangelogEntry(withGuideVersion(base, newVersion, today), newVersion, today, note);
      if (name === 'guide') saveContent = stamped;
      else guideUpdate = stamped;
    }
  } catch (error) {
    if (error instanceof GithubError) return fail(error.message, error.status);
    return fail(error instanceof Error ? error.message : 'Could not prepare the save.', 400);
  }

  const path = pathOf(name);

  try {
    // The sha the editor loaded, so a save from an out-of-date tab is refused rather than
    // overwriting what someone saved in between. Older clients send none; then the current
    // one is used, as before.
    const sha = input.sha ?? (await getFileSha(github, path));
    const message = versioned ? `Edit page: ${name} (methods v${newVersion})` : `Edit page: ${name}`;
    const result = await putFile(github, path, `${saveContent}\n`, message, sha);

    if (guideUpdate) {
      const guideSha = await getFileSha(github, 'content/guide.md');
      await putFile(
        github,
        'content/guide.md',
        guideUpdate,
        `Methods v${newVersion}: log the ${name} change`,
        guideSha,
      );
    }

    return NextResponse.json({
      ok: true,
      sha: result.sha ?? null,
      path,
      version: newVersion,
      bumpedGuide: Boolean(guideUpdate),
      ...result,
    });
  } catch (error) {
    if (error instanceof GithubError) return fail(error.message, error.status);
    return fail('Unexpected error talking to GitHub.', 502);
  }
}
