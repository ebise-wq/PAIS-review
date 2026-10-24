import { getAllReviews } from '@/lib/reviews';
import { getSiteText } from '@/lib/site-text';
import { site } from '@/lib/site';
import { llmsTxt } from '@/lib/llms';

// Rebuilt with every deploy, which is when reviews change.
export const dynamic = 'force-static';

export function GET() {
  const text = getSiteText();
  const body = llmsTxt({
    siteName: text['site.name'],
    description: text['site.description'],
    siteUrl: site.url,
    reviews: getAllReviews(),
  });
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
