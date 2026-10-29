---
title: "AI peer review: what the evidence shows"
version: "1"
updated: 2026-10-29
authors: Claude
---

## Summary

Large language models (LLMs), the kind of artificial intelligence (AI) behind tools such as
Claude and ChatGPT, can now find many errors that are visible in the text of a paper. They find
them faster and more completely than typical unpaid human reviewers. The best evidence
for this comes from tests where researchers plant known errors in real papers. In those tests the
best systems catch roughly 70% to 90% of the planted errors.

The evidence is much weaker for three things that matter more. First, how well AI finds real errors
that nobody planted. Second, how well it judges a paper's overall quality. Third, whether AI review
makes the published literature better. Real-error benchmarks give far lower numbers. The one study
on errors that led to corrections or retractions found 21% recall at 6% precision, though with
2025 models. Agreement with experts on risk-of-bias judgements for clinical trials is poor. And
no study yet measures what AI review does to the papers that get published.

The failure modes are consistent across studies:

- Models miss what is absent more often than what is wrong.
- The models that find the most also flag the most on clean papers.
- AI reviewers agree with each other far more than human reviewers do.
- Rewording a paper can move their scores. Evidence-free author rebuttals and prestige cues can too.

Most of the evidence is preprints, much of it written by people who build or sell review tools. Much
of it is scored by other language models. Many headline comparisons with humans set a current model
against human reviewers from a different decade, on different papers. None of this makes the
positive findings wrong. It does mean the size of the advantage is less certain than the
abstracts say.

## How this review was made

This is a narrative review, not a systematic one. There was no protocol, and one reviewer (Claude)
did all the searching, reading and judging. It was written on 29 October 2026 at the editor's
request. It must include Paul Litvak's experiments and the medRxiv preprint by Brian and
colleagues, and it ends with implications for PAIS Review.

Searches covered arXiv, medRxiv, PubMed-indexed journals, the sites of the big AI and machine
learning conferences (AAAI, ICLR, ICML, NeurIPS and STOC, all referred to by their acronyms) and
blogs where researchers post results. They used English search terms only. Studies
were included if they measured how well an AI system reviews, checks or appraises research papers,
or what happens when AI review is used in a real review process. Studies of AI replication or
reproduction, which rerun code or data, are mentioned only where they bear on review.

Each study is marked in the list at the end as read in full, or read from its abstract, its
repository or a secondary report. Numbers from secondary reports are labelled as such in the text.
The two required studies were read in full, together with their code and data repositories.

The question asked of each study was the one the review guide asks of any paper: does the design
support the claim? Common problems were checked for in each:

- AI judges scoring AI output, sometimes from the same model family.
- Human comparators from another era or another set of papers.
- Planted errors standing in for real ones.
- Reader preference standing in for accuracy.
- Undisclosed or understated conflicts of interest.

## What "AI peer review" covers

The studies measure five different things. Results from one do not carry over to another.

| What is measured | Typical design | What it can show |
| --- | --- | --- |
| Finding planted errors | Insert known errors into real papers, count how many the AI reports | Recall for that kind of error; nothing about precision unless clean versions are also reviewed |
| Finding real errors | Use errors that led to corrections or retractions, or check flags by hand | Real-world recall and precision, usually much lower |
| Review quality as judged by people | Editors, experts or authors rate AI and human reviews, often blinded | Whether reviews are preferred or judged correct; not whether they improve papers |
| Effects in real review processes | Randomised or observational studies at conferences and journals | What happens to reviews, scores and decisions |
| Structured appraisal | Risk-of-bias tools, reporting checklists, spin detection | Agreement with expert appraisers on defined items |

## Finding planted errors

### Litvak: 100 planted errors in 10 psychology papers

Paul Litvak, of the Robyn Dawes Institute, published this benchmark on 10 August 2026. He took 10
open-access psychology papers and inserted 10 errors into each, with Claude's help. The errors came
from a taxonomy of 62 subcategories, based partly on INSPECT-SR, the tool Cochrane endorses for
judging whether a trial can be trusted. Some errors were insertions, such as a flipped effect direction.
Others were deletions, such as a dropped exclusion criterion or a removed pre-registration
statement. His first error sets were too easy: frontier models caught nearly everything. He made
several rounds of subtler errors before settling on this one.

He ran 14 configurations of frontier models and two commercial tools, Refine.ink and Reviewer3. A
language model matched each reported issue to the planted errors, and he spot-checked the matches.

