# Bug Hunt Bench — findings, wave by wave

Newest wave at the bottom. Each section was written the day its wave landed, and the numbers it quotes are the board *as it stood then* — survivors, leaders, cost comparisons all move with later waves. The current board is [bughunt.productcompass.pm](https://bughunt.productcompass.pm) and the current table is in the [repo README](../README.md); the CSVs in this folder are the receipts every section points at.

Buckets: `FIXED_MATCH` / `FIXED_PARTIAL` / `CLAIMED_ONLY` / `MISSED`, plus extra fixes classified genuine or false-positive. The score counts strict fixes only. Definitions: [bughunt.productcompass.pm/method](https://bughunt.productcompass.pm/method).

## Jul 26 baseline — seven models, two repos

Strict fixes only — no partial credit. [combined-scoreboard.csv](combined-scoreboard.csv)

| Model | Harness | Fixed /105 | Repo 1 /45 | Repo 2 /60 | Genuine extras | Wall | Cost (list-equiv) |
|---|---|--:|--:|--:|--:|--:|--:|
| **GPT-5.6 Sol** | Codex CLI | **31** | 13 | 18 | 38 | 70.2 min | $29.16 |
| **Fable 5** | Claude Code | **24** | 9 | 15 | 3 | 31.4 min | $68.07 |
| **Opus 5** | Claude Code | **21** | 11 | 10 | 6 | 37.4 min | $38.77 |
| **Kimi K3** | Claude Code / OpenRouter | **21** | 4 | 17 | 6 | 107.8 min | $25.27 |
| **Grok 4.5** | Grok Build CLI (ACP) | **16** | 5 | 11 | 7 | 24.9 min | $8.40 floor |
| **Opus 4.8** | Claude Code | **9** | 2 | 7 | 1 | 34.8 min | $19.35 |
| **Sonnet 5** | Claude Code | **9** | 1 | 8 | 4 | 32.8 min | $15.12 |

**63 of the 105 bugs survived every model** in this seven-model wave (60 after the Jul 31 wave,
54 after the Aug 1 max wave, 53 after the DeepSeek follow-up, **52 after the Aug 3 wave**,
still 52 after Aug 6-7, **51 after the Aug 12 Grok 4.6 wave**, **40 after the Sep 4 GPT-6 Astra wave**, and **39 after the Sep 5 Astra dial sweep** — see each wave's section below for the kills). Zero false-positive fixes from any arm on either repo: every
extra fix any model applied was a genuine unplanted defect.

Per-repo detail: [repo1-scoreboard.csv](repo1-scoreboard.csv) · [repo2-scoreboard.csv](repo2-scoreboard.csv).
Wall-clock, tokens and reconstructed cost: [repo1-metrics.csv](repo1-metrics.csv) ·
[repo2-metrics.csv](repo2-metrics.csv).


## Findings

- **One repo was not enough to rank the middle.** Opus 5 beat Fable 5 on repo 1 (11–9) and lost on
  repo 2 (10–15). Kimi K3 went from second-to-last on repo 1 to second on repo 2, finishing level
  with Opus 5 overall at a third less cost. Only first place was stable.
- **GPT-5.6 Sol leads both, and audits beyond the brief.** It fixed **38 genuine defects nobody
  planted** across the two repos — 29 of them on repo 2 alone, where every other model found 1 to 6.
  Cross-tenant quiz access, a `|| 75` coercion silently rewriting a 0% pass mark to 75%, timed quiz
  submissions with no time-limit enforcement.
- **Sonnet 5 on repo 1 is the sharpest single result.** It fixed 1 of 45: two files touched, a 2.9KB
  diff, one correct fix *with a regression test*, then a report claiming an exhaustive line-by-line
  review of the codebase and listing "Suspected but not fixed: None". 44 bugs were still there.
  Confident, thorough-sounding, and wrong.
- **Opus 4.8 → Opus 5 is a real generational jump**: 9 → 21 combined, same harness, same prompt,
  same bugs.
- **Cost is not recall.** Fable 5 cost the most ($68) and placed second. Grok 4.5 was the cheapest
  arm by a wide margin and placed fifth. Kimi K3 matched Opus 5 for a third less money and three
  times the wall clock.

## The Jul 31 wave — two new models, the effort dial, a Sol re-run

On Jul 30 OpenAI cut GPT-5.6 Luna's API price by 80% and shipped serving improvements; DeepSeek
shipped a re-post-trained V4-Flash revision (`-0731`) the next morning. Four new arms ran the
identical two-repo battery on Jul 31, same prompts, same blind-judging pipeline:

| Arm | Effort | Fixed /105 | Repo 1 /45 | Repo 2 /60 | Genuine extras | Wall | Cost (list-equiv) |
|---|---|--:|--:|--:|--:|--:|--:|
| **GPT-5.6 Sol (re-run)** | high | **34** | 13 | 21 | 28 | 66.7 min | $33.92 |
| **GPT-5.6 Luna** | **max** | **33** | 17 | 16 | 31 | 85.7 min | $1.80 |
| **GPT-5.6 Luna** | high | **13** | 5 | 8 | 22 | 64.1 min | $0.57 |
| **DeepSeek V4-Flash** | high | **8** | 4 | 4 | 4 | 24.9 min | $0.61 |


- **Luna at max effort beats Fable 5 on both axes** — 33 strict fixes vs 24, $1.80 vs $68.07 —
  and lands one fix behind the flagship Sol re-run at ~1/19th of its cost. Post-price-cut list
  rates ($0.20/M input, $1.20/M output). Exact, not a floor: re-derived per-request from the
  Codex CLI session rollouts - the CLI pins context at 258,400 tokens, below OpenAI's 272K
  long-context surcharge line, so no request in any run hit surcharge pricing.
- **The effort dial is worth 2.5x on Luna.** Same model, same prices: 13 strict fixes at `high`,
  33 at `max`. On repo 1, `max` was also 2.4x *faster* than `high` (21.5 vs 51.1 min).
- **The Sol re-run measures OpenAI's serving update.** Repo 2: 21 fixes vs 18 in the Jul 26 run,
  29.5 min vs 48.3, $14.36 vs $18.40 — better on all three axes. Repo 1: the same 13-fix count as
  Jul 26 but a partially different set of bugs, slower and pricier on that leg. List prices
  unchanged; the wall/cost gains are serving-side.
- **DeepSeek V4-Flash is last on coverage and untouchable on absolute price**: 8 of 105 for $0.61
  total (real OpenRouter bill cross-checked at $0.62). Ran through the same OpenRouter shim as
  Kimi K3, reasoning effort high, 1M context. **Version correction (Aug 1):** the base OpenRouter
  slug this run used resolves to the **April snapshot** (`deepseek-v4-flash-20260423` on every
  provider behind it, per the endpoints API) — not the Jul 31 re-post-trained revision, which is
  a separate `-0731` model id. So this row measures the April model. The `-0731` revision was
  benched separately on Aug 1.
- **Survivors: 63 → 60.** Luna-high fixed one repo-1 bug that had survived all prior arms
  (including Luna-max — different effort levels catch different bugs), and the Sol re-run fixed
  two repo-2 survivors. Every other new-arm fix was already covered. 60 of 105 have now survived
  every arm ever run, across nine models and eleven scored runs.
- **Zero false-positive fixes again.** All extras across the four new arms were judged genuine;
  two arms each made one additional cosmetic, non-functional change (classified as neither fix
  nor defect).

New rows are appended to the same CSVs: [combined-scoreboard.csv](combined-scoreboard.csv),
[repo1-scoreboard.csv](repo1-scoreboard.csv), [repo2-scoreboard.csv](repo2-scoreboard.csv),
[repo1-metrics.csv](repo1-metrics.csv), [repo2-metrics.csv](repo2-metrics.csv) (voided
false-start rows kept, marked `VOID` in notes — the log wins).

Naming note: earlier commits used a `v2-` file prefix meaning "bench v2" (repo 2). That collided
with the card edition numbers (V3/V4/V5), so files are now named by repo.


## The Aug 1 wave — the effort dial at max

Four arms re-ran the identical two-repo battery requesting reasoning effort `max`, with their
`high` runs above as baselines. Same prompts, same blind-judging pipeline, same routing rule (no
model grades its own family: Sol graded by Grok 4.5, the other three by GPT-5.5). **One of the
four turned out not to be max** — see the Grok row below.

| Arm | Effort | Fixed /105 | vs high | Repo 1 /45 | Repo 2 /60 | Genuine extras | Wall | Cost (list-equiv) |
|---|---|--:|--:|--:|--:|--:|--:|--:|
| **GPT-5.6 Sol** | **max** | **42** | +8 | 19 | 23 | 40 | 163.8 min | $69.61 |
| **Fable 5** | **max** | **29** | +5 | 12 | 17 | 5 | 57.3 min | $104.49 |
| **Opus 5** | **max** | **27** | +6 | 13 | 14 | 2 | 60.0 min | $51.33 |
| **Grok 4.5** | high (re-run — no `max` exists) | **13** | — | 5 | 8 | 5 | 25.4 min | $10.94 floor |

The full effort dial, strict fixes /105 (Grok has no `max` level, so no dial point):

| Effort | GPT-5.6 Sol | GPT-5.6 Luna | Fable 5 | Opus 5 |
|---|--:|--:|--:|--:|
| high | 34 | 13 | 24 | 21 |
| max | 42 | 33 | 29 | 27 |


- **Sol at max is the all-time leader**: 42 of 105 strict, plus 40 genuine extras — for 2.7 hours
  of wall clock and $69.61, the longest and second-priciest run on the board.
- **Effort correction (Aug 1): the Grok arm is a variance measurement, not a dial point.** An
  earlier version of this section read Grok's 16 → 13 as a negative dial response. It isn't:
  grok-4.5 offers only `high / medium / low`, and the grok CLI **silently runs `high`** when
  passed an unknown value (verified from the ACP session's advertised active effort). So the two
  Grok runs are the *same setting*, and 16 vs 13 strict fixes is a live receipt for the
  run-to-run noise the method notes warn about ($10.94 vs $8.40 reconstructed floors).
- **Opus 5 at max starts claiming fixes it didn't make**: 5 claimed-only report entries (2 on
  repo 1, 3 on repo 2) vs zero in its high run. Fable 5 at max stayed clean — zero claimed-only
  on either repo.
- **Fable 5 at max is the priciest run on the board and added zero new coverage**: $104.49 for
  29 fixes, every one already fixed by some earlier run.
- **Survivors: 60 → 54.** Six bugs that had survived every earlier arm fell in this wave.
  **54 of 105 have survived everything** — nine models, fourteen scored runs.
- **Zero false-positive fixes, again**, now across all fourteen runs: every extra fix in this
  wave was judged genuine (three further changes classified cosmetic, not fixes).
- Sol-max's cost is exact, not a floor, for the same reason as Luna's: the Codex CLI's
  258,400-token context pin keeps every request below OpenAI's long-context surcharge line.

New rows are appended to the same CSVs as before; the two grok false-starts (a CLI auth clash,
see method notes) are kept and marked `VOID`.

— the model-routing table the 14 runs add up to.

## The DeepSeek follow-up (Aug 1) — the `-0731` revision and V4-Pro

The version correction above raised the obvious question: what does the actual Jul 31 revision
score? Two more arms ran the identical battery on Aug 1 through the same OpenRouter shim,
judged blind by GPT-5.5:

| Arm | Fixed /105 | Repo 1 /45 | Repo 2 /60 | Genuine extras | Wall | Cost (list-est) | Real OR bill |
|---|--:|--:|--:|--:|--:|--:|--:|
| **DeepSeek V4-Flash `-0731`** | **14** | 6 | 8 | 0 | 48.5 min | $1.74 | **$1.52** |
| **DeepSeek V4-Pro** | **10** | 5 | 5 | 1 | 27.6 min | $1.26 | **$5.54** |


- **The re-post-training is real on this bench too**: 8 → 14 strict fixes (+75%) over the April
  snapshot, same prompts, same judging. That moves V4-Flash from last place to just under
  Grok 4.5, at the second-lowest real bill on the board after Luna-high.
- **It killed an all-time survivor.** One repo-2 bug had survived every previous run; the
  `-0731` revision fixed it. **53 of 105 have now survived everything** — ten models, seventeen
  scored runs.
- **The revision changed the model's character**: zero extra fixes (the April weights found 4
  genuine unplanted defects) and two claimed-only report entries (April had none). Better at
  the assignment, less exploratory, slightly overclaiming.
- **Bug-level churn**: on repo 1 the revision's fixes are a strict superset of April's; on
  repo 2 it found 6 bugs April missed but *lost* 2 that April had fixed.
- **V4-Pro underdelivers its price class**: 10 of 105 — above Sonnet 5 and Opus 4.8, below both
  Grok runs — and its real bill came out **4.4x the list-price estimate**: cached context billed
  at ~$0.36/M against a listed $0.003625/M cache-read rate. Flash's cache pricing was honored
  both times, to the cent in April. On agentic workloads (~80% of tokens are cached re-reads),
  V4-Pro's effective price is several times list.
- The April V4-Flash run stays in the CSVs under the correction note above; the current board
  carries the `-0731` revision in its place.

## The Aug 3 wave — Qwen3.8-Max

Alibaba's Qwen3.8-Max ran the same two-repo battery and scored **19/105** (repo 1 5/45, repo 2
14/60, 6 genuine extras, 1 claimed-only, 148.1 min, $31.10 list-equivalent). Its rows are in the
scoreboards above; the full write-up, including the day-one access gauntlet and the
thinking-budget probe, is its own set: [qwen-3.8-max-day-one/](https://github.com/phuryn/experiments/tree/main/qwen-3.8-max-day-one).

Two things it contributes to this file: its repo 2 leg **beats Opus 5's high run** (14/60 vs
10/60) while its repo 1 leg is DeepSeek-tier — another instance of one repo failing to rank the
middle. And it ran at its **maximum** tier, not a middle one: QwenCloud documents
`reasoning_effort` for qwen3.8-max as `low|medium|xhigh` (default `xhigh`) and maps the
OpenAI-standard names onto them, `high` → `xhigh`, erroring outside that set. **Survivors 53 → 52.**

## The effort-dial probe (Aug 4) — the dial is a serving-path feature, not a model feature

A `max` follow-up was commissioned for V4-Flash-0731 ("run V4-Flash on max"). It never became an
arm — because the probe that has to precede any effort label came back negative. OpenRouter accepts
*any* string in `reasoning.effort` with a 200 (no validation), so the only way to know a level is
real is behavioral: one pinned provider (DeepInfra), temperature 0, fixed seed, the same hard
prompt, n=3 per level ([effort-dial-probe-dsv4.py](effort-dial-probes/20260807-deepseek-v4-flash-0731-openrouter.py)):

| `reasoning.effort` | reasoning tokens (3 runs) | mean |
|---|---|--:|
| (omitted) | 6027 · 5748 · 6219 | 5,998 |
| low | 6406 · 5836 · 6093 | 6,112 |
| high | 6174 · 5928 · 6049 | 6,050 |
| max | 6247 · 6621 · 6147 | 6,338 |

Every level collapses to one trajectory — `low` lands *above* `high`, and omitting the parameter
entirely is indistinguishable from any setting. The parameter is dropped somewhere between
OpenRouter and the weights. Raw output: [effort-dial-probe-dsv4.log](effort-dial-probes/20260807-deepseek-v4-flash-0731-openrouter.log).

- **The commissioned max arm was cancelled, not run.** It would have been a second default-effort
  run published under a `max` label — the exact shape of the Grok effort correction above, this
  time caught in advance.
- **The DeepSeek rows above are requested-high, served-default.** The comparison stays
  apples-to-apples (every DeepSeek arm got identical treatment), but no dial claim can be made for
  this model on this path.
- **The dial is per-serving-path, not per-model.** The same discriminator against Qwen3.8-Max on
  Alibaba's own Anthropic-compatible gateway separates **~10x** between thinking budgets
  ([qwen-3.8-max-day-one/01](https://github.com/phuryn/experiments/tree/main/qwen-3.8-max-day-one/01-two-repo-bug-hunt)). Third data point in a
  pattern: GLM-5.2's high-vs-max no-op ([frontier-vs-open-audit/](https://github.com/phuryn/experiments/tree/main/frontier-vs-open-audit)), the
  grok CLI's silent clamp, now an aggregator dropping the parameter. **Verify the dial before
  labeling an arm with it.**
- Caveat: single pinned provider, one prompt, n=3 — enough to cancel a mislabeled arm, thin for
  claims about DeepSeek's first-party API.

## The Aug 6-7 wave — Muse Spark scores the effort-dial probe

The Aug 4 probe above showed OpenRouter drops `reasoning.effort` on a synthetic prompt. This wave
measures what that costs on the actual benchmark, because Meta's Muse Spark 1.2 (shipped Aug 5)
ran the full battery **twice, by two routes**, with everything else identical. A third Grok 4.5 run
at settings matching its two predecessors went alongside it.

| Arm | Effort (actual) | Fixed /105 | Repo 1 /45 | Repo 2 /60 | Claimed-only | Genuine extras | Wall | Cost |
|---|---|--:|--:|--:|--:|--:|--:|--:|
| **Muse Spark 1.2** (Meta API) | **xhigh** | **17** | 6 | 11 | 0 | 12 | 35.7 min | $13.99 list-equiv |
| **Grok 4.5** (re-run Aug 6) | high | **17** | 5 | 12 | 1 | 10 | 27.9 min | $8.50 floor |
| **Muse Spark 1.2** (OpenRouter) | **default** | **14** | 3 | 11 | 0 | 3 | 65.2 min | $19.52 real bill |

Both Muse runs requested the same tier. Only the first-party one got it. The one-call check —
send a **nonsense** effort value and read the status code — now has four data points:

| Provider | invalid effort value | verdict |
|---|---|---|
| Meta (first-party) | `400` | validates — the tier is real |
| xAI (first-party) | `400` | validates — the tier is real |
| Alibaba (first-party) | error (documented) | validates — `high` maps to `xhigh` |
| **OpenRouter** | **`200`** | **accepts anything, applies none** |

- **The label correction is now applied, not just noted.** The Aug 4 section called the DeepSeek
  rows "requested-high, served-default". That is also true of **Kimi K3**, and the `effort` column
  in both metrics CSVs said `high` for all four. It now reads `default`, and each corrected row
  carries a note. **No score changed** — only the label was ever wrong.
- **The scored cost of a dropped tier: 17/105 vs 14/105.** One variable, the route.
- **But it is smaller than one repo suggests.** Repo 1 reads 6 vs 3, which looks like a doubling.
  Across both repos it is **+3 of 105**, and repo 2 scored **11/60 in both conditions — identical**.
  The single-repo version overstates the effect about threefold and was nearly published; it is
  recorded here because that near-miss is the point of the caveat.
- **What the tier bought was breadth, not coverage**: 12 genuine unplanted bugs at `xhigh` against
  3 at default, while planted-bug coverage moved by 3.
- **Grok's three same-setting runs: 16 → 13 → 17.** Spread 4, gain over best prior 1 — no serving
  improvement is detectable. Its repo 1 leg scored **5/45 all three times**; every point of movement
  is on repo 2. Rounds were not a factor: the ACP mode this harness drives exposes no turn cap, the
  config carries none, and every recorded turn ended `completed`.
- **Muse Spark has the cleanest honesty profile on the board**: zero claimed-only across all four
  legs, on both routes.
- **Survivors hold at 52 of 105** — neither Aug 6-7 arm killed a bug that had survived everything.



## The Aug 12 wave — Grok 4.6, day one

xAI shipped Grok 4.6 on Aug 12 and it ran the identical two-repo battery the same day, in the
same grok CLI harness over ACP, judged blind by GPT-5.5. The CLI exposes a **new top reasoning
tier for 4.6, `xhigh`**, above 4.5's `high` ceiling — verified *active* before the run: the ACP
session's advertised effort echoes `xhigh` back, while unknown values (including the plausible
misspelling `x-high`) still clamp silently to `high`, the same clamp the Aug 1 correction
documents. The run below is the tier it says it is.

| Arm | Effort (actual) | Fixed /105 | Repo 1 /45 | Repo 2 /60 | Claimed-only | Genuine extras | Wall | Cost |
|---|---|--:|--:|--:|--:|--:|--:|--:|
| **Grok 4.6** | **xhigh** (its max) | **27** | 10 | 17 | 0 | 15 | 34.4 min | $22.73 floor |

- **The first generational jump this board has measured from xAI.** Grok 4.5's three same-setting
  runs scored 16, 13 and 17 (spread 4); 4.6 lands **+10 over the best of them**. Sharpest on
  repo 1, where 4.5 scored 5/45 three times without moving a point — 4.6 doubled it to 10/45.
- **It killed an all-time survivor**: one repo-2 bug that had outlived all twelve models before
  it. **51 of 105 have now survived everything** — thirteen models, twenty-two scored runs.
- **It ties Opus 5's `max` run** (27/105) at well under half the cost and roughly half the wall
  clock, and lands two fixes behind Fable 5's $104.49 max run for $22.73.
- **Honesty profile clean**: zero claimed-only entries on either repo, 15 genuine extras.
- **Caveats.** The two legs ran concurrently (wall-clock overstated vs the sequential baselines;
  fixes, tokens and cost unaffected). The 4.5-vs-4.6 comparison is each model at its own ceiling —
  best-vs-best, but model and tier move together, so it is not a dial isolation. n=1 per cell as
  ever, and Grok's cost remains a reconstructed floor, not a bill.



## The Aug 24 wave — Gemini 3.7 Flash, in Google's own CLI

Google's Gemini 3.7 Flash ran the identical two-repo battery in Google's own Gemini CLI (0.56.0,
headless), judged blind by GPT-5.5, at `high` — the ceiling: Google rejects `xhigh`/`max` with
HTTP 400, and an n=5 probe separates the three levels cleanly
([probe](effort-dial-probes/20260824-gemini37flash-google-api.txt)). **The CLI lied about the model first:** it accepted
`-m gemini-3.7-flash`, echoed it at startup, and sent every call to `gemini-3.5-flash` — it clamps
any flash id it does not know to its default (same on the 0.57 preview and the nightly). The run
went through a local gateway that pins the model on the wire and logs Google's `modelVersion` per
response: **498/498 calls came back 3.7 at `high`** ([readback](effort-dial-probes/20260824-gemini37flash-gemini-cli-readback.md)). The
grok CLI's `max`→`high` clamp, one layer up.

| Arm | Effort (actual) | Fixed /105 | Repo 1 /45 | Repo 2 /60 | Claimed-only | Genuine extras | Wall | Cost |
|---|---|--:|--:|--:|--:|--:|--:|--:|
| **Gemini 3.7 Flash** | **high** (its max) | **22** | 8 | 14 | 0 | 4 | 96.8 min* | $8.43 list |

- **A Flash-tier model in the middle of the frontier pack:** just under Fable 5 at `high` (24),
  above Opus 5 at `high` and Kimi K3 (21), Qwen3.8-Max (19), Muse Spark (17) and every Grok 4.5
  run — at $8.43 against Opus-high's $38.77 and Fable-high's $68.08.
- **Honesty profile clean:** zero claimed-only entries on either repo; 4 genuine extras, all on repo 2.
- **No new coverage.** All 22 fixes were bugs an earlier model had already fixed; **51 of 105
  still survive everything** — fourteen models, twenty-three scored runs.
- **Harness note (added Aug 25).** Gemini CLI is the harness Google *retired* on June 18, 2026 for
  free, Pro, Ultra and individual tiers — paid Gemini API keys kept working, which is the path this
  run used, and the npm package still ships nightlies. Google's current CLI is **Antigravity CLI
  (`agy`)**, as was pointed out publicly on the day;
  the 3.5-Flash clamp above is what a retired CLI looks like. A retest in `agy` is queued; until it
  lands, read this row as "Gemini 3.7 Flash in the retired Gemini CLI."
- **Caveats.** *Wall excludes a 35-minute harness stall on repo 1: the suite's keep-alive child
  outlives the test runner and Gemini CLI's shell tool has no timeout, so one `npm test` sat for
  36.8 min (the others took 1.3) until the process was killed; the raw 87.2-min leg is in
  [repo1-metrics.csv](repo1-metrics.csv). Legs ran concurrently on one API key (23 rate-limit
  retries, absorbed by the CLI's backoff). Cost is Google's standard list rate ($0.75 / $3.75 per
  MTok, doubling on 2027-01-01) from Google's own usage metadata, not a bill. n=1 per cell.


### Aug 25 retest — the same 105 bugs in Google's current CLI (Antigravity CLI, `agy`)

Same model, same prompts, same blind judge, Google's current harness: `agy` 1.1.20 headless, model slug
`gemini-3.7-flash-high` (effort verified active via the slugs: low 874–1,044 vs high 3,324–4,799 thinking
tokens, n=3), no gateway needed — the current CLI lists 3.7 Flash natively. Auth is the Antigravity
subscription, so cost is a token-estimate at Google's API list, not a bill.

| Arm | Effort (actual) | Fixed /105 | Repo 1 /45 | Repo 2 /60 | Partial | Claimed-only | Genuine extras | Wall | Cost |
|---|---|--:|--:|--:|--:|--:|--:|--:|--:|
| **Gemini 3.7 Flash, Antigravity CLI** | **high** (its max) | **18** | 4 | 14 | 3 | 0 | 11 | 37.5 min | $8.57 list |
| Gemini 3.7 Flash, Gemini CLI (retired), Aug 24 | high (its max) | 22 | 8 | 14 | 0 | 0 | 4 | 96.8 min* | $8.43 list |

- **The harness swap did not rescue the number.** Google's own CLI scored three planted fixes lower
  (repo 1: 8 → 4, its fixes a strict subset of the Gemini CLI run's; repo 2 flat at 14 with 11 of 14
  shared), inside this board's same-setting variance band (Grok 4.5's three runs: 16, 13, 17).
- **It is a different kind of run:** 2.6x faster (37 vs 97 minutes), a third of the tool calls on repo 1,
  and **11 genuine extras** against 4 — the current CLI is quicker and more eager to fix what it finds
  beyond the brief, and slightly less thorough on the plants. Zero claimed-only on both legs, both harnesses.
- **Ops.** The first repo-1 attempt died at 67 s on a Google backend `INTERNAL (code 500)` that `agy`
  retries only twice, one second apart, before terminating the run; the identical step reproduced clean two
  minutes later, and the leg was re-run (the runner now retries that signature itself). One bug (H1)
  received two blind verdicts on the same diff — partial in the first pass, full in a replicate; the first
  pass's rationale is the correct one (the fix breaks containment for the root workspace), so 4 + 1
  partial stands. Survivors unchanged at 51 of 105.



## The Aug 25 wave, part two — two Chinese-lab runs, and the survivor count moves twice

Two runs on the same rig, hours apart: **Ox Alpha**, a free OpenRouter *stealth* slug, and
**GLM-5.3** from Z.ai. They are here together on purpose — the wire fingerprint of the stealth slug
matches GLM-5.3's serving stack ([stealth-ox-alpha-fingerprint/](https://github.com/phuryn/experiments/tree/main/stealth-ox-alpha-fingerprint)),
so running the named model is the behavioural control for that claim.

| Arm | Effort (actual) | Fixed /105 | Repo 1 /45 | Repo 2 /60 | Claimed-only | Genuine extras | Wall | Cost |
|---|---|--:|--:|--:|--:|--:|--:|--:|
| **GLM-5.3** | default | **19** | 8 | 11 | 1 | 4 | 66.7 min | $19.73 billed |
| **Ox Alpha** (stealth) | default | **16** | 8 | 8 | 1 | 3 | 59.4 min | free |

- **The survivor count moved twice in one day, after weeks of standing still.** Ox Alpha fixed
  **H3** and GLM-5.3 fixed **G2** — two repo-1 bugs that had survived every model in every prior run.
  **49 of 105 now survive everything**; four bugs have ever come off that list. The models that did it
  are mid-table, which is the point: coverage and ranking are different questions.
- **Effort is `default` on both rows because there was nothing to set.** An n=4 probe of OpenRouter's
  reasoning dial on GLM-5.3 found the levels nest completely — spread *within* a level is 17.5x
  against 2.0x *between* them, and `high` produced the least reasoning of the three. Reasoning is on
  (this endpoint refuses to run without it); the tier is not selectable.
- **Same neighbourhoods, different catches.** The two models' reports read like the same document —
  both flagged the off-by-one selection chip, terminal output snapshotted after release, output
  posted into the wrong session, renamed sessions swept, pagination counting rows instead of slots.
  But the *graded* fixes overlap only **10 of 25** (40%). That is consistent with two runs of one
  family, given this board's measured 4-point same-setting spread — and it is n=1 each, so it is
  corroboration, not proof. The tokenizer evidence is what identifies the stealth slug.
- **Caveat.** Both ran their legs sequentially, so wall clock is comparable to the other sequential
  rows but not to the concurrent ones. GLM-5.3's dollar figure is a real OpenRouter bill; Ox Alpha
  was genuinely free at the time of the run.

## Aug 27 — the stealth slug, named and priced: GLM-5.3 Flash

Z.ai confirmed on Aug 26 that `stealth/ox-alpha` was **GLM-5.3-Flash** (a 320B/18B MoE, open
weights). So the named model ran the same rig — same harness, same prompt, same sequential shape as
the Aug 25 pair — with one change: a paid endpoint, **pinned to Z.AI's own first-party host**. Twelve
hosts served the slug at three prices on launch day, and OpenRouter load-balances across them per
request unless told not to; pinning keeps the row single-path.

| Arm | Effort (actual) | Fixed /105 | Repo 1 /45 | Repo 2 /60 | Claimed-only | Genuine extras | Wall | Cost |
|---|---|--:|--:|--:|--:|--:|--:|--:|
| **GLM-5.3 Flash** | default | **13** | 6 | 7 | 5 | 4 | 57.1 min | $0.79 billed |
| Ox Alpha (stealth, Aug 25) | default | 16 | 8 | 8 | 1 | 3 | 59.4 min | free |
| GLM-5.3 (Aug 25) | default | 19 | 8 | 11 | 1 | 4 | 66.7 min | $19.73 billed |

- **The score held, within what one run can say.** 13 against the stealth run's 16 is inside this
  board's measured same-setting spread (Grok 4.5 at one setting: 16 · 13 · 17). The graded fixes
  overlap **10 of 19** with Ox Alpha (53%) — a closer pair than either is to GLM-5.3 (40–45%), which
  is what two runs of one model should look like. n=1 each: this is not a regression, and it is not
  "the same score" either.
- **No survivor moved.** 49 of 105 still survive everything. H3, which the stealth run fixed, was
  missed this time — a survivor kill is a variance event, not a capability a model repeats on demand.
- **$0.79 for 13/105 — the cheapest paid row on the board.** Twenty-five times cheaper than GLM-5.3's
  $19.73 for 19. The figure is a real OpenRouter credits delta, per leg ($0.29 + $0.50), at the 50%
  launch price ($0.075 / $0.25 per million tokens in / out, $0.015 cache read); list doubles after
  Sep 9, which would make the same run about $1.59. Zero throttling across 57 minutes on the paid
  endpoint (the free stealth pool had 429'd for minutes at a stretch).
- **The five "claimed-only" are not claims.** All five sit in the model's own *"Suspected but not
  fixed"* section — it named them and deliberately left them alone ("couldn't confirm as planted vs
  original design"). The blind judge's rubric counts a bug as claimed-only whenever the report
  *identifies* it without a fixing hunk, and has applied that the same way before (GLM-5.3's J11 on
  Aug 25), so the column is comparable across rows — but read it as "named, not fixed", not as
  "reported a fix it did not ship". The score is unaffected either way: the diff is the ground truth.
- **Effort is `default` because no tier was asserted.** Reasoning was on (this endpoint refuses to
  run without it); the CLI's thinking request was passed through and OpenRouter's dial was not
  relied on. The n=4 probe that showed the dial inert on GLM-5.3 was
  repeated on this slug and reads **INERT** the same way (between-level 3.99x does not clear the
  14.06x within-level spread; the `low` range nests inside `high`): `effort-dial-probe-glm53flash.txt`.
- **Caveat.** Sequential legs, so wall clock is comparable to the other sequential rows only.
  Provider pinned with fallbacks off, so the number is one serving path, not a blend.

## Sep 1-2 — Claude Fable 5.1, day one, the full dial

Anthropic shipped Claude Fable 5.1 and it ran the identical two-repo battery the same day, in Claude
Code, at `low`, `high` and `max` — the same harness and tiers as the Fable 5 rows already on this
board, so the comparison is like-for-like. Every leg ran sequentially on an otherwise idle machine
and was judged blind by a non-sibling judge (no model grades its own family).

| Arm | Effort | Fixed /105 | Repo 1 /45 | Repo 2 /60 | Claimed-only | Genuine extras | Wall | Cost |
|---|---|--:|--:|--:|--:|--:|--:|--:|
| **Claude Fable 5.1** | **max** (its ceiling) | **43** | 19 | 24 | 4 | 11 | 73.1 min | $77.55 |
| **Claude Fable 5.1** | **high** | **33** | 15 | 18 | **0** | 7 | 36.3 min | $41.52 |
| **Claude Fable 5.1** | **low** | **29** | 13 | 16 | 1 | 6 | 33.2 min | $27.27 |
| Fable 5 | max | 29 | 12 | 17 | 0 | 5 | 57.3 min | $104.49 |
| Fable 5 | high | 24 | 9 | 15 | 1 | 5 | 31.4 min | $68.07 |

- **43 is the top score this board has measured — by one fix, which is not a lead.** It beats
  GPT-5.6 Sol at `max` (42), but this board's own same-setting spread is ±2–3 points (the Opus
  replicates scored 23 and 26 on identical conditions). Treat 43 and 42 as a tie until someone runs
  n>1. Both are n=1.
- **The generational jump is the durable result**, because nothing moves but the model: at `max`,
  29 → 43 (**+14**); at `high`, 24 → 33 (**+9**). Both far outside the variance band.
- **The dial is monotonic but heavily back-loaded.** 29 → 33 → 43: **+4** from low to high, then
  **+10** from high to max. Most of what you pay for at the top of this dial arrives in the last
  step, and the first step is barely outside the noise band.
- **Claude Fable 5.1 at `low` matches Fable 5 at `max`** — 29 apiece — for **26% of the cost**
  ($27.27 vs $104.49) and a bit over half the wall clock. At `high` it beats Fable 5's ceiling
  outright (33 vs 29) for 40% of the cost.
- **Cost falls while work rises.** `max` cost 26% less than Fable 5's `max` while reading **2.35×
  more cached context** (194.6M vs 83.0M tokens) and writing **1.55× more output**. The entire
  saving is Claude Fable 5.1's cache-read repricing to $0.25/MTok, a quarter of Fable 5's rate:
  priced at the old rate that same run bills **$223.52**, more than double. On a long agentic bench
  that re-reads a large cached prefix, that one line item decides the cost column.
- **Honesty profile is strongest in the middle**: `high` posted **zero** claimed-only on *both*
  repos. `max` claimed four on repo 2 that its diff did not support; `low` claimed one. False
  positive fixes were zero at every tier.
- **`max` killed two bugs nothing had ever fixed** (both repo 1); the never-fixed count drops
  **45 → 43**. `high` and `low` found no first-evers.
- **Caveats on the `low` row specifically.** Its repo 2 leg was judged by **Grok 4.5** after the
  Codex judge returned a malformed verdict on that packet, so that single row mixes judges where
  every other Claude Fable 5.1 row is Codex-judged throughout. That leg was also re-run: the first
  attempt spanned a network outage that voided its wall clock (862 vs 2,183 output tokens/min) and
  scored 18/60 under Codex, against 16/60 under Grok here — the diff and the judge both changed
  between those two, so the difference cannot be attributed to either one.
- **Reproducibility note, and a trap.** This model postdates the Claude Code build used here, so the
  CLI has no entry for it and falls back to **assuming a 200K context window**; Claude Fable 5.1's
  is 1M. Left alone that forces auto-compaction roughly five times earlier than the model needs, on
  a bench whose runs read tens of millions of cached tokens — and it fails silently: clean exit, no
  error, just a worse score and a longer wall clock that reads as "the model is slow". Every arm
  pins the window explicitly (`[1m]`). The CLI was deliberately *not* upgraded to a build that
  recognises the name, because that would have changed the harness underneath the Fable 5
  comparison.
- **Caveats.** n=1 per cell, as everywhere on this board — including all three tiers here, so each
  dial step is one sample per level. Day-one runs. Cost is a list-price estimate from measured
  tokens, not an invoice. All three tiers are first-party documented enums taken at face value, not
  separately probed as binding.

## Sep 2 — Gemini 3.8 Flash, day one, in Google's Antigravity CLI

Google shipped Gemini 3.8 Flash and it ran the identical two-repo battery in Google's own current
CLI (Antigravity, `agy` 1.1.22), at `high` — the top tier that CLI offers for this model. Legs ran
sequentially on an idle machine; judged blind by GPT-5.5.

| Arm | Effort | Fixed /105 | Repo 1 /45 | Repo 2 /60 | Claimed-only | Genuine extras | Wall | Cost |
|---|---|--:|--:|--:|--:|--:|--:|--:|
| **Gemini 3.8 Flash** | **high** (its ceiling) | **20** | 7 | 13 | 1 | 6 | 29.8 min | $9.78 |
| Gemini 3.7 Flash (Antigravity, retest) | high | 18 | 4 | 14 | — | — | 37.5 min | $8.57 |
| Gemini 3.7 Flash (Antigravity, seq) | high | 16 | 4 | 12 | — | — | 22.7 min | $6.36 |
| Gemini 3.7 Flash (Gemini CLI, retired) | high | 22 | 8 | 14 | — | — | 96.8 min | $8.43 |

- **Read this against the Antigravity rows only.** In the same CLI, 3.7 Flash scored 18 and 16
  (n=2, mean 17); 3.8 scores **20** — **+3 over that mean, +2 over the better of the two**. This
  board's same-setting spread is ±2–3, so that is a modest improvement sitting at the edge of the
  noise band, not a clean generational jump. The one 3.7 row that beats it (22/105) ran in the
  *retired* Gemini CLI on a different harness, so it is not a like-for-like comparison in either
  direction.
- **Where it gained is repo 1**: 7/45 against 3.7's 4/45 in the same CLI, twice. Repo 2 is flat
  (13 vs 14 and 12).
- **It is not cheaper.** $9.78 against $6.36 and $8.57 for 3.7 in the same CLI — more output tokens
  at the same per-token price. Wall clock sits between the two 3.7 Antigravity runs.
- **Honesty profile is good**: zero claimed-only and zero extras on repo 1 (it claimed nothing it
  did not do), one claimed-only on repo 2, and **zero false-positive fixes** on either.
- **It killed no bugs that were previously unfixed** — the never-fixed count stays 43.
- **Effort dial verified on this serving path.** n=3 per tier on the standard probe prompt gives
  three non-overlapping thinking-token bands: low 0–70, medium 91–131, high 151–367. `high` is the
  top slug `agy models` offers for this model, and asking for more is rejected outright
  (`invalid --effort "max" (valid: low, medium, high)`) rather than silently clamped — so the
  ceiling label is honest and the CLI cannot serve a lower tier while reporting a higher one.
- **Generational note on the meter itself.** 3.7 Flash produced 874–1,044 thinking tokens at `low`
  and 3,324–4,799 at `high` on the identical prompt and harness. 3.8 produces 0–70 and 151–367 — an
  order of magnitude less thinking at every tier, while scoring slightly higher. Do not compare the
  two generations' thinking counts as if they were the same meter.
- **Caveats.** n=1, day-one. Cost is a list-price estimate from measured tokens, not an invoice.
  agy has no wire readback (it talks Google's cloudcode backend, not the public API), so the token
  accounting is the CLI's own meter — the same trust level as Codex or grok reporting theirs.

## Sep 4-5 — GPT-6 Astra, day one, and the full dial

OpenAI announced GPT-6 Astra on Sep 3 with plan and API access "in the coming days". It reached this
account at 20:46 CEST on Sep 4 — on the Codex/ChatGPT path only; the raw API key still answered
`model_not_found` throughout, and does at the time of writing. A watcher had been polling since the
announcement, so the battery started ten seconds after the model first answered. Both repos ran
sequentially at `max` in the Codex CLI, the same harness every other OpenAI row here ran in, on an
otherwise idle machine, judged blind by Grok 4.6 (non-sibling — no model grades its own family).

| Arm | Effort | Fixed /105 | Repo 1 /45 | Repo 2 /60 | Claimed-only | Genuine extras | Wall | Cost |
|---|---|--:|--:|--:|--:|--:|--:|--:|
| **GPT-6 Astra** | **max** (its ceiling) | **48** | **24** | 24 | **0** | 45 | 78.9 min | $31.20 |
| **GPT-6 Astra** | **xhigh** | **43** | 23 | 20 | 1 | 53 | 58.8 min | $24.22 |
| **GPT-6 Astra** | **high** | **35** | 19 | 16 | 2 | 40 | 40.5 min | $20.60 |
| **GPT-6 Astra** | **medium** | **34** | 19 | 15 | 1 | 33 | 28.0 min | $15.78 |
| **GPT-6 Astra** | **low** | **27** | 18 | 9 | **0** | 25 | 32.1 min | $11.69 |
| Claude Fable 5.1 | max | 43 | 19 | 24 | 4 | 11 | 73.1 min | $77.55 |
| GPT-5.6 Sol | max | 42 | 19 | 23 | 0 | 40 | 163.8 min | $69.61 |

- **48/105 is the top score this board has measured, and this time the margin clears the noise.** The
  previous top two were separated by one fix, which this repo called a tie and still does. Astra is
  **+5 over Fable 5.1** and **+6 over Sol**, against a measured same-setting spread of ±2–3 points
  (three Grok 4.5 runs on identical settings scored 16, 13 and 17). It is still n=1, and n=1 is how
  every row here is produced — but a 5-point gap is the first lead on this board that survives its own
  variance band.
- **The entire lead is on repo 1.** Repo 2 is a dead tie with Fable 5.1 at 24/60. On repo 1 Astra
  scored **24/45 against a field that had never beaten 19** — a 26% jump on one codebase and nothing
  on the other. Whatever changed generation-to-generation, it did not change uniformly across these
  two repos, and a single combined number hides that.
- **A clean honesty profile, and it is the cleanest here.** **Zero claimed-only on both repos**, zero
  partials, one false-positive fix. Astra's own report listed 112 fixes (48 + 64); 48 landed on planted
  bugs, 45 more were genuine defects the answer key never planted, and *not one* was a bug it named
  that its diff failed to fix. Fable 5.1 at max leaked four of those on repo 2. This is the failure
  mode the bench grades diffs to catch, and Astra did not exhibit it.
- **Fastest-per-point on the board, and by a wide margin on cost.** It ran in **48% of Sol's wall
  clock at 45% of its list cost**, despite Astra's per-token rates being higher than Sol's. Against
  Fable 5.1 it is marginally slower (78.9 vs 73.1 min) at **40% of the cost**.
- **It killed three bugs nothing had ever fixed**, dropping the never-fixed count **43 → 40**:
  - `J8` (repo 1) — queued sends for a dead session are never cleared on process exit, so they can
    misfire against a session that no longer exists.
  - `P032` (repo 2) — the CORS allow-list omits mutation verbs, so browser `PUT`/`DELETE` lesson edits
    fail preflight.
  - `P038` (repo 2) — the certificate detail cache is not written after an edit, so detail and list
    views disagree.
- **Cost is a list-equivalent, and probably a floor.** The run went through a ChatGPT-account login,
  so it was plan-covered in fact; $31.20 is a token estimate at published rates ($10/$1/$50 per MTok).
  Astra bills **2× input / 1.5× output above 272K input tokens**, which is not modelled here — with
  8.6M and 9.5M input tokens per leg, a metered API run of this same work would very likely cost more
  than the figure in the table.
- **Launch-night caveat on the wall clock specifically.** This ran inside the first hour of the model
  being reachable on this account, which is when serving capacity is least representative. Wall clock
  is the least portable column on this board at the best of times; treat the speed result as weaker
  evidence than the score.
- **Effort honesty.** `max` is a first-party tier on this model, and the CLI was asked for it and
  confirmed serving it (`model: gpt-6-astra`, `reasoning effort: max`) before either leg started;
  the probe is filed under `effort-dial-probes/`. This row is `first_party`, not a requested-and-hoped
  tier.
- **The dial is not free, and `xhigh` is not a cheap `max`.** Dropping one step costs **5 fixes**
  (48 → 43) for a 25% saving in wall clock and 22% in cost. That is the same size as the gap between
  Astra at max and the entire previous field, spent in one notch of the dial. The drop is also
  lopsided in the mirror image of the max row's lead: repo 1 barely moves (24 → 23) while repo 2 falls
  **24 → 20**. Whatever `max` is buying on this bench, it is buying most of it on repo 2.
- **The honesty profile degrades with the dial too.** `xhigh` posted its first claimed-only (1) and
  first partial (1), against a clean sweep at `max`, and produced **53 genuine extras against 43
  planted fixes** — more unplanted defects than planted ones. A model spending less effort on the
  assigned task drifting toward incidental finds is a pattern worth watching across the remaining
  tiers rather than concluding from one row.
- **`high` is where the dial stops being a discount and starts being a different model.** 48 → 43 → 35:
  **-5** from max to xhigh, then **-8** more to high. At `high` Astra scores below its own repo-1 field
  average and lands under Fable 5.1 at max (43) and Sol at max (42) — a frontier model, run one notch
  down, is no longer competitive with last generation's ceilings. Cost does fall in step ($31.21 →
  $24.22 → $20.60), but the fixes fall faster: **$0.65 per fix at max, $0.59 at high** — the cheaper
  tier is barely cheaper *per unit of work delivered*.
- **Repo 2 carries the entire collapse again.** Repo 1 goes 24 → 23 → 19; repo 2 goes 24 → 20 → **16**.
  Across all three tiers so far, this bench's effort dial is almost entirely a repo-2 phenomenon.
- **The honesty trend holds and steepens**: claimed-only 0 → 1 → 2, and at `high` the model reported
  **30 unplanted extras against 16 planted fixes on repo 2** — nearly two incidental finds for every
  bug it was actually asked to fix. Lower effort is not just finding less; it is spending a larger
  share of what it does find away from the task.
- **Down to `medium`, the dial's whole story was one step.** 48 → 43 → 35 → 34 (the `low` row, below, reopens it). The drop from `high` to `medium` is
  **one fix** — those two tiers are the same result on this bench, separated by nothing that clears
  the ±2–3 variance band. Everything the dial actually buys sits in the two steps above `high`, and
  the biggest single step is the top one.
- **Cost per fix is flat-to-inverted, which is the uncomfortable part.** $0.65 at max, $0.56 at xhigh,
  $0.59 at high, **$0.46 at medium** — and throughput rises monotonically through `medium` (0.61 → 1.21 fixes/min; `low`, below, breaks the run). If
  you are buying fixes per dollar, `medium` wins outright. `max` is not the efficient choice; it is
  the choice you make when you want the 14 extra fixes and are willing to pay a premium per fix for
  them. That is a real decision, not a ranking.
- **`medium` killed a bug that nothing had ever fixed — including Astra at `max`.** `P037` (repo 2):
  publish/unpublish succeeds but the list keeps the old visibility, because the mutation no longer
  merges the authoritative returned row. The never-fixed count drops **40 → 39**. A lower tier finding
  what the ceiling missed is a useful reminder that these runs are n=1 and that "more effort" is a
  distribution shift, not a superset.
- **No first-ever kills at `xhigh`** — the never-fixed count stays at 40. Every bug it fixed, some
  model had already fixed.
- **`low` is the second cliff.** 48 → 43 → 35 → 34 → **27**. After `high` and `medium` tied, the bottom
  notch costs **7 fixes** — a step as large as `max` → `xhigh`. On this bench the dial has two steps that
  matter, one at the top and one at the bottom, with a flat middle.
- **Repo 2 falls through the floor.** Repo 1 barely moves (19 → 18); repo 2 goes 15 → **9**, the lowest
  repo-2 figure of the five Astra rows and 15% of its planted bugs. Across the whole sweep repo 1 spans
  24 → 18 while repo 2 spans 24 → 9. Whatever effort buys on this bench, it buys almost all of it on the
  larger codebase.
- **The honesty profile is clean again at the bottom.** Zero claimed-only, zero partials, zero
  false-positive fixes — cleaner even than `max`, which had one false-positive fix — after claimed-only of
  1 / 2 / 1 through the middle tiers. The drift toward incidental finds also stopped: 25 genuine extras
  against 27 planted fixes, versus 53 against 43 at `xhigh`. Fewer of everything, but nothing claimed that
  the diff did not do.
- **Cheapest per fix, but no longer fastest.** $11.69 for 27 fixes is **$0.43 per fix**, the lowest of the
  five — yet wall clock came in at 32.1 min, *above* `medium`'s 28.0, so throughput fell back to 0.84
  fixes/min. It used fewer tokens than `medium` (7.6M vs 9.1M total) and took longer; this leg pair ran
  mid-afternoon Central European time against `medium`'s 02:00 run, and wall clock remains the least
  portable column here. Read the cost column from this row, not the clock.
- **Level with Claude Fable 5.1 at the same tier, at 43% of the cost.** Astra `low` 27 vs Fable 5.1 `low`
  29 — inside the variance band, a tie. The two split the repos in opposite directions: Astra 18/45 vs
  Fable 13/45 on repo 1, Fable 16/60 vs Astra 9/60 on repo 2. Same lesson as the ceilings: a repo-level
  result is not interchangeable with the combined number.
- **No first-ever kills at `low`.** The never-fixed count stays at 39.
- **Effort honesty across the sweep.** All five tiers are `first_party`: each was requested from the
  CLI and confirmed served (`model: gpt-6-astra`, `reasoning effort: <tier>`) before its first leg ran,
  with the probes filed under `effort-dial-probes/`. A tier the CLI would not serve was set to be
  skipped rather than quietly run at another effort; none had to be.
- **Not solved.** 57 of 105 planted bugs survived a frontier model at its ceiling, and 39 have now
  survived every model ever run here (40 after the `max` run; `medium` took one more; `low` took none).

## Sep 6 — GPT-5.6 Sol, the `medium` tier

The Sol dial had `high` (34), `xhigh` (39) and `max` (42); this run adds `medium`, requested to fill the dial below
`high`. Same slug, same Codex CLI on the ChatGPT-account path as every other Sol row, both repos run sequentially on
an otherwise idle machine, judged blind by Grok 4.6 (non-sibling). Preflight confirmed the CLI served
`reasoning effort: medium` before the first leg (`effort-dial-probes/20260907-gpt56sol-codex-effort-medium.txt`), so the row is `first_party`.

| Arm | Effort | Fixed /105 | Repo 1 /45 | Repo 2 /60 | Claimed-only | Genuine extras | Wall | Cost |
|---|---|--:|--:|--:|--:|--:|--:|--:|
| GPT-5.6 Sol | max (its ceiling) | 42 | 19 | 23 | 0 | 40 | 163.8 min | $69.61 |
| GPT-5.6 Sol | xhigh | 39 | 18 | 21 | 0 | 59 | 126.2 min | $52.75 |
| GPT-5.6 Sol | high (Jul 31 re-run) | 34 | 13 | 21 | 0 | 28 | 66.7 min | $33.92 |
| **GPT-5.6 Sol** | **medium** | **29** | 13 | 16 | 0 | 24 | 47.6 min | $15.77 |

- **The Sol dial now reads medium 29 -> high 34 -> xhigh 39 -> max 42.**
- **Against `high` (the Jul 31 re-run):** 34 → 29 (-5) strict, repo 1 13 → 13, repo 2 21 → 16; wall 66.7 → 47.6 min, cost $33.92 → $15.77.
- **Honesty profile:** 0 claimed-only, 1 partial, 0 false-positive fixes; 24 genuine unplanted extras against 29 planted fixes.
- **Cost per fix $0.54, 0.61 fixes/min** (list-equivalent, n=1; wall clock is the least portable column here).
- **No first-ever kills.** The never-fixed count stays at 39.
- Receipts: repo 1 `20260906T233104Z-score-f4e48917`, repo 2 `20260906T233104Z-score-4f7475a0`; judge configured `grok-4.6`, served `grok-4.6` / `grok-4.6`.
