---
title: "Prevalence of ongoing symptoms following coronavirus (COVID-19) infection in the UK: 30 March 2023"
authors: "Office for National Statistics"
journal: "Office for National Statistics statistical bulletin (Experimental Statistics)"
year: 2023
url: "https://www.ons.gov.uk/peoplepopulationandcommunity/healthandsocialcare/conditionsanddiseases/bulletins/prevalenceofongoingsymptomsfollowingcoronaviruscovid19infectionintheuk/30march2023"
conditions: ["Long Covid"]
studyType: "Weighted household survey, 269,971 responses over four weeks to 5 March 2023"
design: observational
topics: ["epidemiology", "course-outcomes"]
kind: paper
draft: true
reviewedOn: 2026-11-09
guideVersion: "0.10.1"
model: "claude-opus-5-5"
effort: "medium"
read:
  - "Full bulletin text, from the ONS web page (HTML)"
  - "Figure 1 (the only figure), viewed as an image, plus its data as a .csv download"
  - "Accompanying dataset, all 14 tables and notes: longcovid1920230330accessible.xlsx from the ONS dataset page"
  - "COVID-19 Infection Survey: methods and further information (ONS methodology page, revised 1 February 2023)"
  - "COVID-19 Infection Survey quality report: December 2022 (ONS), searched for long COVID and data collection method"
  - "COVID-19 Infection Survey technical dataset, 10 March 2023 (pointer to response rates) and 11 February 2022 (response rate tables 2a to 2e)"
  - "ONS technical article: updated estimates of the prevalence of post-acute symptoms, 26 April 2020 to 1 August 2021 (September 2021)"
  - "Tried and failed: the CIS case record forms page at ndm.ox.ac.uk (403 refused)"
score: 6.5
verdict: "A large, carefully weighted survey that reliably counts how many people in UK households call themselves a long COVID case, but with no comparison group, suspected infections, low response and a mid-2022 method change, the 1.9 million figure is not a count of illness caused by infection."
confidence: "moderate"
importance: "high"
strengths:
  - "Large national sample, weighted to the population"
  - "Question wording and limits stated openly"
  - "Breakdowns by severity, duration and hospital stay"
weaknesses:
  - "No comparison group; background symptoms counted"
  - "Suspected infections and mild symptoms count"
  - "About 1 in 8 invited households took part"
  - "Method change in 2022 breaks the trend"
context:
  - note: "The Office for National Statistics' September 2021 technical article, using the same survey with laboratory-confirmed infections and matched controls, found 3.0% of infected participants had any of 12 common symptoms continuously for at least 12 weeks, against 0.5% of controls, while 11.7% described themselves as having long COVID at 12 weeks."
    source: "https://www.ons.gov.uk/peoplepopulationandcommunity/healthandsocialcare/conditionsanddiseases/articles/technicalarticleupdatedestimatesoftheprevalenceofpostacutesymptomsamongpeoplewithcoronaviruscovid19intheuk/26april2020to1august2021"
  - note: "In the survey's last published response rates for England (enrolment there ended 31 January 2022), 13% of the 1,400,783 households invited from England's address list registered."
    source: "https://www.ons.gov.uk/peoplepopulationandcommunity/healthandsocialcare/conditionsanddiseases/datasets/covid19infectionsurveytechnicaldata"
guideNotes:
  - "Survey prevalence: confidence intervals cover sampling error only; weigh non-response and misclassification instead"
  - "Duration counted from first infection, ignoring reinfection, is not illness duration"
  - "Repeated surveys: check for changes of data collection method before reading a trend"
---

## Study design

This is a monthly official statistics release from the Office for National Statistics (ONS). It appears to be the last in its series (see context beyond the paper). It estimates how many people in UK private households describe themselves as having long COVID. The data come from the Coronavirus (COVID-19) Infection Survey (CIS), a large household panel that ran from April 2020 to March 2023. The release counts 269,971 responses collected in the four weeks to 5 March 2023. It weights them "to represent people aged 2 years and over living in private households in the UK". ONS labels the figures "Experimental Statistics" and advises "caution when using the data".

