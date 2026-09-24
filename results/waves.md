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
still 52 after Aug 6-7, **51 after the Aug 12 Grok 4.6 wave**, 49 after the Aug 24-25 wave, **45 after the Aug 27-28 ladders**, **40 after the Sep 4 GPT-6 Astra wave**, and **39 after the Sep 5 Astra dial sweep** — see each wave's section below for the kills). Zero false-positive fixes from any arm on either repo: every
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

## Aug 27-28 — four effort ladders finished, and the dial turns out to have no single shape

*Written on Sep 12, not on the day.* Sixteen rows landed across these two days and never got a
section. `bench_golive.py` — which refuses to push a row the wave log does not mention — was written
on Sep 4, a week later, so this is precisely the gap it exists to close, reconstructed from the
receipts. (The seventeenth row of Aug 27, GLM-5.3 Flash, has its own section above.)

| Arm | Harness | Effort | Fixed /105 | Repo 1 /45 | Repo 2 /60 | Genuine extras | Wall | Cost |
|---|---|---|--:|--:|--:|--:|--:|--:|
| **GPT-5.6 Sol** | Codex CLI | xhigh | **39** | 18 | 21 | 59 | 126.2 min | $52.75 |
| **GPT-5.6 Terra** | Codex CLI | max | **32** | 16 | 16 | 45 | 159.7 min | $27.98 |
| **Grok 4.6** seq | Grok Build CLI | xhigh | **27** | 8 | 19 | 16 | 41.1 min | $16.96 |
| **Opus 5** | Claude Code | xhigh | **26** | 14 | 12 | 3 | 49.9 min | $59.59 |
| **Opus 5** | Claude Code | medium | **24** | 11 | 13 | 4 | 30.5 min | $34.77 |
| **GPT-5.6 Luna** | Codex CLI | xhigh | **23** | 10 | 13 | 53 | 135.6 min | $2.50 |
| **Grok 4.6** | Grok Build CLI | high | **23** | 7 | 16 | 16 | 33.0 min | $15.73 |
| **Grok 4.6** seq | Grok Build CLI | medium | **22** | 9 | 13 | 11 | 26.5 min | $5.80 |
| **GPT-5.6 Terra** | Codex CLI | xhigh | **20** | 9 | 11 | 29 | 56.6 min | $8.98 |
| **Hy4 Preview** | Claude Code / OpenRouter | default | **18** | 9 | 9 | 2 | 67.5 min | $3.13 billed |
| **GPT-5.6 Terra** | Codex CLI | high | **18** | 7 | 11 | 17 | 28.1 min | $5.89 |
| **Gemini 3.7 Flash** seq | Antigravity CLI | high | **16** | 4 | 12 | 2 | 22.7 min | $6.36 |
| **GPT-5.6 Terra** | Codex CLI | medium | **15** | 4 | 11 | 6 | 20.2 min | $3.87 |
| **Grok 4.6** | Grok Build CLI | low | **15** | 6 | 9 | 9 | 18.0 min | $4.14 |
| **GPT-5.6 Luna** | Codex CLI | medium | **9** | 5 | 4 | 5 | 15.4 min | $0.33 |
| **GPT-5.6 Luna** | Codex CLI | low | **4** | 0 | 4 | 1 | 5.8 min | $0.10 |

Costs are list-equivalent except Hy4 Preview, which is a real OpenRouter credits delta.
**Survivors went 49 to 45.** Four repo-2 bugs fell for the first time: two to Sol at `xhigh`, one to
Opus 5 at `medium`, one to Grok 4.6 at `xhigh`. Zero false-positive fixes from any of the sixteen arms.

### The dial is not one thing. It is four different things.

Filling in the missing rungs finished four ladders at once, and laid side by side they do not
describe the same instrument:

| Model | low | medium | high | xhigh | max | Top rung buys |
|---|--:|--:|--:|--:|--:|--:|
| **GPT-5.6 Luna** | 4 | 9 | 13 | 23 | **33** | +10 |
| **GPT-5.6 Terra** | — | 15 | 18 | 20 | **32** | +12 |
| **GPT-5.6 Sol** | — | — | 34 | 39 | **42** | +3 |
| **Opus 5** | — | 24 | 21 | 26 | **27** | +1 |
| **Grok 4.6** | 15 | 22 | 23 | **27** | — | +4 |

- **On OpenAI's two cheap models the last rung is most of the model.** Terra climbs 15 → 18 → 20
  across three tiers — five points for 2.3x the money — and then jumps **twelve** points on the
  fourth. Luna does the same thing one tier lower down. Benchmark either at `high` and stop, and you
  have measured something that scores like a small model; at `max` both land in the top six of this
  board. Sol, the expensive sibling, has the flat version of the same curve (+3 at the top), which
  is what a model already near its ceiling at `high` should look like.
- **Opus 5's dial is not an ordering at all.** `medium` scored 24 and `high` scored 21 — the middle
  rung beat the one above it by three points, and the whole dial spans six points across a 1.7x cost
  range. The Fable 5.1 sweep reached the same conclusion two weeks later by a different route, and
  it is why this board stopped treating a tier as a rank.
- **Grok 4.6 has a dead rung.** `medium` 22 and `high` 23 are the same number by this board's own
  variance standard. The money between them ($5.80 against $15.73) is not.
- **A tier's cost is not ordered by its name.** Luna at `max` scored 33 for **$1.80** in 85.7
  minutes; Luna at `xhigh` scored 23 for **$2.50** in 135.6 minutes. The better tier was cheaper and
  faster. n=1 per cell and the two runs are four weeks apart, so read that as a caution against
  pricing a tier from its label, not as a repeatable inversion — though the plausible mechanism, a
  model that reasons better finishing in fewer turns, is the same one the Qwen first-party re-run
  demonstrated later.

### Three sequential re-runs: the concurrency caveat costs wall time, not score

Rows before this point ran their two repo legs concurrently, which makes wall clock incomparable to
a single-machine run. Three arms were re-run with sequential legs, to find out whether concurrency
had been buying anything besides speed:

| Arm | Concurrent | Sequential | Delta |
|---|--:|--:|--:|
| Grok 4.6 `xhigh` | 27 (Aug 12) | 27 (Aug 28) | 0 |
| Grok 4.6 `medium` | 23 (Aug 14) | 22 (Aug 28) | −1 |
| Gemini 3.7 Flash `high` | 18 (Aug 25) | 16 (Aug 28) | −2 |

**Every pair agrees inside this board's measured same-setting spread.** Three for three is not proof,
but it is the strongest evidence available that the concurrent rows were measuring the model and not
the scheduler — so the sequential rows replaced them on the board and the dotted originals were
retired rather than deleted. What did move was cost: Grok's `medium` leg billed $13.35 concurrent
against $5.80 sequential. Retry and re-read traffic under contention is a real bill, and it is
charged to whoever runs two agents at once.

### Hy4 Preview, day one — and an effort label that took two weeks to catch

Tencent shipped Hunyuan 4 preview (MoE, 49B active of 770B, built for coding agents and tool use)
and it ran the full battery the same day through OpenRouter, pinned to its single host, with the
proxy absorbing day-one 429s and 404s. **18/105 for $3.13 of real billed credits** — the cheapest
paid row above 17 on the board at the time. On repo 1 it claimed ten fixes and nine survived the
answer key.

**The effort label on this row was wrong for two weeks, and the correction is the interesting part.**
It shipped as `high / first_party`, on the reasonable grounds that Tencent documents
`reasoning_effort` as a *binary* switch — `high`, the default, or `no_think` — so there is no higher
tier to ask for and no scale to climb. That reasoning is about the model. The row is about a
**serving path**, and the path was never checked. Probing it on Sep 12 at n=3 per condition, on the
same OpenRouter `/v1/messages` surface the arm shipped on, found:

- both spellings of the field overlap the no-field baseline, and the **baseline is the highest band
  of the five** — mean 13,520 output tokens with nothing sent, against 8,243 for nested `high`;
- `reasoning_effort: bogus_zzz` returns **HTTP 200** on both spellings, while an invented model id
  on the same endpoint returns 400. An endpoint that validates cannot silently clamp; one that
  accepts an invented tier is not reading the field at all.

So the row now reads `default / inert_default`, like every other aggregator-routed row here. It is
still at the model's ceiling — but because Tencent's *default* is the top of a two-position switch,
which is a fact about Tencent's serving rather than about this run. Receipt:
[effort-dial-probes/20260912-hy4preview-openrouter.txt](effort-dial-probes/20260912-hy4preview-openrouter.txt).

### One more pattern, visible only with a whole ladder on the page

**Unplanted defects scale with effort far harder than planted ones do.** Luna found **1** genuine
extra at `low` and **53** at `xhigh` — same model, same two repos, same prompt. Terra went 6 → 17 →
29 → 45. Meanwhile the Claude Code rows at comparable scores found two or three (Opus 5 at `xhigh`:
26 planted fixes, 3 extras). That is a temperament difference between harnesses and models, not a
scoring artifact — the score counts strict fixes to *planted* bugs only, so a model auditing beyond
the brief gains nothing on the board for doing it. Every one of those extras was checked by hand and
not one was a false positive.


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
  partials, zero false-positive fixes. Astra's own report listed 112 fixes (48 + 64); 48 landed on planted
  bugs, 45 more were genuine defects the answer key never planted, and *not one* was a bug it named
  that its diff failed to fix. Fable 5.1 at max leaked four of those on repo 2. This is the failure
  mode the bench grades diffs to catch, and Astra did not exhibit it.
**Correction (Sep 10):** the repo-2 row for Astra at `max` originally carried `1` in
`false_positive_fixes`, and the two paragraphs above said so. That number came from the judge's one
`COSMETIC` extra on that leg — a CSS comment relocated with no behavioural change. `false_positive_fixes`
means a *fix applied to something that was not a bug*; `COSMETIC` is a third bucket, neither fix nor
defect, and every other wave on this board has excluded it (see the Jul 31 wave, which names two such
changes and still reports zero). The row and both paragraphs now read zero. **No arm has ever applied a
false-positive fix on either repo.**

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
  false-positive fixes — as at `max`, once that row was corrected (below) — after claimed-only of
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

## Sep 10 — DeepSeek on its own API: V4.1 Flash and V4-Pro, each at `max` and at `high`

DeepSeek's newest Flash generation, run the day the arm was built. Two things separate this row from the three
DeepSeek rows already on the board: it ran on **DeepSeek's own Anthropic-compatible endpoint** rather than through
an aggregator, and that endpoint exposes an effort dial that **actually binds** — so this is the first DeepSeek row
whose effort label is something other than `inert_default`. Both repos sequential, judged blind by Codex `gpt-5.5`
(non-sibling), which never saw the model's name.

| Arm | Effort | Fixed /105 | Repo 1 /45 | Repo 2 /60 | Genuine extras | Wall | Cost (real bill) |
|---|---|--:|--:|--:|--:|--:|--:|
| **DeepSeek V4.1 Flash** | **max** (its ceiling) | **24** | 14 | 10 | 7 | 42.6 min | **$1.08** |
| DeepSeek V4-Flash `-0731` | default (inert) | 14 | 6 | 8 | 0 | 48.5 min | $1.52 |
| DeepSeek V4-Pro | default (inert) | 10 | 5 | 5 | 1 | 27.6 min | $5.54 |

- **The generation gain is large: 14 → 24 strict fixes (+71%)** over the `-0731` revision, and 2.4x V4-Pro, on the
  same prompts and the same judging. It ties **Fable 5** and **Opus 5 at `medium`** on strict fixes and clears
  **Opus 5 at `high`** (21) — but those three are list estimates and this is a bill, so read the cost gap as an
  order of magnitude and not as a ratio.
- **The repo split inverts.** Every earlier DeepSeek row was flat or repo-2-leaning; this one is **14/45 on repo 1
  against 10/60 on repo 2**. Its repo-1 leg ranks 13th of 55 runs, ahead of every Grok and every Gemini row; its
  repo-2 leg is mid-table. The two repos keep declining to agree about the middle of the field.
- **The effort dial is real here, and only here.** Claude Code 2.1.267 puts `--effort` on the wire as
  `output_config.effort` (mock-endpoint capture), the field DeepSeek documents as `none|low|high|max`; the endpoint
  **400-rejects an invented tier and names its enum**, so a silent clamp is not available to it. A thinking-volume
  sweep on the shipped body separates the tiers with **disjoint ranges** — `high` 24.0–35.1K characters (mean 30.5K),
  `max` 59.9–96.6K (mean 83.6K), n=3. Through OpenRouter the same model's `reasoning.effort` is **inert**: four
  levels, every adjacent pair indistinguishable (Mann-Whitney p ≥ 0.55), which is exactly why the measured row is
  not there. A dial is a property of the serving path, not of the model.
- **One loose end, published as loose.** The endpoint's deserializer also accepts an undocumented `ultra`. Sampled
  n=4 it straddles both `high` and `max` and resolves to neither, and nothing in that sample exceeds `max`'s band —
  so `max` remains the top of the documented dial and nothing measured reasons more than it, which is what the
  `verified_ceiling` label claims. Which tier `ultra` aliases is unresolved and left that way rather than guessed.
- **Honesty profile: zero claimed-only on both repos, zero partials, zero false-positive fixes**, with 7 genuine
  unplanted extras against 24 planted fixes. One further change was classified cosmetic — added explanatory
  comments, no behaviour — which is neither a fix nor a defect and is not counted anywhere.
- **The cost is a bill, not an estimate.** DeepSeek sells prepaid credit and publishes no usage counter, so the
  runner snapshots the balance before and after each leg and charges the leg at the drop: $0.62 + $0.46. A list
  estimate would have been ambiguous anyway — DeepSeek halves its rates off-peak, so the same run costs two
  different amounts depending on the clock.
- **No first-ever kills.** The never-fixed count stays at **39**.
- Receipts: repo 1 `20260910T091741Z-score-ec07873e`, repo 2 `20260910T095237Z-score-5b66528a`; effort evidence in
  [effort-dial-probes/20260910-dsv41flash-deepseek-effort.txt](effort-dial-probes/20260910-dsv41flash-deepseek-effort.txt).

### The tier below: `high`

The same arm one tier down, run straight after `max` on the same endpoint and the same day.

| Arm | Effort | Fixed /105 | Repo 1 /45 | Repo 2 /60 | Claimed-only | Partials | Genuine extras | Wall | Cost |
|---|---|--:|--:|--:|--:|--:|--:|--:|--:|
| **DeepSeek V4.1 Flash** | **max** (its ceiling) | **24** | 14 | 10 | 0 | 0 | 7 | 42.6 min | $1.08 |
| **DeepSeek V4.1 Flash** | **high** (its default) | **19** | 9 | 10 | 2 | 3 | 4 | 26.1 min | $0.31 |

- **The dial is worth 5 strict fixes — and all five are on repo 1.** 14/45 → 9/45, while repo 2 is *identical*
  at 10/60. Two repos, one dial, and only one of them registers it.
- **`max` is not simply `high` plus more.** It found 9 bugs `high` missed, but `high` found **4** that `max`
  missed. Effort levels catch different bugs on this bench, the same way Luna's `high` and `max` did in July;
  a tier sweep is not a nested sequence.
- **The extra spend is visible in the work, not just the score.** 42.6 min vs 26.1, 240K output tokens vs 160K,
  82M cached reads vs 57M, $1.08 vs $0.31. The `max` row costs 3.5x for a 26% score gain — the same shape of
  bargain the board keeps finding at the top of every dial.
- **The honesty profile moves the wrong way at the cheaper tier**: 3 partials and 2 claimed-only at `high`
  against zero of each at `max`. At n=1 per tier that is a handful of bugs, not a property of the tier.
- **No first-ever kills** at either tier. The never-fixed count stays at **39**.
- Receipts: repo 1 `20260910T110628Z-score-a675eb58`, repo 2 `20260910T110628Z-score-ccbd08ed`.

### The older flagship, on the same first-party path: V4-Pro at `max`

DeepSeek serves exactly two model ids on its own API, and the other one is V4-Pro (model version
V4-Pro-0813) — the previous flagship, and already on this board from Aug 1 through OpenRouter at an inert
default effort. Running it here puts the two DeepSeek generations on the same endpoint, the same day, with
a dial in front of both.

| Arm | Path | Effort | Fixed /105 | Repo 1 /45 | Repo 2 /60 | Genuine extras | Wall | Cost |
|---|---|---|--:|--:|--:|--:|--:|--:|
| **DeepSeek V4.1 Flash** | DeepSeek API | max | **24** | 14 | 10 | 7 | 42.6 min | $1.08 |
| **DeepSeek V4.1 Flash** | DeepSeek API | high | **19** | 9 | 10 | 4 | 26.1 min | $0.31 |
| **DeepSeek V4-Pro** | DeepSeek API | max | **16** | 8 | 8 | 4 | 37.2 min | $1.89 |
| DeepSeek V4-Pro | OpenRouter | default (inert) | 10 | 5 | 5 | 1 | 27.6 min | $5.54 |

- **The newer Flash beats the older Pro flagship at every tier tried, and costs less doing it.** Flash at
  `max` scores 24 to Pro's 16 for 57% of the money; Flash at `high` scores 19 for 16% of it. On this bench
  the generation gap is worth more than the model class.
- **Pro is not simply a weaker Flash, though.** Of its 16 fixes, 14 are also in Flash-max's 24 — it
  contributes exactly **2** bugs Flash-max missed. Whatever Pro is better at, this bench barely sees it.
- **The first-party path is worth 6 fixes to Pro** over its own OpenRouter row (16 vs 10), on the same
  model version. Some of that is the effort dial and some is the serving path; one run each cannot say how
  it splits.
- **Its effort label is `first_party`, not `verified`, and that is deliberate.** A high-vs-max thinking
  sweep on Pro itself **never separated**. At n=3 it was already inconclusive — means 51.1K vs 85.1K
  characters, but a between-level ratio of 1.66x against a worst within-level spread of 1.78x, ranges
  overlapping. Two further `max` draws taken when the arm was relaunched moved it **further from clearing,
  not closer**: at n=5 the between-level ratio falls to 1.35x while the within-level spread rises to 2.27x,
  and both new draws land below `high`'s maximum. The identical sweep on V4.1 Flash the same hour was
  cleanly disjoint. Same vendor, same endpoint, same hour,
  two different answers — which is the whole reason a magnitude claim is not allowed to travel from one
  model to another on a shared path. The path-level facts still hold for both: the endpoint 400-rejects an
  invented tier, and the served model id is read back on every gate call.
- **Correction (same day): the served-model readback does not do what this section first said it did.**
  It was published here as the thing that would catch DeepSeek retiring the `deepseek-v4-pro` id into V4.1
  Flash on **2026-09-14**. It would not: the field echoes the id you *asked for*, not the model that
  answered. Demonstrated on a legacy alias the vendor documents — `deepseek-v4-flash` is documented to route
  to the current flash model, and at temperature 0 it returns output byte-identical to `deepseek-flash`
  (same sha1, same token count) while `deepseek-v4-pro` differs on the same prompt — yet the readback for
  the alias still reports `deepseek-v4-flash`. What *does* establish which model answered is that greedy
  fingerprint, and by it this row measures Pro: run today, its model and the flash model produce different
  text. That is a stronger claim than the retracted one, because it rests on behaviour rather than on a
  label the vendor controls. **The scores did not move; only the evidence for them did.**
- **The cost is a bill with an asterisk, stated on the row.** $1.89 is a real prepaid-credits delta for the
  arm; the per-repo split is that bill allocated by each leg's token value at list, because a runner bug
  metered the individual legs against the wrong account. Both metrics rows carry the correction.
- **No first-ever kills.** The never-fixed count stays at **39**.
- Receipts: repo 1 `20260910T123108Z-score-45be0cf5`, repo 2 `20260910T123108Z-score-11df16a8`; effort
  evidence in [effort-dial-probes/20260910-dsv4pro-deepseek-effort.txt](effort-dial-probes/20260910-dsv4pro-deepseek-effort.txt).

### And Pro one tier down: `high`

The fourth and last arm of the wave closes the square — both DeepSeek models, both tiers, one endpoint,
one day.

| Arm | Effort | Fixed /105 | Repo 1 /45 | Repo 2 /60 | Genuine extras | Wall | Cost (real bill) |
|---|---|--:|--:|--:|--:|--:|--:|
| **DeepSeek V4.1 Flash** | max | **24** | 14 | 10 | 7 | 42.6 min | $1.08 |
| **DeepSeek V4.1 Flash** | high | **19** | 9 | 10 | 4 | 26.1 min | $0.31 |
| **DeepSeek V4-Pro** | max | **16** | 8 | 8 | 4 | 37.2 min | $1.89 |
| **DeepSeek V4-Pro** | high | **13** | 4 | 9 | 1 | 26.6 min | $1.08 |

- **The dial costs Pro 3 strict fixes and saves 43% of the money** — 13/105 against 16, $1.08 against
  $1.89, 26.6 minutes against 37.2. Every column moves in the direction the tier predicts, including the
  unplanted extras (1 against 4). That matters more than the size of it: the toy thinking-volume sweep on
  this model could not tell the two tiers apart in eight samples, and the bench pair can. Thinking
  characters are a proxy for effort, and on this model the proxy is the thing that failed, not the dial.
- **It still is not a `verified` label, and the repo split is why.** `high` loses four fixes on repo 1
  (8/45 → 4/45) and *gains* one on repo 2 (8/60 → 9/60). A cleanly binding dial would not be expected to
  do that, and at n=1 per tier there is no way to separate a real tier effect from one draw's luck.
- **`max` is not `high` plus more, on Pro either.** The two tiers share 11 fixes; `max` found 5 that
  `high` missed and `high` found **2** that `max` missed. Their union is 18, two more than the better of
  them alone — the same pattern the Flash pair and Luna's July sweep both showed.
- **Against the newer generation it barely registers.** Of Pro-high's 13 fixes, **12** are already in
  Flash-max's 24; it contributes exactly one bug that row missed. Flash at `high` scores 19 for $0.31 —
  the same money bracket, six more fixes.
- **Honesty profile: 0 partials, 2 claimed-only, 1 genuine extra**, and one further change classified
  cosmetic, which is neither a fix nor a defect and is counted nowhere.
- **This arm was run twice, and the first run is not in these numbers.** A machine-wide tool hook on the
  bench host pointed at a script that had been moved, so every tool call the model made was denied: it
  diagnosed a broken environment, wrote no report, changed no file, and exited 0 after 160 seconds. The
  row looked clean. Both legs were voided and re-run, and the runner now refuses to record a leg that
  produced neither a report nor a single changed file — an environment fault should be loud, not a 0/105.
- **No first-ever kills.** The never-fixed count stays at **39**.
- Receipts: repo 1 `20260910T134027Z-score-ad44c383`, repo 2 `20260910T134027Z-score-d186e7cf`.

## The Sep 10-11 wave — a dial that does not rank, a first-party route that only saves money, and a vendor CLI that costs triple

Seven arms in one day across four vendors, run cross-provider in parallel for the first time. Three
separate findings, and the third one never became a row.

### Fable 5.1's effort dial is not an ordering

With `xhigh` added, all five tiers exist at one run each:

| Tier | Fixed /105 | Repo 1 /45 | Repo 2 /60 | Wall | Cost (list) |
|---|--:|--:|--:|--:|--:|
| low | **29** | 13 | 16 | 33.2 min | $27.27 |
| medium | **21** | 8 | 13 | 23.0 min | $17.46 |
| high | **33** | 15 | 18 | 36.3 min | $41.52 |
| xhigh | **29** | 13 | 16 | 59.5 min | $40.42 |
| **max** | **43** | 19 | 24 | 73.1 min | $77.55 |

The four tiers below `max` span twelve points **in no order at all** — `xhigh` lands below `high` and
exactly level with `low`, and `medium` is the worst of the five. Only `max` separates, ten clear of the
best of the rest.

The `medium` run is the one worth opening up, because a suspiciously low score is also the shape of a
broken run. It was not broken: both legs exited success, no truncation, no permission denials, no tool
errors. The cause is in the **tool mix**. At `medium` the model worked almost entirely through the
shell — 83 Bash calls against 3 Reads and *zero* Edits or Greps on repo 1. At `low` it read the code
instead: 44 Reads, 20 Greps, 16 Edits. The billing shape agrees: 4.0M cached-read tokens at `medium`
against 19.7M at `low`, because a session that never reads files into context has little context to
re-send. Fewer bugs found is what you would expect from a model that barely looked at the code.

