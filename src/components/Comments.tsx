'use client';

import { useCallback, useEffect, useState } from 'react';
import type { CommentNode, TargetType } from '@/lib/comments';
import { timeAgo } from '@/lib/time';

const USERNAME_KEY = 'pais_username';
const MAX_INDENT = 4;

interface Loaded {
  configured: boolean;
  admin: boolean;
  comments: CommentNode[];
  version: string | null;
  error?: string;
}

/**
 * Threaded comments with two vote axes: karma (is this a good comment?) and
 * agree/disagree (do you think it is right?). Anyone can post with a self-chosen
 * username; no account. Each comment records the guide version it was written against.
 */
export function Comments({
  type,
  slug,
}: {
  type: TargetType;
  slug: string;
}) {
  const [data, setData] = useState<Loaded | null>(null);
  const [username, setUsername] = useState('');
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [collapsed, setCollapsed] = useState<Set<number>>(() => new Set());
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const response = await fetch(`/api/comments?type=${type}&slug=${encodeURIComponent(slug)}`);
      const json = (await response.json()) as Partial<Loaded>;
      setData({
        configured: Boolean(json.configured),
        admin: Boolean(json.admin),
        comments: json.comments ?? [],
        version: json.version ?? null,
        error: json.error ?? (response.ok ? undefined : 'Comments could not be loaded.'),
      });
    } catch {
      // The request itself failed (network, or the server crashed). A site without a
      // database answers cleanly, so this is a real failure and should be visible.
      setData({ configured: true, admin: false, comments: [], version: null, error: 'Comments could not be loaded.' });
    }
  }, [type, slug]);

  useEffect(() => {
    load();
    try {
      setUsername(localStorage.getItem(USERNAME_KEY) ?? '');
    } catch {
      // Storage blocked: the name just is not remembered.
    }
  }, [load]);

  if (!data || !data.configured) return null;

  if (data.error) {
    return (
      <section className="comments" id="comments">
        <h2>Comments</h2>
        <p className="notice err">Comments are unavailable right now. {data.error}</p>
      </section>
    );
  }

  async function castVote(commentId: number, axis: 'karma' | 'agree' | 'heart', value: -1 | 0 | 1) {
    setError(null);
    const response = await fetch('/api/comments/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commentId, axis, value }),
    });
    if (!response.ok) {
      const json = (await response.json().catch(() => ({}))) as { error?: string };
      setError(json.error ?? 'Could not vote.');
      return;
    }
    load();
  }

  async function moderate(commentId: number, action: 'hide' | 'unhide' | 'remove') {
    setError(null);
    const response = await fetch('/api/comments/moderate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commentId, action }),
    });
    if (!response.ok) {
      const json = (await response.json().catch(() => ({}))) as { error?: string };
      setError(json.error ?? 'Could not moderate that comment.');
      return;
    }
    load();
  }

  function toggleCollapse(commentId: number) {
    setCollapsed((current) => {
      const next = new Set(current);
      if (!next.delete(commentId)) next.add(commentId);
      return next;
    });
  }

  const count = countVisible(data.comments);

  return (
    <section className="comments" id="comments">
      <h2>
        {count === 0 ? 'Comments' : `${count} comment${count === 1 ? '' : 's'}`}
      </h2>

      {replyTo === null && (
        <CommentForm
          type={type}
          slug={slug}
          parentId={null}
          username={username}
          onUsername={setUsername}
          onPosted={() => load()}
        />
      )}

      {error && <div className="notice err">{error}</div>}

      <ul className="thread">
        {data.comments.map((node) => (
          <CommentItem
            key={node.id}
            node={node}
            depth={0}
            admin={data.admin}
            replyTo={replyTo}
            collapsed={collapsed}
            onToggleCollapse={toggleCollapse}
            onReply={setReplyTo}
            onVote={castVote}
            onModerate={moderate}
            form={(parentId) => (
              <CommentForm
                type={type}
                slug={slug}
                parentId={parentId}
                username={username}
                onUsername={setUsername}
                onPosted={() => {
                  setReplyTo(null);
                  load();
                }}
                onCancel={() => setReplyTo(null)}
              />
            )}
          />
        ))}
      </ul>
    </section>
  );
}

