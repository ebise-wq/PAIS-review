# PAIS Review

A small site that publishes reviews of research on post-acute infection syndromes
(PAIS) — ME/CFS, Long Covid and related conditions. Each review is written by Claude against
[the review guide](content/guide.md), graded out of 10, and published here with its main
strengths and weaknesses on the front page.

Reviews are plain markdown files in `content/reviews/`. There is no database. Git is the
record: every review's edit history is public, which is the point.

## Publishing a review

Two routes, both of which end up as a commit to `content/reviews/`.

**From Claude Code.** Give Claude the paper and run `/review`. It reads the guide, writes the
file, and builds the site to check the frontmatter parses. Review what it wrote, then commit
and push. Vercel redeploys.

**From the browser.** Go to `/admin` and sign in — the session lasts 30 days on that device, so
publishing several reviews does not mean retyping the password. Paste the whole review file
into the box — frontmatter and all, exactly as Claude wrote it. Everything is read from that
frontmatter, so there are no fields to fill in by hand. A preview appears underneath showing the
review exactly as it will look on the index; if the frontmatter is missing something, you get a
named error instead. Publishing commits the file through the GitHub API, which triggers the same
redeploy.

The filename is derived from the title. Override it only if you want something shorter.

**Tidy up with Claude** converts review text that is not already in this format — an older
review, a chat transcript, anything — into a publishable file. It restructures only: it never
invents a grade, never softens a judgement, and never appends a section summarising what
changed. If the source states no overall grade, it leaves the score unset for you to fill in
rather than guessing one. Needs `ANTHROPIC_API_KEY`; see the deployment table below.

The "Edit a page" tab does the same for the About and Methods pages, the guide and the
instructions: it loads the current markdown, you edit it, publishing commits it.

It also has **Site text**: one labelled box for each piece of public text that is not a page —
the pilot banner, the footer, the home page heading and intro, section headings and labels on
review pages, the comment and rating prompts, the instruction sent with "Discuss with AI", and
the search-engine descriptions. Each box says where the text appears, which ones differ from
the default, and which have unsaved edits; "Reset to default" restores the original. Longer
boxes take markdown, so links and bold work. Publishing commits `content/site-text.json`, which
stores only the fields that differ from their defaults; the fields themselves and their
defaults are defined in `src/lib/site-text-schema.ts`. A save made from a tab that is out of
date is refused rather than overwriting the newer text. A broken file falls back to the
defaults instead of breaking the site.

**Drafts.** "Save as draft" on the publish form, or `draft: true` from the `/review` skill,
commits a review that is not on the site. Signed in, you read it at `/admin/preview/<slug>`,
rendered exactly as the public page will be, apart from comments and ratings. A banner at the
top sets the human-input level and publishes it. Anyone not signed in sees only a prompt to
sign in. The repository itself is public, so a draft's text can be read on GitHub by anyone
who looks there; it is kept off the site, not secret.

The "Reviews" tab lists every review, drafts included, with Preview and Publish for drafts and
Withdraw for public reviews, and
collects the `guideNotes` that reviews have flagged for the next guide version. Withdrawing sets
`draft: true` — the review and its raw URL vanish from the site at once and it can be put back;
the commit history keeps the text. A takedown that needs the text gone from the repository is a
deliberate git step, not a button.

## Review file format

```yaml
---
title: "Paper title"
authors: "Surname AB, Surname CD, Surname EF"  # full list; the site shows 3 + "et al." with an expander
journal: "Journal name"
year: 2024
doi: "10.xxxx/xxxxx"        # optional
url: ""                     # optional; used in preference to the DOI
conditions: ["ME/CFS"]      # becomes the index filters
studyType: "RCT, n=240"
kind: paper                 # paper | literature | preliminary
preprint: true              # papers only, if not yet peer reviewed; leave out otherwise
score: 6.5                  # papers only, preprints included, 0–10 in steps of 0.5
verdict: "One sentence. Shows on the index under the title."
confidence: "high"          # optional: high | moderate | low
importance: "moderate"      # optional: high | moderate | low
strengths: ["Short clause"] # become chips on the index
weaknesses: ["Short clause"]
context:                    # optional; see below
  - note: "A fact outside the paper that bears on reading it."
    source: "https://..."
guideNotes:                 # optional: points the guide doesn't cover, for the editor
  - "Nothing in the guide on cluster-randomised designs"
reviewedOn: 2026-09-16
guideVersion: "0.2"
model: "claude-opus-5"      # the exact model, not a generic "Claude"
humanInput: minor           # none | minor | moderate | major — set by the editor, never the model
draft: false                # true keeps it off the site
---
```

`title`, `kind`, `verdict` and `reviewedOn` are always required. The build fails with a named
error if one is missing or malformed, so a broken review cannot reach the site silently.

