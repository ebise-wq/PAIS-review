---
title: "Revised estimates of types and duration of long COVID symptoms based on claims records from 245 million US patients"
authors: "Nilforoshan H, Reisler J, Jahanparast E, Moor M, Goodman SN, Wager S, Leskovec J"
journal: "Proceedings of the National Academy of Sciences"
year: 2026
doi: "10.1073/pnas.2604414123"
conditions: ["Long Covid", "ME/CFS", "POTS/OI"]
studyType: "Retrospective insurance claims cohort, 2.8 million test-positive and 14.2 million test-negative people, 2 years of follow-up"
design: observational
topics: ["epidemiology", "course-outcomes", "meta-research"]
kind: paper
reviewedOn: 2026-11-06
guideVersion: "0.10.2"
draft: true
model: "claude-opus-5-5"
effort: "medium"
read:
  - "Full text, from the PubMed Central open-access copy (PMC13732191), with the publisher's PDF"
  - "Figures 1 to 4, viewed as images"
  - "Supplementary appendix (429 pages): extended methods, Tables S1 to S9 and figure captions read as text; Figures S7, S33 and S35 viewed as images (the values in S33 and S35 were too small to read)"
  - "CDC 2022 Nationwide Blood Donor Seroprevalence Survey data: https://data.cdc.gov/api/views/ar8q-3jhn/rows.csv?accessType=DOWNLOAD"
  - "Emerging Infectious Diseases article on blood donor seroprevalence in Japan, 2022, fetched for its US references: https://wwwnc.cdc.gov/eid/article/29/9/23-0365_article"
  - "Web search for published responses to the paper; none found"
  - "The analysis code on GitHub was not opened: access from this session was refused"
score: 5.5
verdict: "Comparing people who tested positive with people who tested negative removes a real bias in earlier Long Covid studies, but the method averages over everyone infected, uses insurance codes that barely capture Long Covid, and its control group was increasingly infected over time, so it cannot show that Long Covid symptoms fade within a year."
confidence: "moderate"
importance: "high"
strengths:
  - "Huge dataset, both designs run on the same data"
  - "Shows clearly that the usual comparison is biased"
  - "Uses outcomes COVID cannot cause to measure bias"
  - "Analysis code published"
weaknesses:
  - "Averages over all infected, hiding a sick minority"
  - "Many controls were infected later, mostly unrecorded"
  - "Insurance codes miss fatigue, exertion intolerance"
  - "Hospitalised and mild cases are not separated"
context:
  - note: "Blood donor surveys by the US Centers for Disease Control and Prevention estimate that 48.8% of US donors aged 16 and over had antibodies from past infection in the first quarter of 2022, and 77.5% in the fourth quarter. The study's second-year window ran from late February 2021 to February 2023, so most of the test-negative controls had probably been infected by its end, while only 20.2% had a recorded positive test."
    source: "https://data.cdc.gov/api/views/ar8q-3jhn/rows.csv?accessType=DOWNLOAD"
guideNotes:
  - "Population-average effects: a risk ratio averaged over everyone infected can sit near 1 even when a minority is badly affected; reviews of claims and records studies should check whether the estimand can detect a minority syndrome."
  - "Code lists: check that outcome labels match their codes (here, 'post-exertional fatigue' is an overexertion injury code and 'brain fog' is mostly dementia, coma and procedure codes)."
  - "Control contamination over time in infection cohorts: compare recorded infections in controls with seroprevalence for the same period."
---

## Study design

This is a retrospective cohort study in US insurance claims from Komodo Health, a commercial
database that pools claims from insurers, clearinghouses, pharmacies, Medicare and Medicaid.
The authors used 14.4 billion claims from 244.7 million people.

The paper compares two ways of picking a control group.

- The **unrestricted control design** copies earlier large records studies, such as Al-Aly and
  colleagues' studies in the US Department of Veterans Affairs (VA) records. People with a
  recorded COVID-19 diagnosis between 1 March 2020 and 1 March 2021 (10.1 million) are compared
  with people from a random sample with no recorded COVID-19 diagnosis (17.7 million).
- The **test-based control design** (the primary analysis) enrols people at their first
  polymerase chain reaction (PCR) test for COVID-19 in the same period. People with a positive
  result within 7 days (2.83 million) are compared with people whose first test was negative,
  down-sampled to five per case on each enrolment day (14.2 million).

In both designs, controls were reweighted so that their average demographics and their
month-by-month record of each of the 614 outcomes (whether any claim occurred that month) and of
healthcare use over the previous 4 years matched the cases. This is
a synthetic-control style weighting, not one-to-one matching. Everyone had to be alive 30 days
after enrolment. Outcomes were then compared in three windows: days 30 to 119, 120 to 359 and
360 to 719.

