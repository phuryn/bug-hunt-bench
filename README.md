# Bug Hunt Bench — which AI coding model fixes the most real bugs?

**105 real bugs, hidden in two production codebases. Frontier coding models — GPT-6, Claude, Grok, Gemini, DeepSeek, Kimi, GLM and more — get one round per repo in their own agentic CLI (Codex CLI, Claude Code, Grok CLI, Antigravity CLI) to find and fix what they can. Every diff is graded blind against a withheld answer key. The score counts planted bugs only.**

**Live board:** [bughunt.productcompass.pm](https://bughunt.productcompass.pm) · [Method, caveats and definitions](https://bughunt.productcompass.pm/method) · [Raw data](results/) · [Findings by wave](results/waves.md)

If the numbers save you a benchmark run of your own, **star this repo** — that is what keeps the bench findable, and new models are added as they ship.

<!-- leaderboard:start -->
![Bug Hunt Bench leaderboard, the featured runs, updated Sep 6, 2026](assets/leaderboard.png?v=2026-09-06)

**Updated Sep 6, 2026 · 54 scored runs · 22 models · 39 of 105 bugs have never been fixed by any model.**

**Current leader:** GPT-6 Astra at `max` effort — **48 / 105** (24/45 on repo 1, 24/60 on repo 2).

**Best run per lab:** OpenAI: GPT-6 Astra (`max`) 48 · Anthropic: Fable 5.1 (`max`) 43 · xAI: Grok 4.6 (`xhigh`) 27 · Google: Gemini 3.7 Flash (`high`) 22 · Moonshot AI: Kimi K3 (`default`) 21 · Z.ai: GLM-5.3 (`default`) 19 · Alibaba: Qwen3.8-Max (`xhigh`) 19 · Tencent: Hy4 Preview (`high`) 18 · Meta: Muse Spark 1.2 (`xhigh`) 17 · DeepSeek: DeepSeek V4-Flash (`default`) 14

| # | Model | Harness | Effort | Fixed /105 | Repo 1 /45 | Repo 2 /60 | Extras | Wall | Cost | Date |
|--:|---|---|---|--:|--:|--:|--:|--:|--:|---|
| 1 | GPT-6 Astra | Codex CLI | max | **48** | 24 | 24 | 45 | 79 min | $31.21 | 2026-09-04 |
| 2 | GPT-6 Astra | Codex CLI | xhigh | **43** | 23 | 20 | 53 | 59 min | $24.22 | 2026-09-04 |
| 3 | Fable 5.1 | Claude Code | max | **43** | 19 | 24 | 11 | 73 min | $77.55 | 2026-09-01 |
| 4 | GPT-5.6 Sol | Codex CLI | max | **42** | 19 | 23 | 40 | 164 min | $69.61 | 2026-08-01 |
| 5 | GPT-5.6 Sol | Codex CLI | xhigh | **39** | 18 | 21 | 59 | 126 min | $52.75 | 2026-08-28 |
| 6 | GPT-6 Astra | Codex CLI | high | **35** | 19 | 16 | 40 | 40 min | $20.60 | 2026-09-04 |
| 7 | GPT-6 Astra | Codex CLI | medium | **34** | 19 | 15 | 33 | 28 min | $15.78 | 2026-09-05 |
| 8 | GPT-5.6 Sol | Codex CLI | high | **34** | 13 | 21 | 28 | 67 min | $33.92 | 2026-07-31 |
| 9 | GPT-5.6 Luna | Codex CLI | max | **33** | 17 | 16 | 31 | 86 min | $1.80 | 2026-07-31 |
| 10 | Fable 5.1 | Claude Code | high | **33** | 15 | 18 | 7 | 36 min | $41.52 | 2026-09-01 |
| 11 | GPT-5.6 Terra | Codex CLI | max | **32** | 16 | 16 | 45 | 160 min | $27.98 | 2026-08-27 |
| 12 | GPT-5.6 Sol | Codex CLI | medium | **29** | 13 | 16 | 24 | 48 min | $15.77 | 2026-09-06 |
| 13 | Fable 5.1 | Claude Code | low | **29** | 13 | 16 | 6 | 33 min | $27.27 | 2026-09-02 |
| 14 | Fable 5 | Claude Code | max | **29** | 12 | 17 | 5 | 57 min | $104.49 | 2026-08-01 |
| 15 | GPT-6 Astra | Codex CLI | low | **27** | 18 | 9 | 25 | 32 min | $11.69 | 2026-09-05 |
| 16 | Grok 4.6 | Grok Build CLI (ACP) | xhigh | **27** | 8 | 19 | 16 | 41 min | $16.96 floor | 2026-08-28 |
| 17 | Opus 5 | Claude Code | max | **27** | 13 | 14 | 2 | 60 min | $51.33 | 2026-08-01 |
| 18 | Opus 5 | Claude Code | xhigh | **26** | 14 | 12 | 3 | 50 min | $59.59 | 2026-08-28 |
| 19 | Opus 5 | Claude Code | medium | **24** | 11 | 13 | 4 | 30 min | $34.77 | 2026-08-27 |
| 20 | Fable 5 | Claude Code | high | **24** | 9 | 15 | 3 | 31 min | $68.07 | 2026-07-26 |
| 21 | GPT-5.6 Luna | Codex CLI | xhigh | **23** | 10 | 13 | 53 | 136 min | $2.50 | 2026-08-28 |
| 22 | Grok 4.6 | Grok Build CLI (ACP) | high | **23** | 7 | 16 | 16 | 33 min | $15.73 floor | 2026-08-28 |
| 23 | Grok 4.6 | Grok Build CLI (ACP) | medium | **22** | 9 | 13 | 11 | 26 min | $5.80 floor | 2026-08-28 |
| 24 | Gemini 3.7 Flash | Gemini CLI (retired) + model-pinning gateway | high | **22** | 8 | 14 | 4 | 97 min | $8.43 | 2026-08-24 |
| 25 | Kimi K3 | Claude Code / OpenRouter | default | **21** | 4 | 17 | 6 | 108 min | $25.27 | 2026-07-26 |
| 26 | Opus 5 | Claude Code | high | **21** | 11 | 10 | 6 | 37 min | $38.77 | 2026-07-26 |
| 27 | GPT-5.6 Terra | Codex CLI | xhigh | **20** | 9 | 11 | 29 | 57 min | $8.98 | 2026-08-28 |
| 28 | Gemini 3.8 Flash | Antigravity CLI | high | **20** | 7 | 13 | 6 | 30 min | $9.78 | 2026-09-02 |
| 29 | GLM-5.3 | Claude Code / OpenRouter | default | **19** | 8 | 11 | 4 | 67 min | $19.73 bill | 2026-08-25 |
| 30 | Qwen3.8-Max | Claude Code / Alibaba API | xhigh | **19** | 5 | 14 | 6 | 148 min | $31.10 | 2026-08-03 |
| 31 | Hy4 Preview | Claude Code / OpenRouter | high | **18** | 9 | 9 | 2 | 68 min | $3.13 bill | 2026-08-28 |
| 32 | GPT-5.6 Terra | Codex CLI | high | **18** | 7 | 11 | 17 | 28 min | $5.89 | 2026-08-27 |
| 33 | Grok 4.5 | Grok Build CLI (ACP) | high | **17** | 5 | 12 | 10 | 28 min | $8.50 floor | 2026-08-06 |
| 34 | Muse Spark 1.2 | Claude Code / Meta API | xhigh | **17** | 6 | 11 | 12 | 36 min | $13.99 | 2026-08-06 |
| 35 | Ox Alpha (stealth) | Claude Code / OpenRouter | default | **16** | 8 | 8 | 3 | 59 min | free | 2026-08-25 |
| 36 | Gemini 3.7 Flash | Antigravity CLI | high | **16** | 4 | 12 | 2 | 23 min | $6.36 | 2026-08-28 |
| 37 | GPT-5.6 Terra | Codex CLI | medium | **15** | 4 | 11 | 6 | 20 min | $3.87 | 2026-08-27 |
| 38 | Grok 4.6 | Grok Build CLI (ACP) | low | **15** | 6 | 9 | 9 | 18 min | $4.14 floor | 2026-08-27 |
| 39 | DeepSeek V4-Flash | Claude Code / OpenRouter | default | **14** | 6 | 8 | 0 | 48 min | $1.52 bill | 2026-08-01 |
| 40 | Muse Spark 1.2 | Claude Code / OpenRouter | default | **14** | 3 | 11 | 3 | 65 min | $19.52 bill | 2026-08-06 |
| 41 | GPT-5.6 Luna | Codex CLI | high | **13** | 5 | 8 | 22 | 64 min | $0.57 | 2026-07-31 |
| 42 | GLM-5.3 Flash | Claude Code / OpenRouter | default | **13** | 6 | 7 | 4 | 57 min | $0.79 bill | 2026-08-27 |
| 43 | DeepSeek V4-Pro | Claude Code / OpenRouter | default | **10** | 5 | 5 | 1 | 28 min | $5.54 bill | 2026-08-01 |
| 44 | GPT-5.6 Luna | Codex CLI | medium | **9** | 5 | 4 | 5 | 15 min | $0.33 | 2026-08-27 |
| 45 | Sonnet 5 | Claude Code | high | **9** | 1 | 8 | 4 | 33 min | $15.12 | 2026-07-26 |
| 46 | Opus 4.8 | Claude Code | high | **9** | 2 | 7 | 1 | 35 min | $19.35 | 2026-07-26 |
| 47 | GPT-5.6 Luna | Codex CLI | low | **4** | 0 | 4 | 1 | 6 min | $0.10 | 2026-08-27 |

Extras are real, unplanted defects a model fixed on the way; they are counted and never added to the score. Costs are token estimates at published list rates unless tagged **bill** (an actual invoice or credits delta) or **floor** (a reconstructed lower bound). `default` effort means the serving path had no working effort dial; *ran lower* marks a run whose CLI quietly replaced the requested tier. Wall clock is repo 1 plus repo 2 agent time, dependency install excluded.
7 superseded re-runs stay in the CSVs and on the [live board](https://bughunt.productcompass.pm/?preset=all) but are left off this table.
<!-- leaderboard:end -->

## What Bug Hunt Bench is

A benchmark of AI coding agents on the job they are actually sold for: reading an unfamiliar, real codebase and fixing what is wrong with it. Not a puzzle set, not a single-file task, not a synthetic repo.

- **Two unrelated production codebases.** Repo 1 is a ~28K-line TypeScript VS Code extension (45 planted bugs). Repo 2 is a ~60K-line React / TypeScript LMS on Supabase Edge Functions and Clerk (60 planted bugs). Nothing is shared between them but the language.
- **The bugs are real.** All 60 repo-2 bugs are regressions that actually shipped and were later fixed, each re-introduced from its own fix commit. On repo 1, 16 of the 45 are real reverted fixes and 29 were authored in the same style. The test suites were kept green when the bugs went in, so a passing suite points at nothing.
- **Every model gets the identical prompt** ([repo 1](results/repo1-prompt.md), [repo 2](results/repo2-prompt.md)): find and fix as many planted bugs as you can, keep the checks green without weakening tests, write a `BUGS_FOUND.md`. One round per model per repo, no network, no git history, in the CLI its own vendor ships.
- **The diff is the ground truth, not the report.** A model's own claim of what it fixed is not scored. An independent judge model compares the resulting diff against the withheld answer key without knowing which model produced it.

## How to read the score

- **Fixed /105** is the only number in the score: planted bugs whose fix the judge verified in the diff. No partial credit.
- **Extras** are real defects a model fixed that nobody planted. They are real work — one model found 38 of them in a single wave — but the set has no answer key and no ceiling, so counting them would reward volume. They are tracked in their own column and never added.
- **Claimed only** means the model's report named a bug that its diff does not fix. It is the failure mode this bench was built to catch, and it is why reports are not graded.
- **Cost** is tagged by kind: a real bill, a token estimate at list rates, a reconstructed floor, or free. They are not interchangeable and none is a quote.
- **Effort** is the reasoning tier the run was *served* at, not the tier that was requested. Where a CLI silently ran a lower tier the row says so; where an aggregator's effort parameter provably does nothing the row says `default`.

## FAQ

### Which AI coding model fixes the most bugs?

The table above is the answer as of its date, and the [live board](https://bughunt.productcompass.pm) is the same data with filters, two cost-and-time maps and a per-bug coverage view. Read the leader with its effort tier: a model at `max` and the same model at `medium` are different rows for a reason.

### Is this a real-world benchmark, or synthetic?

Real. The codebases are production repos with their own tests, docs and history; the bugs are shipped regressions re-introduced from their fix commits (all of repo 2, a third of repo 1); the task is the one a developer would give an agent. What is synthetic is only the *selection*: a fixed set of 105 defects, so that every model is measured against the same thing.

### Why is the score out of 105 and not a percentage?

Because 105 is the number of planted bugs and the two repos are not equally hard. A percentage would hide that repo 1 carries 45 of them and repo 2 carries 60, and that models rank differently on each — the per-repo columns are there because one repo was not enough to rank the middle of the field.

### Why are extra fixes not counted?

Some models "bug-max": they report a long list of real but irrelevant problems. Those fixes are often genuine, but the set has no answer key and no ceiling, so it cannot be scored reliably, and adding it would reward the model that touches the most files. Extras are counted, shown, and kept out of the score. On this board, zero false-positive fixes have been recorded on either repo: every extra any model applied was a real defect.

### Who grades, and can a model grade its own work?

An independent judge model grades each diff against the answer key, blind — it never sees which model produced the submission, and model names are redacted from the packet. No model grades itself or a sibling from the same lab: OpenAI arms are graded by Grok, everything else by GPT-5.5 through Codex. Whether the score depends on the judge was checked directly — all six early repo-1 arms reproduced exactly under a second judge from a different vendor — and the receipts are in [results/judge-calibration.md](results/judge-calibration.md).

### How noisy is a single run?

One round per model per repo, so treat `fixed` as ±1 and extras as ±2. Same-setting variance has been measured: three Grok 4.5 runs on identical settings scored 16, 13 and 17. A one-fix gap between two rows is a tie. A five-fix gap is the first kind of lead on this board that clears its own variance band.

### Does reasoning effort (max, xhigh, high, medium) help?

Where the dial is real, yes, and mostly at the top: on every first-party effort dial measured so far, the top tier scored highest and the step into it was usually the largest, while the middle tiers often sit within the ±1 noise of each other. Cost per fix does not necessarily rise with the tier. On aggregator paths (OpenRouter and similar) the effort parameter is frequently inert — accepted with HTTP 200 and applied nowhere — which is why those rows are labelled `default` rather than the tier that was requested. Each dial's numbers are in the table; the write-ups are in [results/waves.md](results/waves.md).

### What do `default` and "ran lower" mean in the effort column?

`default`: the serving path had no working effort dial, so the model ran at whatever it runs at — verified by probing the path, not assumed. "Ran lower": a higher tier was requested and the CLI quietly substituted a lower one; the row is published as a correction with the evidence. A requested tier is not an applied tier, and the board only prints what was served. Probe outputs are filed under [results/effort-dial-probes/](results/effort-dial-probes/).

### Are the costs real bills?

Some are. Each cost carries a kind: **bill** (an invoice or a credits delta), **list** (a token-count estimate at published rates — the case for subscription-covered CLI runs), **floor** (a reconstructed lower bound, where a CLI reports context occupancy rather than spend), or **free**. Listed and billed figures can diverge: one aggregator run listed at $1.26 billed $5.54 because a cache discount was never applied. Do not rank costs across kinds to the dollar.

### Could a model have seen the answers? Is the benchmark contaminated?

The answer keys, the seeded sources and the per-model diffs are withheld and are not in this repository — publishing them would burn both benches. During a run a model has no network access and no git history. Repo 1 is derived from a public open-source extension, so a model may know the *fixed* code; it cannot know which 45 defects were planted, and the field's repo-1 scores (2 to 24 of 45) do not suggest recall. Bug identifiers are never published either: per-bug coverage uses frozen indices, not ids.

### Can I run it on my own model, or reproduce a row?

Not directly: the seeded repositories are withheld to keep the bench usable. What is public is everything needed to check a number — the exact prompts, every scoreboard and metrics row, per-bug coverage by index, the judge calibration, and the effort-dial probes. To get a model on the board, [open an issue](https://github.com/phuryn/bug-hunt-bench/issues/new/choose) with the model, the first-party CLI it ships with and the serving path; runs are added as models become reachable.

### Why is model X not on the board?

Either it has not shipped a first-party agentic CLI or an API path that the harness can drive, or it has not been run yet. New models are usually run on launch day when access opens; a run is announced on the board with its date.

### Which bugs has nothing ever fixed?

The count of bugs never fixed by any model in any run is in the header of the table above, and the [Coverage view](https://bughunt.productcompass.pm/?view=coverage) on the live board shows exactly which indices each run fixed and where models overlap. The survivors are the interesting part of the set.

### How do I cite this?

> Huryn, P. *Bug Hunt Bench: 105 real bugs, two production repos, frontier coding models graded blind.* https://bughunt.productcompass.pm — data: https://github.com/phuryn/bug-hunt-bench

## What is in this repository

| Path | What it is |
|---|---|
| [`results/`](results/) | The receipts. Scoreboards (combined and per repo), per-leg metrics with tokens, wall clock and cost, per-bug coverage by index, the exact prompts, judge calibration, effort-dial probes, and the wave-by-wave findings. See [results/README.md](results/README.md) for the column definitions. |
| [`results/waves.md`](results/waves.md) | Findings, wave by wave, from the first seven-model run onward. |
| [`data/benchmark.json`](data/benchmark.json) | Everything the site renders, generated from the scoreboards. Never edited by hand. |
| `index.html`, `method.html`, `assets/` | The site itself: static HTML, CSS and vanilla ES modules, no build step. How it is built: [docs/site.md](docs/site.md). |
| `assets/leaderboard.png`, `og-image.png` | The current leaderboard card, exported through the site's own PNG export on every update. |

The runner, the answer keys, the seeded repositories and the judge transcripts live in a private repository. Numbers flow one way: runs are scored there, receipts are published here, the site is generated from the receipts. No figure on the board or in this README is typed by hand.

**Issues yes, pull requests no.** There is nothing here to edit by hand: a hand edit would be overwritten on the next wave, so pull requests are closed automatically. [Issues](https://github.com/phuryn/bug-hunt-bench/issues) are open for two things: a number that disagrees with a receipt, and a model that should be on the board. Details: [CONTRIBUTING.md](.github/CONTRIBUTING.md).

## Author and license

Built and run by [Pawel Huryn](https://www.productcompass.pm) — [Product Compass](https://www.productcompass.pm), [X](https://x.com/PawelHuryn), [LinkedIn](https://www.linkedin.com/in/pawel-huryn). Related: [pm-skills](https://github.com/phuryn/pm-skills), agent skills for product managers.

MIT. Use anything; a link back is appreciated. If a number in a post and a receipt here disagree, the receipt wins and I want to know: [open an issue](https://github.com/phuryn/bug-hunt-bench/issues/new/choose).
