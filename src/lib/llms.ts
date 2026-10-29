import { verdictOf, type ReviewFrontmatter } from './types';

/**
 * /llms.txt: a plain index of the site for AI tools and crawlers, in the llms.txt
 * convention (a title, a one-line summary, then sections of links). Each review links to
 * its raw markdown, which carries the whole review with its frontmatter.
 */
export function llmsTxt(input: {
  siteName: string;
  description: string;
  siteUrl: string;
  reviews: (Pick<ReviewFrontmatter, 'title' | 'kind' | 'score' | 'signal' | 'verdict'> & { slug: string })[];
}): string {
  const url = input.siteUrl.replace(/\/$/, '');
  const grade = (review: (typeof input.reviews)[number]) => {
    const verdict = verdictOf(review);
    return verdict.showDenominator ? `${verdict.headline}/10, ${verdict.label}` : `${verdict.headline}, ${verdict.label}`;
  };
  const oneLine = (text: string) => text.replace(/\s+/g, ' ').trim();

  return [
    `# ${input.siteName}`,
    '',
    `> ${oneLine(input.description)}`,
    '',
    '## Reviews',
    '',
    ...input.reviews.map((review) => `- [${oneLine(review.title)}](${url}/reviews/${review.slug}.md): ${grade(review)}. ${oneLine(review.verdict)}`),
    '',
    '## Method',
    '',
    `- [Review guide](${url}/guide.md)`,
    `- [Instructions for writing a review](${url}/instructions.md)`,
    '',
  ].join('\n');
}
