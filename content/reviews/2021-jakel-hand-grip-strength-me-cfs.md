---
title: "Hand grip strength and fatigability: correlation with clinical parameters and diagnostic suitability in ME/CFS"
authors: "Jäkel B, Kedor C, Grabowski P, Wittke K, Thiel S, Scherbakov N, Doehner W, Scheibenbogen C, Freitag H"
journal: "Journal of Translational Medicine"
year: 2021
doi: "10.1186/s12967-021-02774-w"
url: "https://translational-medicine.biomedcentral.com/articles/10.1186/s12967-021-02774-w"
conditions: ["ME/CFS"]
studyType: "Case-control, single visit, n=105 patients, 18 cancer-related fatigue, 66 healthy controls"
design: case-control
topics: ["diagnosis-biomarkers", "exercise-pem", "muscle-metabolism"]
kind: paper
draft: true
reviewedOn: 2026-11-02
guideVersion: "0.10.2"
model: "claude-opus-5-5"
effort: "high"
read:
  - "Full text, from the PubMed Central open-access copy (PMC8056497), saved as text and PDF"
  - "Figures 1 to 4, viewed as images"
  - "Supplementary Figure S1 (correlations in men) and Figure S3 (cutoff plot), viewed as images"
  - "Supplementary Figure S2 (correlations in women) not viewed; its numbers are in Table S1"
  - "Supplementary Tables S1 (all correlations) and S2 (cutoffs for ages 40 to 59), read in full"
  - "Supplementary Table S3 (raw data for all 189 participants), re-analysed by the reviewer"
  - "Cited questionnaire paper, Cotler et al. 2018: https://pmc.ncbi.nlm.nih.gov/articles/PMC6165517/ (summary of the page via a web fetch)"
  - "Abstract of the Chalder Fatigue Scale paper, Chalder et al. 1993, from PubMed: https://pubmed.ncbi.nlm.nih.gov/8463991/"
  - "Abstract of Mihatsch et al. 2026, from PubMed: https://pubmed.ncbi.nlm.nih.gov/42458481/"
score: 4.5
verdict: "Patients with ME/CFS grip more weakly and tire faster than healthy people, but so did patients with cancer-related fatigue; the claims of a diagnostic test and an objective marker of post-exertional malaise go well beyond what this design can show."
confidence: "high"
importance: "moderate"
strengths:
  - "Specialist-clinic diagnosis requiring post-exertional malaise"
  - "Included a second fatiguing illness as a comparison"
  - "Raw data for every participant published"
  - "Simple, cheap, well-described test"
weaknesses:
  - "Cancer fatigue patients scored the same as ME/CFS"
  - "Effort and inactivity not separated from muscle fatigue"
  - "Post-exertional malaise never measured after the test"
  - "Cutoffs fitted and tested on the same small groups"
context:
  - note: "A 2026 study of 147 young people referred for suspected ME/CFS, using the same two-session grip protocol and co-authored by two of this paper's authors, found that no grip measure significantly separated ME/CFS from other fatiguing conditions, and that grip measures did not correlate with how long post-exertional malaise lasted."
    source: "https://pubmed.ncbi.nlm.nih.gov/42458481/"
guideNotes:
  - "Diagnostic accuracy studies: check whether the comparison group is the one a clinician must tell apart (other fatiguing illness), not healthy people"
  - "Cutoffs chosen and tested in the same sample: check where the cutoff sits relative to the most extreme control"
  - "Repeated strength tests: within-session variability can reflect effort as well as fatigue; ask for an effort check"
  - "Claims that a test tracks post-exertional malaise need a measurement at the delay when it occurs (hours to days), and test-retest data"
---

## Study design

This is a single-centre case-control study from the outpatient fatigue clinic of the Charité
in Berlin, run from December 2018 to January 2021. Each person came once. They squeezed a
digital hand dynamometer ten times with the dominant hand, at full force for three seconds with
five seconds of rest between pulls. After 60 minutes without strenuous activity, they did ten
more pulls.

From the pulls the authors derived four measures:

- Fmax, the strongest pull in a session.
- Fmean, the average of the ten pulls.
- A "Fatigue Ratio", Fmax divided by Fmean.
- A "Recovery Ratio", Fmean in the second session divided by Fmean in the first.