A third analysis is a "placebo" version of the unrestricted design. People who tested negative
and were never diagnosed with COVID-19 are compared with untested people. A negative test cannot
cause illness, so any excess in the tested group measures the bias that comes with being tested.

The main result is a count. An outcome counts as caused by COVID-19 if its risk ratio is at
least 1.1 and it passes a Bonferroni-corrected significance test. The test-based design finds
43, 5 and 0 such outcomes in the three windows. The unrestricted design finds 262, 286 and 369.

There was no registered protocol or analysis plan. The analysis code is said to be public on
GitHub; I did not check it.

## Sample selection

**Infection.** Cases had a PCR test followed by a COVID-19 diagnosis code (U07.1, or B97.29
before April 2020) within 7 days.
By the guide's ranking this is the best kind of confirmation. Controls are weaker: a negative
first PCR test in a healthcare setting, with no COVID-19 code in the next 7 days. Nothing stops
a control from being infected later (see below).

**What the cohort is.** Only people who were PCR-tested through the healthcare system between
March 2020 and March 2021 are included. That is before vaccines were widely available and before
the Delta and Omicron variants. 16% of the test-based cohort were under 18 (Table S2). The paper
reports no split by hospitalisation, by severity of the acute illness, by age group for the main
results, or by later vaccination. The guide asks for hospitalisation status above all, and here
it is missing.

The outcomes that top the list in Figure 2 suggest that severe acute illness drives much of the
early-window signal: pneumonia, respiratory failure, pneumothorax, shock, cardiogenic shock,
septicemia, postprocedural respiratory complications and myopathy (risk ratio 3.1). These are
typical after hospital or intensive care treatment. 1.2% of test-positive people died within
30 days, against 0.62% of test-negative people. The paper does not show what the results look
like for people who were never admitted, who are the main Long Covid population.

**Who the controls are.** In 2020, a PCR test in a healthcare setting usually meant symptoms, a
hospital admission, or screening before a procedure. People who tested negative were therefore
often at a healthcare visit for some other reason. The paper's own placebo analysis shows how
different they are: compared with untested people with the same history, 82.5% of outcomes had a
risk ratio of at least 1.1 in the 30 to 119 days after a negative test. The authors grant that
these controls "may have illnesses with long-term consequences", which biases the comparison
towards finding no effect. Reweighting on 4 years of claims history balances chronic conditions.
It cannot balance the acute reason for the visit that led to the test.

**ME/CFS, postural orthostatic tachycardia syndrome and mast cell activation syndrome.** None of these is examined as such. ME/CFS sits inside the
"fatigue" outcome, whose codes are G93.3 (postviral fatigue syndrome) and R53.82 and R53.83
(chronic and other fatigue). The postural orthostatic tachycardia syndrome (POTS) code G90.A sits
inside "dysautonomia". There is no mast cell activation syndrome (MCAS) outcome. G90.A only came
into use in October 2022, and ME/CFS moved to the new code G93.32 at the same time. Table S9 lists
codes in full, and lists G93.31, G93.32 and G93.39 under "other nervous system disorders", not
under "fatigue", whose codes are only G93.3, R53.82 and R53.83. So from October 2022, an ME/CFS
diagnosis probably no longer counts as fatigue. This affects at most the last few months of the second-year
window, so it is a small point.

**Contamination of controls.** The authors kept controls who later tested positive, to avoid
using future information. That is a sound choice for the bias they care about, but it makes the
late windows hard to read. By the authors' count, 4.2% of controls had a recorded positive test by
day 119, 10.1% by day 359 and 20.2% by 2 years (Figure S7). Recorded tests are only part of the
story. Blood donor surveys by the US Centers for Disease Control and Prevention (CDC) estimate that 48.8% of US donors aged 16 and over had antibodies
from past infection in early 2022, and 77.5% by the end of 2022. The second-year window ran
from late February 2021 to February 2023, through the Omicron waves, when home tests that leave no
claim were common. By the end of that window most controls had probably been infected. The
authors call this a source of "conservative effect estimates". For the claim that matters most,
that nothing is attributable after a year, it is close to a comparison of infected people with
mostly infected people.

## Outcome measures

All outcomes are diagnosis codes on insurance claims, grouped into 614 categories, mostly from
the Clinical Classifications Software Refined (CCSR), a standard grouping of diagnosis codes.
On the guide's scale they are not patient-reported, but they are not objective either. A claim
appears only if a person seeks care, a clinician records a code, and the visit is billed. This
matters for Long Covid in three ways.