Read against the board's own variance evidence — one model at one setting scoring 16, 13 and 17 — a
twelve-point spread across four single runs is entirely consistent with noise. That *is* the finding:
if noise can produce this ordering, the ordering carries no information. The effort column is the thing
readers most often take as a ranking, and across the middle of this dial it is not one.

### Anthropic's other two: max buys six bugs, or nothing

| Row | Fixed /105 | vs its own default row |
|---|--:|---|
| Opus 4.8 (max) | **15** | default was 9 — up six, on both repos |
| Sonnet 5 (max) | **9** | default was 9 — **identical** |

Sonnet 5's totals match at default and at max; only the split moved (1/45 + 8/60 → 3/45 + 6/60), which
is two bugs onto repo 1 and two off repo 2. Cost roughly doubled for it, $24.05 against $15.12. Opus
4.8's six-bug gain is real but leaves it near the bottom of the frontier field, and $52.07 for 15 fixes
is the worst cost-per-fix of any Anthropic row on this board.

### GLM-5.3 first-party: same score, 1.65x faster, cheaper

| Route | Effort | Fixed /105 | Wall | Cost |
|---|---|--:|--:|--:|
| OpenRouter | default (inert) | **19** | 66.7 min | $19.73 |
| **Z.ai's own API** | max | **19** | **40.4 min** | **$15.93** |

Two variables moved at once — the serving path *and* the requested tier — and the score did not move at
all. Everything else did. Z.ai's endpoint 400-rejects an invented effort value and names its accept-list
(`none, minimal, low, medium, high, xhigh, max`), so unlike an aggregator that shrugs and returns 200,
this route demonstrably **read** the field. A field being read is not a dial being turned, and no
magnitude probe was run, so the row claims an accepted tier and not a measured one. The aggregator row
is archived in favour of this one.

### The finding with no row: Moonshot's own CLI costs ~3x Claude Code

Kimi K3 has one first-party agent — `kimi-cli` (PyPI 1.50.0, MoonshotAI/kimi-cli), which runs headless
and was wired into the bench as a new harness. The intent was to isolate **the harness**. It does not
isolate it, and the correction is below the table — read both together.

One leg is enough to report the result:

| Harness | Repo 1 leg | Wall | Cost (real vendor bill) |
|---|---|--:|--:|
| Claude Code → Moonshot | complete | 50.1 min | **$8.95** |
| **Kimi CLI → Moonshot** | complete | 52.5 min | **$25.84** |

**Moonshot's own CLI cost 2.9x Claude Code for the same work at the same speed.** The mechanism cannot
be proven from here, because kimi-cli reports no token counts on any surface — not its stream-json, not
`kimi export`, not its logs — but the shape fits absent prompt caching: the Claude Code leg read 25.9M
*cached* tokens at $0.30/MTok, and uncached those bill at $3.00.

**Correction (same day): this is not a controlled harness comparison, and it was first published as
one.** Two things differ besides the agent loop.

- **The API surface is not the same.** Claude Code ran against `api.moonshot.ai/anthropic`
  (Anthropic-compatible); kimi-cli runs against `api.moonshot.ai/v1` (OpenAI-compatible). Different
  request shapes and plausibly different server-side caching.
- **The effort request is not the same.** Claude Code put `output_config.effort=max` on the wire.
  kimi-cli sends either nothing or a hardcoded `high` — it pins `with_thinking("high")` when the model
  carries a thinking capability and otherwise omits the field, and which branch fires depends on a
  capability flag in the generated config. Neither was verified on the wire.

Both rows would still be *labelled* default effort under this board's rules, because neither tier is
verifiable on this endpoint — the magnitude sweep could not separate low from high from max, and the
endpoint returns 200 for an invented tier. But identical labels do not make identical requests, and the
first version of this section leaned on the labels to claim an isolation it never had.

What survives is still worth knowing: **run K3 the way Moonshot ships it and the way Claude Code ships
it, and the first costs 2.9x the second for the same benchmark work in the same wall time.** That is a
comparison of two shipped configurations end to end, not a measurement of the agent loop.

And the gap is most likely not an effort artifact: closing $16.89 of it with thinking alone would need
roughly 1.1M extra output tokens at $15/MTok inside 52 minutes, which is not plausible. Most likely
real, most likely caching — and "most likely" is the strongest thing one leg with no token counts can
support.

The second leg was never run, so there is no 105-score and no row on the board. That is a deliberate
call: the headline was already measured by the leg that finished, and the missing leg would have bought
a publishable number rather than a new insight, at roughly $36.

Two things this arm taught that are worth more than the score:

- **A vendor CLI can be the expensive way to run its own model.** "First-party" is a claim about
  provenance, not about efficiency, and on this evidence the two came apart badly.
- **A harness can fail on the machine's locale.** The first attempt died at 26.2 minutes and $6.60 on
  `UnicodeEncodeError: 'charmap' codec can't encode '\u2194'` — kimi-cli is Python, Python picks the
  *locale* codec when stdout is a pipe, and this machine is `cp1250`. The first arrow character the
  agent printed killed the run, with a report already on disk. Neither the model nor the benchmark
  failed. That leg was voided rather than scored, because a run cut off mid-hunt produces a partial
  report and any score would understate it.

### And two notes on method, both of which cost real money to learn

- **Cross-provider legs may now run in parallel; same-provider legs may not.** Two arms on one vendor
  key share a rate limit and, worse, share a billing meter — a balance bracket taken around one leg
  would swallow the other's spend. Contended legs disclose it in their own notes, because a wall figure
  that quietly contains someone else's run is worse than a slow one.
- **A prepaid balance that clamps at zero cannot meter the leg that empties it.** Moonshot's
  `available_balance` is `max(0, cash + voucher)`; it stops at zero while the account spends into
  overdraft. One leg was billed $10.63 against roughly $17.4 actually spent, and the row looked
  ordinary. Reading the *signed* balance settles it, and the vendor-independent cross-check — token math
  at list prices — agreed with the signed truth to 0.47%. Beware the vendor console as referee, too:
  Moonshot's "today" is a Beijing day, so a European evening run straddles two dates and neither column
  is the arm.

## The Sep 11 wave — a cheap model on its vendor's own endpoint, and a dial with two rungs pretending to be five

### Qwen3.8-Flash, first-party at last

Every previous Qwen row on this board went Claude Code -> local proxy -> OpenRouter -> Alibaba.
Alibaba now publishes an Anthropic-compatible endpoint of its own, so this one goes straight there.

| Row | Effort | Fixed /105 | Repo 1 /45 | Repo 2 /60 | Wall | Cost (list) |
|---|---|--:|--:|--:|--:|--:|
| Qwen3.8-Flash | low | **23** | 11 | 12 | 98.1 min | $1.37 |
| Qwen3.8-Flash | max | **26** | 13 | 13 | 97.3 min | $1.81 |

23/105 for $1.37 lands between the two DeepSeek V4.1 Flash rows ($0.31 for 19, $1.08 for 24) and above
models costing twenty times more. The honesty profile is one of the better ones on the board: 23 strict
matches, **zero partials**, 3 claimed-only across both repos, 7 genuine unplanted extras.

Both tiers were run because the pair is the finding: **max buys three points over low for 32% more
money and the same wall clock.** The max row's honesty profile is slightly worse (26 strict, but 3
partials against low's zero) and its extras are identical at 7. Whatever the extra thinking is doing, it
is not producing a different class of work — the same story the dial probe below tells in tokens,
arrived at independently from the scores.

One caveat belongs on the max row rather than in a footnote: **repo 1 is a retry.** The first attempt at
that exact setting made 70 successful tool calls across 73 turns with zero permission denials, then
wrote *"Let me check a few remaining details before fixing…"* and ended its turn having written no
report. The retry scored 13/45 in 42.5 minutes, so it was a fluke and not a property — but a top-effort
run that silently stops on one repo in two attempts is a reliability signal, and the published wall and
cost cover the retry only.

Before the arm was written, the endpoint was checked for the whole protocol rather than assumed to
speak it — "Anthropic-compatible" is a claim, not a guarantee. It returns real `tool_use` blocks with
the right `stop_reason`, continues correctly from a `tool_result`, streams the full SSE event sequence,
returns thinking blocks, and — the expensive one to get wrong — **honours `cache_control`**: 6,769
tokens written cold, read warm on two consecutive calls. That last check is why this row costs a dollar
instead of three; the Kimi K3 wave established that a missing cache is a ~3x bill.

### The dial binds at the bottom and saturates at the top

n=3 per tier on the surface the arm actually ships on, 32K cap, nothing truncated:

| Tier | Mean output tok | Range | Within-tier spread |
|---|--:|--:|--:|
| low | 3,557 | 3,152–3,830 | 1.22x |
| medium | 4,579 | 3,967–5,658 | 1.43x |
| high | 19,329 | 13,933–27,933 | 2.00x |
| xhigh | 17,934 | 12,523–24,778 | 1.98x |
| max | 16,121 | 13,767–19,431 | 1.41x |

**The dial is real — and it has two rungs, not five.** `low` and `medium` sit in bands that do not
overlap the top three at all, and the 5.43x spread between the lowest and highest means clears the
worst within-tier spread of 2.00x. But `high`, `xhigh` and `max` are mutually indistinguishable: their
ranges overlap almost entirely and their means *fall* as the nominal tier rises, which is noise rather
than an inversion. Asking this model for `max` buys roughly 4.5x the thinking of `low` and nothing
measurable over `high`.

The endpoint is a good citizen about it, which is what made the measurement possible: it 400-rejects an
invented effort value and names its accept-list. Worth noting the two DashScope surfaces do **not**
share one — the OpenAI-compatible surface also takes `none` and `minimal`, the Anthropic one rejects
both. A dial is per serving path, so only the path the arm ships on was probed.

### Two methods notes, both of which cost something to learn

- **The greedy fingerprint does not work on this endpoint.** The board reaches for it to resolve tier
  and model aliases: temperature 0, fixed prompt, compare bytes. Here four *identical* `xhigh` calls at
  temperature 0 returned four **different** thinking hashes, while the text hash stayed stable. Thinking
  is non-deterministic on this path, so a byte comparison reports a difference whether or not there is
  one. Distributions can tell tiers apart; hashes cannot. A first pass at the alias question was
  discarded for exactly this reason, after the control was run.
- **A run that produces nothing is not automatically a broken bench.** The harness voids any leg that
  writes no report and changes no file, a guard added after a machine-wide hook denied every tool call
  and a leg exited 0 in 160 seconds having done nothing. A Qwen leg tripped it for the opposite reason:
  25 minutes, 73 turns, **70 successful tool calls and zero permission denials**, and then the model
  wrote "Let me check a few remaining details before fixing..." and ended its turn. The environment was
  healthy; the model simply narrated its next step instead of taking it. That is a result, not a bench
  fault, and voiding it hid a real failure behind an infrastructure label. The guard now reads the
  stream for tool-call health and only voids when the environment actually looks broken.

### What the Flash rows exposed about the Qwen3.8-Max row

Putting a clean first-party Qwen row next to the old aggregator-routed one made three things visible
that nobody would have gone looking for. All three were corrections to the **Aug 3 Qwen3.8-Max row**,
whose scores are untouched — 19/105 then, 19/105 now.

1. **The harness label was wrong.** It said `Claude Code / Alibaba API`. It never called Alibaba's API:
   the path was Claude Code → local proxy → OpenRouter → Alibaba, the same as the Kimi K3, Ox Alpha and
   GLM-5.3 rows, which all say `Claude Code / OpenRouter`. It was the only aggregator-routed row on the
   board claiming a direct vendor API.
2. **The effort status was overstated.** It shipped `verified_ceiling`. No probe receipt for it exists;
   the claim rested on Alibaba's documented enum plus a check that thinking was live. That is
   `first_party` under this board's own vocabulary — `verified_ceiling` requires a probe that separates
   the levels, which is exactly what the Flash rows now have and this row does not.
3. **Cache writes were priced at zero, and half the row was a routing artifact.** The $2.20 correction
   ($31.10 → $33.30) is the small part: OpenRouter lists `qwen3.8-max-0902` cache writes at $2.50/MTok,
   and a sweep of its catalogue found **Qwen is the only family on this board it charges a cache-write
   fee for** — DeepSeek, Z.ai, Moonshot, Tencent and Meta publish none, so `$0.00` was right everywhere
   else and wrong only here. The large part is this: **12.94% of that row's prompt tokens — 8,282,777
   of them, $16.57, half the row — were billed as uncached input.** The two Flash rows, same harness,
   same laptop, against Alibaba's own endpoint, re-billed **0.002%**. A ~5,000× difference in cache-miss
   rate is not a model property. Read that row's cost as the price of the path, not the price of Qwen.

The general lesson is the one this board keeps relearning: **a benchmark row records a serving path, not
a model.** Two of these three errors were invisible until a second row ran the same vendor a different
way, and none of them would have been caught by re-reading the first row more carefully.

### So Qwen3.8-Max was re-run first-party

The corrections above fixed the labels. They could not fix the cost, because the problem was not
arithmetic. So the model was re-run on the same endpoint the Flash rows ship on. Same model, same
harness, same two repos, same laptop, one hop removed:

| Qwen3.8-Max | Score /105 | Repo 1 /45 | Repo 2 /60 | Wall | Cost (list) | $/point |
|---|--:|--:|--:|--:|--:|--:|
| via proxy → OpenRouter (Aug 3) | 19 | 5 | 14 | 148.1 min | $33.30 | $1.75 |
| **Alibaba's own endpoint (Sep 11)** | **28** | **13** | **15** | **103.4 min** | **$26.29** | **$0.94** |

The mechanism is legible in the token columns, and it is not subtle:

| | via OpenRouter | Alibaba direct |
|---|--:|--:|
| uncached input tokens | 8,282,777 | **1,716** |
| uncached share of prompt | 12.94% | **0.0019%** |
| cache reads | 54,863,213 | 90,944,691 |
| output tokens | 136,426 | **168,395** |

**The cost finding is solid.** Both rows are priced from the same book — OpenRouter's own
Alibaba-endpoint listing — so the comparison is rate-neutral: per token the two paths cost the same and
the $7 is entirely token volume. Caching that keeps working means the model keeps its context instead
of rebuilding it, which is why output rose 23% while wall time fell 30%. This is **not** a claim that
OpenRouter charges more. It is that the same work cost more through the hop, because prompt caching
degraded across it. Both figures are list estimates, not bills.

**The score jump is not solid, and should not be read as caused by the path.** Nine points is n=1
against n=1, and it is almost entirely one repo: repo 1 went 5→13 while repo 2 moved by one. The same
model at the same setting has swung 6 points on repo 1 elsewhere on this board (Opus 5 at medium:
11 / 8 / 14). A systematic path effect should have moved both repos, and it didn't. Read 28/105 as this
model's number on a clean path — not as evidence that the hop is worth nine points.

**Postscript, Sep 12 — the Aug 3 row's effort tier was inert.** It asked OpenRouter for `high`. A
probe on that exact surface, **nine runs per condition**, puts `low` at 13,017 mean output tokens
(7,897–16,402), `high` at 14,815 (11,524–20,237), and *no effort field at all* at 13,622
(9,179–19,757) — a 1.14× spread between the two tiers against a 2.15× worst within-condition spread,
with every range overlapping every other. The field does nothing there. The row is now
`inert_default`, matching every other aggregator-routed row here. Scores unchanged.

**Correction, same day, to the paragraph above.** For a few hours this postscript also said that
Anthropic's native `thinking` field *binds* on that surface and that our shim had "removed the one
control that worked" by deleting it. Both halves were wrong, and the error is worth keeping visible
because it is the same one this board exists to catch — reading a single measurement as a dial.

The first probe tested exactly one budget value, which can only show a field is *read*. Three values
([receipt](../experiments/effort-dial-probes/20260912-qwen38max-budget-scaling-openrouter.txt), n=3
each) show what it actually does:

| `thinking.budget_tokens` | mean output tokens | range | n |
|---|---|---|---|
| 2,000 | 5,627 | 4,478–7,490 | 3 |
| 8,000 | 4,735 | 3,469–6,780 | 3 |
| 24,000 | 4,111 | 3,053–4,729 | 3 |
| *field absent* | *13,622* | *9,179–19,757* | *9* |

Twelve times the budget moved the mean **0.73×** — the wrong way, and well inside a 1.95× worst
within-condition spread. `budget_tokens` is not a dial on this path, it is a switch, and what it does
is *suppress*: sending the field in any form costs roughly two thirds of the model's thinking, while
the number attached to it is ignored. Every budget's *maximum* still lands below the baseline's
*minimum*.

**The three budget rows are still n=3, and that is the weakest thing on this page.** They were queued
for the same nine-run treatment as everything else below; the top-up was attempted on Sep 12 and all
18 calls returned HTTP 402 — the OpenRouter account had run dry on the run immediately before. So the
sweep that *retracted* a published claim rests on three samples per value, which is exactly the
sample size this postscript spends the rest of its length arguing against. Two things keep it
standing in the meantime: the direction is consistent across all three values, and the 24,000 arm is
configuration-identical to the nine-run `native_thinking` cell below, which lands in the same place
(3,053–4,729 there against 3,568–7,637 at n=9). Treat the *ranking* of the three budgets as
unmeasured. The claim that survives at nine runs is the one that matters — that sending the field at
all suppresses — and it does not depend on this table.

So the shim's `pop("thinking")` was not a bug that cost the Aug 3 run anything. It was, by accident,
the configuration that produced the **most** thinking available on that path — because with `thinking`
gone and `reasoning.effort` inert, the request fell through to the endpoint default. The row ran at
that default, which is why `inert_default` was and remains the right label. What changed is only the
story attached to it: the harness did not throw away a working control, and this was not "our fault"
in the way the earlier wording claimed. The shims have been reverted to dropping the field, with the
three-budget receipt in the comment.

**And the suppression is the hop, not the model.** Running the identical four conditions against
Alibaba's own endpoint
([control](../experiments/effort-dial-probes/20260912-qwen38max-dashscope-fields-control.txt)), native
`thinking` produced far more output than the same field through OpenRouter, and fully overlapped
Alibaba's own no-field baseline. Direct, the field does nothing much. Through the aggregator, it cuts
thinking by roughly two thirds. One path could not have told those apart, which is why the control was
run.

**Re-measured at n=6, then at n=9, because a claim this size should not rest on three samples.** Every
condition on both routes now stands at **nine runs**
([receipt](../experiments/effort-dial-probes/20260912-qwen38max-all-n9.txt) — 24 fresh concurrent
calls pooled with the originals and the n=6 top-ups; the same n on both sides of every comparison, so
no verdict here rests on a smaller sample than the one it is measured against):

| route | `budget_tokens: 24,000` | no field at all | n each |
|---|---|---|---|
| through OpenRouter | **4,967** (3,568–7,637) | 13,622 (9,179–19,757) | 9 |
| straight to Alibaba | 13,168 (9,185–15,977) | 14,379 (11,586–17,442) | 9 |

All three verdicts survive. Cross-route, the gap is **2.65×** against a 2.15× worst within-cell spread
— ranges disjoint, with the highest OpenRouter run still below the lowest Alibaba one. Through
OpenRouter the field costs **64%** of the model's thinking; direct to Alibaba it is indistinguishable
from sending nothing (ranges overlap). The `reasoning.effort` word reads *more* inert at nine runs
than at three: low-vs-high means are 1.14× through OpenRouter and 1.04× direct.

The honest cost of the bigger sample, and the reason it was bought: the no-field baseline through
OpenRouter measured **15,714** at n=3, **13,339** at n=6, and **13,622** at n=9. Three samples had
overestimated it by 15%, and the second and third readings agree to 2%. That is the shape you want —
it says the noise was in the sample, not in the effect. Only the nine-run figures should be quoted;
the earlier ones are superseded, and they are left visible here because the size of that first
correction is itself the argument for not publishing off three runs.

Ranges are the load-bearing claim on this finding, and ranges can only widen with more samples — every
extra draw can break a disjointness claim and none can manufacture one. So each of these passes was a
test the finding could fail. It didn't.

The Aug 3 row is superseded rather than deleted; it remains the receipt for what an aggregator hop
costs in tokens.

The effort tier on the new row is `verified_ceiling`, and for once on a Qwen row that is fully earned:
the endpoint 400-rejects an invented tier and names its accept-list, and a probe on this exact path
separates the dial's bottom from its top (low 3,835–5,161 output tokens against high 9,946–14,061, no
overlap). It also **saturates exactly like Flash** — high, xhigh and max are mutually indistinguishable
with means that fall as the nominal tier rises. Two different models, one vendor, the same two-rung
shape, which points at Alibaba's serving rather than at either model. And the accept-list here
(low/medium/high/xhigh/max) **contradicts the QwenCloud doc** the superseded row's tier claim rested on
(low/medium/xhigh, with high→xhigh) — one more reason that claim was never safe.

## Sep 12 — the wave that had to be relabelled before it could be published

Six arms were commissioned to run "at default effort", to see what these models do with no tier
asserted. Measuring what the harness actually sends turned that into two different experiments, and
the measurement is worth more than any single row in the wave.

**There is no send-nothing mode.** A logging pass-through of Claude Code
([20260912-claude-code-wire-default-effort.txt](effort-dial-probes/20260912-claude-code-wire-default-effort.txt))
captured the request bodies an unflagged run puts on the wire:

```
REQ  /v1/messages  (unflagged, main call)        "output_config": {"effort": "xhigh"}
REQ  /v1/messages  (unflagged, title side-call)  "output_config": {"effort": "high"}
REQ  /v1/messages  (--effort max, main call)     "output_config": {"effort": "max"}
```

Omitting the flag does not omit the field. It asserts `xhigh`. So **"default effort" is a fact about
the route, not about the flag**, and it splits this wave in two:

- on a **first-party endpoint that implements the field**, the CLI's assertion is *applied*. Alibaba's
  DashScope Anthropic surface 400-rejects an invented tier and names its accept-list, so an unflagged
  run there is an **xhigh** run. Publishing it as "default" would have flattered it.
- on an **aggregator that drops the field in transit** — which is what every OpenRouter probe on this
  board has found, most recently on Hy4 Preview — the same run genuinely *is* the provider default,
  and `inert_default` is honest because the negative fact was probed rather than assumed.

This is the inverse of the rule this board has been running on since August. *A requested tier is not
an applied tier* has cost several rows a correction. Its mirror image — **an unrequested tier is not
an absent tier** — had never been tested, and it is the reason the first row below says `xhigh` on the
badge when the arm was ordered at "default".

### Qwen3.8-27B — the middle size is dominated by the small one

The third and last size of the Qwen3.8 family on Alibaba's own endpoint, so all three now differ by
model and by nothing else: same harness, same endpoint, same two repos, same laptop.

| Arm | Effort | Fixed /105 | Repo 1 /45 | Repo 2 /60 | Claimed-only | Genuine extras | Wall | Cost (list) |
|---|---|--:|--:|--:|--:|--:|--:|--:|
| Qwen3.8-Max | max | **28** | 13 | 15 | 4 | 6 | 103.4 min | $26.29 |
| Qwen3.8-Flash | max | **26** | 13 | 13 | 3 | 7 | 97.3 min | $1.81 |
| Qwen3.8-Flash | low | **23** | 11 | 12 | 3 | 7 | 98.1 min | $1.37 |
| **Qwen3.8-27B** | **xhigh** | **15** | 6 | 9 | 4 | 2 | **46.8 min** | **$6.09** |

- **It loses to both siblings, and it is not the cheap one.** Eleven points below Qwen3.8-Flash at
  **3.4x the price**. There is no reading of this board on which the 27B is the value pick in its own
  family: the small model is better *and* cheaper, and the big one is better again. A size ladder is
  not a capability ladder, and on this benchmark the middle rung is the one to skip.
- **What it does have is wall clock.** 46.8 minutes against 97.3 and 103.4 — less than half the time
  of either sibling, on the same two repos. If the thing being bought is latency rather than fixes,
  that is the row's case, and it is the whole of it.
- **It found nothing new.** Zero survivor kills; the count stays at 39. Eleven of its fifteen fixes
  are bugs Flash and Max already fix, so it is largely a subset of its own family rather than a
  different reader of the same code.
- **Honesty profile is clean:** 15 strict matches, **zero partials**, 4 claimed-only across both
  repos, 2 genuine unplanted extras, no false-positive fixes.
