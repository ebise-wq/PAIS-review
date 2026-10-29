import { isSignedIn } from '@/lib/session';
import { dbConfigured } from '@/lib/db';
import { catalogueCsv } from '@/lib/catalogue';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** The whole catalogue as a CSV download, for a spreadsheet. */
export async function GET() {
  if (!(await isSignedIn())) return new Response('Sign in first.', { status: 401 });
  if (!dbConfigured()) return new Response('No database is connected.', { status: 503 });
  return new Response(await catalogueCsv(), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="pais-catalogue-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
