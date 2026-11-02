# Notes for Claude sessions on this repo

- Do not write public text other than the reviews themselves: no About page prose, citations,
  methods wording or site copy unless the editor asks for that exact change. When the editor
  supplies wording, use it verbatim.
- `main` is the live site. Work on a branch; nothing reaches `main` until the editor says to merge.
  One exception: a review that is still a draft (`draft: true`) is pushed straight to `main`,
  even if the session was told to use another branch. The editor's preview page,
  `/admin/preview/<slug>`, reads `main`, so a draft on any other branch cannot be seen or
  published. The commit holds only that review's `.md` and `.process.json`. Put it on top of
  the latest `main` (`git fetch origin main && git rebase origin/main`), run the checks below,
  then `git push origin HEAD:main`. If the branch carries other unmerged commits, ask first.
  Never remove `draft: true` unless the editor says so. Code, site text and changes to a
  published review still go on a branch.
- Never put the editor's name in files, commits or pull requests.
- When you change a review after its session handed it over (a correction, a re-grade), add
  `{"date": "YYYY-MM-DD", "summary": "..."}` to `changes` in its `.process.json`, saying what
  changed and why. Never edit `original` there: readers see the review compared against it.
- Before pushing: `npm run typecheck`, `npm test`, `npm run check:abbreviations`.