They compared 105 patients with ME/CFS against 66 healthy controls and 18 women with
cancer-related fatigue. In patients they correlated the grip measures with questionnaires and
with two blood enzymes, creatine kinase (CK) and lactate dehydrogenase (LDH). A side study
measured thigh-muscle (quadriceps) strength in 8 women with ME/CFS and 8 healthy women.

The study was not registered and no protocol or analysis plan is cited. That is common for
exploratory work of this kind, but it means there is no way to check which comparisons were
planned.

Two things the design does not do matter for how the paper is read. First, nobody was
followed up: there is no measurement in the hours or days after the test, and no second visit.
So the paper cannot show that grip strength tracks post-exertional malaise (PEM) over time, or
that the test itself causes little PEM. Second, the diagnostic accuracy was tested only
against healthy people.

## Sample selection

Patients were diagnosed at a specialist clinic with the Canadian Consensus Criteria (CCC), which
require PEM, after other causes of fatigue were excluded. This is about as good as case
ascertainment gets in ME/CFS, and the share of true cases is probably high. Most cases began
after an infection (92 of 105). Median illness duration was 4 years. The median Bell score (a
0 to 100 disability scale) was 30 in women and 40 in men, so these were substantially disabled
patients, though all were well enough to attend the clinic. Only 2 women scored 10 on the Bell
scale, and patients too ill to travel are not represented.

What is missing: the paper does not report how many patients had postural orthostatic
tachycardia syndrome or orthostatic intolerance, fibromyalgia or mast cell activation syndrome.
Fibromyalgia matters here. The authors themselves cite a study (Ickmans et al.) in which
differences in upper-limb strength and recovery appeared only in chronic fatigue syndrome
patients with comorbid fibromyalgia.

The inclusion sentence in the methods reads "Further inclusion criteria were age ≤ 18 years or
participation in an interventional study". This is presumably an error for exclusion criteria;
the raw data include patients from 18 to 76.

The healthy controls had "self-reported healthy status". Nothing was recorded about their
physical activity. The paper calls them age- and sex-matched, but median ages differ (women 42
versus 49; men 33.5 versus 40). In the raw data these age gaps are not statistically clear, and
adjusting for age changes the group differences by almost nothing. So age is not the problem.
Activity level is: a group of patients with a median Bell score of 30 will be far less active
than self-reported healthy adults.

The cancer-related fatigue group is the most useful part of the design. It was small (18), all
women, and diagnosed with Cella's criteria at least six months into complete remission. Its
median Bell score was 35, close to that of the ME/CFS women. No men with cancer-related fatigue
were tested.

## Outcome measures

Grip strength is listed in the review guide as a measure with high risk of performance bias.
Nothing in this study reduces that risk. The paper does not report blinding: a study nurse
supervised the test, and nothing says she did not know who was a patient. Participants "were verbally motivated during the measurement", and the paper does not say that
this was standardised. There is no check on effort, such as the consistency of the force curve
or electrical stimulation of the muscle.

Patients also have good reason to hold back. People with ME/CFS learn that exertion costs them
later. A second set of ten maximal pulls, an hour after the first, is exactly the situation
where a patient might spare themselves. That would lower Fmean in the second session and the
Recovery Ratio, which are the measures the paper rates best. This is not a claim that patients
did not try. It is that the test cannot tell reduced capacity from reduced willingness to spend
it, and both are plausible in this illness.

The Fatigue Ratio (Fmax/Fmean) is not a direct measure of decline. It rises whenever one pull
stands out from the rest, in any order. In the raw data the patients' pulls do decline: in women
with ME/CFS the median fall was 3.2% of their mean per pull, against 1.1% in healthy women, and
44 of 61 had their strongest pull in the first two attempts, against 20 of 36 controls. But
their pulls also scatter more around that trend (median 10% of their mean, against 4.5%).
Muscle fatigue fits both patterns. So does variable effort.

The Recovery Ratio is measured after 60 minutes. PEM typically begins hours to days after
exertion. A lower Recovery Ratio at one hour shows slow short-term recovery, or less effort in
the second round. It is not a measurement of PEM.

