import { NextResponse } from 'next/server';
import { isSignedIn } from '@/lib/session';
import { dbConfigured, describeDbError } from '@/lib/db';
import { getAllReviews } from '@/lib/reviews';
import { catalogueStats, syncCatalogue, syncState, topUnreviewed } from '@/lib/catalogue';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

function fail(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

/** DOIs of every review on the site, drafts included, so the list leaves them out. */
const reviewedDois = () =>
  getAllReviews({ includeDrafts: true })
    .map((review) => review.doi)
    .filter((doi): doi is string => Boolean(doi));

async function snapshot() {
  return {
    stats: await catalogueStats(),
    sync: await syncState(),
    top: await topUnreviewed(reviewedDois()),
  };
}

export async function GET() {
  if (!(await isSignedIn())) return fail('Sign in first.', 401);
  if (!dbConfigured()) return fail('No database is connected, so there is no catalogue yet.', 503);
  try {
    return NextResponse.json(await snapshot());
  } catch (error) {
    return fail(describeDbError(error), 502);
  }
}

/** Fetches the next batch from Europe PMC by hand, without waiting for the daily run. */
export async function POST() {
  if (!(await isSignedIn())) return fail('Sign in first.', 401);
  if (!dbConfigured()) return fail('No database is connected.', 503);
  try {
    const result = await syncCatalogue({ pages: 2, force: true });
    return NextResponse.json({ result, ...(await snapshot()) });
  } catch (error) {
    return fail(error instanceof Error && !('code' in error) ? error.message : describeDbError(error), 502);
  }
}
