---
title: "A Brief Questionnaire to Assess Post-Exertional Malaise"
authors: "Cotler J, Holtzman C, Dudun C, Jason LA"
journal: "Diagnostics (Basel)"
year: 2018
doi: "10.3390/diagnostics8030066"
conditions: ["ME/CFS"]
studyType: "Cross-sectional online survey; 376 self-reported ME or CFS, 157 multiple sclerosis, 167 post-polio syndrome"
design: case-control
topics: ["diagnosis-biomarkers", "exercise-pem"]
kind: paper
reviewedOn: 2026-11-02
guideVersion: "0.10.2"
model: "claude-opus-5-5"
effort: "high"
draft: true
read:
  - "Full text, PubMed Central open-access copy (PMC6165517), fetched as plain text, including Tables 1 to 3 and Appendices A and B"
  - "Figure 1 (the ROC curve), viewed as an image; it is the paper's only figure"
  - "No supplementary files: none are listed"
  - "The NIH/CDC post-exertional malaise working group draft (reference 1) was not opened: the archived copy could not be fetched from this session"
  - "Other cited papers were not opened; claims about them rest on the paper's own descriptions"
score: 4.0
verdict: "People who said they had ME/CFS reported much longer post-exertional worsening than people with multiple sclerosis or post-polio syndrome, but with self-reported diagnoses, easy comparison groups and no independent measure of post-exertional malaise, the paper cannot show the questionnaire it names detects it."
confidence: "high"
importance: "high"
strengths:
  - "Large, consistent difference in how long worsening lasts"
  - "Counts reported fully enough to recompute results"
  - "Self-reported diagnosis named as a limitation"
weaknesses:
  - "Self-reported diagnoses that may build in the answer"
  - "Compared with conditions no one confuses with ME/CFS"
  - "The two-step process was never tested as a whole"
  - "Mislabelled accuracy figures and table errors"
guideNotes:
  - "Questionnaire accuracy studies: check the comparison group is the one the test would sort in practice, not a separately recruited other disease"
  - "Check that predictive values are not reported in place of specificity, and that they are tied to the sample's case mix"
  - "Post-exertional malaise questionnaires: ask whether they cover the delay before worsening, not only how long it lasts"
---

## Study design

This is a cross-sectional online survey analysed as a diagnostic-accuracy study. People who said they had myalgic encephalomyelitis (ME) and/or chronic fatigue syndrome (CFS), multiple sclerosis (MS) or post-polio syndrome (PPS) filled in the DePaul Symptom Questionnaire (DSQ) online. The paper then asks how well five DSQ items about post-exertional malaise (PEM) separate the ME/CFS group from the MS and PPS groups.

The background is a recommendation from a working group of the National Institutes of Health and the Centers for Disease Control and Prevention (NIH/CDC) on common data elements (CDE). According to the paper, that group recommended a two-step assessment of PEM. Step one is five DSQ items rated for frequency and severity. Step two is "a second step in which the clinician evaluates these responses in light of other information", such as "whether responses were related to overwork or to exercise avoidance". The paper's aim is to see whether five other DSQ items can stand in for that second step.

The five "supplemental" items are:

- worse after minimal physical effort (yes/no);
- worse after mental effort (yes/no);
- if yes to either, how long the worsening lasts (six categories, from "1 h or less" to "24 h or more", plus a code of 0 for people not asked);
- "would you recover within an hour or two" after becoming exhausted from outings or sports (yes/no), called "quick recovery";
- "If you do not exercise, is it because exercise makes your symptoms worse?" (yes/no), called "exercise exacerbation".

The analysis has three parts. First, 100 decision trees, built with the Classification and Regression Tree (CRT) method in SPSS (a statistics package), each on a random subsample of 125 people per group. Second, chi-square tests comparing the groups, reported for three of the items (quick recovery, mental exacerbation and duration). Third, a receiver operating characteristic (ROC) analysis of the duration item alone.

The discussion then names a ten-item instrument, the DSQ-PEM (the five step-one items plus the five supplemental items), and gives scoring rules for it in Appendix B. The DSQ-PEM as a whole, with those scoring rules, is not tested anywhere in the paper.

## Sample selection