- **The effort badge says `xhigh`, and the arm was ordered at "default".** See the wave head above:
  the CLI asserts `xhigh` when unflagged and this endpoint implements the field, so xhigh is what
  ran. The arm now passes `--effort xhigh` explicitly, so the row does not depend on a CLI default
  that can change under it. The status is `first_party` rather than `verified` because the dial's
  *magnitude* was probed on this endpoint for the other two sizes and not for this one — what is
  verified here is that the field is accepted and validated, not that `xhigh` buys more thinking than
  `high` on this particular model. Given that both siblings saturate across high/xhigh/max, expect
  little.


### The harness has a floor, and this wave fell through it

Six arms were commissioned. **Only one produced a row on the first two passes.** Chasing the other
five is the useful part of this wave, because three of them died on a Claude Code failure this board
had not seen once in 105 published rows:

```
terminal_reason = rapid_refill_breaker
"Autocompact is thrashing: the context refilled to the limit within 3 turns of the previous
 compact, 3 times in a row."
```

MiniMax M2.7 stopped itself after 23 turns and three compactions. gpt-oss-120b stopped itself after
28 turns and six. Nemotron 3 Ultra stopped itself after 152 turns and **twenty-three**. Two of the
three are not the small-window case at all: MiniMax and Nemotron carry 204,800 and 262,144-token
windows, both larger than the 200,000 Claude Code assumes by default.

**Two wrong answers came first, and both are on the record**
([receipt](effort-dial-probes/20260912-count-tokens-route-asymmetry.txt)) because each one looked
decisive until it was tested.

- *The missing token counter.* The proxy log showed Claude Code repeatedly asking the endpoint to
  count tokens for it, in bursts of four, and getting 404s. Probing every Anthropic-compatible
  upstream this board publishes through found a genuine asymmetry — OpenRouter 404, **Moonshot 404**,
  DashScope, DeepSeek and Z.ai 200 — which also demolishes the tidy version of it, because Moonshot
  is first-party and serves no counter either. And the Kimi K3 arm on Moonshot ran 263 turns and a
  13.7 MB transcript with **zero** compactions. A missing counter that causes nothing on one route
  cannot be what caused twenty-three compactions on another.
- *The missing context declaration.* Every arm on this machine that has ever compacted, laid out
  together, looked like an open-and-shut case: the five first-party arms that compacted at all
  triggered between **284,197** and **302,629** tokens — the other eight never compacted —
  while the three proxy arms in this wave triggered between **52,023** and **84,796**. Every
  OpenRouter row this board ever published carried a `[1m]` context suffix in its model string;
  these did not.

**What actually settles it is a controlled pair.** Same model, same job — read six 1,900-line files
— changing only the declared window
([receipt](effort-dial-probes/20260912-autocompact-flag.txt)):

| `--autocompact` | compacted at | outcome |
|---|---|---|
| `100000` | 61,981 / 47,677 / 66,011 | `rapid_refill_breaker` |
| `1000000` | 63,093 / 74,087 / 71,753 | `rapid_refill_breaker` |

A tenfold difference in the declared window moved the trigger by nothing, and **both runs died the
same way — on Claude Haiku 4.5, on Anthropic's own first-party endpoint, with a working token
counter, in 86 seconds.** That kills both false trails at once. The breaker has nothing to do with
aggregators, with proxies, or with token counting.

**On Anthropic's own route the trigger is a clean fraction of the window.** The same fixture on two
models, changing only the context window
([receipt](effort-dial-probes/20260912-compaction-trigger-window.txt)): Haiku 4.5 (200,000) compacts
around 62,000; Sonnet 5 (1,000,000) compacted **five times in one run, between 292,063 and
312,465**, and finished clean at 66 turns. A five-fold window, a five-fold budget, and nothing about
a fixed trigger size survives it.

**Through a proxy the harness hands the run far less, and the proxy arms scattered** — gpt-oss-120b
compacting at 23,863–26,498 (six times in one leg, then the breaker) while gpt-oss-20b, the same
model id on the same host through the same proxy, compacted at 52,023 and 57,418.

**An earlier version of this section explained that, and the explanation was wrong. It is retracted
here rather than quietly edited.** The two gpt-oss-20b numbers are the same arm four hours apart with
one flag landing in between — `--autocompact 100000` was added at 17:57, the 52K leg ran at 17:46
without it, the 24,514 leg ran at 19:26 with it — so the flag was written up as inert first-party and
**live through a proxy**, setting the window at a quarter of the declared value. Then the controlled
version ran: same fixture as the first-party pair, same proxy, same upstream model and host, varying
only the declaration
([receipt](effort-dial-probes/20260912-autocompact-flag-through-shim.txt)).

| `--autocompact`, through a proxy | compacted at |
|---|---|
| `100000` | 89,061 / 86,871 / 86,059 |
| `1000000` | 86,706 / 86,111 / 86,063 |

Six triggers inside a 3,000-token band across a tenfold difference in what was declared. **The flag
is inert on both routes.** The arm-level comparison that said otherwise had four hours, two passes
and a repo re-run in it as well as the flag; a controlled pair beats a natural experiment.

**So the proxy scatter is unexplained, and this page says so rather than filling it in.** The same
model, proxy, host and flag compacted at 23,863–26,498 inside the bench arm and at 86,059–89,061 on
the probe fixture — six triggers each, both clusters tight, a 3.4× gap. Part of any single gap is an
artefact of how the number is read (the counter is sampled after a turn finishes, so it carries
whatever that turn added), but that does not stretch to 3.4× between two tight clusters. Something
about the arm moves where this harness compacts and nothing measured here says what.

What does survive is the first-party half, which is the controlled one:

> On Anthropic's own route, compaction fires at roughly a third of the model's real context window.

| What the CLI knows | Compacts at |
|---|---|
| the truth, first-party — 200K model | ~62,000 |
| the truth, first-party — 1M models | 284,197 – 312,465 |
| nothing, proxy, fallback belief | 23,863 – 84,796 (spread unexplained) |

**And there is no lever.** With the flag inert on both routes, there is no way to tell this harness a
window short of the `[1m]` model-string suffix — and MiniMax's real window is 204,800, Nemotron's
262,144, so `[1m]` would overstate them four to five times and let the harness run the context past
what the model can accept. The fallback belief of ~200,000 was already approximately true for both.
Telling the harness the truth about either model changes nothing; lying to it is the thing this board
does not do.

The gpt-oss arms were given `--autocompact 100000` that morning to protect a 131,072-token model from
a 200,000-token assumption. It could not have protected them, because it does nothing — so the flag
is off both arms, which costs nothing and is the honest configuration either way.

**Either way the arms were handed a working context this repo needs more than**, compacted from 56K
down to 25K, had it refilled by three ordinary file reads, and the harness stopped itself. That is
the breaker's text, verbatim.

**The part that matters beyond this wave.** Every Claude Code row on this board has been either a
genuine 1M-context model or a proxy arm declared `[1m]`. A 200K-class model has therefore **never
completed repo 1 in this harness** — the first two ever pointed at it both died. That is a limit of
the measuring instrument, published here as one, and it is why neither model is scored above:
nothing about MiniMax M2.7 or Nemotron 3 Ultra has been measured yet, and a row that says otherwise
would be inventing one.

Neither is re-run on a guess, because neither configuration is honest: the fallback gives them the
~60K that already killed them twice, and `[1m]` would overstate their windows by four to five times
and let the harness run the context past what the model can actually accept.

**Two fixes went in rather than two notes.** The runner now refuses to start a Claude Code arm
pointed at a non-Anthropic upstream unless it states its context decision — a `[1m]` model string, or
an explicit acknowledgement that the fallback is close enough *and* that the ~60K trigger is
accepted. `--autocompact` does not count as a declaration, because it was measured inert. Separately,
the launcher for Meta's own agent turned out never to have worked: it backgrounded the shim inside a
WSL session that is torn down the instant the launching shell exits, so the shim died before it could
even create its log file. It is held open from the Windows side now, and the readiness check is a
poll rather than a four-second guess — a guess that fails is indistinguishable from a component that
is genuinely broken.


### Two zeros, eleven cents, and what it takes to publish one

The gpt-oss pair — 120b and 20b, OpenAI's open weights on Groq, the same host and the same proxy so
the pair differs by parameter count and nothing else — are the **first rows on this board to score
zero.** Sixty-seven rows in, the floor was 4 of 105.

| | repo 1 | repo 2 | total | genuine extras | wall | cost |
|---|---:|---:|---:|---:|---:|---:|
| gpt-oss-120b | 0/45 | 0/60 | **0/105** | 1 | 3.7 min | $0.13 |
| gpt-oss-20b | 0/45 | 0/60 | **0/105** | 0 | 3.8 min | $0.11 |

The cost and the score are the same fact. Both finished the whole benchmark in under four minutes
because neither engaged with it. **gpt-oss-20b did not run out of anything — it decided it was
finished.** Fifty-five seconds and eighteen shell calls into repo 1 it reported that the public APIs
were all exercised by the test suite, that type checking and the tests passed, and that no bugs were
found that require a code change. Its prompt says, in as many words, that bugs have been
*deliberately planted*, that the suite passes anyway, and that some tests which would have caught a
planted bug were **neutralised when it was planted**. It used a green suite as proof of a clean repo
after being told a green suite proves nothing.

gpt-oss-120b is the more interesting failure. On repo 1 it made eight tool calls in 64 seconds and
stopped with nothing. On repo 2 it did real work — 33 turns, five edits, and a complete bug report
with file, symptom, root cause and patch for every entry — and then **printed that report into the
transcript instead of writing it to the path the prompt names.** The report exists; it is just not
where the task said to put it.

**That leg is scored on its diff, and lifting the report out of the transcript was refused.** This
board's rule is that the diff is ground truth and the report is intent evidence, so a submission
with changes and no report file has all the ground truth and is missing only the secondary evidence.
Judged on the diff it fixed none of the 60 planted bugs, found one genuine issue nobody planted, and
one cosmetic. Writing the file on the model's behalf would have been doing the part of the task it
failed.

**A zero has to be proved not to be a measuring fault, and this one is the third attempt.** The
section above this one is about four arms in the same wave that could *not* be measured — so a zero
published carelessly here would be indistinguishable from those. Pass 1 ran before the harness
carried any context declaration. Pass 2 ran carrying `--autocompact 100000`, a flag since measured
inert on both routes. Both were discarded and their rows dropped before pass 3 ran. **Pass 3 carries
no flag and is mechanically clean on all four legs**: `terminal_reason=completed`, zero
auto-compactions, no breaker, no truncation, not one denied tool call.

**And the harness had to learn the difference between a model that failed and a bench that failed.**
It already voids a leg whose *environment* broke and scores a leg whose *model* broke — it reads the
transcript and counts successful tool calls against permission denials rather than trusting an exit
code. But the scorer could not see any of that: from inside it, an untouched repo with no report is
identical whether the agent never started or ran cleanly and found nothing, and it defaulted to
`not_run` and emitted no totals. **So a model that genuinely failed produced no row at all**, which
is the exact opposite of what this board is for. The runner now hands its conclusion to the scorer
directly, and a verified-healthy leg that produced nothing is scored as the zero it is — without
paying a judge to read an empty packet and tell us so.

**What the pair says about scale.** Nothing, and that is the finding. Six times the parameters buys
no measurable bug-finding at this end of the market: both sizes score zero, and the larger one is
the one that quit fastest.


### Meta's own agent driving Meta's own model

**Muse Spark 1.3 in Muse Code — 18 of 105, $9.53, 53.3 minutes, 17 genuine extras, zero
claimed-only on either repo.** Muse Code runs the loop, picks the tools and decides when to
stop; Meta's model answers it. This is the eighth distinct harness on the board and the first Meta
one — the same experiment Codex CLI runs for OpenAI, Grok Build CLI for xAI and Gemini CLI for
Google.

**The comparison you will want to make is the one to avoid.** The board's other Meta row is Muse
Spark 1.2 in Claude Code, on Meta's own endpoint, at a genuine xhigh — 17 of 105. Eighteen against
seventeen looks like a harness result. It is not: the **model version, the harness, the route and
the effort all differ** between those two rows. What the pair shows is two shipped stacks, a year
apart, landing in the same place. Isolating the harness would need the same model on both, and
Meta's own endpoint answers 402 here, so that run does not exist yet.

> **Correction.** This section originally named the harness **Muse Code 0.1.0**. That was wrong, and
> it was wrong the moment it was written: **muse self-updates.** Its own update notice records
> `0.1.0-R708.1 -> 1.1.1-R2514.1`, with the new binary written at 19:37:53 — *before* both legs that
> produced this score (19:56 and 20:49). **The row ran on 1.1.1-R2514.1.** The version is no longer
> typed anywhere: the runner now captures `muse --version` at run time and records it in the row,
> because a hand-written version string cannot survive a harness that replaces itself between two
> legs of the same arm.

| | score | cost | wall | genuine extras | claimed-only |
|---|---:|---:|---:|---:|---:|
| Muse Spark 1.3 — Muse Code / OpenRouter, high | 18/105 | $9.53 | 53.3 min | 17 | 0 |
| Muse Spark 1.2 — Claude Code / Meta API, xhigh | 17/105 | $13.99 | 35.7 min | 12 | — |
| Muse Spark 1.2 — Claude Code / OpenRouter, default | 14/105 | $19.52 | 65.2 min | 3 | — |

**Read the last two columns, not the first.** Seventeen genuine extras — real defects nobody
planted — against six planted-bug fixes on repo 1 and twelve on repo 2, and **not one claimed-only
fix on either repo**: it never reported a fix it had not made. That honesty profile is the most
consistent thing across all three Meta rows.

**Muse Code is chattier than a single agent loop by design.** It runs a reminder-observer
side-agent alongside the main one, so the turn count and the token bill both include work no Claude
Code row on this board does. That is part of what a harness row measures, and it is why the cost
column is not comparable to a Claude Code row of the same model even when the model is identical.

**And that side agent thinks at its own fixed effort, which the dial does not reach**
([receipt](effort-dial-probes/20260912-musecode-cli-effort-vs-wire.txt)). Recording every request
body a run puts on the wire, on one three-step task, n=1 per tier:

| asked `--reasoning-effort` | main-loop calls | side-agent calls |
|---|---|---|
| `minimal` | minimal ×4 | low ×2, high ×2 |
| `max` | max ×4 | low ×3, high ×3 |

**Move the flag and only the main loop moves.** The observer sits at low and high either way — its
tiers are fixed by role, not scaled by the dial. So on the `max` run, **4 of 10 calls carried the
tier the flag asked for** and six did not. That does not make an effort label wrong, but it narrows
what it describes: on any Muse Code row, an effort label is a claim about **the main loop**, which is
the agent that does the work, and not about every call the row is billed for. It does not touch the
score above — this row runs through OpenRouter, which drops the effort field for every agent alike,
so it asserts no tier at all.

**The same capture killed a claim published earlier that day.** A first-party probe found that
Meta's API refuses `ultra` outright, and the receipt concluded that a run launched at `ultra` "would
have failed rather than run higher." It would not. It would have **run, and run lower**:

```
$ muse exec --reasoning-effort ultra
tbh: reasoning effort ultra is not available (gate ultra_reasoning_effort is closed); using xhigh
```

Exit code 0, a complete run, and `xhigh` on the wire — **one tier below `max`**. The endpoint never
refuses `ultra` because the CLI never sends it, and the substitution appears on stderr only: not in
`--json`, not in the exit code, not in the response. **An API's accept-list does not tell you what a
CLI sends, any more than a CLI's accept-list tells you what an endpoint serves.** Probing one end and
reasoning to the other is how a silent downgrade got published as a loud failure.

`ultra` is not really a dial notch either. It is a remote **feature gate** — `ultra_reasoning_effort`
sits in the binary's gate list beside `workflow_api_v2_rollout` and `subscription_launch` — and the
same token turns up as `ultra_auto_guidance`, one of the harness's `WorkflowLaunchTriggerSource`
values, in a binary carrying `workflow` 3,290 times and `subagent` 1,804 times. On an entitled
account it would plausibly measure an orchestration mode rather than a thinking budget, which is not
a thing that belongs in an effort column under any label.

**Two harness bugs had to be fixed before this row could exist, and both changed what ran.**
Neither is a property of the model. The launcher that starts the Meta-API shim inside WSL **had
never once worked** — it backgrounded the shim inside a session that is torn down the instant the
launching shell exits, so the shim died before it could create its own log file, and a four-second
readiness guess reported success anyway. Less visibly, the shim was not asking upstream for a
stream: Muse Code requests one with an `Accept` header, OpenRouter reads the body, so every turn
arrived as a single blob when generation finished — and **Muse Code kills a run whose model stream
has been idle for 180 seconds**, on a route that routinely takes 200 to 230 seconds per call. The
first attempt at this row was billed for a response it never saw. Both legs here ran with both
fixes in place, and the repo-1 leg was re-run from scratch after it was found to have started three
minutes before the second fix landed.


### GLM-5.3 Flash, first-party: the small one catches the big one

**19 of 105 for 94 cents.** GLM-5.3 Flash on Z.ai's own Anthropic-compatible endpoint, no
aggregator and no proxy, at an asserted `max` — the same path and the same tier as the full-size
GLM-5.3 row, so the two sizes differ by model and nothing else.

| | score | cost | wall | effort |
|---|---:|---:|---:|:--|
| GLM-5.3 — Z.ai, max | 19/105 | $15.93 | 40.4 min | setting |
| **GLM-5.3 Flash — Z.ai, max** | **19/105** | **$0.94** | 58.4 min | setting |
| GLM-5.3 — OpenRouter | 19/105 | $19.73 | 66.7 min | dropped in transit |
| GLM-5.3 Flash — OpenRouter | 13/105 | $0.79 | 57.1 min | dropped in transit |

**Flash matches its full-size sibling for a sixteenth of the money.** It is slower — 58 minutes
against 40 — so the trade is wall clock, not capability.

**And the obvious story about the other jump is wrong.** Flash went 13 → 19 moving from OpenRouter
to first-party-at-max, which invites the reading that the tier now binds and bought six points. The
control on this very page argues against it: **the full-size model scored 19 on both routes** — the
same change of route and tier moved it by zero. Each of these is a single run, no repeat exists for
either Flash leg, and a six-point move at n=1 does not clear the run-to-run spread measured
elsewhere on this board. Read 19 as where Flash lands first-party, not as what `max` bought.

> **Correction, 2026-09-13 — this caution is now answered, and the dial gets the credit.** A leg at
> `low` on this exact path scores **9/105** against this row's 19, with route, harness, model, prompt
> and repos all held fixed. **The tier is worth ten points on this model**, so the OpenRouter row's 13
> sits inside the range the dial alone covers. The control above is *not* retracted — the full-size
> GLM-5.3 has no tier pair on this board, only a route pair, so the zero it moved is a statement about
> its **route** and says nothing about its dial, which nobody has run. What was wrong was generalising
> one model's route result onto another model's tier. See the last section of this page.


**Why this row is two days late, and it was not an oversight.** The first-party pass on Sep 10 tried
Flash *first* and got HTTP 429 on that key, so the receipt was written against the full-size model
and Flash kept its aggregator row. The 429 is gone.

**The probe nearly published the exact opposite, and that near-miss is the transferable part**
([receipt](effort-dial-probes/20260912-glm53flash-zai-anthropic.txt)). The first pass sent
`reasoning_effort` at the top level — **Z.ai's own documented field name**. Every tier returned 200,
including an invented `bogus_zzz`, while a bad model id returned 400. Textbook inert dial. The
verdict written was *NOT VALIDATED — TREAT AS INERT*, and a row shipped on it would have said the
dial does not bind here.

It was wrong because **Claude Code does not send that field.** On an Anthropic-compatible route it
sends `output_config.effort`, and that is what this endpoint validates — hard:

| `output_config.effort` | GLM-5.3 Flash | GLM-5.3 |
|---|:--|:--|
| `low` / `high` / `max` | 200 | 200 |
| `none` / `minimal` / `medium` / `xhigh` | 400 | 400 |
| `bogus_zzz` | 400 | 400 |
| *(bad model id)* | 400, different code | 400, different code |

> A validation probe has to send **the field the harness sends.** Probing the vendor's documented
> field name tests a path the arm will never take, and the answer it gives is about that path.

Two things fall out of the table. The dial on this family is **exactly three tiers** — `medium`
does not exist here, so a medium row is not available to be run — and `max` is also Z.ai's
documented default, which means a `default` run and a `max` run on this path are the same run. The
row asserts the tier rather than relying on that.


### Meta's own agent, on Meta's own endpoint, at the top of the dial

**33 of 105, $19.83, 102 minutes, 16 genuine extras, zero claimed-only on either repo.** Muse Spark
1.3 in Muse Code 1.1.1, straight onto `api.meta.ai` at an asserted `max` — no aggregator anywhere in
the path. It is **the best Meta result on this board by fifteen points**, and it ties GPT-5.6 Luna
at max and Fable 5.1 for **11th of 72 rows**.

**The harness result is the one worth stopping on.** Of 33 rows here driven by a vendor's own agent
rather than by Claude Code, exactly two kinds have cleared 30: Codex CLI, and this.

| harness | best row | score |
|---|---|---:|
| Codex CLI | GPT-6 Astra (max) | 48/105 |
| **Muse Code** | **Muse Spark 1.3 (max, Meta API)** | **33/105** |
| Grok Build CLI (ACP) | Grok 4.6 (xhigh) | 27/105 |
| Gemini CLI | Gemini 3.7 Flash (high) | 22/105 |
| Antigravity CLI | Gemini 3.7 Flash (high) | 18/105 |

**And the obvious question — route or tier? — is now answered, one variable at a time.** Two
things arrived on 2026-09-13: the OpenRouter sibling turned out to have run at `high` rather than at
a dropped default, and a first-party leg at `high` finished. Three rows, one variable between each:

| | route | tier | score | cost | wall |
|---|---|---|---:|---:|---:|
| Muse Spark 1.3 | OpenRouter | `high` | 18/105 | $9.53 | 53.3 min |
| Muse Spark 1.3 | Meta first-party | `high` | 19/105 | $10.81 | 64.5 min |
| **Muse Spark 1.3** | **Meta first-party** | **`max`** | **33/105** | **$19.83** | **102.3 min** |

**The route is worth about a point. The tier is worth fourteen.** That is the largest effect an
effort setting has produced on this board — and it is the exact reverse of the GLM-5.3 result, where
the same aggregator-to-first-party-at-max move scored 19/105 on *both* sides and moved by zero.

**This section originally said the opposite, and that is worth leaving visible.** It read: *"The pair
brackets a whole stack change and isolates neither half… read 33 as where this stack lands, not as
what `max` bought."* That was the honest state of the evidence at the time — the single-variable leg
did not exist — and it was wrong. Effort dials are not worth the same amount on every stack, which is
exactly why this board measures them per path instead of assuming. The GLM control it cited is still
true of GLM.

**It killed a survivor.** One planted bug on repo 2 had gone unfixed by every one of the 84 distinct
arms that came before it; this run fixed it, and the survivor count drops **39 → 38 of 105**. First
blood on that one after fourteen months of attempts.

**Zero claimed-only, on all three Meta rows now.** Sixteen genuine unplanted defects found across
the two repos, 14 of 45 on repo 1 and 19 of 60 plus 3 partials on repo 2, and not one reported fix
that had not actually been made. That honesty profile is the most consistent thing about Meta's rows
here, and it survived the model getting twice as effective.

**The dial is real, and it is four rungs sold as six**
([receipt](effort-dial-probes/20260913-musespark13-meta-effort-magnitude.txt)). One fixed prompt,
n=3 per tier, 18 calls, every call echoing back the tier it was asked for:

| tier | reasoning tokens | mean |
|---|---|---:|
| `minimal` | 668, 823, 962 | 817 |
| `low` | 1760, 2254, 2701 | 2238 |
| `medium` | 5394, 5691, 6237 | 5774 |
| `high` | 7824, 8664, 11668 | 9385 |
| `xhigh` | 8348, 9590, 14335 | 10757 |
| `max` | 7928, 12654, 17383 | 12655 |

