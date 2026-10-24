---
name: review
description: Peer-review a scientific paper against the PAIS review guide and write it into this site as a publishable review file. Use when the user supplies a paper (PDF, link, DOI or pasted text) and asks for a review, a critique, an appraisal, or a grade.
---

# Review a paper for this site

Produce one file at `content/reviews/<slug>.md` that is ready to publish. Read
`content/guide.md` in full first — it is the standard, and it is specific to
post-acute infection syndromes in ways generic appraisal checklists are not.

## Standing instruction

Evaluate objectively and rigorously. Be alert to bias, p-hacking, spin and hype. But be well
calibrated: do not manufacture criticism to look rigorous, and say plainly when a paper is good.
A short review of a sound paper is a correct outcome.

## Before writing

1. Read `content/guide.md`.
2. Read the paper properly. If you only have the abstract, say so at the top of the review and
   set `confidence: low` — an abstract cannot be reviewed as if it were a paper.
3. Check whether a review of this paper already exists in `content/reviews/`.
4. Where it matters, verify claims against primary sources: trial registry entries for
   pre-registration and outcome switching, the supplement for methods the main text skips,
   cited papers where a claim leans on them. Note what you could not check.
5. Save the text of every source you rely on — the paper, the supplement, the protocol, cited
   papers — as plain-text files in your scratchpad, one per source. The fact check after
   writing reads these, not your memory of them.

## Order of writing

**The judgement is written last.** Your output conditions what you write next: a grade, a
verdict or a list of weaknesses written before the analysis turns the analysis into
justification for them. So:

1. **Write the analysis first**, to `content/reviews/<slug>.md`, with no frontmatter: every
   body section from `## Study design` to `## Final assessment`. Do not decide on a number or
   a verdict while reading or before this is written, not even provisionally.
2. **Then write the executive summary**, as the last section of the body. It summarises the
   analysis you have written, and its last line states the grade: `Grade: 6.5 / 10.` for a
   paper, `Signal: promising.` for preliminary findings, nothing for literature. The page
   shows this section at the top; the file keeps it last, as a record of the order.
3. **Add the frontmatter last**, at the top of the file: the bibliographic fields, then the
   judgement fields (score, verdict, confidence, importance, strengths, weaknesses), taken
   from what the body already says. The score must match the summary's grade line; the build
   fails if they differ.

## Kind

- `paper` — one study. Takes `score`. A preprint is a paper: add `preprint: true` and grade it
  on the same scale.
- `literature` — a body of work, several papers, a field. Takes **no score and no signal**; the
  verdict sentence carries it. "How good is this body of evidence" is not the question the 0–10
  scale was built to answer, and forcing a number on it invents precision.
- `preliminary` — unpublished data, a conference abstract, a company announcement. Not a
  preprint. Takes `signal`: one of `promising`, `mixed`, `unconvincing`, `too-early`.

Supplying the wrong verdict field for the kind is rejected at publish time.

## Context beyond the paper

`context` records facts outside the paper that bear on how to read it: a funder's or author's
history, a market reaction after publication, an undisclosed tie, a regulatory action, a pattern
of self-citation. These are published as statements of fact about named people and
organisations, so:

- Include only what a citable public source supports, and put the URL in `source`.
- State it neutrally and specifically. "The sponsor's CEO was convicted of securities fraud in
  2019" — not "the company has a questionable history".
- Never speculate about motive. A fact about a funder is not a claim that the science is
  fraudulent.
- If you cannot check it, leave it out.

## Notes for the guide

If the paper surfaced a methodological point the guide does not cover, or gets wrong, record it
in `guideNotes` as a short clause. Do not apply it as if it were already in the guide and do not
edit the guide. The editor collects these for the next version.

## What to be careful of

Be very careful with received wisdom/common knowledge like "ME/CFS involves x", because in
many cases it rests on (very) weak evidence.

Be careful with parroting online comments on research — evaluate the comment in its context
rather than just parroting.

Make sure you have access to the whole paper, and ideally also graphs. Plus supplementary files
when needed.