Recruitment was by email to national foundations and posts to support groups, research forums and social media. All diagnoses were self-reported. The paper does not say which case definition, if any, the ME/CFS group met, or who made the diagnosis. People who reported ME and/or CFS together with MS or PPS were excluded. Nothing else about exclusions is stated.

The sample is described only as a whole: 82.3% female, 14.6% male, 95.4% White, aged 18 to 86 (mean 53.0). Age, sex, illness duration and severity are not given per group. That matters here. People with PPS had polio decades earlier, so that group is likely to be older than the ME/CFS group. Differences in age or severity could drive some of the group differences, and the paper gives no way to check.

No group was assessed for depression, fibromyalgia, postural orthostatic tachycardia syndrome or orthostatic intolerance (POTS/OI), or mast cell activation syndrome (MCAS). Nobody in the MS or PPS groups was screened for ME/CFS beyond the exclusion of those who reported it.

Three points about selection weigh on the results.

**The reference standard is a self-reported label.** In a diagnostic-accuracy study the reference standard is what the test is judged against. Here it is the participant's own report of a diagnosis. The share of self-reported ME/CFS cases who would meet a strict case definition is unknown. The guide's estimate for self-reported Fukuda CFS is 0.3 or less, and for a diagnosis by a general practitioner about 0.5 to 0.6. This sample was recruited through national foundations, support groups, research forums and social media, which may select people more engaged with their diagnosis, but the paper gives no data either way.

**Incorporation bias.** Several case definitions include PEM, and some include its duration. The paper itself notes that "some case definitions require lasting more than 24 h". People with an ME/CFS diagnosis, especially those reached through foundations and support groups, are likely to know that PEM, and long-lasting PEM, is the defining feature of their illness. So the "test" (the PEM duration item) is partly built into the reference standard (the ME/CFS label), both through how diagnoses are made and through what people who carry the label have learned about it. This is the circular pattern the guide warns about. It inflates sensitivity and specificity, by an amount that cannot be estimated from these data.

**The comparison groups are not the ones that matter clinically.** The question a PEM measure has to answer is whether a fatigued person has PEM. The hard cases are people with depression, deconditioning, fibromyalgia, other unexplained fatigue, or post-infection fatigue without PEM. MS and PPS are diagnosed by other means: imaging and a history of polio. Nobody needs a questionnaire to tell ME/CFS from MS. Diagnostic-accuracy studies that compare clear cases with a separately recruited group with other diagnoses are known to overestimate accuracy, because they leave out the borderline people where a test is actually used. The authors acknowledge this partly: "Further research is needed to determine whether the supplementary DSQ PEM items can also be successful in differentiating those with ME and CFS from other chronic illnesses."

## Outcome measures

Everything here is self-report, which is unavoidable for a questionnaire study. On the guide's scale the items are at the subjective end. That is not disqualifying in itself, but it means the results stand or fall with the reference standard and with how well people can answer the questions.

**The duration item.** "If you feel worse after activities, how long does this last" does not name an activity, a level of exertion or a time frame. It does not ask about the delay before worsening starts, which is a defining feature of PEM. It is only shown to people who said yes to one of the two worsening questions; everyone else is coded 0. So the item mixes two things: whether worsening happens at all, and how long it lasts. The response categories also have gaps: there is nothing between "1 h or less" and "2–3 h" for, say, 90 minutes. Appendix A lists the first category as "<1 h", while the methods say "1 h or less".

**Reliability.** The paper cites test-retest kappas from an earlier study for four of the five supplemental items (0.74 to 0.88). It gives none for the duration item, the one that does nearly all the work.

**The step-one items do not match.** The methods list the five step-one items as "A dead, heavy feeling after exercise", "Muscle weakness even after resting", "Next day soreness after everyday activities", "Mentally tired after the slightest effort" and "Physically drained after mild activity". Appendix A, the DSQ-PEM as published, has "Dead, heavy feeling after starting to exercise", "Next day soreness or fatigue after non-strenuous, everyday activities", "Mentally tired after the slightest effort", "Minimum exercise makes you physically tired" and "Physically drained or sick after mild activity". "Muscle weakness even after resting" has been replaced by "Minimum exercise makes you physically tired", and three other items are worded differently. The paper does not explain the change. So the instrument it publishes is not exactly the one it describes.

