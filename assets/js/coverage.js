/* The fourth view: coverage.
   Which of the 105 planted bugs each selected run fixed, and where models
   overlap. Two lines per run — a label line (model, effort badge, fixed
   count) and a tick line (one tick per bug, filled in the run's own colour
   when that run fixed it) — on the same visual language as the tick rule in
   the hero (see .tickrule in site.css): equal-height ticks, solid vs hollow,
   never a size difference standing in for a state difference. The one
   addition here is colour, because a run's identity is the point of this
   view: a hit is filled in the run's own colour; a miss is one neutral
   hollow ring, never a diluted version of the run's colour, because that
   would read as a weaker fix rather than as no fix.

   The 105 columns are NOT bug-index order. They are sorted by how many of
   the runs currently on screen fixed that bug, descending (ties by bug index
   ascending) — so bugs everyone gets cluster left and the rarely-or-never
   fixed ones trail off to the right — and that order is recomputed on every
   selection change, because "commonly fixed" is a property of the selection,
   not of the bug. Sorting mixes the two repos, so a thin strip above the
   rows marks which repo each column belongs to, in the same order every row
   uses, so it stays legible instead of decorative.

   A run whose `fixed_bugs` is null carries no per-bug data (an older run,
   or one graded before this view existed): it still gets a row, greyed, with
   a note, rather than being dropped or crashing the view — and it is left
   out of the column order and the summary counts, which say so. */

import { el, TOTALS } from './format.js?v=1417b1e724';
import { effortBadge } from './table.js?v=1417b1e724';
import { runColor } from './theme.js?v=1417b1e724';

/** Pure layout: column order, per-run ticks and the summary counts. Called
    identically by the on-screen renderer and the PNG export — from `runs`
    and `meta` alone, with no pixel geometry — so the two can never show
    different rows, order or numbers for the same selection. */
export function coverageLayout(runs, meta) {
  const bugCount = meta && Number.isFinite(meta.bug_count) ? meta.bug_count : TOTALS.fixed;
  const repo1Count = meta && Number.isFinite(meta.repo1_bug_count) ? meta.repo1_bug_count : TOTALS.repo1_fixed;

  const withData = runs.filter((r) => Array.isArray(r.fixed_bugs));
  const counts = new Array(bugCount).fill(0);
  const fixedSets = new Map();
  withData.forEach((r) => {
    const set = new Set(r.fixed_bugs.filter((i) => Number.isInteger(i) && i >= 1 && i <= bugCount));
    fixedSets.set(r.slug, set);
    set.forEach((i) => { counts[i - 1] += 1; });
  });

  // most-shared bug first; ties keep the natural bug order
  const order = Array.from({ length: bugCount }, (_, i) => i + 1)
    .sort((a, b) => (counts[b - 1] - counts[a - 1]) || (a - b));

  const rows = runs
    .map((r) => {
      const hasData = fixedSets.has(r.slug);
      return {
        run: r,
        hasData,
        ticks: hasData ? order.map((bugIdx) => ({
          bugIdx,
          repo: bugIdx <= repo1Count ? 1 : 2,
          hit: fixedSets.get(r.slug).has(bugIdx),
        })) : null,
      };
    })
    // best-scoring run on top — the leaderboard's own default rhythm
    .sort((a, b) => (b.run.fixed || 0) - (a.run.fixed || 0) || a.run.model.localeCompare(b.run.model));

  const n = withData.length;
  const fixedByAll = n > 0 ? counts.filter((c) => c === n).length : 0;
  const uniqueWins = n > 0 ? counts.filter((c) => c === 1).length : 0;
  const fixedByNone = n > 0 ? counts.filter((c) => c === 0).length : 0;

  return {
    bugCount,
    repo1Count,
    order,
    rows,
    withDataCount: n,
    withoutDataCount: runs.length - n,
    fixedByAll,
    uniqueWins,
    fixedByNone,
  };
}

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

/** Why the columns are in this order, and what the repo strip above them
    means — generated so a changed bug or repo count moves the sentence
    rather than dating it. */
export function coverageOrderNote(L) {
  return `Columns are ordered by how many of the runs shown (with per-bug data) fixed that bug, most commonly fixed first, ties by bug index. This mixes both repos — bugs 1–${L.repo1Count} are repo 1, ${L.repo1Count + 1}–${L.bugCount} are repo 2 — marked by the strip above the rows.`;
}

/** The generated summary: how many bugs every run with data shares, how many
    belong to exactly one of them, how many nothing on screen has fixed.
    Never hard-coded — it reads straight off the current selection. */
export function coverageSummaryNote(L) {
  if (L.withDataCount === 0) {
    return L.withoutDataCount > 0 ? 'None of the selected runs carry per-bug data yet.' : '';
  }
  const missing = L.withoutDataCount > 0
    ? ` ${plural(L.withoutDataCount, 'selected run')} ${L.withoutDataCount === 1 ? 'carries' : 'carry'} no per-bug data and ${L.withoutDataCount === 1 ? 'is' : 'are'} excluded from these counts.`
    : '';
  return `Among the ${plural(L.withDataCount, 'run')} with per-bug data: ${plural(L.fixedByAll, 'bug')} fixed by all of them, ${plural(L.uniqueWins, 'bug')} fixed by exactly one, ${plural(L.fixedByNone, 'bug')} fixed by none.${missing}`;
}

/** On-screen renderer: the repo strip, then one label + tick line per run.
    Returns the layout, so the caller builds the caption from the same
    numbers this drew rather than re-deriving them. */
export function renderCoverage(host, runs, meta, glossary) {
  host.textContent = '';
  if (!runs.length) return null;
  const L = coverageLayout(runs, meta);

  const colkey = el('div', { class: 'coverage__colkey', 'aria-hidden': 'true' });
  L.order.forEach((bugIdx) => {
    colkey.appendChild(el('span', { class: `tick ${bugIdx <= L.repo1Count ? 'is-repo1' : 'is-repo2'}` }));
  });
  host.appendChild(colkey);

  const rows = el('div', { class: 'coverage__rows' });
  L.rows.forEach(({ run, hasData, ticks }) => {
    const label = el('div', { class: 'coverage__label' }, [
      el('span', { class: 'swatch', style: { 'background-color': runColor(run.color) } }),
      el('span', { class: 'coverage__name' }, [run.model, ' ', effortBadge(run, glossary)]),
      el('span', { class: 'coverage__count', text: `${run.fixed}/${L.bugCount}` }),
    ]);

    const bar = hasData
      ? el('div', { class: 'coverage__ticks', 'aria-hidden': 'true' }, ticks.map((t) => {
        const tick = el('span', { class: `tick${t.hit ? ' is-hit' : ' is-miss'}` });
        if (t.hit) tick.style.setProperty('background-color', runColor(run.color));
        return tick;
      }))
      : el('div', { class: 'coverage__ticks coverage__ticks--nodata' }, [
        el('span', { class: 'coverage__nodata', text: 'No per-bug data available for this run.' }),
      ]);

    rows.appendChild(el('div', {
      class: `coverage__row${hasData ? '' : ' coverage__row--nodata'}`,
      'data-run': run.slug,
    }, [label, bar]));
  });
  host.appendChild(rows);

  return L;
}
