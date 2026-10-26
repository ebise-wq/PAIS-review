import type { Changes, Piece } from '@/lib/changes';

function Pieces({ pieces }: { pieces: Piece[] }) {
  return (
    <>
      {pieces.map((piece, index) =>
        piece.kind === 'added' ? (
          <ins key={index}>{piece.text}</ins>
        ) : piece.kind === 'removed' ? (
          <del key={index}>{piece.text}</del>
        ) : (
          <span key={index}>{piece.text}</span>
        ),
      )}
    </>
  );
}

/**
 * Everything that differs from the review Claude handed over: dated notes on later
 * corrections first, then the judgement fields, then each changed paragraph of the text.
 */
export function ReviewChanges({ changes, log }: { changes: Changes; log: { date: string; summary: string }[] }) {
  return (
    <div className="review-changes">
      {log.length > 0 && (
        <ul className="change-log">
          {log.map((entry, index) => (
            <li key={index}>
              <span className="change-date">{entry.date}</span> {entry.summary}
            </li>
          ))}
        </ul>
      )}
      {changes.fields.map((change) => (
        <div key={change.field} className="change-field">
          <p className="change-label">{change.field}</p>
          {change.field === 'Strengths' || change.field === 'Weaknesses' ? (
            <ul>
              {change.pieces.map((piece, index) => (
                <li key={index}>
                  <Pieces pieces={[piece]} />
                </li>
              ))}
            </ul>
          ) : (
            <p>
              <Pieces pieces={change.pieces} />
            </p>
          )}
        </div>
      ))}
      {changes.paragraphs.length > 0 && (
        <div className="change-field">
          <p className="change-label">Text</p>
          {changes.paragraphs.map((pieces, index) => (
            <p key={index} className="change-paragraph">
              <Pieces pieces={pieces} />
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