**No measure of PEM itself.** The supplemental items are judged only by whether they match the ME/CFS label. They are never compared with any other measure of PEM, such as symptom tracking after a set exertion or a two-day cardiopulmonary exercise test. The authors list a comparison with cardiopulmonary exercise testing as future work.

## Bias

The authors developed the DSQ and are validating items from it. That is normal for instrument development, but it is a reason to look for a missing independent test, and there is none here: no outside sample, no other research group, no reference standard that does not depend on self-report. The paper declares no conflict of interest. Funding was from the National Institute of Allergy and Infectious Diseases.

The bigger bias is structural and covered above: a self-reported label as the reference standard, likely incorporation of PEM duration into that label, and comparison groups chosen from the easy end of the differential diagnosis.

## Statistical and methodological issues

### Errors in the reported results

I recomputed the accuracy figures from the counts in Table 3. Most of them check out, but several labels and numbers in the text do not.

- **Sensitivity at 14 hours is mislabelled.** The results say "For those whose symptoms lasting 14–23 h, Sensitivity = 87.5% and Specificity = 77.8%". From Table 3, 87.5% is the share of the ME/CFS group reporting 14 hours *or more* (53 + 276 = 329 of 376). The 14–23 hour band alone holds 53 of 376 (14.1%). The discussion describes the cut-off correctly, as including both "14–23 h" and "24 h or more".
- **Sensitivity at 24 hours is given two ways.** The results say 73.4% (276 of 376, which matches Table 3). The discussion says "Setting the criterion at 24 h or more would include a smaller subset of patients with ME and CFS (70.3%)".
- **Specificity is described as if it were a predictive value.** The results say "Patients who report that their PEM lasts 14 to 23 h, had a ME or CFS diagnosis 77.8% of the time. This increased to 88.6% if patients report that their PEM lasts 24 h or more." The figures 77.8% and 88.6% are specificities: the share of the MS and PPS groups who fall *below* the cut-off. The share of people above a cut-off who have ME/CFS is a different quantity, the positive predictive value. From Table 3 it is 82.0% at 14 hours or more (329 of 401), 88.2% at 24 hours or more (276 of 313), and 60.2% for the 14–23 hour band alone (53 of 88). The next sentence, that people reporting under 14 hours "had a MS or PPS diagnosis 84.2% of the time", is a negative predictive value, and roughly matches the table (252 of 299, 84.3%). So the paragraph mixes two kinds of figure under one wording.
- **Predictive values depend on the mix of the sample.** Even the correctly computed predictive values hold only for a sample that is 54% ME/CFS (376 of 700). In a setting where, say, one in five people being assessed has ME/CFS, the same sensitivity and specificity at 14 hours would give a positive predictive value of about 50%, not 82%. This is a general point, not an error in the paper, but the paper's wording invites the wrong reading.
- **The PPS column of Table 3 does not add up.** The "No Exacerbation" cell reads "12.3 (86)". The other PPS counts sum to 122, so the column totals 208 for a group of 167, and the percentages sum to 85.5%. If all 167 PPS participants are counted, the "No Exacerbation" cell would be 45 (26.9%). The MS and ME/CFS columns add up. The specificities in the text and the points on the ROC curve are consistent with a PPS denominator of 167, so the error seems to be in the table, not in the analysis.
- **The standard error of the area under the curve.** The ROC result is given as "AUC of 0.88 (SE = 0.1, CI = 0.85–0.90)": an area under the curve (AUC) of 0.88, with a standard error (SE) of 0.1 and a confidence interval (CI) of 0.85 to 0.90. A standard error of 0.1 would give a confidence interval about 0.4 wide. The interval given implies a standard error of roughly 0.01. Probably a typo.

None of these errors changes the direction of the findings. They do show the results section was not checked carefully, and the predictive-value wording overstates what the item can tell a clinician.

### The decision trees

The methods say "symptom scores were calculated by combining the scores of frequency and severity into a score on a 100-point scale". That cannot apply to these items: the paper says itself that "None of the supplemental DSQ PEM questions were rated for frequency or severity". The sentence seems to have been carried over from an analysis of other DSQ items. How the yes/no items and the seven-level duration item were coded for the trees is not stated, beyond the duration coding.

