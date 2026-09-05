# 2026-08-12 — grok-4.6 ACP zero-token effort readback (CLI grok 1.0.3)

Method: identical to the 2026-08-01 grok45max probe — spawn
`grok agent --reasoning-effort <e> -m grok-4.6 stdio`, initialize, session/new,
read back models._meta.reasoningEffort + x.ai/sessionConfig selected mode.
No session/prompt sent = zero tokens. Raw: 20260812-grok46-acp-readback.json

requested='xhigh'     -> activeEffort='xhigh'  (VALID — echoes back)
requested='x-high'    -> activeEffort='high'   (SILENT CLAMP — hyphenated spelling is WRONG)
requested='max'       -> activeEffort='high'   (silent clamp, same as 4.5)
requested='bogus_zzz' -> activeEffort='high'   (CLI still validates nothing)
requested='high'      -> activeEffort='high'

Findings:
- grok-4.6 IS offered (CLI 1.0.3; model list: grok-4.6 + grok-4.5).
- grok-4.6 enum: low|medium|high|xhigh. xhigh = "Extra High Effort — Highest
  effort and reasoning level" -> xhigh IS the ceiling, NEW vs 4.5 (which still
  tops out at high in the same response).
- Exact string is `xhigh`, no hyphen. `x-high` would have produced a silently
  mislabeled HIGH run — the grok45max mistake with a typo as the trigger.
- Unknown-value clamp target is `high` (not the model's advertised default xhigh).
- totalContextTokens: 500000 for grok-4.6 (4.5 also shows 500000 on this CLI).
