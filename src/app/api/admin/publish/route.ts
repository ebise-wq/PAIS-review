import { NextResponse } from 'next/server';
import { buildReviewFile } from '@/lib/publish';
import { currentGuideVersion } from '@/lib/doc';
import { isHumanInput } from '@/lib/types';
import { isSignedIn } from '@/lib/session';
import { GithubError, getFileSha, getGithubConfig, putFile } from '@/lib/github';
import { markReviewQuietly } from '@/lib/catalogue-marking';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function fail(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
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

  let input: { body?: string; slug?: string; overwrite?: boolean; humanInput?: string; draft?: boolean };
  try {
    input = await request.json();
  } catch {
    return fail('Could not read the request.', 400);
  }

  const draft = input.draft === true;
  // A draft can wait for its human-input level; it is set when the draft is published.
  if (!draft && !isHumanInput(input.humanInput)) {
    return fail('Choose how much human input this review had before publishing.', 400);
  }

  let built;
  try {
    built = buildReviewFile(input.body ?? '', input.slug, currentGuideVersion(), {
      humanInput: isHumanInput(input.humanInput) ? input.humanInput : undefined,
      draft,
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Could not build the review.', 400);
  }

  const path = `content/reviews/${built.slug}.md`;

  try {
    const sha = await getFileSha(github, path);
    if (sha && !input.overwrite) {
      return NextResponse.json(
        {
          error: `A review already exists at ${built.slug}.md. Tick "replace" to overwrite it.`,
          exists: true,
        },
        { status: 409 },
      );
    }

    const result = await putFile(
      github,
      path,
      built.markdown,
      `${draft ? 'Draft' : sha ? 'Update' : 'Publish'} review: ${built.review.title}`,
      sha,
    );

    await markReviewQuietly({ ...built.review, slug: built.slug });
    return NextResponse.json({ ok: true, slug: built.slug, path, draft, ...result });
  } catch (error) {
    if (error instanceof GithubError) return fail(error.message, error.status);
    return fail('Unexpected error talking to GitHub.', 502);
  }
}
