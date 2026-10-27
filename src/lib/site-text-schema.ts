/**
 * Every piece of public site text that can be edited from /admin, with its default.
 *
 * The code decides which text is editable; the content file only holds the values the
 * editor has changed. A field nobody has touched keeps following its default here, so a
 * default improved in code still reaches the site. No fs imports: the admin editor is a
 * client component and reads this too.
 */

export type FieldKind = 'line' | 'text' | 'markdown';

export interface FieldDef {
  label: string;
  /** Where on the site it appears. Shown under the label in the editor. */
  where: string;
  kind: FieldKind;
  default: string;
  /** Empty is allowed, and means "show nothing" rather than "use the default". */
  optional?: boolean;
  max: number;
}

const line = (label: string, where: string, value: string, max = 80): FieldDef => ({
  label, where, kind: 'line', default: value, max,
});
const text = (label: string, where: string, value: string, max = 400): FieldDef => ({
  label, where, kind: 'text', default: value, max,
});
const md = (label: string, where: string, value: string, extra: Partial<FieldDef> = {}): FieldDef => ({
  label, where, kind: 'markdown', default: value, max: 1200, ...extra,
});

export const FIELDS = {
  // ---- every page
  'site.name': line('Site name', 'Header, and the browser tab on every page.', 'PAIS Review', 40),
  'site.description': text(
    'Site description',
    'Search results and link previews when someone shares the site. Not shown on the page.',
    'Rigorous, openly published reviews of papers on ME/CFS, Long Covid and other post-acute infection syndromes (PAIS). Each review is written by Claude against a published guide and checked before publication.',
    300,
  ),
  'nav.reviews': line('Menu: reviews', 'First link in the header menu.', 'Reviews', 24),
  'nav.methods': line('Menu: methods', 'Second link in the header menu.', 'Methods', 24),
  'nav.about': line('Menu: about', 'Third link in the header menu.', 'About', 24),
  'site.pilotBanner': md(
    'Pilot banner',
    'Coloured strip under the header on every page. Leave empty to remove it. While it has text, Google and Bing are asked not to list the site.',
    'Early pilot. These reviews are AI-written and lightly checked — expect rough edges, and treat any single review as one reading, not a verdict.',
    { optional: true, max: 400 },
  ),
  'site.footer': md(
    'Footer',
    'Bottom of every page. A blank line starts a new paragraph.',
    'Reviews are written by Claude against a published [method](/methods), then read and published by the editor. They are one considered opinion, not a journal decision or a consensus view, and they can be wrong.\n\nThink a review is wrong? Say so in the comments under it — that is where it gets argued out.',
  ),
  'site.notFound': md('Page not found', 'Shown for a link to a page that does not exist.', 'There is no page here. [Back to the reviews](/).', { max: 300 }),

  // ---- home page
  'home.heading': line('Heading', 'Large heading at the top of the home page.', 'Claude-written reviews of research on post-acute infection syndromes', 120),
  'home.intro': md(
    'Introduction',
    'Paragraph under the heading on the home page.',
    'Each paper is reviewed against a published guide, [graded out of 10](/methods#grade-scheme), and summarised by its main strengths and weaknesses. Scores are a judgement, not a measurement — read the review.',
    { max: 600 },
  ),
  'home.searchPlaceholder': line('Search box placeholder', 'Grey text inside the empty search box.', 'Search reviews', 40),
  'home.empty': line('No reviews yet', 'Shown on the home page while nothing is published.', 'No reviews published yet.', 120),
  'home.designFilter': line('Design filter', 'Label of the design menu above the list.', 'Design', 40),
  'home.anyDesign': line('Any design', 'First choice in the design menu.', 'Any design', 40),
  'home.topicFilter': line('Topic filter', 'Label of the topic menu above the list.', 'Topic', 40),
  'home.anyTopic': line('Any topic', 'First choice in the topic menu.', 'Any topic', 40),
  'tags.allReviews': line('Back to all reviews', 'Link at the top of a tag page.', 'All reviews', 60),
  'home.noMatches': line('No search results', 'Shown when a search or filter matches nothing.', 'No reviews match those filters.', 120),

  // ---- review page
  'review.weaknessesHeading': line('Weaknesses heading', 'Title of the tinted weaknesses panel.', 'Main weaknesses', 40),
  'review.strengthsHeading': line('Strengths heading', 'Title of the tinted strengths panel.', 'Main strengths', 40),
  'review.contextHeading': line('Context heading', 'Title of the panel of facts outside the paper.', 'Context beyond the paper', 60),
  'review.contextNote': md(
    'Context disclaimer',
    'Small print under the context panel.',
    'These are facts about the circumstances around the work, not part of the assessment of its methods. They are listed so readers can weigh them themselves, not as a claim that the findings are wrong.',
    { max: 500 },
  ),
  'review.guideNotesHeading': line('Guide notes heading', 'Title of the box listing points the guide does not cover yet.', 'Notes for the guide', 60),
  'review.guideNotesIntro': md(
    'Guide notes explanation',
    'Sentence at the top of that box.',
    'Points this paper raised that the [guide](/methods) does not yet cover. They are not applied to this review; the editor decides what goes into the next version.',
    { max: 500 },
  ),
  'review.provenance': md(
    'Closing note',
    'Last line of every review, after "Written by <model> against the guide".',
    'Read and published by the editor. The grade is a judgement about this paper’s evidence, not a statement about the researchers.',
    { max: 500 },
  ),

  // ---- review page: the small labels above the details
  'review.detailsSummary': line('Review details fold-out', 'Folded section under the verdict: type, design, confidence, dates, human input.', 'Review details', 60),
  'label.type': line('Type', 'Detail label on a review page.', 'Type', 40),
  'label.confidence': line('Confidence', 'Detail label on a review page.', 'Confidence in this grade', 40),
  'label.importance': line('Importance', 'Detail label on a review page.', 'Importance if true', 40),
  'label.reviewed': line('Reviewed', 'Detail label on a review page.', 'Reviewed', 40),
  'label.writtenBy': line('Written by', 'Detail label on a review page.', 'Written by', 40),
  'label.guideVersion': line('Guide version', 'Detail label on a review page.', 'Guide version', 40),
  'label.humanInput': line('Human input', 'Detail label on a review page.', 'Human input', 40),
  'review.processHeading': line('How it was made: heading', 'Box at the end of each review: who wrote it, effort, fact check, what Claude read.', 'How this review was made', 60),
  'review.methodSince': line('Method changes since', 'Fold listing method changes made after the version a review was written under.', 'Method changes since this review', 60),
  'review.commitLabel': line('Instructions version label', 'Before the code version the review was written under, linking to its instructions.', 'Review instructions used', 60),
  'review.changesSummary': line('Changes since Claude fold', 'Fold showing what differs from the review Claude handed over.', 'Changes since Claude’s version', 60),
  'review.unchanged': line('Unchanged note', 'Shown instead when nothing differs from what Claude handed over.', 'Published as Claude wrote it.', 120),
  'review.factCheckLabel': line('Fact check label', 'Before the one-line summary of the fact check, in that box.', 'Blind fact check', 60),
  'review.findingsSummary': line('Fact-check findings fold', 'Folded list of each issue the fact check reported.', 'Fact-check findings', 60),
  'review.factCheckIntro': md(
    'Fact-check findings explanation',
    'At the top of that folded list.',
    'A separate Claude, given only this review and its sources, checked each factual claim. Each issue it reported is listed with what was done about it.',
    { max: 400 },
  ),
  'label.access': line('What Claude read', 'Fold-out at the end of a review listing everything the model opened.', 'What Claude read', 40),
  'access.unrecorded': line(
    'What Claude read: not recorded',
    'Shown for "What Claude read" on reviews that do not say what the model opened.',
    'Not recorded',
    60,
  ),
  'label.preprint': line(
    'Preprint marker',
    'Small tag after the citation, on the index and on the review, for papers not yet peer reviewed.',
    'Preprint',
    30,
  ),

  // ---- what each level of human input means, shown under it on a review page
  'humanInput.none': line('None', 'Under "Human input: None" on a review page.', 'published as the model wrote it', 120),
  'humanInput.minor': line('Minor', 'Under "Human input: Minor".', 'light edits to wording, formatting or small errors', 120),
  'humanInput.moderate': line('Moderate', 'Under "Human input: Moderate".', 'points added, removed or corrected by the editor', 120),
  'humanInput.major': line('Major', 'Under "Human input: Major".', 'substantially rewritten or redirected by the editor', 120),
  'humanInput.unrecorded': line(
    'Not recorded',
    'Shown for "Human input" on reviews published before it was recorded.',
    'Not recorded',
    60,
  ),

  // ---- readers
  'rating.label': line('Rating prompt', 'Next to the stars under each review.', 'Rate this review', 60),
  'discuss.label': line('Discuss with AI label', 'Before the Claude and ChatGPT buttons under each review.', 'Discuss this review with an AI', 60),
  'discuss.prompt': text(
    'Discuss with AI instruction',
    'Sent to Claude or ChatGPT after the link to the review. Tells the model what to do with it.',
    'Then discuss it with me. Where is the review right, where might it be wrong or unfair, and what evidence would change its verdict? Do not just summarise it.',
    600,
  ),

  // ---- methods and about
  'methods.gradesSummary': line('Grade scheme heading', 'Fold on the Methods page, and title of the pop-up a link to /methods#grade-scheme opens.', 'Grade scheme', 60),
  'methods.skillSummary': line('Review skill expander', 'Methods page fold with the Claude Code skill reviews are written with.', 'The review skill (Claude Code), in full', 80),
  'methods.instructionsSummary': line('Instructions expander', 'Methods page fold with the full instructions a claude.ai project follows.', 'The full instructions (claude.ai project)', 80),
  'methods.promptSummary': line('Prompt expander', 'The fold-out on the Methods page that shows the prompt.', 'The prompt, word for word', 60),
  'methods.description': text(
    'Methods page description',
    'Search results and link previews for the Methods page.',
    'How every review here is made: the guide it is graded against, and the prompt that starts it.',
    300,
  ),
  'about.description': text(
    'About page description',
    'Search results and link previews for the About page.',
    'How these reviews are made, what they are for, and what they are not.',
    300,
  ),
} satisfies Record<string, FieldDef>;

