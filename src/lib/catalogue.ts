/**
 * The catalogue: every paper on a post-acute infection syndrome that Europe PMC indexes,
 * one row each, kept in Postgres. It is the base layer for choosing what to review and,
 * later, for extracting data across the literature. Not shown on the public site.
 *
 * Filled by a resumable sync: each run reads a few pages of the Europe PMC search and
 * upserts them, remembering where it stopped. When a pass reaches the end it starts again
 * a week later, which picks up new papers and refreshes citation counts and access.
 */
import { query } from './db';

const ME_TERMS = ['myalgic encephalomyelitis', 'myalgic encephalopathy', 'chronic fatigue syndrome', 'ME/CFS', 'systemic exertion intolerance'];
const LC_TERMS = [
  'long covid',
  'long-covid',
  'post-acute sequelae',
  'postacute sequelae',
  'post-covid-19 condition',
  'post covid-19 condition',
  'post-covid condition',
  'post-covid-19 syndrome',
  'post-covid syndrome',
  'post-acute covid',
  'postacute covid',
  'PASC',
];
const OTHER_TERMS = ['post-treatment lyme', 'post-infectious fatigue', 'postinfectious fatigue', 'post-acute infection syndrome', 'Q fever fatigue', 'post-ebola'];

const field = (terms: string[]) => terms.flatMap((t) => [`TITLE:"${t}"`, `ABSTRACT:"${t}"`]).join(' OR ');

/** The Europe PMC search that defines the catalogue: any of the terms in a title or abstract. */
export const CATALOGUE_QUERY = `(${field([...ME_TERMS, ...LC_TERMS, ...OTHER_TERMS])})`;

