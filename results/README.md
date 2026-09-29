# results/ — the receipts

Every number on [bughunt.productcompass.pm](https://bughunt.productcompass.pm) and in the [repo README](../README.md)
is generated from the files in this folder. They are appended by the private runner's publish step after each
run is scored; nothing here is edited by hand, and a row is never deleted — a superseded or voided run stays in
place, marked.

| File | What it holds |
|---|---|
| `combined-scoreboard.csv` | One row per run: strict fixes out of 105 with the per-repo split, partials, claimed-only, genuine extras, false-positive extras, wall clock, cost. |
| `repo1-scoreboard.csv`, `repo2-scoreboard.csv` | The same per repo (45 and 60 planted bugs). |
| `repo1-metrics.csv`, `repo2-metrics.csv` | Per-leg accounting: harness, requested effort, wall seconds, input / cache-write / cache-read / output / reasoning tokens, cost estimate, exit code, and a notes column with the serving path, effort evidence, pricing basis, voids and corrections. |
| `coverage.csv` | For every run, exactly which of the 105 bugs it fixed, by index (see below). |
| `runs.csv` | One line per individual run: score (total and per repo), partials, claimed-only, extras, wall clock, cost, and turns (total and per repo). A board row that averages several runs lists each of them here (see below). |
| `repo1-prompt.md`, `repo2-prompt.md` | The exact task prompt each model received. Self-contained specs. |
| `judge-calibration.md` | The judge-routing controls: re-judging under a second vendor reproduced every published arm exactly. |
| `effort-dial-probes/` | Per serving path, whether the reasoning-effort parameter does anything: token sweeps, zero-token ACP readbacks, wire readbacks, ceiling checks. Index in its README. |
| `waves.md` | The findings, wave by wave, as written when each wave landed. |

## Columns that need a definition

- **fixed** — planted bugs the judge verified as fixed in the diff. The only number in the score.
- **partial** — the diff touches the bug but does not fix it. Not counted.
- **claimed_only** — the model's report names a bug its diff does not fix. Not counted; the reason reports are not graded.
- **extras** — real, unplanted defects the model fixed on the way. Counted, shown, never added to the score.
- **false_positive_fixes** — "fixes" of things that were not bugs. Zero on every run so far. Not to be confused with the judge's **cosmetic** bucket: a no-op change such as a moved comment or a style tweak, which is neither a fix nor a defect and is excluded from this column (one Astra row briefly counted one; corrected 2026-09-10, see `waves.md`).
- **cost** kinds — `bill` (an invoice or credits delta), `list` (token estimate at published rates), `floor` (reconstructed lower bound), `free`. Never rank across kinds to the dollar.
- **effort** and its status — `verified_ceiling` (dial probed as binding and the tier is the top one offered), `verified` (probed as binding), `first_party` (a documented first-party enum, requested explicitly, not probed), `clamped` (the CLI quietly served a lower tier; published as a correction), `inert_default` (the serving path's effort parameter provably does nothing; the row says `default`).
- **turns** — model steps: every tool call (a shell command, a file read or edit, a search) plus the final answer, per repo. It is exactly what Claude Code reports as its own turn count, and the one definition every harness here can supply, so every run is counted from its own log the same way: Claude Code from its reported count, Codex CLI (which calls a whole run one turn) from its commands and edits, Grok from the tool calls in its session log, Muse Code and the Google CLIs from their tool events. A turn is a step, not a unit of work, so turns compare most cleanly within one harness. A run whose log was not kept has no turn count - blank, never estimated.
- **exit** in the metrics files — `0` is a clean leg. A non-zero row is a `VOID` leg kept as the receipt for its replacement.

## Per-bug coverage

`coverage.csv` gives, for every run, exactly which of the 105 planted bugs it fixed, so you can
check overlap yourself rather than taking a headline number on trust. Bugs are identified by a
stable **index**: 1-45 are repo 1, 46-105 are repo 2. The bug *ids* are deliberately not
published - they are the namespace of the withheld answer key, and the bench only works while
that stays withheld. The indices are frozen, so a given number means the same bug across every
regeneration and every run.

Each row's index count always equals that run's `fixed_of_105` in the scoreboards; the file is
generated from the same verdict files, never hand-edited. The live board renders this as its Coverage view:
https://bughunt.productcompass.pm/?view=coverage

## Individual runs

`runs.csv` exists because a board row is not always one run. A `- mean of N` row is an average, and until
2026-09-29 the runs behind it were published only as per-leg metrics. Each line here is one run, keyed by the
same run id the metrics files use, with the board row it belongs to (`board_row`) and whether that row is live
or superseded. A run that once had a row of its own and is now part of a mean is filed under the mean.

The file is generated with the board, never by hand. For a single-run row the figures are the row's own; for a
run inside a mean they come from that run's own verdicts and metrics, and the build refuses to publish if the
runs do not average back to the row. Where a row's cost is a corrected aggregate that the per-run receipts do
not add up to, the per-run cost is left blank with the reason in `note` rather than split by guesswork.

## What is not here

The answer keys, the seeded repositories, the per-model diffs and the judge transcripts. Publishing them would burn
both benches; the bench only works while they stay withheld. Model names are redacted from the judge packets, and
repo 2 — a private product — is described only by its stack.