**15.5× from bottom to top against a 2.19× worst within-tier spread**, so the dial genuinely changes
how much the model thinks — and `minimal`, `low` and `medium` sit in bands that touch nothing else.
Then it stops. `high`, `xhigh` and `max` overlap almost entirely, and **one `max` call thought less
than two of the three `high` calls**. So `max` is the top of a real dial that buys nothing measurable
over `high`. This row's label moves from `first_party` to **`verified_ceiling`** on that evidence —
a ceiling that exists, not a purchase that pays.

> **Correction, 2026-09-13 — the sentence above is falsified and the label is not.** Both rungs
> below `max` have since been run on the real benchmark: `high` scores **19/105** and `xhigh` scores
> **20/105**, against this row's **33**. So `max` buys about **thirteen points** over either
> neighbour and *is* a purchase that pays on this stack. `verified_ceiling` stands — `max` is still
> the top tier that exists — but "a ceiling that exists, not a purchase that pays" was wrong, and it
> was wrong because a token-volume sweep was used to price a rung. What survived from the probe is
> the *grouping*: `high` and `xhigh` really are one rung, on score as well as on tokens. See the
> last section of this page.

**Both Qwen3.8 probes found exactly this shape on Alibaba's stack.** Two vendors, two serving
stacks, the same answer: the expensive end of a published effort dial is where it stops doing
anything. That is worth expecting rather than treating as one vendor's quirk.

**Correction, 2026-09-13: the OpenRouter row's effort label was wrong, and the error is the same
one twice** ([receipt](effort-dial-probes/20260913-musespark13-openrouter-responses-magnitude.txt)).
That row shipped as `default` / `inert_default`, on four receipts at up to n=9 showing every tier
overlapping and an invented tier returning HTTP 200. **Every one of those receipts probed
`api/v1/messages` with a flat top-level `reasoning_effort`.** Muse Code speaks the **Responses API**,
and the shim forwards to `api/v1/responses` touching only the model id, the provider pin and the
stream flag. Re-probed on the surface the harness actually uses, with the nested `reasoning:{effort}`
it actually sends — same prompt as the Meta probe, n=3 per tier:

| tier | reasoning tokens | mean |
|---|---|---:|
| `minimal` | 843, 1003, 689 | 845 |
| `low` | 2899, 2119, 2915 | 2644 |
| `medium` | 4501, 4913, 5920 | 5111 |
| `high` | 8573, 7497, 7505 | 7858 |
| `xhigh` | 8491, 12264, 9589 | 10114 |
| `max` | 12112, 12910, 14709 | 13243 |

**15.7× against a 1.46× worst within-tier spread**, `minimal` through `high` mutually disjoint,
`bogus_zzz` refused **400**, and an omitted field echoing `medium`. The dial is not inert — it is
*better behaved than Meta's own endpoint*, which saturates across the top three.

**And the row never used that default anyway.** Captured at the request body, an unflagged Muse Code
does not omit the field — it sends `reasoning.effort: "high"` on its main loop. So the row ran at
**`high`**, the route applied it, and the label was false twice: wrong tier, and wrong claim about
the route. It is relabelled **`high` / `verified`** and renamed. **The score, cost, wall and extras
are unchanged — only the label was ever wrong.**

**And yes — the same model on the same aggregator really does have a live dial on one API and a dead
one on the other.** That claim was worth one field name's evidence when first published, so it got
re-tested with three field shapes on `/messages`, `minimal` against `max`, n=3 each:

| field shape | `minimal` | mean | `max` | mean | `bogus_zzz` |
|---|---|---:|---|---:|---|
| flat `reasoning_effort` | 4284, 5967, 5587 | 5279 | 5153, 6213, 4793 | 5386 | **200**, ignored |
| `output_config.effort` | **400 ×3** | — | 4396, 5089, 5382 | 4955 | **400** |
| nested `reasoning.effort` | 5048, 5160, 4849 | 5019 | 5715, 5790, 4938 | 5481 | **200**, ignored |

**Not one of them moves it.** Every mean sits between 4955 and 5481 whatever you ask — and ~5000 is
almost exactly what `/responses` returns for `medium`, which is also what it returns with the field
omitted. The Messages surface serves this model at its default and ignores the question.

**The `output_config` row is the most deceptive result on this page.** That field is *validated*
here — `minimal` refused 400, `bogus_zzz` refused 400 — and *not applied*, since `max` lands in the
same band as everything else. **An endpoint that 400s on a bad value looks exactly like one that
honours a good one.** This board already carried the rule (OpenRouter validates effort enums at its
own gateway, so a 400 there says the gateway parsed the field, not that the provider used it); this
is that rule with a counterexample sitting in the same table as the behaviour it mimics.

**This is the second time this board has made this exact mistake.** A day earlier, a GLM-5.3 Flash
probe sent Z.ai's own *documented* field name instead of the one Claude Code puts on the wire, got
200 on an invented tier, and nearly published a working dial as inert. That one was caught before
publication. This one shipped and sat on the public board for a day. The rule — **probe the surface
and the field the harness uses, not the one the vendor documents or the one a previous probe
happened to use** — now has a code path instead of a paragraph — a wire tap that records every request
body — and the four
superseded receipts carry a correction banner rather than being deleted, because their finding
stands for the surface they measured.

**What it does to the comparison above: it improves it.** With the OpenRouter row now known to be
`high`, the leg running at `high` on Meta's own endpoint is a **pure route comparison** — same model,
same harness, same tier, one hop apart — which is a cleaner experiment than the one originally
planned.

**It made a prediction, published before the test ran — and the prediction failed.** The receipt
said that if `high` and `max` are indistinguishable in thinking volume, a bench leg at `high` should
land near 33. **It landed at 19.**

On the real workload the two tiers are not close at all: **178,300 reasoning tokens at `high` against
286,242 at `max`** — a 61% gap the fixed-prompt sweep could not see at n=3. The probe was not
measuring the thing it was being used to predict.

> **A token-volume probe shows whether a dial is CONNECTED. It does not show what the dial is
> WORTH.** Those are different questions, and this board had been letting one stand in for the other.

That cuts backwards too. The Qwen3.8 rows report the same saturation shape at the top of their
dials, and **no bench pair was ever run to test it there.** Read those as statements about token
volume, not about score, until someone runs the legs.

**One caveat that belongs next to the score rather than under it.** `max` is asserted, validated in
two layers and echoed back applied — but it describes **the main loop**, not the run. Muse Code's
reminder-observer side agent runs at a fixed `low`/`high` the flag does not reach, and on a
three-step probe at `max`, 4 of 10 calls carried `max`. The harness section above has the table. No
other row on this board has needed that distinction, because no other harness here runs a second
agent.


### And the rung between them: `xhigh`, where the dial stops being worth anything

**20 of 105, $15.58, 73 minutes, 7 genuine extras, zero claimed-only — and no partials on either
repo, which is a first for Muse.** This is the third and last rung of Meta's first-party dial to be
run here, and it turns a pair into a curve.

| tier | score | reasoning tokens | list cost | wall | $/fix |
|---|---:|---:|---:|---:|---:|
| `high` | 19/105 | 178,300 | $10.81 | 64.5 min | $0.57 |
| `xhigh` | **20/105** | **225,766** | **$15.58** | **73.0 min** | **$0.78** |
| `max` | 33/105 | 286,242 | $19.83 | 102.3 min | $0.60 |

**Everything you pay for rises smoothly. The score does not.** Reasoning volume goes up by almost
exactly **27% at each rung** — 178,300 → 225,766 → 286,242. The first 27% buys **one point**, which
is noise. The second 27% buys **thirteen**. Going from `high` to `xhigh` costs **44% more** and
changes nothing measurable; going on to `max` costs another 27% and is the largest effort effect on
this board. `xhigh` is the worst-value rung of the three on the only metric that combines both
columns: **78 cents per fix**, against 57 at `high` and 60 at `max`.

**This is what falsifies the magnitude probe properly, rather than just embarrassing it.** The probe
merged `high`, `xhigh` and `max` into one saturated rung. The bench says the top of this dial is
**two** rungs, not one and not three:

    { high 19, xhigh 20 }        { max 33 }

So the probe **grouped correctly** — `high` and `xhigh` are one rung on the score exactly as they
were on the tokens — and then **pulled `max` into the wrong group**, which is the half a buyer pays
for. A token-volume sweep can group tiers. It cannot price them.

**And the failure is not that the tokens were mis-measured.** They were measured fine, and the step
sizes on the real workload have the same shape the toy prompt showed. The failure is that **equal
increments of thinking bought nothing and then bought everything**. Volume is not the currency.

**`xhigh` does not reliably think more than `high` on the real workload either, and the aggregate
hides a sign flip.** Repo 1 at `xhigh` spent 178,161 reasoning tokens against `high`'s 115,670 — up
54%. Repo 2 spent 47,605 against 62,630 — **down 24%**. The combined +27% is one repo carrying it.
No measurement on this board separates `xhigh` from `high`: not toy-prompt tokens, not bench tokens,
not score. The row is published as the evidence for that, not against it.

**What it does for the `max` claim: it upgrades it from one observation to something closer to a
finding.** The `high` row shipped with an honest caveat that its 14-point gap to `max` was n=1
against n=1. Two independent runs at the top-but-one now sit **within a point of each other** while
the single `max` run sits thirteen above both — which is the closest thing to a run-to-run spread
estimate this dial has, and the gap clears it comfortably. It is still not a replicate **at `max`**,
which is the leg that would settle it, and the row says so.

**What is not claimed.** That `xhigh` is broken or ignored — it is accepted by the endpoint, echoed
back applied, sits inside a dial measured real at the bottom, and on repo 1 it genuinely did think
54% harder. It just did not convert. And 19 against 20 is not evidence that `xhigh` beats `high`.


### GLM-5.3 Flash at `low`: one notch down costs it more than half its score

**9 of 105, 42 cents, 29 minutes, 4 genuine extras.** The bottom of Z.ai's three-tier dial —
`low`/`high`/`max` is the entire accept-list on this family, `medium` does not exist and cannot be
run, and `max` is Z.ai's documented default, so `low` is a rung that has to be asked for and sits
*below* the out-of-the-box run.

| tier | score | repo 1 | repo 2 | output tokens | cost | wall |
|---|---:|---:|---:|---:|---:|---:|
| `low` | **9/105** | 7/45 | **2/60** | 36,777 | $0.42 | 29.0 min |
| `max` | 19/105 | 10/45 | 9/60 | 115,653 | $0.94 | 58.4 min |

**The tier is worth ten points on this model** — same endpoint, same harness, same model, same
prompt, same repos, one notch of one field between them. This is the first single-variable tier pair
this board has run on Z.ai.

**Where it breaks is repo 2, almost entirely.** Repo 1 gives up 3 points. Repo 2 goes from 9 to
**2** — it nearly collapses. The larger, more tangled codebase is where the missing thinking gets
missed, which is where every cheap row on this board loses its points, and it says more than the
combined number does.

**The price, though, is honest — and that is the opposite of the other dial published today.**
Cost per strict fix is **4.6 cents at `low` and 5.0 cents at `max`**. You pay 2.2× and you get 2.1×.
The bottom rung is not a value play; it is proportionally less of everything.

| dial | step | cost change | score change |
|---|---|---:|---:|
| **GLM-5.3 Flash** (Z.ai) | `low` → `max` | +124% | **+10** |
| **Muse Spark 1.3** (Meta) | `high` → `xhigh` | +44% | **+1** |
| **Muse Spark 1.3** (Meta) | `xhigh` → `max` | +27% | **+13** |

Two dials, two entirely different shapes, measured the same way in the same week. Muse pays nothing
for its middle rung and everything for its top one. Flash pays proportionally all the way down.
**Neither was predictable from the vendor's tier names, and neither was predictable from a
token-volume probe.**

**The `max` row's label moves `first_party` → `verified_ceiling`.** It shipped as `first_party`
because the accept-list proved only that the endpoint *reads* the field. The `low` leg separates the
levels on this serving path — 10 points of score, 3.1× the output tokens — which is what `verified`
requires, and the same accept-list (`none`, `minimal`, `medium`, `xhigh` and `bogus_zzz` all refused
**400 code 1210**) makes `max` the top rung that exists.

**Honesty profile, stated flat.** 7 of 45 on repo 1 with no partials and no claimed-only; 2 of 60 on
repo 2 with no partials and **two claimed-only**. That is up from one on the `max` row and down from
five on the OpenRouter Flash row, so it sits inside this model's own range and is *not* evidence that
the bottom rung is less honest.

**What is not claimed.** Anything about `high` — the rung between these two — which is running as
this publishes. Nor that 9 is this model's floor: 2 of 60 is close to the bottom of this board, and a
second run at `low` could land either side of it. Both tiers are n=1.


### And `high`: the dial is complete, monotonic on score, and worst value in the middle

**16 of 105, 94 cents, 62 minutes, 4 genuine extras.** `low`, `high` and `max` are the entire
accept-list for this family — `none`, `minimal`, `medium`, `xhigh` and an invented value are all
refused **400 code 1210** — so **every tier this endpoint will serve for this model now has a bench
row.** No other model on this board can say that.

| tier | score | repo 1 | repo 2 | output tokens | cost | wall | $/fix |
|---|---:|---:|---:|---:|---:|---:|---:|
| `low` | 9/105 | 7/45 | 2/60 | 36,777 | $0.42 | 29.0 min | **$0.046** |
| **`high`** | **16/105** | 9/45 | 7/60 | 97,332 | $0.94 | 62.3 min | **$0.059** |
| `max` | 19/105 | 10/45 | 9/60 | 115,653 | $0.95 | 58.3 min | **$0.050** |
| *(OpenRouter, field ignored)* | *13/105* | *6/45* | *7/60* | *70,628* | *$0.79* | *57.1 min* | *$0.061* |

**Monotonic on score — 9 → 16 → 19 — with output volume rising alongside it.** This is a dial that
works, measured end to end on one serving path with route, harness, model, prompt and repos all held
fixed.

**And not monotonic on value, which is the more useful half.** Cost per strict fix runs 4.6¢ → 5.9¢ →
5.0¢. **The middle rung is the worst buy on the dial.** Muse Spark 1.3 did exactly this hours earlier
on Meta's stack — `xhigh` at 78¢ per fix against 57¢ at `high` and 60¢ at `max`. Two vendors, two
unrelated dials, two different harnesses, **the same shape**: the middle is where the money goes and
the score doesn't follow. Neither a tier name nor a token sweep would have told you that.

> **Correction, 2026-09-13 — the Muse half of this two-vendor pattern was a three-rung slice of a
> four-rung dial, and the fourth rung breaks it.** `medium` on that same first-party path scores
> **9/105 at $1.11 per fix** — nearly **twice** the 78¢ this paragraph calls the worst buy. On Muse the
> money goes at the *bottom*, not the middle. **The GLM-5.3 Flash half is untouched and complete**:
> `low`/`high`/`max` is that endpoint's entire accept-list, so its middle rung really is the worst of
> everything it will serve. What was wrong was reading a shared shape off two dials when only one of
> them had been measured all the way down. See the last section of this page.


**On this stack `high` is dominated by `max` on all three columns at once.** It costs $0.94 against
$0.95, takes *longer* in wall clock (62.3 min against 58.3), and scores three fewer. There is no
reading of those numbers on which a buyer should pick `high` here — worth saying plainly, because the
tier name suggests otherwise.

**It also locates the OpenRouter row without settling it.** That row scores 13 with 70,628 output
tokens, and **both figures sit between `low` and `high`** — not at the top of the dial, even though
Z.ai documents `max` as this family's default. So whatever OpenRouter serves for this model, it
demonstrably isn't the ceiling. *What* it serves is still unknown: that route ignores the effort field
this board sends, which is what `inert_default` records, and nothing here identifies the substitute.

**What is not claimed.** That the 3-point gap to `max` is real — it is *smaller* than the 6-point
OpenRouter gap this board declined to credit, and it gets read the same way: `high` and `max` are
close enough that this pair doesn't separate them. What the dial *does* separate is `low` from the
other two, by 7 and 10 points. Every rung is n=1.

**One disclosure the automatic marker missed.** The repo 2 leg overlapped a Meta arm on a different
provider for about 3 of its 32 minutes. The runner stamps `concurrent_with=` by sampling the live-leg
registry at leg **start** and again at leg **end**. What slipped through is narrower than that:
the neighbour both *arrived and departed between the two samples* — it joined ~3 minutes in and
was force-killed before this leg finished — so it existed at neither endpoint.

> **Correction, 2026-09-13 (same day).** This paragraph first said the runner only sampled at leg
> **start**, and that a leg joined later records nothing. That was wrong: the start-and-end union has
> been in the runner since cross-provider parallelism was first allowed. The bug is that two point
> samples cannot see an interval that fits strictly between them. **Now fixed** — the runner samples
> on every tick of the 30-second keep-alive sweep and the row carries the union across all samples. Three minutes of a mostly-installing neighbour is negligible
against a 62-minute total and can only inflate the figure, never shrink it, but the row says so rather
than implying a measurement it didn't make.


### Muse Spark 1.3 at `medium`: nearly the same money, less than half the score

> **Superseded, 2026-09-14.** This section is a single run. `medium` has since been run three times
> (9, 15, 15) and `low` three times (12, 13, 4), and the mean row on the board is now **13/105**, not
> 9. The numbers below are all correct for the run they describe, but two of the conclusions drawn
> from them do not survive the repeat: "less than half the score" and the `$1.11`-per-fix outlier
> claim are both retracted, and the reasoning-volume inversion turned out to be one verbose run
> rather than a property of the tier. See **Sep 13-14 - the board's first n=3** at the end of this
> file for the full accounting of what holds and what does not.

**9 of 105, $10.02, 61.7 minutes, 8 genuine extras.** The bottom measured rung of Meta's first-party
dial — and it sits one notch **below** this endpoint's measured default, because omitting
`reasoning.effort` echoes back `high`. `medium` is a tier you have to ask for in order to do worse.

| tier | score | repo 1 | repo 2 | reasoning tokens | cost | wall | $/fix |
|---|---:|---:|---:|---:|---:|---:|---:|
| **`medium`** | **9/105** | 4/45 | 5/60 | 187,162 | $10.02 | 61.7 min | **$1.11** |
| `high` *(default)* | 19/105 | 8/45 | 11/60 | 178,300 | $10.81 | 64.5 min | **$0.57** |
| `xhigh` | 20/105 | 8/45 | 12/60 | 225,766 | $15.58 | 73.0 min | **$0.78** |
| `max` | 33/105 | 14/45 | 19/60 | 286,242 | $19.83 | 102.3 min | **$0.60** |

**Four bench-measured tiers on one serving path — the most-measured dial on this board.** Model,
prompt, harness, repos and route held fixed across all four. Nothing else here has more than three.

**Monotonic on score: 9 → 19 → 20 → 33.** The dial works.

**And the value curve is the worst this board has recorded.** $1.11 → $0.57 → $0.78 → $0.60. The
bottom rung is the worst buy by a factor of two, and it is not the ordinary story of a cheap tier
buying less: **`medium` costs 93 cents on `high`'s dollar and returns 9 points against 19.** Nearly
the same money, less than half the result.

**On repo 2 it is worse than nearly-the-same — it costs *more* in absolute dollars.** $5.22 against
`high`'s $3.98, a 31% premium, for **5 of 60 against 11 of 60**. More money, less than half the score,
one notch of one field between the two runs. If there is a single number on this page that argues
against trusting a tier name, it is that one.

**Reasoning volume does not explain any of it, and that is the finding for anyone probing a dial.**
Total reasoning tokens are **187,162 at `medium` against 178,300 at `high`** — the *lower* tier emitted
**more**. Per leg the direction isn't even consistent: repo 1 down 5%, repo 2 up 24%, while the score
halves on both. **A token-volume probe pointed at this pair would have reported no degradation, or an
improvement.** Whatever the tier changed, it is not how much the model thought.

**It also resolves a prediction this board wrote down before the run.** The magnitude probe behind this
dial was falsified twice yesterday and today. Its one surviving claim was that the bottom three tiers
separate cleanly in *token* terms — `medium`'s ceiling of 6,237 reasoning tokens per call sitting below
`high`'s floor of 7,824 — and that claim had never been tested against score. So the arm was launched
with both outcomes recorded in its own metrics note: *near 19 would mean a cleanly disjoint token band
predicts nothing at all about score; well below 19 would mean the dial does move score at the bottom
and `high`/`xhigh` is a dead zone in the middle.* **9 is well below 19.** The second branch stands —
and note it stands on the *score* prediction while the token mechanism it was built on went the wrong
way. The probe called the outcome and misread the reason.

**What is not claimed.** Every rung is n=1 against n=1, and the 1-point `high`→`xhigh` step is noise
this board would not credit in either direction. The 10-point gap to `high` is the largest **relative**
step on the dial (2.11× against 1.65× for `xhigh`→`max`) but **not** the largest absolute one — in raw
points `xhigh`→`max` is bigger, 13 against 10. What makes this step worth trusting isn't its size, it's
that it **reproduces on both repos independently**, 8→4 and 11→5, each roughly halving.

**One disclosure on the wall column.** The shim absorbed **19 upstream 429s** across these two legs,
against 4 apiece on the `high`, `xhigh` and `max` arms. Retries are transparent to the model and cost
wall clock rather than correctness, so 61.7 minutes here is not cleanly comparable with 64.5 at `high`.
The comparison this row rests on is cost and score, not wall.


## Sep 13-14 — the board's first n=3, and it moves the row it was run to check

Every score on this page until now is **n=1**: one model, one prompt, one harness, one run. That is a
stated limitation on nearly every wave here, and it has never been measured. This wave measures it.

**Muse Spark 1.3's bottom two rungs were each run three times.** Same model, same two repos, same
prompt, same harness, same first-party route, same effort flag, same judge. Nothing varies but the run.

| rung | run 1 | run 2 | run 3 | **mean (published)** | range |
|---|---:|---:|---:|---:|---:|
| `low` | 12/105 | 13/105 | 4/105 | **10/105** | **9 points** |
| `medium` | 9/105 | 15/105 | 15/105 | **13/105** | **6 points** |

They publish as two rows, each one mean with all three of its legs listed in the metrics receipts:
**Muse Spark 1.3 (low effort, Muse Code, Meta API) - mean of 3** and
**Muse Spark 1.3 (medium effort, Muse Code, Meta API) - mean of 3**. The scoreboard carries the mean;
`results/repo1-metrics.csv` and `results/repo2-metrics.csv` carry every individual leg, so the spread
above is auditable rather than asserted.

**The run-to-run range is larger than the gap between the two tiers.** `low` and `medium` differ by
about 3 points in the mean. A single `low` run can land anywhere across a 9-point window, and a single
`medium` run across a 6-point window. **Those windows overlap almost completely** — 4-13 against 9-15.
One run of each, drawn at random, has a real chance of ranking them backwards, and that is exactly
what happened the first time: run 1 gave `low` 12 and `medium` 9, an inversion that disappears at n=3.

### What this changes on the board

The dial now reads **10 → 13 → 19 → 20 → 33** across `low`, `medium`, `high`, `xhigh`, `max`. Still
monotone. But the bottom two rungs are now means of three and the top three are still single runs, so
**the only honest comparison on this dial is between the two rungs that were repeated.**

The single-run `medium` row (9/105) stays on the board with its numbers intact and an annotation
pointing here. It was not wrong; it was one draw, and it was the lowest of the three.

**The claims that row carried have to be revised, and two of them do not survive.**

| claim, as published from n=1 | at n=3 |
|---|---|
| "`medium` costs 93 cents on `high`'s dollar and returns 9 against 19" — nearly the same money, **less than half the score** | $9.24 against $10.81 for **13 against 19**. Cheaper and worse, but "less than half" is **retracted**. |
| `$1.11` per fix, "the worst buy on the board by a factor of two" | **$0.71** per fix. Mid-pack, not an outlier. **Retracted.** |
| "Reasoning volume does not explain any of it" — `medium` emitted **more** reasoning than `high` | That inversion was one run. The `medium` mean is **149,769** tokens against `high`'s 178,300. **Retracted** — the lower tier does emit less, on average. |
| On repo 2, `medium` costs **more in absolute dollars** than `high` | **Survives.** $5.05 against $3.98, a 27% premium, for 8/60 against 11/60. More money for less result, at the mean, not just in one run. |
| The pre-registered branch: `medium` "well below 19" means the dial moves score at the bottom while `high`→`xhigh` is a dead middle | **Survives**, on a smaller margin. It fired on 9 against 19; the real gap is 13 against 19. |