Each month is a cross-section: the share of respondents who answered yes, scaled up to the population. There is no comparison group, no clinical assessment, and no check that the symptoms came from the infection. The release is short: about a page of text, one chart, and an accompanying spreadsheet of 14 tables. Methods are spread across the bulletin, the spreadsheet notes and a separate CIS methods page.

The design fits one question well: how many people in the UK, at one point in time, would call themselves a long COVID case? It fits other questions poorly. These include how many people have ongoing illness caused by SARS-CoV-2, how long that illness lasts, and who is at higher risk after infection. The release mostly keeps to the first question. The exceptions are discussed under interpretation.

## Sample selection

**Case definition.** One question decides who counts:

> "Would you describe yourself as having 'long COVID', that is, you are still experiencing symptoms more than 4 weeks after you first had COVID-19, that are not explained by something else?"

This is a self-classification, not a symptom-based definition. It has no severity threshold and no minimum number of symptoms. It needs symptoms for only four weeks, not the 12 weeks the guide prefers. Respondents decide for themselves whether symptoms are "not explained by something else". The definition is about as broad as the guide's epidemiology section warns against: "Long Covid meaning any symptom of any severity after an unconfirmed infection at more than 4 weeks". Of the 1.879 million estimated cases, 392,000 (21%) said long COVID reduced their day-to-day activities "not at all". 381,000 (20%) said "a lot".

The release does give the breakdowns needed to narrow this. 1.734 million had first had (or suspected) COVID-19 at least 12 weeks earlier. Among those, 351,000 said their activities were limited a lot. That last figure is the closest the release comes to a case group comparable to clinical long COVID cohorts. It still has no comparison group.

**How infection was confirmed.** The date of first infection is the earliest of three things: a positive test within the study, a self-reported positive test outside it, or "the date of the first suspected COVID-19 infection, as reported by the participant". So suspected infections count. The release does not say what share of cases rest on a positive test and what share on suspicion alone. In the guide's order of evidence (PCR test, then rapid test, then exposure plus symptoms, then physician diagnosis, then self-report), some unknown share of cases sit at the bottom.

**Hospitalisation.** This is reported, which is useful. Of the 1.879 million, 1.248 million (66%) had no contact with the National Health Service (NHS) at first infection, 556,000 contacted the NHS but were not admitted, and 75,000 (4%) were hospitalised. So this is mostly a non-hospitalised population, which the guide treats as the most informative kind.

**ME/CFS, postural orthostatic tachycardia syndrome or orthostatic intolerance, mast cell activation syndrome.** None is assessed. Post-exertional malaise (PEM) is not asked about. The spreadsheet reports 23 symptoms, but only for people who already said yes to long COVID. Fatigue ("weakness or tiredness") was most common, at 72%, then difficulty concentrating (51%), muscle ache (49%) and shortness of breath (48%). Palpitations (25%) and dizziness (27%) are listed, but these say nothing about orthostatic intolerance as such. The survey cannot say what share of cases resemble ME/CFS.

**Who is in the sample.** The survey covers private households only. It excludes "communal establishments such as halls of residence, prisons, schools, hospitals, or care homes". People in hospital or care with severe illness are therefore missing.

The release itself does not give response rates. It points to the CIS technical dataset. For England, Wales and Scotland, enrolment ended on 31 January 2022, and the last published response rates are from 11 February 2022. A small new sample was recruited in Northern Ireland until 23 November 2022. In England, 51% of households invited at the start (drawn from earlier ONS survey respondents) registered, and 43% of the next wave. For the much larger address-list sample from July 2020, 13% of 1,400,783 invited households registered. Scotland's address-list sample was also 13%. So most of the panel comes from a sample where about one in eight households agreed to take part. Weighting corrects for age, sex and region. It cannot correct for people taking part, or staying in, because of their health. ONS states the problem plainly: "bias may be introduced if non-response is related to long COVID, for example, participants being more willing, or less able, to continue in the study because of their symptoms." No analysis of this was published alongside the release.

The direction of this bias is not known. People with long COVID may be more interested in a COVID study and more likely to stay. People who are severely ill may be less able to fill in a monthly questionnaire. Remote data collection (online or by phone) may make it easier for housebound people to respond than home visits did. ONS's December 2022 quality report found that the remote and home-visit samples were "very similar to each other" in make-up, and that "the data collection method has not impacted on uptake of the survey". It did not look at health status or long COVID. The release gives no data on either.

