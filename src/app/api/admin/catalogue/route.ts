import { NextResponse } from 'next/server';
import { isSignedIn } from '@/lib/session';
import { dbConfigured, describeDbError } from '@/lib/db';
import { PAPER_FILTERS, catalogueStats, listPapers, syncCatalogue, syncState, type PaperFilter } from '@/lib/catalogue';
import { markAllReviews } from '@/lib/catalogue-marking';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

function fail(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

const filterOf = (request: Request): PaperFilter => {
  const value = new URL(request.url).searchParams.get('filter') as PaperFilter | null;
  return value && PAPER_FILTERS.includes(value) ? value : 'unreviewed';
};

/** Opening the tab also brings the record of reviews up to date with the review files. */
async function snapshot(filter: PaperFilter) {
  const marked = await markAllReviews();
  return {
    stats: await catalogueStats(),
    sync: await syncState(),
    filter,
    papers: await listPapers(filter),
    marked,
  };
}

export async function GET(request: Request) {
  if (!(await isSignedIn())) return fail('Sign in first.', 401);
  if (!dbConfigured()) return fail('No database is connected, so there is no catalogue yet.', 503);
  try {
    return NextResponse.json(await snapshot(filterOf(request)));
  } catch (error) {
    return fail(describeDbError(error), 502);
  }
}

/** Fetches the next batch from Europe PMC by hand, without waiting for the daily run. */
export async function POST(request: Request) {
  if (!(await isSignedIn())) return fail('Sign in first.', 401);
  if (!dbConfigured()) return fail('No database is connected.', 503);
  try {
    const result = await syncCatalogue({ pages: 2, force: true });
    return NextResponse.json({ result, ...(await snapshot(filterOf(request))) });
  } catch (error) {
    return fail(error instanceof Error && !('code' in error) ? error.message : describeDbError(error), 502);
  }
}
