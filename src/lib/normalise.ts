import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import matter from 'gray-matter';
import { z } from 'zod';
import { REVIEW_KINDS, SIGNALS, accessOf } from './types';

/**
 * The model doing the conversion, overridable with NORMALISER_MODEL.
 *
 * Sonnet is the default deliberately. Restructuring a review without altering any of its
 * judgements is precision instruction-following over long text, and when a cheaper model
 * slips at it the output still looks clean — a dropped caveat or a misfiled paragraph does
 * not announce itself. Haiku 4.5 (claude-haiku-4-5) halves the per-review cost, which is a
 * few pence across an entire backlog; the reading time to catch a silent distortion costs
 * more than that. Switch it if a side-by-side says otherwise.
 */
export const NORMALISER_MODEL = process.env.NORMALISER_MODEL || 'claude-sonnet-5';

const FrontmatterSchema = z.object({
  title: z.string().describe('The title of the paper, or of the review if it is not about one paper.'),
  authors: z.string().describe('"Surname AB, Surname CD, et al." Empty string if not stated.'),
  journal: z.string().describe('Journal name. Empty string if not stated.'),
  year: z.number().describe('Publication year. 0 if not stated.'),
  doi: z.string().describe('Bare DOI, no URL prefix. Empty string if not stated.'),
  conditions: z.array(z.string()).describe('Conditions the paper is about, such as "ME/CFS" or "Long Covid". Several if it covers several.'),
  studyType: z.string().describe('e.g. "RCT, n=240" or "Mouse knockout study". Empty string if unclear.'),
  kind: z.enum(REVIEW_KINDS as [string, ...string[]]),
  preprint: z
    .boolean()
    .describe('Only for kind=paper: true if the paper is a preprint (medRxiv, bioRxiv, Research Square, etc.) not yet published in a journal.'),
  score: z
    .number()
    .describe(
      'Only for kind=paper, 0-10, and ONLY if the source states an explicit overall grade. Use -1 if the source gives no explicit overall grade. Never infer one.',
    ),
  signal: z
    .enum(['', ...SIGNALS] as [string, ...string[]])
    .describe('Only for kind=preliminary. Empty string otherwise.'),
  verdict: z.string().describe("One sentence, standalone, the review's bottom line."),
  confidence: z.enum(['', 'high', 'moderate', 'low'] as [string, ...string[]]),
  importance: z.enum(['', 'high', 'moderate', 'low'] as [string, ...string[]]),
  strengths: z.array(z.string()).describe('2-4 short clauses, each under 60 characters.'),
  weaknesses: z.array(z.string()).describe('2-4 short clauses, each under 60 characters.'),
  context: z
    .array(z.object({ note: z.string(), source: z.string() }))
    .describe(
      'Facts outside the paper that bear on reading it, ONLY if stated in the source text. Never add your own.',
    ),
  body: z.string().describe('The full review in markdown, headings starting at ##.'),
});

export const SYSTEM_PROMPT = `You convert already-written scientific reviews into one fixed publishing format for a site that reviews research on post-acute infection syndromes (ME/CFS, Long Covid and related conditions).

You are a FORMATTER, not a reviewer. The judgements in the text you are given are the author's and must survive intact.

## Hard rules

1. Never invent an overall grade. If the source does not state one explicitly, set score to -1 and leave it to the editor. Domain-level verdicts scattered through a review ("Moderate", "Weak") are NOT an overall grade — do not average them into one.
2. Never soften, strengthen or hedge a judgement. If the source says a claim is unsupported, the output says it is unsupported. Do not add "however, further research is needed" or similar padding the author did not write.
3. Never add facts. Every claim in your output must be traceable to the text you were given. This includes the context field: only record a circumstance if the source states it.
4. Never append a section summarising changes, a note about the conversion, a disclaimer, or an "Additional considerations" / "Further notes" / "Final thoughts" section. If information arrived through discussion, fold it into the section where it belongs.
5. Preserve the author's wording wherever it already works. Rewrite only to fit the structure.
6. House style on abbreviations: the frontmatter fields (verdict, strengths, weaknesses, studyType, context notes) contain no abbreviations except ones as obvious as ME/CFS — write them out. In the body, write each abbreviation out in full at its first use, abbreviation in brackets after it, but only where the source makes the meaning certain. If you are not sure what an abbreviation stands for, leave it as it is; never guess an expansion.

## Choosing the kind

- paper: a review of one study. This includes preprints: a preprint is a paper with preprint=true, and takes a score like any other paper.
- literature: a review of a body of work, several papers, or a field. Takes no score at all.
- preliminary: unpublished data, a conference abstract, or a company announcement — not a preprint. Takes a coarse signal (${SIGNALS.join(', ')}) rather than a number, because a decimal grade on data that thin is false precision.

## Body structure

Use these headings where the source has material for them, in this order, skipping any it does not cover. Do not invent a section to fill a gap. The executive summary goes LAST: it is written after the analysis and the page shows it first.

## Study design
## Sample selection
## Outcome measures
## Bias
## Statistical and methodological issues
## Biological plausibility
## Interpretation and spin
## What this demonstrates
## Critical missing elements
## Context beyond the paper
## Recommendations
## Final assessment
## Executive summary

If the source states an explicit overall grade, the executive summary's last line repeats it exactly, as "Grade: 6.5 / 10." for a paper or "Signal: promising." for preliminary findings, and score or signal carries the same value. If the source states no explicit grade, write no grade line — never invent one.

Tables, lists and quotations from the source should be preserved. If the source has a section that fits none of these, keep it under its own heading near the most closely related one.

## The context field

This captures things outside the paper that bear on how to read it: a funder's or author's history, a market reaction after publication, an undisclosed tie, a pattern of self-citation, a regulatory action. These are published as statements of fact about named people and organisations, so:

- Record only what the source text states. Never search your own knowledge for damaging facts.
- State it neutrally and specifically. "The trial sponsor's CEO was convicted of securities fraud in 2019" — not "the company has a shady history".
- Put a URL in source if the text gives one. Leave source empty if not; the site marks it as unsourced.
- Never speculate about motive. A fact about a funder is not a claim that the science is fraudulent.`;

