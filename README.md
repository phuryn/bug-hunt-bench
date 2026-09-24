# Bug Hunt Bench — which AI coding model fixes the most real bugs?

**105 real bugs, hidden in two production codebases. Frontier coding models — GPT-6, Claude, Grok, Gemini, DeepSeek, Kimi, GLM and more — get one round per repo in their own agentic CLI (Codex CLI, Claude Code, Grok CLI, Antigravity CLI) to find and fix what they can. Every diff is graded blind against a withheld answer key. The score counts planted bugs only.**

**Live board:** [bughunt.productcompass.pm](https://bughunt.productcompass.pm) · [Method, caveats and definitions](https://bughunt.productcompass.pm/method) · [Raw data](results/) · [Findings by wave](results/waves.md)

If the numbers save you a benchmark run of your own, **star this repo** — that is what keeps the bench findable, and new models are added as they ship.

<!-- leaderboard:start -->
![Bug Hunt Bench leaderboard, the featured runs, updated Sep 23, 2026](assets/leaderboard.png?v=2026-09-23-21e2aee1)

**Updated Sep 23, 2026 · 142 rows from 219 scored runs · 38 models · 31 of 105 bugs have never been fixed by any model.**

**Current leader:** GPT-6 Astra at `max` effort — **45 / 105** (22/45 on repo 1, 23/60 on repo 2).

**Best per lab:** OpenAI: GPT-6 Astra (`max`) 45 · Anthropic: Fable 5.1 (`max`) 43 · Meta: Muse Spark 1.3 (`max`) 32.2 · Unbiased: Pareto (ex-Union Alpha) (`default`) 30.7 · xAI: Grok 4.7 (`xhigh`) 28.8 · Alibaba: Qwen3.8-Flash (`max`) 26 · Xiaomi: MiMo-V2.6-Flash (`default`) 23.3 · Google: Gemini 3.7 Flash (`high`) 22 · DeepSeek: DeepSeek V4.1 Flash (`max`) 21.7 · Moonshot AI: Kimi K3 (`default`) 21 · Z.ai: GLM-5.3 (`max`) 19 · Tencent: Hy4 Preview (`default`) 18

| # | Model | Harness | Effort | Runs | Fixed /105 | Repo 1 /45 | Repo 2 /60 | Extras | Wall | Cost | Date |
|--:|---|---|---|--:|--:|--:|--:|--:|--:|--:|---|
| 1 | GPT-6 Astra | Codex CLI | max | 3 | **45** | 22 | 23 | 55 | 90 min | $33.03 | 2026-09-14 |
| 2 | GPT-5.6 Sol | Codex CLI | max | 2 | **43.5** | 19 | 24.5 | 48.5 | 253 min | $95.35 | 2026-09-16 |
| 3 | GPT-6 Astra | Codex CLI | xhigh | 1 | **43** | 23 | 20 | 53 | 59 min | $24.22 | 2026-09-04 |
| 4 | Fable 5.1 | Claude Code | max | 1 | **43** | 19 | 24 | 11 | 73 min | $87.18 | 2026-09-01 |
| 5 | Opus 5.5 | Claude Code | max | 3 | **41.7** | 19 | 22.7 | 9 | 67 min | $58.53 | 2026-09-23 |
| 6 | GPT-5.6 Sol | Codex CLI | xhigh | 1 | **39** | 18 | 21 | 59 | 126 min | $52.75 | 2026-08-28 |
| 7 | Opus 5.5 | Claude Code | xhigh | 3 | **36** | 17 | 19 | 13.3 | 42 min | $34.98 | 2026-09-23 |
| 8 | GPT-6 Astra | Codex CLI | high | 1 | **35** | 19 | 16 | 40 | 40 min | $20.60 | 2026-09-04 |
| 9 | GPT-6 Astra | Codex CLI | medium | 1 | **34** | 19 | 15 | 33 | 28 min | $15.78 | 2026-09-05 |
| 10 | GPT-5.6 Sol | Codex CLI | high | 1 | **34** | 13 | 21 | 28 | 67 min | $33.92 | 2026-07-31 |
| 11 | Fable 5.1 | Claude Code | high | 1 | **33** | 15 | 18 | 7 | 36 min | $48.58 | 2026-09-01 |
| 12 | Muse Spark 1.3 | Muse Code / Meta API | max | 5 | **32.2** | 14.2 | 18 | 24 | 86 min | $18.11 | 2026-09-17 |
| 13 | GPT-5.6 Terra | Codex CLI | max | 1 | **32** | 16 | 16 | 45 | 160 min | $27.98 | 2026-08-27 |
| 14 | Opus 5.5 | Claude Code | high | 3 | **31.7** | 13 | 18.7 | 10.7 | 24 min | $22.25 | 2026-09-23 |
| 15 | GPT-5.6 Luna | Codex CLI | max | 3 | **31.3** | 16 | 15.3 | 54.7 | 187 min | $3.15 | 2026-09-22 |
| 16 | Pareto (ex-Union Alpha) | Claude Code / OpenRouter | default | 3 | **30.7** | 16 | 14.7 | 10.3 | 38 min | $4.81 | 2026-09-17 |
| 17 | Opus 5.5 | Claude Code | medium | 3 | **30.3** | 12.7 | 17.7 | 13.3 | 17 min | $15.68 | 2026-09-23 |
| 18 | GPT-6 Sol | Codex CLI | max | 3 | **29.3** | 15.3 | 14 | 41.3 | 63 min | $9.33 | 2026-09-23 |
| 19 | GPT-5.6 Sol | Codex CLI | medium | 1 | **29** | 13 | 16 | 24 | 48 min | $15.77 | 2026-09-06 |
| 20 | Fable 5.1 | Claude Code | low | 1 | **29** | 13 | 16 | 6 | 33 min | $33.00 | 2026-09-02 |
| 21 | Fable 5.1 | Claude Code | xhigh | 1 | **29** | 13 | 16 | 4 | 60 min | $53.61 | 2026-09-10 |
| 22 | Fable 5 | Claude Code | max | 1 | **29** | 12 | 17 | 5 | 57 min | $112.40 | 2026-08-01 |
| 23 | Grok 4.7 | Grok Build CLI (ACP) | xhigh | 4 | **28.8** | 13 | 15.8 | 31.8 | 46 min | $22.89 floor | 2026-09-21 |
| 24 | Grok 4.6 | Grok Build CLI (ACP) | xhigh | 3 | **28.7** | 11.7 | 17 | 18 | 43 min | $18.60 floor | 2026-09-14 |
| 25 | GPT-6 Astra | Codex CLI | low | 1 | **27** | 18 | 9 | 25 | 32 min | $11.69 | 2026-09-05 |
| 26 | Opus 5 | Claude Code | max | 1 | **27** | 13 | 14 | 2 | 60 min | $54.94 | 2026-08-01 |
| 27 | Grok 4.7 | Grok Build CLI (ACP) | medium | 3 | **26.7** | 12 | 14.7 | 22.7 | 31 min | $16.76 floor | 2026-09-21 |
| 28 | Qwen3.8-Flash | Claude Code / Alibaba API | max | 1 | **26** | 13 | 13 | 7 | 97 min | $1.81 | 2026-09-11 |
| 29 | Opus 5 | Claude Code | xhigh | 1 | **26** | 14 | 12 | 3 | 50 min | $63.25 | 2026-08-28 |
| 30 | Qwen3.8-Max | Claude Code / Alibaba API | max | 3 | **25.7** | 12.3 | 13.3 | 7 | 117 min | $26.76 | 2026-09-15 |
| 31 | GPT-6 Sol | Codex CLI | xhigh | 1 | **25** | 10 | 15 | 24 | 51 min | $7.67 | 2026-09-23 |
| 32 | Opus 5 | Claude Code | medium | 1 | **24** | 11 | 13 | 4 | 30 min | $37.40 | 2026-08-27 |
| 33 | Fable 5 | Claude Code | high | 1 | **24** | 9 | 15 | 3 | 31 min | $74.52 | 2026-07-26 |
| 34 | MiMo-V2.6-Flash | Claude Code / OpenRouter | default | 3 | **23.3** | 8 | 15.3 | 7.3 | 71 min | $0.49 bill | 2026-09-22 |
| 35 | Qwen3.8-Flash | Claude Code / Alibaba API | low | 1 | **23** | 11 | 12 | 7 | 98 min | $1.37 | 2026-09-11 |
| 36 | GPT-5.6 Luna | Codex CLI | xhigh | 1 | **23** | 10 | 13 | 53 | 136 min | $2.50 | 2026-08-28 |
| 37 | Grok 4.6 | Grok Build CLI (ACP) | high | 1 | **23** | 7 | 16 | 16 | 33 min | $15.73 floor | 2026-08-28 |
| 38 | MiMo-V2.6-Pro | Claude Code / OpenRouter | default | 3 | **22.7** | 11.3 | 11.3 | 5.3 | 91 min | $0.86 bill | 2026-09-22 |
| 39 | Opus 5.5 | Claude Code | low | 3 | **22.3** | 11.3 | 11 | 9.7 | 12 min | $8.34 | 2026-09-23 |
| 40 | Grok 4.6 | Grok Build CLI (ACP) | medium | 1 | **22** | 9 | 13 | 11 | 26 min | $5.80 floor | 2026-08-28 |
| 41 | Gemini 3.7 Flash | Gemini CLI (retired) + model-pinning gateway | high | 1 | **22** | 8 | 14 | 4 | 97 min | $8.43 | 2026-08-24 |
| 42 | DeepSeek V4.1 Flash | Claude Code / DeepSeek API | max | 3 | **21.7** | 11.3 | 10.3 | 6.7 | 56 min | $0.78 bill | 2026-09-15 |
| 43 | Fable 5.1 | Claude Code | medium | 1 | **21** | 8 | 13 | 3 | 23 min | $23.73 | 2026-09-10 |
| 44 | Kimi K3 | Claude Code / OpenRouter | default | 1 | **21** | 4 | 17 | 6 | 108 min | $25.27 | 2026-07-26 |
| 45 | Opus 5 | Claude Code | high | 1 | **21** | 11 | 10 | 6 | 37 min | $41.51 | 2026-07-26 |
| 46 | Muse Spark 1.3 | Muse Code / Meta API | xhigh | 3 | **20.3** | 8 | 12.3 | 13.3 | 64 min | $13.71 | 2026-09-14 |
| 47 | GPT-6 Sol | Codex CLI | high | 1 | **20** | 10 | 10 | 15 | 34 min | $4.16 | 2026-09-23 |
| 48 | GPT-5.6 Terra | Codex CLI | xhigh | 1 | **20** | 9 | 11 | 29 | 57 min | $8.98 | 2026-08-28 |
| 49 | Grok 4.7 | Grok Build CLI (ACP) | high | 3 | **19.3** | 8.7 | 10.7 | 15.7 | 38 min | $12.29 floor | 2026-09-21 |
| 50 | DeepSeek V4.1 Flash | Claude Code / DeepSeek API | high | 1 | **19** | 9 | 10 | 4 | 26 min | $0.31 bill | 2026-09-10 |
| 51 | GLM-5.3 | Claude Code / Z.ai API | max | 1 | **19** | 9 | 10 | 2 | 40 min | $15.93 | 2026-09-10 |
| 52 | Muse Spark 1.3 | Muse Code / Meta API | high | 3 | **18.7** | 8.7 | 10 | 19.3 | 76 min | $12.94 | 2026-09-14 |
| 53 | GPT-6 Luna | Codex CLI | max | 3 | **18.3** | 6.3 | 12 | 22.7 | 99 min | $0.52 | 2026-09-23 |
| 54 | MiMo-V2.6-Pro | Claude Code / Xiaomi first-party | enabled | 1 | **18** | 9 | 9 | 4 | 75 min | $0.59 | 2026-09-22 |
| 55 | Hy4 Preview | Claude Code / OpenRouter | default | 1 | **18** | 9 | 9 | 2 | 68 min | $3.13 bill | 2026-08-28 |
| 56 | GPT-5.6 Terra | Codex CLI | high | 1 | **18** | 7 | 11 | 17 | 28 min | $5.89 | 2026-08-27 |
| 57 | Gemini 3.8 Flash | Antigravity CLI | high | 3 | **18** | 6.7 | 11.3 | 4 | 39 min | $11.03 | 2026-09-15 |
| 58 | GLM-5.3 Flash | Claude Code / Z.ai API | max | 3 | **17.7** | 9.3 | 8.3 | 3.3 | 63 min | $1.03 | 2026-09-15 |
| 59 | Grok 4.5 | Grok Build CLI (ACP) | high | 1 | **17** | 5 | 12 | 10 | 28 min | $8.50 floor | 2026-08-06 |
| 60 | Muse Spark 1.2 | Claude Code / Meta API | xhigh | 1 | **17** | 6 | 11 | 12 | 36 min | $13.99 | 2026-08-06 |
| 61 | Ox Alpha (stealth) | Claude Code / OpenRouter | default | 1 | **16** | 8 | 8 | 3 | 59 min | free | 2026-08-25 |
| 62 | GLM-5.3 Flash | Claude Code / Z.ai API | high | 1 | **16** | 9 | 7 | 4 | 62 min | $0.94 | 2026-09-13 |
| 63 | DeepSeek V4-Pro | Claude Code / DeepSeek API | max | 1 | **16** | 8 | 8 | 4 | 37 min | $1.89 bill | 2026-09-10 |
| 64 | Gemini 3.7 Flash | Antigravity CLI | high | 1 | **16** | 4 | 12 | 2 | 23 min | $6.36 | 2026-08-28 |
| 65 | Grok 4.7 | Grok Build CLI (ACP) | low | 3 | **15.7** | 10.3 | 5.3 | 18.3 | 22 min | $9.36 floor | 2026-09-21 |
| 66 | GPT-5.6 Terra | Codex CLI | medium | 1 | **15** | 4 | 11 | 6 | 20 min | $3.87 | 2026-08-27 |
| 67 | Grok 4.6 | Grok Build CLI (ACP) | low | 1 | **15** | 6 | 9 | 9 | 18 min | $4.14 floor | 2026-08-27 |
| 68 | Qwen3.8-27B | Claude Code / Alibaba API | xhigh | 3 | **15** | 5.7 | 9.3 | 2.3 | 57 min | $5.55 | 2026-09-15 |
| 69 | Opus 4.8 | Claude Code | max | 1 | **15** | 6 | 9 | 3 | 109 min | $58.11 | 2026-09-10 |
| 70 | GPT-6 Luna | Codex CLI | xhigh | 1 | **14** | 4 | 10 | 12 | 57 min | $0.39 | 2026-09-23 |
| 71 | DeepSeek V4-Flash | Claude Code / OpenRouter | default | 1 | **14** | 6 | 8 | 0 | 48 min | $1.52 bill | 2026-08-01 |
| 72 | GPT-6 Sol | Codex CLI | medium | 1 | **14** | 3 | 11 | 13 | 24 min | $2.39 | 2026-09-23 |
| 73 | GPT-5.6 Luna | Codex CLI | high | 1 | **13** | 5 | 8 | 22 | 64 min | $0.57 | 2026-07-31 |
| 74 | GLM-5.3 Flash | Claude Code / OpenRouter | default | 1 | **13** | 6 | 7 | 4 | 57 min | $0.79 bill | 2026-08-27 |
| 75 | DeepSeek V4-Pro | Claude Code / DeepSeek API | high | 1 | **13** | 4 | 9 | 1 | 27 min | $1.08 bill | 2026-09-10 |
| 76 | Muse Spark 1.3 | Muse Code / Meta API | medium | 3 | **13** | 5.3 | 7.7 | 17.3 | 58 min | $9.24 | 2026-09-14 |
| 77 | Qwen3.8-27B 8-bit | Claude Code / OpenRouter | default | 3 | **10.7** | 3.7 | 7 | 1.7 | 57 min | $2.97 bill | 2026-09-16 |
| 78 | Muse Spark 1.3 | Muse Code / Meta API | low | 3 | **9.7** | 5 | 4.7 | 6.7 | 36 min | $5.61 | 2026-09-14 |
| 79 | GPT-6 Luna | Codex CLI | high | 1 | **9** | 2 | 7 | 9 | 24 min | $0.13 | 2026-09-23 |
| 80 | GPT-5.6 Luna | Codex CLI | medium | 1 | **9** | 5 | 4 | 5 | 15 min | $0.33 | 2026-08-27 |
| 81 | GLM-5.3 Flash | Claude Code / Z.ai API | low | 1 | **9** | 7 | 2 | 4 | 29 min | $0.42 | 2026-09-13 |
| 82 | Sonnet 5 | Claude Code | high | 1 | **9** | 1 | 8 | 4 | 33 min | $17.06 | 2026-07-26 |
| 83 | Opus 4.8 | Claude Code | high | 1 | **9** | 2 | 7 | 1 | 35 min | $21.30 | 2026-07-26 |
| 84 | Sonnet 5 | Claude Code | max | 1 | **9** | 3 | 6 | 3 | 61 min | $26.94 | 2026-09-10 |
| 85 | GPT-6 Sol | Codex CLI | low | 1 | **6** | 3 | 3 | 5 | 11 min | $1.08 | 2026-09-23 |
| 86 | GPT-6 Luna | Codex CLI | medium | 1 | **4** | 2 | 2 | 0 | 9 min | $0.06 | 2026-09-23 |
| 87 | GPT-5.6 Luna | Codex CLI | low | 1 | **4** | 0 | 4 | 1 | 6 min | $0.10 | 2026-08-27 |
| 88 | Gemma 4 31B | Claude Code / OpenRouter | default | 1 | **4** | 1 | 3 | 2 | 222 min | $8.61 bill | 2026-09-16 |
| 89 | Gemma 4 31B 4-bit | Claude Code / OpenRouter | default | 1 | **3** | 1 | 2 | 2 | 25 min | $0.56 bill | 2026-09-16 |
| 90 | gpt-oss-120b | Claude Code / OpenRouter | default | 3 | **0** | 0 | 0 | 0.3 | 4 min | $0.11 bill | 2026-09-15 |
| 91 | gpt-oss-20b | Claude Code / OpenRouter | default | 3 | **0** | 0 | 0 | 0 | 7 min | $0.11 bill | 2026-09-15 |

**Runs** is how many independent runs the row is built from. A row at `1` is a single measurement. A row above `1` is the MEAN of that many runs of an identical configuration - same model, prompt, harness, route, effort flag and judge - and every count, wall and cost on it is averaged, which is why those rows carry a decimal. The individual runs behind a mean are published in full in the metrics CSVs, so the spread stays auditable: this board has measured a 9-point range of 105 on a fixed configuration, so a single run is not a measurement of a model, and two rows at `1` that differ by a few points may not differ at all.

Extras are real, unplanted defects a model fixed on the way; they are counted and never added to the score. Costs are token estimates at published list rates unless tagged **bill** (an actual invoice or credits delta) or **floor** (a reconstructed lower bound). `default` effort means the serving path had no working effort dial; *ran lower* marks a run whose CLI quietly replaced the requested tier. Wall clock is repo 1 plus repo 2 agent time, dependency install excluded.
Every row's full note, caveat and supersession history is in [results/run-notes.md](https://github.com/phuryn/bug-hunt-bench/blob/main/results/run-notes.md); the runs behind each one are in the metrics CSVs.

51 superseded re-runs stay in the CSVs and on the [live board](https://bughunt.productcompass.pm/?preset=all) but are left off this table.
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

Subscribe to [The Product Compass](https://www.productcompass.pm/subscribe), his newsletter on AI for product managers and builders. Same standards as this board: hands-on, no hype, nothing that was not run first.

MIT. Use anything; a link back is appreciated. If a number in a post and a receipt here disagree, the receipt wins and I want to know: [open an issue](https://github.com/phuryn/bug-hunt-bench/issues/new/choose).