**Children.** Parents and carers answer for children under 12. The estimate for ages 2 to 11 is 0.3%, from 14,659 responses.

## Outcome measures

The only outcome is a yes/no answer to a self-classification question, plus two follow-up questions on activity limitation and symptoms. On the guide's scale this is fully subjective. It is not a clinical diagnosis, and ONS says so: the estimates are "rather than clinically diagnosed ongoing symptomatic COVID-19 or post-COVID-19 syndrome".

Self-classification depends on what people understand by "long COVID". That understanding shifted over the three years of the survey as the term became widely known. Participants had been asked the same question repeatedly since February 2021. Repeated asking can change how people answer (sometimes called panel conditioning). The release does not discuss this.

Misclassification can run in both directions, and the release says so. Some people will attribute unrelated symptoms to COVID. Others, with symptoms caused by COVID, will not use the term, "because of lack of awareness of the term or not knowing they were initially infected". There is no validation of the question against a clinical assessment in this release, so the size of each error is unknown.

**Duration.** All durations are measured from the date of the *first* infection, and "reinfections are not taken into consideration". So the 762,000 people counted at "two years or more" are people whose first known or suspected infection was at least two years earlier. This is not the same as having been ill for two years. Someone who recovered from a 2020 infection and became ill after a 2022 reinfection is counted in the two-year group. The survey also does not ask whether symptoms were continuous. The release states the rule in its methods section. Its main points then say that 1.3 million people with long COVID had first had COVID-19 at least a year earlier, which is accurate wording but easily read as illness duration.

The variant breakdown has the same problem. "698,000 (37%) in the Omicron period" means the first known or suspected infection fell in that period. A person first infected before Alpha who became ill after an Omicron reinfection counts as pre-Alpha.

## Bias

Non-response and attrition are the main sources of bias, as set out above. Their size and direction are unknown.

The biggest problem for any use beyond counting self-identified cases is that there is no comparison group. Fatigue, poor concentration, muscle aches and low mood are common in the general population. The spreadsheet notes this: "it is not known how many people would have experienced these symptoms even if they had not been infected with coronavirus". The survey asked about the 23 symptoms only among people who said yes to long COVID. So symptom prevalence cannot be compared with people without long COVID.

ONS's own earlier work shows how much this matters. In a September 2021 technical article, ONS used the same survey and laboratory-confirmed infections up to August 2021. With matched controls, 3.0% of infected participants had any of 12 common symptoms continuously for at least 12 weeks, against 0.5% of controls. On the self-classification question, 11.7% of infected participants described themselves as having long COVID at 12 weeks. That article says that "the nature of the survey questions meant that it was not possible to select a control group" for self-reported long COVID. The two measures differ in more than their control. The 12-symptom list left out palpitations, cognitive problems, sleep problems and mood, which "may have downwardly biased the estimates" of the symptom approach. So the gap does not prove that self-report overcounts by a factor of four. It does show that the self-report figure and an estimate of illness attributable to infection can be several times apart in the same survey.

On author bias: ONS is a statistics office with no stake in a particular number. The release is cautious and repeatedly states its limits. I found no sign of motivated framing.

## Statistical and methodological issues

**Confidence intervals.** The headline is 1.879 million (95% confidence interval 1.828 to 1.930 million), or 2.92% (2.84% to 3.00%). These intervals reflect sampling error only. With 270,000 responses, sampling error is small. The uncertainty from non-response, misclassification and the case definition is much larger and is not quantified. The narrow interval can give a false impression of precision. The release says how the weights are built (age, sex, region, adjusted for non-response). It does not say how the intervals were calculated. The CIS methods page describes a method only for its weighted positivity estimates, so I could not check this.

