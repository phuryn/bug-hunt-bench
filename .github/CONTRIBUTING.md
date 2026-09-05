# Issues yes, pull requests no

**Pull requests are not accepted** and are closed automatically. Not because the work is unwelcome,
but because there is nothing here to edit by hand:

- Every number in `results/`, in `data/benchmark.json`, in the README table and in the PNGs is
  **generated** by a private runner from blind-judged verdicts. A hand edit would be overwritten on
  the next wave, and worse, it would break the one promise the bench makes: no figure is typed.
- The answer keys, the seeded repositories and the per-model diffs are withheld, so a run cannot be
  reproduced or re-scored from the outside, and a change to a score cannot be reviewed here.

**Issues are open**, for two things:

1. **A wrong number.** If a figure here disagrees with a receipt in `results/`, or with a post, the
   receipt wins and I want to know. Quote the two figures and where each one is.
2. **A missing model.** Name the model, the first-party agentic CLI it ships with, and the serving path
   (vendor API, a specific aggregator, a subscription). Runs are added as models become reachable;
   a model with no CLI and no drivable API path cannot be run.

Everything here is MIT: fork it, quote it, build on it. A link back is appreciated.
