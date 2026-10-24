'use client';

import { useEffect, useState } from 'react';
import { HUMAN_INPUT_LABELS, HUMAN_INPUT_LEVELS, type HumanInput, type ReviewFrontmatter } from '@/lib/types';
import { DEFAULTS } from '@/lib/site-text-schema';
import { ReviewCard } from './ReviewCard';

interface Parsed {
  slug?: string;
  review?: ReviewFrontmatter;
  abbreviations?: { frontmatter: { where: string; terms: string[] }[]; body: string[] };
  error?: string;
}

interface Result {
  ok?: boolean;
  slug?: string;
  replaced?: boolean;
  commitUrl?: string;
  error?: string;
  exists?: boolean;
  draft?: boolean;
}

export function ReviewPublisher({ onExpired }: { onExpired: () => void }) {
  const [body, setBody] = useState('');
  const [slug, setSlug] = useState('');
  const [parsed, setParsed] = useState<Parsed | null>(null);
  const [overwrite, setOverwrite] = useState(false);
  // Not defaulted: "none" is a claim about the review, so it has to be chosen.
  const [humanInput, setHumanInput] = useState<HumanInput | ''>('');
  const [busy, setBusy] = useState(false);
  const [tidying, setTidying] = useState(false);
  const [tidyNote, setTidyNote] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  // Parse on the server as you type, so the preview below is the real thing that
  // would be committed rather than a second, client-side guess at it.
  useEffect(() => {
    if (!body.trim()) {
      setParsed(null);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(() => {
      fetch('/api/admin/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body }),
      })
        .then((response) => response.json())
        .then((json: Parsed) => {
          if (cancelled) return;
          setParsed(json);
          const stated = json.review?.humanInput;
          if (stated) setHumanInput((current) => current || stated);
        })
        .catch(() => {
          if (!cancelled) setParsed({ error: 'Could not reach the server to check this.' });
        });
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [body]);

  async function tidy() {
    setTidying(true);
    setTidyNote(null);
    setResult(null);
    try {
      const response = await fetch('/api/admin/normalise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw: body }),
      });
      if (response.status === 401) {
        onExpired();
        return;
      }
      const json = (await response.json()) as {
        ok?: boolean;
        markdown?: string;
        scoreMissing?: boolean;
        error?: string;
      };
      if (json.ok && json.markdown) {
        setBody(json.markdown);
        setTidyNote(
          json.scoreMissing
            ? 'Converted. The source did not state an overall grade, so no score was set — add one to the frontmatter before publishing.'
            : 'Converted. Read it before publishing: the conversion can misplace things.',
        );
      } else {
        setTidyNote(json.error ?? 'Could not convert the review.');
      }
    } catch {
      setTidyNote('Could not reach the server.');
    } finally {
      setTidying(false);
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (ready) send(false);
  }

  async function send(asDraft: boolean) {
    setBusy(true);
    setResult(null);
    try {
      const response = await fetch('/api/admin/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body, slug: slug || undefined, overwrite, humanInput, draft: asDraft }),
      });
      if (response.status === 401) {
        onExpired();
        return;
      }
      const json = (await response.json()) as Result;
      setResult(json);
      if (json.ok) {
        setBody('');
        setSlug('');
        setParsed(null);
        setOverwrite(false);
        setHumanInput('');
        setTidyNote(null);
      }
    } catch {
      setResult({ error: 'Could not reach the server. Check your connection and try again.' });
    } finally {
      setBusy(false);
    }
  }

  const draftReady = Boolean(parsed?.review);
  const ready = draftReady && humanInput !== '';

  return (
    <form onSubmit={onSubmit}>
      <div className="field">
        <label htmlFor="review-body">Paste the review</label>
        <textarea
          id="review-body"
          rows={14}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder={'Paste a finished review file, or any review text and press "Tidy up" below.'}
          required
        />
        <div className="tidy-row">
          <button
            type="button"
            className="secondary"
            onClick={tidy}
            disabled={tidying || !body.trim()}
          >
            {tidying ? 'Converting…' : 'Tidy up with Claude'}
          </button>
          <p className="hint">
            Converts any review text into this site&rsquo;s format. It restructures only — it never
            invents a grade or changes a judgement.
          </p>
        </div>
      </div>

      {tidyNote && <div className="notice info">{tidyNote}</div>}

      {parsed?.error && <div className="notice err">{parsed.error}</div>}

      {parsed?.review && (
        <>
          <p className="preview-label">How it will look on the index</p>
          <div className="preview">
            <ReviewCard review={parsed.review} />
          </div>

          {!parsed.review.model && (
            <p className="hint warn">
              No <code>model</code> in the frontmatter. Add the model that wrote this
              (e.g. <code>claude-opus-5</code>) — it publishes either way, but the review page
              will say the model is unrecorded.
            </p>
          )}

          {parsed.review.model && !parsed.review.effort && (
            <p className="hint">
              No <code>effort</code> in the frontmatter. If you know the effort level the model ran
              at (e.g. <code>high</code>), add it — the page shows it next to the model.
            </p>
          )}

          {parsed.abbreviations && parsed.abbreviations.frontmatter.length > 0 && (
            <p className="hint warn">
              Abbreviations in the frontmatter, which readers see on the index:{' '}
              {parsed.abbreviations.frontmatter
                .map((warning) => `${warning.terms.join(', ')} in ${warning.where}`)
                .join('; ')}
              . Write them out, unless they are as familiar as ME/CFS.
            </p>
          )}

          {parsed.abbreviations && parsed.abbreviations.body.length > 0 && (
            <p className="hint warn">
              Not written out at first use: {parsed.abbreviations.body.join(', ')}. Put the full
              term first with the abbreviation in brackets, or say what a name is. This is a
              rough check — names can show up here too.
            </p>
          )}

          {!parsed.review.read?.length && !parsed.review.access && (
            <p className="hint warn">
              The review does not say what the model read. Add a <code>read</code> list to the
              frontmatter, one line per thing it opened; without it the review page says
              &ldquo;What Claude read — not recorded&rdquo;.
            </p>
          )}

          {parsed.review.context?.some((item) => !item.source) && (
            <p className="hint warn">
              A context note has no <code>source</code>. These are published as fact about named
              people — add a link, or remove the note.
            </p>
          )}

          <div className="field">
            <label htmlFor="human-input">How much did you change it?</label>
            <select
              id="human-input"
              value={humanInput}
              onChange={(event) => setHumanInput(event.target.value as HumanInput | '')}
              required
            >
              <option value="">Choose…</option>
              {HUMAN_INPUT_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {HUMAN_INPUT_LABELS[level]} — {DEFAULTS[`humanInput.${level}`]}
                </option>
              ))}
            </select>
            <p className="hint">
              Published on the review as &ldquo;Human input&rdquo;. Only you know this, so the
              model never sets it. Needed to publish; a draft can be saved without it.
            </p>
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="review-slug">Filename</label>
              <input
                id="review-slug"
                type="text"
                value={slug}
                placeholder={parsed.slug}
                onChange={(event) => setSlug(event.target.value)}
              />
              <p className="hint">Leave blank to use the one derived from the title.</p>
            </div>
            <div className="field">
              <label htmlFor="overwrite" className="checkbox">
                <input
                  id="overwrite"
                  type="checkbox"
                  checked={overwrite}
                  onChange={(event) => setOverwrite(event.target.checked)}
                />
                Replace if it already exists
              </label>
            </div>
          </div>
        </>
      )}

      <div className="publish-actions">
        <button className="secondary" type="button" disabled={busy || !draftReady} onClick={() => send(true)}>
          Save as draft
        </button>
        <button className="primary" type="submit" disabled={busy || !ready}>
          {busy ? 'Saving…' : 'Publish'}
        </button>
      </div>
      <p className="hint">
        A draft is not on the site. You can read it in the site design, then publish it from there.
      </p>

      {result?.ok && result.draft && (
        <div className="notice ok">
          Saved as a draft, not public.{' '}
          <a href={`/admin/preview/${result.slug}`}>Read it as it will look</a>, then publish it from
          the top of that page.
        </div>
      )}
      {result?.ok && !result.draft && (
        <div className="notice ok">
          {result.replaced ? 'Replaced' : 'Published'}. Vercel is rebuilding — it will be live at{' '}
          <a href={`/reviews/${result.slug}`}>/reviews/{result.slug}</a> in a minute or two.
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
      {result?.error && <div className="notice err">{result.error}</div>}
    </form>
  );
}
