/**
 * Keeping the catalogue's record of reviews in step with the site. Never lets a database
 * problem stop publishing: the review files are the record, and the next full mark catches up.
 */
import { dbConfigured } from './db';
import { getAllReviews } from './reviews';
import { markReview, markReviews, reviewEntry } from './catalogue';

/** Copies every review file, drafts included, into the catalogue. */
export async function markAllReviews(): Promise<{ marked: number; removed: number }> {
  return markReviews(getAllReviews({ includeDrafts: true }).map(reviewEntry));
}

/**
 * Records a review just published, drafted, withdrawn or restored, from the file as it was
 * written. Errors are logged, not thrown.
 */
export async function markReviewQuietly(review: Parameters<typeof reviewEntry>[0]): Promise<void> {
  if (!dbConfigured()) return;
  try {
    await markReview(reviewEntry(review));
  } catch (error) {
    console.error('Could not mark the review in the catalogue:', error instanceof Error ? error.message : error);
  }
}
