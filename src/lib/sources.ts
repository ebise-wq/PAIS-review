/**
 * The pure parts of `scripts/fetch-sources.mjs`: turning what Europe PMC, PubMed Central
 * and the trial registries return into files a review session can read. No network or file
 * access here, so the tests can run it directly.
 */

export interface Registration {
  registry: 'ClinicalTrials.gov' | 'ISRCTN' | 'EU CTR' | 'DRKS' | 'ANZCTR' | 'ChiCTR' | 'Netherlands Trial Register' | 'CTRI' | 'PROSPERO';
  id: string;
  url: string;
}

/** Trial and review registrations named anywhere in a text, once each, in order of first mention. */
export function findRegistrations(text: string): Registration[] {
  const patterns: [RegExp, Registration['registry'], (id: string) => string][] = [
    [/\bNCT\d{8}\b/g, 'ClinicalTrials.gov', (id) => `https://clinicaltrials.gov/study/${id}`],
    [/\bISRCTN\s?\d{8}\b/g, 'ISRCTN', (id) => `https://www.isrctn.com/${id.replace(/\s/g, '')}`],
    [/\b(?:EudraCT|EUCTR)[\s:#-]*(\d{4}-\d{6}-\d{2})\b/gi, 'EU CTR', (id) => `https://www.clinicaltrialsregister.eu/ctr-search/search?query=${id}`],
    [/\bDRKS\d{8}\b/g, 'DRKS', (id) => `https://drks.de/search/en/trial/${id}`],
    [/\bACTRN\d{14}\b/g, 'ANZCTR', (id) => `https://www.anzctr.org.au/Trial/Registration/TrialReview.aspx?ACTRN=${id.slice(5)}`],
    [/\bChiCTR[-\s]?\w{6,}\b/g, 'ChiCTR', (id) => `https://www.chictr.org.cn/searchprojEN.html?regno=${id}`],
    [/\bNL-?OMON\d+\b|\bNTR\d{3,}\b/g, 'Netherlands Trial Register', (id) => `https://onderzoekmetmensen.nl/en/trial/${id}`],
    [/\bCTRI\/\d{4}\/\d{2,3}\/\d{6}\b/g, 'CTRI', (id) => `https://ctri.nic.in/Clinicaltrials/advsearch.php?q=${id}`],
    [/\bCRD\d{11}\b/g, 'PROSPERO', (id) => `https://www.crd.york.ac.uk/prospero/display_record.php?RecordID=${id.slice(3)}`],
  ];
  const found: (Registration & { at: number })[] = [];
  const seen = new Set<string>();
  for (const [pattern, registry, url] of patterns) {
    for (const match of text.matchAll(pattern)) {
      const id = (match[1] ?? match[0]).replace(/\s/g, '');
      if (seen.has(id)) continue;
      seen.add(id);
      found.push({ registry, id, url: url(id), at: match.index ?? 0 });
    }
  }
  return found.sort((a, b) => a.at - b.at).map(({ at: _at, ...rest }) => rest);
}

/** The newest version folder in a PubMed Central open-data bucket listing, e.g. "PMC9426365.2". */
export function latestPmcVersion(listingXml: string): string | undefined {
  const versions = [...listingXml.matchAll(/<Prefix>(PMC\d+)\.(\d+)\/<\/Prefix>/g)].map((m) => ({
    name: `${m[1]}.${m[2]}`,
    n: Number(m[2]),
  }));
  versions.sort((a, b) => b.n - a.n);
  return versions[0]?.name;
}

export interface MediaFile {
  name: string;
  key: string;
  kind: 'figure' | 'supplement';
}

/**
 * Sorts a PubMed Central package's media into figures and supplementary files. Images are
 * figures; a .gif that only duplicates a .jpg or .png of the same name is a thumbnail and is
 * dropped. Everything else (PDFs, spreadsheets, Word files, videos) is supplementary.
 */
export function classifyMedia(urls: string[]): MediaFile[] {
  const files = urls.map((url) => {
    const key = url.replace(/^s3:\/\/[^/]+\//, '').replace(/\?.*$/, '');
    return { key, name: key.split('/').pop() ?? key };
  });
  const stems = new Set(
    files.filter((f) => /\.(jpe?g|png|tiff?)$/i.test(f.name)).map((f) => f.name.replace(/\.[^.]+$/, '')),
  );
  return files
    .filter((f) => !(/\.gif$/i.test(f.name) && stems.has(f.name.replace(/\.[^.]+$/, ''))))
    .map((f) => ({ ...f, kind: /\.(jpe?g|png|gif|tiff?)$/i.test(f.name) ? 'figure' : 'supplement' }));
}

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
const decode = (text: string) =>
  text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&(\w+);/g, (whole, name) => ENTITIES[name] ?? whole)
    .replace(/\u00a0/g, ' ');

/**
 * JATS article XML (what Europe PMC and PubMed Central serve) as plain text: headings on
 * their own lines, paragraphs, figure and table captions marked so they can be found, and
 * table cells separated by " | ". Good enough to read and search; not a faithful render.
 */
export function jatsToText(xml: string): string {
  // Of the front matter (journal, affiliations, dates, licence), keep only the title and abstract.
  const title = /<article-title\b[^>]*>([\s\S]*?)<\/article-title>/.exec(xml)?.[1] ?? '';
  const abstracts = [...xml.matchAll(/<abstract\b[\s\S]*?<\/abstract>/g)]
    .map((m) => (/^<abstract\b[^>]*>\s*<title>/.test(m[0]) ? m[0] : m[0].replace(/^<abstract\b[^>]*>/, '<abstract><title>Abstract</title>')))
    .join('');
  let body = xml
    .replace(/<front>[\s\S]*?<\/front>/, `<front><article-title>${title}</article-title>${abstracts}</front>`)
    .replace(/<\?xml[^>]*>|<!DOCTYPE[^>]*>/g, '')
    // A caption's paragraphs run together, so a figure reads as one line: "[FIGURE] Fig. 1. ..."
    .replace(/<caption>([\s\S]*?)<\/caption>/g, (_, inner) => `<caption>${inner.replace(/<\/?p\b[^>]*>/g, ' ')}</caption>`)
    .replace(/<label>([\s\S]*?)<\/label>\s*<caption>/g, '<caption>$1. ')
    .replace(/<fig\b[^>]*>/g, '\n\n[FIGURE] ')
    .replace(/<table-wrap\b[^>]*>/g, '\n\n[TABLE] ')
    .replace(/<supplementary-material\b[^>]*>/g, '\n\n[SUPPLEMENT] ')
    .replace(/<\/(td|th)>/g, ' | ')
    .replace(/<\/tr>/g, '\n')
    .replace(/<title>([\s\S]*?)<\/title>/g, '\n\n## $1\n')
    .replace(/<article-title>([\s\S]*?)<\/article-title>/, '# $1\n')
    .replace(/<\/(p|caption|abstract|ref|list-item|disp-formula)>/g, '\n')
    .replace(/<(p|ref|list-item)\b[^>]*>/g, '\n')
    .replace(/<[^>]+>/g, '');
  body = decode(body)
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n');
  return body.trim() + '\n';
}

export interface Correction {
  type: string;
  reference: string;
}

/** Retractions, errata and expressions of concern from a Europe PMC "core" record. */
export function correctionsOf(record: Record<string, unknown>): { retracted: boolean; notices: Correction[] } {
  const list = (record.commentCorrectionList as { commentCorrection?: Record<string, string>[] } | undefined)?.commentCorrection ?? [];
  const notices = list
    .filter((c) => /retract|erratum|correct|concern|withdraw/i.test(c.type ?? ''))
    .map((c) => ({ type: c.type, reference: c.reference ?? `${c.source}:${c.id}` }));
  const pubTypes = ((record.pubTypeList as { pubType?: string[] } | undefined)?.pubType ?? []).map(String);
  const retracted =
    pubTypes.some((t) => /retracted publication/i.test(t)) || notices.some((n) => /^retraction in/i.test(n.type));
  return { retracted, notices };
}

/** A short plain-text summary of a ClinicalTrials.gov v2 study record: the parts reviews check. */
export function summariseCtgov(study: Record<string, any>): string {
  const p = study.protocolSection ?? {};
  const id = p.identificationModule ?? {};
  const status = p.statusModule ?? {};
  const outcomes = p.outcomesModule ?? {};
  const design = p.designModule ?? {};
  const lines = [
    `# ${id.nctId ?? ''} — ${id.officialTitle ?? id.briefTitle ?? ''}`,
    '',
    `First submitted: ${status.studyFirstSubmitDate ?? '?'}; start: ${status.startDateStruct?.date ?? '?'} (${status.startDateStruct?.type ?? '?'}); primary completion: ${status.primaryCompletionDateStruct?.date ?? '?'}; last update: ${status.lastUpdateSubmitDate ?? '?'}; status: ${status.overallStatus ?? '?'}; results posted: ${study.hasResults ? 'yes' : 'no'}.`,
    `Registered before the study started: ${
      status.studyFirstSubmitDate && status.startDateStruct?.date
        ? status.studyFirstSubmitDate <= status.startDateStruct.date
          ? 'yes'
          : `no, ${Math.round((Date.parse(status.studyFirstSubmitDate) - Date.parse(status.startDateStruct.date)) / 86_400_000)} days after the start`
        : 'unknown'
    }.`,
  ];
  if (design.studyType) lines.push(`Design: ${design.studyType}${design.phases ? `, ${design.phases.join('/')}` : ''}${design.enrollmentInfo ? `, enrolment ${design.enrollmentInfo.count} (${design.enrollmentInfo.type})` : ''}.`);
  for (const [label, key] of [
    ['Primary outcomes', 'primaryOutcomes'],
    ['Secondary outcomes', 'secondaryOutcomes'],
  ] as const) {
    const list = outcomes[key] ?? [];
    lines.push('', `## ${label} (as registered now)`);
    if (!list.length) lines.push('None listed.');
    for (const o of list) lines.push(`- ${o.measure}${o.timeFrame ? ` — ${o.timeFrame}` : ''}`);
  }
  lines.push(
    '',
    'The registration as it stands now. Earlier versions, which show any change to the outcomes, are at',
    `https://clinicaltrials.gov/study/${id.nctId}?tab=history`,
  );
  return lines.join('\n') + '\n';
}

/** How to look a paper up in Europe PMC from a DOI, PMID or PMCID. */
export function europePmcQuery(identifier: string): string {
  const id = identifier.trim().replace(/^https?:\/\/(dx\.)?doi\.org\//i, '');
  if (/^PMC\d+$/i.test(id)) return `PMCID:${id.toUpperCase()}`;
  if (/^\d+$/.test(id)) return `EXT_ID:${id} AND SRC:MED`;
  return `DOI:"${id}"`;
}

/** A web page as rough plain text: scripts and styles dropped, block ends as line breaks. */
export function htmlToText(html: string): string {
  return decode(
    html
      .replace(/<(script|style|noscript|svg)\b[\s\S]*?<\/\1>/gi, '')
      .replace(/<\/(p|div|tr|li|h[1-6]|dt|dd|section|table)>|<br\s*\/?>/gi, '\n')
      .replace(/<\/(td|th)>/gi, ' | ')
      .replace(/<[^>]+>/g, ''),
  )
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .filter(Boolean)
    .join('\n') + '\n';
}