The one that survives is the one worth keeping: **paying less for a lower tier is not guaranteed even
within a single vendor's own dial.**

### Why a fixed tier produces a 9-point spread

The effort flag does not pin down how much work happens. Held completely fixed, the three `low` runs
did measurably different amounts of it:

| `low`, repo 1 | run 1 | run 2 | run 3 |
|---|---:|---:|---:|
| model calls | 221 | 202 | **147** |
| reasoning tokens | 69,796 | 45,411 | **40,238** |
| cost | $3.77 | $3.45 | **$2.83** |
| fixed | 8/45 | 5/45 | **2/45** |

That 6-point range on repo 1 is **twice the 3-point gap from `low`'s mean up to `high`** on the same repo, and `low` and `medium` tie there at the mean (5.0 and 5.3): at the bottom of this dial the within-tier spread is larger than the between-tier signal.

On that leg the ordering is clean, and the cheap run is cheap **because it did less** — not because
the tier made it efficient. Across all six legs the relationship is looser: the `medium` leg with the
most calls scored lowest of its three, and on repo 2 a 151-call run beat a 167-call run 8 to 4. So the
honest statement is the weaker one: **a tier name fixes a request field, not an amount of work**, and
the work actually performed varies by roughly a third run to run inside one tier.

This is also why cost is not a stable proxy for effort here. The three `low` pairs cost $6.28, $5.97
and $4.60 — a 37% spread with one flag value and one prompt.

### What it means for every other row on this page

**Do not read a 1-3 point difference between any two rows here as a ranking.** That was always the
stated caveat; it now has a number behind it, at least for this model at these tiers: **a single run
of a fixed configuration moved 9 points**, and 9 points is more than the distance between most
adjacent rows on the combined board.

Two specific consequences:

- The 1-point `high` → `xhigh` step on this same dial (19 → 20) was already called noise. It is
  comfortably inside the measured run-to-run window.
- Comparisons that rest on a **large** gap — the 13-point `xhigh` → `max` step, or a model scoring
  double another — are unaffected. The spread is a floor on what counts as a difference, not a reason
  to distrust the whole board.

**`high` has not been repeated yet.** It is the rung every other claim on this dial is measured
against, and it is still a single run. Repeating it at n=3 is the next measurement owed, and until it
lands, every comparison *to* `high` on this page carries the same n=1 caveat this wave just quantified.

> **Update, later the same day:** it landed. See the next section — `high` was repeated, and unlike
> `low` and `medium` it came back with the number it already had.

### One survivor fell

**37 of the 105 planted bugs have now survived every model in every run on this board**, down from 38.
The one that fell went to a `medium` leg, in repo 2: an optional value that can legitimately be absent
was being converted to a string unconditionally, so "absent" and "present" took the same path
downstream. The fix separates them before the conversion. No run on this board had repaired it before.

**Only published runs move that count.** It is computed from the verdict files of runs that have a
public row here; anything scored privately cannot change a number nobody can audit.

### Honesty profile

All six legs are clean: judge-visible fixes only, no handicap disclosures, exit 0 on every leg, zero
shim errors, and dependency installs green in all six. Claimed-but-not-fixed entries are low and
consistent with the rest of this model's rows — 5 across the three `low` legs and 3 across the three
`medium` legs, against 105 planted bugs apiece. Genuine extras (real defects found outside the planted
set) are the one place the tiers separate sharply: **6 at `low` against 18 at `medium`**, per the mean.


## Sep 14 — the same experiment run on `high`, where it confirms the row instead of moving it

The section above repeated Muse Spark 1.3's two bottom rungs three times each and both moved: `low`
and `medium` swapped places, and a published caveat had to be partly retracted. That is the kind of
result replication gets remembered for, and it is also the reason to be careful about what it proves.
An experiment that only ever gets published when it embarrasses a row is not an experiment.

So the same thing was done to `high` — the rung everything else on this dial is measured against.

| rung | run 1 | run 2 | run 3 | **mean (published)** | range |
|---|---:|---:|---:|---:|---:|
| `low` | 12/105 | 13/105 | 4/105 | **10/105** | 9 points |
| `medium` | 9/105 | 15/105 | 15/105 | **13/105** | 6 points |
| **`high`** | **19/105** | **17/105** | **20/105** | **19/105** | **3 points** |

**The mean is the number that was already there.** 19, 17 and 20 average 18.67, which rounds to the
19 the single `high` run published the day before. Repeating it changed nothing except how much the
19 is worth. It publishes as **Muse Spark 1.3 (high effort, Muse Code, Meta API) - mean of 3**, and
the single-run row it replaces stays on the board with its numbers intact.

### A pattern in the ranges, which is not evidence of anything

The three-run ranges came out at **9 points at `low`, 6 at `medium`, 3 at `high`**. It is tempting to
read that as spread narrowing up the dial, and an earlier version of this section did exactly that —
it called the shrinking range "the finding" and told you a single run near a model's ceiling is safer
than one at the bottom of its dial. **That was over-claimed and it is withdrawn.**

The arithmetic does not support it. A range taken from **three** draws is a very noisy estimate of
spread: three runs from one unchanging distribution can easily land 9, 6, 3 in that order by chance.
Three such estimates, one per rung, cannot establish a trend in variance. Doing that properly needs
n in the tens per rung — not something this board is going to buy at roughly $13 a run.

So: there is a pattern in these numbers, and it is not hard evidence of anything. It is recorded as
an **observation to watch**, and no row on this board should be trusted or discounted on the strength
of it. In particular, do **not** conclude that single runs are safer at higher effort — that is the
same n=1 reasoning this whole exercise exists to reject, moved up one level.

What survives from the previous section is narrower and still worth having: **at these two bottom
rungs, of this one model, a fixed configuration produced a 9-point and a 6-point range.** That rules
out the convenient assumption that run-to-run spread is a small constant you can ignore. It does not
tell you what the spread is anywhere else.

### What effort actually buys: the same bugs, more reliably

The mean says `high` fixes about 19 of 105 and `low` about 10. It does not say whether that is *more*
bugs or the *same* bugs *more often*. Three runs per rung answers that, by counting per **bug**:

| rung | bugs fixed at least once | fixed in exactly 1 of 3 | in 2 of 3 | **in all 3** | share always |
|---|---:|---:|---:|---:|---:|
| `low` | 21 | 15 | 4 | **2** | 10% |
| `medium` | 23 | 11 | 8 | **4** | 17% |
| `high` | 30 | 12 | 10 | **8** | 27% |

The fixed-exactly-once column barely moves — 15, 11, 12 — while the all-three column goes 2, 4, 8.
The direction that suggests is that higher effort promotes bugs the model could already *sometimes*
find into bugs it finds *more often*, rather than buying a longer tail of lucky one-offs.

**Read the size of those numbers before the shape of them.** The all-three column is 2, 4 and 8 bugs,
each counted over three runs. "Fixed in all 3 of 3" is a coin that came up heads three times, not a
measured reliability, and small counts move a lot on very little. The direction is suggestive and the
percentages are illustrative; neither is established here. What is solid is the plainer fact
underneath: the rungs differ in how many distinct bugs they ever fix (21, 23, 30).

The Coverage view on the site now shades each tick by that hit rate, so on any `- mean of N` row a
faint tick is a bug fixed in one run of three and a solid tick is one fixed every time.

### What this retracts

The single-run `high` row carried this, and it does not survive:

> high and xhigh are indistinguishable by every measurement this board holds, which makes that pair
> the closest thing to a run-to-run spread estimate this dial has.

`high` (19) and `xhigh` (20) landing a point apart was read as weak evidence about run-to-run spread.
With a real replicate, the spread at `high` is 3 points — so two single runs one point apart were
always comfortably inside one tier's noise and never carried that evidence, in either direction.
**The conclusion survives: `high` and `xhigh` remain indistinguishable.** What changes is that it now
rests on a measured spread rather than on two single runs agreeing by luck. The difference matters,
because the first version would have read the same if they had agreed by accident.

### A fixed flag is still not a fixed bill

| `high`, both repos | run 1 | run 2 | run 3 |
|---|---:|---:|---:|
| model calls (repo 1 / repo 2) | 373 / 226 | 439 / 261 | 293 / 418 |
| cost | $10.81 | $12.70 | $15.29 |
| wall | 64.5 min | 85.8 min | 76.7 min |
| fixed | 19/105 | 17/105 | 20/105 |

A **41% cost spread** with one flag value and one prompt, which is the same effect the `low` legs
showed. What does *not* reproduce here is the tidy ordering: on `low`'s repo-1 legs, calls, reasoning,
cost and score all fell together. At `high` they do not — repo 2's busiest leg scored **best** and
repo 1's busiest scored two above its quietest. That supports the weaker statement the previous
section settled on, and only that one: **a tier name fixes a request field, not an amount of work.**
It is not that turns predict score.

### Housekeeping

All six legs clean: exit 0, zero shim errors, dependency installs green, no handicap disclosures.
Claimed-but-not-fixed: 3 across six legs (0, 2 and 1 by run). Genuine extras: 10, 20 and 28.
**No planted bug fell for the first time in either new leg — the survivor count stays at 37 of 105.**

**Receipt correction, same day.** Three `low`/`medium` legs published in the previous section
disclosed, correctly, that they shared the laptop with another run — and named that run in the
`concurrent_with=` field of `results/repo1-metrics.csv` and `results/repo2-metrics.csv`. The peer was
an arm with no public row here and none planned, so naming it published something this page does not
stand behind. Those entries now read `an unpublished arm`, with the repo and the contention warning
unchanged, and the publisher rejects a private arm's name in that field from here on. **The
disclosure is the point of the field and it is intact**; only the name is gone. Nothing else in any
row changed, and no score, token, cost or wall figure is affected.

## Sep 14 — a fourth rung, and the number that would have retracted the claim if the argument hadn't

`xhigh` was the fourth Muse Spark 1.3 rung run three times. It publishes as
**Muse Spark 1.3 (xhigh effort, Muse Code, Meta API) - mean of 3**.

| rung | run 1 | run 2 | run 3 | **mean** | range |
|---|---:|---:|---:|---:|---:|
| `low` | 12/105 | 13/105 | 4/105 | **10/105** | 9 |
| `medium` | 9/105 | 15/105 | 15/105 | **13/105** | 6 |
| `high` | 19/105 | 17/105 | 20/105 | **19/105** | 3 |
| **`xhigh`** | **20/105** | **25/105** | **16/105** | **20/105** | **9** |
| `max` | 33/105 | — | — | *n=1* | — |

### The withdrawal came first, and that is the point

The section above this one used to say the run-to-run range narrows as the dial rises — 9, 6, 3 —
and generalised it to every row on this board. It was **withdrawn earlier the same day**, before
`xhigh` was scored, on the grounds that a range from three draws is a very noisy estimate of spread
and three of them cannot establish a trend in variance.

`xhigh` then came back with a range of **9**, which breaks the sequence outright.

That is a satisfying coincidence and it is **not** why the claim is gone. Had `xhigh` landed at
range 2 the claim would still have been unsupported, because the problem was never which way the
fourth number fell — it was that four numbers cannot answer the question. Establishing how variance
moves across a dial needs n in the tens per rung. At roughly $13 a run, this board is not going to
buy that, and it should stop implying otherwise.

**The general rule, applied here from now on: a shape across a handful of summary statistics is an
observation. An observation is not a finding, and it does not get generalised to other rows.**

### What the four replicated rungs do support

Two things, both counts rather than inferences:

- **The dial is monotone across them: 9.7 → 13.0 → 18.7 → 20.3.** `max` is still a single run at 33.
- **A fixed configuration produces double-digit spread.** Same model, prompt, harness, route, effort
  flag and judge; `xhigh` totals of 16, 20 and 25. Three of the four replicated rungs have a range
  of 6 or more on a 105-bug benchmark.

And one thing it settles that a single run could not: **`high` and `xhigh` are not separated by
anything measurable here.** Their means are 18.7 and 20.3 — 1.7 points apart, against ranges of 3 and
9. The single-run pair (19 and 20) hinted at that; it now rests on six runs instead of two.

### Housekeeping

All six `xhigh` legs clean: exit 0, zero shim errors, installs green, no handicap notes. **Zero
claimed-only across all six.** Genuine extras 7, 24 and 9. Per-leg wall 73.0, 61.7 and 56.5 minutes
at $15.58, $13.17 and $12.38 — a 26% cost spread on one flag value. Survivor count unchanged at 37.

## Sep 14 — the replication program leaves Meta's dial, and a "confirmed" number turns out to be the floor of its own range

Every n=3 run so far has been one rung of one vendor's effort dial. **Grok 4.6 at `xhigh`,
sequential legs, is the first replicated configuration outside it** — and it lands on the one kind of
row this board has the most of: a number that looked settled.

| | run 1 (Aug 28) | run 2 | run 3 | **mean** | range |
|---|---:|---:|---:|---:|---:|
| repo 1 | 8/45 | 14/45 | 13/45 | 12/45 | 6 |
| repo 2 | 19/60 | 16/60 | 16/60 | 17/60 | 3 |
| **total** | **27/105** | **30/105** | **29/105** | **29/105** | **3** |

Published as **Grok 4.6 (xhigh) seq — mean of 3**, at a mean floor of **$18.60** and **43.1 min**.
It supersedes the single run of 27.

### What gets retracted is an inference, not a number

The Aug 28 row's note said its 27 was solid because the Aug 12 concurrent-legs run had *also* scored
27 — "n=2 agreement". Two more sequential runs came back **30** and **29**.

The 27 was correct for the run that produced it. What does not survive is reading a pair of agreeing
draws as a measurement of the configuration: **both 27s sit at the bottom of the range this setup
actually spans.** Two runs landing on the same number is roughly what you would expect from a spread
of a few points — it is not corroboration, and this board treated it as corroboration in print.

This is the same correction as the one two sections up, arriving from the other direction. There, a
shape across four summary statistics was mistaken for a trend. Here, two equal numbers were mistaken
for a confirmation. **Small n does not become evidence by agreeing with itself.**

### The legs move more than the total does

The three totals span 3 points. The repo-1 legs span **6** — on a repo less than half the size — while
repo 2 spans 3, and the two moved in opposite directions on every pairing.

That is worth writing down and worth nothing more than that. It is three runs. It is **not** evidence
that totals are steadier than legs, and a 105-bug total built from two legs that partly cancel is
exactly the kind of pattern chance produces often. Recorded as an observation to watch, in the same
register as the range sequence that was withdrawn earlier today.

### Cost moved more than score did

The reconstructed floors were **$16.96, $17.96 and $20.88** — a 23% spread against a 3-point score
spread. That is not pricing noise: the reconstruction scales with how many inference requests a run
makes, and the three made 106, 118 and 128. The agent did measurably different amounts of work for
nearly the same result. Grok costs on this board remain a **floor, not a bill** — the CLI reports
context occupancy rather than cumulative usage, so every grok row is rebuilt from its own session
logs at list rates.

### Housekeeping

All six legs exited 0, sequential throughout, effort verified by a zero-token readback before each
launch, judged by the same model on all six. Genuine extras 16, 16 and 22; claimed-only 1, 0 and 1,
all on repo 1. Across the three runs this configuration fixed **40 distinct bugs** at least once.
The `high` row's note has been corrected where it placed itself "between medium 23 and xhigh 27" —
the upper endpoint is now a three-run mean of 29, and that row is still a single run. Board now 82
runs, 28 models; survivor count unchanged at 37.

---

## Sep 14 (later) — the top of Meta's dial, and the board starts publishing means as means

Two changes, one of them to a number and one of them to how every aggregate on this board is
presented.

### Muse Spark 1.3 `max`, three times: 33, 33, 35

**Mean 33.7 of 105, range 2** — the tightest spread of any rung on this dial, against 9 at the
bottom. With it, **Meta's effort dial is the first on this board measured at n=3 on every rung**:
low 9.7, medium 13.0, high 18.7, xhigh 20.3, max 33.7. Monotone, no dip, no dead middle.

What that licenses is narrower than the list looks. A step between two rungs means something only
where it clears the run-to-run range at both ends, and on this dial exactly one does: **max over
xhigh, 13.4 points against ranges of 9 and 2**. `high` over `medium` (5.7 against 6 and 3) and
`xhigh` over `high` (under two points against 3 and 9) are not separated by anything this board can
measure. The order of the endpoints is established. That every rung is a rung is not.

**One asterisk, stated because it is real:** the three `max` runs are not harness-identical. The
first ran Muse Code 1.1.1, the replicates 1.2.1 — the tool self-updates and did so between waves.
Every other replicated rung here held the version fixed. 1.1.1 scored 33 and the 1.2.1 pair scored
33 and 35, so nothing in this sample suggests the update moved the number; but a mean is a claim
that its members differ only by chance, and these also differ by a version string.

Across the three runs this configuration fixed **45 distinct bugs** at least once — 25 in all three,
6 in two, 14 in exactly one. The gap between *ever* and *reliably* is the thing a single run cannot
show, and it is 11 points wide here.

### Every aggregate column now carries the mean, not a rounding of it

Until today a mean row rounded to whole bugs, because the column counts bugs. So a rung whose three
runs scored 33, 33 and 35 published as **33** — the score of its worst run — and the 33.7 lived in
the prose underneath. Same for cost, wall clock and the unplanted column.

That is fixed, everywhere an aggregate appears: the scoreboard CSVs, the site, this README's table
and the PNG card. Six live mean rows were re-derived from their member runs rather than hand-edited,
and the re-derivation is now a tool (`bench_refresh_means.py`) that can be re-run at any time to
prove no published mean has drifted from the runs behind it.

Three details worth knowing before quoting a row:

- **A row that says `3` under *Runs* is a mean of three independent runs.** The table could not say
  this before — a three-run row and a single run rendered identically — so the column is new and the
  site tags those rows `mean of 3 runs`.
- **The combined figure is the mean of the three totals**, not the sum of the two rounded repo
  halves. Those can disagree by a tenth: `max` publishes 15.3 + 18.3 beside a combined 33.7. The
  combined number is the one that reconciles with the runs.
- **The headline count changed shape.** The board is now **83 rows from 95 scored runs** — six of
  those rows are three runs each. It previously said "82 scored runs", which undercounted the runs
  and overcounted the independent measurements.

A decimal in a column that counts bugs is not a rounding error. No run scored 9.7, and that is the
point: **no single run is the rung.**

---

## Sep 14 (later still) — the leader is replicated, and it is eight points wide

**GPT-6 Astra `max`, three runs: 48, 40 and 47. Mean 45.0 of 105, range 8.**

This was the arm worth buying above all the others. Every row on this board is read against the
best number on it, and the best number was a single run — the one whose spread mattered most and
was known least.

It is still the best number. What changed is what can be done with it.

### The 48 was the top of its own range

The row published on 2026-09-04 was the highest of the three runs, not the typical one. That is not
a correction — 48 happened, the receipt stands, and the leg was clean. It is a correction to the
*use*: every margin this board quoted against 48 was quoted against this configuration's best day.

### Eight points is wider than the distance to second place

The gap from the leader to the next row was 5 points and is now 2. Both of those are inside the
leader's own measured spread, and the rows underneath it are single runs whose spreads nobody has
measured at all. So the honest statement about the top of this board is narrower than it was
yesterday: **Astra `max` has the highest mean, and the ordering at the top is not something this
board can establish.** Two numbers of unknown width, two points apart, support no ranking.

Nothing about the configuration varied across the three runs — same model, prompt, harness, route,
effort flag and judge. All six legs exited 0, none carries a handicap note, and **zero claimed-only
fixes** were recorded on any of the six: this arm never claimed a fix the judge did not confirm.

### The unplanted column moved twice as much as the score

Genuine extras came in at **45, 58 and 62** — a range of 17 on a count that is not scored, against
a range of 8 on the count that is. Worth knowing before anyone reads one run's extras figure as a
property of a model.

Wall clock 78.8, 96.0 and 94.6 minutes; cost $31.21, $33.73 and $34.15. Run 3 ran 20% longer than
run 1 and scored one point lower.

### A judging note, because it nearly became a silent difference

Run 3's repo-2 leg made itself a scratch directory holding **300 copies of the files it was about
to edit** — every one verified byte-identical to the pristine repo, so containing no fix and no
evidence. Left in the diff it would have added two megabytes to that leg's judge packet, a packet
neither of the other two runs had, and it tripped the 2 MB guard that exists to stop evidence being
truncated silently.

The tempting repair was to raise the limit. That would have judged one replicate on a materially
different packet from its own siblings — a comparability break dressed up as a size fix. The
directory is excluded instead, so all three runs were judged on the same shape of evidence. The
guard now reports which directory the bytes went to, so the next occurrence is a diagnosis rather
than an integer.

### Where the replication programme stands

Seven configurations have now been run three times. Ranges, worst to best: **9, 9, 8, 6, 3, 3, 2**.
Meta's dial is complete at every rung; Astra's top setting is done; Fable `max` is running.

That is still not enough to say which settings are steady — a range from three draws is a noisy
estimate of spread, and the ranges do not fall cleanly with effort. What it is enough for is the
thing this programme was actually for: **no single run on this board should be quoted as a model's
score**, including the one at the top.

## Sep 15 — three Flash arms at n=3, and the first wave where the *regime* was checked before publishing

Three Flash configurations were each run three times: DeepSeek V4.1 Flash `max` on DeepSeek's own
API, GLM-5.3 Flash `max` on Z.ai's own API, and Gemini 3.8 Flash `high` on the Antigravity CLI. Two
new runs apiece, twelve legs, all clean. [combined-scoreboard.csv](combined-scoreboard.csv)

| Model | Runs /105 | **Mean** | Range | Old single run | Ever fixed | Fixed in all 3 |
|---|---|--:|--:|--:|--:|--:|
| **DeepSeek V4.1 Flash (max)** | 24, 19, 22 | **21.7** | 5 | 24 | 33 | 11 |
| **Gemini 3.8 Flash (high)** | 20, 19, 15 | **18.0** | 5 | 20 | 24 | 14 |
| **GLM-5.3 Flash (max, Z.ai)** | 19, 18, 16 | **17.7** | 3 | 19 | 23 | 12 |

### The highest scorer of the three is the least repeatable

DeepSeek Flash leads this group at the mean and is the only one of the three whose *replication was
verified* — and it repeats the smallest share of its own work. It ever fixed 33 distinct bugs but
fixed only **11** of them in all three runs, with 12 falling in exactly one run. Gemini fixed the
fewest distinct bugs (24) and repeated the most of them (14).

Reading those two columns together is the whole point of running anything three times. A single run
of DeepSeek Flash reports something between 19 and 24; what it can be *relied on* for is 11.

### The regime gate ran for the first time, and two of three arms could not be checked at all

A mean is a claim that its members differ only by chance. Since the Fable `max` case — three arms
that were byte-identical on paper and nonetheless differed in whether the harness threw their
context away mid-run — this board checks that claim mechanically before publishing a mean, rather
than trusting that identical config files imply identical runs.

- **DeepSeek Flash: SAME REGIME, both repos.** All six legs resolved the same model at the 1M
  window and **none compacted** — peak live context 471,821–558,074 across the six, against a
  harness that discards context at about 30% when triggered. One thing was not held fixed and is on
  the row: CLI 2.1.267 for the first run, 2.1.270 for the other two.
- **GLM-5.3 Flash: CANNOT TELL.** Z.ai's endpoint reports `input_tokens: 0` on every turn and emits
  no compaction records. Peak context and compaction count are *blank, not zero*.
- **Gemini 3.8 Flash: CANNOT TELL.** The Antigravity CLI writes no session init record at all, so
  neither the context regime nor even its own version is recoverable — for the replicates or for the
  2026-09-02 control they are compared against.

"Cannot tell" does not block a publish, and it should not: most harnesses on this board are
unreadable this way, and a gate that blocked them would become something to route around. It goes
**on the row** instead. Two rows in this wave say the replication is believed rather than confirmed,
and one says it was confirmed — and the difference between those two sentences is now visible on the
board rather than living in someone's memory.

### Gemini's wall column is 17–32% slower than its control and nobody knows why

All four Gemini replicate legs ran at **68, 71, 74 and 83 per cent** of the 2026-09-02 control's
tokens per minute. Every leg, one direction. Two explanations were tested and both failed:

- **Box contention.** Three arms ran concurrently on these nights, which no control had. But GLM ran
  under the identical load at **100, 143, 87 and 106 per cent** of its own control. Concurrency is
  not a uniform tax, so it cannot be written on Gemini's row as though it explained anything.
