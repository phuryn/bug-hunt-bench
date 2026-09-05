# Gemini 3.8 Flash in Antigravity CLI (`agy` 1.1.22) — effort dial, 2026-09-02

**VERDICT: ACTIVE, and `high` is a genuine ceiling.**

Same method as the 3.7 Flash / agy probe of 2026-08-25 so the two are comparable: the standard
tiling prompt (the effort probe's DEFAULT_PROMPT), `agy -p ... --output-format json`, and the CLI's
own `usage.thinking_tokens`. n=3 per slug, all three slugs.

| slug | thinking tokens | range | output tokens (incl. thinking) | wall s |
|---|---|---|---|---|
| gemini-3.8-flash-low | 70, 0, 0 | **0–70** | 1109, 977, 1096 | 8.6, 7.6, 8.2 |
| gemini-3.8-flash-medium | 91, 131, 131 | **91–131** | 1060, 206, 1552 | 7.9, 5.6, 9.6 |
| gemini-3.8-flash-high | 201, 151, 367 | **151–367** | 1279, 219, 440 | 9.6, 6.0, 6.5 |

**Reading it.** All three ranges are disjoint — low tops at 70, medium starts at 91; medium tops at
131, high starts at 151 — and the means are monotonic (23 / 118 / 240). Non-overlapping ranges are
the test this board uses, so the dial is ACTIVE across all three levels.

**A trap in the arithmetic, recorded so it is not repeated.** The automated ratio check reported
INCONCLUSIVE for this data. That is an artifact, not a finding: two `low` samples returned exactly
**0** thinking tokens, so the within-level spread `max/min` divided by zero and came out infinite,
which no between-level ratio can ever clear. Whenever a level can legitimately produce zero, the
ratio test is undefined and the range test is the only valid one. The ranges here are clean.

**Scale changed between generations.** 3.7 Flash on the identical prompt and harness produced
874–1,044 thinking tokens at low and 3,324–4,799 at high. 3.8 Flash produces 0–70 and 151–367 — an
order of magnitude less thinking at every tier. The dial still separates; it separates over a much
smaller absolute budget. Do not compare 3.7 and 3.8 thinking counts as if they were the same meter.

**Ceiling is real and cannot silently clamp.** `agy models` lists exactly three slugs for this model
— `gemini-3.8-flash-low|medium|high` — and there is no `max`. Asking for one is rejected outright:

    $ agy -p ... --model gemini-3.8-flash-high --effort max
    ERROR: invalid model selection (--model "gemini-3.8-flash-high" --effort "max"):
           invalid --effort "max" (valid: low, medium, high)

Control at the same moment: `--effort high` returned SUCCESS. So the CLI validates loudly and cannot
serve a lower tier while reporting a higher one — unlike the Grok 4.5 CLI, whose silent clamp forced
a published correction on this board.

**Bench label:** `effort="high"`, `effort_status="verified_ceiling"`, `ceiling=True`. The dial is
separated on this serving path (verified) and `high` is the top tier offered (ceiling).

No wire readback is possible for agy — it talks to Google's cloudcode backend, not the public API —
so these are the CLI's own meter, the same trust level as Codex or grok reporting theirs.