export interface NormaliseResult {
  markdown: string;
  /** True when the source had no explicit overall grade, so the editor must set one. */
  scoreMissing: boolean;
}

export function normaliserIsConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

/** Turns arbitrary review text into a publishable review file. */
export async function normaliseReview(raw: string): Promise<NormaliseResult> {
  const source = raw.trim();
  if (!source) throw new Error('Nothing to convert.');

  // Provenance fields are read from the source's own frontmatter, never from the model.
  // Asking the model for them invites invention, and `model` in particular records who
  // WROTE the review — the tidier is not the author and must not claim the credit.
  const original = source.startsWith('---')
    ? (() => {
        try {
          return matter(source).data as Record<string, unknown>;
        } catch {
          return {};
        }
      })()
    : {};

  const carriedOver = (key: string): string | undefined => {
    const value = original[key];
    if (value == null) return undefined;
    const out = value instanceof Date ? value.toISOString().slice(0, 10) : String(value).trim();
    return out || undefined;
  };

  const client = new Anthropic();

  const response = await client.messages.parse({
    model: NORMALISER_MODEL,
    max_tokens: 16000,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Convert this review into the publishing format. Today's date is ${new Date().toISOString().slice(0, 10)}.\n\n<review>\n${source}\n</review>`,
      },
    ],
    output_config: { format: zodOutputFormat(FrontmatterSchema) },
  });

  const parsed = response.parsed_output;
  if (!parsed) throw new Error('The model did not return a usable conversion. Try again.');

  const { body, score, signal, preprint, ...rest } = parsed;
  const scoreMissing = rest.kind === 'paper' && (typeof score !== 'number' || score < 0);

  const data: Record<string, unknown> = {
    ...rest,
    year: rest.year && rest.year > 0 ? rest.year : undefined,
    ...(rest.kind === 'paper' && !scoreMissing ? { score } : {}),
    ...(rest.kind === 'preliminary' && signal ? { signal } : {}),
    ...(rest.kind === 'paper' && preprint ? { preprint: true } : {}),
    // Keep the original's provenance. Absent a recorded model, leave it absent: the page
    // says "unrecorded", which is true, rather than crediting the review to the tidier.
    guideVersion: carriedOver('guideVersion'),
    guideNotes: Array.isArray(original.guideNotes)
      ? original.guideNotes.map((note) => String(note).trim()).filter(Boolean)
      : undefined,
    model: carriedOver('model'),
    effort: carriedOver('effort'),
    // Tags come from the controlled list; the tidier never invents them.
    design: carriedOver('design'),
    topics: Array.isArray(original.topics)
      ? original.topics.map((t) => String(t).trim()).filter(Boolean)
      : undefined,
    // What the model read is provenance too: kept from the source, never inferred.
    read: Array.isArray(original.read) ? original.read.map((s) => String(s).trim()).filter(Boolean) : undefined,
    access: accessOf(original.access),
    sources: Array.isArray(original.sources)
      ? original.sources.map((s) => String(s).trim()).filter(Boolean)
      : undefined,
    // How much the editor changed the text: theirs to say, at publishing. Kept if the
    // source already records it, never inferred.
    humanInput: carriedOver('humanInput'),
    reviewedOn: carriedOver('reviewedOn') ?? new Date().toISOString().slice(0, 10),
  };

  // Drop the empty strings and empty arrays the schema forces the model to emit.
  for (const key of Object.keys(data)) {
    const value = data[key];
    if (value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
      delete data[key];
    }
  }

  return { markdown: matter.stringify(body.trim(), data), scoreMissing };
}
