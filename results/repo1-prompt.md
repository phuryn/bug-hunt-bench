This repository is a VS Code / Cursor sidebar extension — an ACP (Agent Client Protocol) client for xAI's Grok CLI. A number of subtle bugs have been deliberately planted across `src/` and `media/`. The code compiles cleanly (`npx tsc -p . --noEmit`) and the full test suite passes (`npm test`), so the planted bugs are runtime logic/behavior defects, not crashes or syntax errors. Be aware that some tests that would have caught a planted bug were neutralized when the bug was planted — a green suite does not prove a file is clean.

Your task:

1. Find and fix as many of the planted bugs as you can. Edit the source files in place.
2. Keep the repo healthy: `npx tsc -p . --noEmit` must stay clean and `npm test` must still pass after your fixes. Do not weaken, skip, or delete existing tests to make them pass — fix the source. Adding new tests is allowed but not required.
3. When you are done, write a report to `BUGS_FOUND.md` at the repository root: one numbered entry per bug you fixed, each with the file and approximate line, the symptom a user would see, the root cause, and the exact fix you made. Add a final section titled "Suspected but not fixed" for anything you flagged but chose to leave alone.

Notes:
- `CLAUDE.md` documents the architecture and module map.
- There is no git history and no network access — work only from the code in this repository.
- Prioritize genuine planted defects over style opinions; do not refactor beyond what a fix requires.
