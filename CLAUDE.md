# Notes for Claude sessions on this repo

- Do not write public text other than the reviews themselves: no About page prose, citations,
  methods wording or site copy unless the editor asks for that exact change. When the editor
  supplies wording, use it verbatim.
- `main` is the live site. Review drafts (`draft: true`) go straight to `main`, even if the
  session was told to use another branch. The editor's preview page, `/admin/preview/<slug>`,
  reads `main`, so a draft anywhere else cannot be seen or published. Everything else (code,
  site text, changes to a published review) goes on a branch and reaches `main` only when the
  editor says to merge.
- To push a draft: the commit holds only that review's `.md` and `.process.json`. Put it on top
  of the latest `main` (`git fetch origin main && git rebase origin/main`), run the checks
  below, then `git push origin HEAD:main`. If the branch carries other unmerged commits, ask
  first. Never remove `draft: true` unless the editor says so.
- Never put the editor's name in files, commits or pull requests.
- When you change a review after its session handed it over (a correction, a re-grade), add
  `{"date": "YYYY-MM-DD", "summary": "..."}` to `changes` in its `.process.json`, saying what
  changed and why. Never edit `original` there: readers see the review compared against it.
- Before pushing: `npm run typecheck`, `npm test`, `npm run check:abbreviations`.