1. **The core symptoms are badly coded.** Post-exertional malaise has no diagnosis code. Fatigue,
   cognitive problems and orthostatic intolerance are often recorded as something vague or not at
   all. People with Long Covid often stop seeking care when it does not help, or are too ill to
   attend. A claims study can see what clinicians code, not what patients have.
2. **Some outcome labels do not match their codes.** In Table S9, "Post exertional fatigue" is
   T73.3, which is "exhaustion due to excessive exertion", an injury code for overexertion. It is
   not post-exertional malaise. "Brain fog cognitive deficit" is made of dementia codes (F01.5
   and onwards, F02, F03), delirium (F05), Alzheimer's and other degenerative disease (G30, G31),
   and coma and stupor codes (R40). Most of its entries are seven-character codes such as F0100EZ,
   which as far as I can tell are procedure codes for rehabilitation and function assessments, not
   diagnoses. It does not include the codes a clinician would use for poor
   concentration or memory. The main text does not lean on these two outcomes, but the
   supplementary figures present them under these names, and readers may take a null result for
   "post-exertional fatigue" or "brain fog" at face value.
3. **The "risk ratio" is a ratio of claim counts.** The outcome for each person is the number of
   claims in the window (Methods M3), not whether they had the condition. A few people with many
   claims weigh heavily. The paper calls this a risk ratio throughout.

Using outcomes that COVID-19 cannot plausibly cause (49 "negative control outcomes", such as
firearm injuries and congenital conditions in adults) is a good feature. The detection of known
acute COVID-19 symptoms in the first 30 days (Figure S6) is a reasonable sign that the data and
design can pick up real effects when they are large and common.

## Bias

**The bias the paper is about.** The paper makes a strong case that, in these data, the
unrestricted design is badly biased. Three findings point the same way.

- Under the unrestricted design, 53.1% of the negative control outcomes came out as "caused" by
  COVID-19 (risk ratio at least 1.1 and P below 0.05, without correction). The paper's example is
  a 76% higher rate of "lightning, drowning, submersion, electrocution, vibration" injuries in
  days 30 to 119 (Figure 3). Under the test-based design, the rate was 4.1%, and those were
  reductions rather than increases.
- In the placebo analysis, the excess risks after a negative test correlate with the excess risks
  attributed to COVID-19 by the unrestricted design (Spearman correlation 0.48).
- The number of outcomes "caused" by COVID-19 under the unrestricted design rises over time,
  from 262 to 286 to 369 (Figure 1B). A real effect of infection would not usually grow with
  time since infection. A selection effect could: the untested controls come from a sample
  defined as having no recorded COVID-19 diagnosis up to April 2023. People who went 3 years,
  through several large waves, without a COVID-19 diagnosis are likely to include many with
  less contact with care, although the sample did include people who were tested or
  vaccinated. The authors themselves note that defining controls by future
  information causes bias.

That last point cuts both ways. It supports the claim that this unrestricted design is biased.
But it also suggests this version may be more biased than some of the published studies it is
meant to stand for. The paper says it modelled its unrestricted cohorts on Al-Aly and colleagues'
2021 study, but it does not set its unrestricted estimates beside theirs. So "most long-term
effects attributed to COVID-19 by unrestricted control designs likely reflect bias" is shown for
the authors' own version, and only argued for the published studies.

**Bias in the test-based design.** Its biases run mostly towards finding nothing, and they grow
with time:

- controls tested for another reason, with their own later illness (collider bias, which the
  authors acknowledge);
- controls infected later, mostly without a record (above);
- deaths in the first 30 days, which remove the sickest cases (small here, as the authors say).

The negative control outcomes do not test the first two of these. Injuries and congenital
conditions are good probes of care-seeking bias. They are not good probes of whether the
test-negative group had a different post-acute illness of its own, or later got COVID-19.
So the low false-positive rate in the test-based design does not show that its estimates are
unbiased, only that they are not inflated by care-seeking.

**Author and funding.** The authors are computer scientists, statisticians and epidemiologists,
mostly at Stanford, with one at the University of California, Berkeley and one also at ETH Zurich. Funding was from the US National Science Foundation, Stanford institutes and a list of
companies that support the lab generally. They declare no competing interests. I found nothing
that suggests a stake in the result. The framing, as a correction of "high profile prior reports",
does show a clear view of where the field went wrong, which shapes how the results are presented
(see below).

## Statistical and methodological issues

