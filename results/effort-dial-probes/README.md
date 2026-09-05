# effort-dial-probes/ — the reasoning-effort dial receipts

Rule: file the probe output with the arm. Until 2026-08-06 that output was not retained, so every verdict
evaporated and the next run re-bought it. Probe results land here now: one file per model × serving path, dated.

This folder is the SOURCE. It is published to `results/effort-dial-probes/` in phuryn/bug-hunt-bench by the
go-live step (`bench_publish.publish_probes`), which rewrites machine paths and lab-notebook asides on the way; the
public copy is never edited by hand. Raw CLI output can be dropped here as-is.

**The dial is per-SERVING-PATH, not per-model.** Same model, two gateways, opposite verdicts —
see grok-4.5 below.

| Date | Model | Serving path | Verdict | File |
|---|---|---|---|---|
| 2026-09-04 | gpt-6-astra | Codex CLI 0.153.0 (`model_reasoning_effort=max\|xhigh\|high\|medium`) | **ACCEPTED** — each tier requested explicitly and echoed back in the CLI's own session header (`reasoning effort: <tier>`) before the leg started; a documented first-party enum, not probed for magnitude → rows are `first_party` | `20260903-gpt6astra-codex-effort-max.txt`, `20260904-gpt6astra-codex-effort-{xhigh,high,medium}.txt` |
| 2026-09-04 | grok-4.6 (judge lane) | Grok CLI over ACP, `-m` flag | **`-m` is INERT** — a nonexistent model id neither errors nor changes what runs; the served modelId is now recorded per verdict (`judge_model_served`) | `20260904-grok-acp-model-flag-inert.txt` |
| 2026-09-02 | gemini-3.8-flash | Antigravity CLI `agy` 1.1.22 (slugs `gemini-3.8-flash-{low,medium,high}`) | **ACTIVE, `high` is a verified ceiling** — disjoint ranges 0–70 / 91–131 / 151–367 thinking-tok (n=3), monotonic; `--effort max` rejected outright, so no silent clamp is possible | `20260902-gemini38flash-agy.md` |
| 2026-09-01 | claude-fable-5-1 | Claude Code CLI 2.1.251 | **not an effort probe — context-window honesty.** The CLI assumes 200K for a model it does not know and would autocompact ~5× early; the `[1m]` suffix fixes it. `--effort high` is a documented first-party enum → `first_party` | `20260901-fable51-claude-code-context-window.txt` |
| 2026-08-27 | grok-4.6 | Grok CLI 1.0.5 over ACP, zero-token readback | **ACTIVE echo** — `low` requested → `low` served | `20260827-grok46-low-acp-readback.{md,json}` |
| 2026-08-14 | grok-4.6 | Grok CLI 1.0.3 over ACP, zero-token readback | **ACTIVE echo** — `medium` requested → `medium` served | `20260814-grok46-medium-acp-readback.{md,json}` |
| 2026-08-12 | grok-4.6 | Grok CLI 1.0.3 over ACP, zero-token readback | **`xhigh` is the ceiling and echoes back**; `x-high`, `max` and `bogus_zzz` silently clamp to `high` | `20260812-grok46-acp-readback.{md,json}` |
| 2026-08-25 | gemini-3.7-flash | Antigravity CLI `agy` 1.1.20 (slug `gemini-3.7-flash-{low,high}`) | **ACTIVE** — low 874–1044 / high 3324–4799 thinking-tok (n=3), non-overlapping, ~4x; CLI's own meter, no wire readback possible | `20260825-gemini37flash-agy.md` |
| 2026-08-25 | z-ai/glm-5.3 | OpenRouter (Z.AI) | **INERT** — ranges nest completely (none 3,710–20,918 / low 1,192–20,834 / high 2,130–16,739 thinking-tok, n=4), within-level spread **17.5x** against 2.0x between, and the order is INVERTED (`high` reasons least). Asked for max effort; there is no max to ask for. | `20260825-glm53-openrouter.txt` |
| 2026-08-24 | gemini-3.7-flash | Google first-party (`thinkingLevel`) | **ACTIVE** — low 1721–2352 / medium 3489–4076 / high 6482–7438 thoughts-tok (n=5), non-overlapping + monotonic, within-level ≤1.37x; **`xhigh`/`max` rejected, HTTP 400**; no-param default = medium | `20260824-gemini37flash-google-api.txt` |
| 2026-08-24 | gemini-3.7-flash | Gemini CLI 0.56.0 → a local rewriting gateway → Google | **READBACK** — every call carries `thinkingLevel=high` and Google answers `modelVersion=gemini-3.7-flash`; **without the proxy the CLI silently serves gemini-3.5-flash** for any unknown `*-flash` id | `20260824-gemini37flash-gemini-cli-readback.md` |
| 2026-08-24 | gemini-3.7-flash | OpenRouter `google/gemini-3.7-flash` (Anthropic-format path) | accepts `bogus_zzz` with HTTP 200 (no validation); thinking tokens flat on a trivial prompt (162/157/110/126 for low/high/xhigh/bogus) — not run as an arm | not filed separately |
| 2026-08-06 | grok-4.5 | xAI first-party | **ACTIVE** (low separates); **`max` rejected, HTTP 400** | `20260806-grok45-xai.txt` |
| 2026-08-06 | grok-4.5 | OpenRouter `x-ai/grok-4.5` | **INERT** — accepts every string incl. `max`, no measurable effect | `20260806-grok45-openrouter-*.txt` |
| 2026-08-04 | deepseek-v4-flash-0731 | OpenRouter | INERT (1.06x) — killed the commissioned max arm | `20260807-deepseek-v4-flash-0731-openrouter.log` (+ the probe script used, `.py`) |
| 2026-08-03 | qwen3.8-max | DashScope Anthropic gateway | ACTIVE (~10x) | not retained |

