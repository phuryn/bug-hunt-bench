# 2026-08-14 — grok-4.6 ACP zero-token readback: `medium` is VALID and echoes back ACTIVE

Method: identical to the 2026-08-12 probe — spawn
`grok agent --reasoning-effort medium -m grok-4.6 stdio`, initialize, session/new,
read back models._meta.reasoningEffort. No prompt sent = zero tokens.
Raw: 20260814-grok46-medium-acp-readback.json

```
requested='medium' -> activeEffort='medium'   (VALID — echoes back)
```

Context: run before launching the `grok46medium` bench arm (a medium companion to the 08-12 xhigh run). The 08-12 probe established grok-4.6's enum as
low|medium|high|xhigh and that unknown values silently clamp to `high`; this probe
closes the gap that `medium` itself was never directly requested. It is, so the
`grok46medium` row's effort label is trustworthy.