The trees classify three groups (ME/CFS, MS, PPS), but the results are given as two-group figures: "correctly categorized patients with ME or CFS 81.7% of the time, while incorrectly categorizing patients with MS and PPS as patients with ME or CFS only 16.6% of the time." The paper says "the average sensitivity and 1-specificity results of the decision trees were calculated", but not how MS and PPS were merged into one group for that, or how the averaging was done.

The paper does not say whether these figures come from the people used to build each tree or from people left out. SPSS can cross-validate a tree, but the methods do not mention it. With 125 of 157 MS and 125 of 167 PPS participants in every tree, the 100 trees share most of their comparison group. So "PEM duration" appearing in tier 1 of all 100 trees shows mainly that the same data give the same answer, not that the finding replicates.

The trees add little beyond the ROC analysis. Duration is the first split in every tree, and the tree accuracy (81.7% sensitivity, 16.6% false positives) is close to what the duration item alone gives at 14 hours (87.5% and 22.2%).

### Cut-offs chosen on the same data

The 14-hour and 24-hour cut-offs are motivated by earlier work and case definitions, which is reasonable. But the scoring rule in Appendix B (">14 h") is then recommended on the strength of its accuracy in this same sample. There is no separate validation sample.

### The two steps were never combined

The paper's claim is about a two-step process. Yet it never reports how many MS or PPS participants met step one, and never tests step one and step two together. The only figure for step one is in the discussion: it "identifies the vast majority of patients (97%) in Jason et al. [10] and 99% in the current sample". No data are shown for that 99%, and it seems to refer to the ME/CFS group only. Without step one's results in the comparison groups, a reader cannot tell what step two adds.

Appendix B's scoring rule for step two needs item 7 or 8 to be yes, and item 9 above 14 hours. Since item 9 is only shown to people who said yes to item 7 or 8, the rule reduces to the duration item alone. Items 6 and 10 are not scored.

### Figure 1

The ROC curve, viewed as an image, has few corners, as expected for a single seven-level item. Its points match Table 3: about (0.11, 0.73) at 24 hours, (0.22, 0.875) at 14 hours, and (0.40, 0.95) at 4 hours. The figure supports the reported area under the curve of 0.88.

## Biological plausibility

That people with ME/CFS report longer-lasting worsening after exertion than people with MS or PPS fits the clinical descriptions of PEM and the case definitions that specify a duration. The paper cites studies on exercise in MS and PPS to argue that exertion has shorter effects in those conditions. Those papers were not checked. So the direction of the result is plausible. The open question is not whether the difference exists but how much of its size comes from the design.

## Interpretation and spin

The abstract is reasonably measured: "The findings suggested that a PEM second-step process could be operationalized using supplementary DSQ items." The limitations paragraph names self-reported diagnosis.

The main overreach is a slide in what the items are for. The paper sets out to operationalise a step meant to *confirm the presence of PEM*. It then tests the items against *diagnosis*: ME/CFS versus MS or PPS. And it ends with scoring rules that say a response "is needed to indicate an ME and/or CFS dx". Those are three different jobs. Matching a diagnostic label against two unrelated neurological conditions is evidence for none of them in the setting where they would be used. PEM in MS or PPS, if it exists, would count as a "false positive" in this design.

The stated purpose of the second step, as the paper describes it, was to judge "whether responses were related to overwork or to exercise avoidance". None of the five items is tested for that.

The title, "A Brief Questionnaire to Assess Post-Exertional Malaise", promises more than the paper tests. The ten-item DSQ-PEM is assembled in the discussion and given scoring rules, but as a whole it was never analysed. Its step-one items differ from the ones listed in the methods.

The discussion's "Because these additional DSQ PEM duration items can help differentiate ME and CFS from those with at least two other chronic conditions, these items might have appeal to clinicians who often have limited periods of time" goes further than the data. Clinicians do not need to separate ME/CFS from MS or PPS by questionnaire.

## What this demonstrates

It shows that, in an online sample, people who say they have ME/CFS report long-lasting worsening after activity much more often than people who say they have MS or PPS. Of the ME/CFS group, 73.4% reported 24 hours or more, against 8.9% of the MS group and 13.8% of the PPS group. That is a large and consistent difference.

