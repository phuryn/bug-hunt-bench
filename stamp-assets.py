#!/usr/bin/env python3
"""stamp-assets.py — append a content hash to every local CSS/JS reference in the HTML.

Why this exists: the site has no build step, so asset filenames never change. With a long
Cache-Control on /assets/* a returning visitor gets NEW html running OLD javascript, and the
page hangs on its loading state (reported live, 2026-08-25). Content-hash query strings make a
changed file a changed URL, which is what lets the cache be long AND correct.

Run after any change to assets/ (and before committing):  python stamp-assets.py
Idempotent: re-running with no asset changes rewrites nothing.
"""
import hashlib
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent
PATTERN = re.compile(r'((?:href|src)=")(/assets/[^"?]+\.(?:css|js))(?:\?v=[0-9a-f]+)?(")')


def digest(rel: str) -> str | None:
    f = ROOT / rel.lstrip("/")
    if not f.is_file():
        return None
    return hashlib.sha256(f.read_bytes()).hexdigest()[:10]


def main() -> int:
    changed, missing = [], []

    def sub(m: re.Match) -> str:
        pre, path, post = m.group(1), m.group(2), m.group(3)
        h = digest(path)
        if h is None:
            missing.append(path)
            return m.group(0)
        return f"{pre}{path}?v={h}{post}"

    for html in sorted(ROOT.glob("*.html")):
        text = html.read_text(encoding="utf-8")
        stamped = PATTERN.sub(sub, text)
        if stamped != text:
            html.write_text(stamped, encoding="utf-8")
            changed.append(html.name)
    print(f"stamped: {', '.join(changed) if changed else 'nothing (already current)'}")
    if missing:
        print("MISSING assets referenced in HTML:", ", ".join(sorted(set(missing))))
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
