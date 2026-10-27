'use client';

import { useEffect, useState } from 'react';
import { ReviewPublisher } from './ReviewPublisher';
import { DocEditor } from './DocEditor';
import { BacklogPanel } from './BacklogPanel';
import { ReviewManager } from './ReviewManager';
import { TagsPanel } from './TagsPanel';

const TABS = [
  { id: 'review', label: 'Publish a review' },
  { id: 'page', label: 'Edit a page' },
  { id: 'manage', label: 'Reviews' },
  { id: 'tags', label: 'Tags' },
  { id: 'backlog', label: 'Backlog' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export function AdminPanel() {
  const [tab, setTab] = useState<TabId>('review');
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [configured, setConfigured] = useState(true);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/admin/session')
      .then((response) => response.json())
      .then((json: { signedIn?: boolean; configured?: boolean }) => {
        setSignedIn(Boolean(json.signedIn));
        setConfigured(json.configured !== false);
      })
      .catch(() => setSignedIn(false));
  }, []);

  // Drafts waiting to be read are the usual reason to open admin, so say how many, and
  // open on them when there are any.
  useEffect(() => {
    if (!signedIn) return;
    fetch('/api/admin/reviews')
      .then((response) => (response.ok ? response.json() : null))
      .then((json: { reviews?: { draft: boolean }[] } | null) => {
        if (!json?.reviews) return;
        const count = json.reviews.filter((review) => review.draft).length;
        setDrafts(count);
        if (count > 0) setTab((current) => (current === 'review' ? 'manage' : current));
      })
      .catch(() => {});
  }, [signedIn]);

  async function signIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const json = (await response.json()) as { ok?: boolean; error?: string };
      if (json.ok) {
        setSignedIn(true);
        setPassword('');
      } else {
        setError(json.error ?? 'Could not sign in.');
      }
    } catch {
      setError('Could not reach the server.');
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    await fetch('/api/admin/session', { method: 'DELETE' }).catch(() => {});
    setSignedIn(false);
  }

  if (signedIn === null) {
    return (
      <div className="admin">
        <p className="empty">Checking…</p>
      </div>
    );
  }

  if (!signedIn) {
    return (
      <div className="admin admin-signin">
        <h1>Sign in</h1>
        <p>
          {configured
            ? 'You stay signed in on this device for 30 days.'
            : 'ADMIN_PASSWORD is not set on this deployment, so there is nothing to sign in to yet.'}
        </p>
        <form onSubmit={signIn}>
          <div className="field">
            <label htmlFor="admin-password">Admin password</label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={!configured}
              required
            />
          </div>
          <button className="primary" type="submit" disabled={busy || !configured}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        {error && <div className="notice err">{error}</div>}
      </div>
    );
  }

  return (
    <div className="admin">
      <div className="admin-head">
        <h1>Admin</h1>
        <button type="button" className="linkish" onClick={signOut}>
          Sign out
        </button>
      </div>
      <p>Anything published here is committed to the repository, which redeploys the site.</p>
      <p className="hint">
        {/* A plain link: the browser saves the file itself. */}
        <a href="/api/admin/backup" download>
          Download a backup of comments and ratings
        </a>
      </p>

      <div className="tabs" role="tablist">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
          >
            {label}
            {id === 'manage' && drafts ? ` · ${drafts} draft${drafts === 1 ? '' : 's'}` : ''}
          </button>
        ))}
      </div>

      {tab === 'review' && <ReviewPublisher onExpired={() => setSignedIn(false)} />}
      {tab === 'page' && <DocEditor onExpired={() => setSignedIn(false)} />}
      {tab === 'manage' && <ReviewManager onExpired={() => setSignedIn(false)} />}
      {tab === 'tags' && <TagsPanel onExpired={() => setSignedIn(false)} />}
      {tab === 'backlog' && <BacklogPanel onExpired={() => setSignedIn(false)} />}
    </div>
  );
}