**Change of data collection.** In July 2022 the survey moved from home visits by study workers to online or phone questionnaires. ONS says the estimates before and after "are not comparable". The time series shows why this matters. The last estimate from home visits (to 2 July 2022) was 1.790 million. The mixed month (to 31 July 2022) was 1.985 million. The first fully remote month (to 3 September 2022) was 2.290 million. Part of that rise may be real, after the large Omicron waves of 2022. Part may come from the change in method. The data cannot separate the two. ONS did test the change for other measures. Its December 2022 quality report found that "remote data collection led to participants with a strong positive test being 2.7 (95% confidence interval: 2.2 to 3.3) times more likely to report symptoms" than with home visits. It concluded that symptom data "should not be considered equivalent across the two data collection methods". That finding is about acute symptoms after a positive swab, not long COVID. But it shows that the remote method changed how people reported symptoms, which makes it likely that part of the jump in self-reported long COVID comes from the method. I found no such test for long COVID self-report. As a result, the series can only be read within each period: March 2021 to June 2022, and September 2022 to March 2023. In the second period the estimate fell from 2.290 to 1.879 million.

**A correction.** The release notes an error in the population totals used for weighting for England and Wales. It affected the February 2023 bulletin, which was corrected, and a March 2023 bulletin, which was cancelled. The latest period was not affected. The correction was disclosed openly.

**Subgroups.** The main points list the groups with the highest prevalence. These include people "working in social care" (5.33%), people "aged 16 years and over who were not working and not looking for work" (7.38%) and people "with another activity-limiting health condition or disability" (10.68% for "limited a lot"). The spreadsheet adds two important caveats. "It is not possible to infer cause-and-effect relationships". And the estimates "do not account for differing rates of infection between groups", so patterns "may therefore partly reflect patterns in coronavirus infection, rather than providing evidence for differential risk of long COVID following infection".

Two of these groups have a further problem: causation may run the other way. Long COVID can make people stop working. And the spreadsheet itself notes that "it may be difficult for some participants to separate long COVID symptoms from unrelated exacerbation of pre-existing conditions" when reporting their health status. So "not working" and "another activity-limiting condition" may partly be results of long COVID, or the same illness counted twice, not risk factors. ONS had also suspended its estimates of the *number* of people with long COVID by ethnic group, deprivation, employment sector and health status "pending a review of their quality". This release still gives the *percentages* for those groups, and the main points draw on them.

## Interpretation and spin

Mostly careful. Every headline uses the phrase "self-reported long COVID". The release gives the full question wording in the chart notes and describes the figures as Experimental Statistics. Its limitations section names the two biggest problems, non-response and misclassification, in plain terms. Little here would count as spin.

Three things fall short:

1. The headline is "1.9 million people ... were experiencing self-reported long COVID". This is accurate. But the release never says plainly that it is not an estimate of illness caused by infection, and that ONS's own controlled analysis gave a much lower figure for persistent symptoms. Without that, the number is easy to read as "1.9 million people have long COVID".
2. The main points describe groups with the highest prevalence without the caveats on infection rates, causation and reverse causation. Those caveats appear only in the spreadsheet notes.
3. Durations are measured from first infection, which the main points say accurately, but readers will likely take as illness duration. The rule about reinfections appears only in the methods section.

## What this demonstrates

It shows that, in early 2023, about 3% of people in UK private households who took part in a large, weighted survey described themselves as having long COVID. About one in five of them said it limited their daily activities a lot. Most had not been hospitalised. Most said their first infection was more than a year earlier. Within the remote-collection period (September 2022 to March 2023) the estimate fell. Self-reported long COVID was more common in middle age, in women, and in more deprived areas.

It does not show how many people have illness caused by SARS-CoV-2, because there is no comparison group. It does not show how long illness lasts, because duration runs from first infection and ignores reinfection. It does not show who is at higher risk after infection, because the subgroup figures are not adjusted for how often each group was infected. And it says nothing about ME/CFS, PEM or orthostatic intolerance.

## Critical missing elements

- A comparison group answering a comparable question. Symptoms were asked only of people who said yes, so even background symptom rates cannot be estimated.
- The share of cases with a positive test, as against a suspected infection only.
- Any analysis of whether people with long COVID were more or less likely to stay in the panel.
- A quality check of the change from home visits to remote collection for long COVID self-report, as ONS did for acute symptom reporting, where it found the remote method raised reporting.
- Whether symptoms followed the first infection or a reinfection, and whether they were continuous.
- Any question on PEM or orthostatic intolerance, which would have let the survey estimate how many cases resemble ME/CFS.
- Response rates and how confidence intervals are calculated, in the release itself.