- **Provider throttling.** One Gemini leg did die on a hard Google quota wall, and that story made a
  prediction: re-run it alone on an idle box after the quota resets and it should come back near the
  control's rate. It came back **the slowest of the four**, under the cleanest conditions any leg in
  this wave got. A hypothesis that predicts fast and gets the slowest run of the set is refuted, not
  refined.

So the row states the per-leg figures and **attributes no cause**. What this does not touch is the
score: every score on this board is judged from the diff against a withheld answer key, so wall and
cost are the only columns a slow leg can move.

DeepSeek's wall swung in *both* directions on the same night and the same binary — 47, 131, 118 and
104 per cent of its control. Quote its per-leg figures, not a ratio.

### A tempting pattern, and the number that kills it

All three single runs this wave supersedes were the **highest** of their own three. It is very easy
to turn that into "the board's single-run rows are optimistic".

Across the **nine** configurations where a three-run mean has replaced a previously published single
run, that original sits at the **top** of its range 4 times, in the **middle** 2, and at the
**bottom** 3 — about what chance gives. Grok 4.6 `xhigh` published 27 against runs of 27/30/29; Muse
`medium` published 9 against 9/15/15; Muse `max` published 33 against 33/33/35. Three arms landing
the same way in one wave is a coincidence of three draws, not a property of the board, and it is
recorded here so it does not get quoted as one later.

### Where the replication programme stands

Ten configurations run three times. Ranges, worst to best: **9, 9, 8, 6, 5, 5, 3, 3, 3, 2**.

Still not enough to say which settings are steady. Still more than enough for the thing the
programme was for: **no single run on this board should be quoted as a model's score.**

## Sep 15 (later) — Qwen3.8-27B joins the replication program, unchanged

**Qwen3.8-27B `xhigh`, Alibaba's own endpoint, three runs: 15, 13 and 17. Mean 15.0 of 105, range 4.**

The single run published 2026-09-12 was the most interesting Qwen row on the board for what it
lost: to both other Qwen3.8 sizes, at a higher cost than one of them. That finding survives
replication unchanged — the mean sits eleven points below Qwen3.8-Flash and behind Qwen3.8-Max,
on the same endpoint, harness and repos.

### Regime check: SAME REGIME on both repos

All six legs resolved the same model id at the declared 1,000,000-token window and **none
compacted** — peak live context 26,047–27,567 across the six, nowhere near either the window or
this harness's compaction trigger. One thing was not held fixed and is on the record: CLI 2.1.268
for the first run, 2.1.272 for the other two.

### One wall-clock leg is flagged, and the flag does not explain its own size

Two of the three repo-2 legs shared the machine with another running leg. One of those two came
back close to the unshared control (28.8 min vs 22.0); the other came back at 43.4 — nearly double.
Contention can only add time, never remove it, and it touches wall clock alone: score, tokens and
cost are unaffected on all three legs. The direction is consistent with contention costing time;
the *size* of the effect on one leg and not the other is not, so nothing beyond "shared the box" is
asserted here.

### Where the replication programme stands

Eleven configurations have now been run three times. Ranges, worst to best: **9, 9, 8, 6, 5, 5, 4,
3, 3, 3, 2**. Qwen3.8-27B sits in the middle of that list — tighter than most of the board, not the
tightest on it.
## Sep 15 (later still) — the same weights at 8-bit, through an aggregator: 8 of 105

**Qwen3.8-27B 8-bit — the same weights served at fp8 by a third-party host — scores 8 of 105. On the vendor's own
endpoint those weights average 15.0 across three runs. The gap is real and it is not clean — do not read it
as the price of quantization.**

Two things changed together, and this pair isolates neither. The **precision** went from native to
fp8. The **route** went from the vendor's own API to an aggregator plus a third-party host. A run
that would separate them — this host at native precision, or the vendor's endpoint at fp8 — does
not exist, because neither party serves the other half. This is the same trap the earlier
OpenRouter-vs-first-party pair on this board hit, and it is named here for the same reason: a
two-variable comparison is worth publishing and is not worth over-reading.

The host was **pinned, with fallbacks off**. The aggregator lists sixteen providers for this slug —
ten at fp8, one at bf16, one at fp4 — and an unpinned run blends across them per request, which
measures nothing at all.

### The two rows did not run in the same context regime

This is the more specific reason the gap is not clean. Through a shim the harness cannot learn the
upstream context window, so this arm **compacted 3 times on repo 1 and 2 times on repo 2**. The
first-party control **compacted zero times on either repo**. Compaction throws context away
mid-run, so some unknown part of this gap is a harness difference rather than a model difference.
It is stated rather than corrected because nothing available here can separate the two.

One measurement that looks comparable is not: the **peak live context** figures. On the first-party
route that number comes from the harness's own live-context accounting; on a shim route, which
reports none, it is reconstructed from the compaction triggers instead. Two different
instruments — the peaks are not comparable across route types. The compaction *counts* are.

### What it is good at

It is **cheaper and no slower**: 2.11 dollars against 5.55, and 59.0 minutes against 56.8. Those
two cost figures are also not the same kind of number — 2.11 is a real invoice read as a credits
delta before and after each leg, while 5.55 is a token-count estimate at list rates, because the
first-party endpoint publishes no usage API.

And it did not over-claim. **Zero claimed-only fixes on either repo** — every fix it reported, the
blind judge confirmed. It also surfaced two defects nobody had planted, one per repo.

### The first attempt at this row is void, and the reason is worth publishing

The first configuration let the harness fall back to its default context assumption. The harness
then compacted at roughly a quarter of the host's real ceiling: **repo 1 finished after 43
autocompactions**, taking 163 minutes to score 3 of 45, and **repo 2 was killed outright** by the
harness's own rapid-refill breaker after 31. The control on the same model and repos compacts zero
times and peaks near 27K.

Those two legs measured the harness, not the model, and they are not this row. Corrected, the same
arm ran in 59.0 minutes total. **A context declaration is not paperwork** — misdeclare it and the
run measures your own plumbing, convincingly enough to be mistaken for a finding.

### One run, not three

The first-party row is a mean of 15, 13 and 17. This is a single 8 with no measured spread of its
own. Eleven configurations on this board have been run three times and their ranges run from 2 to
9 points, so a lone number here carries an error bar this run cannot show. It is published as n=1
on purpose, and it is not in the default view: rows below 19 of 105 stay off the front page.
## Sep 15 (later still, cont.) — Qwen3.8-Max joins the replication program, and moves DOWN

**Qwen3.8-Max `max effort`, Alibaba's own endpoint, three runs: 28, 24 and 25 of 105. Mean 25.7,
range 4.**

This is the first replication on this board where the mean moved the row **down** rather than
confirming it. The single run published Sep 11 was the best of the three (28); the other two came
back at 24 and 25. Nothing about the setup changed between legs — same endpoint, same declared
context, same effort tier — so the direction is simply what n=1 risks: a single run can land on
either side of a model's true rate, and this one landed on the favorable side.

### Regime check: SAME REGIME on both repos

All three runs resolved the same model at the declared 1,000,000-token window, first-party,
max effort. Cost quoted on the mean row is the **average of the three per-run costs** (26.29,
29.85, 24.15), not their sum — the three runs together cost $80.29, all list-rate estimates,
since this endpoint publishes no usage API.

### Where the replication programme stands

Twelve configurations have now been run three times. Qwen3.8-Max joins the middle of the range —
tighter than most of the board's replications, in line with its Qwen3.8-27B sibling published
earlier today.

The superseded single run stays on the board, not deleted — it is the strongest of the three, and
the mean is what leads per the standing rule that any rung run three times publishes at n=3.
## Sep 15 (later still) — gpt-oss-120b and gpt-oss-20b replicate to n=3, and the zero holds

**gpt-oss-120b: three runs, 0, 0 and 0 of 105. gpt-oss-20b: three runs, 0, 0 and 0 of 105.** Both
single runs published Sep 12 scored zero; both replications confirm it exactly. Twelve legs
across the two models, and every one matches zero of the 105 planted bugs.

### The zero is not a scoring artefact

Five of gpt-oss-120b's six legs, and one of gpt-oss-20b's six, never wrote `BUGS_FOUND.md` to
disk — the model made real code changes (one to three Edit calls, every leg cleanly
`terminal_reason=completed`) and then printed the report into the chat transcript instead of
creating the file. That is not treated as a missing measurement: each report-less leg was judged
on its diff directly, the same override the Sep 12 n=1 abhb leg for gpt-oss-120b already used.
Graded the hard way, on code rather than on the model's own description of its code, every one of
those diffs still matches zero planted bugs. One (the original gpt-oss-120b abhb run) contains a
genuine unplanted fix and a cosmetic change; nothing else does.

gpt-oss-20b's own outlier leg is the opposite failure: no diff, no report, a runner-confirmed
healthy environment — the model decided there was nothing to fix and stopped. An empty leg rather
than an incomplete one, scored zero without a judge call at all.

### Regime check: cannot tell

Both replications route through OpenRouter to Groq via a local shim, which carries no Claude
Code-native context accounting. The usual same-model/same-compaction check this board runs before
publishing a mean cannot read this route — unverified rather than verified, the caveat every
OpenRouter-routed replicate on this board carries.

### Cost

Both means cost 11 cents total across all six legs — real OpenRouter credits-delta bills, not
estimates, same as the superseded single runs. At this price and this score, the finding from
Sep 12 stands: scale between the two sizes buys nothing measurable here, and now it is measured
twice.

## Sep 16 — Qwen3.8-27B 8-bit replicates to n=3, and moves up rather than holding

**Qwen3.8-27B 8-bit (OpenRouter, pinned to Parasail): three runs, 8, 12 and 12 of 105.** Mean
10.7, range 4. The single run published Sep 15 (8) turns out to have been the low end of the
spread, not a typical draw — the mean sits 2.7 points above it, the opposite direction from the
gpt-oss pair two sections up.

- **Zero over-claims on all six legs.** Every run reported `claimed_only = 0` on both repos —
  nothing this model said it fixed went unconfirmed by the blind judge, holding across three
  independent runs. Exactly one partial credit exists anywhere in the six legs, on the original
  n=1 repo-2 run; every other hit is a full match.
- **It keeps finding things nobody planted.** Genuine unplanted extras: 1/1 on the n=1 run, 0/2 on
  r2, 0/1 on r3 (repo 1 / repo 2 each) — mean 1.7 across six legs, never zero on both repos of the
  same run.
- **Regime check: SAME on both repos, and verified rather than assumed.** This route (OpenRouter →
  Parasail, through the same kind of local shim as the gpt-oss rows) reports real context and
  compaction accounting, unlike the gpt-oss OpenRouter arms above — the harness-parity check this
  board runs before publishing a mean actually ran here, instead of coming back unreadable.
- **Cost:** $2.97 combined mean across the six legs, all real OpenRouter credits-delta bills.

The superseded single run stays on the board, not deleted — the 8 happened and this is its
receipt; the mean is what leads per the standing rule that any rung run three times publishes at
n=3.

**Presentation note.** This row, and the gpt-oss-120b/20b means above, are not featured on the
default view. A mean row is no longer featured automatically on publication — that rule (Sep 14)
is reversed as of today: featuring is an opt-in again, decided per row, the same as any single-run
row always required. Nothing about the underlying numbers changed; every row stays published,
in the CSVs, and one filter click away.

## Sep 16 — Gemma 4 31B joins the board, native and 4-bit, and one leg shows exactly why it's slow

**First appearance of Gemma 4 31B here.** Antigravity does not serve it at all — checked live
against 15 models on offer, none of them Gemma — so both variants run through OpenRouter instead:
native bf16 pinned to Crusoe, 4-bit fp4 pinned to CoreWeave (the cheapest tools-capable fp4 host
for this slug; DeepInfra fp4 is cheaper still but reports no tool support, disqualified the same
way DeepInfra was on the Qwen3.8-27B 8-bit row). One run per repo each, not a replicated mean.

- **Native: 4/105** (repo 1: 1, repo 2: 3). **4-bit: 3/105** (repo 1: 1, repo 2: 2). Zero
  claimed-only fixes on any of the four legs — nothing either variant reported went unconfirmed by
  the blind judge. Two genuine unplanted extras on each variant.
- **The two native legs did not run in the same regime, and this time the cause is verified, not
  just flagged.** The repo-1 leg compacted three times, peaking at 198,297 tokens; the repo-2 leg
  shows zero compactions. That difference alone accounts for the gap between them: 205.2 minutes
  and $8.61 on repo 1 against 16.6 minutes and $0.53 on repo 2 — roughly 12x the wall clock and 15x
  the cost for one more repo's worth of the same model on the same day. Repeated auto-compaction
  means most of that run was spent re-reading context it had already seen once; that's the
  mechanical explanation, not model instability or provider throttling. (The repo-1 leg's clean
  attempt also shared the machine with five other queued legs, which can inflate wall further, but
  — per this board's standing note — doesn't touch scores, tokens, or cost; the compaction count is
  what's doing the work here. An earlier attempt at the same repo-1 leg hit a similar contention
  window and exited non-zero; it isn't this row.)
- **4-bit hit neither leg's compaction at all** — zero compactions on both — and came in at
  essentially the same score as native for a fraction of the cost: $0.56 combined against native's
  $8.61, about 1/15th, for one point less. That's read from one run each side, not a controlled
  quantization sweep — fp4 happened not to compact here while bf16 did on repo 1, which doesn't
  establish that fp4 never compacts or bf16 always does.
- **Billing:** real OpenRouter credits-delta bills on all four legs, not list-rate estimates.
  Effort is not asserted for either variant — OpenRouter doesn't implement a tier field this route
  honors, so none was requested.

Neither row is featured on the default view, per the same opt-in-only rule as the two sections
above.

## Sep 16 — GPT-5.6 Sol (max) becomes a two-run mean, and a re-judge shows what grading noise costs

**43.5/105** (repo 1: 19.0, repo 2: 24.5), the mean of two runs that scored **40 and 47** — repo 1:
18, 20; repo 2: 22, 27. Range 7. The single-run row that stood here is superseded but kept as a
receipt, and the replacement is what the default view now shows.

- **Two runs is two points, and the spread is the finding.** A range of 7 of 105 on a fixed
  configuration is wider than the gap between several adjacent rows on this board. Read 43.5 as an
  estimate with a known spread, not a settled number.
- **The superseded row says 42 and this mean uses 40 for the same run. Both are real, and the
  reason is worth publishing.** That transcript has been judged twice. The Jul 31 pass scored
  19 + 23 = 42 and recorded its judge as grok-4.5 — with no served-model field at all, because that
  column did not exist yet. The Sep 13 re-judge scored 18 + 22 = 40 and recorded what the server
  actually served: grok-4.6. The judge bridge's model flag is inert (measured Sep 4: grok-4.5,
  grok-4.6 and a deliberately nonexistent string all came back grok-4.6), so the July pass recorded
  a *request* as though it were a fact and was in all likelihood served the same judge. The mean
  uses 40 because that is the pass whose judge identity was measured, and the pass the second run
  was scored under — **comparable and documented, not more accurate.** The older number stays
  visible rather than being quietly rewritten.
- **What the second grading buys is an error bar, not sample size.** The two passes disagree on
  **3 bugs of 105**: on repo 1 one bug moved from a full fix to a partial; on repo 2 two credited
  bugs became misses. So judge variance on a fixed transcript is **2 points**, against **7 points**
  of model variance between the runs — run-to-run spread is roughly three and a half times the
  grading noise. Two gradings of one transcript are not two runs, and were not counted as such.
- **The second run cost 74% more for 7 more points.** 100.9M tokens against 176.0M; $69.61 against
  $121.09 at list. The runs are six weeks apart on a CLI that records no version in its
  transcripts, so whether that is the same model working harder or a changed serving path is not
  established here.
- **A third run was attempted and is not on this board.** It ran 156 minutes and 563 tool calls,
  then the harness account's usage quota was exhausted mid-turn. No report, no token accounting,
  nothing to score — a leg that never finished is not a result and is not counted as a low run.
- **The replication is unverified rather than verified.** The automated regime check reads context
  accounting out of transcripts; this harness reports none, so it returns *cannot tell* for both
  repos. Nothing beyond identical arm definitions confirms the two runs shared a configuration.
- **Wall time is not comparable across the two runs.** The first run's legs ran alone; both of the
  second's shared the machine and say so in their own rows. Contention inflates a wall figure and
  cannot shrink it, so the wall mean is an upper bound. Scores, tokens and cost are untouched by it.
- **The failure rate is part of the picture.** The second run needed five attempts to produce two
  clean legs; the earlier ones died on wall budgets or non-zero exits. Those attempts are visible
  in the metrics receipts.

## Sep 17 — Muse Spark 1.3 (max) goes to five runs, and the error bar triples

**32.2/105** (repo 1: 14.2, repo 2: 18.0), the mean of five runs of one fixed configuration — the
deepest replication on this board. The runs scored **33, 33, 35, 29 and 31**. The three-run row that
stood here (33.7) is superseded and kept as a receipt.

- **The mean barely moved. The spread is the finding.** Three runs gave 33, 33, 35 — a range of 2,
  which reads as a tight, well-behaved arm. Five give 29 to 35: **range 6**, wider than the gap
  between several adjacent rows here. The n=3 did not merely estimate the mean imprecisely; it
  understated how much this configuration varies, in the direction that made it look steadier than
  it is. Two extra runs bought a corrected error bar, not a corrected score.
- **The harness updated itself mid-experiment, and two runs are split-version.** Muse Code polls a
  release channel and replaces its own binary. Run 1 ran 1.1.1, runs 2–5 ran 1.2.1, and the repo-2
  legs of runs 4 and 5 came up on **1.3.0**. There is no version pin, the channel serves only the
  current release, and the previous binary is deleted on upgrade — so 1.2.1 cannot be restored and
  this is not repairable by re-running. It is disclosed on the row rather than smoothed over.
- **The drift is not what lowered the score, and the split is what shows it.** The obvious worry is
  that runs 4 and 5 are low because the newer build is worse. Two facts say otherwise. The drop
  lives on **repo 1, where the harness never changed**: all four of runs 2–5 ran 1.2.1 there and
  scored 17, 15, 12, 13 — a spread of 5 on a single repo with the version held constant. And repo 2
  shows **no version effect at all**: the 1.2.1 runs scored 16 and 20, the two 1.3.0 runs scored 17
  and 18, sitting inside that range rather than below it. The low runs are run-to-run variance.
  That the drift landed on the half where it cannot be doing the damage is luck, not design.
- **The failure rate is part of the picture.** Runs 4 and 5 needed several attempts on repo 2. Three
  attempts died without producing a report because the account's subscription quota was exhausted
  mid-leg — and the retry layer absorbed the rate-limit responses, so the harness reported three
  different and all misleading causes, including two stream-idle timeouts and a suspected local
  network fault. Those attempts produced no report and no score, are **not** counted as low runs,
  and cost $8.35 between them. A leg that never finished is not a result.
- **Regime: unverified, not verified.** The automated check reads context accounting out of
  transcripts and this harness reports none, so nothing confirms the five runs shared a regime
  beyond their identical arm definitions. Wall time is an upper bound — runs 4 and 5 shared the
  machine, and every affected row says so itself.

The five runs that finished cost **$90.55**.

## Sep 17 — Union Alpha (stealth; free) ties a $28 row for nothing, and the default judge steps aside

**32/105** (repo 1: 16, repo 2: 16), one run, 32.7 minutes, **$0.00**. That is an exact tie with
GPT-5.6 Terra at max effort — the same 16 and 16, not merely the same total — which took 159.7
minutes and $27.98. Seventeen of the 98 rows here sit at 32 or better; this is the only free one,
and the next cheapest is $1.80. The tie is on the number and not on the work: the two runs share
**23** of their 32 bugs, so nine on each side are bugs the other one missed.

It goes on the board as **Union Alpha (stealth)**. A stealth slug is never carded as a named
release here: the name it will eventually ship under is the one thing nobody outside the lab
has, and the last one to pass through — Ox Alpha — turned out to be an already-published model
under a codename.

- **The lab is not disclosed, and the row is not carded with one.** Wire fingerprinting excludes
  Anthropic, xAI, Google, Meta and the whole Chinese-lab family on categorical channels — native
  finish reason, tool-call id shape, whether `reasoning_details` carries a named format, context
  length. What is left over points at OpenAI and at nothing else: the special-token profile matches
  GPT-5.6 Sol, and the political-probe answers are structurally near-identical to Sol's. Pointing is
  not knowing. The row ships with no vendor and no house colour until a lab says otherwise.
- **The channel that settled the last stealth slug does not settle this one.** Ox Alpha was
  identified inside a day off its tokenizer. Here the endpoint's own token counter is
  non-deterministic: the same fixed string, cache-busted so no single prompt's cache can explain it,
  comes back at about 200 prompt tokens with `cached_tokens=0` or at 169–172 with
  `cached_tokens=12`. Two serving states that disagree by 17 tokens on a one-token prompt are two
  tokenizers, not one backend with an optional prefix. Read this row's token columns as the
  endpoint's self-report. The cost column is the one number the wobble cannot touch.
- **The board's default judge had to step aside, and what that cost was measured, not asserted.** A
  model may not judge itself or a sibling. With the lab unidentified the routing cannot be read off
  a vendor, and the residual evidence points at the default judge's own family — so the scoring pass
  ran on grok-4.6 instead of codex. Every other row here was judged by codex, and the measured
  judge-to-judge spread on a single transcript is about 2 points of 105, which is not nothing. So
  this run was judged **twice**: grok as the scoring pass, codex into a separate scratch pass that
  could not redefine it. The two judges selected the **same 32 bugs** — identical sets on both
  repos, not merely equal counts. Nothing about this number depends on who read it.
- **There is no effort dial on this route at all.** `supported_parameters` carries no reasoning
  field of any kind, the model returns `reasoning_tokens=0` with empty `reasoning_details` on a
  prompt that makes every reasoning model think, and an invented tier is refused by the gateway in
  0.2s without ever reaching the provider. The row is `default`, deliberately not `inert default`:
  nothing was asserted, and there was no dial to probe.
- **One run, on a route that is visibly noisy.** Six byte-identical temperature-0 calls came back
  bimodal — about 8s and about 32s, 20 to 218 completion tokens, a 10.9× spread inside a single
  condition. An n=1 here is weaker evidence than an n=1 elsewhere, which is why two replicates are
  already running. When they land, their mean supersedes this row.

The run cost nothing. The grading did not: this row carries two complete judge passes instead of one.

## Sep 17 — Union Alpha (stealth; free) goes to three runs, and the free tie turns into a range

**30.7/105** (repo 1: 16.0, repo 2: 14.7), the mean of three runs of one fixed configuration, in 38.2
minutes for **$0.00**. The runs scored **32, 34 and 26** — range 8. The single run published earlier
today (32) is superseded and kept as a receipt; it sat mid-range, so the tie it drew with GPT-5.6
Terra at max effort was neither a fluke nor a floor, and the mean no longer reaches it.

- **The replication is unverified rather than verified.** The automated regime check reads context
  accounting out of transcripts, and this route reports almost none — it returns *cannot tell* on
  both repos. Beyond identical arm definitions and the gateway log, nothing confirms the three runs
  shared a configuration. Said on the row rather than implied by a check that did not run.
- **One member ran itself into the context ceiling and the other two did not.** r3's repo-1 leg
  peaked at **197,452** tokens against this endpoint's 262,144 ceiling and was compacted once by the
  harness; r1 peaked at 23,028, and neither r1 nor r2 compacted at all. Every configuration
  parameter was held fixed — same slug, same single endpoint, same harness build, same prompt, same
  repos, same judge — so what differed is what the *model* did: r3 made about 2.3× the tokens and
  1.9× the wall of r1. It is averaged in rather than dropped, because dropping a member for behaving
  differently selects runs on their behaviour. It is also the lowest of the three, at 26.
- **The cost column is exact, and one figure behind it was repaired.** The slug is priced at $0/$0
  and bills nothing — a live call through the same pinned path returned `usage.cost` 0,
  `upstream_inference_cost` 0, and a credits delta of exactly **$0.000000**. r3's two legs
  nonetheless recorded $0.0787 and $0.0662, because for aggregator arms the runner measures a
  **credits delta** across the leg, so any other consumer on the same account lands inside it — and
  another session was fingerprinting this model against paid reference models through r3's window.
  Both cells were repaired to 0 and both originals are preserved in the metrics receipts. r1 and r2
  measured 0 unaided.