The body starts at `##`. The page supplies the H1.

### kind, and what verdict each takes

| kind | verdict field | why |
|---|---|---|
| `paper` (default) | `score`, 0–10 | A single study can be graded on whether its evidence carries its claims. Preprints are papers, marked `preprint: true`, graded the same way and tagged "Preprint" on the site. |
| `literature` | neither | "How good is this body of evidence" is not the question the 0–10 scale answers. The verdict sentence carries it. |
| `preliminary` | `signal` | Unpublished data, conference abstracts, company announcements — not preprints. One of `promising`, `mixed`, `unconvincing`, `too-early` — a decimal grade here would be false precision. |

Supplying the wrong one is rejected with an explanation, rather than silently accepted.

Score bands for papers, used for the colour and the label under the number: 8+ Strong,
6.5–7.9 Solid, 5–6.4 Borderline, 3–4.9 Fails, below 3 Fatal flaws.

### Abbreviations and technical language

House rule: every abbreviation is written out in full at first use, and the frontmatter has
none, except in the title or ones as familiar as ME/CFS. The frontmatter and the executive
summary are what most readers see, so they introduce technical language with care. The
`/admin` preview warns about both, and `npm run check:abbreviations` checks any review file
from the command line. It is a heuristic (`src/lib/abbreviations.ts`): a name such as a
trial or a database passes when a word next to it says what it is ("the PACE trial").

### humanInput

How much the editor changed the model's text: `none`, `minor`, `moderate` or `major`. Only the
editor knows this, so the model never sets it. The `/admin` publish form asks for it and will
not publish without it; the Reviews tab sets it on reviews published before it existed. The
review page shows it with a short explanation of the level, editable under Site text. A
review without it says "Not recorded".

### context

Facts outside the paper that bear on how to read it — a funder's history, a market reaction, an
undisclosed tie. These publish as statements of fact about named people and organisations, so
each note should carry a `source` URL; the site marks unsourced notes as unsourced and `/admin`
warns before publishing one. They render in their own panel, labelled as circumstance rather
than as part of the methodological assessment.

## The method, and its one version number

Reviews are written in Claude Code with the review skill (`.claude/skills/review/SKILL.md`),
which follows the reviewing instructions (`content/instructions.md`) and the guide
(`content/guide.md`). The guide and the instructions share one version number, kept in the
guide's frontmatter, and every review records which version it was written under. Saving either
from `/admin` requires a new version, which the editor writes into the guide's changelog for you.

`/methods` explains the whole thing publicly and shows the instructions and the skill in full.
Raw markdown URLs, for pointing a model at:

| URL | What it is |
|---|---|
| `/guide.md` | The guide. |
| `/instructions.md` | The reviewing instructions, version and site URL filled in. |
| `/review-skill.md` | The review skill, as the repository has it. |
| `/reviews/<slug>.md` | Any published review, frontmatter and all. |

Never hard-code a version number in the methods page. Write
`{{GUIDE_VERSION}}` and `{{SITE_URL}}`; both are filled in when served.

## Updating the guide

Edit it from the "Edit a page" tab in `/admin`, choose what kind of change it was, and write one
line saying what changed. Everything else happens on save: the version is bumped, the date is
stamped, and your line is added to the top of the guide's changelog. There is no version number
to type and no changelog to edit afterwards, whichever of the three documents you edited.

| What kind of change | Bump | Example |
|---|---|---|
| Wording or a clarification | patch | 0.3 → 0.3.1 |
| A new or changed criterion | minor | 0.3.1 → 0.4 |
| A rewrite | major | 0.3.1 → 1.0 |

The current version is read from the repository rather than from the running site, so saving
twice before the first build finishes still bumps correctly instead of reusing a number.
Saving the guide replaces the whole file, changelog included, so an editor left open across
another save is refused with a note to reload rather than silently dropping entries.

Editing `content/guide.md` by hand in git works too; then the version and changelog are yours
to update.

A review that does not state its own `guideVersion` is stamped with whatever the guide is at
publish time. A review that does state one keeps it, so importing older work does not
retroactively claim it met the current standard.

