#!/usr/bin/env node
/**
 * Fetches what a review needs in one step and saves it as files, so a review session does
 * not spend dozens of steps searching, and does not pour whole papers into its conversation.
 *
 *   npm run -s fetch-sources -- <doi | PMID | PMCID> <folder>
 *
 * Into <folder> it writes, where they exist:
 *   paper.txt           the full text (headings, paragraphs, figure and table captions)
 *   paper.pdf           the PDF
 *   figures/            every figure as an image, to look at, not just the captions
 *   supplement/         supplementary files
 *   registrations/      each trial registration named in the paper, with its outcomes
 *   metadata.json       the Europe PMC record: authors, journal, abstract, links
 *   SOURCES.md          what was found, what was not, and where to look next
 *
 * Full text, figures and supplements come from the PubMed Central open-access store, then
 * Europe PMC. A paywalled paper gets only the metadata and abstract: the session should ask
 * for the PDF. Prints a short summary; the details are in SOURCES.md.
 */
import fs from 'node:fs';
import path from 'node:path';
import {
  classifyMedia,
  correctionsOf,
  europePmcQuery,
  htmlToText,
  findRegistrations,
  jatsToText,
  latestPmcVersion,
  summariseCtgov,
} from '../src/lib/sources.ts';

const [identifier, outDir] = process.argv.slice(2);
if (!identifier || !outDir) {
  console.error('Usage: fetch-sources <doi | PMID | PMCID> <folder>');
  process.exit(1);
}
fs.mkdirSync(outDir, { recursive: true });

const S3 = 'https://pmc-oa-opendata.s3.amazonaws.com';
const EPMC = 'https://www.ebi.ac.uk/europepmc/webservices/rest';
const log = []; // lines for SOURCES.md
const missing = [];

async function get(url, { timeout = 60_000, as = 'text' } = {}) {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(timeout),
      headers: { 'User-Agent': 'pais-review fetch-sources (research; contact via repository)' },
    });
    if (!response.ok) return undefined;
    return as === 'buffer' ? Buffer.from(await response.arrayBuffer()) : await response.text();
  } catch {
    return undefined;
  }
}
const save = (name, data) => {
  const file = path.join(outDir, name);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, data);
  return file;
};
// Only plain file names from a package, never paths, so nothing can be written outside the folder.
const safeName = (name) => name.replace(/[^\w.-]+/g, '_').replace(/^\.+/, '');

// 1. The Europe PMC record.
const search = await get(
  `${EPMC}/search?format=json&resultType=core&pageSize=1&query=${encodeURIComponent(europePmcQuery(identifier))}`,
);
const record = search ? JSON.parse(search).resultList?.result?.[0] : undefined;
if (!record) {
  console.error(`Europe PMC has no record for ${identifier}. Find the paper another way or ask for the PDF.`);
  process.exit(2);
}
save('metadata.json', JSON.stringify(record, null, 2));
const pmcid = record.pmcid;
log.push(`# ${record.title}`, '', `${record.authorString ?? ''}`, `${record.journalInfo?.journal?.title ?? record.journalTitle ?? ''} ${record.pubYear ?? ''}. DOI ${record.doi ?? 'none'}; PMID ${record.pmid ?? 'none'}; PMCID ${pmcid ?? 'none'}.`, '');

// 2. Retractions and corrections.
const { retracted, notices } = correctionsOf(record);
let pmcRetracted = false;