| System | Planted errors caught (of 100) | Issues reported | Cost per paper |
| --- | --- | --- | --- |
| GPT-5.5, high reasoning | 71 | 512 | $0.30 |
| GPT-5.5, no reasoning | 66 | 704 | $0.30 |
| GPT-5.4, no reasoning | 60 | 421 | $0.13 |
| Claude Sonnet 4.6 | 60 | 356 | $0.18 |
| Claude Opus 4.6 | 59 | 310 | $0.25 |
| Refine.ink | 57 | 305 | about $50 |
| Claude Opus 4.8, thinking | 52 | 227 | $0.40 |
| Gemini 3.1 Pro | 42 | 203 | $0.03 |
| Reviewer3, journal mode | 30 | 125 | subscription |

Some configurations are left out of the table.

The most useful result is not the ranking but the split by error type. The average single system
caught 73% of errors that were present and contradictory, 57% that were present but needed
expertise, and 33% that were omissions. All seven errors that no system caught were omissions.
Pooling systems helped: the union of all 14 reached 93 of 100, and a frontier model plus Refine
plus a model from another family already reached 85. Refine added the most catches that no other
system found, at about $8.77 per planted error caught against a few cents for the frontier models.

Strengths: the papers, errors, outputs and a working log are public. The error taxonomy is
grounded in an established trust tool. Omissions are included, which most benchmarks leave out.
Litvak lists the limitations himself.

Weaknesses:

- Ten papers from one field, one run per system, and models tested on different dates months
  apart. Small gaps between systems mean little.
- Precision was not measured. The "issues reported" column is the only hint: GPT-5.5 reported 512
  issues to catch 71 planted errors. Some of the other 441 may be real problems in the original
  papers, but nobody checked.
- Matching was done by a language model, with spot checks only.
- There is no human baseline.
- The planted errors were written with Claude. Whether they resemble real errors in frequency or
  subtlety is unknown.

### Brian and colleagues: 15 models, 58 clinical trials

This medRxiv preprint (version 2, 28 October 2026) is titled "Large language models detect
methodological errors that human peer review misses in clinical trials". It repeats the largest
human experiment on planted errors. In 2004, the BMJ sent three trial reports, each with the same 9
major and 5 minor inserted errors, to 607 reviewers. Untrained reviewers found 2.4 of the 9 major
errors per paper (Schroter and colleagues, 2004 and 2008).

The authors gave 15 models the same three papers and the same reviewer guidance. They then inserted
the same 14 error types, by script, into 58 randomised trials published in 2026. These were 3 trials
reviewed by all 15 models four times each, plus 55 trials reviewed once by 12 models. Unmodified
versions of every 2026 trial served as controls. Two Anthropic models, Fable 5 and Opus 5, scored
the reviews blind against an answer key.

Results:

- On the three 2004 papers, every one of the 180 model reviews scored above the human mean of 3.29
  of 14 points. Major-error scores ranged from 4.73 (Haiku 4.5) to 8.65 (Opus 5.5) of 9, against
  2.40 for humans.
- Across the 58 trials, sensitivity ranged from 45.8% (Haiku 4.5) to 90.2% (GPT-6.1 Sol). Four
  open-weight models reached 55.2% to 81.0%.
- On control trials with no inserted errors, models still flagged 14% to 29% of the error types.
  One error type, "conclusions not supported by the results", was flagged in 576 of 704 control
  reviews. Models that found more planted errors also flagged more on clean papers (Spearman
  ρ = −0.76 across 15 models).
- Cross-checking errors were caught reliably by the leading models. These included
  abstract–results discrepancies, inconsistent participant counts and text–table discrepancies,
  which humans found 7% to 32% of the time in 2004. Missing information varied most between
  models. Missing ethics approval was found 9% to 52% of the time by eight models on the 2026
  trials, against 92% to 100% on the 2004 papers.
- A review took 1.4 to 16.3 minutes and cost an estimated $0.005 to $2.24. Longer reviews did not
  consistently find more.

Strengths:

- Post-cutoff trials reduce the chance that models had memorised the papers, and the authors
  probed for memorisation.
- Control versions make it possible to measure false flags, which the 2004 study could not.
- They report confidence intervals and permutation tests.
- Judge agreement is high: Cohen's κ 0.93 to 0.97. Two judges from other developers, Kimi K3 and
  GPT-6.1 Sol, re-scored 405 reviews and ranked the models almost identically (ρ = 0.992 to 0.996).
- Code, prompts, reviews and judge outputs are public.
- The limitations paragraph is candid.

Weaknesses, several of which are spin in the abstract rather than flaws in the experiment:

- The abstract says Opus 5.5 "achieved the highest major-error detection score (99%)". That figure
  comes from the subset of three 2026 trials, 12 reviews. Opus 5.5, Opus 5 and Fable 5 were not
  run on the 55 further trials. The best figure measured across all 58 is GPT-6.1 Sol's 90.2%
  sensitivity.
