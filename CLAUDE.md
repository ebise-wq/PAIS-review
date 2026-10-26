# Notes for Claude sessions on this repo

- Do not write public text other than the reviews themselves: no About page prose, citations,
  methods wording or site copy unless the editor asks for that exact change. When the editor
  supplies wording, use it verbatim.
- `main` is the live site. Work on a branch; nothing reaches `main` until the editor says to merge.
- Never put the editor's name in files, commits or pull requests.
- When you change a review after its session handed it over (a correction, a re-grade), add
  `{"date": "YYYY-MM-DD", "summary": "..."}` to `changes` in its `.process.json`, saying what
  changed and why. Never edit `original` there: readers see the review compared against it.
- Before pushing: `npm run typecheck`, `npm test`, `npm run check:abbreviations`.