## Reading a probe: the between-level number means nothing on its own

grok-4.5 on OpenRouter is the worked example. Between-level ratio 1.49x looks like a mild dial
until you look at the samples:

```
low  [11149, 20161, 15027, 14429, 7891, 6101]   mean=12460   within-level 3.30x
max  [27509, 18232, 33447, 10956, 14821,  6754] mean=18620   within-level 4.95x
```

The ranges nest — `max`'s smallest sample (6754) sits below `low`'s median. Mann-Whitney U = 12
(n=6,6), p ≈ 0.39: no detectable effect. A 5-level sweep on the same path (n=3) was worse than
useless — it ordered `low` **below** `none` and `high` **below** `medium`.

Now the same model first-party, where the dial does bind:

```
none   [31047, 25814, 27858, 22064,  8448]  mean=23046
low    [ 6670, 12015,  1815,  4938, 13097]  mean= 7707
medium [24064, 23574, 30637, 15886, 21078]  mean=23048
high   [44819, 36358, 14507, 26419, 12435]  mean=26908
```

`low` vs `medium` do not overlap at all (low tops at 13097, medium bottoms at 15886) — U = 0,
p ≈ 0.008. `low` vs `high`: U = 1, p ≈ 0.016. `medium` vs `high` are indistinguishable at n=5,
and `none` lands on `medium`'s mean to within 2 tokens, so **the default is medium**.

Test to apply, in order:

1. Does the path **reject** an unsupported level? A 400 is the cleanest possible verdict.
2. Do the sample **ranges** separate, or just the means? Ranges. Means hide everything.
3. Is the ordering monotonic across levels? Non-monotonic = you are reading noise.
4. Only then quote a ratio.

n=3 does not clear a 3-5x within-level spread. The tool now defaults to n=5; use more for a
close call.

## Probe hygiene

Reasoning-heavy calls run 150-800s and a non-streaming request over that long gets its connection
dropped mid-flight — the first grok-4.5 pass lost 3 of 3 `high` samples and 2 of 3 `medium`
samples that way (`20260806-grok45-xai-v1-nonstreaming.txt`, kept as the receipt). Silent sample
loss reads exactly like a model that will not answer. The effort probe streams and retries
transport failures now; HTTP errors are never retried, because an unsupported level is a finding.
