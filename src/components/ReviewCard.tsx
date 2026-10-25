import Link from 'next/link';
import type { ReviewFrontmatter } from '@/lib/types';
import type { Engagement } from '@/lib/comments';
import { ScoreBadge } from './ScoreBadge';
import { Stars } from './Stars';
import { abbreviateAuthors } from '@/lib/authors';
import { timeAgo } from '@/lib/time';

/**
 * One row on the index. Also used by /admin to preview a pasted review exactly as it
 * will appear once published, so there is nothing to imagine.
 */
export function ReviewCard({
  review,
  href,
  engagement,
  now,
  preprintLabel = 'Preprint',
  excerpt,
}: {
  review: ReviewFrontmatter;
  href?: string;
  /** Editable site text; the admin preview falls back to the default. */
  preprintLabel?: string;
  /** Left out where there is no database, and in the /admin preview. */
  engagement?: Engagement;
  /** When a search matched inside the review, the text around the match. */
  excerpt?: { before: string; match: string; after: string } | null;
  now?: number;
}) {
  const citation = [abbreviateAuthors(review.authors), review.journal, review.year].filter(Boolean).join(' · ');

  return (
    <article className="card">
      <div className="card-stats">
        <ScoreBadge review={review} />
        {engagement && (
          <div className="card-engagement">
            {engagement.ratingAverage !== null && (
              <span
                className="card-rating"
                title={`${engagement.ratingAverage.toFixed(1)} out of 5, from ${engagement.ratingCount} reader rating${engagement.ratingCount === 1 ? '' : 's'}`}
              >
                <Stars value={engagement.ratingAverage} />
                <span className="card-rating-n">
                  {engagement.ratingAverage.toFixed(1)} ({engagement.ratingCount})
                </span>
              </span>
            )}
            {/* The count goes straight to the thread; the preview in admin has no page to go to. */}
            {(() => {
              const label =
                engagement.comments === 0
                  ? 'No comments'
                  : `${engagement.comments} comment${engagement.comments === 1 ? '' : 's'}`;
              return href ? (
                <Link className="card-comments" href={`${href}#comments`}>
                  {label}
                </Link>
              ) : (
                <span>{label}</span>
              );
            })()}
            {engagement.lastCommentAt && (
              <span title={`Latest comment ${timeAgo(engagement.lastCommentAt, now)}`}>
                {timeAgo(engagement.lastCommentAt, now)}
              </span>
            )}
          </div>
        )}
      </div>
      <div className="card-main">
        <h2>{href ? <Link href={href}>{review.title}</Link> : review.title}</h2>
        {(citation || review.preprint) && (
          <p className="cite">
            {citation}
            {review.preprint && (
              <>
                {citation ? ' ' : ''}
                <span className="tag-preprint">{preprintLabel}</span>
              </>
            )}
          </p>
        )}
        <p className="verdict">{review.verdict}</p>
        {excerpt && (
          <p className="card-excerpt">
            {excerpt.before}
            <mark>{excerpt.match}</mark>
            {excerpt.after}
          </p>
        )}
        <div className="chip-row">
          {review.weaknesses?.slice(0, 3).map((weakness) => (
            <span className="chip weakness" key={weakness}>
              {weakness}
            </span>
          ))}
          {review.strengths?.slice(0, 2).map((strength) => (
            <span className="chip strength" key={strength}>
              {strength}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