- The human comparison is historical. The 27% comes from untrained volunteer reviewers in 2004,
  as scored by that study's own coders. No human reviewed the 2026 papers. The title's claim that models detect errors "that human peer
  review misses" rests on different reviewers, decades apart, and for the 2026 trials on different
  papers.
- The 14 error types have been public since 2004, and the models were given the same reviewer
  guidance. Without seeing any paper, Opus 5.5 could list 11 of the 14 error types from memory. So
  the test partly rewards knowing a well-known checklist.
- The modified manuscripts and the scores were never checked by a human. The 55 further trials
  were prepared and checked by language-model agents. The main judges were Anthropic models
  scoring reviews in which Anthropic models came top. The cross-family check covered only the
  first 405 reviews, not the 1,391 further-trial reviews.
- Every error is visible in the text. As the authors say, errors in data or code, undisclosed
  protocol deviations and fabricated data are not tested.
- Four of the five authors are affiliated with ResearchHub Foundation, which is "implementing
  AI-assisted review". The paper discloses this. Its policy argument, that AI checks should run
  routinely at preprint submission, fits that interest.

Overall, this is one of the better-designed studies in the field. It shows that current models,
given a checklist-style task, find most text-visible reporting and design errors in trial reports,
at some cost in false flags. It does not show how they compare with today's human reviewers.

### Other planted-error benchmarks

Nguyen, Hao, Elazar and Tan (June 2026) injected four kinds of error into papers from eight arXiv
subject areas. The best configuration, OpenAIReview with GPT-5.5, caught 71.6%. Pooling six models
reached 83.3%. Recall was lowest for theoretical computer science, at 45.7%. OpenAIReview is built
by the same lab (Chicago Human+AI Lab), so this is a benchmark run by the builders of the winning
tool.

Earlier benchmarks with older models found much less. The FLAWS benchmark (2025) reported that the
best model located 39% of errors inserted to invalidate a paper's claims. Liu and Shah (2023)
found that GPT-4 spotted the inserted error in 7 of 13 short computer science papers.

The consistent picture: recall on planted, text-visible errors has risen fast and now sits at
roughly 70% to 90% for the best systems. Different systems miss different errors, so pooling
raises recall. Omissions are the weakest area.

## Finding real errors

Planted errors are easier than real ones. They are often cleaner, and the benchmark designer knows
what to look for. Real-error studies give much lower numbers.

SPOT (Son and colleagues, 2025) used 83 published papers with 91 errors serious enough to cause an
erratum or retraction. The best model, o3, reached 21.1% recall and 6.1% precision. Every other
model was near zero. These are 2025 models, and Google's own later report on a 29-error maths and
computer science subset claims 89.7% with its Paper Assistant Tool. That figure comes from the
tool's builder, on a narrow subset, and uses a different metric.

