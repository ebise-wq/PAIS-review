---
title: "ADDRESS-LC: phase 2 trial of bezisterim for neurological symptoms of long COVID (topline results)"
authors: "BioVie Inc."
journal: "Company press release and investor presentation"
year: 2026
url: "https://investors.bioviepharma.com/news/news-details/2026/BioVie-Announces-Topline-Results-from-Phase-2-ADDRESSLC-Trial-Evaluating-Bezisterim-for-the-Treatment-of-Neurological-Symptoms-Associated-with-Long-COVID/default.aspx"
conditions: ["Long Covid"]
studyType: "Randomised placebo-controlled trial, n=203, 12 weeks"
kind: preliminary
humanInput: none
reviewedOn: 2026-10-19
guideVersion: "0.8.1"
model: "claude-opus-5-5"
effort: "high"
signal: unconvincing
verdict: "Bezisterim did not clearly beat placebo on any of 22 measures across the whole trial; the reported benefits come from unadjusted, selectively shown subgroups, so they are a hypothesis for a new trial, not evidence the drug works."
confidence: "moderate"
importance: "high"
strengths:
  - "Randomised, blinded, placebo-controlled, 203 patients"
  - "Publicly funded; registered before it started"
  - "Fatigue effect grew with baseline fatigue"
  - "Well tolerated over 12 weeks"
weaknesses:
  - "No measure improved clearly in the whole trial"
  - "Benefits only in subgroups, uncorrected for many tests"
  - "Main outcomes rewritten after the last treatment visit"
  - "No objective or biological outcome reported yet"
context:
  - note: "Four days before the topline release, on 11 September 2026, BioVie signed an agreement with A.G.P./Alliance Global Partners to sell new shares worth up to $6,464,341 from time to time."
    source: "https://www.sec.gov/Archives/edgar/data/1580149/000152013826000391/bivi-20260911_8k.htm"
  - note: "In November 2023 BioVie reported that its phase 3 trial of the same drug (then called NE3107) in Alzheimer's disease missed its primary endpoint after it excluded all patients from 15 of 39 sites over protocol and Good Clinical Practice violations, leaving 81 of 439 patients; it headlined the remaining data as 'positive trending'."
    source: "https://s205.q4cdn.com/104783765/files/doc_news/BioVie-Announces-Efficacy-Data-from-Phase-3-Trial-of-NE3107-in-Patients-with-Mild-to-Moderate-Alzheimers-Disease-11-29-2023-2023.pdf"
  - note: "In August 2026 BioVie reported its 57-patient phase 2 Parkinson's disease trial of bezisterim, with its strongest clinical results in a subgroup defined by baseline platelet count."
    source: "https://www.sec.gov/Archives/edgar/data/1580149/000152013826000312/bivi-20260806_8kex99z1.htm"
guideNotes:
  - "For company readouts, check the registry's version history between last patient visit and topline, not only the current record"
  - "Subgroups cut at the trial's own median: the share 'with high burden' follows from the cut-offs; ask for the interaction test and the result in the pooled high group"
  - "Counting how many correlated outcomes 'favour' the drug is not evidence; the guide could say so"
design: randomised-trial
topics: ["treatment", "brain-nerves"]
---

## What this review is based on

There is no paper. This review rests on company material: the topline press release (15 September 2026), a company slide deck dated the same day, a press release about a poster at the American Neurological Association (ANA) meeting (19 October 2026), earlier press releases about the trial, the trial's registry record and its full change history, and BioVie's filings with the US Securities and Exchange Commission (SEC).

**Charts I could see.** I downloaded the press release as a document from BioVie's investor site and the company deck from the same site, and looked at the images themselves.

- A diagram of how the 203 patients split into three "high symptom" subgroups (press release Figure 1, deck slide 27).
- A forest plot of effect sizes for the whole trial population (press release Figure 2, deck slide 28).
- A forest plot of effect sizes in the three subgroups (press release Figure 3, deck slide 30).
- A bar chart of fatigue change by quarter of baseline fatigue (deck slide 29 only).
- A safety table (deck slide 31) and a chart of other medicines patients were taking (deck slide 32).

**What I could not see.**

