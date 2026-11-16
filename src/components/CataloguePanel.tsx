'use client';

import { useCallback, useEffect, useState } from 'react';
import { formatScore } from '@/lib/types';

interface Paper {
  id: string;
  doi: string | null;
  title: string;
  authors: string | null;
  journal: string | null;
  year: number | null;
  conditions: string[];
  cited_by: number;
  access: 'open' | 'free' | 'paywalled';
  best_url: string | null;
  retracted: boolean;
  review_slug: string | null;
  review_status: 'draft' | 'published' | null;
  review_score: number | null;
  review_signal: string | null;
}

type Filter = 'unreviewed' | 'drafts' | 'published';
const FILTERS: { id: Filter; label: string; hint: string }[] = [
  { id: 'unreviewed', label: 'Not yet reviewed', hint: 'No review on the site, draft or published.' },
  { id: 'drafts', label: 'Drafts', hint: 'A draft review is waiting in admin preview.' },
  { id: 'published', label: 'Published', hint: 'Reviewed and on the site.' },
];

interface Snapshot {
  stats: {
    total: number;
    inTitle: number;
    retracted: number;
    byKind: Record<string, number>;
    byCondition: Record<string, number>;
    byAccess: Record<string, number>;
    reviews: { published: number; draft: number; unmatched: number };
  };
  sync: { cursor: string | null; pass_done: string | null; seen_in_pass: number; hit_count: number | null; last_run: string | null; last_error: string | null };
  filter: Filter;
  papers: Paper[];
}

const ACCESS_LABEL = { open: 'Open access', free: 'Free to read', paywalled: 'Paywalled' };
const n = (value: number | undefined) => (value ?? 0).toLocaleString('en-GB');
const day = (iso: string | null) => (iso ? new Date(iso).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : 'never');

/**
 * The paper catalogue: what Europe PMC indexes on these conditions, filled by a daily sync.
 * Counts, the sync's progress, a CSV download, and the most-cited papers not yet reviewed.
 */
export function CataloguePanel({ onExpired }: { onExpired: () => void }) {
  const [data, setData] = useState<Snapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState<Filter>('unreviewed');

  const load = useCallback(
    async (method: 'GET' | 'POST') => {
      setError(null);
      if (method === 'POST') setBusy(true);
      try {
        const response = await fetch(`/api/admin/catalogue?filter=${filter}`, { method });
        if (response.status === 401) return onExpired();
        const json = await response.json();
        if (!response.ok) setError(json.error ?? 'Could not load the catalogue.');
        else setData(json);
      } catch {
        setError('Could not reach the server.');
      } finally {
        setBusy(false);
      }
    },
    [onExpired, filter],
  );

  useEffect(() => {
    load('GET');
  }, [load]);

  if (!data) return error ? <div className="notice err">{error}</div> : <p className="empty">Loading…</p>;
  const { stats, sync, papers } = data;
  const shown = FILTERS.find((f) => f.id === filter) ?? FILTERS[0];
  const passing = Boolean(sync.cursor);

  return (
    <div className="catalogue-panel">
      <p className="hint">
        Every paper Europe PMC indexes that names ME/CFS, long COVID or another post-acute infection syndrome in its
        title or abstract. It fills itself once a day; a full pass takes about three days, then it refreshes weekly.
      </p>

      <dl className="catalogue-stats">
        <div><dt>Papers</dt><dd>{n(stats.total)}</dd></div>
        <div><dt>Condition in the title</dt><dd>{n(stats.inTitle)}</dd></div>
        <div><dt>Research</dt><dd>{n(stats.byKind.research)}</dd></div>
        <div><dt>Reviews</dt><dd>{n(stats.byKind.review)}</dd></div>
        <div><dt>Commentary</dt><dd>{n(stats.byKind.commentary)}</dd></div>
        <div><dt>Preprints</dt><dd>{n(stats.byKind.preprint)}</dd></div>
        <div><dt>ME/CFS</dt><dd>{n(stats.byCondition['ME/CFS'])}</dd></div>
        <div><dt>Long COVID</dt><dd>{n(stats.byCondition['Long COVID'])}</dd></div>
        <div><dt>Other</dt><dd>{n(stats.byCondition.Other)}</dd></div>
        <div><dt>Retracted</dt><dd>{n(stats.retracted)}</dd></div>
        <div><dt>Reviewed, published</dt><dd>{n(stats.reviews.published)}</dd></div>
        <div><dt>Reviewed, draft</dt><dd>{n(stats.reviews.draft)}</dd></div>
      </dl>
      {stats.reviews.unmatched > 0 && (
        <p className="hint">
          {n(stats.reviews.unmatched)} of the site&apos;s reviews match no paper in the catalogue: no DOI, a DOI the
          catalogue does not have yet, or not a paper.
        </p>
      )}
      <p className="hint">
        Research papers: {n(stats.byAccess.open)} open access, {n(stats.byAccess.free)} free to read,{' '}
        {n(stats.byAccess.paywalled)} paywalled.
      </p>

      <p className="hint">
        {passing
          ? `Pass in progress: ${n(sync.seen_in_pass)} of ${n(sync.hit_count ?? undefined)} read.`
          : `Last full pass finished ${day(sync.pass_done)}.`}{' '}
        Last run {day(sync.last_run)}.
      </p>
      {sync.last_error && <div className="notice err">Last run failed: {sync.last_error}</div>}

      <div className="publish-actions">
        <button type="button" className="primary" disabled={busy} onClick={() => load('POST')}>
          {busy ? 'Fetching…' : 'Fetch the next 2,000 now'}
        </button>
        <a className="linkish" href="/api/admin/catalogue/export">Download as CSV</a>
      </div>
      {error && <div className="notice err">{error}</div>}

      <h2 className="manage-heading">Most cited research papers</h2>
      <div className="catalogue-filters" role="tablist">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={filter === f.id}
            className={filter === f.id ? 'secondary small active' : 'secondary small'}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>
      <p className="hint">Research papers with the condition in their title. {shown.hint}</p>
      {papers.length === 0 ? (
        <p className="hint">None.</p>
      ) : (
        <ol className="catalogue-top">
          {papers.map((paper) => (
            <li key={paper.id}>
              <a href={paper.best_url ?? (paper.doi ? `https://doi.org/${paper.doi}` : '#')} target="_blank" rel="noreferrer">
                {paper.title}
              </a>
              {paper.retracted && <strong> (retracted)</strong>}
              <span className="catalogue-meta">
                {' '}
                — {paper.authors?.split(',')[0]}, {paper.journal} {paper.year} · {n(paper.cited_by)} citations ·{' '}
                {ACCESS_LABEL[paper.access]}
                {paper.doi ? ` · ${paper.doi}` : ''}
              </span>
              {paper.review_slug && (
                <span className="catalogue-review">
                  {' · '}
                  <a href={paper.review_status === 'draft' ? `/admin/preview/${paper.review_slug}` : `/reviews/${paper.review_slug}`}>
                    {paper.review_status === 'draft' ? 'Draft review' : 'Review'}
                    {paper.review_score != null ? `: ${formatScore(paper.review_score)}` : paper.review_signal ? `: ${paper.review_signal}` : ''}
                  </a>
                </span>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
