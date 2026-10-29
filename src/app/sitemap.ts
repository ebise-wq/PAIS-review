import type { MetadataRoute } from 'next';
import { getAllReviews } from '@/lib/reviews';
import { site } from '@/lib/site';
import { getTags } from '@/lib/tags-store';
import { TAG_GROUPS, usedTags } from '@/lib/tags';

export default function sitemap(): MetadataRoute.Sitemap {
  const reviews = getAllReviews();
  const latest = reviews[0]?.reviewedOn;

  return [
    { url: site.url, lastModified: latest ? new Date(latest) : new Date(), priority: 1 },
    { url: `${site.url}/methods`, priority: 0.8 },
    { url: `${site.url}/about`, priority: 0.5 },
    { url: `${site.url}/literature`, priority: 0.5 },
    ...reviews.map((review) => ({
      url: `${site.url}/reviews/${review.slug}`,
      lastModified: new Date(review.reviewedOn),
      priority: 0.7,
    })),
    // Tag pages with nothing on them yet are left out.
    ...TAG_GROUPS.flatMap((group) => usedTags(reviews, getTags())[group]).map((tag) => ({
      url: `${site.url}/tags/${tag.id}`,
      priority: 0.4,
    })),
  ];
}
