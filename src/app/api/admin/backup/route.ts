import { NextResponse } from 'next/server';
import { dbConfigured, describeDbError } from '@/lib/db';
import { exportAll } from '@/lib/backup';
import { isSignedIn } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Everything readers have added, as one JSON file to keep. Editor only: it holds voter tokens and network addresses. */
export async function GET() {
  if (!(await isSignedIn())) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });
  if (!dbConfigured()) return NextResponse.json({ error: 'There is no database on this site.' }, { status: 503 });
  try {
    const backup = await exportAll();
    const date = backup.exportedAt.slice(0, 10);
    return new NextResponse(JSON.stringify(backup, null, 1), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="pais-review-backup-${date}.json"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: describeDbError(error) }, { status: 503 });
  }
}