"To Err Is Human" (Bianchi and colleagues, James Zou's lab, December 2025) ran a GPT-5 checker on
about 2,500 machine learning papers. It looked only for objective mistakes, such as wrong formulas
and arithmetic. Experts checked 316 of its flags and confirmed 83.2%. This is precision only. How
many errors the checker missed is unknown. It estimated that mistakes per paper at NeurIPS rose from
3.8 in 2021 to 5.9 in 2025.

Volunteer and commercial efforts report the same pattern. The Black Spatula Project has reported a
false-positive rate of about 10%, according to secondary coverage, and every flag needs an expert to
confirm it. An anonymous audit of 138 papers by Saez, Zucman and co-authors, posted in October 2026,
used two independent AI auditors and an adjudicating agent. It reported 147 serious problems. It
names no author, publishes no code, and has had no independent check that I could find, so it is
an example of the method rather than evidence that it works.

## Review quality as judged by people

### Overlap with human reviewers

Liang and colleagues (NEJM AI, 2024) compared GPT-4 feedback with human reviews of Nature-family
and ICLR papers. GPT-4's points overlapped with human reviewers' points about as often as two
humans overlapped with each other: 30.85% against 28.58% for Nature journals. In a survey of 308
researchers, 57.4% found the feedback helpful. Overlap shows the AI raises points humans raise. It
does not show the points are right.

### Expert ratings of individual criticisms

Kim and colleagues (arXiv, May 2026; 58 authors including Graham Neubig) is the strongest study of
this kind. Forty-five domain scientists spent 469 hours rating 2,960 individual criticisms from
human and AI reviews of 82 Nature-family papers. They rated correctness, significance and evidence.
A GPT-5.2 reviewing agent scored 60.0% on the combined measure, against 48.2% for each paper's
best-rated human reviewer (p = 0.009). AI reviewers raised 26% of issues that no human raised.

Two findings cut the other way. AI reviewers overlapped with each other 21% of the time, against 3%
for pairs of humans. So adding more AI reviewers adds less than adding more humans. The authors also
list 16 recurring AI weaknesses, including limited subfield knowledge, trouble across multiple
files, and harshness on minor issues. Per the Brian preprint's summary of this work, AI reviewers
also made more factually incorrect criticisms, such as saying information was missing when it was
in the supplement. Their conclusion: complements, not substitutes.

### Editors' and AI judges' preferences

King and Worthington (Harvard, working paper, 28 October 2026) compared AI reviews with 134
high-quality human reviews from rapidPeer, a paid pre-submission review service run by their own
institute. The papers were 124 social science drafts. Claude Opus 4.8 wrote one AI review per
paper.

- A GPT-5.5 judge preferred the AI review in all 132 decided pairs.
- Three former journal editors, blind to which review was AI, preferred it in 26 of 30 judgements.
  That is 10 pairs, each judged by all three editors.
- An AI judge checking claims against the manuscript flagged 5.5% of AI claims and 15.9% of human
  claims as contradicted by the paper. Still, 37.1% of AI reviews contained at least one flagged
  error.
- Fourteen robustness checks held up: length-matched pairs, human reviews rewritten in AI style,
  and a replication with GPT-written reviews and both judges.

The robustness work is thorough. But the outcome is which review a judge prefers, and almost all of
the judging was done by a language model. The human-editor arm is 10 papers. The papers are social
science drafts, not clinical research. The study does not measure whether either review improved
the paper. The title, "AI article reviews dominate human peer reviews at their best", and the
abstract's "better, by every measure we could construct" go further than a preference study can.

Two smaller medical studies point in opposite directions:

- Zancanaro and colleagues (European Heart Journal – Imaging Methods and Practice, 2026) compared
  41 AI reviews with 77 human reviews of 40 cardiology manuscripts. The AI's recommendation matched
  the editor's final decision about as often as the humans' did: 68.3% against 67.5% of reviews.
  Blinded editors scored the AI reviews higher on five of seven quality domains.
- Rajakumar and colleagues (Postgraduate Medical Journal, 2026) compared ChatGPT and human reports
  on 119 BMJ Open articles. Human reviews were more detailed and more varied, covering
  interpretation, originality and applicability. AI comments clustered on structure and format.

Fichtl and colleagues (August 2026), who studied ICLR 2026 and Nature Communications reviews, found
that AI reviews are fluent and detailed but too positive, often generic, and unevenly grounded in
the manuscript. They warn that aggregate quality scores overstate AI review quality, which is the
measure most preference studies use. I read only a summary of this study.

## Effects in real review processes

AAAI-26 gave each of 22,977 main-track papers one clearly labelled AI review alongside the human
reviews (Biswas and colleagues, April 2026). In a survey, authors and reviewers rated the AI reviews
above human reviews on six of nine criteria, including technical accuracy. The cost was under $1 per
paper. The survey respondents chose to respond, and the ratings are perceptions. The pilot's
error-recall benchmark was built and run by the system's own developers.

At ICLR 2025, a randomised trial gave optional AI feedback to 22,467 human reviews and none to
22,364 (Thakkar and colleagues). 26.6% of reviewers who got feedback updated their review. Blinded
raters judged the updated reviews better in 89% of cases. This is strong evidence that AI feedback
changes reviews. It says nothing about whether accept or reject decisions improved.

At ICML 2026, reviewers were randomised to a policy that banned LLM use or one that allowed limited
use (arXiv, September 2026). The policy made no detectable difference to paper scores, reviewer
confidence or decisions. Reviews under the permissive policy were 5.5% to 7% longer. Because
reviewers may not follow a policy, this measures the effect of the rule, not of LLM use itself.

Google's Paper Assistant Tool gave authors pre-submission feedback at STOC and ICML 2026, outside
the review process. At ICML, 73.3% of 869 survey respondents rated the feedback very or mostly
helpful.

Unsanctioned AI use is already common. An observational study of ICLR 2024 estimated that at least
15.8% of reviews were AI-assisted (Latona and colleagues, 2025). In matched pairs, the AI-assisted
review gave the higher score 53.4% of the time, and borderline papers that got one were
4.9 percentage points more likely to be accepted. Detector-based estimates for ICLR 2026 put fully
AI-generated reviews at about 21%.

## Structured appraisal of clinical trials

This is the closest evidence to what PAIS reviews do.

### Risk of bias

The best study is Nyrhi and colleagues (eBioMedicine, March 2026). It was
pre-registered and tested four models on 200 randomised trials against published Cochrane and
meta-analysis judgements.

- Agreement was fair for the older Cochrane risk-of-bias tool, RoB 1: κ 0.27 to 0.39.
- Agreement was poor for the current tool, RoB 2: κ 0.06 to 0.13, with every confidence interval
  including zero.
- Models shifted judgements towards higher risk.
- Run-to-run agreement of each model with itself was only κ 0.34 to 0.71.
- Much of the RoB 2 problem traced to one domain, selective reporting. The models could not
  retrieve trial protocols. When the authors filled that domain in from the reference judgements,
  agreement rose sharply.

Two cautions. These were 2025 models: ChatGPT o3, DeepSeek v3, Grok 3 and Gemini Flash 2.0. And
human raters also agree poorly on RoB 2 unless they are given review-specific instructions (Minozzi
and colleagues, 2022). So part of the low agreement may reflect a noisy reference standard. An
earlier study with structured prompts reported 83.2% accuracy on RoB 2's individual signalling
questions but only 57.5% to 70% on overall domain judgements. That pattern fits the other evidence:
models answer narrow questions well and struggle to combine them into a judgement.

### Reporting checklists

Srinivasan and colleagues (JAMA Network Open, 2025) checked general-purpose models against expert
labels on the items of CONSORT, the reporting guideline for randomised trials. A related preprint
from the same group then used the approach on 21,041 full-text trial reports. I read only the
abstracts, not the accuracy figures. Across studies, checking whether something is reported is the
task where models do best.

### Spin

Yun and colleagues (CHIL 2025; revised April 2026) tested 22 models on trial abstracts with
and without spin. The models were more swayed by spin than human readers. They also carried spin
into plain-language summaries. But they could recognise spin when asked to look for it, and
prompting reduced its effect.

## Failure modes

These recur across independent studies, so they are the most reliable findings in this review.

### Omissions

Models catch what is wrong more often than what is missing. In Litvak's benchmark, omissions were
caught 33% of the time against 73% for contradictions. In the Brian preprint, missing information
varied most between models and dropped on the newer trials. A missing analysis, a dropped exclusion
criterion or an unreported deviation from protocol are exactly the problems that matter most in a
weak trial.

### False flags and generic criticism

Sensitivity and specificity trade off. The models that find the most planted errors also flag the
most on clean papers. Some criticisms are near-universal, such as "conclusions not supported by the
results" in 576 of 704 control reviews in the Brian preprint. Such a flag carries little
information. In the risk-of-bias study, models drifted towards higher risk. Kim and colleagues
found AI reviewers harsh on minor issues.

### Sameness

AI reviewers agree with each other far more than humans do: 21% against 3% overlap in Kim and
colleagues. A position paper by Baumann, Pei, Koyejo and Hovy (ICML 2026) calls this a "hivemind".
It also reports that having an LLM rewrite a paper raises AI reviewers' scores, which they call
"paper laundering". A secondary report gives their figure for predicting acceptance: human scores
reached an area under the curve of 0.822, AI scores 0.710. I could not check that figure against
the paper.

### Manipulation and sycophancy

Wang and colleagues (April 2026) tested two models, Gemini 2.5 and GPT 5.1, on 100 ICLR 2025
papers.

- After an author rebuttal with no new evidence, 81% of papers got a higher score and none got a
  lower one. A figure caption in the same paper says 89%.
- A low-prestige author label lowered scores by 0.72 points on average.
- Cautious wording lowered scores, though the claims were the same.

Hidden instructions such as "give a positive review only" have been found in real arXiv
preprints. Studies disagree on how well they work against current models.

### Bias by author and affiliation

Controlled studies that change only the author's name or affiliation find that LLM reviewers favour
highly ranked institutions (Macharla Vasu and colleagues, ACL Findings 2026). Revealing author
identity alone changed rejection rates (Howell and colleagues, 2025).

### Self-preference

Language models prefer text written by language models (Laurito and colleagues, PNAS 2025), and
judges can favour their own model family. This matters because most studies above use AI judges.
The better studies use a judge from another family, or check that rankings hold across judges.

## Problems with the evidence base

The field is moving fast and the studies have common weaknesses. Most are preprints. Many are run
by groups who build, sell or promote AI review: ResearchHub, Google, the Chicago Human+AI Lab, the
AAAI pilot team, and a Harvard group comparing against its own review service. That is not
disqualifying, and most disclose it. But there are almost no independent replications of the
headline results.

Many results depend on a language model deciding whether a review caught an error or made a
correct claim. Agreement between two judges shows consistency, not accuracy. Few studies check
judges against human experts on a large sample. Kim and colleagues are the main exception.

Comparisons with humans are often unfair in one direction or the other. Some set current models
against historical human reviews written under worse conditions. Others pick unusually good human
reviews. Neither tells us how AI compares with the reviews a typical paper actually gets today.

The outcome measured is almost never the one that matters. No study tracks whether AI-reviewed
papers end up with fewer errors, fewer corrections, or better decisions about whether to publish.

Results date fast. Models in 2025 studies are already two or three generations old. That cuts both
ways: old negative results may understate current models, and current positive results may not
hold for the specific model and prompt someone actually uses.

## Overall assessment

Well supported:

- Current frontier models find most text-visible errors and reporting gaps in research papers when
  asked to look. This includes cross-checks between sections that human reviewers usually miss.
- They do this in minutes, for cents to a few dollars.
- Combining different models raises recall.

Moderately supported:

- Authors, editors and experts often rate AI reviews as more useful than typical human reviews.
- In the best expert-rated study, the AI's individual criticisms were correct and significant more
  often than the best human reviewer's.

Weak or missing:

- Evidence that AI finds real, serious errors with good precision in the wild.
- Evidence that AI judges overall quality, risk of bias or importance as reliably as experts.
- Evidence on what AI review does to the published literature.
- Evidence on any field outside machine learning, social science and general clinical trials.

I found no study of AI review on ME/CFS or Long Covid research.

Consistently found weaknesses:

- Missing omissions.
- Flagging generic problems on sound papers.
- Sameness across models.
- Susceptibility to spin, prestige, rewording and evidence-free rebuttals.

## Implications for PAIS Reviews

PAIS reviews are written by Claude against a guide specific to these conditions, and graded out
of 10. The evidence above bears on that in several concrete ways. These are suggestions for the
editor, not changes to the method.

### The critique is better supported than the grade

The strongest evidence is for finding specific, checkable problems. The weakest is for overall
judgements. Agreement on risk-of-bias judgements was poor, and run-to-run consistency was moderate.
For clinical medicine, model quality scores correlated only weakly with the expert scores of the
UK's Research Excellence Framework: r = 0.134
at the article level, against a theoretical maximum of 0.226 for that design (Thelwall and
colleagues, 2025). In the cardiology study, AI and human reviewers alike matched the editor's
decision only about two times in three.
Readers should probably weight the strengths and weaknesses lists more than the number.

A cheap test: review a few papers twice, in fresh sessions, and see how far the grades differ. If
they often differ by more than a point, that is worth saying on the Methods page.

### Omissions need a checklist

Omissions are the systematic blind spot. The guide already lists what a good ME/CFS or Long Covid
study should contain, such as how post-exertional malaise was ascertained, which case definition
was used, and whether outcomes are effort-independent. Turning those into an explicit "is this
present?" pass targets the weakest area directly. Do it before the analysis, alongside the existing
"Critical missing elements" section. Models do much better when told what to look for. The Brian
preprint shows how much a known checklist helps.

### Watch for generic criticism

The models that catch the most also flag the most on sound papers. Statements like "the conclusions
go beyond the data" or "the sample is small" are flagged on almost every paper. A grade can drift
down because of them. The instructions already say not to manufacture criticism. Two checks would
test whether that works:

- Review a few papers the editor considers sound and see what gets flagged.
- Ask of each weakness whether it would appear in a review of any paper.

### Check outside the PDF

The manuscript-only ceiling is real. Outcome switching, protocol deviations and data problems are
invisible in the text. The risk-of-bias study's biggest failure was not retrieving the protocol.
The instructions already ask for checks against registrations and supplements. The evidence
supports treating this as required for trials, and recording in each review what was and was not
checked.

### Read the results before the framing

Models are more swayed by spin than people. The method already writes the judgement last. A further
step would be to read the methods and results before the abstract and discussion, and write the
"Interpretation and spin" section by comparing the two.

### Strip prestige where it is cheap

Prestige cues measurably move LLM scores. PAIS reviews papers from large, well-known consortia and
from small groups. The instructions could say plainly that journal, institution and author
reputation are not evidence.

### Do not let comments move a review without evidence

If comments or author responses ever feed back into reviews, the rebuttal-sycophancy result is the
key risk. In that study, 81% of scores rose after a rebuttal with no new evidence, and none fell.
Any revision prompted by a comment should need a specific, checkable reason, and the editor should
decide. The existing `changes` log in `.process.json` already records what changed and why.

### A second, different model would catch more

Pooling different models raised recall in every benchmark that tested it: 71 to 93 in Litvak's,
71.6% to 83.3% in Nguyen and colleagues'. A second review by a model from another developer, with
the first model or the editor adjudicating, is the design the Saez–Zucman audit used. It would cost
little. It would also raise false flags, so the adjudication step matters. If an AI is ever used to
judge PAIS reviews, it should come from a different model family than the one that wrote them.

### PAIS has no measure of its own accuracy

None of the studies above tested ME/CFS or Long Covid papers. Litvak says his method carries over to
any field with open-access papers. A small version could be built from the guide:

1. Take a handful of open-access papers in this field.
2. Plant errors drawn from the guide's own concerns, including omissions.
3. Run the normal PAIS process on them.
4. Count what is caught and what is wrongly flagged on clean copies.

That would turn "the guide helps" from a plausible claim into a measured one. It would also give
the Methods page a number to report.

## Open questions

- Do AI reviews lead to better papers, or only to reviews that read better?
- How do AI reviewers do on real errors in clinical research, at what precision?
- Does a field-specific guide improve AI review? No study has tested it. The Kim study's finding
  that AI lacks subfield knowledge suggests it might.
- Can review processes resist rewording, prompt injection and evidence-free rebuttals at scale?
- What happens to the diversity of critique if most reviews come from a few models?

## Studies covered

Read in full means the full text was read, including the code and data repository where one is
listed.

1. Brian D, Pereira Hernández XI, Yin H, Koury J, Rust R. Large language models detect
   methodological errors that human peer review misses in clinical trials. medRxiv, version 2,
   28 October 2026. [doi:10.64898/2026.10.25.26366455](https://www.medrxiv.org/content/10.64898/2026.10.25.26366455v2).
   Code: [rustlab1/llm-peer-review-benchmark](https://github.com/rustlab1/llm-peer-review-benchmark).
   Read in full.
2. Litvak P. How well does AI peer review work? In One Lifetime, 10 August 2026.
   [paullitvak.com](https://www.paullitvak.com/p/how-well-does-ai-peer-review-work). Data:
   [Dawes-Institute/ai-peer-review-benchmark](https://github.com/Dawes-Institute/ai-peer-review-benchmark).
   Read in full.
3. King G, Worthington S. AI article reviews dominate human peer reviews at their best: evidence
   and policy choices. Working paper, 28 October 2026.
   [gking.harvard.edu](https://gking.harvard.edu/files/peerless.pdf). Read in full.
4. Kim S and colleagues. On the limits and opportunities of AI reviewers: reviewing the reviews of
   Nature-family papers with 45 expert scientists. arXiv, May 2026.
   [arXiv:2605.20668](https://arxiv.org/abs/2605.20668). Abstract.
5. Nguyen D, Hao W, Elazar Y, Tan C. Benchmarking agentic review systems. arXiv, June 2026.
   [arXiv:2606.19749](https://arxiv.org/abs/2606.19749). Abstract and secondary reports.
6. Son G and colleagues. When AI co-scientists fail: SPOT, a benchmark for automated verification
   of scientific research. arXiv, 2025. [arXiv:2505.11855](https://arxiv.org/abs/2505.11855).
   Abstract.
7. Xi S, Rao V, Payan J, Shah NB. FLAWS: a benchmark for error identification and localization in
   scientific papers. arXiv, 2025. [arXiv:2511.21843](https://arxiv.org/abs/2511.21843). As cited
   by Brian and colleagues.
8. Liu R, Shah NB. ReviewerGPT? An exploratory study on using large language models for paper
   reviewing. arXiv, 2023. [arXiv:2306.00622](https://arxiv.org/abs/2306.00622). As cited by Brian
   and colleagues.
9. Bianchi F, Kwon Y, Izzo Z, Zhang L, Zou J. To err is human: systematic quantification of errors
   in published AI papers via LLM analysis. arXiv, December 2025.
   [arXiv:2512.05925](https://arxiv.org/abs/2512.05925). Abstract.
10. Liang W and colleagues. Can large language models provide useful feedback on research papers?
    A large-scale empirical analysis. NEJM AI, 2024. [arXiv:2310.01783](https://arxiv.org/abs/2310.01783).
    Abstract.
11. Zancanaro E, Giannopoulos A, Gimelli A, Kresoja KP. AI as a peer reviewer: a blinded
    comparative study of LLM-generated and human reviews in a cardiology journal. European Heart
    Journal – Imaging Methods and Practice, 2026.
    [doi:10.1093/ehjimp/qyag097](https://doi.org/10.1093/ehjimp/qyag097). Abstract.
12. Rajakumar HK, Sankaran KA, Ashok MP, Rachoori S. Peer review in the age of artificial
    intelligence: a comparative study of human and AI-generated review reports. Postgraduate
    Medical Journal, 2026. [doi:10.1093/postmj/qgag005](https://doi.org/10.1093/postmj/qgag005).
    Abstract.
13. Fichtl AM, Ellinger L, Kelber J, Olík K, Groh G. AI-assisted peer review across research
    communities: from reviewer AI policies to LLM review quality. arXiv, August 2026.
    [arXiv:2608.03581](https://arxiv.org/abs/2608.03581). Secondary summary.
14. Biswas J and colleagues. AI-assisted peer review at scale: the AAAI-26 AI review pilot. arXiv,
    April 2026. [arXiv:2604.13940](https://arxiv.org/abs/2604.13940). Abstract and secondary
    reports.
15. Thakkar N and colleagues. Can LLM feedback enhance review quality? A randomized study of 20K
    reviews at ICLR 2025. arXiv, 2025. [arXiv:2504.09737](https://arxiv.org/abs/2504.09737).
    Abstract and conference blog.
16. Use and effects of LLMs in peer review: a randomized experiment and survey at ICML 2026. arXiv,
    September 2026. [arXiv:2609.19420](https://arxiv.org/abs/2609.19420). Abstract.
17. Towards automating scientific review with Google's Paper Assistant Tool. arXiv, June 2026.
    [arXiv:2606.28277](https://arxiv.org/abs/2606.28277); ICML retrospective. Abstract and blog.
18. Latona GR, Horta Ribeiro M, Davidson TR, Veselovsky V, West R. The AI review lottery:
    widespread AI-assisted peer reviews boost paper scores and acceptance rates. Proceedings of the
    ACM on Human-Computer Interaction, 2025. [arXiv:2405.02150](https://arxiv.org/abs/2405.02150).
    Abstract.
19. Nyrhi L and colleagues. Large language models for risk-of-bias assessment in randomised
    clinical trials: a comparative validation study. eBioMedicine, 2026.
    [PMC13054287](https://pmc.ncbi.nlm.nih.gov/articles/PMC13054287/). Full text.
20. Large language model–assisted risk-of-bias assessment in randomized controlled trials using
    the revised risk-of-bias tool: evaluation study. JMIR, 2025.
    [jmir.org/2025/1/e70450](https://www.jmir.org/2025/1/e70450). Abstract.
21. Minozzi S and colleagues. Reliability of the revised Cochrane risk-of-bias tool for randomised
    trials (RoB2) improved with the use of implementation instruction. Journal of Clinical
    Epidemiology, 2022. [doi:10.1016/j.jclinepi.2021.09.021](https://doi.org/10.1016/j.jclinepi.2021.09.021).
    Record only.
22. Srinivasan A, Berkowitz J, Friedrich NA, Kivelson S, Tatonetti NP. Large language model
    analysis of reporting quality of randomized clinical trial articles: a systematic review. JAMA
    Network Open, 2025. [PMC12395317](https://pmc.ncbi.nlm.nih.gov/articles/PMC12395317/).
    Abstract.
23. Yun HS, Zhang KYC, Kouzy R, Marshall IJ, Li JJ, Wallace BC. Caught in the web of words: do
    LLMs fall for spin in medical literature? CHIL 2025.
    [arXiv:2502.07963](https://arxiv.org/abs/2502.07963). Abstract.
24. Thelwall M, Jiang X, Bath PA. ChatGPT 4o-mini scores for UK REF 2021 clinical medicine
    articles. Information Processing & Management, 2025.
    [White Rose eprint](https://eprints.whiterose.ac.uk/id/eprint/223931). Secondary report.
25. Baumann J, Pei J, Koyejo S, Hovy D. Position: stop automating peer review without rigorous
    evaluation. ICML 2026. [arXiv:2605.03202](https://arxiv.org/abs/2605.03202). Abstract and
    secondary report.
26. Wang J and colleagues. When AI reviews science: can we trust the referee? The Innovation
    Informatics, 2026. [arXiv:2604.23593](https://arxiv.org/abs/2604.23593). Results section.
27. Macharla Vasu SS, Sheth I, Wang HP, Binkyte R, Fritz M. Justice in judgment: unveiling
    (hidden) bias in LLM-assisted peer reviews. Findings of ACL 2026.
    [arXiv:2509.13400](https://arxiv.org/abs/2509.13400). Abstract.
28. Howell and colleagues. Prestige over merit: an adapted audit of LLM bias in peer review.
    arXiv, 2025. [arXiv:2509.15122](https://arxiv.org/abs/2509.15122). Abstract.
29. Laurito W and colleagues. AI–AI bias: large language models favor communications generated
    by large language models. PNAS, 2025.
    [doi:10.1073/pnas.2415697122](https://doi.org/10.1073/pnas.2415697122). As cited by King and
    Worthington.
30. Schroter S and colleagues. What errors do peer reviewers detect, and does training improve
    their ability to detect them? Journal of the Royal Society of Medicine, 2008. As cited by Brian
    and colleagues.
31. The Black Spatula Project. [the-black-spatula-project.github.io](https://the-black-spatula-project.github.io/).
    Repository and secondary coverage.
32. Saez–Zucman audit replication.
    [saez-zucman-audit-replication.vercel.app](https://saez-zucman-audit-replication.vercel.app/).
    Read in part.

## Changes since the last version

First version.
