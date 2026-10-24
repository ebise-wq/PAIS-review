'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Review } from '@/lib/types';
import type { Engagement } from '@/lib/comments';
import { rankScore, ratingRank } from '@/lib/ranking';
import { excerptAround } from '@/lib/plaintext';
import { tagsOf, type TagList } from '@/lib/tags';
import { ReviewCard } from './ReviewCard';

export type ReviewSummary = Omit<Review, 'body'>;

type Sort = 'active' | 'newest' | 'oldest' | 'score-desc' | 'score-asc' | 'comments' | 'discussed' | 'rating';

export function ReviewIndex({
  reviews,
  conditions,
  engagement,
  serverNow,
  labels,
  tags,
}: {
  reviews: ReviewSummary[];
  conditions: string[];
  /** Only the tags some listed review carries, so no menu choice leads to an empty list. */
  tags: TagList;
  /** Absent when the site has no database; the engagement sorts are then hidden. */
  engagement?: Record<string, Engagement>;
  serverNow: number;
  labels: {
    searchPlaceholder: string;
    empty: string;
    noMatches: string;
    preprint: string;
    designFilter: string;
    anyDesign: string;
    topicFilter: string;
    anyTopic: string;
  };
}) {
  const hasEngagement = Boolean(engagement);
  const [active, setActive] = useState<string[]>([]);
  const [sort, setSort] = useState<Sort>(hasEngagement ? 'active' : 'newest');
  const [query, setQuery] = useState('');
  const [design, setDesign] = useState('');
  const [topics, setTopics] = useState<string[]>([]);
  const topicMenu = useRef<HTMLDetailsElement>(null);

  // The topic menu closes when the reader taps anywhere else, like a native menu.
  useEffect(() => {
    const close = (event: PointerEvent) => {
      const menu = topicMenu.current;
      if (menu?.open && !menu.contains(event.target as Node)) menu.open = false;
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, []);

  // The server rendered "3 h ago" and the ranking against its own clock. Re-run against
  // the reader's once mounted, so a cached page does not show a stale time. Starting
  // from the server's value keeps the first client render identical to the HTML.
  const [now, setNow] = useState(serverNow);
  useEffect(() => setNow(Date.now()), []);

  // The text of every review, fetched the first time someone searches.
  const [bodies, setBodies] = useState<Record<string, string> | null>(null);
  const searching = query.trim().length > 0;
  useEffect(() => {
    if (!searching || bodies) return;
    let cancelled = false;
    fetch('/search-index.json')
      .then((response) => (response.ok ? response.json() : {}))
      .then((json: Record<string, string>) => {
        if (!cancelled) setBodies(json);
      })
      .catch(() => {
        // Search still covers the summaries; it just cannot see inside the reviews.
      });
    return () => {
      cancelled = true;
    };
  }, [searching, bodies]);

  const shown = useMemo(() => {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    const haystack = (r: ReviewSummary) =>
      [r.title, r.authors, r.journal, r.studyType, r.verdict, r.conditions, r.strengths, r.weaknesses, r.year, r.preprint ? 'preprint' : '', tagLabels(r)]
        .flat()
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

    const filtered = reviews.filter((r) => {
      if (active.length && !active.every((c) => r.conditions?.includes(c))) return false;
      if (design && r.design !== design) return false;
      // Ticking several topics widens the list: a review shows if it has any of them.
      if (topics.length && !topics.some((t) => r.topics?.includes(t))) return false;
      if (terms.length) {
        const text = haystack(r);
        const body = bodies?.[r.slug]?.toLowerCase() ?? '';
        if (!terms.every((term) => text.includes(term) || body.includes(term))) return false;
      }
      return true;
    });

    const stats = (r: ReviewSummary) => engagement?.[r.slug];
    const newestFirst = (a: ReviewSummary, b: ReviewSummary) =>
      b.reviewedOn.localeCompare(a.reviewedOn) || a.title.localeCompare(b.title);

    return [...filtered].sort((a, b) => {
      switch (sort) {
        case 'oldest':
          return a.reviewedOn.localeCompare(b.reviewedOn) || a.title.localeCompare(b.title);
        // Unscored kinds (literature reviews) sort to the end either way.
        case 'score-desc':
          return (b.score ?? -1) - (a.score ?? -1) || a.title.localeCompare(b.title);
        case 'score-asc':
          return (a.score ?? 11) - (b.score ?? 11) || a.title.localeCompare(b.title);
        case 'comments':
          return (stats(b)?.comments ?? 0) - (stats(a)?.comments ?? 0) || newestFirst(a, b);
        case 'discussed':
          // Never-commented reviews sort last, whatever their publication date.
          return (
            (stats(b)?.lastCommentAt ?? '').localeCompare(stats(a)?.lastCommentAt ?? '') ||
            newestFirst(a, b)
          );
        case 'rating':
          return ratingRank(stats(b)) - ratingRank(stats(a)) || newestFirst(a, b);
        case 'active':
          return (
            rankScore(b, stats(b), now) - rankScore(a, stats(a), now) || newestFirst(a, b)
          );
        default:
          return newestFirst(a, b);
      }
    });
  }, [reviews, active, sort, query, engagement, now, bodies, design, topics, tags]);

  function tagLabels(r: ReviewSummary): string[] {
    const own = tagsOf(r, tags);
    return [own.design?.label ?? '', ...own.topics.map((t) => t.label)];
  }

  /** For a result that matched only inside the review, the stretch of text that matched. */
  const excerptFor = (r: ReviewSummary) => {
    if (!bodies) return null;
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    const summary = [r.title, r.authors, r.journal, r.studyType, r.verdict, r.conditions, r.strengths, r.weaknesses, tagLabels(r)]
      .flat()
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    const inBodyOnly = terms.find((term) => !summary.includes(term));
    return inBodyOnly ? excerptAround(bodies[r.slug] ?? '', inBodyOnly) : null;
  };

  const toggle = (condition: string) =>
    setActive((current) =>
      current.includes(condition)
        ? current.filter((c) => c !== condition)
        : [...current, condition],
    );

  return (
    <>
      <div className="controls">
        <input
          type="search"
          className="search"
          placeholder={labels.searchPlaceholder}
          aria-label={labels.searchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {conditions.length > 0 && (
          <div className="chip-row">
            {conditions.map((condition) => (
              <button
                key={condition}
                type="button"
                className="chip toggle"
                aria-pressed={active.includes(condition)}
                onClick={() => toggle(condition)}
              >
                {condition}
              </button>
            ))}
          </div>
        )}
        {(tags.designs.length > 0 || tags.topics.length > 0) && (
          <div className="tag-filters">
            {tags.designs.length > 0 && (
              <select aria-label={labels.designFilter} value={design} onChange={(e) => setDesign(e.target.value)}>
                <option value="">{labels.anyDesign}</option>
                {tags.designs.map((tag) => (
                  <option key={tag.id} value={tag.id}>
                    {tag.label}
                  </option>
                ))}
              </select>
            )}
            {tags.topics.length > 0 && (
              <details className="filter-menu" ref={topicMenu}>
                <summary aria-label={labels.topicFilter}>
                  {topics.length === 0
                    ? labels.anyTopic
                    : topics.length === 1
                      ? tags.topics.find((t) => t.id === topics[0])?.label
                      : `${topics.length} topics`}
                </summary>
                <div className="filter-menu-list">
                  {tags.topics.map((tag) => (
                    <label key={tag.id}>
                      <input
                        type="checkbox"
                        checked={topics.includes(tag.id)}
                        onChange={() =>
                          setTopics((current) =>
                            current.includes(tag.id) ? current.filter((t) => t !== tag.id) : [...current, tag.id],
                          )
                        }
                      />
                      {tag.label}
                    </label>
                  ))}
                  {topics.length > 0 && (
                    <button type="button" className="linkish" onClick={() => setTopics([])}>
                      {labels.anyTopic}
                    </button>
                  )}
                </div>
              </details>
            )}
          </div>
        )}
        <div className="spacer" />
        <div className="sort-control">
          <label htmlFor="sort">Sort</label>
          <select id="sort" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
            {hasEngagement && <option value="active">Active</option>}
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="score-desc">Highest score</option>
            <option value="score-asc">Lowest score</option>
            {hasEngagement && <option value="comments">Most comments</option>}
            {hasEngagement && <option value="discussed">Recently discussed</option>}
            {hasEngagement && <option value="rating">Highest reader rating</option>}
          </select>
        </div>
      </div>

      {shown.length === 0 ? (
        <p className="empty">
          {reviews.length === 0 ? labels.empty : labels.noMatches}
        </p>
      ) : (
        <ul className="review-list">
          {shown.map((review) => (
            <li key={review.slug}>
              <ReviewCard
                review={review}
                href={`/reviews/${review.slug}`}
                engagement={engagement?.[review.slug]}
                now={now}
                preprintLabel={labels.preprint}
                excerpt={excerptFor(review)}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
