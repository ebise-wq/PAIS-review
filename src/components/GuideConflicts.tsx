import type { GuideConflict } from '@/lib/types';

/** One conflict on a line: what the guide says, what the reviewer judged, which was applied. */
export function ConflictText({ conflict }: { conflict: GuideConflict }) {
  return (
    <>
      <strong>Guide:</strong> {conflict.guide} <strong>Reviewer:</strong> {conflict.judgement}{' '}
      <em>Applied: {conflict.applied === 'guide' ? 'the guide' : "the reviewer's judgement"}.</em>
    </>
  );
}

/**
 * For the editor only, on the draft preview: where the reviewer's judgement and the guide
 * pulled different ways. Readers do not see it.
 */
export function GuideConflicts({ conflicts }: { conflicts: GuideConflict[] }) {
  if (conflicts.length === 0) return null;
  return (
    <div className="notice info">
      <p>
        <strong>
          {conflicts.length} conflict{conflicts.length === 1 ? '' : 's'} with the guide
        </strong>{' '}
        (only you see this)
      </p>
      <ul className="notes-list">
        {conflicts.map((conflict, index) => (
          <li key={index}>
            <ConflictText conflict={conflict} />
          </li>
        ))}
      </ul>
    </div>
  );
}