function countVisible(nodes: CommentNode[]): number {
  return nodes.reduce((n, node) => n + (node.hidden ? 0 : 1) + countVisible(node.replies), 0);
}

function CommentItem({
  node,
  depth,
  admin,
  replyTo,
  collapsed,
  onToggleCollapse,
  onReply,
  onVote,
  onModerate,
  form,
}: {
  node: CommentNode;
  depth: number;
  admin: boolean;
  replyTo: number | null;
  collapsed: Set<number>;
  onToggleCollapse: (id: number) => void;
  onReply: (id: number | null) => void;
  onVote: (id: number, axis: 'karma' | 'agree' | 'heart', value: -1 | 0 | 1) => void;
  onModerate: (id: number, action: 'hide' | 'unhide' | 'remove') => void;
  form: (parentId: number) => React.ReactNode;
}) {
  const indent = Math.min(depth, MAX_INDENT);
  const toggle = (axis: 'karma' | 'agree', value: 1 | -1) =>
    onVote(node.id, axis, node.mine[axis] === value ? 0 : value);
  const isCollapsed = collapsed.has(node.id);
  const buried = countVisible(node.replies);

  const collapseButton = (
    <button
      type="button"
      className="collapse"
      onClick={() => onToggleCollapse(node.id)}
      aria-expanded={!isCollapsed}
      aria-label={isCollapsed ? 'Expand this comment' : 'Collapse this comment'}
    >
      {isCollapsed ? '+' : '\u2212'}
    </button>
  );

  function confirmRemove() {
    const total = countVisible([node]);
    const message =
      total > 1
        ? `Delete this comment and the ${total - 1} ${total === 2 ? 'reply' : 'replies'} under it? This cannot be undone.`
        : 'Delete this comment? This cannot be undone.';
    if (window.confirm(message)) onModerate(node.id, 'remove');
  }

  return (
    <li className={`comment${node.hidden ? ' hidden' : ''}`} style={{ marginLeft: indent ? `${indent * 18}px` : 0 }}>
      {node.hidden && !admin ? (
        <div className="comment-head">
          {collapseButton}
          <p className="comment-hidden">Comment hidden by the editor.</p>
          {isCollapsed && buried > 0 && <span className="comment-time">{buried} hidden</span>}
        </div>
      ) : (
        <>
          <div className="comment-head">
            {collapseButton}
            <span className="comment-user">{node.username}</span>
            {node.version && <span className="comment-version">on v{node.version}</span>}
            <span className="comment-time">{timeAgo(node.createdAt)}</span>
            {node.hidden && <span className="comment-version">hidden</span>}
            {isCollapsed && (
              <span className="comment-time">
                {buried > 0 ? `${buried} ${buried === 1 ? 'reply' : 'replies'} hidden` : 'collapsed'}
              </span>
            )}
          </div>
          {!isCollapsed && (
          <>
          <div className="comment-body">
            {node.body.split(/\n{2,}/).map((para, index) => (
              <p key={index}>{para}</p>
            ))}
          </div>
          <div className="comment-actions">
            <span className="vote-group" title="Is this a good comment?">
              <button type="button" className={`vote${node.mine.karma === 1 ? ' on' : ''}`} onClick={() => toggle('karma', 1)} aria-label="Upvote">▲</button>
              <span className="vote-count">{node.karma}</span>
              <button type="button" className={`vote${node.mine.karma === -1 ? ' on' : ''}`} onClick={() => toggle('karma', -1)} aria-label="Downvote">▼</button>
            </span>
            <span className="vote-group" title="Do you think it is right?">
              <button type="button" className={`vote agree${node.mine.agree === 1 ? ' on' : ''}`} onClick={() => toggle('agree', 1)}>
                Agree {node.agree > 0 ? node.agree : ''}
              </button>
              <button type="button" className={`vote agree${node.mine.agree === -1 ? ' on' : ''}`} onClick={() => toggle('agree', -1)}>
                Disagree {node.disagree > 0 ? node.disagree : ''}
              </button>
            </span>
            {/* Thanks, or "this matters" — neither a quality vote nor agreement, and not karma. */}
            <button
              type="button"
              className={`vote heart${node.mine.heart ? ' on' : ''}`}
              onClick={() => onVote(node.id, 'heart', node.mine.heart ? 0 : 1)}
              aria-label={node.mine.heart ? 'Remove your heart' : 'Heart this comment'}
              aria-pressed={Boolean(node.mine.heart)}
            >
              <span aria-hidden="true">{node.mine.heart ? '♥' : '♡'}</span>
              {node.hearts > 0 ? ` ${node.hearts}` : ''}
            </button>
            <button type="button" className="linkish" onClick={() => onReply(replyTo === node.id ? null : node.id)}>
              Reply
            </button>
            {admin && (
              <button type="button" className="linkish" onClick={() => onModerate(node.id, node.hidden ? 'unhide' : 'hide')}>
                {node.hidden ? 'Unhide' : 'Hide'}
              </button>
            )}
            {admin && (
              <button type="button" className="linkish danger" onClick={confirmRemove}>
                Remove
              </button>
            )}
          </div>
          </>
          )}
        </>
      )}

      {!isCollapsed && replyTo === node.id && form(node.id)}

      {!isCollapsed && node.replies.length > 0 && (
        <ul className="thread">
          {node.replies.map((child) => (
            <CommentItem
              key={child.id}
              node={child}
              depth={depth + 1}
              admin={admin}
              replyTo={replyTo}
              collapsed={collapsed}
              onToggleCollapse={onToggleCollapse}
              onReply={onReply}
              onVote={onVote}
              onModerate={onModerate}
              form={form}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function CommentForm({
  type,
  slug,
  parentId,
  username,
  onUsername,
  onPosted,
  onCancel,
}: {
  type: TargetType;
  slug: string;
  parentId: number | null;
  username: string;
  onUsername: (name: string) => void;
  onPosted: () => void;
  onCancel?: () => void;
}) {
  const [body, setBody] = useState('');
  const [website, setWebsite] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, slug, parentId, username, body, website }),
      });
      const json = (await response.json()) as { ok?: boolean; error?: string };
      if (json.ok) {
        try {
          localStorage.setItem(USERNAME_KEY, username.trim());
        } catch {
          // fine
        }
        setBody('');
        onPosted();
      } else {
        setError(json.error ?? 'Could not post the comment.');
      }
    } catch {
      setError('Could not reach the server.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className={`comment-form${parentId !== null ? ' reply' : ''}`} onSubmit={submit}>
      <div className="comment-form-row">
        <input
          type="text"
          placeholder="Your name"
          aria-label="Your name"
          value={username}
          onChange={(event) => onUsername(event.target.value)}
          maxLength={32}
          required
        />
      </div>
      <textarea
        placeholder={parentId === null ? 'Write a comment' : 'Write a reply'}
        aria-label={parentId === null ? 'Comment' : 'Reply'}
        rows={4}
        value={body}
        onChange={(event) => setBody(event.target.value)}
        maxLength={4000}
        required
      />
      {/* Honeypot: hidden from people, filled by bots. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        value={website}
        onChange={(event) => setWebsite(event.target.value)}
        className="hp"
        aria-hidden="true"
      />
      <div className="comment-form-row">
        <button className="primary" type="submit" disabled={busy}>
          {busy ? 'Posting…' : parentId === null ? 'Post comment' : 'Post reply'}
        </button>
        {onCancel && (
          <button type="button" className="linkish" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
      {error && <div className="notice err">{error}</div>}
    </form>
  );
}