- **The judge is not this board's default, and the cost of that was measured.** A model may not
  judge itself or a sibling; the lab is unidentified, so routing cannot be read off a vendor, and
  the residual evidence points at the default judge's own family. All three runs were scored by
  grok-4.6. r1 was *also* judged by codex into a separate scratch pass, and the two judges selected
  the **same 32 bugs** — identical sets on both repos, not merely equal counts.

Three runs, 105 minutes of agent time, and **$0.00**.

## Sep 17 — a correction to the Union Alpha rows: the wire evidence never pointed anywhere

Both `Union Alpha (stealth; free)` and `Union Alpha (stealth; free) - mean of 3` carried a sentence
saying the residual wire evidence "points at OpenAI and at nothing else," with the special-token
profile matching GPT-5.6 Sol offered as support. That overstated the fingerprinting work it was
summarising, and it has been corrected in place on both rows.

The underlying writeup had already withdrawn that reading. The special-token profile says only that
this vocabulary holds none of those strings as special tokens — true of most vocabularies, and it
matches the Qwen3-Max line exactly as well as it matches Sol. Re-measuring the categorical channels
across all ten reference fingerprints makes the problem concrete: Union Alpha returns `stop` /
`tool_calls` where OpenAI, Meta and xAI all return `completed`; it carries no reasoning format where
OpenAI carries `openai-responses-v1`; its window is 262K against OpenAI's 1.05M; and its tool-call
ids are bare UUIDv4s, a shape no reference model on the board produces. On tokenizer L1 distance Sol
ranks third of nine inside a flat 64–79 band — no separation at all. Every one of those is a channel
used to exclude some *other* lab, and read the same way they count against OpenAI too.

**The exclusions stand.** Anthropic, xAI, Google, Meta, the Chinese-lab family and Mistral are out on
evidence this correction does not touch. What is withdrawn is the positive lean. The lab behind this
slug is unidentified, the rows stay uncarded, and the notes now say so.

The judge routing does not change and was never wrong: a model may not judge itself or a sibling, and
with the lab unknown the board's default judge could not be excluded — which is reason enough to
route around it. Only the stated justification was too strong, and it has been weakened to match.

Found while testing whether the benchmark's own data could identify the model statistically. It
cannot — the fix-set channel scores AUC 0.60 at recognising *known* siblings (GPT-6 Astra and
GPT-5.6 Sol rank 350th of 351 pairs), and a transcript-behaviour channel loses its own positive
control once run length is regressed out. A board that measures capability measures one dimension,
and lab identity is not on it.

## Sep 18 — Union Alpha was not one model, and the slug is gone

The endpoint was withdrawn within a day of its rows going up: every call now returns 404, and
OpenRouter lists zero stealth slugs. Whatever was not measured while it was live cannot be measured
now. What was already on record still can be, because token counts taken on a fixed passage stay
comparable to the same passage measured today.

Re-running that passage across the live reference panel puts Union Alpha's two recorded prefix-free
readings — 160 and 200 — next to Kimi K3 at exactly 160 and Qwen3.8-Max at exactly 200. Two states,
two different labs, which is the tell: a model has one vocabulary, so at most one of those can mean
anything. Measuring how much a single-passage match is worth settles it — across nine passages the
mean one-passage AUC is 0.892, and on the plainest passage six labs (OpenAI, Alibaba, DeepSeek, xAI,
Z.ai) all return the identical count. A lone integer match is a coincidence generator.

The stronger reading of the same numbers is not about any lab. Those two readings are **40 tokens
apart on one 437-character passage with the hidden prefix cancelled and no special-token markers to
explain it** — about half the entire spread measured across ten labs on that passage. One model has
one vocabulary. **At least two backends answered to this slug.**

The benchmark runs themselves do not look mixed: the three replicates agree at mean Jaccard 0.628 on
their fixed-bug sets, against a board median of 0.632 across 24 replicate families — ordinary, right
alongside Opus 5 at 0.639. The probe work suggests the router was length-sensitive, so 400-token
probes and 20k–200k-token agentic runs need not have landed in the same place. Both rows now carry
this: the score is what was measured, and that it describes a single model is not something this
board can claim.

Method receipts for the identification work — including why benchmark-result similarity and agentic
style both failed their power checks while a nine-passage vocabulary probe scores AUC 1.000 — are in
the private writeup; the probe itself is `tools/model_family_probe.py`, and on the next stealth slug
it runs on day one.

## Sep 18 — Union Alpha is Unbiased's Pareto, and it was never one model

OpenRouter announced it the same evening these rows went up: *"Union Alpha is revealed on OpenRouter
as @TheUnbiasedCo Pareto! Impressive detective work and demand from the community cut this stealth
period short."* Both rows are now carded to **Unbiased**, keeping the stealth name — the stealth
endpoint is what was measured — exactly as Ox Alpha kept its name when it resolved to Z.ai.

**Pareto is a composite, not a model.** Unbiased describes it as running several frontier and
open-source models in parallel on every request and selecting or synthesising the output. That is
the answer to a question this board had already answered from the wire, a day before the reveal and
without knowing it: two prefix-free token counts 160 and 200 for one fixed 437-character passage,
a 40-token gap where the entire spread across ten labs is 82. One model has one vocabulary, so it
had to be more than one backend. Re-probing the live `unbiased/pareto` endpoint confirms it — the
same passage now returns **138, 160 and 200**, and 8 of 10 corpus passages come back with two or
three different counts.

**What that costs the score.** A blend's number is not a model's number, and both rows now say so.
30.7/105 is what this configuration produced; it is not a capability claim about any weight set.

**Priced in retrospect, and the figure went into the column (revised Sep 18).** The first pass put
the retrospective price in the prose and left the cells at $0.00, on the glossary's `free` — *served
free at the time of the run* — which is exactly what happened. That was the wrong call, and Pawel
caught it looking at the live board: a cost column exists so rows can be compared, and once the
preview ended an honest zero stopped doing that job. The cells now read **$3.30** (published single
run) and **$4.81** (per run across the three, $14.43 for all of them) at the revealed list — $2.50
prompt / $7.50 completion / $0.25 cached read per million — marked `cost_list`, which the glossary
already defines as *a token-count estimate at published list rates, not a bill*. Nothing was
actually spent, and the published receipts in `results/` still say $0.00, because a receipt records
what a leg cost; the correction lives generator-side in a `LIST_USD` table, and a `LIST_USD` entry
on a row marked `bill` is a build failure. The headline stands either way — the single run tied
GPT-5.6 Terra (max effort) bug-for-bug on the split, and Terra billed $27.98. Free became 8.5×
cheaper rather than infinitely cheaper.

**The earlier correction holds up.** On Sep 17 the note's claim that the wire evidence "points at
OpenAI and at nothing else" was withdrawn as an overstatement. A widely-read outside analysis
reached the opposite conclusion and titled it *Union Alpha appears to be from OpenAI*. The reveal
says both were chasing a malformed question — the developer is an aggregator, and the weights belong
to whichever panel member answered that call — but the row was right not to card it.

The arm definitions were carrying a price table of all zeros, true in preview and false now; a
re-run would have recorded $0.00 silently and tripped the meter-contamination guard on every leg.
Repriced.

**Featured (Sep 18).** Pawel put the row in the default view once it had a real vendor and a real
price. The mean-of-3 row only — the single run is superseded, and `main.js` drops superseded rows
before it applies the featured preset, so featuring that one would have been a silent no-op rather
than a second Pareto row. Default view: 20 → 21 rows. This board features by decision, not by score
(Sep 16), and the decision is the whole record of why it is there.

**Renamed on the board (Sep 18).** The rows first kept the codename after the reveal, on the Ox
Alpha precedent that a row records the endpoint it was run against. That reads wrong once the
identity is public — a visitor sees a stealth name for a model that has one — so the displayed model
is now **Pareto (ex-Union Alpha)**. The row ids are untouched, because they are the join keys the
scoreboards and the mean-membership table resolve against, and the runs really were made against
`stealth/union-alpha`.

Also fixed in the same pass: the README leaderboard image carried a cache-bust token keyed to the
newest *run* date, so any change that re-rendered the PNG without adding a run produced a
byte-identical URL and GitHub's image proxy kept serving the stale picture. It now hashes the PNG's
bytes, the way the og-image already did.


## Wave: Grok 4.7 at xhigh — a dead tie, at a third more money (Sep 21)

| | repo 1 /45 | repo 2 /60 | total /105 | wall (min) | floor |
|---|---|---|---|---|---|
| Grok 4.7 run 1 | 12 | 13 | 25 | 39.6 | $16.54 |
| Grok 4.7 run 2 | 12 | 18 | 30 | 47.3 | $23.04 |
| Grok 4.7 run 3 | 16 | 15 | 31 | 51.8 | $29.94 |
| **Grok 4.7 mean of 3** | **13.3** | **15.3** | **28.7** | **46.2** | **$23.17** |
| **Grok 4.6 mean of 3** | **11.7** | **17.0** | **28.7** | **43.1** | **$16.89** |

Three runs a side at a verified ceiling, and the totals are identical to the decimal. This is the
cleanest null result the board has produced for a generation step, and it is published as one. The
temptation with a tie is to leave it in a drawer until a number moves; a benchmark that only
publishes improvements is a scoreboard for vendors.

**The identical total hides a swap.** Repo 1 went up about a point and a half, repo 2 down about
the same. Both movements sit inside the spread of the runs that produced them — 25 to
31 here against 27 to 30 for 4.6 — so that is a direction worth testing,
not a finding. Note which distribution is wider: the tie rests on 4.7's.

**Per bug, these are nearly the same model.** On repo 1 each touched 18 distinct planted bugs with
15 shared; on repo 2, 21 against 22 with 18 shared. There is not one bug on either repo that 4.6
found on all three runs and 4.7 never found. There is exactly one the other way. Every other bug
unique to one model was a single-run hit — noise, not capability.

**What actually moves is cost, and it moves the wrong way.** $23.17 against $16.89 on the
same arithmetic, about 37% more for the same score. That comparison needed
a correction first: the grok cost reconstruction used to take the largest context in a run and
charge every request against it, which overstates any run that fans out into subagents by up to
25%. It now measures each session separately. The 4.7 row carries the corrected figure and the
other grok rows do not yet, so the row states both — the gap is about a third either way. Restating
the older rows is a separate pass.

**And what moves in 4.7's favour is off-target.** Genuine extras — real defects in the repo that
are not part of the planted set — ran 26, 35 and 34 against 16, 16 and
22: a mean of 31.7 against 18.0, roughly 76% more. The
most defensible reading of this wave is that 4.7 finds materially more real bugs than 4.6 and no
more of the ones being counted. Whether that reads as a better bug-hunter or a worse
instruction-follower is a judgment the number does not settle, and the row says so rather than
picking.

**The behavioural difference is fan-out, and it is per leg rather than per run.** 4.6 never once
ran a leg as a single session across its six; 4.7 did it four times out of six, and when it does
fan out it commits far harder — 184 and 206 inference requests against 4.6's 88 to 128. Across
these three runs fan-out tracks cost almost perfectly and score not at all. This is the class of
hidden difference the regime check exists to refuse a mean over, and that check parses Claude Code
transcripts, so it returns NOT CHECKED for every grok row here. The counts come from the CLI's own
session dirs instead, and they are on the row.

**Wall is not decidable from this wave.** Only run 1 had the machine to itself; runs 2 and 3
overlapped each other. Contention biases a wall upward, so it cannot manufacture a speed win — only
hide one. On the one uncontended run this was the fastest run at this tier the board has recorded.
Legs stayed sequential within every run throughout.


**Updated to n=4 the same evening.** A fourth run scored 29 of 105 (repo 1 12, repo 2 17), putting the four at 25, 30, 31, 29 for a mean of 28.8 against Grok 4.6's 28.7. The fourth draw was run specifically to test whether the tie was an artefact of three runs. It was not. The row was superseded to the mean of four rather than left at three, because a null result that holds on more evidence is a stronger version of the same claim, not a different one.

It did settle one thing the n=3 row had published as undecidable. Runs 2 and 3 overlapped each other, so only one of the first three had a clean wall; the fourth also ran alone. The two uncontended runs came in at 39.6 and 45.4 minutes, a mean of 42.5 against 43.1 for the three 4.6 runs. Under two minutes apart on runs of three quarters of an hour: on this benchmark the generation step is not faster, and an earlier reading that it was came from a single run.

Repo 1 is worth a second look across four runs: 12, 12, 16, 12 of 45. Three landed on the same number. That makes the odd one out look like the outlier rather than the ceiling, and it is a tighter distribution than repo 2's 13, 18, 15, 17 of 60.

## MiMo-V2.6-Pro — Xiaomi's first row (Sep 22)

First measurement of a Xiaomi model on this board. One run, Claude Code through an Anthropic-API
shim onto OpenRouter's own first-party Xiaomi endpoint, pinned with no fallback hosts. 20 of 105: 9
of 45 on repo 1, 11 of 60 on repo 2, 3 genuine extras, 56.4 minutes (contended - two other legs were
running on the same box for parts of this run, which can only inflate that figure), $0.79 real
OpenRouter bill.

**Correction, same day: the dial exists, it's just inert.** This wave originally said no effort dial
exists on this route at all, reading the endpoint's parameter list - which carries no flat
`reasoning_effort` field - as proof there was nothing to ask for. That overstated it: the list does
include `reasoning`, the field OpenRouter's own `{effort: low|medium|high}` convention uses, and the
endpoint accepts it. A direct probe (n=3 per condition, same prompt, no-field vs `effort: low` vs
`effort: high`) found reasoning-token counts that fully overlap - 738-1704 no-field, 739-997 low,
814-1023 high - with no ordering between low and high. Same failure mode already on this board for
Qwen3.8-Max: accepted, not binding. The row is labelled `default` because that's what ran, before
this probe existed - not because there was no dial to probe.

**Same real bill as GLM-5.3 Flash, seven more bugs.** Both are billed rows, not estimates, and both
land at $0.79 to the cent - GLM-5.3 Flash (OpenRouter) fixed 13, MiMo fixed 20. At the score MiMo
actually posted, its nearest neighbours cost far more: GPT-5.6 Terra (xhigh effort) and Gemini 3.8
Flash both also landed on 20, at $8.98 and $9.78.

**Not a new capability ceiling.** The board's survivor count - bugs no model here has ever fixed -
held at 33 before and after this row. Everything MiMo fixed, something else had already fixed
first. One run, labelled as one: the usual single-draw caveat applies the same as anywhere else on
this board.

Not featured - a new row joins the default view by decision, not by score (Sep 16).

## Opus 5.5 at max effort — the strongest Anthropic row, and a window you have to read first (Sep 22)

First measurement of Opus 5.5 on this board. One run, Claude Code straight onto Anthropic's own
API, max effort. **43 of 105**: 18 of 45 on repo 1, 25 of 60 on repo 2, 9 genuine extras, 68.5
minutes (contended — legs from another vendor shared the box), $60.49.

That is the strongest Anthropic result here by a wide margin. The Opus 5 sweep peaked at 27 of 105
at the same max effort, and 43 puts this row level with the best non-OpenAI rows on the board.

**Read the context window before reading the gain.** This arm ran with a 1M context window: it held
a peak of 847,590 tokens on the larger repo and crossed **zero** compaction boundaries, carrying both repos whole through every
turn. Every Opus 5 row here ran at the 200K window the harness assumes by default, and those runs
compacted repeatedly mid-task. Two variables moved at once — the model version, and how much of the
codebase the model could hold while reasoning about it. The claim this row supports is *"Opus 5.5
with a 1M window scores 43"*, not *"Opus 5.5 is 16 points better than Opus 5"*. Separating the two
needs an Opus 5 arm re-run at the larger window, which has not been done.

**The window was verified, not assumed.** Requesting 1M is not the same as getting it: an earlier
Anthropic arm on this board requested the larger window and was silently normalised back to the
default by the harness, so it measured something other than what its own config said. This time the
resolved model string was probed before any token was spent, and checked again in the running leg's
own startup record. Both say the larger window was served.

**A price correction that reaches further than this row.** Opus 5.5's published rates are $4 input,
$20 output, and $0.20 per million cache reads — a 0.05x cache multiplier, where every other model on
this board uses 0.1x. Cache reads dominate an agentic run by two orders of magnitude, so that one
factor is most of the difference. This row's cost was initially computed with Opus 5's table and came
out 2.02x too high. The corrected table reproduces the harness's own cost figure to the cent on both
legs. The same audit found the smaller version of the flaw on the published Opus 5 rows: they assume
a 5-minute cache write when the harness actually writes 1-hour caches, understating their own cost by
about 7 per cent. Long context itself carries no surcharge — the full window is priced at standard
rates.

**43 of 105, and not one new bug killed.** The survivor count — bugs no model on this board has ever
fixed — did not move. Everything Opus 5.5 fixed, something else had already fixed first. A high
score and a stationary survivor count is the same pattern MiMo showed at the other end of the
table: these rows are re-covering known ground faster, not opening new ground.

One run, labelled as one. This board has already measured a 13-point spread between two runs of a
single identical max-effort configuration, so treat 43 as one draw rather than a settled level.

## MiMo-V2.6-Flash — the cheap sibling matches the flagship (Sep 22)

Three independent runs, Claude Code through an Anthropic-API shim onto OpenRouter, run as n=3 from
the start. **23.3 of 105** mean — runs of 19, 25 and 26, spread 7. Repo 1: 8, 7, 9 of 45. Repo 2:
11, 18, 17 of 60. Mean 70.7 minutes (contended), **$0.49 per run**, a real OpenRouter bill.

**The result is the comparison, not the number.** MiMo-V2.6-Pro's mean of three, same board, same
harness, same route, is 22.7 of 105 at $0.86 a run. Flash's 23.3 is nominally higher at roughly half
the price. Both means sit inside the other's run-to-run spread, so the honest claim is **parity** —
on this benchmark Xiaomi's cheap model is not measurably worse than its flagship — not that Flash
wins.

**The parity is an average of two opposite tilts.** Flash is *weaker* than Pro on repo 1 (8, 7, 9
against 9, 7, 8) and *stronger* on repo 2 (11, 18, 17 against 11, 15, 14). A single-repo benchmark
would have ranked these two models in opposite orders depending which repo it happened to use. That
is the same lesson the July baseline opened with, now showing up between two checkpoints of one
vendor rather than between vendors.

**Flash also finds more unplanted defects than Pro** — 5, 8 and 9 genuine extras per run against
Pro's smaller counts. Those are real bugs in the repos that nobody planted, reported separately and
never folded into the score.

Effort is `default`. The reasoning dial on this route was measured inert on the *Pro* model, n=3 per
condition with fully overlapping ranges. That probe was never run on Flash, so here the dial is
untested rather than known-inert, and none of these three runs asserted a reasoning state.

Judged blind by Codex gpt-5.5 on all six legs, with no judge switching anywhere in this mean.

Not featured — a new row joins the default view by decision, not by score (Sep 16).

## The Opus 5.5 effort ladder — monotone, and that is all it is (Sep 22)

The max row above now has three siblings. Same arm definition, same day, same machine, same two
repos, same blind judge — one character different, the effort dial. Nothing else moved.

| Effort | Score | Repo 1 | Repo 2 | Wall | Cost | Repo-2 tokens |
|---|---|---|---|---|---|---|
| max | **43** / 105 | 18 / 45 | 25 / 60 | 68.5 min | $60.49 | 150.2M |
| xhigh | 35 / 105 | 16 / 45 | 19 / 60 | 43.7 min | $35.14 | 82.7M |
| high | 32 / 105 | 14 / 45 | 18 / 60 | 23.8 min | $23.03 | 46.8M |
| medium | 30 / 105 | 11 / 45 | 19 / 60 | 17.2 min | $16.55 | 33.4M |

**The dial binds, and that is worth saying out loud.** This board has caught several routes that
accept a reasoning parameter and quietly ignore it, so a first-party label is not taken on trust.
Here the evidence is mechanical: token spend on repo 2 climbs 33.4M → 46.8M → 82.7M → 150.2M, a
4.5x span, and wall climbs with it. Whatever the scores say, the setting is reaching the model and
changing how hard it works.

**But four single runs are a trend, not four levels.** Every rung is n=1. This board has already
measured a 13-point spread between two runs of one identical max-effort configuration. The largest
gap on this ladder — max over xhigh — is 8. So the *direction* is credible across four points, and
the *ordering of any two adjacent rungs is not*. Nothing here establishes that high beats medium.

**What the ladder does establish is the price of the top.** Going from medium to max costs 3.7x the
money and 4x the clock for 13 more of 105. On repo 2 alone the entire ladder spans 6 points, 18 to
25 — most of the visible gain is on repo 1, where max found 18 of 45 against medium's 11. Which
repo you benchmark on decides how much the effort dial appears to be worth.

All four rows run the 1M window with zero compactions, so they compare cleanly to *each other* and
not to the 200K Opus 5 ladder. The three lower rungs are published unfeatured; max stays featured.

## A pricing correction across fifteen Anthropic rows (Sep 22)

Not a new measurement — a correction to published ones. Anthropic charges 1.25x base input for a
five-minute prompt cache write and **2x for a one-hour** one. Claude Code writes one-hour caches.
Fifteen rows on this board had been priced at the five-minute rate.

Cache writes are a small share of an agentic run's tokens, so the error is not huge — but it is
systematic and it is one-directional. Every corrected row got **more expensive**, from 5 per cent
(Opus 5) to 32 per cent (Fable 5.1 xhigh, $40.42 → $53.61). Scores did not move; only costs did.

**How each row was checked matters more than the number.** The rate was not applied by rule.
Claude's usage records split cache creation into one-hour and five-minute buckets, so every arm was
re-read from its own stored stream and repriced only if that stream was 100 per cent one-hour. One
arm was not: it wrote 8.3 million tokens of five-minute cache and no one-hour at all, and it kept
its original rate. A blanket "Anthropic bills 2x" sweep would have overcharged it silently, and
nothing in its published row would have looked wrong.

The published CSVs still carry what the harness computed at the time — a receipt should keep saying
what the leg actually cost. The corrected list-equivalent lives in the site generator, which is
where this board already keeps list prices that went stale after a run.

One claim on the board changed with the numbers. Opus 4.8 (max effort) was described as the worst
cost-per-fix of any Anthropic row here; after the correction Fable 5 (max effort) edges past it, at
$3.88 a fix against $3.87. Both notes now say so.

## GPT-6 Sol at max effort — the newer checkpoint does not lead its own family (Sep 23)

Measured the night it shipped. One run, Codex CLI on a ChatGPT account, max effort. **32 of 105**:
18 of 45 on repo 1, 14 of 60 on repo 2, 48 genuine extras, 60.4 minutes (contended), $10.03.

GPT-6 Astra scores 48 at max and 43 at xhigh on this same benchmark. GPT-5.6 Sol scores 42 at max.
This row lands below all three — at a seventh of GPT-5.6 Sol's cost. One run cannot settle a gap
that size against a mean, but it is a large gap pointing the opposite way from the release order.

> **Corrected Sep 23.** Those three peer figures were each peer's best single run, and two of
> them had already been superseded on the board — GPT-6 Astra at max publishes 45.0 as a mean of
> three (since Sep 14) and GPT-5.6 Sol at max publishes 43.5 as a mean of two (since Sep 16); the
> Astra xhigh figure of 43 still stands. The cost multiple was wrong for the same reason. Quoting
> a peer's best draw instead of its published mean tilts every such comparison toward the row
> being written up, which is the direction a writer never notices. The generator now reads peer
> figures off the live scoreboard at publish time rather than taking them from prose. Corrected,
> the gap is 13 points to the nearest peer rather than 16 — and it widened again at n=3.

**It killed an all-time survivor.** Repo-1 bug A6 had outlived every model in every scored run
on this board. It is a settings-persistence ordering defect: a preference was written to storage
*before* the change it described had actually taken effect, so a switch that failed — or a
restart the user dismissed — left the saved value and the running session disagreeing. The
survivor count goes 32 → 31. A row in the middle of the scoring table opened ground nothing
above it had touched. As always: a survivor kill is a variance event, not a capability a model
repeats on demand.