**What the risk ratio averages over.** Every estimate is an average over all 2.8 million people
who tested positive. Long Covid affects a minority of infected people. Suppose 5% of infected
people develop Long Covid, and Long Covid doubles their rate of fatigue claims. The risk ratio
for fatigue across everyone infected is then about 1.05. If, in the second year, 30% of controls
had also been infected with the same 5% risk, the ratio falls to about 1.03. Both are below the
paper's cut-off of 1.1. So a result of "no outcome with a risk ratio above 1.1 after one year" is
what one would expect even if a minority stayed ill for years. The design measures whether the
average infected person makes more claims than the average test-negative person. It does not
measure whether some infected people stay ill.

The paper half-says this: "there may be undetected small effects", and "small effects can still be
meaningful from clinical or public health perspectives for common or severe outcomes". But it
does not connect it to the question in its title, which is about the duration of Long Covid
symptoms.

**The threshold.** The cut-off is a risk ratio of at least 1.1 plus Bonferroni-corrected
significance across 614 outcomes. The Figure 2 caption says the shown outcomes also have a
Bonferroni-corrected confidence interval above 1.1, which is stricter than the main text's rule.
Which rule made the 43, 5 and 0 is not fully clear. Either way, a count of outcomes crossing a
threshold is a crude summary. It depends on the threshold and on sample size, and the two designs
differ in size (about 17 million people in the test-based design, about 28 million in the
unrestricted one). A plot of the full spread of risk ratios in each window, or an estimate of
what share of cases had any excess claims, would say more.

**Figure 4.** The paper says "the average health of COVID-19 cases returns to baseline within 1 y
after infection". For four of the five outcomes shown, the risk ratio is near 1 from about
day 240. Myopathy stays above 1 through much of the second year, with points between about 1.02
and 1.17. The 2-year aggregate window falls below the cut-off, but the curve does not show a
clean return to baseline for this outcome.

**Robustness.** Results were checked against patient-linkage errors (Figure S8) and split
enrolment periods (Figure S12). The unrestricted design was also checked in high- and
low-incidence areas (Figure S14). These are useful.
There is no analysis that censors controls at a later positive test, or that weights for it, and
no analysis restricted to people not admitted to hospital. Those two would speak most directly to
the late-window claim.

## Biological plausibility

The early-window findings fit what is known. Myopathy after severe illness, hair loss
(a delayed shedding after fever or illness), blood clots, lung damage and fatigue in the first
months after COVID-19 are all well described. The peak of hair loss at days 90 to 119
(Figure 4) matches the usual 2 to 3 month delay of shedding after illness. This supports the
claim that the design picks up real effects when they are common enough.

The absence of late effects is less informative. Long Covid in non-hospitalised people is
dominated by fatigue, post-exertional malaise, cognitive problems and orthostatic intolerance.
These are exactly the features that claims capture worst, in a minority of those infected, in a
control group that was itself being infected. A null here is not evidence against a persistent
syndrome in a subgroup.

## Interpretation and spin

The abstract's last line is careful: "This study does not indicate that symptoms beyond one year
are not genuine but that their attributability to COVID-19 is uncertain." The Discussion repeats
it. That is fair, and to the authors' credit.

Other wording goes further than the data.

- The title promises "revised estimates of types and duration of long COVID symptoms". The study
  estimates excess claims averaged over everyone infected, not the type or duration of symptoms
  in people with Long Covid.
- The Significance statement says the outcomes attributable to COVID-19 are "substantially
  smaller and shorter than in high profile prior reports". Shorter is the claim most exposed to
  dilution, threshold and contamination.
- The Discussion says Long Covid "may have fewer symptoms—and ones of shorter duration and lower
  overall severity—than previously thought". Severity was not measured.
- RECOVER is the US National Institutes of Health Long Covid study. The paper says 43 outcomes
  at 30 to 119 days is "similar to RECOVER's identification of 37 symptoms at 6 mo". RECOVER used
  self-reported symptoms, a prospective cohort and a different threshold. The two counts measure
  different things, and their closeness means little.
- "Downward trends indicate population-level recovery from COVID-19 by the end of the first
  year". Population level is the right qualifier. It is easily dropped in retelling.

