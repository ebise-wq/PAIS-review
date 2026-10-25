import type { GradeBand } from '@/lib/grades';

/** The grade bands, each with the colour its badge has on the site. */
export function GradeScheme({ bands }: { bands: GradeBand[] }) {
  return (
    <ul className="grade-scheme">
      {bands.map((band) => (
        <li key={band.range}>
          <span className="grade-band score-chip" data-tone={band.tone}>
            <strong>{band.range}</strong> {band.label}
          </span>
          <span className="grade-text">{band.text}</span>
        </li>
      ))}
    </ul>
  );
}
