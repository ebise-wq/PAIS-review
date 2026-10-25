import { scoreBand, type Tone } from './types';

/**
 * The grade scheme as the instructions state it to Claude, so the site never shows a
 * different one: the bullet list under "### The score, for papers" in
 * content/instructions.md. Each band gets the label the site's badge uses for it.
 */
export interface GradeBand {
  range: string;
  label: string;
  tone: Tone;
  text: string;
}

export function parseGradeScheme(instructions: string): GradeBand[] {
  const start = instructions.search(/^###\s+The score, for papers\s*$/m);
  if (start === -1) return [];
  const section = instructions.slice(start).split(/\n(?=#{2,3}\s)/)[0];

  // A bullet, plus any indented lines that continue it.
  const bullets = section.match(/^- .*(?:\n {2,}\S.*)*/gm) ?? [];
  return bullets.flatMap((bullet) => {
    const match = /^- \*\*([\d.]+)\s*[–-]\s*([\d.]+)\*\*\s*[—–-]\s*([\s\S]+)$/.exec(bullet);
    if (!match) return [];
    const band = scoreBand(Number(match[1]));
    return [{ range: `${match[1]}–${match[2]}`, label: band.label, tone: band.tone, text: match[3].replace(/\s+/g, ' ').trim() }];
  });
}