const matcher = (terms: string[]) =>
  new RegExp(terms.map((t) => (t === 'PASC' ? '\\bPASC\\b' : t.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&').replace(/[- ]/g, '[- ]?'))).join('|'), 'i');
const ME = matcher(ME_TERMS);
const LC = matcher(LC_TERMS);
const OTHER = matcher(OTHER_TERMS);

export type PaperKind = 'research' | 'review' | 'commentary' | 'preprint';
export type Access = 'open' | 'free' | 'paywalled';

export interface PaperRow {
  id: string;
  doi: string | null;
  pmid: string | null;
  pmcid: string | null;
  title: string;
  authors: string | null;
  journal: string | null;
  year: number | null;
  pub_date: string | null;
  abstract: string | null;
  pub_types: string[];
  kind: PaperKind;
  conditions: string[];
  in_title: boolean;
  retracted: boolean;
  cited_by: number;
  access: Access;
  best_url: string | null;
}

// Block tags (headings, paragraphs, breaks) become spaces; inline ones (italics, subscripts) vanish.
const stripTags = (text: string) =>
  text
    .replace(/<\/?(h\d|p|br|div|li|ul|ol)\b[^>]*>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * What kind of paper a record is. Europe PMC labels many reviews and commentaries as plain
 * journal articles, so titles are checked as well as the labels.
 */
export function kindOf(source: string, pubTypes: string[], title: string): PaperKind {
  if (source === 'PPR' || pubTypes.some((t) => /^preprint$/i.test(t))) return 'preprint';
  const types = pubTypes.join(' | ').toLowerCase();
  if (/\b(review|systematic-review|meta-analysis)\b/.test(types)) return 'review';
  if (/systematic review|meta-analys|scoping review|narrative review|umbrella review|literature review|a review\b|: review\b|an overview/i.test(title)) return 'review';
  if (/\b(editorial|letter|comment|news|interview|biography)\b/.test(types)) return 'commentary';
  return 'research';
}

/** Which conditions a paper is about, from its title and abstract. */
export function conditionsOf(text: string): string[] {
  const found = [];
  if (ME.test(text)) found.push('ME/CFS');
  if (LC.test(text)) found.push('Long COVID');
  if (OTHER.test(text)) found.push('Other');
  return found;
}

/** Open licence, free to read, or neither; and the best link to read it at. */
export function accessOf(record: Record<string, any>): { access: Access; best_url: string | null } {
  const links: Record<string, string>[] = record.fullTextUrlList?.fullTextUrl ?? [];
  const free = links.filter((l) => l.availabilityCode === 'OA' || l.availabilityCode === 'F');
  const access: Access = record.isOpenAccess === 'Y' ? 'open' : record.pmcid || free.length ? 'free' : 'paywalled';
  let best_url: string | null = null;
  if (record.pmcid) best_url = `https://pmc.ncbi.nlm.nih.gov/articles/${record.pmcid}/`;
  else if (free.length) best_url = [...free].sort((a, b) => Number(a.documentStyle !== 'html') - Number(b.documentStyle !== 'html'))[0].url;
  else if (record.doi) best_url = `https://doi.org/${record.doi}`;
  return { access, best_url };
}

/** A Europe PMC "core" search result as a catalogue row. */
export function toRow(record: Record<string, any>): PaperRow {
  const title = stripTags(String(record.title ?? '')).replace(/\.$/, '');
  const abstract = record.abstractText ? stripTags(String(record.abstractText)) : null;
  const pubTypes: string[] = (record.pubTypeList?.pubType ?? []).map(String);
  const source = String(record.source ?? 'MED');
  const corrections: Record<string, string>[] = record.commentCorrectionList?.commentCorrection ?? [];
  const year = Number(record.pubYear);
  const date = String(record.firstPublicationDate ?? '');
  return {
    id: `${source}:${record.id}`,
    doi: record.doi ? String(record.doi).toLowerCase() : null,
    pmid: record.pmid ? String(record.pmid) : null,
    pmcid: record.pmcid ? String(record.pmcid) : null,
    title,
    authors: record.authorString ? String(record.authorString) : null,
    journal: record.journalInfo?.journal?.title ?? record.bookOrReportDetails?.publisher ?? null,
    year: Number.isFinite(year) && year > 0 ? year : null,
    pub_date: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null,
    abstract,
    pub_types: pubTypes,
    kind: kindOf(source, pubTypes, title),
    conditions: conditionsOf(`${title} ${abstract ?? ''}`),
    in_title: conditionsOf(title).length > 0,
    retracted: pubTypes.some((t) => /retracted publication/i.test(t)) || corrections.some((c) => /^retraction in/i.test(c.type ?? '')),
    cited_by: Number(record.citedByCount) || 0,
    ...accessOf(record),
  };
}


const COLUMNS: (keyof PaperRow)[] = [
  'id', 'doi', 'pmid', 'pmcid', 'title', 'authors', 'journal', 'year', 'pub_date', 'abstract',
  'pub_types', 'kind', 'conditions', 'in_title', 'retracted', 'cited_by', 'access', 'best_url',
];

/** Inserts or refreshes rows, 400 at a time to stay well inside Postgres's parameter limit. */
export async function upsertPapers(rows: PaperRow[]): Promise<void> {
  for (let start = 0; start < rows.length; start += 400) {
    const chunk = rows.slice(start, start + 400);
    const params: unknown[] = [];
    const values = chunk.map((row) => `(${COLUMNS.map((column) => `$${params.push(row[column])}`).join(', ')})`);
    const updates = COLUMNS.filter((c) => c !== 'id').map((c) => `${c} = excluded.${c}`);
    await query(
      `insert into papers (${COLUMNS.join(', ')}) values ${values.join(', ')}
       on conflict (id) do update set ${updates.join(', ')}, updated_at = now()`,
      params,
    );
  }
}

interface SyncState {
  cursor: string | null;
  pass_started: Date | null;
  pass_done: Date | null;
  seen_in_pass: number;
  hit_count: number | null;
  last_run: Date | null;
  last_error: string | null;
}

export async function syncState(): Promise<SyncState> {
  const [state] = await query<SyncState & { id: number }>('select * from catalogue_sync where id = 1');
  return state;
}

export interface SyncResult {
  done: 'page' | 'pass-complete' | 'up-to-date';
  fetched: number;
  seenInPass: number;
  hitCount: number | null;
}

/** Days to wait after a full pass before starting the next one. */
export const REFRESH_DAYS = 7;

type Fetcher = (url: string) => Promise<Record<string, any>>;

const defaultFetch: Fetcher = async (url) => {
  const response = await fetch(url, { signal: AbortSignal.timeout(120_000) });
  if (!response.ok) throw new Error(`Europe PMC answered ${response.status}.`);
  return response.json();
};

/**
 * Reads up to `pages` pages of 1000 records and stores them, carrying on from where the
 * last run stopped. `force` starts a new pass even if the last one finished recently.
 */
export async function syncCatalogue({
  pages = 3,
  force = false,
  fetchJson = defaultFetch,
}: { pages?: number; force?: boolean; fetchJson?: Fetcher } = {}): Promise<SyncResult> {
  let state = await syncState();
  if (!state.cursor) {
    const fresh = state.pass_done && Date.now() - state.pass_done.getTime() < REFRESH_DAYS * 86_400_000;
    if (fresh && !force) return { done: 'up-to-date', fetched: 0, seenInPass: state.seen_in_pass, hitCount: state.hit_count };
    await query(`update catalogue_sync set cursor = '*', pass_started = now(), seen_in_pass = 0 where id = 1`);
    state = await syncState();
  }

  let fetched = 0;
  let cursor = state.cursor as string;
  try {
    for (let page = 0; page < pages; page++) {
      const params = new URLSearchParams({
        query: CATALOGUE_QUERY,
        format: 'json',
        resultType: 'core',
        pageSize: '1000',
        cursorMark: cursor,
      });
      const data = await fetchJson(`https://www.ebi.ac.uk/europepmc/webservices/rest/search?${params}`);
      const results: Record<string, any>[] = data.resultList?.result ?? [];
      if (results.length) await upsertPapers(results.map(toRow));
      fetched += results.length;
      const next = String(data.nextCursorMark ?? '');
      const finished = !results.length || !next || next === cursor;
      await query(
        `update catalogue_sync set cursor = $1, seen_in_pass = seen_in_pass + $2, hit_count = $3,
           pass_done = case when $1::text is null then now() else pass_done end,
           last_run = now(), last_error = null
         where id = 1`,
        [finished ? null : next, results.length, Number(data.hitCount) || null],
      );
      if (finished) {
        const after = await syncState();
        return { done: 'pass-complete', fetched, seenInPass: after.seen_in_pass, hitCount: after.hit_count };
      }
      cursor = next;
    }
  } catch (error) {
    await query('update catalogue_sync set last_run = now(), last_error = $1 where id = 1', [
      error instanceof Error ? error.message : String(error),
    ]);
    throw error;
  }
  const after = await syncState();
  return { done: 'page', fetched, seenInPass: after.seen_in_pass, hitCount: after.hit_count };
}

export interface CatalogueStats {
  total: number;
  byKind: Record<string, number>;
  byCondition: Record<string, number>;
  byAccess: Record<string, number>;
  inTitle: number;
  retracted: number;
  reviews: { published: number; draft: number; unmatched: number };
}

export async function catalogueStats(): Promise<CatalogueStats> {
  const [totals] = await query<{ total: string; in_title: string; retracted: string }>(
    `select count(*) as total, count(*) filter (where in_title) as in_title, count(*) filter (where retracted) as retracted from papers`,
  );
  const group = async (sql: string) =>
    Object.fromEntries((await query<{ key: string; n: string }>(sql)).map((r) => [r.key, Number(r.n)]));
  const [reviews] = await query<{ published: string; draft: string; unmatched: string }>(
    `select count(*) filter (where status = 'published') as published,
            count(*) filter (where status = 'draft') as draft,
            count(*) filter (where not exists (select 1 from papers p where p.doi = r.doi)) as unmatched
       from catalogue_reviews r`,
  );
  return {
    total: Number(totals.total),
    inTitle: Number(totals.in_title),
    retracted: Number(totals.retracted),
    byKind: await group('select kind as key, count(*) as n from papers group by kind'),
    byCondition: await group('select unnest(conditions) as key, count(*) as n from papers group by 1'),
    byAccess: await group(`select access as key, count(*) as n from papers where kind = 'research' group by access`),
    reviews: { published: Number(reviews.published), draft: Number(reviews.draft), unmatched: Number(reviews.unmatched) },
  };
}

// ---------------------------------------------------------------------------------------
// Which papers the site has reviewed. The review files are the record; this copies them in.

export type ReviewStatus = 'draft' | 'published';

export interface ReviewEntry {
  slug: string;
  doi: string | null;
  title: string;
  kind: string;
  status: ReviewStatus;
  score: number | null;
  signal: string | null;
  reviewed_on: string | null;
  guide_version: string | null;
}

/** A review, as the site reads it from its file, as a catalogue entry. */
export function reviewEntry(review: {
  slug: string;
  doi?: string;
  title: string;
  kind: string;
  draft?: boolean;
  score?: number;
  signal?: string;
  reviewedOn?: string;
  guideVersion?: string;
}): ReviewEntry {
  const doi = review.doi?.trim().replace(/^https?:\/\/(dx\.)?doi\.org\//i, '').toLowerCase();
  return {
    slug: review.slug,
    doi: doi || null,
    title: review.title,
    kind: review.kind,
    status: review.draft ? 'draft' : 'published',
    score: typeof review.score === 'number' ? review.score : null,
    signal: review.signal ?? null,
    reviewed_on: review.reviewedOn && /^\d{4}-\d{2}-\d{2}$/.test(review.reviewedOn) ? review.reviewedOn : null,
    guide_version: review.guideVersion ?? null,
  };
}

/** Minutes a status set by publishing or withdrawing is kept, while Vercel rebuilds. */
export const PIN_MINUTES = 15;

const ENTRY_COLUMNS: (keyof ReviewEntry)[] = ['slug', 'doi', 'title', 'kind', 'status', 'score', 'signal', 'reviewed_on', 'guide_version'];

async function upsertEntry(entry: ReviewEntry, pin: boolean): Promise<void> {
  const params = ENTRY_COLUMNS.map((c) => entry[c]);
  const updates = ENTRY_COLUMNS.filter((c) => c !== 'slug').map((c) => `${c} = excluded.${c}`);
  await query(
    `insert into catalogue_reviews (${ENTRY_COLUMNS.join(', ')}, pinned_until)
     values (${ENTRY_COLUMNS.map((_, i) => `$${i + 1}`).join(', ')}, ${pin ? `now() + interval '${PIN_MINUTES} minutes'` : 'null'})
     on conflict (slug) do update set ${updates.join(', ')}, pinned_until = excluded.pinned_until, updated_at = now()
     ${pin ? '' : 'where catalogue_reviews.pinned_until is null or catalogue_reviews.pinned_until < now()'}`,
    params,
  );
}

/**
 * Brings the catalogue's record of reviews into line with the review files: adds and updates
 * each one, and removes reviews that no longer exist. Entries just set by publishing or
 * withdrawing are left alone until their pin runs out, because the deployed files may not
 * have caught up yet.
 */
export async function markReviews(entries: ReviewEntry[]): Promise<{ marked: number; removed: number }> {
  for (const entry of entries) await upsertEntry(entry, false);
  const removed = await query(
    `delete from catalogue_reviews
      where not (slug = any($1::text[])) and (pinned_until is null or pinned_until < now())
      returning slug`,
    [entries.map((e) => e.slug)],
  );
  return { marked: entries.length, removed: removed.length };
}

/** Records one review's new status straight away, when it is published, drafted or withdrawn. */
export async function markReview(entry: ReviewEntry): Promise<void> {
  await upsertEntry(entry, true);
}

export interface CataloguePaper {
  id: string;
  doi: string | null;
  title: string;
  authors: string | null;
  journal: string | null;
  year: number | null;
  conditions: string[];
  cited_by: number;
  access: Access;
  best_url: string | null;
  retracted: boolean;
  review_slug: string | null;
  review_status: ReviewStatus | null;
  review_score: number | null;
  review_signal: string | null;
}

export type PaperFilter = 'unreviewed' | 'drafts' | 'published';
export const PAPER_FILTERS: PaperFilter[] = ['unreviewed', 'drafts', 'published'];

// A paper's review, if any: a published one before a draft, the newest first.
const REVIEW_JOIN = `
  left join lateral (
    select slug, status, score, signal from catalogue_reviews r
     where r.doi = p.doi
     order by (status = 'published') desc, reviewed_on desc nulls last
     limit 1
  ) r on p.doi is not null`;

/**
 * Research papers with the condition in their title, most cited first, with their review if
 * the site has one. "unreviewed" leaves out every paper with a review, draft or published.
 */
export async function listPapers(filter: PaperFilter = 'unreviewed', limit = 25): Promise<CataloguePaper[]> {
  const where = {
    unreviewed: 'r.slug is null',
    drafts: "r.status = 'draft'",
    published: "r.status = 'published'",
  }[filter];
  const rows = await query<CataloguePaper & { review_score: string | null }>(
    `select p.id, p.doi, p.title, p.authors, p.journal, p.year, p.conditions, p.cited_by, p.access, p.best_url, p.retracted,
            r.slug as review_slug, r.status as review_status, r.score as review_score, r.signal as review_signal
       from papers p ${REVIEW_JOIN}
      where p.kind = 'research' and p.in_title and ${where}
      order by p.cited_by desc
      limit $1`,
    [limit],
  );
  return rows.map((row) => ({ ...row, review_score: row.review_score == null ? null : Number(row.review_score) }));
}

const csvCell = (value: unknown) => {
  const text = Array.isArray(value) ? value.join('; ') : value == null ? '' : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

/** The whole catalogue as CSV, abstracts left out, most cited first, with each paper's review. */
export async function catalogueCsv(): Promise<string> {
  const columns = [
    'doi', 'pmid', 'pmcid', 'title', 'authors', 'journal', 'year', 'kind', 'conditions', 'in_title', 'retracted',
    'cited_by', 'access', 'best_url', 'review_status', 'review_slug', 'review_score', 'review_signal',
  ];
  const rows = await query(
    `select p.*, r.status as review_status, r.slug as review_slug, r.score as review_score, r.signal as review_signal
       from papers p ${REVIEW_JOIN}
      order by p.cited_by desc, p.year desc nulls last`,
  );
  return [columns.join(','), ...rows.map((row) => columns.map((c) => csvCell(row[c])).join(','))].join('\n') + '\n';
}