**48 genuine extras is the part that doesn't fit the score.** Those are real defects in the repos
that nobody planted, and that count is near the top of the board — from a row in the middle of the
scoring table. Extras are reported separately and never folded in. A model flagging this many
unplanted problems while fixing fewer planted ones is spending its attention somewhere the planted
total can't see.

**One caveat is structural and can't be engineered away.** The Codex build every other OpenAI row
here uses refuses this model outright — it is not supported on a ChatGPT account on that version.
A newer build runs it on the same account, same auth, same machine, so the blocker was the client,
not entitlement. There was no version of this measurement that held the harness fixed against the
other OpenAI rows: a one-version harness delta, or no row at all.

**And two earlier attempts at this row were void, for a reason worth publishing.** The arm was
first pointed at npm's launcher shim rather than the real executable. On Windows that shim is a
`.cmd`, running a `.cmd` makes the shell re-parse the whole argument list, and *a newline ends the
command*. The model received the prompt's first line — the repo description — and none of the
numbered instructions. Both legs launched, billed, and exited zero. One edited code and wrote no
report it had never been asked for; the other replied asking what to work on. Nothing in either
leg's output said the prompt had been cut. Those rows are kept in the ledger, voided and labelled,
and the harness now refuses a shim outright.

That is the failure mode worth carrying away from this row: a benchmark can be silently asking a
different question than the one it prints, and every guardrail — exit code, token spend, wall time,
a repo full of edits — can agree that nothing went wrong.

## The Opus 5.5 effort ladder at n=3 — the dial resolves at the top and not at the bottom (Sep 23)

The four single runs above are now four means of three. Twelve runs, twenty-four legs, every one
of them clean, every replicate byte-identical to its original but for the arm name — same model
string, same effort, same timeout, same price table, same blind judge. Published rung by rung as
each landed, so the board never sat on a number that had been measured but not shown.

| Effort | Score | Runs | Spread | Repo 1 | Repo 2 | Wall | Cost |
|---|---|---|---|---|---|---|---|
| max | **41.7** / 105 | 39, 43, 43 | 4 | 19.0 / 45 | 22.7 / 60 | 66.9 min | $58.53 |
| xhigh | 36.0 / 105 | 35, 36, 37 | 2 | 17.0 / 45 | 19.0 / 60 | 42.5 min | $34.98 |
| high | 31.7 / 105 | 31, 32, 32 | 1 | 13.0 / 45 | 18.7 / 60 | 23.9 min | $22.25 |
| medium | 30.3 / 105 | 30, 30, 31 | 1 | 12.7 / 45 | 17.7 / 60 | 17.0 min | $15.68 |

**The ordering survived replication at the top, and it still does not exist at the bottom.** The
n=1 note said the direction was credible across four points but the ordering of any two adjacent
rungs was not, and that nothing on it established that high beats medium. Three runs a rung changes
the first half of that sentence and leaves the second half standing. xhigh over high is 4.3 points
against spreads of 2 and 1; max over xhigh is 5.7 against 4 and 2. Both gaps are now wider than the
variation seen within either rung. **High over medium is 1.4 points against spreads of 1 and 1** —
one bug of 105, from configurations whose own runs move by that much. After twelve runs those two
rungs are still not separated, and the honest reading is that the bottom of this dial does very
little while costing about 40 per cent more.

**Spread widens as effort rises, which is the opposite of what the other replicated ladders do.**
1, 1, 2, 4 going up. The two other effort dials measured three times a rung on this board move
10, 7, 5, 6 and 9, 6, 3, 9, 2 — no pattern either way. Opus 5.5's is clean and monotone, and the
mechanism is not mysterious: the top rung is the one with room to make different choices. It is
still four points estimated from three draws each, so it is a shape worth watching rather than a
finding. The board's variance caveat now counts twenty-five three-run configurations and derives
every number in that sentence, including this one.

**The price of the top, restated on means.** medium to max is 3.7x the money and 3.9x the clock for
11.4 more of 105. Nothing about that changed from the single-run reading — the gain was never in
doubt, only whether the rungs beneath it were distinguishable from each other.

One thing the means hand back that single runs hid: **the highest extras counts sit at the bottom
of the ladder, not the top.** medium and xhigh each average 13.3 genuine unplanted defects against
max's 9.0. Extras are reported separately and never folded into the score, but a cheaper setting
that surfaces more real bugs nobody planted is not obviously the weaker tool for a first pass.

All twelve runs hold the 1M window with zero compactions, so this ladder compares cleanly to itself
and not to the 200K Opus 5 ladder. max keeps the featured slot; the other three stay unfeatured.

## A correction to the variance caveat — it was counting 28 replications where 21 existed (Sep 23)

Not a measurement. The site's standing caveat about run-to-run variance reports how many
configurations have been run three times at identical settings and what their ranges were. It was
derived from the published mean rows rather than typed, which was the right instinct and the wrong
set: it walked **every** mean row, including a mean-of-2 that a mean-of-3 later replaced and the
mean-of-4 and mean-of-5 that replaced a mean-of-3. So it said 28 configurations had been run three
times when 21 had, quoted two-run and five-run spreads inside a list of "three-run ranges", and
counted a configuration twice wherever it had a supersession trail.

Two further numbers in the same paragraph were typed and had gone stale: a claim about one
replicated effort dial, when two had been replicated by then, and "only one model has been measured
three times at its top setting", which six had. All three are computed from the receipts now.

The bug surfaced by crashing the build — the first replicate pair that scored identically sorted to
the end of the list, where the sentence reaches for a third run that a two-run group does not have.
It had been quietly miscounting for weeks before it ever failed loudly. The count on the live board
is 25 as of this wave.

## Opus 5.5 gets a fifth rung, and the dead spot is not where twelve runs suggested (Sep 23)

The ladder above stopped at medium because medium was the bottom of the dial we had measured. It
was not the bottom of the dial. A `low` rung, three runs like the rest:

| Effort | Score | Runs | Spread | Wall | Cost | Gap to rung below |
|---|---|---|---|---|---|---|
| max | **41.7** / 105 | 39, 43, 43 | 4 | 66.9 min | $58.53 | +5.7 |
| xhigh | 36.0 / 105 | 35, 36, 37 | 2 | 42.5 min | $34.98 | +4.3 |
| high | 31.7 / 105 | 31, 32, 32 | 1 | 23.9 min | $22.25 | +1.4 |
| medium | 30.3 / 105 | 30, 30, 31 | 1 | 17.0 min | $15.68 | +8.0 |
| low | 22.3 / 105 | 19, 23, 25 | 6 | 11.5 min | $8.34 | — |

**The earlier reading was wrong in an instructive way.** Four rungs said the dial resolves at the
top and not at the bottom, because the only unresolved pair was the lowest one measured. Add a rung
beneath it and medium-to-low turns out to be the LARGEST step on the whole ladder - 8.0 points of
105, against per-rung spreads of 1 and 6. The dial is not weak at the bottom. There is one dead rung
in the middle of a working dial, and it is `high`: 1.4 points over medium for 42 per cent more money
and 41 per cent more clock, from two configurations whose own three runs span 1 point each. Every
other adjacent step on this ladder is 4.3 or more.

**Spread does not track effort, and the four-rung shape that suggested it was an artefact of where
the ladder was cut.** At four rungs the spreads read 1, 1, 2, 4 going up, which is clean and
monotone and was worth about one sentence of caution. The fifth rung reads 6 - the widest on the
ladder - and the shape becomes 6, 1, 1, 2, 4. Both ends of the dial are noisy and the middle is
stable. Three draws a rung is a very noisy estimate of spread and this is what that looks like from
the inside: a monotone pattern across four points that a fifth point destroys.

**One run would have got the direction right and the size wrong.** low's first draw was 23, two
points above the eventual mean of 22.3 - and its three runs span 19 to 25, so a single draw could
have put this rung anywhere from 8 above max's worst run to level with it. The rung's own first-run
note has been superseded, but it said the same thing the mean says. That is not always how it goes.

Wall figures on this rung are contended - it ran alongside another vendor's legs on purpose, to get
measured sooner - while the four rungs above it were measured on an otherwise idle machine.
Contention can only inflate a wall, and low still came in fastest at 11.5 minutes, so the ordering
is safe in the direction that matters. Token spend, which contention cannot touch, is the figure
that shows the effort flag reaching the model at all.

## GPT-6 Sol at n=3 — 29.3, and every draw came in lower (Sep 23)

Three byte-identical runs of the configuration published the night the model shipped. Same model
string, same effort, same timeout, same pinned executable, same price table, same blind judge — only
the arm name differs, so everything below is run-to-run variance and nothing else.

| Run | Score | Repo 1 | Repo 2 | Extras | Wall | Cost |
|---|---|---|---|---|---|---|
| 1 | 32 / 105 | 18 / 45 | 14 / 60 | 48 | 60.4 min | $10.03 |
| 2 | 30 / 105 | 16 / 45 | 14 / 60 | 34 | 58.2 min | $8.17 |
| 3 | 26 / 105 | 12 / 45 | 14 / 60 | 42 | 71.6 min | $9.81 |
| **mean of 3** | **29.3 / 105** | 15.3 | 14.0 | 41.3 | 63.4 min | $9.33 |

**The published single run was the top of its own distribution.** 32 was the highest of the three
draws, not the centre. The row now reads 29.3 and the gap to its own family got wider, not
narrower: GPT-6 Astra publishes 45.0 at max (mean of 3) and 43 at xhigh, and GPT-5.6 Sol — the
older checkpoint carrying the same name — publishes 43.5 at max (mean of 2). This row lands 13.7
points below the nearest of them, at a tenth of GPT-5.6 Sol's cost. The conclusion the one-run
entry reached survives replication. Its size did not.

**Do not read the 32 → 30 → 26 sequence as a trend.** Three draws in run order look like a decline
and there is no mechanism that would produce one — identical configuration, no shared state between
legs, no warm-up. A spread of 6 over three draws is the finding; the ordering inside it is the sort
of pattern that three points will produce by chance about as often as not. It is recorded because
it is what happened, not because it means anything.

**Repo 2 returned 14 of 60 three times, and it was not the same 14.** That column looks like the
most deterministic result on the board until you open the verdicts: thirteen bugs were fixed in all
three runs, and the fourteenth was a swap — run 1 fixed one defect the other two missed, runs 2 and
3 fixed a different one run 1 missed. An identical total three times running hid a real difference
in what the model actually did. Repo 1 has no such illusion: 18, 16, 12, with eleven bugs fixed
every time, nineteen fixed at least once, and three fixed by exactly one run out of three. All of
this row's variance is in repo 1 — which is also the repo where its single survivor kill happened.

**The survivor kill stands, and it was a one-run event.** Run 1 fixed repo-1 bug A6, which no
scored pass by any model on this board had ever fixed. Neither replicate touched it. That is the
honest shape of a survivor kill: a real result that the model does not repeat on demand, which is
exactly why the board reports them as events and not as capability.

**Extras stay high and stay unstable.** 48, 34, 42 genuine extras — unplanted defects the model
found in repos it was asked to fix something else in. The mean of 41.3 is near the top of the board
from a row in the middle of the scoring table, and the spread of 14 across identical runs says the
count is a draw too. Extras are reported separately and never folded into the score. Whatever this
model is spending attention on, the planted total cannot see it.

The structural caveat from the first entry is unchanged and cannot be engineered away: this row
runs a Codex build one version newer than every other OpenAI row here, because the build the others
use refuses this model on a ChatGPT account. The GPT-6 Sol rungs compare cleanly to each other; the
comparison to other OpenAI rows carries a one-version harness delta. Cost is a list-rate estimate
and a floor — the long-context surcharge is not modelled. Wall figures are contended.

## The judge id in six notes was the one we asked for, not the one that answered (Sep 23)

Fourteen scoring legs run on Sep 22 and Sep 23 asked the grok judge bridge for `grok-4.5`. Thirteen
of them were answered by **grok-4.7**. The receipts recorded both ids the whole time — every scoring
run writes `judge_model` (what was requested) and `judge_model_served` (what replied) — and the
scoring harness printed a warning on each affected run. Six published rows said grok-4.5 anyway,
because the judge id was a string literal in the publish script instead of a value read back from
the run.

Corrected on the board now, with no re-scoring: **GPT-6 Sol (max)** single run and its means of 2
and 3, **GPT-5.6 Luna (max)** means of 2 and 3, and **MiMo-V2.6-Pro** mean of 3. No verdict, score,
spread or cost changes — the judging that happened is the judging that happened; only the label on
it was wrong.

**The blind-judge rule was not broken.** Every affected arm is an OpenAI or a Xiaomi model, so an
xAI judge was a valid non-sibling either way. Had the substitution gone the other direction — a grok
arm silently drawing a grok judge — it would have invalidated the runs rather than mislabelled them.
That is the version of this that was worth being afraid of, and the reason it is worth saying out
loud that the id in a note was never being checked against the id in the receipt.

**This board had already learned this lesson once, which is the part worth publishing.** On Sep 4 a
deliberate probe found the bridge's model flag inert: `grok-4.5`, `grok-4.6` and a model string
invented on the spot all came back as grok-4.6. `judge_model_served` exists **because** of that
probe. The GPT-5.6 Sol mean-of-2 note on this board has said since Sep 13 that its July judging
pass "recorded a REQUEST as though it were a fact." Five weeks later a new publish script did the
identical thing, with the field it needed already sitting in the file it was reading. A finding
written into prose does not propagate to the next script that needs it.

So the fix is a gate rather than six corrections. `judge_gate()` now runs inside both publish paths
and **refuses to publish a row whose note names a judge its own receipts do not record**. It is
deliberately narrow: it looks only at sentences about judging, and only at ones that name a specific
checkpoint. A note that says "blind Codex judge" with no version claims nothing and passes — most of
the older board reads that way. A note that says grok-4.5 when the receipt says grok-4.7 cannot
ship. The id itself now comes from `judge_sentence()`, which reads it back per leg and names the
split when the legs disagree, which on this board they now do:
`GPT-6 Sol (max) - mean of 3` was judged by grok-4.7 on five of its six legs and grok-4.5 on the
sixth. A single identical request returned different checkpoints on the same day.

**What cannot be corrected, stated plainly.** Receipts written before Sep 4 carry no served-model
field at all. Rows resting on them name the judge that was *requested*, and this board cannot prove
which checkpoint replied. They are not being relabelled on a guess. Read any pre-September judge
attribution here as a request, not a measurement — including the ones that say grok-4.5.

## The GPT-6 Sol effort ladder — the dial works, so the score is the model (Sep 23)

GPT-6 Sol published at max and landed below every GPT-6 Astra row on this board, which invited one
obvious objection: maybe the effort flag never reached it. Four more rungs answer that. One run
each below max; max is the mean of three.

| Effort | Score | Repo 1 | Repo 2 | Extras | Wall | Cost |
|---|---|---|---|---|---|---|
| max (n=3) | **29.3** / 105 | 15.3 / 45 | 14.0 / 60 | 41.3 | 63.4 min | $9.33 |
| xhigh | 25 / 105 | 10 / 45 | 15 / 60 | 24 | 51.4 min | $7.67 |
| high | 20 / 105 | 10 / 45 | 10 / 60 | 15 | 33.9 min | $4.16 |
| medium | 14 / 105 | 3 / 45 | 11 / 60 | 13 | 24.5 min | $2.39 |
| low | 6 / 105 | 3 / 45 | 3 / 60 | 5 | 11.1 min | $1.08 |

**The dial is live and it is the steepest on this board.** Max scores nearly five times low, and
wall and cost scale with it end to end — 11 minutes and $1.08 at the bottom, 63 minutes and $9.33 at
the top. Whatever is wrong with this checkpoint's score, a flag that never arrived is not it. The
objection is closed: GPT-6 Sol sits below GPT-6 Astra because of the model, not the configuration.

**Its own family disagrees about what an effort dial is for.** All three OpenAI ladders on this
board now have five rungs:

| Effort | GPT-6 Astra | GPT-6 Sol | GPT-5.6 Luna |
|---|---|---|---|
| max | 45.0 (n=3) | 29.3 (n=3) | 31.3 (n=3) |
| xhigh | 43 | 25 | 23 |
| high | 35 | 20 | 13 |
| medium | 34 | 14 | 9 |
| low | 27 | 6 | 4 |
| max ÷ low | **1.7x** | **4.9x** | **7.8x** |

Astra's dial barely moves at the top (45 to 43) and its floor is high: 27 of 105 at its cheapest
setting, which is most of the way to Sol's best. Sol and Luna fall off a cliff instead. A buyer
reading only the max row of each would conclude these are three points on one quality scale; the
ladders say Astra is a model you can run cheaply and the other two are not.

**The clean ladder is repo 1 plus noise.** Repo 2 is not monotone — xhigh's 15 of 60 beats max's 14,
and medium's 11 beats high's 10 — while repo 1 falls 15.3, 10, 10, 3, 3. Every rung below max is a
single draw, and this board has measured a 13-point spread between two runs of one identical
configuration, so read the individual steps as noisy even where the overall slope is not. The
slope is the finding; the rung-to-rung gaps are not.

**The unplanted-defect count is an effort behaviour, not a property of the model.** Sol's genuine
extras run 41.3 at max down to 5 at low. That slope is not special to it — Astra goes 55 to 25 and
Luna 54.7 to 1 — which is worth saying because Sol's first note leaned on its extras count as
something distinctive. At max it is in fact *below* both of them. What is unusual about Sol is the
ratio, not the count: it finds roughly as many unplanted defects as models that fix twice as many
planted ones.

**Correction, same day: the wall figures on the four lower rungs are cleaner than they were
published as.** Each of those rows first went out saying its run had shared the laptop with
another vendor's legs. It had not - all eight legs recorded no peer at all. The claim was a
literal copied from a publish script, and it is the wrong direction to be wrong in: contention can
only inflate a wall, so a note that says "contended" tells a reader to discount the very column
that shows the effort dial reaching the model. The rung walls above (11, 24, 34, 51 minutes) are
uncontended measurements. The max row is the mixed one - three of its six legs did share the
machine - so if anything the 63-minute figure at the top is the generous one, and the slope is
real either way. The board now derives that sentence from each leg's own receipt instead of
carrying it as text, and refuses to publish a note that claims a shared machine when no leg
recorded a peer.

Every rung runs a Codex build one version newer than the rest of the board's OpenAI rows, because
the build the others use refuses this model on a ChatGPT account — so the five rungs compare
cleanly to each other and carry a one-version harness delta against everything else. Costs are
list-rate estimates and floors. Judged by grok-4.7, blinded, with the id read from each scoring
receipt rather than the judge config.

## GPT-6 Luna — the cheap end of the family (Sep 23)

GPT-6 Luna joins the board at max effort, then goes to three runs, then gets the same five-rung
effort sweep the other OpenAI ladders have. It is on here for one reason: **list price is a
twentieth of GPT-6 Sol's on both sides of the meter** — $0.10 in and $0.50 out per million against
Sol's $2 and $10. The question is not whether it wins. It is how much of a family's score survives
a 20x price cut, which is the question a buyer actually has and the one a leaderboard sorted by
score alone never answers.

The comparison it is being measured against, as published here today: GPT-6 Astra 45.0 (n=3), GPT-6
Sol 29.3 (n=3), and its own direct predecessor GPT-5.6 Luna 31.3 (n=3).

**The answer is 62% of GPT-6 Sol's score — and less than two-thirds of what this same tier scored a
generation ago.** Max is the mean of three runs; every rung below it is a single draw.

| Effort | Score | Repo 1 | Repo 2 | Extras | Wall | Cost |
|---|---|---|---|---|---|---|
| max (n=3) | **18.3** / 105 | 6.3 / 45 | 12.0 / 60 | 22.7 | 99.2 min | $0.52 |
| xhigh | 14 / 105 | 4 / 45 | 10 / 60 | 12 | 57.0 min | $0.39 |
| high | 9 / 105 | 2 / 45 | 7 / 60 | 9 | 24.4 min | $0.13 |
| medium | 4 / 105 | 2 / 45 | 2 / 60 | 0 | 8.6 min | $0.06 |
| low | 4 / 105 | 1 / 45 | 3 / 60 | 9 | 19.3 min | $0.20 |

The three runs at max were **17, 21 and 17** — a four-point spread around the mean, which is why the
featured row is the mean and not the first number that came in.

**The dial reaches this model for three rungs, then hits a floor.** 18.3 → 14 → 9 is a clean slope,
so the objection that had to be closed for GPT-6 Sol — maybe the effort flag never arrived — closes
here too. But medium and low both land on **4 of 105**, and they do not agree on which four: medium
fixed 2 and 2 across the two repos, low fixed 1 and 3. The bottom of this ladder is a floor rather
than a slope, and the two rows tie by coincidence, not by finding the same bugs.

**Turning the dial below medium costs three times as much for the same score.** Low ran $0.20
against medium's $0.06, 19.3 minutes against 8.6, and 15.2M input tokens against 2.8M. Both legs
were clean — health checks passed on the first attempt, both wrote reports, both exited 0 — so this
is the model's behaviour, not a harness artefact. The reasoning budget does fall exactly as
advertised: 12.1K reasoning tokens at high, 3.1K at medium, **zero** at low. What rises instead is
turn count. Low emitted 2.6x medium's output tokens and read 5.5x the input, roughly 97% of it cache
hits — the shape of a model going around the same context repeatedly without thinking between
passes. It is not nothing: low returned **9 genuine unplanted defects against medium's 0**. It just
did not convert any of that into planted fixes. GPT-6 Sol's ladder does not behave this way; its
meter tracked its dial end to end, $1.08 at the bottom to $9.33 at the top.

**Every GPT-6 tier with a GPT-5.6 counterpart scores at or below it on this benchmark — lower at
seven of the eight rungs where both were measured, level at the eighth.** Not one checkpoint, and
not only the cheap end:

| Effort | GPT-5.6 Sol → GPT-6 Sol | GPT-5.6 Luna → GPT-6 Luna |
|---|---|---|
| max | 43.5 (n=2) → 29.3 (n=3), **−33%** | 31.3 (n=3) → 18.3 (n=3), **−42%** |
| xhigh | 39 → 25, **−36%** | 23 → 14, **−39%** |
| high | not published | 13 → 9, **−31%** |
| medium | 29 → 14, **−52%** | 9 → 4, **−56%** |
| low | not published | 4 → 4, level |

GPT-6 Astra is the exception, and the reason the pattern is easy to miss: it leads this board at 45.0
and has no GPT-5.6 counterpart to be measured against — it is the tier the generation *added*, not a
tier the generation improved. Read the release whole and the new top model beats everything before
it while both carried-over tiers went backwards.

Two caveats, both unmodelled. Every GPT-6 row runs a Codex build one version newer than every
GPT-5.6 row, because the older build refuses these models on a ChatGPT account — so the generational
deltas above carry a harness difference this board cannot separate out. And apart from the four
means, every figure in them is a single draw of a configuration this board has watched swing 13
points between identical runs. The direction is consistent across all eight rungs; the size of any
one step is not a measurement.

**Twenty times cheaper does not make it the cheapest way to find a bug here.** At $0.52 for a
mean-of-three max run this is the cheapest OpenAI row on the board by a wide margin, and the
price-per-token claim holds up end to end. It is still not the efficient choice: DeepSeek V4.1 Flash
at high effort fixes 19 for $0.31, and MiMo-V2.6-Flash averages 23.3 over three runs for $0.50 —
both above GPT-6 Luna's ceiling, for the same money or less. Dollars-per-bug flatters low scores, so
it is only worth reading between rows in the same band; in that band the cheap seats were already
taken, and taken by open weights.

**Existence was proved positively, not inferred from a rejection.** The slug appears in the
account's own model list and the pinned CLI accepted it and answered. That distinction is load
bearing on this board: the CLI returns *"The &lt;slug&gt; model is not supported when using Codex
with a ChatGPT account"* word for word for a deliberately fake slug, so a rejection is evidence
about the client and never about whether a model exists. By that same test **GPT-6 Terra does not
exist as of this date** — the slug is absent from the model list, and the rejection it returns is
byte-identical to the fake one's.

Like the GPT-6 Sol rows, every Luna row runs a Codex build one version newer than the rest of the
board's OpenAI rows, because the build the others use refuses these models on a ChatGPT account.
The two GPT-6 ladders therefore compare cleanly to each other and carry a one-version harness delta
against everything else. Costs are list-rate estimates and floors — the long-context surcharge
above 272K input is not modelled. Judged by a blind grok checkpoint, with the id read from each
scoring receipt rather than the judge config.
