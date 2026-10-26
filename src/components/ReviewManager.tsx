'use client';

import { useEffect, useState } from 'react';
import { HUMAN_INPUT_LABELS, HUMAN_INPUT_LEVELS, type HumanInput, type ReviewKind, type Signal } from '@/lib/types';
import { EMPTY_TAGS, type TagList } from '@/lib/tags';
import { ScoreBadge } from './ScoreBadge';

interface Row {
  slug: string;
  title: string;
  kind: ReviewKind;
  draft: boolean;
  reviewedOn: string;
  guideVersion: string | null;
  guideNotes: string[];
  humanInput: HumanInput | null;
  preprint: boolean;
  conditions: string[];
  design: string | null;
  topics: string[];
  score: number | null;
  signal: Signal | null;
  verdict: string;
  tokens: { total: number; cached: number } | null;
  minutes: number | null;
  factCheck: { major: number; moderate: number; minor: number; fixed: number } | null;
}

const compact = (n: number) => (n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : `${Math.round(n / 1e3)}k`);

/** "1.2M tokens (1.0M cached) · 48 min · fact check: 0 major, 2 moderate, 5 minor, 6 fixed" */
function processLine(row: Row): string | null {
  const parts = [
    row.tokens !== null && `${compact(row.tokens.total)} tokens (${compact(row.tokens.cached)} cached)`,
    row.minutes !== null && `${row.minutes} min`,
    row.factCheck &&
      `fact check: ${row.factCheck.major} major, ${row.factCheck.moderate} moderate, ${row.factCheck.minor} minor, ${row.factCheck.fixed} fixed`,
  ].filter(Boolean);
  return parts.length ? parts.join(' · ') : null;
}

type Action = 'withdraw' | 'restore' | 'humanInput' | 'tags';

