# Judge calibration — is the score an artifact of who graded it?

Repo 1's published numbers were graded by Opus 4.8. Everything is now graded by GPT-5.5
(Codex), except the GPT-5.6 arm, which Grok 4.5 grades so that no model scores its own
submission. That change was made for capacity reasons, not methodological ones — which
makes it harmless only if the judges actually agree. Four checks say they do.

## 1. Synthetic fixture — all four buckets, three judges

A 4-bug fixture built so the correct verdict is one of each bucket: one clean fix, one
partial, one claimed-but-absent-from-the-diff, one untouched, plus one unplanted genuine
fix.

Opus 4.8, GPT-5.5 and Grok 4.5 each returned exactly that: `fixed_match=1`,
`fixed_partial=1`, `claimed_only=1`, `missed=1`, `extra_genuine=1`.

Weak alone — four bugs is a small target — but it proves the contract is understood.

## 2. Opus 4.8 vs Codex on a real 60-bug arm — identical

The Opus 4.8 grading pass on repo 2 was killed partway through (weekly-limit exhaustion)
and left one completed verdict whose arm mapping died with the run. Compared against the
Codex/Grok verdicts by bug ID, it matches one arm on **all 15 `fixed_match` IDs**, with the
same `claimed_only` (0) and `missed` (45) counts.

So the orphaned verdict is identifiable, and two judges from different vendors
independently reached a bit-identical verdict on 60 real bugs.

## 3. Grok vs Codex on the same real arm — the extras question

One arm logged **29 genuine extras** on repo 2 where every other arm logged 1–6. It was
also the only arm Grok graded. Model difference, or lenient judge?

Control: re-grade a Codex-graded arm — the next-highest claimer — with Grok instead.

| Same arm, 60 bugs | fixed_match | fixed_partial | claimed_only | genuine extras |
|---|---:|---:|---:|---:|
| GPT-5.5 (Codex) | 17 | 1 | 3 | 4 |
| Grok 4.5 | 17 | 1 | 0 | 5 |

Grok found **5** extras there, not 29. Grok is not the generous one, so the 29 is a
property of that submission rather than of its judge.

The headline number is identical across judges. `claimed_only` is the one soft bucket:
Codex read three claims as having no corresponding source hunk, Grok folded them into
`missed`. That disagreement never touches the published score.

## 4. Cross-vendor reproduction of the entire published repo-1 board

All six previously published repo-1 arms were re-graded under the Codex/Grok routing.
Every one reproduced **exactly** — strict fixes and genuine extras, zero delta:

| Repo 1 arm | published (Opus 4.8) | re-judged (Codex/Grok) |
|---|---:|---:|
| GPT-5.6 Sol | 13 | 13 |
| Opus 5 | 11 | 11 |
| Fable 5 | 9 | 9 |
| Grok 4.5 | 5 | 5 |
| Kimi K3 | 4 | 4 |
| Opus 4.8 | 2 | 2 |

Published repo-1 numbers are unchanged. This is the receipt that changing judges did not
move them, and it is what licenses adding a repo-1 score to a repo-2 score in one figure.

## Run-to-run variance under the *same* judge

Repo 2 was scored twice — once with six arms, then again with all seven after a late arm
finished. Same judge, same packets, independent calls. Six of seven arms were identical;
one moved by a single fix. Genuine extras moved by up to 2.

So honest precision is **±1 on strict fixes and ±2 on extras** — not zero. Published
figures come from the seven-arm pass, which is canonical because every arm was graded in
one run. A one-bug wobble reorders nothing: every adjacent gap on the board is wider,
except one genuine tie.

## What this does not establish

Judge agreement on these arms is not agreement on all arms, and none of it makes the
*answer keys* correct — it only makes the grading of them reproducible. The keys are
verified separately: every repo-2 bug is a real regression with its own fix-commit SHA.
