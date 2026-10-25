'use client';

import { useEffect, useRef } from 'react';
import type { GradeBand } from '@/lib/grades';
import { GradeScheme } from './GradeScheme';

/**
 * Any link to /methods#grade-scheme in site text opens the grade scheme in place, as a
 * pop-up, instead of leaving the page. Without JavaScript the link still goes to the
 * scheme on the Methods page.
 */
export function GradeSchemeDialog({ bands, title }: { bands: GradeBand[]; title: string }) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const open = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.('a[href$="#grade-scheme"]');
      if (!link || !dialog.current || window.location.pathname === '/methods') return;
      event.preventDefault();
      dialog.current.showModal();
    };
    document.addEventListener('click', open);
    return () => document.removeEventListener('click', open);
  }, []);

  if (bands.length === 0) return null;
  return (
    <dialog
      ref={dialog}
      className="grade-dialog"
      aria-label={title}
      // A tap on the dimmed backdrop lands on the dialog itself, not its contents.
      onClick={(event) => event.target === dialog.current && dialog.current?.close()}
    >
      <div className="grade-dialog-head">
        <h2>{title}</h2>
        <button type="button" className="icon-close" aria-label="Close" onClick={() => dialog.current?.close()}>
          ×
        </button>
      </div>
      <GradeScheme bands={bands} />
    </dialog>
  );
}