For a paper or preprint: if you cannot open the full text, stop and ask for it (a PDF or a
link) instead of writing the review. Never review a paper from its abstract alone.

## Grading

For `kind: paper`, grade out of 10, in steps of 0.5. The grade is about how much the paper's evidence can carry
its own claims, not about how interesting the topic is or how much you like the conclusion.

- **8–10** — Strong. Design and measures support the claims. Limitations are stated and minor.
- **6.5–7.9** — Solid. Claims hold with specific caveats.
- **5–6.4** — Borderline. Real contribution, real limits; the main claim is weaker than stated.
- **3–4.9** — Does not pass. The design cannot separate the claimed effect from bias, placebo,
  regression to the mean or natural history.
- **0–2.9** — Fatally flawed. The data contradict the claim, or the method cannot produce the
  stated result at all.

**Grade holistically.** Weigh the paper as a whole: how far its evidence carries its main
claim. Do not score domains and average them, and do not apply a mechanical ceiling. A single
serious flaw can outweigh many strengths, and often will — a missing control group for a
subjective outcome is hard to make up for with sample size — but that is a judgement to make
and explain, not a rule to apply.

**Separate trustworthiness from importance.** A small careful study is not a bad study. Put
"how much would this matter if true" in `importance`, never in the score.

In the final assessment, state explicitly what prevents a higher score and what prevents a
lower one. That is what makes the grade auditable.

Set `confidence` honestly. If the paper does not describe how PEM was assessed, or the
supplement is unavailable, or the statistics cannot be checked from what is reported, say
`low` or `moderate` and name the reason in the review body.

## Output

The finished file has this frontmatter, added last (see **Order of writing**). Omit fields you
genuinely do not have rather than guessing — never invent a DOI, a journal or an author list.

Bibliographic fields — no judgement in them:

```yaml
---
title: "<paper title, plain, no trailing full stop>"
authors: "Surname AB, Surname CD, Surname EF"   # full list; the site abbreviates
journal: "<journal>"
year: 2024
doi: "10.xxxx/xxxxx"
url: ""
conditions: ["ME/CFS"]        # names from "conditions" in content/tags.json, every one that fits
studyType: "RCT, n=240, 12 weeks"
design: randomised-trial      # one id from "designs" in content/tags.json; leave out if none fits
topics: ["treatment", "me-cfs"]  # ids from "topics" in content/tags.json, every one that fits
kind: paper                   # paper | literature | preliminary
preprint: true                # papers only, if it is a preprint; otherwise leave out
humanInput: none              # set from the user's answer, never by you
reviewedOn: <today, YYYY-MM-DD>
guideVersion: "<version from content/guide.md frontmatter>"
model: "claude-opus-5"   # the model actually writing this, not a generic "Claude"
effort: "high"           # the reasoning effort you ran at, if you can find it out
```

Judgement fields — **fill in last**, from the body you have already written, after the
executive summary:

```yaml
score: 6.5                    # papers only; must match the summary's "Grade:" line
verdict: "<one sentence; the single most useful thing a reader can take away>"
confidence: "high"            # high | moderate | low
importance: "moderate"        # high | moderate | low
strengths:
  - "<short clause, not a sentence>"
weaknesses:
  - "<short clause, not a sentence>"
context:                      # optional, see above
  - note: "<a fact outside the paper that bears on reading it>"
    source: "<url>"
guideNotes:                   # optional, see above
  - "<a point the guide does not cover>"
---
```

Both blocks go in the one frontmatter at the top of the file, bibliographic fields first.

`verdict` appears on the index page under the title, so it must stand alone. "No control group,
no blinding and only subjective outcomes, so the reported improvement cannot be separated from
placebo" works. "This study has several limitations" does not.

`strengths` and `weaknesses` become chips on the index. Keep each under about 60 characters.
Two to four of each.

`model` records which model wrote the review — the exact model ID, not "Claude". It shows on
the review page. Reviews will eventually be written by more than one model, and two reviews
disagreeing is only interpretable if a reader can see what wrote each one. If you genuinely
cannot tell which model you are, leave the field out rather than guessing.

