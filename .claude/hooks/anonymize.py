#!/usr/bin/env python3
"""PostToolUse hook: scrub machine-identifying paths from any file this repo's
Claude Code sessions write or edit.

This is the same transformation applied (as a batch script) to every published
file in this repo before it landed here — checked in so the anonymization is
auditable code, not a claim in a README. Rules live in anonymize-rules.json
next to this file; usernames are wildcarded in the patterns so the hook never
has to contain the strings it exists to remove.

Receives the standard PostToolUse JSON on stdin; rewrites the touched file in
place when a rule matches. Always exits 0 (a scrub failure should never block
a session).
"""
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))


def load_rules():
    with open(os.path.join(HERE, "anonymize-rules.json"), encoding="utf-8") as f:
        return [(re.compile(r["pattern"]), r["replace"]) for r in json.load(f)]


def main():
    try:
        payload = json.load(sys.stdin)
    except Exception:
        return
    tool_input = payload.get("tool_input") or {}
    path = tool_input.get("file_path") or tool_input.get("notebook_path")
    if not path or not os.path.isfile(path):
        return
    try:
        with open(path, "r", encoding="utf-8", errors="replace") as f:
            text = f.read()
    except OSError:
        return
    new = text
    for rx, rep in load_rules():
        new = rx.sub(rep, new)
    if new != text:
        with open(path, "w", encoding="utf-8", newline="") as f:
            f.write(new)
        print(f"anonymize hook: scrubbed {os.path.basename(path)}")


if __name__ == "__main__":
    main()
    sys.exit(0)
