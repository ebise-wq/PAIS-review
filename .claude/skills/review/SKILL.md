---
name: review
description: Peer-review a scientific paper against the PAIS review guide and write it into this site as a publishable review file. Use when the user supplies a paper (PDF, link, DOI or pasted text) and asks for a review, a critique, an appraisal, or a grade.
---

# Review a paper for this site

Produce one file at `content/reviews/<slug>.md` that is ready to publish.

**Read `content/instructions.md` in full and follow it.** It holds every rule for what a review
says and how it is written: how to work, access to the full text, the order of writing, the
frontmatter, kinds and grades, context, the body, abbreviations. This skill adds only the steps
particular to writing a review straight into this site; where the two seem to differ, the
instructions win.

Two things in the instructions read differently here:

- Where they say to fetch `{{SITE_URL}}/guide.md`, read `content/guide.md`. Where they say
  `{{GUIDE_VERSION}}`, use the `version` in its frontmatter.
- The section "In a conversation" is for claude.ai. Here, write straight into the file, in the
  order the instructions give: the analysis, then the executive summary, then the frontmatter.

## Before writing

1. Read `content/instructions.md` and `content/guide.md`.
2. Check whether a review of this paper already exists in `content/reviews/`.
3. Save the text of every source you rely on — the paper, the supplement, the protocol, cited
   papers — as plain-text files in your scratchpad, one per source. The fact check after
   writing reads these, not your memory of them.

## Writing

- File name: `content/reviews/<year>-<first-author-or-topic>-<short-descriptor>.md`, lowercase
  and hyphenated. For example `2024-lidocaine-hpbcd-post-covid.md`.
- Tags: `conditions` are names, and `design` and `topics` are ids, from `content/tags.json`.
- `effort`: in a Claude Code cloud session, call the `get_session` tool (claude-code-remote)
  with no session ID and read `session_context.model` and `external_metadata.effort_level`. The
  effort can change during a session, so read it when you write the frontmatter. The page shows
  it as "claude-opus-5-5 (high effort)".
- Abbreviations: `npm run check:abbreviations -- content/reviews/<file>.md` lists anything not
  written out at first use and any abbreviation in the frontmatter. It is a rough check; fix
  what it finds, or say what a name is where it is a name.

## After writing

1. **Blind fact check.** Spawn one fresh agent with the Agent tool. Give it only the path to
   the review file and the paths to the source files you saved, and tell it: check every
   factual claim in the review — numbers, quotes, who said or did what, what a source does or
   does not report — against those files; do not judge the grade, the framing or the
   argument; do not use the web or its own memory of the paper; report each claim that is
   wrong, unsupported by the files, or internally inconsistent with another part of the
   review, quoting the review and the source, and label each one:
   - **major** — correcting it would change the grade, the verdict, or a listed strength or
     weakness;
   - **moderate** — it changes what a section argues, but not the grade or the verdict;
   - **minor** — a detail that changes no argument: a number with no consequence, a
     misattributed quote, a citation detail.

   Do not give it your conversation, your reasoning or your view of the paper. Fix what it
   finds that is right. If a fix changes the analysis enough to change the grade, change the
   summary and the frontmatter together. Tell the user what it found, with the labels, and
   what you changed.

   Then record every finding, right or not, in `content/reviews/<file>.process.json` beside
   the review. Readers see this list under the review, so record the fact check's findings
   as it gave them, and do not leave out the ones you rejected:

   ```json
   {
     "factCheck": {
       "findings": [
         {
           "severity": "moderate",
           "claim": "<what the review said, quoted as it was before any fix>",
           "issue": "<what the fact check reported, in one or two sentences>",
           "source": "<what the source says, quoted, if the fact check gave it>",
           "outcome": "fixed",
           "response": "<only for partly or disputed: why, in one or two sentences>"
         }
       ]
     }
   }
   ```

   `outcome` is `fixed`, `partly` (some of it was right) or `disputed` (you checked and it
   was wrong). `response` is required for `partly` and `disputed`: say what in the source
   shows it, plainly, without arguing. If the fact check found nothing, write
   `"findings": []`.
2. Run `npm run build` to confirm the frontmatter parses, the grade line matches the score,
   and the site still builds.
3. Show the user the verdict, score, strengths and weaknesses before committing.
4. Fill in `read` from what you actually opened in this session, one line per thing, saying
   what it was and how you read it: the full text and where it came from, which figures you
   saw as images and which only from captions, which supplementary files, and every link you
   fetched. Not what exists, and not what you remember about the paper.
5. Record how the review was made: `npm run -s session-stats -- content/reviews/<file>.md`.
   It adds the session's token use and active time, the code version, and the review as it
   stands now (readers see later changes compared against it, so run it after your own
   fixes) to the `.process.json` file, and checks the findings you wrote; fix anything it
   reports. The totals cover the whole session, so
   write one review per session. Commit the `.process.json` file with the review.
6. Save it as a draft: add `draft: true` to the frontmatter. Commit and push only when the
   user says so. A draft is not on the site; the user reads it in the site design at
   `/admin/preview/<filename without .md>` and publishes it from the top of that page, which
   is also where they set the human-input level. Give them that link after pushing.
7. Do not set `humanInput` yourself: only the user knows how much they changed. If they tell
   you the level and ask you to publish directly, set `humanInput` to their answer and leave
   out `draft`.