`effort` records the reasoning effort you ran at — `low`, `medium`, `high`, `xhigh` or `max`
— because the same model reviews differently at different efforts. In a Claude Code cloud
session, call the `get_session` tool (claude-code-remote) with no session ID and read
`session_context.model` and `external_metadata.effort_level`; the effort can change during a
session, so read it when you write the frontmatter. If you cannot find it, leave the field
out rather than guessing. The page shows it as "claude-opus-5-5 (high effort)".

The body starts at `##`, because the page supplies the H1. Cover the guide's domains that apply
to this paper, in roughly this order, skipping any that do not apply:

- Study design
- Sample selection — case definition, PEM ascertainment, controls, severity, comorbidity status
- Outcome measures — and specifically where each sits on the objective/performance-bias scale
- Bias — including author preconceptions and funding, which standard risk-of-bias tools miss
- Statistical and methodological issues
- Biological plausibility
- Interpretation and spin — claims versus what the data show
- What the study actually demonstrates, and what it does not
- Critical missing elements
- Recommendations, split by audience where useful
- Final assessment, with the reasoning both ways
- Executive summary — written last, ending with the grade line; shown first on the page

Quote the paper's own claims when assessing spin, so a reader can check the comparison.

Write in plain English and short sentences. Say what is wrong without sneering. The reviews name
real researchers, so criticise the evidence and the framing, never the people.

## Abbreviations and technical language

- Write every abbreviation out in full at first use, abbreviation in brackets after it:
  "post-exertional malaise (PEM)". For a name that is not an abbreviation (a trial, a
  database, a gene), say what it is the first time.
- No abbreviations in the frontmatter, except in the title or ones as obvious as ME/CFS.
- The frontmatter and the executive summary are what most readers see. Be careful with
  introducing technical language there; explain a needed term in plain words.
- First use means first in the file, which is the analysis, not the summary. The summary is
  read first on the page, so write terms out in it again, in plain words.
- Check it: `npm run check:abbreviations -- content/reviews/<file>.md` lists anything not
  written out at first use and any abbreviation in the frontmatter. It is a heuristic; fix
  what it finds, or say what a name is where it is a name.

## Filename

`content/reviews/<year>-<first-author-or-topic>-<short-descriptor>.md`, lowercase and
hyphenated. For example `2024-lidocaine-hpbcd-post-covid.md`.

## After writing

1. **Blind fact check.** Spawn one fresh agent with the Agent tool. Give it only the path to
   the review file and the paths to the source files you saved, and tell it: check every
   factual claim in the review — numbers, quotes, who said or did what, what a source does or
   does not report — against those files; do not judge the grade, the framing or the
   argument; do not use the web or its own memory of the paper; report each claim that is
   wrong, unsupported by the files, or internally inconsistent with another part of the
   review, quoting the review and the source. Do not give it your conversation, your
   reasoning or your view of the paper. Fix what it finds that is right. If a fix changes the
   analysis enough to change the grade, change the summary and the frontmatter together.
   Tell the user what it found and what you changed.
2. Run `npm run build` to confirm the frontmatter parses, the grade line matches the score,
   and the site still builds.
3. Show the user the verdict, score, strengths and weaknesses before committing.
4. Fill in `read` from what you actually opened in this session, one line per thing, saying
   what it was and how you read it: the full text and where it came from, which figures you
   saw as images and which only from captions, which supplementary files, and every link you
   fetched. Not what exists, and not what you remember about the paper.
5. Save it as a draft: add `draft: true` to the frontmatter. Commit and push only when the
   user says so. A draft is not on the site; the user reads it in the site design at
   `/admin/preview/<filename without .md>` and publishes it from the top of that page, which
   is also where they set the human-input level. Give them that link after pushing.
6. Do not set `humanInput` yourself: only the user knows how much they changed. If they tell
   you the level and ask you to publish directly, set `humanInput` to their answer and leave
   out `draft`.
