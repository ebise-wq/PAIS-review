import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  classifyMedia,
  correctionsOf,
  europePmcQuery,
  findRegistrations,
  jatsToText,
  latestPmcVersion,
  summariseCtgov,
} from '../src/lib/sources.ts';

test('registrations are found once each, in order, across registries', () => {
  const found = findRegistrations(
    'Registered as ISRCTN 54285094 and NCT04362150; see also NCT04362150, EudraCT 2015-001234-56 and DRKS00012345.',
  );
  assert.deepEqual(
    found.map((r) => [r.registry, r.id]),
    [
      ['ISRCTN', 'ISRCTN54285094'],
      ['ClinicalTrials.gov', 'NCT04362150'],
      ['EU CTR', '2015-001234-56'],
      ['DRKS', 'DRKS00012345'],
    ],
  );
  assert.equal(found[1].url, 'https://clinicaltrials.gov/study/NCT04362150');
  assert.deepEqual(findRegistrations('NCT123 is too short'), []);
});

test('the newest PubMed Central version is chosen', () => {
  const xml = '<CommonPrefixes><Prefix>PMC1.1/</Prefix></CommonPrefixes><CommonPrefixes><Prefix>PMC1.10/</Prefix></CommonPrefixes><CommonPrefixes><Prefix>PMC1.2/</Prefix></CommonPrefixes>';
  assert.equal(latestPmcVersion(xml), 'PMC1.10');
  assert.equal(latestPmcVersion('<ListBucketResult/>'), undefined);
});

test('figures and supplementary files are told apart, and gif thumbnails dropped', () => {
  const media = classifyMedia([
    's3://bucket/PMC1.1/fig1.jpg?md5=a',
    's3://bucket/PMC1.1/fig1.gif?md5=b',
    's3://bucket/PMC1.1/scheme.gif?md5=c',
    's3://bucket/PMC1.1/MOESM1_ESM.pdf?md5=d',
  ]);
  assert.deepEqual(
    media.map((m) => [m.name, m.kind]),
    [
      ['fig1.jpg', 'figure'],
      ['scheme.gif', 'figure'],
      ['MOESM1_ESM.pdf', 'supplement'],
    ],
  );
  assert.equal(media[0].key, 'PMC1.1/fig1.jpg');
});

test('article XML becomes readable text with captions and table cells marked', () => {
  const xml = `<?xml version="1.0"?><article><front><article-title>A &amp; B</article-title></front><body>
    <sec><title>Methods</title><p>We enrolled 42&#160;patients.</p>
    <fig id="f1"><label>Fig. 1</label><caption><p>Grip strength.</p></caption><graphic/></fig>
    <table-wrap><caption><p>Baseline</p></caption><table><tr><th>Age</th><th>n</th></tr><tr><td>36</td><td>42</td></tr></table></table-wrap>
    </sec></body></article>`;
  const text = jatsToText(xml);
  assert.match(text, /^# A & B/);
  assert.match(text, /## Methods/);
  assert.match(text, /We enrolled 42 patients\./);
  assert.match(text, /\[FIGURE\] Fig\. 1\. Grip strength\./);
  assert.match(text, /\[TABLE\][\s\S]*Age \| n \|\n36 \| 42 \|/);
});

test('retractions and corrections are read from the Europe PMC record', () => {
  const retracted = correctionsOf({
    pubTypeList: { pubType: ['Retracted Publication', 'Journal Article'] },
    commentCorrectionList: { commentCorrection: [{ type: 'Retraction in', reference: 'Science 2011' }, { type: 'Comment in', reference: 'x' }] },
  });
  assert.equal(retracted.retracted, true);
  assert.deepEqual(retracted.notices, [{ type: 'Retraction in', reference: 'Science 2011' }]);
  const erratum = correctionsOf({ commentCorrectionList: { commentCorrection: [{ type: 'Erratum in', source: 'MED', id: '1' }] } });
  assert.equal(erratum.retracted, false);
  assert.deepEqual(erratum.notices, [{ type: 'Erratum in', reference: 'MED:1' }]);
  assert.deepEqual(correctionsOf({}), { retracted: false, notices: [] });
});

test('a ClinicalTrials.gov record is summarised with outcomes and whether it was registered in time', () => {
  const summary = summariseCtgov({
    hasResults: false,
    protocolSection: {
      identificationModule: { nctId: 'NCT00000001', briefTitle: 'A trial' },
      statusModule: { studyFirstSubmitDate: '2021-03-01', startDateStruct: { date: '2021-01-15', type: 'ACTUAL' } },
      outcomesModule: { primaryOutcomes: [{ measure: 'Fatigue score', timeFrame: '12 weeks' }] },
    },
  });
  assert.match(summary, /NCT00000001 — A trial/);
  assert.match(summary, /no, 45 days after the start/);
  assert.match(summary, /- Fatigue score — 12 weeks/);
  assert.match(summary, /Secondary outcomes \(as registered now\)\nNone listed\./);
  assert.match(summary, /tab=history/);
});

test('identifiers become Europe PMC queries', () => {
  assert.equal(europePmcQuery('https://doi.org/10.1/abc'), 'DOI:"10.1/abc"');
  assert.equal(europePmcQuery('pmc123'), 'PMCID:PMC123');
  assert.equal(europePmcQuery('36042189'), 'EXT_ID:36042189 AND SRC:MED');
});

test('front matter is cut down to the title and abstract', () => {
  const text = jatsToText(
    '<article><front><journal-meta><journal-title>Lancet</journal-title></journal-meta><article-meta><title-group><article-title>PACE</article-title></title-group><aff>Barts</aff><abstract><p>We randomised 641.</p></abstract></article-meta></front><body><p>Text.</p></body></article>',
  );
  assert.doesNotMatch(text, /Lancet|Barts/);
  assert.match(text, /^# PACE\n\n## Abstract\n\nWe randomised 641\./);
});
