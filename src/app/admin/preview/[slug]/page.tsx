import fs from 'node:fs';
import path from 'node:path';
import type { Metadata } from 'next';
import Link from 'next/link';
import { isSignedIn } from '@/lib/session';
import { getFile, getGithubConfig } from '@/lib/github';
import { parseReview } from '@/lib/reviews';
import { parseProcess } from '@/lib/process';
import type { Review } from '@/lib/types';
import { ReviewView } from '@/components/ReviewView';
import { DraftBanner } from '@/components/DraftBanner';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Preview', robots: { index: false, follow: false } };

type Params = { params: Promise<{ slug: string }> };

/**
 * Read from the repository when publishing is set up, so a draft saved a moment ago can be
 * read before the site has rebuilt. Falls back to the deployed copy.
 */
async function loadSource(slug: string, extension = '.md'): Promise<string | undefined> {
  const github = getGithubConfig();
  const repoPath = `content/reviews/${slug}${extension}`;
  if (github) {
    const file = await getFile(github, repoPath);
    if (file) return file.content;
  }
  const local = path.join(process.cwd(), repoPath);
  return fs.existsSync(local) ? fs.readFileSync(local, 'utf8') : undefined;
}

/** A review exactly as readers will see it, drafts included, for the signed-in editor only. */
export default async function PreviewPage({ params }: Params) {
  const { slug } = await params;

  if (!(await isSignedIn())) {
    return (
      <div className="lede">
        <h1>Preview</h1>
        <p>
          Previews are for the editor. <Link href="/admin">Sign in</Link>, then open this link again.
        </p>
      </div>
    );
  }

  let review: Review | undefined;
  let problem: string | undefined;
  if (!/^[a-z0-9-]+$/.test(slug)) {
    problem = 'That is not a review address.';
  } else {
    try {
      const source = await loadSource(slug);
      if (source) {
        review = parseReview(source, slug);
        // The record of how it was made, which the review page shows at the end.
        const record = await loadSource(slug, '.process.json').catch(() => undefined);
        if (record) {
          try {
            review = { ...review, process: parseProcess(JSON.parse(record)).process };
          } catch {
            // A broken record leaves the section out; the review itself still previews.
          }
        }
      } else problem = `There is no review at content/reviews/${slug}.md.`;
    } catch (error) {
      problem = error instanceof Error ? error.message : 'The review could not be read.';
    }
  }

  if (!review) {
    return (
      <div className="lede">
        <h1>Preview</h1>
        <p className="notice err">{problem}</p>
        <p>
          <Link href="/admin">Back to admin</Link>
        </p>
      </div>
    );
  }

  return (
    <ReviewView
      review={review}
      banner={<DraftBanner slug={slug} draft={Boolean(review.draft)} humanInput={review.humanInput ?? null} />}
    />
  );
}
