# Gemini 3.7 Flash in Antigravity CLI (`agy` 1.1.20) — effort dial, 2026-08-25

Effort is baked into agy's model slugs (`gemini-3.7-flash-low|medium|high`) and `--effort` exists as well.
Probe: the standard tiling prompt (the effort probe's DEFAULT_PROMPT), `agy -p ... --output-format json`,
`usage.thinking_tokens` from the CLI's own accounting, n=3 per slug.

| slug | thinking tokens | output tokens (incl. thinking) | wall s |
|---|---|---|---|
| gemini-3.7-flash-low | 1002, 1044, 874 | 2987, 2513, 3135 | 16.4, 15.9, 21.9 |
| gemini-3.7-flash-high | 3324, 4086, 4799 | 8004, 6785, 7881 | 40.2, 26.9, 38.7 |

**Verdict: ACTIVE.** Ranges do not overlap (low tops at 1,044; high bottoms at 3,324), ~4x between means.
Same shape as the first-party API probe on 2026-08-24 (low 1.7–2.4K / high 6.5–7.4K on the raw API; agy's
counts are lower because its system prompt and tool surface differ). `high` is the top slug agy offers for
3.7 Flash, so the arm label is honest. No wire readback is possible for agy (it talks to Google's cloudcode
backend, not the public API); this is the CLI's own meter, the same trust level as Codex/grok reporting theirs.
