# grok-4.6 `low` — zero-token ACP readback, 2026-08-27

Same method as the 08-12 (xhigh) and 08-14 (medium) readbacks: `initialize` + `session/new`, no prompt sent, read `_meta.reasoningEffort` off the advertised `grok-4.6` model. The grok CLI silently clamps unknown effort strings to `high`; only an echo of the requested value makes the arm's effort label honest.

```
requested='low' -> active='low'  (meta={'totalContextTokens': 500000, 'agentType': 'grok-build-plan', 'supportsReasoningEffort': True, 'reasoningEffort': 'low', 'reasoningEfforts': [{'id': 'xhigh', 'value': 'xhigh', 'label': 'Extra High Effort', 'description': 'Highest effort and reasoning level', 'default': False}, {'id': 'high', 'value': 'high', 'label': 'High Effort', 'description': 'Higher implementation quality with extensive reasoning', 'default': True}, {'id': 'medium', 'value': 'medium', 'label': 'Medium Effort', 'description': 'Balanced effort with standard implementation and testing', 'default': False}, {'id': 'low', 'value': 'low', 'label': 'Low Effort', 'description': 'Quick, fast implementations', 'default': False}]})
```

Raw: `20260827-grok46-low-acp-readback.json`. CLI: see `grok --version` at run time (1.0.5 on 2026-08-27).
