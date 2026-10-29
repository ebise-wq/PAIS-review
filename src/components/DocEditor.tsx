'use client';

import { useEffect, useRef, useState } from 'react';
import { CHANGE_KINDS, CHANGE_LABELS, bumpVersion, type ChangeKind } from '@/lib/version';
import { SiteTextEditor } from './SiteTextEditor';

/** Not a markdown page: a form with one box per piece of site text. */
const SITE_TEXT = 'site-text';

const PAGES = [
  { value: SITE_TEXT, label: 'Site text: banner, footer, headings, labels' },
  { value: 'about', label: 'About page' },
  { value: 'methods', label: 'Methods page' },
  { value: 'guide', label: 'Review guide' },
  { value: 'instructions', label: 'Reviewing instructions' },
  { value: 'skill', label: 'Review skill (Claude Code steps)' },
  { value: 'backlog', label: 'Backlog (admin only)' },
];

interface Result {
  ok?: boolean;
  path?: string;
  commitUrl?: string;
  bumpedGuide?: boolean;
  version?: string;
  error?: string;
  sha?: string | null;
}

export function DocEditor({ onExpired }: { onExpired: () => void }) {
  const [name, setName] = useState(SITE_TEXT);
  const siteTextDirty = useRef(false);
  const [content, setContent] = useState('');
  const [versioned, setVersioned] = useState(false);
  const [currentVersion, setCurrentVersion] = useState<string | null>(null);
  const [sha, setSha] = useState<string | null>(null);
  // Bumped to load the page again: after a save, or to pick up someone else's.
  const [loadCount, setLoadCount] = useState(0);
  const [change, setChange] = useState<ChangeKind>('patch');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    if (name === SITE_TEXT) return;
    let cancelled = false;
    setLoading(true);
    if (loadCount === 0) setResult(null);

    fetch(`/api/admin/doc?name=${name}`)
      .then((response) => response.json())
      .then(
        (json: {
          content?: string;
          versioned?: boolean;
          guideVersion?: string | null;
          sha?: string | null;
          error?: string;
        }) => {
          if (cancelled) return;
          if (json.content !== undefined) {
            setContent(json.content);
            setVersioned(Boolean(json.versioned));
            setCurrentVersion(json.guideVersion ?? null);
            setSha(json.sha ?? null);
            setChange('patch');
            setNote('');
          } else {
            setResult({ error: json.error ?? 'Could not load the current page content.' });
          }
        },
      )
      .catch(() => {
        if (!cancelled) setResult({ error: 'Could not load the current page content.' });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [name, loadCount]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setResult(null);
    try {
      const response = await fetch('/api/admin/doc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          sha,
          content,
          change: versioned ? change : undefined,
          note: versioned ? note : undefined,
        }),
      });
      if (response.status === 401) {
        onExpired();
        return;
      }
      const json = (await response.json()) as Result;
      setResult(json);
      if (json.ok) {
        setNote('');
        // Load the saved version back: its sha, and for the guide the stamped version and
        // changelog, so a second save in a row is not refused as out of date.
        setLoadCount((n) => n + 1);
      }
    } catch {
      setResult({ error: 'Could not reach the server. Check your connection and try again.' });
    } finally {
      setBusy(false);
    }
  }

  const nextVersion = bumpVersion(currentVersion, change);

  function choosePage(next: string) {
    if (
      name === SITE_TEXT &&
      siteTextDirty.current &&
      !window.confirm('You have unsaved changes to the site text. Leave without publishing them?')
    ) {
      return;
    }
    siteTextDirty.current = false;
    setResult(null);
    setName(next);
  }

  const pagePicker = (
    <div className="field">
      <label htmlFor="doc-name">Page</label>
      <select id="doc-name" value={name} onChange={(event) => choosePage(event.target.value)}>
        {PAGES.map((page) => (
          <option key={page.value} value={page.value}>
            {page.label}
          </option>
        ))}
      </select>
    </div>
  );

  // Its own component, outside the form below: Enter in one of its boxes must not
  // submit a markdown page save.
  if (name === SITE_TEXT) {
    return (
      <div>
        {pagePicker}
        <SiteTextEditor
          onExpired={onExpired}
          onDirtyChange={(dirty) => {
            siteTextDirty.current = dirty;
          }}
        />
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit}>
      {pagePicker}

      {versioned && (
        <p className="hint warn">
          This page is part of the versioned method — the guide, the reviewing instructions and the
          review skill share one number, currently v{currentVersion ?? '?'}. Saving any of them bumps it and writes your note into the guide&rsquo;s changelog, so there is
          nothing to edit by hand afterwards.
        </p>
      )}

      <div className="field">
        <label htmlFor="doc-content">Content</label>
        <textarea
          id="doc-content"
          rows={22}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          disabled={loading}
          required
        />
        <p className="hint">
          {loading
            ? 'Loading the current content…'
            : name === 'guide'
              ? 'Markdown. Leave version and updated in the frontmatter alone — both are set for you on save.'
              : name === 'methods'
                ? 'Markdown. {{GUIDE_VERSION}} and {{SITE_URL}} are filled in when served — never hard-code them.'
                : name === 'skill'
                  ? 'Markdown. Keep name and description in the frontmatter: Claude Code uses them to find the skill.'
                  : 'Markdown, including the frontmatter block at the top.'}
        </p>
      </div>

      {versioned && (
        <>
          <div className="field">
            <label htmlFor="doc-change">What kind of change is this?</label>
            <select
              id="doc-change"
              value={change}
              onChange={(event) => setChange(event.target.value as ChangeKind)}
            >
              {CHANGE_KINDS.map((kind) => (
                <option key={kind} value={kind}>
                  {CHANGE_LABELS[kind].label} (v{currentVersion ?? '?'} &rarr; v
                  {bumpVersion(currentVersion, kind)})
                </option>
              ))}
            </select>
            <p className="hint">{CHANGE_LABELS[change].help}</p>
          </div>

          <div className="field">
            <label htmlFor="doc-note">What changed</label>
            <textarea
              id="doc-note"
              rows={2}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="One line. Published as the changelog entry."
              maxLength={300}
              required
            />
            <p className="hint">
              Goes in as <code>- **{nextVersion}** ({new Date().toISOString().slice(0, 10)}) &mdash;
              your note</code>, at the top of the guide&rsquo;s changelog.
            </p>
          </div>
        </>
      )}

      <button className="primary" type="submit" disabled={busy || loading}>
        {busy ? 'Publishing…' : 'Publish'}
      </button>

      {result?.ok && (
        <div className="notice ok">
          Saved <code>{result.path}</code>
          {result.version ? ` as methods v${result.version}, changelog entry included` : ''}.
          Vercel is rebuilding — the change will be live in a minute or two.
          {result.commitUrl && (
            <>
              {' '}
              <a href={result.commitUrl} target="_blank" rel="noreferrer">
                See the commit
              </a>
              .
            </>
          )}
        </div>
      )}
      {result?.error && (
        <div className="notice err">
          {result.error}{' '}
          {/reload/i.test(result.error) && (
            <button
              type="button"
              className="linkish"
              onClick={() => {
                setResult(null);
                setLoadCount((n) => n + 1);
              }}
            >
              Reload now
            </button>
          )}
        </div>
      )}
    </form>
  );
}