It does not show:

- that the duration item, or the DSQ-PEM, detects PEM, since nothing measured PEM independently;
- how accurate the items would be among people where the diagnosis is actually in doubt;
- what step two adds to step one, since that was not reported;
- that the published ten-item DSQ-PEM, with its scoring rules, performs as the five supplemental items did.

## Critical missing elements

- Per-group demographics, illness duration and severity.
- Step-one results in the MS and PPS groups, and the two steps tested together.
- Whether the decision-tree accuracy was cross-validated.
- Test-retest reliability for the duration item.
- An explanation for the change in step-one items between the methods and Appendix A.
- A reference standard other than a self-reported label, at least for a subsample: clinician assessment against a named case definition.

## Recommendations

**For researchers using the DSQ-PEM to ascertain PEM:** treat it as a structured way to ask about PEM, not as a validated test. This paper gives no evidence on how it performs among the people it would be used to sort, such as fatigued patients with or without PEM. Report which version of the step-one items was used, since the paper itself has two.

**For a validation study that would settle it:** recruit people with fatigue whose diagnosis is uncertain, assess them clinically against a named case definition by someone who has not seen the questionnaire, and compare the DSQ-PEM against that and against an observed response to a set exertion. Ask about the delay before worsening, as well as its duration. Report sensitivity, specificity and predictive values at a pre-set cut-off, and test-retest reliability for every scored item.

**For readers:** the accuracy figures here, and especially "had a ME or CFS diagnosis 77.8% of the time", should not be quoted as the chance that a person with long PEM has ME/CFS.

## Final assessment

What prevents a higher score: the design cannot give a usable accuracy estimate. The reference standard is self-reported, and likely incorporates PEM duration itself. The comparison groups are conditions that no one needs a questionnaire to rule out. The two-step process the paper is about was never tested as a whole. The step-one items differ between the methods and the published instrument. Specificities are presented as predictive values, and there are smaller numerical errors. The scoring rules go beyond the paper's stated purpose and recommend the items as indicating a diagnosis.

What prevents a lower score: the paper does not claim much in its abstract, and it names the self-report limitation. The underlying finding, that self-identified ME/CFS respondents report much longer post-exertional worsening than MS or PPS respondents, is large, consistent across the analyses and plausible. The data are reported fully enough for a reader to recompute the main figures and find the errors, and the ROC curve matches the table. As a first step towards a short PEM measure, it is a reasonable descriptive contribution.

Weighing these: the paper's evidence supports a group difference, but it cannot separate the reported accuracy from spectrum and incorporation bias, and it does not test the claim in its title.

## Executive summary

This paper looks at whether five questions from the DePaul Symptom Questionnaire (DSQ), a self-report questionnaire, can confirm post-exertional malaise (PEM), the worsening of symptoms after effort that defines ME/CFS. About 700 people filled in the questionnaire online: 376 who said they had ME/CFS, 157 with multiple sclerosis and 167 with post-polio syndrome. One question, how long the worsening after activity lasts, did nearly all the work. Of the ME/CFS group, 73% said 24 hours or more, against 9% of the multiple sclerosis group and 14% of the post-polio group. The authors then put these five questions together with five earlier ones as a ten-item "DSQ-PEM", with scoring rules.

The group difference is large and believable. But the study cannot show how well the questions detect PEM. All diagnoses were self-reported, and many people with an ME/CFS diagnosis will know that long-lasting PEM is part of it, so the "test" and the diagnosis it is checked against overlap. The comparison groups were people with multiple sclerosis and post-polio syndrome, which are diagnosed in other ways. The people where a PEM question is actually needed, such as fatigued people with depression or deconditioning, were not included. Nothing measured PEM independently. The two-step process the paper is about was never tested as a whole. The published ten-item questionnaire has different first-step questions from the ones the methods describe. And some results are mislabelled: one figure, 77.8%, is presented as the chance that someone reporting long PEM has ME/CFS, when it is actually the share of the other groups below the cut-off.

The DSQ-PEM is a sensible structured way to ask about PEM, but this paper does not validate it.

Grade: 4.0 / 10.
