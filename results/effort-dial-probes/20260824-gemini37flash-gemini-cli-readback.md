# Gemini 3.7 Flash via Gemini CLI 0.56.0 + a local rewriting gateway — wire readback, 2026-08-24

Bench legs launched 2026-08-24 19:15:52 (repo 1) / 19:21:51 (repo 2), concurrent, one proxy, one tag
(this launch predates the per-leg `X-Bench-Run` header, so the counts below cover both legs).
Every `streamGenerateContent` call the CLI made, from the actual request URL/body and Google's
response, as logged by the gateway (the gateway's per-call log, tag `gemini37flash`):

- generate calls answered 200: **498**; non-200 after proxy retries: 5 (HTTP statuses {"200": 498, "429": 5})
- served `modelVersion` (Google's response): **{"gemini-3.7-flash": 498}** → ALL gemini-3.7-flash
- `thinkingConfig.thinkingLevel` on the wire: **{"high": 498}** → ALL high
- Google usageMetadata totals, both legs: prompt 63,045,886 (cached 57,926,992) · candidates 36,587 · thoughts 70,898
- CLI per-session stats summed over both legs: prompt 62,692,042 (cached 57,755,922) · candidates 36,346 · thoughts 70,615

The CLI requested `gemini-3.5-flash` on every call (`resolveModel()` clamps any unknown `*-flash`
id to its default under the `useGemini3_5Flash` flag while echoing the requested id in the `init`
event); the proxy rewrote the model on the wire. The CLI's own `chat-base-3` alias already sent
`thinkingLevel: HIGH`; the proxy pins it regardless. Dial magnitude for `high` on this model:
`20260824-gemini37flash-google-api.txt`.

## Orphaned calls (billed, never consumed) — the 19:29–19:31 DNS outage

`getaddrinfo failed` on this machine for ~2 minutes. Gemini CLI's own `retryWithBackoff` re-issued
the failed requests (both legs survived); the proxy's *independent* upstream retry then also
succeeded on 4 of the originals after the CLI had abandoned them — Google answered and billed them,
nobody read them. From the proxy log/JSONL (a `stream error` immediately before the POST's log line):
**4 calls, 353,844 prompt tokens (171,070 cached), 241 candidates, 283 thoughts ≈ $0.15** at
standard list. This is exactly the gap between the CLI's per-leg stats (62,692,042 prompt tokens
summed) and Google's usageMetadata through the proxy (63,045,886): 353,844 tokens.
The per-leg rows carry the CLI numbers; the $0.15 surcharge is reported here, unattributed.
Proxy-side retries were cut to ~12s mid-run (fixed the same day) so this class cannot recur: the CLI's
retry loop is the only long one.

## Harness stall (repo 1 leg): 37 minutes on one `npm test`

The repo 1 suite spawns a do-nothing keep-alive child (`node -e "setInterval(()=>{}, 1000)"`) that
outlives vitest. Gemini CLI's shell tool waits for the process tree to close and has no timeout
(Claude Code's shell tool returns after 2 min), so the agent's first `npm test` at 19:58:45 hung
until a manual kill of that one process at 20:35:30 — the tool call returned instantly and the
agent went on to edit. The repo 1 wall (5229.7s) includes ~2205s of that stall. A sweeper now
runs alongside every arm (in the runner): it kills exactly that signature once
orphaned or older than 5 min, and the row's notes carry the kill count. During this run the
temporary sweeper caught the second `npm test`'s keep-alive 23s after its parent exited.