The PEM score cites a brief questionnaire by Cotler et al.: the PEM items of the DePaul Symptom
Questionnaire (DSQ-PEM). The paper scores it from 0 to 46. The
cited paper describes items rated 0 to 4 for frequency and severity, plus yes/no and duration
items, and gives no total score, so how the 0 to 46 score was built is not stated. The items ask
about the past six months. The score therefore describes how much PEM a person usually has, not
whether they were in PEM on the test day, which was not recorded.

The CK and LDH samples were drawn only after the second grip session. With no sample before the
test, these values cannot say anything about the effect of exertion, despite the heading
"Correlation of HGS [hand grip strength] with CK and LDH post exertion".

The Chalder Fatigue Scale showed no correlation with any grip measure. The authors set this
aside because the scale is "a questionnaire focusing mostly on mental fatigue". The scale's
developers describe it as measuring two factors, physical and mental fatigue. A more likely reason is a ceiling effect: the median
score was 27.5 of 33 in women and 27 in men.

## Bias

The authors run a large ME/CFS clinic and research programme, and the discussion leans toward
their vascular explanation of muscle fatigue (impaired blood flow from adrenergic receptor
dysfunction). The correlation with vasomotor symptoms is introduced as "Strikingly". That
interest is open and normal for a research group. It shows mainly in how the correlations are
interpreted, covered below. The study was funded by the Weidenhammer Zöbele foundation, and the
authors declare no competing interests.

The more important bias is the one discussed under outcome measures: no reported blinding and
verbal encouragement on an effort-dependent test, in a group that has reasons to hold back.

## Statistical and methodological issues

**Many correlations, few hits.** Table S1 reports correlations between 7 grip measures and 10
clinical variables, separately in women and men: 140 tests. By my count 26 have p below 0.05,
against about 7 expected by chance. So there is some signal, mainly with the Bell score and the
vasomotor items of COMPASS-31 (an autonomic symptom questionnaire). The main text shows only
the significant ones (Table 4). The authors say that "due to multiple testing p-values are
considered descriptive", but the abstract and conclusions treat them as findings. Whether
Pearson or Spearman was used is chosen per test, sometimes differently for the same pair of
variables in women and men.

**PEM correlations are weak.** Only 35 women and 35 men had a PEM score, out of 61 and 44 (36
of each in the raw data).
The paper does not explain the missing data. Of 14 correlations between PEM and grip measures,
3 reach p below 0.05: Fmean in the second session in women (r = −0.334, p = 0.0499), and the
second-session Fatigue Ratio in women (r = 0.404) and men (r = 0.34, p = 0.0457). The same
Fatigue Ratio in the first session shows nothing (r = 0.18 and 0.04). In the raw data the PEM
score also correlates with the Bell score (Spearman −0.51 in women, −0.44 in men). So any link
between grip and PEM may simply be a link with overall severity.

**The vasomotor finding rests on a mostly-zero variable.** The median COMPASS vasomotor score was
0 in both sexes. Supplementary Figure S1 shows most men at 0 and a small group between about 1.7 and 5. A
correlation of −0.63 here is closer to a comparison of two small groups than a dose-response
relationship.

**The diagnostic cutoffs are fitted to the data they are tested on.** The headline accuracy
(Table 5) comes from the 20 to 39 age band only: 20 women and 19 men with ME/CFS against 16 and
17 controls. The best cutoffs, 19.95 kg for women and 28.76 kg for men, sit just below the
weakest control in each group (20.03 kg and 28.79 kg in the raw data). A specificity of 100% is
therefore built in. With no separate validation sample, these figures will be optimistic. Table
S2, for ages 40 to 59, reports sensitivity and area under the curve but no specificity. From the
raw data, its cutoffs classify 17 of 18 control women and 9 of 10 control men correctly.

