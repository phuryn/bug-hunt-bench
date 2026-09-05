# -*- coding: utf-8 -*-
"""Effort-dial discriminator for deepseek/deepseek-v4-flash-0731 on OpenRouter.

v1 showed every effort string gets a 200 (no loud validation), so this pins ONE
provider (DeepInfra: supports seed + logit params), temperature=0, fixed seed,
identical prompt - and runs N=3 per level. If the effort dial is ACTIVE, levels
separate in reasoning tokens; if it is INERT (grok-style silent clamp), all
levels collapse to the same trajectory.
"""
import json
import os
import statistics
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parents[2]
SLUG = "deepseek/deepseek-v4-flash-0731"
PROMPT = ("A 5x5 grid has its corners removed. In how many ways can you tile the remaining "
          "21 cells with exactly one L-tromino and six 1x3 straight trominoes? Reason step "
          "by step, then end with just the number.")


def key():
    env_key = os.environ.get("OPENROUTER_API_KEY")
    if env_key:
        return env_key.strip()
    for line in (ROOT / ".env").read_text(encoding="utf-8").splitlines():
        if line.startswith("OPENROUTER_API_KEY="):
            return line.split("=", 1)[1].strip()
    raise SystemExit("no OPENROUTER_API_KEY")


KEY = key()


def one(effort, seed):
    body = {"model": SLUG, "max_tokens": 8000, "temperature": 0, "seed": seed,
            "usage": {"include": True},
            "provider": {"order": ["DeepInfra"], "allow_fallbacks": False},
            "messages": [{"role": "user", "content": PROMPT}]}
    if effort:
        body["reasoning"] = {"effort": effort}
    headers = {"Authorization": f"Bearer {KEY}", "Content-Type": "application/json"}
    try:
        resp = requests.post("https://openrouter.ai/api/v1/chat/completions",
                              data=json.dumps(body), headers=headers, timeout=600)
        resp.raise_for_status()
    except requests.exceptions.HTTPError as exc:
        return f"HTTP {exc.response.status_code}: {exc.response.text[:120]}"
    payload = resp.json()
    if "error" in payload:
        return f"API error: {json.dumps(payload['error'])[:120]}"
    usage = payload.get("usage", {})
    det = usage.get("completion_tokens_details", {}) or {}
    return det.get("reasoning_tokens")


for effort in (None, "low", "high", "max"):
    vals = [one(effort, seed) for seed in (7, 7, 7)]
    nums = [v for v in vals if isinstance(v, int)]
    label = effort or "(none)"
    if nums:
        print(f"effort={label:6s} reasoning_tok runs={vals}  mean={statistics.mean(nums):.0f}")
    else:
        print(f"effort={label:6s} {vals}")
