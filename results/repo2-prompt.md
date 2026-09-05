This repository is a Vite/React/TypeScript application backed by Supabase Edge Functions
and Clerk organization identity. A number of subtle bugs have deliberately been planted across
`src/` and `supabase/functions/`. The code typechecks, the production
bundle builds, and the shipped local test suite passes, so the planted bugs are runtime
logic/behavior defects rather than syntax errors. A green suite does not prove a file is clean.

Your task:

1. Find and fix as many planted bugs as you can. Edit source files in place.
2. Keep the repository healthy:
   - `npm test` must pass (local unit tests, TypeScript, and a syntax parse of every source file
     including the Deno edge functions, which the tsconfig does not cover).
   - `npm run build` must pass.
   Do not weaken, skip, or delete tests to make them pass. Adding tests is allowed but not required.
3. When finished, write `BUGS_FOUND.md` at the repository root. Use one numbered entry per bug you
   fixed. For each entry give the file and approximate line, user-visible symptom, root cause, and
   exact fix. End with a section titled `Suspected but not fixed`.

Important boundaries:

- Work only from this repository. It has no git history and no network-backed test harness.
- Do not contact a deployed Supabase, Clerk, Vimeo, OpenAI, Netlify, or other external service.
- The removed integration/E2E suites were the only end-to-end permission-matrix checks. The green
  local suite covers unit behavior, type safety, and the frontend build only.
- Product and architecture specifications live under `documentation/`, especially
  `permissions.md`, `architecture.md`, `database.md`, `courses.md`, and `quizzes.md`.
- Prioritize genuine behavior defects over style opinions. Keep fixes narrow and avoid unrelated
  refactors.
