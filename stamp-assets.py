#!/usr/bin/env python3
"""stamp-assets.py — version every local CSS/JS URL so a cache can never serve a stale mix.

WHY (paid for twice on 2026-08-25):
  The site has no bundler, so asset filenames never change. With any real Cache-Control on
  /assets/*, a returning visitor gets NEW html running an OLD script and the board hangs on its
  loading state. Stamping the HTML fixed that - and then exposed the same bug one level down:
  main.js imports table.js / scatter.js / format.js / selector.js / theme.js / export-png.js with
  plain paths, so a freshly-stamped entry point could still pull a cached copy of a module it
  imports. Versioning only what the HTML mentions is not enough; the whole module graph needs it.

HOW:
  One build token = a hash over the *canonical* contents of every asset (every existing ?v= token
  stripped first). That token is appended to every local CSS/JS reference, in the HTML AND in the
  import specifiers inside the JS. One token for the whole graph means no ordering problem and no
  fixpoint iteration: change any asset and every asset URL changes, which for a ~100 KB site is a
  rounding error against being provably correct.

  Idempotent: hashing strips existing tokens first, so re-running with no changes rewrites nothing.
  Exits non-zero if the HTML or a module references an asset that does not exist, so a broken
  reference fails the Netlify build instead of shipping.

Runs automatically as the Netlify build command (netlify.toml). Run it locally too if you want your
working copy to match what deploys:  python stamp-assets.py
"""
from __future__ import annotations

import hashlib
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent
ASSETS = ROOT / "assets"

# href="/assets/..."  src="/assets/..."  in HTML
HTML_REF = re.compile(r'((?:href|src)=")(/assets/[^"?]+\.(?:css|js))(?:\?v=[0-9a-f]+)?(")')
# import ... from './table.js' | "/assets/js/table.js"   and   import('./x.js')
JS_REF = re.compile(r"""((?:from|import)\s*\(?\s*['"])([^'"]+?\.js)(?:\?v=[0-9a-f]+)?(['"])""")
VERSION_TOKEN = re.compile(r"\?v=[0-9a-f]+")


def canonical(path: pathlib.Path) -> bytes:
    """File contents with any previous stamp removed, so the token is stable across re-runs."""
    return VERSION_TOKEN.sub("", path.read_text(encoding="utf-8")).encode("utf-8")


def build_token() -> str:
    h = hashlib.sha256()
    for f in sorted(ASSETS.rglob("*")):
        if f.is_file() and f.suffix in {".css", ".js"}:
            h.update(f.relative_to(ROOT).as_posix().encode("utf-8"))
            h.update(canonical(f))
    return h.hexdigest()[:10]


def main() -> int:
    if not ASSETS.is_dir():
        print("no assets/ directory", file=sys.stderr)
        return 1

    token = build_token()
    missing: list[str] = []
    changed: list[str] = []

    def stamp_html(m: re.Match) -> str:
        pre, path, post = m.groups()
        if not (ROOT / path.lstrip("/")).is_file():
            missing.append(path)
            return m.group(0)
        return f"{pre}{path}?v={token}{post}"

    for html in sorted(ROOT.glob("*.html")):
        text = html.read_text(encoding="utf-8")
        out = HTML_REF.sub(stamp_html, text)
        if out != text:
            html.write_text(out, encoding="utf-8")
            changed.append(html.name)

    for js in sorted(ASSETS.rglob("*.js")):
        text = js.read_text(encoding="utf-8")

        def stamp_js(m: re.Match, _base: pathlib.Path = js) -> str:
            pre, spec, post = m.groups()
            target = (_base.parent / spec).resolve() if spec.startswith(".") else ROOT / spec.lstrip("/")
            if not target.is_file():
                missing.append(f"{_base.name} -> {spec}")
                return m.group(0)
            return f"{pre}{spec}?v={token}{post}"

        out = JS_REF.sub(stamp_js, text)
        if out != text:
            js.write_text(out, encoding="utf-8")
            changed.append(js.relative_to(ROOT).as_posix())

    print(f"build token {token}")
    print(f"stamped: {', '.join(changed) if changed else 'nothing (already current)'}")
    if missing:
        print("MISSING referenced assets:", ", ".join(sorted(set(missing))), file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