**Against the comparison that matters, the test does not discriminate.** A clinician does not need
to tell ME/CFS from health. They need to tell it from other causes of fatigue. The cancer-related
fatigue group was left out of the diagnostic analysis. In the raw data, women with ME/CFS and
women with cancer-related fatigue do not differ on any grip measure. For second-session Fmean, the
area under the curve between them is 0.56, close to the 0.5 of a coin toss. Of the 18 women with
cancer-related fatigue, 15 fall below the 19.95 kg cutoff and would be classed as ME/CFS. The
authors acknowledge the non-specificity in the discussion ("Our findings are, however, not
specific for ME/CFS"), but it is absent from the abstract and the conclusion.

**Reproducibility.** The raw data reproduce the female means in Table 3 closely. For men with
ME/CFS, the raw data give Fmean values of 25.5 and 23.7 kg against 26.3 and 24.5 kg in the
table, and Table 3 itself gives Fmax1 as both 31.2 and 32.2 kg. These differences are small and
change no conclusion. The Recovery Ratio is not uniformly low in patients: 14 of 61 women and 13
of 44 men with ME/CFS were stronger in the second session than the first.

**The quadriceps side study** used 8 people per group. The methods describe a 20-minute protocol
of repeated submaximal contractions with a maximal contraction every 5 minutes; the results call
these "five consecutive QS [quadriceps strength] measurements". The difference in the Fatigue Ratio was not
significant (p = 0.1171). It is a pilot, and should be read as one.

## Biological plausibility

Lower grip strength in ME/CFS agrees with earlier studies the authors cite (Nacul et al., Meeus
et al., Neu et al., Jammes et al.). A faster loss of force with repeated effort is consistent
with patient reports. The open question is not whether patients are weaker on this test, but
why. Deconditioning, pain, effort regulation, and a muscle or blood-flow abnormality would all
produce the same numbers. The cancer-related fatigue group, similarly disabled and with the same
results, fits best with something shared by fatiguing illnesses in general.

The LDH interpretation goes further than the data. The authors read higher LDH as a sign of
"preferential energy production via glycolysis". Serum LDH is mainly a marker of tissue damage,
and with no sample before the test there is nothing to compare the values with.

If the grip deficit were a marker of PEM, one would expect it to grow in the 24 to 72 hours
after exertion and to differ between a patient's good and bad days. Neither was tested.

## Interpretation and spin

The abstract concludes: "Repeat HGS assessment is a sensitive diagnostic test to assess muscular
fatigue and fatigability and an objective measure to assess disease severity in ME/CFS." The test
is sensitive against healthy controls. It is not specific: the paper's own disease control
scored the same. An objective measure of disease severity would need more than correlations of
about 0.27 to 0.40 with a disability score.

The discussion says the Bell score correlations indicate "a causal relation of muscular strength
to severity of the disease". A cross-sectional correlation cannot show that, and reverse
causation (sicker people move less and lose strength) is at least as likely.

It also says the PEM correlations provide "evidence that HGS is an objective marker to assess the
severity of PEM". Three of 14 correlations, the strongest 0.40, against a six-month recall
questionnaire with a third of the data missing, do not support that.

The conclusion lists "the low risk of causing PEM" as an advantage. PEM after the test was not
measured.

The conclusion also recommends use "in both primary care and research". Primary care is exactly
where ME/CFS must be told apart from other fatiguing illness, which is what this test failed to
do in the paper's own data.

To their credit, the authors state the non-specificity and the inactivity limitation in the
discussion, and recommend a physically inactive, age-matched control group.

## What this demonstrates

In patients with carefully diagnosed ME/CFS at a specialist clinic, mean grip force in the first
session was 57% of that of self-reported healthy adults in women and 63% in men. Force fell more across
ten pulls and was lower after an hour's rest. Women with cancer-related fatigue showed the same
pattern. Grip measures correlated weakly with disability and, less consistently, with a PEM
questionnaire.

It does not show that grip testing can diagnose ME/CFS in a clinic, where the question is
ME/CFS versus other fatiguing illness. It does not show that grip strength measures PEM, since
PEM was neither provoked and measured nor recorded on the test day. It does not show that
grip strength can track PEM or illness over time, since each person was tested once and there
are no test-retest data. And it cannot separate reduced muscle capacity from deconditioning or
from reduced effort.

## Critical missing elements

- A control group of sedentary or deconditioned people, and other fatiguing illnesses such as
  depression or multiple sclerosis.
- Staff blind to diagnosis, standardised encouragement, and an effort check.
- Grip measured again 24 to 72 hours after the test, alongside symptom ratings, to see whether
  it tracks actual PEM.
- Test-retest data in patients, with the smallest detectable change, before using the test to
  follow anyone over time.
- Cutoffs validated in a separate sample.
- CK and LDH before as well as after the test.
- An explanation of the missing PEM scores and how the 0 to 46 score was built.

## Context beyond the paper

A 2026 study at the Munich Chronic Fatigue Center for Young People, co-authored by two of this
paper's authors, used the same two-session protocol in 147 young people referred for suspected
ME/CFS and 83 healthy controls. Patients were weaker than controls. But no grip measure
significantly separated the 84 who were classified as ME/CFS from the 63 who were not, and grip
measures did not correlate with PEM duration. Its abstract concludes that grip testing "alone
shows limited ability to discriminate ME/CFS from other fatiguing noME/CFS [not ME/CFS] conditions". That is
what the cancer-related fatigue data in this paper already suggested.

## Recommendations

**For clinicians:** repeated grip testing can document reduced strength and fatigability, and it
is cheap. It should not be used to make or rule out a diagnosis of ME/CFS, and a low score does
not show that a patient is in PEM.

**For researchers:** if grip strength is used as an outcome, treat it as effort-dependent. Blind
the assessor, standardise encouragement, and include an inactive control group. To test the idea
that it tracks PEM, measure it before and 24 to 72 hours after a standard exertion, with symptom
ratings at the same points.

**For patients and advocates:** if this paper is offered as evidence for an objective PEM test,
note what it shows: ME/CFS patients were weaker and tired faster on a hand-grip test, and so
did patients with cancer-related fatigue.

## Final assessment

What prevents a higher score: the paper's two headline claims, that repeat grip testing is a
sensitive diagnostic test and an objective marker of PEM severity, are not supported by the
design. Diagnostic accuracy was tested only against healthy people, with cutoffs fitted to small
groups and not validated. The paper's own disease control group could not be told apart from
ME/CFS. The PEM link rests on a few weak correlations among 140, with a third of PEM scores
missing and no measurement of PEM after the test. The test is effort-dependent with no reported
blinding, and the controls' activity was not recorded, so muscle fatigue cannot be separated from
deconditioning or effort.

What prevents a lower score: the descriptive finding is real and large. Patients were diagnosed
carefully, with PEM required. The authors included a second fatiguing illness and reported that
the findings were not specific. They published raw data for every participant, which let me
check their numbers and run the comparison they left out. The test is simple and well described,
and the limitation about inactivity is stated.

The paper is a sound description of grip weakness and fatigability in a well-defined ME/CFS group.
As evidence that grip strength can diagnose ME/CFS or measure PEM, it falls into the band where
the design cannot separate the claimed effect from other explanations.

## Executive summary

This study tested hand grip strength in 105 people with ME/CFS, 18 women recovering from cancer
with lasting fatigue, and 66 healthy adults. Each person squeezed a grip meter ten times, rested
an hour, and did it again.

People with ME/CFS were much weaker than healthy people, their strength dropped more across the
ten squeezes, and it was lower after the hour's rest. But the women with cancer-related fatigue
showed the same results. When I re-analysed the published raw data, the grip test could not tell
women with ME/CFS from women with cancer-related fatigue. That is the comparison a doctor would
actually need to make.

The paper calls the test "a sensitive diagnostic test" and an "objective marker to assess the
severity" of post-exertional malaise (PEM, the worsening of symptoms after exertion). Neither
claim holds up. The accuracy figures compare patients only with healthy people, use cutoffs fitted
to the same small groups, and were not checked in new people. The link with PEM rests on a few
weak correlations with a questionnaire about the past six months. PEM was not measured after the
test, and nobody was followed up, so the paper says nothing about tracking PEM over time.

Grip strength also depends on effort. The paper does not say staff were blind to who was a
patient, and they encouraged participants aloud. Patients may reasonably hold back to avoid a crash. The healthy controls' activity levels
were not recorded. So the test cannot tell weaker muscles from deconditioning or from held-back
effort.

The study is useful as a careful description of grip weakness in a well-diagnosed group, and the
authors deserve credit for publishing their raw data. It is not evidence for a diagnostic test or
a measure of PEM.

Grade: 4.5 / 10.