export type SiteTextKey = keyof typeof FIELDS;
export type SiteText = Record<SiteTextKey, string>;

/** How the editor lays the fields out. Every key appears in exactly one group. */
export const GROUPS: { title: string; open: boolean; keys: SiteTextKey[] }[] = [
  { title: 'Every page', open: true, keys: ['site.pilotBanner', 'site.footer', 'site.name', 'nav.reviews', 'nav.methods', 'nav.about', 'site.description', 'site.notFound'] },
  { title: 'Home page', open: true, keys: ['home.heading', 'home.intro', 'home.searchPlaceholder', 'home.designFilter', 'home.anyDesign', 'home.topicFilter', 'home.anyTopic', 'home.empty', 'home.noMatches', 'tags.allReviews'] },
  { title: 'Review page', open: false, keys: ['review.weaknessesHeading', 'review.strengthsHeading', 'review.contextHeading', 'review.contextNote', 'review.guideNotesHeading', 'review.guideNotesIntro', 'review.provenance'] },
  { title: 'Review page: detail labels', open: false, keys: ['label.type', 'label.confidence', 'label.importance', 'label.reviewed', 'label.writtenBy', 'label.guideVersion', 'label.humanInput', 'review.processHeading', 'review.methodSince', 'review.commitLabel', 'review.changesSummary', 'review.unchanged', 'review.factCheckLabel', 'review.findingsSummary', 'review.factCheckIntro', 'label.access', 'label.preprint', 'access.unrecorded', 'review.detailsSummary'] },
  { title: 'Human input levels', open: false, keys: ['humanInput.none', 'humanInput.minor', 'humanInput.moderate', 'humanInput.major', 'humanInput.unrecorded'] },
  { title: 'Ratings, comments and AI discussion', open: false, keys: ['rating.label', 'discuss.label', 'discuss.prompt'] },
  { title: 'Methods and About', open: false, keys: ['methods.skillSummary', 'methods.instructionsSummary', 'methods.promptSummary', 'methods.gradesSummary', 'methods.description', 'about.description'] },
];

