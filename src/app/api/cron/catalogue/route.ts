import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { dbConfigured } from '@/lib/db';
import { syncCatalogue } from '@/lib/catalogue';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/**
 * The daily catalogue sync, called by Vercel Cron (see vercel.json). Vercel sends
 * "Authorization: Bearer <CRON_SECRET>" when CRON_SECRET is set in the project; without
 * it this route refuses every call, so nobody else can make it fetch.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET ?? '';
  const given = request.headers.get('authorization') ?? '';
  const expected = `Bearer ${secret}`;
  const ok = secret.length >= 16 && given.length === expected.length && timingSafeEqual(Buffer.from(given), Buffer.from(expected));
  if (!ok) return NextResponse.json({ error: 'Not allowed.' }, { status: 401 });
  if (!dbConfigured()) return NextResponse.json({ error: 'No database is connected.' }, { status: 503 });
  try {
    return NextResponse.json(await syncCatalogue({ pages: 10 }));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Sync failed.' }, { status: 502 });
  }
}
