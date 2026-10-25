'use client';

import { useEffect, useState } from 'react';
import type { TargetType } from '@/lib/comments';
import { COUNT_EVENT, type CommentCount } from './Comments';

/**
 * "3 comments" near the top of a review, jumping to the thread. The count comes from the
 * comments section further down once it has loaded; until then it just says "Comments".
 * On a site without a database there are no comments, so it says nothing.
 */
export function CommentsLink({ type, slug }: { type: TargetType; slug: string }) {
  const [state, setState] = useState<CommentCount | null>(null);

  useEffect(() => {
    const listen = (event: Event) => {
      const detail = (event as CustomEvent<CommentCount>).detail;
      if (detail.type === type && detail.slug === slug) setState(detail);
    };
    window.addEventListener(COUNT_EVENT, listen);
    return () => window.removeEventListener(COUNT_EVENT, listen);
  }, [type, slug]);

  if (state && !state.configured) return null;
  const label = !state
    ? 'Comments'
    : state.count === 0
      ? 'No comments yet'
      : `${state.count} comment${state.count === 1 ? '' : 's'}`;

  return (
    <>
      {' · '}
      <a href="#comments">{label}</a>
    </>
  );
}