## Running it locally

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # also validates every review's frontmatter
```

## Deploying

Import the repo at [vercel.com/new](https://vercel.com/new). It is a standard Next.js app and
needs no configuration to deploy.

Environment variables, all optional — the site works without any of them, and you only need the
first four if you want the `/admin` publishing page:

| Variable | What it is |
|---|---|
| `ADMIN_PASSWORD` | Guards `/admin`. Make it long. It is the only thing between the internet and your repository. |
| `GITHUB_TOKEN` | Fine-grained personal access token, scoped to this repository only, with Contents: Read and write. |
| `GITHUB_REPO` | `owner/repository`, e.g. `your-account/PAIS-review` |
| `GITHUB_BRANCH` | Defaults to `main`. |
| `NEXT_PUBLIC_SITE_URL` | Only needed if the site moves off `pais-review.vercel.app`. Used for the sitemap and link previews. |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Shown on the About page as the corrections address. Left unset, no address is shown. |
| `ANTHROPIC_API_KEY` | Only for the "Tidy up with Claude" button in `/admin`. Without it, that button reports it is not configured and everything else works as normal. |
| `DATABASE_URL` (or any name) | Postgres, for comments and ratings. In Vercel: Storage → Create Database → Postgres (Neon), connect it to the project, and the URL is set for you under whatever prefix you chose (`DATABASE_URL`, `STORAGE_URL`, ...). The code takes any variable whose value is a Postgres URL, so the name does not matter. Tables are created on first use. Without one, the comment and rating sections do not appear. **Redeploy after connecting the database** — environment variables only reach new builds. `/api/db-status` lists the variable names it found and says whether the database answers. |
| `NORMALISER_MODEL` | Which model the tidy-up button uses. Defaults to `claude-sonnet-5`. `claude-haiku-4-5` halves the cost per review; see the note in `src/lib/normalise.ts` before switching. |

Until `ADMIN_PASSWORD`, `GITHUB_TOKEN` and `GITHUB_REPO` are all set, `/admin` loads but
publishing returns a clear "not configured" error rather than failing quietly.

## Other things the site does

- Dark by default, with a toggle in the header that is remembered per device.
- A pilot banner on every page, edited under Site text in `/admin`; empty removes it.
- Search on the index over title, authors, journal, verdict, tags, strengths and weaknesses. Not
  the body — see `docs/roadmap.md`.
- Each row on the index stacks the reader's view under the grade badge: mean rating as
  part-filled stars to one decimal, the comment count, and the time of the latest comment. Sorts: Active, newest, oldest, highest or
  lowest score, most comments, recently discussed, highest reader rating. Without a database the
  engagement sorts and the totals are simply absent.
- **Active**, the default sort, blends three things (`src/lib/ranking.ts`): a live discussion
  (comment count, damped by a logarithm, fading with a three-day half-life since the last
  comment), reader interest (how many ratings, undecayed), and freshness (one-week half-life
  since publication, so a new review is not published straight to the bottom of the page).
  Weights 3, 1 and 2. Ties break on publication date. "Highest reader rating" pulls averages
  toward 3.5 until a review has a few ratings, so a single five-star does not top the list; the
  number shown on the card is still the plain mean.
- A contents list on long reviews: collapsed bar on phones, sticky sidebar on wide screens.
- "Discuss this review with an AI" under each review: opens Claude or ChatGPT with a prompt
  pointing at the raw markdown and asking it to argue with the review rather than summarise it.
- Comments under every review and under the guide: threaded, with a self-chosen username and
  no account. Two vote axes — karma (is this a good comment) and agree/disagree — open to
  anyone, one vote per browser. A new comment starts at one karma, its author's own upvote,
  which they can take back like any other vote. Each comment records the method version it
  was written against. Any comment can be collapsed, which folds its replies with it.
  Spam defences: honeypot field, per-browser and per-network rate limits, a link cap,
  duplicate rejection. When signed in, `/admin` sessions get two buttons on each comment:
  Hide keeps the row, so replies to it are not orphaned, and shows "hidden by the editor" in
  its place; Remove deletes it and everything under it after a confirmation that names how
  many comments will go.
- Star ratings, 1–5, one per browser, under each review.
- The `.md` endpoint for a review appends its comment thread, so a model reading the review
  sees the discussion too.

## Backlog

`/admin` → Backlog is the site's own list of weaknesses, missing features, bugs and ideas,
kept in `content/backlog.md` (not served publicly, though the repository is public). Add items
with an optional priority (high, medium, low); edit, reprioritise, move to another category or
delete them; tick them off with undo; drag the ⋮⋮ handle to reorder (works by touch; arrow keys
and Top / Up / Down in the editor do the same). Categories fold, and stay folded on that device.
Edits apply at once and are saved together a moment later, so a run of drags is one commit.
Priority is stored in the line as `- [ ] [high] Item`, so the file still reads as a task list
and can be edited as text under Edit a page → Backlog; notes typed under a heading are kept.

Longer write-ups of things not built yet, and what each would take, are in `docs/roadmap.md`.

## Editorial notes

Reviews name real researchers. The About page states plainly that these are one careful reading
rather than a journal decision, and that disagreement goes to the comments first, in the open.
Reviews do get corrected; the edit history is public.

Papers themselves are never stored in this repository. Only the reviews.