- The webcast of the results call. It is on YouTube, which refused playback and download from the environment this review was written in. Any slide shown only on the call was not seen.
- The "full data announcement presentation" that the press release says holds "the charts for all endpoints". The only deck dated 15 September on the investor site is a general company overview. Its subgroup chart is the same selective one as in the press release. I found no subgroup results for outcomes with p above 0.10 anywhere.
- The ANA poster. It is not on the investor site and I could not find it elsewhere.
- The ANA abstract in the *Annals of Neurology* supplement. The publisher's site blocked access.
- Any baseline table, patient flow diagram, dropout numbers or statistical analysis plan (SAP). None is public.

No SEC filing carries the results. The only current report (form 8-K) filed around the readout concerns a share-sale agreement (see Bias).

## Study design

ADDRESS-LC (the trial's name; LC stands for long COVID) is a randomised, placebo-controlled phase 2 trial of bezisterim (also called NE3107), run by BioVie at multiple sites. It is registered on ClinicalTrials.gov as NCT06847191. 203 adults with long COVID were randomised 1:1 to bezisterim 20 mg by mouth twice daily (101 patients) or matching placebo (102 patients) for 12 weeks, with a 4-week follow-up. The registry lists the participant, the investigator and the outcome assessor as masked. The US Department of War (formerly the Department of Defense) funded it through a $13.13 million award from its Peer-Reviewed Medical Research Program.

The company calls it a "signal-finding proof-of-concept" trial. The press release says the trial "evaluated 22 clinical outcome measures, with no single endpoint pre-specified as the primary determinant of study success". Its stated aims include to "identify patient subgroups most likely to benefit".

A randomised, blinded, placebo-controlled trial of 203 people is a solid design for a phase 2 trial in this field, and better than most long COVID drug studies so far. The problem is not the design of the trial. It is what the design allows the company to conclude. A trial with 22 outcomes, several subgroups and no primary endpoint can find signals. It cannot confirm them.

### What the registry says

The registry record has 15 versions. Its history matters here.

- **February 2025 to August 2026.** From the first version (24 February 2025) the record listed one primary outcome: "Change in performance on the Cogstate Cognition battery" at 12 weeks. Cogstate is a computerised test battery of attention, memory, learning and processing speed. In February 2026 five secondary outcomes were added: three Patient-Reported Outcomes Measurement Information System (PROMIS) questionnaires on cognitive function, fatigue and sleep, the 12-item Short Form Health Survey (SF-12, physical and mental scores as one entry), and the post-exertional malaise subscale of the DePaul Symptom Questionnaire (DSQ-PEM).
- **27 May 2026**, the day after the company announced full enrolment. A note was added to the primary outcome: the trial is "signal-seeking", the primary outcome "is intended for estimation and hypothesis generation rather than formal hypothesis testing", and "no single endpoint is designated as definitive for study success". The full eligibility criteria were also posted for the first time.
- **22 August 2026.** The registry gives 6 August 2026 as the primary completion date. On 22 August the record was changed again: the five secondary outcomes were moved to primary (with SF-12 split into two entries, making six), and a new primary outcome, the "Composite Benefit Score", was added. Biomarkers became the only secondary outcome.
- **19 September 2026.** Status set to completed; no outcome changes.

So for 18 months the trial had one registered primary outcome, the Cogstate composite. The announcement that no single endpoint was primary came in May 2026, before any data were complete. That counts in the company's favour. But the list of primary outcomes was rewritten after the last patient finished treatment. The public record does not say when the data were unblinded, so I cannot say whether anyone had seen results when the change was made. The press release says the subgroup definitions were "pre-specified in the Statistical Analysis Plan submitted to the FDA prior to unblinding", meaning the US Food and Drug Administration. That plan is not public, and the registry has never mentioned subgroups. The claim cannot be checked.

Two results follow from the registry:

- The Cogstate composite ("Cogstate Global Cognition" on the charts), the only registered primary outcome until August 2026, showed no clear difference in the full trial population: p = 0.22, effect size about 0.17.
- The Composite Benefit Score, a registered primary outcome since August 2026, does not appear in any result I could find. It is not among the 22 outcomes on the company's endpoint list.

## Sample selection

**Case definition.** Adults aged 18 to 69 needed fatigue and cognitive symptoms that began or worsened after COVID at least 3 months earlier, lasting at least 3 months. They had to score 40 or below on PROMIS Cognitive Function (at least 1 standard deviation worse than the population average), with some leeway allowed after discussion with the company's medical monitor. They had to score at least 50 on PROMIS Fatigue (the population average or worse). A long COVID diagnosis was not required.

**Infection confirmation.** Either a positive PCR (polymerase chain reaction) or antigen test in the medical record, or "a documented clinical diagnosis of COVID-19, which can be based on a patient-reported positive test". On the guide's scale, some participants may have had only a self-reported test. How many is not reported.

**Hospitalisation.** People admitted to intensive care or intubated for COVID were excluded. Hospitalised patients outside intensive care were allowed. The share of hospitalised patients is not reported.

**Other diagnoses.** People with chronic fatigue syndrome, fibromyalgia or postural orthostatic tachycardia syndrome (POTS) *before* their COVID infection were excluded. Whether patients met criteria for myalgic encephalomyelitis/chronic fatigue syndrome (ME/CFS) or POTS after COVID was not assessed, as far as the material shows. Mast cell activation syndrome (MCAS) is not mentioned. Post-exertional malaise (PEM) was measured with the DSQ-PEM but was not required for entry. The "high PEM" subgroup (72 patients) was defined as the top third of DSQ-PEM scores at baseline, at 67.5 or above. That is a severity cut within this trial, not an ME/CFS diagnosis.

**Mental health screening.** Unstable major depression and a two-item Patient Health Questionnaire (PHQ-2) score of 3 or more led to exclusion or review. The guide regards the PHQ-2 as reasonable in a disabled population.

**Severity and representativeness.** The median baseline PROMIS Fatigue score was 65, 1.5 standard deviations worse than the population average. Participants had to attend the clinic five times and complete cognitive testing on an iPad. People who are housebound or bedbound could not take part. No functional scale such as FUNCAP (a functional capacity questionnaire) or the Bell scale was used. Baseline SF-12 physical scores, illness duration, age, sex and other baseline characteristics have not been released. 96% of participants were taking at least one other medicine, and 77% a medicine acting on the nervous system.

**Objective cognitive impairment.** The "high objective cognitive impairment" subgroup is defined by a Cogstate global score at or below the trial median. The figure in the press release gives that median as "-0.108". The company deck and the ANA press release give "0.130". These cannot both be right. The score is a z-score, but no source says what it is standardised against. If it is against population norms, a median of 0.130 would mean half the trial performed above the population average on objective tests, despite all reporting cognitive problems.

## Outcome measures

The 22 outcomes fall into three groups.

**Patient-reported (subjective).** PROMIS Fatigue, Cognitive Function and Sleep Disturbance; DSQ-PEM, total and PEM scores; SF-12 physical and mental scores; and six single-question Patient Global Impression (PGI) ratings of severity or change, overall and for fatigue and thinking. PROMIS measures are widely validated. DSQ-PEM was developed for ME/CFS. PGI items are single questions with limited reliability. Under good blinding, patient-reported outcomes are acceptable, but the trial has not reported any check on blinding.

**Clinician-rated.** Clinician Global Impression (CGI) of severity and of change. These are largely informed by what the patient reports, so they are not independent of the subjective measures.

**Performance-based.** Seven Cogstate scores: a global composite, and detection/psychomotor speed, identification/attention, processing speed, verbal learning, verbal memory and sustained attention. These are tests the patient performs. They depend on effort and are open to practice effects from repeated testing. The guide puts simple performance tests at high risk of performance bias. In a well-blinded trial that bias should affect both arms equally.

**No actually objective outcome has been reported.** Blood biomarkers, including a panel of 380 proteins, were collected. The company says they are "pending analysis". There was no activity tracking, step count or other measure of daily function outside the clinic.

Many of the 22 outcomes overlap. Three measure fatigue directly (PROMIS Fatigue, PGI severity of fatigue, PGI change in fatigue). The DSQ total includes the PEM score. The Cogstate global score is built from the Cogstate subtests. This matters for how the results can be counted (see below).

## Bias

**Blinding.** The registry describes masking of participants, investigators and assessors. Side effects are unlikely to have unblinded patients: fewer people on bezisterim than on placebo reported any adverse event (41.6% against 55.9%) or a drug-related one (18.8% against 25.5%). No blinding assessment has been reported.

**Funding and analysis.** The trial was publicly funded, but run and analysed by the company. The ANA poster's authors are BioVie staff, one trial investigator (Michael Peluso of the University of California, San Francisco) and three people from outside firms (Perissos, Samad Consulting and Princeton Pharmatech). No independent analysis has been reported.

**Company context.** BioVie is a small listed company whose main asset is bezisterim. Some facts outside the trial bear on how to read the announcement. They are listed under Context, and none of them says anything about how this trial was run. In short: the company signed an agreement to sell new shares four days before the topline release. It described an earlier failed phase 3 trial of the same drug in Alzheimer's disease as "positive trending". And a month earlier it reported its Parkinson's disease trial with the strongest clinical results in a subgroup chosen by a baseline measure, as here.

**Selective display.** The press release says the subgroup chart "shows only those endpoints that reach statistically significant or are trending". It points to "the full data announcement presentation" for the rest, but I could not find such a presentation. In each subgroup, between 11 and 17 of the 22 outcomes are not shown at all.

**Outcome changes.** The registry change of 22 August 2026, after the last treatment visit, is described under Study design.

## Statistical and methodological issues

**The whole trial population.** In the full intention-to-treat (ITT) population, "no individual endpoint reached statistical significance". The ITT chart shows effect sizes (Cohen's d) between about −0.01 and 0.22. The smallest p-value is 0.076. Every 95% confidence interval crosses zero. Upper limits reach about 0.47. So the data allow anything from no effect to a moderate effect. If bezisterim has a true average effect of about d = 0.15, a trial of this size would detect it only rarely. The ITT result is compatible with a small real effect. It does not show one.

**"21 of 22."** The press release says "Bezisterim showed a consistent advantage over placebo on 21 out of 22 individual endpoints". The deck's subtitle for the ITT chart reads "Highly unlikely to occur by chance". The chart itself shows 21 outcomes, not 22. 20 point estimates are above zero and one is just below. The missing outcome is Clinician Global Impression of severity, which appears on the company's endpoint list but not on the chart. More important, the outcomes are not independent coin tosses. Several measure the same thing, and some are built from others. A small real effect would push them all the same way. So would a chance difference between the arms at baseline, or a small difference in how hopeful patients felt. Counting directions cannot tell these apart. The statement "highly unlikely to occur by chance" is not supported by any test shown.

**Subgroups.** Three subgroups were defined by baseline severity: high fatigue (PROMIS Fatigue at or above the median of 65; 112 patients), high PEM (DSQ-PEM in the top third; 72 patients) and high objective cognitive impairment (Cogstate global at or below the median; 98 patients). The press release mentions further subgroups of patients "with two or more in combination". Their results are not shown.

Within the three subgroups shown, 16 subgroup-by-outcome results reached p < 0.05: 5 for fatigue, 7 for PEM and 4 for cognition. Each subgroup was tested on 22 outcomes, so that is 16 of 66 tests. If nothing worked and the tests were independent, about 3 would be expected. That is more than chance alone would usually give. But it is weaker evidence than it looks:

- The outcomes are highly correlated and the subgroups overlap (29 patients are in all three). One chance imbalance in a subgroup of 72 can push a whole block of related outcomes past 0.05 together.
- No correction for multiple testing is reported. With at least 88 tests (22 outcomes in 4 populations), plus the combined subgroups and the quartile analysis, single p-values between 0.01 and 0.05 carry little weight. The lowest subgroup p-value shown is 0.004.
- Many lower confidence limits are close to zero. In the high-fatigue subgroup they run from about 0.01 to 0.07.
- Significance within a subgroup is not the right test. The question is whether the effect *differs* between high and low groups (an interaction test). That is reported only once: the quartile chart (below).

**"Effect sizes more than doubled."** The press release says that "despite reducing sample size (N), the treatment effect sizes more than doubled compared to the ITT population". Only the outcomes that came out best are shown for each subgroup. Picking the largest of many noisy estimates inflates them, the "winner's curse". Larger effects in smaller subgroups selected this way are what chance would produce too.

**"Approximately 78% of trial participants."** The company says patients with "greater baseline burden on one or more symptoms" make up about 78% of the trial (159 of 203). Its chief executive puts patients "with high symptom burden" at "approximately 80%". But "high" means above the trial's own median for fatigue and cognition, and in the top third for PEM. In a population already selected for fatigue and cognitive complaints, cuts like these put most people into at least one "high" group almost by construction. The 78% figure is a product of the cut-offs, not a clinical finding. No result is shown for those 159 patients together on any single outcome. If the drug helps "high burden" patients as a group, that is the analysis that would show it.

**The quartile chart.** This is the most informative chart. Patients were split into quarters by baseline PROMIS Fatigue. The changes in fatigue score (more negative is better) were:

| Baseline fatigue | Bezisterim | Placebo | Difference |
|---|---|---|---|
| Quartile 1 (lowest) | −2.3 | −3.1 | placebo better by 0.8 |
| Quartile 2 | −6.3 | −5.7 | bezisterim better by 0.6 |
| Quartile 3 | −8.3 | −5.0 | bezisterim better by 3.3 |
| Quartile 4 (highest) | −9.5 | −5.9 | bezisterim better by 3.6 |

A box says "p=0.0178". The test is not named, but this looks like a test of whether the effect grows with baseline fatigue. That is the right kind of analysis. The pattern is orderly, and the company's argument that people with mild symptoms have less room to improve is reasonable. Still, it is one interaction test among many that could have been run. No numbers per quartile or error bars are given. It is not known whether the same analysis was done for other outcomes or for PEM and cognition, or what it showed.

**Size of the effect.** In the high-fatigue subgroup, PROMIS Fatigue improved by 8.93 points on bezisterim and 5.30 on placebo: a difference of 3.63 points (p = 0.02). Placebo patients improved by more than 5 points, a large placebo response plus regression to the mean. The difference is in the range often quoted as the smallest change patients notice on PROMIS scales in other conditions, roughly 2 to 6 points. It has not been established for long COVID.

**Effect sizes and their intervals.** How Cohen's d and its intervals were calculated is not described. The statistical model and the handling of missing data are not described either. One detail is odd: the interval for Cogstate sustained attention is about half as wide as the others, in both the ITT and the high-PEM charts. With the same patients, a standard interval for d would be about the same width for every outcome. This may have a simple explanation, but it cannot be checked.

**Dropouts and missing data.** Not reported. The safety table shows 5 patients (5.0%) on bezisterim and 2 (2.0%) on placebo left the study because of an adverse event. The press release does not mention this.

**Coherence across subgroups.** The company calls the subgroup results "clinically coherent". Partly they are. In the high-fatigue group the significant outcomes are mostly fatigue measures. In the high-cognition group they are cognitive tests. But in the high-PEM group the two lowest p-values are for objective cognitive tests (Cogstate global and processing speed), ahead of the PEM score itself, and no fatigue questionnaire other than the single change-in-fatigue question reached p < 0.05. In the high-fatigue group no Cogstate outcome reached even p < 0.10. Some of this pattern is what the drug hypothesis would predict, and some is not. Mixed patterns like this are common when subgroups are small.

## Biological plausibility

BioVie describes bezisterim as an oral drug that crosses the blood-brain barrier and reduces inflammation, acting on the signalling proteins ERK (extracellular signal-regulated kinase), nuclear factor kappa B (NF-κB, written NFκB in the company's material) and tumour necrosis factor alpha (TNFα), and improves insulin sensitivity "without suppressing the immune system". Its stated hypothesis for long COVID is that symptoms "may be triggered by persistent circulation of spike protein fragments that trigger inflammation via NFκB activation". Inflammation is one of several hypotheses for long COVID. Whether spike fragments drive symptoms in most patients has not been established.

**Target engagement.** No evidence has been released that the drug reached or acted on its target in these patients. There are no drug levels, no inflammatory markers and no protein results. The company says the biomarkers are pending. The dose, 20 mg twice daily, was carried over from the company's trials in Alzheimer's and Parkinson's disease. Under the guide, a positive result without engagement evidence leaves the mechanism unsupported. Here even the clinical result is uncertain.

**Track record of the drug.** Bezisterim has no confirmed clinical benefit in any disease. A phase 3 trial in Alzheimer's disease missed its primary endpoint after most patients were excluded over site problems. A 57-patient Parkinson's trial met its biomarker primary endpoint, reported a benefit on a company-built composite clinical score, and reported its strongest clinical results in a subgroup defined by baseline platelet count. Neither clinical result has yet been confirmed in a further trial.

## Interpretation and spin

The press release does contain the key facts. It states that "no individual endpoint reached statistical significance (p<0.05)" in the ITT population. It says the subgroup "findings are exploratory and require confirmation in an adequately powered prospective study", and its forward-looking statements repeat that. That is more candour than many company releases show.

But the headline and the quotes go well beyond the data:

- Headline: "Statistically significant benefits observed in bezisterim-treated Long COVID patients in pre-specified subgroups with high baseline fatigue, cognitive impairment, and/or post‑exertional malaise." Correct as stated, but these are unadjusted subgroup results from a trial whose whole-population result was null.
- "Bezisterim showed a consistent advantage over placebo on 21 out of 22 individual endpoints." The chart shows 21 outcomes. None was significant, and the outcomes overlap heavily (see above).
- BioVie's chief executive, Cuong Do: "To our knowledge, this is the first time a drug candidate has shown the ability to help patients improve across these persistent Long COVID symptoms." The trial has not shown this.
- Dr Peluso, a trial investigator and poster co-author: "These results are among the most promising we have seen in this field so far and clearly warrant progressing to a confirmatory Phase III trial." Whether a phase 3 trial is warranted is a fair judgement call. "Among the most promising" describes a field with almost no positive trials, and this trial did not meet any outcome in its full population.
- A patient advisor to the trial: "We have not seen results that are this clear or compelling before, and this could have a significant impact for Long COVID patients." The results are not clear: they depend on subgroups.
- Professor Grace McComsey (Case Western Reserve University): "It's great to see a trial showing such potential effectiveness while using a well-tolerated oral drug."
- The deck's subtitle on the ITT chart, "Highly unlikely to occur by chance", is not backed by any test.

The ANA press release repeats the subgroup framing: "Taken together, these findings indicate a consistent pattern in which greater baseline symptom burden was associated with larger treatment effects across multiple clinically relevant domains." It again leaves out the ITT result itself, apart from "a consistent trend toward improvement".

## What the study actually demonstrates, and what it does not

**It shows:**

- In a randomised, blinded trial of 203 people, 12 weeks of bezisterim did not clearly improve any of 22 outcomes compared with placebo.
- Point estimates mostly favoured bezisterim, by small amounts (effect sizes up to about 0.2). A small real effect is possible.
- In patients with more severe fatigue at baseline, the fatigue measures favoured bezisterim with unadjusted p-values around 0.02 to 0.04. A test of whether the fatigue effect grew with baseline fatigue gave p = 0.018.
- Bezisterim was well tolerated over 12 weeks: fewer reported adverse events than placebo, no serious ones. Slightly more patients left the study because of adverse events (5 against 2).

**It does not show:**

- That bezisterim works in long COVID, in all patients or in any subgroup. The subgroup results are hypotheses.
- That about 78% of patients would benefit.
- Any effect on an objective measure of daily function, or any biological effect.
- Anything specific to ME/CFS. PEM was not required, ME/CFS was not assessed, and the high-PEM subgroup was 72 people.
- Anything about housebound or severely ill patients, who could not take part.

## Critical missing elements

- A full results report: baseline table, patient flow, dropouts, missing-data handling and the statistical model.
- The statistical analysis plan, with its date, so the claim that subgroups were "pre-specified" can be checked.
- Results for all 22 outcomes in every subgroup, including the combined subgroups, not only those with p below 0.10.
- The Composite Benefit Score, a registered primary outcome.
- The Clinician Global Impression of severity, the 22nd outcome, missing from the ITT chart.
- The ITT result framed against the original sole registered primary outcome, the Cogstate composite.
- Treatment-by-subgroup interaction tests for every subgroup, with correction for multiple testing.
- Results in the 44 patients "low on all 3 symptoms", and in the 159 "high burden" patients together.
- A blinding assessment.
- Biomarker and drug-level data, to show the drug acted on its target.
- The correct cut-off for the cognitive subgroup (−0.108 or 0.130).
- Ideally, the individual patient data, or at least an independent analysis.

## Recommendations

**For patients.** Bezisterim is not available outside trials, and these results do not show it works. In the whole trial, no measure improved clearly more than on placebo. The better results in patients with more severe symptoms might be real, but they could also be chance. A larger trial designed to test that question is needed. If you are offered a place in such a trial, these results suggest the drug is well tolerated in the short term.

**For clinicians.** Read this as a null phase 2 trial with a subgroup hypothesis. Do not cite it as evidence of benefit.

**For researchers and the sponsor.** Publish the full results, the statistical analysis plan and all subgroup results. A confirmatory trial should select patients by baseline fatigue (or by a pre-defined combination), use one primary outcome with a fixed plan, and test whether the effect differs from patients with milder symptoms. It should add a measure of function less open to bias, such as activity tracking, and report blinding. The biomarker results should test whether the drug engages its target.

**For funders and journalists.** The headline result is a subgroup finding from a trial that did not show benefit in its full population. Treat company quotes about it as advocacy.

## Final assessment

This is a reasonably designed trial with a disappointing main result, presented as a success. The design is good for phase 2: randomised, blinded, placebo-controlled, 203 patients, at several sites, publicly funded, with no worrying side effects. In the whole trial population the drug did not clearly beat placebo on any of 22 outcomes. That includes the Cogstate composite, the only registered primary outcome for most of the trial.

Everything positive comes from subgroups chosen by cut-offs within the trial's own data. They were tested on many overlapping outcomes without correction, and displayed selectively. Their pre-specification rests on a plan that has not been released. The registry's primary outcomes were rewritten after the last treatment visit. The share of patients said to be in the target group follows from where the cut-offs were placed.

On the other side, the signal is not nothing. Effects pointed the same way across most outcomes. The fatigue subgroup's results line up with a single test of whether the effect grows with baseline fatigue (p = 0.018). And a reason why mildly affected patients would show less change is plausible.

**What prevents a more positive signal.** The trial has no significant result in its full population. Its positive results are unadjusted subgroup findings, shown only where they looked good. There is no target engagement evidence and no objective outcome. The registry was changed after the last treatment visit. Most of the full data are not public, including any results report, the analysis plan and the excluded outcomes.

**What prevents a more negative signal.** The trial was randomised, blinded and reasonably large. Effects pointed the same way across most outcomes. The one interaction analysis shown supports a pattern that is biologically sensible and testable. The press release states the null ITT result and calls the subgroups exploratory. The safety profile was good.

**Confidence.** Moderate. I could see the main charts and the full registry history, but not the call slides, the poster, the abstract, a baseline table or the analysis plan. Any of these could change details of this assessment, though not its main point: the full-population result was null.

## Executive summary

These are company-reported results. There is no paper yet. ADDRESS-LC tested BioVie's drug bezisterim against a placebo (a dummy pill) for 12 weeks in 203 adults with long COVID who had fatigue and thinking problems. The trial was randomised and blinded, and the safety results were good: fewer side effects than on placebo and no serious ones.

Across all 203 patients, none of the 22 measures improved clearly more on bezisterim than on placebo. That includes the computerised cognitive test score that was the trial's only registered main outcome until August 2026. Most results leaned slightly towards the drug. Those measures overlap heavily, so this does not show the drug works.

The positive headlines come from subgroups: patients with fatigue, post-exertional malaise (worsening after effort) or test-measured cognitive problems above the trial's own median or top third. In these groups some measures reached statistical significance, without correction for the many tests run. Only the better results were shown. The company says the subgroups were planned before unblinding, but the plan is not public. The trial registry's list of main outcomes was rewritten after the last patient finished treatment. The claim that about 78% of patients have a high burden of at least one symptom follows from where the cut-offs were set.

The most useful piece is a chart showing that the fatigue effect grew with baseline fatigue. That is a reasonable hypothesis for a new trial to test, not evidence that the drug works. No blood marker or other evidence yet shows the drug acted as intended.

I could see the press-release charts and a company slide deck from the same day. I could not see the webcast slides, the conference poster or abstract, the analysis plan, or results for the outcomes not shown.

Signal: unconvincing.