The negative control result and the placebo analysis are reported plainly and are the paper's
best evidence. The paper's main methodological claim is stated a little more strongly than shown
("we find that most long-term effects attributed to COVID-19 by unrestricted control designs
likely reflect bias"), for the reason given under Bias.

## What this demonstrates

It shows, convincingly, that in a large US claims database, comparing people with a COVID-19
diagnosis to untested people produces many false associations. People who get tested differ
from people who do not, in ways 4 years of claims history do not remove. Studies that use this
design, including the high-dimensional VA studies, deserve more caution than they have had.

It shows that, among people PCR-tested in healthcare settings in 2020 and early 2021, a positive
test was followed by more claims for respiratory, clotting, muscle, hair, heart and fatigue
outcomes in the first 4 months, and by a few of these up to a year.

It does not show that Long Covid symptoms resolve within a year. It does not show that late
effects found in earlier studies were all bias. It says nothing specific about ME/CFS,
post-exertional malaise, POTS or MCAS after COVID-19, because these are either not coded or are
buried in broad categories.

## Critical missing elements

- Results split by hospitalisation and by severity of the acute illness.
- A sensitivity analysis that censors or reweights controls at a later recorded positive test,
  and a discussion of unrecorded infections using seroprevalence data.
- An estimand that can detect a minority: for example the share of cases with new, persistent
  claims for fatigue, dysautonomia or cognitive codes, compared with controls.
- The full distribution of risk ratios in each window, not just the count above a cut-off.
- A direct comparison of the paper's unrestricted estimates with the published VA estimates it is
  modelled on.
- Correct labels, or corrected code lists, for "post-exertional fatigue" and "brain fog".
- Reasons for testing, where claims allow (pre-procedure screening against symptomatic testing).

## Recommendations

**For readers.** Take this as strong evidence that the untested-control design inflates the
number of conditions linked to COVID-19. Do not take it as evidence that Long Covid lasts less
than a year, or that people still ill years later are ill for some other reason. The design could
not have detected a persistent syndrome in a minority of those infected.

**For researchers.** Test-negative controls are a useful tool, but in long follow-up they need
handling of later infection, and the reason for testing matters. Pair claims data with measures
that capture the core of Long Covid: a validated symptom questionnaire, function, and work
status. Report results for non-hospitalised people separately. Report estimands at the person
level, not only population-average ratios.

**For the authors.** Run the analyses listed above, and fix the labels in Table S9. Tone the
title and Significance statement to match the abstract's last sentence.

## Final assessment

The paper's core contribution is real. It runs two designs on the same very large dataset, uses
outcomes COVID-19 cannot cause to measure bias, and adds a placebo exposure. Together these show
that the common untested-control design produces many spurious associations. That alone matters
for how the large records literature on Long Covid is read.

The headline claim about Long Covid itself is weaker than stated. The design estimates an average
over all infected people, with a cut-off that a syndrome affecting a few percent could not cross.
Its controls were tested for other reasons, and were increasingly infected over the follow-up,
mostly without a record. Its outcomes are insurance codes that barely capture fatigue,
post-exertional malaise, cognitive problems or orthostatic intolerance, and two outcome labels
do not match their codes. Hospitalised and mild cases are mixed. Each of these pushes towards
finding nothing late, which is what was found.

What prevents a higher score: the claims about duration rest on a design that is structurally
unable to detect a persistent minority syndrome, and the paper does not run the analyses that
would test this (censoring at reinfection, splitting by hospitalisation, person-level estimates).
The generalisation to published unrestricted studies is argued, not shown.

What prevents a lower score: the analysis is large, transparent and careful within its frame, the
bias it targets is real and well demonstrated, the early findings are plausible, and the abstract
does state the key caveat about symptoms beyond a year. The design question it raises is
important and its answer to that question holds.

Confidence is moderate. I read the supplement's methods and tables, but many supplementary
figures were too small to read values from, and I did not check the analysis code.

## Executive summary

This study used insurance claims for 244.7 million Americans. It compared people with a positive
COVID-19 test from March 2020 to March 2021 with people who also had a test that year but tested
negative. Earlier large studies compared infected people with people who had never been
diagnosed, many of whom had never been tested.

The study shows well that the older comparison is biased. People who get tested are sicker in
other ways. Under the older comparison, COVID-19 seemed to raise the risk of things it cannot
cause, like lightning injuries and firearm injuries. Under the new comparison, it did not.

The study then says that, with the better comparison, few conditions are linked to COVID-19
after 4 months, and none after a year. That claim is much weaker. The method averages over
everyone infected, so a group of a few percent who stay ill would barely move the average. Many
people in the comparison group caught COVID-19 later, most without a record, so by the second
year the comparison was close to infected against infected. Insurance codes capture little of
what defines Long Covid, such as exhaustion after effort, brain fog and dizziness on standing,
and two outcomes are mislabelled. Hospitalised and mild cases were not separated.

So the paper is a useful warning about earlier studies. It is not evidence that Long Covid goes
away within a year.

Grade: 5.5 / 10.