export function ReviewManager({ onExpired }: { onExpired: () => void }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  // Null until loaded: the tag editor reads a review's conditions against the list, so it
  // must not start before the list is there.
  const [tags, setTags] = useState<TagList | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = (url: string) =>
      fetch(url).then((response) => {
        if (response.status === 401) {
          onExpired();
          return null;
        }
        return response.json();
      });
    load('/api/admin/reviews')
      .then((json: { reviews?: Row[]; error?: string } | null) => {
        if (!json) return;
        if (json.reviews) setRows(json.reviews);
        else setError(json.error ?? 'Could not load reviews.');
      })
      .catch(() => setError('Could not load reviews.'));
    // Without the list the tag editor is simply empty; the rest still works.
    load('/api/admin/tags')
      .then((json: { tags?: TagList } | null) => setTags(json?.tags ?? EMPTY_TAGS))
      .catch(() => setTags(EMPTY_TAGS));
  }, [onExpired]);

  async function act(slug: string, action: Action, extra: Record<string, unknown> = {}) {
    if (action === 'withdraw' && !window.confirm('Withdraw this review from the site? It can be restored later.')) return;
    setBusy(slug);
    setError(null);
    try {
      const response = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, action, ...extra }),
      });
      if (response.status === 401) {
        onExpired();
        return;
      }
      const json = (await response.json()) as {
        ok?: boolean;
        draft?: boolean;
        humanInput?: HumanInput | null;
        conditions?: string[];
        design?: string | null;
        topics?: string[];
        error?: string;
      };
      if (json.ok) {
        setRows((current) =>
          current
            ? current.map((row) =>
                row.slug === slug
                  ? {
                      ...row,
                      draft: Boolean(json.draft),
                      humanInput: json.humanInput ?? row.humanInput,
                      conditions: json.conditions ?? [],
                      design: json.design ?? null,
                      topics: json.topics ?? [],
                    }
                  : row,
              )
            : current,
        );
      } else {
        setError(json.error ?? 'Could not update the review.');
      }
    } catch {
      setError('Could not reach the server.');
    } finally {
      setBusy(null);
    }
  }

  if (error && !rows) return <div className="notice err">{error}</div>;
  if (!rows) return <p className="empty">Loading…</p>;

  const drafts = rows.filter((row) => row.draft);
  const published = rows.filter((row) => !row.draft);
  const notes = rows.flatMap((row) => row.guideNotes.map((note) => ({ note, slug: row.slug, title: row.title })));

  const item = (row: Row) => (
    <li key={row.slug} className={row.draft ? 'is-draft' : ''}>
      <div className="manage-row">
        <div className="manage-score">
          <ScoreBadge review={{ kind: row.kind, score: row.score ?? undefined, signal: row.signal ?? undefined }} />
        </div>
        <div className="manage-main">
          {/* A draft has no public page yet; its title opens the preview instead. */}
          <a href={row.draft ? `/admin/preview/${row.slug}` : `/reviews/${row.slug}`}>{row.title}</a>
          <span className="manage-meta">
            {row.reviewedOn} · {row.kind}
            {row.preprint ? ' (preprint)' : ''}
            {row.guideVersion ? ` · guide v${row.guideVersion}` : ' · no guide version'}
          </span>
          {processLine(row) && <span className="manage-meta">{processLine(row)}</span>}
          {row.draft && <p className="manage-verdict">{row.verdict}</p>}
          <label className="manage-input">
            Human input{' '}
            <select
              value={row.humanInput ?? ''}
              disabled={busy === row.slug}
              onChange={(event) => {
                const value = event.target.value as HumanInput;
                if (value) act(row.slug, 'humanInput', { humanInput: value });
              }}
            >
              {!row.humanInput && <option value="">Not recorded</option>}
              {HUMAN_INPUT_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {HUMAN_INPUT_LABELS[level]}
                </option>
              ))}
            </select>
          </label>
          {tags && (
            <TagEditor
              key={`${row.conditions.join(',')}|${row.design}|${row.topics.join(',')}`}
              row={row}
              tags={tags}
              busy={busy === row.slug}
              onSave={(chosen) => act(row.slug, 'tags', chosen)}
            />
          )}
        </div>
      </div>
      <div className="manage-actions">
        {row.draft && (
          <a className="secondary small" href={`/admin/preview/${row.slug}`}>
            Preview
          </a>
        )}
        <button
          type="button"
          className={row.draft ? 'primary' : 'secondary'}
          disabled={busy === row.slug || (row.draft && !row.humanInput)}
          title={row.draft && !row.humanInput ? 'Set the human input first' : undefined}
          onClick={() => act(row.slug, row.draft ? 'restore' : 'withdraw')}
        >
          {busy === row.slug ? '…' : row.draft ? 'Publish' : 'Withdraw'}
        </button>
      </div>
    </li>
  );

  return (
    <div>
      {error && <div className="notice err">{error}</div>}

      <h2 className="manage-heading">Drafts waiting ({drafts.length})</h2>
      {drafts.length === 0 ? (
        <p className="hint">Nothing waiting.</p>
      ) : (
        <ul className="manage-list">{drafts.map(item)}</ul>
      )}

      <h2 className="manage-heading">Published ({published.length})</h2>
      <ul className="manage-list">{published.map(item)}</ul>

      <h2 className="manage-heading">Notes for the guide</h2>
      {notes.length === 0 ? (
        <p className="hint">No review has flagged anything for the guide yet.</p>
      ) : (
        <ul className="notes-list">
          {notes.map((note, index) => (
            <li key={`${note.slug}-${index}`}>
              {note.note}{' '}
              <a href={`/reviews/${note.slug}`} className="manage-meta">
                — {note.title.length > 60 ? `${note.title.slice(0, 60)}…` : note.title}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Folded by default: one line saying what is set, opening to a design menu and topic toggles. */
function TagEditor({
  row,
  tags,
  busy,
  onSave,
}: {
  row: Row;
  tags: TagList;
  busy: boolean;
  onSave: (chosen: { conditions: string[]; design: string | null; topics: string[] }) => void;
}) {
  // Reviews hold conditions by name; the editor works in ids like the other groups.
  const initialConditions = tags.conditions.filter((tag) => row.conditions.includes(tag.label)).map((tag) => tag.id);
  const [conditions, setConditions] = useState<string[]>(initialConditions);
  const [design, setDesign] = useState(row.design ?? '');
  const [topics, setTopics] = useState<string[]>(row.topics);
  if (tags.conditions.length === 0 && tags.designs.length === 0 && tags.topics.length === 0) return null;

  const label = (id: string | null) =>
    [...tags.designs, ...tags.topics].find((tag) => tag.id === id)?.label ?? id;
  const summary = [...row.conditions, row.design ? label(row.design) : null, ...row.topics.map(label)]
    .filter(Boolean)
    .join(' · ');
  const same = (a: string[], b: string[]) => a.slice().sort().join() === b.slice().sort().join();
  const changed = design !== (row.design ?? '') || !same(topics, row.topics) || !same(conditions, initialConditions);
  const toggle = (set: (update: (current: string[]) => string[]) => void, id: string) =>
    set((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]));
  const chips = (title: string, list: { id: string; label: string }[], chosen: string[], set: typeof setTopics) => (
    <div className="chip-row">
      <span className="manage-tags-title">{title}</span>
      {list.map((tag) => (
        <button
          key={tag.id}
          type="button"
          className="chip toggle"
          aria-pressed={chosen.includes(tag.id)}
          disabled={busy}
          onClick={() => toggle(set, tag.id)}
        >
          {tag.label}
        </button>
      ))}
    </div>
  );

  return (
    <details className="manage-tags">
      <summary>Tags: {summary || <em>none yet</em>}</summary>
      {chips('Conditions', tags.conditions, conditions, setConditions)}
      <label className="manage-input">
        Design{' '}
        <select value={design} disabled={busy} onChange={(event) => setDesign(event.target.value)}>
          <option value="">None</option>
          {tags.designs.map((tag) => (
            <option key={tag.id} value={tag.id}>
              {tag.label}
            </option>
          ))}
        </select>
      </label>
      {chips('Topics', tags.topics, topics, setTopics)}
      <button type="button" className="secondary small" disabled={busy || !changed} onClick={() => onSave({ conditions, design: design || null, topics })}>
        {busy ? 'Saving…' : 'Save tags'}
      </button>
    </details>
  );
}