export const KEYS = Object.keys(FIELDS) as SiteTextKey[];

export const DEFAULTS = Object.fromEntries(KEYS.map((key) => [key, FIELDS[key].default])) as SiteText;

export function isKey(key: string): key is SiteTextKey {
  return Object.prototype.hasOwnProperty.call(FIELDS, key);
}

/** Line endings normalised and outer whitespace trimmed, so "changed" means changed. */
export function normalise(value: string): string {
  return value.replace(/\r\n?/g, '\n').trim();
}

/** Why a value cannot be saved, or null. */
export function checkValue(key: SiteTextKey, value: string): string | null {
  const field = FIELDS[key];
  if (!value && !field.optional) return 'This cannot be empty. Use "Reset to default" to restore the original.';
  if (value.length > field.max) return `Keep this under ${field.max} characters (it is ${value.length}).`;
  if (field.kind === 'line' && value.includes('\n')) return 'This must be a single line.';
  return null;
}

/**
 * The stored overrides from whatever the content file holds. Anything unusable — an
 * unknown key, a wrong type, a value that fails its check — is skipped with a reason,
 * so a bad edit falls back to the default instead of breaking the page.
 */
export function parseOverrides(raw: unknown): { overrides: Partial<SiteText>; problems: string[] } {
  const overrides: Partial<SiteText> = {};
  const problems: string[] = [];
  if (raw === undefined || raw === null) return { overrides, problems };
  if (typeof raw !== 'object' || Array.isArray(raw)) {
    return { overrides, problems: ['The site text file is not a JSON object.'] };
  }
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!isKey(key)) {
      problems.push(`Unknown field "${key}" ignored.`);
      continue;
    }
    if (typeof value !== 'string') {
      problems.push(`"${key}" is not text; using the default.`);
      continue;
    }
    const clean = normalise(value);
    const problem = checkValue(key, clean);
    if (problem) {
      problems.push(`"${key}": ${problem} Using the default.`);
      continue;
    }
    overrides[key] = clean;
  }
  return { overrides, problems };
}

export function resolve(overrides: Partial<SiteText>): SiteText {
  return { ...DEFAULTS, ...overrides };
}

/** The file as it should be stored: only fields that differ from their default, in schema order. */
export function serialiseOverrides(values: Partial<SiteText>): string {
  const stored: Partial<SiteText> = {};
  for (const key of KEYS) {
    const value = values[key];
    if (value !== undefined && value !== DEFAULTS[key]) stored[key] = value;
  }
  return `${JSON.stringify(stored, null, 2)}\n`;
}