I could not open the CIS questionnaire (the University of Oxford page holding the case record forms refused the request). I took the question wording from the release and its spreadsheet.

## Context beyond the paper

The CIS methods page says participants were invited to remain in the study until 31 March 2023. This release says the next one was due in "May 2023 (provisional)". At the time of reading, the ONS page still lists this 30 March 2023 release as "the latest release". So the series appears to have ended with these figures.

ONS's September 2021 technical article, described under bias, used the same survey with matched controls and laboratory-confirmed infections. It remains the most direct way to calibrate the self-report figures.

## Recommendations

**For readers and journalists.** Quote the figure as ONS does: "an estimated 1.9 million people said they had long COVID". It counts people who see themselves as having long COVID, not cases confirmed or caused by infection. The 381,000 who said it limited their activities "a lot" is a more useful figure for severe illness, with the same caveats.

**For researchers.** Use the series to track self-identified long COVID within each data collection period, not across the July 2022 change. Do not use the subgroup tables as risk factors after infection. Do not use the duration tables as illness duration.

**For survey designers.** A successor survey should ask the symptom questions of everyone, so background rates can be subtracted. It should record whether symptoms followed a reinfection. It should include a short PEM question, such as items from the DePaul Symptom Questionnaire, and a question on orthostatic symptoms. Publishing an analysis of attrition by long COVID status would show the direction of the main bias.

## Final assessment

The release measures something narrow, and measures it well. A probability-based panel of about 270,000 respondents, weighted to the UK population, asked the same clearly worded question every month. The release is transparent about what that question is, publishes full tables with confidence intervals, and names its main limitations. It disclosed and corrected a weighting error. As an estimate of how many people in UK households see themselves as having long COVID, it is the best available UK figure for that period.

What keeps the grade from being higher is the gap between that narrow measure and the uses the number invites, which the release does too little to close. There is no comparison group, so the figure cannot be read as illness caused by infection. ONS's own controlled analysis found a much lower figure for persistent symptoms. About seven in eight invited address-list households did not take part, and nothing shows whether long COVID affected who stayed in. The definition counts suspected infections, four weeks of symptoms of any severity, and people with no limitation at all. The change of data collection method breaks the series at the point where the estimate jumped, and ONS's own quality report found the new method raised symptom reporting. The main points present subgroup patterns without caveats about infection rates and reverse causation.

What keeps it from being lower is that the release mostly claims only what it measured. Its wording is accurate and its limits are stated. The size and design of the survey make the self-report figure itself reliable, within the response bias it names. The breakdowns by activity limitation and duration let readers narrow the definition themselves.

## Executive summary

This is the Office for National Statistics' monthly release on long COVID in the UK published on 30 March 2023, apparently the last in the series. It used about 270,000 responses to a large national survey. It estimated that 1.9 million people (2.9%) living in private households described themselves as having long COVID in early March 2023. That meant symptoms more than four weeks after a confirmed or suspected infection, not explained by something else. About one in five of them (381,000) said it limited their daily activities a lot. Two-thirds had not contacted the National Health Service when first infected.

The survey is large, carefully weighted and openly reported. The release says clearly that this is self-reported long COVID, not a diagnosis. As a count of people who see themselves as having long COVID, it is the best UK figure available for that period.

It is not a count of illness caused by infection. There was no comparison group, so common symptoms like tiredness that would have happened anyway are not subtracted. ONS's own 2021 analysis with a comparison group gave a much lower figure for persistent symptoms. Infections could be suspected, not tested. Symptoms of any severity counted, including in people who said they had no limitation. Only about one in eight households invited from address lists took part, and it is unknown whether long COVID made people more or less likely to stay in. Duration is counted from the first infection, ignoring reinfections, so "two years or more" does not mean two years of illness. A change in how data were collected in mid-2022 coincided with a jump in the estimate. ONS found the new method made people more likely to report symptoms, so the trend across that point cannot be trusted. The groups with the highest rates, such as people not working, are not risk factors: the figures are not adjusted for infection rates, and long COVID may have caused the job loss. The survey did not ask about post-exertional malaise or ME/CFS.

Grade: 6.5 / 10.