// 3. Full text, figures and supplement from the PubMed Central open-access store.
let text;
const got = { pdf: false, figures: 0, supplement: 0 };
if (pmcid) {
  const listing = await get(`${S3}/?list-type=2&delimiter=/&prefix=${pmcid}.`);
  const version = listing && latestPmcVersion(listing);
  const pkg = version && (await get(`${S3}/${version}/${version}.json`));
  if (pkg) {
    const info = JSON.parse(pkg);
    pmcRetracted = Boolean(info.is_retracted);
    log.push(`PubMed Central open-access copy ${version} (${info.license_code ?? 'licence not stated'}${info.is_manuscript ? ', author manuscript' : ''}).`);
    const key = (url) => url?.replace(/^s3:\/\/[^/]+\//, '').replace(/\?.*$/, '');
    const xml = info.xml_url && (await get(`${S3}/${key(info.xml_url)}`));
    if (xml) text = jatsToText(xml);
    else if (info.text_url) text = await get(`${S3}/${key(info.text_url)}`);
    if (info.pdf_url) {
      const pdf = await get(`${S3}/${key(info.pdf_url)}`, { as: 'buffer', timeout: 120_000 });
      if (pdf && pdf.subarray(0, 4).toString() === '%PDF') {
        save('paper.pdf', pdf);
        got.pdf = true;
      }
    }
    for (const file of classifyMedia(info.media_urls ?? [])) {
      const data = await get(`${S3}/${file.key}`, { as: 'buffer', timeout: 120_000 });
      if (!data) continue;
      save(path.join(file.kind === 'figure' ? 'figures' : 'supplement', safeName(file.name)), data);
      got[file.kind === 'figure' ? 'figures' : 'supplement']++;
    }
  }
  // Not in the open-access store: Europe PMC may still have the text.
  if (!text) {
    const xml = await get(`${EPMC}/${pmcid}/fullTextXML`);
    if (xml && xml.includes('<body')) {
      text = jatsToText(xml);
      log.push('Full text from Europe PMC (figures not included; look for them on the article page).');
    }
  }
}
// A free PDF elsewhere (publisher or Unpaywall), when there is no PubMed Central PDF.
if (!got.pdf) {
  const links = record.fullTextUrlList?.fullTextUrl ?? [];
  for (const link of links.filter((l) => l.documentStyle === 'pdf' && ['OA', 'F'].includes(l.availabilityCode))) {
    const pdf = await get(link.url, { as: 'buffer', timeout: 90_000 });
    if (pdf && pdf.subarray(0, 4).toString() === '%PDF') {
      save('paper.pdf', pdf);
      got.pdf = true;
      log.push(`PDF from ${link.site}: ${link.url}`);
      break;
    }
  }
}

if (text) save('paper.txt', text);
else if (record.inPMC === 'Y' || record.inEPMC === 'Y')
  missing.push(
    'Full text: free to read on PubMed Central or Europe PMC, but not in the open-access store, and their pages block scripts. Try opening the article page below with your web tools; if that fails, ask the user for the PDF. Do not review from the abstract.',
  );
else missing.push('Full text: not openly available. Ask the user for the PDF; do not review from the abstract.');
if (!got.pdf) missing.push('PDF: none found openly. Publisher pages often block scripts; the user may need to supply it.');
if (text && got.figures === 0) missing.push('Figures: none downloaded. Open the article page or the PDF to see them as images.');
const articlePage = pmcid ? `https://europepmc.org/article/PMC/${pmcid}` : record.doi ? `https://doi.org/${record.doi}` : undefined;

// 4. Trial registrations named in the paper.
const registrations = findRegistrations(`${record.abstractText ?? ''}\n${text ?? ''}`);
for (const reg of registrations) {
  if (reg.registry === 'ClinicalTrials.gov') {
    const json = await get(`https://clinicaltrials.gov/api/v2/studies/${reg.id}`);
    if (json) {
      save(`registrations/${reg.id}.json`, json);
      save(`registrations/${reg.id}.md`, summariseCtgov(JSON.parse(json)));
      continue;
    }
  }
  if (reg.registry === 'ISRCTN') {
    // The web page is built by JavaScript; the API returns the whole record as XML.
    const xml = await get(`https://www.isrctn.com/api/query/format/default?q=${reg.id}`);
    if (xml && xml.includes('<fullTrial')) {
      save(`registrations/${reg.id}.xml`, xml);
      save(`registrations/${reg.id}.txt`, `${reg.url}\n\n${htmlToText(xml.replace(/<(\w+)\b[^>]*\/>/g, ''))}`);
      continue;
    }
  }
  missing.push(`Registration ${reg.id} (${reg.registry}): not fetched; open ${reg.url}`);
}

// 5. SOURCES.md and the summary.
const isRetracted = retracted || pmcRetracted;
log.push(
  '',
  '## Files',
  `- paper.txt: ${text ? `${Math.round(text.length / 1000)}k characters` : 'missing'}`,
  `- paper.pdf: ${got.pdf ? 'yes' : 'missing'}`,
  `- figures/: ${got.figures} image(s)`,
  `- supplement/: ${got.supplement} file(s)`,
  `- registrations/: ${registrations.length ? registrations.map((r) => `${r.id} (${r.registry})`).join(', ') : 'none named in the paper'}`,
  '',
  '## Retractions and corrections',
  isRetracted ? '- **RETRACTED.** Say so at the top of the review.' : '- Not marked as retracted by Europe PMC or PubMed Central.',
  ...notices.map((n) => `- ${n.type}: ${n.reference}`),
  '',
  '## Missing',
  ...(missing.length ? missing.map((m) => `- ${m}`) : ['- Nothing obvious. Still check the protocol, the statistical analysis plan and data repositories where they matter.']),
  '',
  articlePage ? `Article page: ${articlePage}` : '',
);
save('SOURCES.md', log.join('\n') + '\n');

console.log(
  [
    `${record.title}`,
    `text: ${text ? 'yes' : 'NO'} | pdf: ${got.pdf ? 'yes' : 'no'} | figures: ${got.figures} | supplement: ${got.supplement} | registrations: ${registrations.map((r) => r.id).join(', ') || 'none'}${isRetracted ? ' | RETRACTED' : ''}${notices.length ? ` | ${notices.length} correction notice(s)` : ''}`,
    ...missing.map((m) => `missing: ${m}`),
    `details: ${path.join(outDir, 'SOURCES.md')}`,
  ].join('\n'),
);
