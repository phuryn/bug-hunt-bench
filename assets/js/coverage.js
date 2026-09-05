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

   The 105 columns are NOT bug-index order. By default they are sorted by how
   many of the runs currently on screen fixed that bug, descending (ties by
   bug index ascending) — so bugs everyone gets cluster left and the
   rarely-or-never fixed ones trail off to the right — and that order is
   recomputed on every selection change, because "commonly fixed" is a
   property of the selection, not of the bug. Sorting mixes the two repos, so
   a thin strip above the rows marks which repo each column belongs to, in
   the same order every row uses, so it stays legible instead of decorative.

   A run whose `fixed_bugs` is null carries no per-bug data (an older run,
   or one graded before this view existed): it still gets a row, greyed, with
   a note, rather than being dropped or crashing the view — and it is left
   out of the column order and the summary counts, which say so.

   A run WITH data can also be made the pivot: click its row (or focus it and
   press Enter/Space) to re-sort every column into four zones around what
   that run fixed — shared with at least one other shown run, fixed by it
   alone, missed by it but fixed by another shown run, or fixed by nobody
   shown — click the same row again to clear it back to the default order.
   coverageLayout() computes the zones once; the repo strip, every row's own
   tick line and the label row above them all walk that same zone list, so a
   pivot's dividers land in the same place all the way down the card, on
   screen and in the PNG export alike. */

import { el, TOTALS } from './format.js?v=07af07f3fb';
import { effortBadge } from './table.js?v=07af07f3fb';
import { runColor } from './theme.js?v=07af07f3fb';

/* Plain words, not a legend of single letters — a reader should not have to
   learn A/B/C/D to read the strip. Order here IS the left-to-right order of
   the zones once a pivot is active. */
const ZONE_META = [
  { key: 'shared', label: 'shared' },
  { key: 'onlyPivot', label: 'only this model' },
  { key: 'missedByPivot', label: 'missed by this model' },
  { key: 'nobody', label: 'nobody' },
];

/** Pure layout: column order, per-run ticks and the summary counts. Called
    identically by the on-screen renderer and the PNG export — from `runs`,
    `meta` and an optional pivot slug alone, with no pixel geometry — so the
    two can never show different rows, order or numbers for the same
    selection and pivot. */
export function coverageLayout(runs, meta, pivotSlug) {
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

  // most-shared bug first; ties keep the natural bug order — the DEFAULT
  // order, and the sub-sort used inside each of a pivot's four zones below
  const naturalOrder = Array.from({ length: bugCount }, (_, i) => i + 1)
    .sort((a, b) => (counts[b - 1] - counts[a - 1]) || (a - b));

  // A pivot needs its own per-bug data among the runs actually on screen — a
  // run with none, or one no longer selected, simply fails to match here and
  // the board falls back to the default order below. main.js drops a stale
  // ?pivot= the same way, before it ever reaches this function.
  const pivotRun = pivotSlug ? withData.find((r) => r.slug === pivotSlug) : null;

  let order = naturalOrder;
  let zones = [{ key: 'all', label: null, bugs: naturalOrder }];
  let pivot = null;

  if (pivotRun) {
    const pivotSet = fixedSets.get(pivotRun.slug);
    const zoneKey = (i) => {
      const hasPivot = pivotSet.has(i);
      const others = counts[i - 1] - (hasPivot ? 1 : 0);
      if (hasPivot) return others > 0 ? 'shared' : 'onlyPivot';
      return others > 0 ? 'missedByPivot' : 'nobody';
    };
    zones = ZONE_META.map((z) => ({ ...z, bugs: naturalOrder.filter((i) => zoneKey(i) === z.key) }));
    order = zones.flatMap((z) => z.bugs);
    const countOf = (key) => zones.find((z) => z.key === key).bugs.length;
    pivot = {
      slug: pivotRun.slug,
      run: pivotRun,
      shared: countOf('shared'),
      onlyPivot: countOf('onlyPivot'),
      missedByPivot: countOf('missedByPivot'),
      nobody: countOf('nobody'),
    };
  }

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
    // best-scoring run on top — the leaderboard's own default rhythm. The
    // pivot changes column order, never row order.
    .sort((a, b) => (b.run.fixed || 0) - (a.run.fixed || 0) || a.run.model.localeCompare(b.run.model));

  const n = withData.length;
  const fixedByAll = n > 0 ? counts.filter((c) => c === n).length : 0;
  const uniqueWins = n > 0 ? counts.filter((c) => c === 1).length : 0;
  const fixedByNone = n > 0 ? counts.filter((c) => c === 0).length : 0;

  return {
    bugCount,
    repo1Count,
    order,
    zones,
    pivot,
    rows,
    withDataCount: n,
    withoutDataCount: runs.length - n,
    fixedByAll,
    uniqueWins,
    fixedByNone,
  };
}

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

/** How a run reads inline in a sentence — the same "model · effort" shape
    the scatter legend already uses, so the two views name a run the same way. */
const runLabel = (run) => `${run.model}${run.effort ? ` · ${run.effort}` : ''}`;

/** Why the columns are in this order. Generated so a changed bug or repo
    count moves the sentence rather than dating it, and so a pivot rewrites
    it instead of leaving a caption that no longer matches the strip. This is
    the one place the pivot-aware wording lives — the page and the PNG export
    both call it, so they can never say two different things about the same
    columns. */
export function coverageOrderNote(L) {
  if (L.pivot) {
    const {
      run, shared, onlyPivot, missedByPivot, nobody,
    } = L.pivot;
    return `Sorted by ${runLabel(run)}: ${plural(shared, 'bug')} it fixed that others also fixed, `
      + `${plural(onlyPivot, 'bug')} only it fixed, ${plural(missedByPivot, 'bug')} it missed that others fixed, `
      + `${plural(nobody, 'bug')} fixed by nobody shown. These are single runs — a subset relationship `
      + 'describes these runs, not the models in general; same-setting variance is real on this board.';
  }
  return `Columns are ordered by how many of the runs shown (with per-bug data) fixed that bug, most commonly fixed first, ties by bug index. This mixes both repos — bugs 1–${L.repo1Count} are repo 1, ${L.repo1Count + 1}–${L.bugCount} are repo 2 — marked by the strip above the rows.`;
}

/** The generated summary: how many bugs every run with data shares, how many
    belong to exactly one of them, how many nothing on screen has fixed.
    Never hard-coded — it reads straight off the current selection, and it
    does not change with the pivot: it is a fact about the whole selection,
    not about one run's place in it. */
export function coverageSummaryNote(L) {
  if (L.withDataCount === 0) {
    return L.withoutDataCount > 0 ? 'None of the selected runs carry per-bug data yet.' : '';
  }
  const missing = L.withoutDataCount > 0
    ? ` ${plural(L.withoutDataCount, 'selected run')} ${L.withoutDataCount === 1 ? 'carries' : 'carry'} no per-bug data and ${L.withoutDataCount === 1 ? 'is' : 'are'} excluded from these counts.`
    : '';
  return `Among the ${plural(L.withDataCount, 'run')} with per-bug data: ${plural(L.fixedByAll, 'bug')} fixed by all of them, ${plural(L.uniqueWins, 'bug')} fixed by exactly one, ${plural(L.fixedByNone, 'bug')} fixed by none.${missing}`;
}

/* ------------------------------------------------------------------ zones */

/** Group an order-aligned set of columns into the pivot's zones (or one zone
    when no pivot is active) and lay them out as nested flex groups with a
    thin divider between any two zones that both have columns on screen. The
    repo strip and every run's own tick line call this with the same `zones`
    from the same layout, so their dividers always land in the same place —
    only `cellFn`, which draws one cell, differs between them. With no pivot
    there is one zone, so this renders exactly as a flat row always did: no
    divider, no seam. */
function zonedRow(zones, wrapClass, cellFn) {
  const shown = zones.filter((z) => z.bugs.length);
  const row = el('div', { class: `coverage__zoned ${wrapClass}` });
  shown.forEach((z, i) => {
    if (i > 0) row.appendChild(el('span', { class: 'coverage__divider' }));
    const group = el('div', { class: 'coverage__zonegroup' });
    group.style.setProperty('flex-grow', String(z.bugs.length));
    z.bugs.forEach((bugIdx) => group.appendChild(cellFn(bugIdx)));
    row.appendChild(group);
  });
  return row;
}

/** The plain-word zone labels, sized to the same widths zonedRow() gives
    their columns so they sit over their own zone — shown only while a pivot
    is active; the caption says the same thing in full sentences, so nothing
    is lost when this row is hidden on a narrow screen (site.css). */
function zoneLabelsRow(zones) {
  const shown = zones.filter((z) => z.bugs.length && z.label);
  if (!shown.length) return null;
  const row = el('div', { class: 'coverage__zonelabels', 'aria-hidden': 'true' });
  shown.forEach((z, i) => {
    if (i > 0) row.appendChild(el('span', { class: 'coverage__divider coverage__divider--label' }));
    // a title, not just the truncated text — a two-column zone leaves no
    // room to spell "only this model" out in full, but a mouse can still ask
    const cell = el('span', { class: 'coverage__zonelabel', title: z.label, text: z.label });
    cell.style.setProperty('flex-grow', String(z.bugs.length));
    row.appendChild(cell);
  });
  return row;
}

/* ---------------------------------------------------------------- renderer */

/** On-screen renderer: the zone labels (pivot only), the repo strip, then
    one label + tick line per run. Returns the layout, so the caller builds
    the caption from the same numbers this drew rather than re-deriving them.

    `onPivotToggle`, if given, is called with a run's slug when its row is
    activated — by click or by Enter/Space while it has focus. Rows with no
    per-bug data are never wired: they cannot become the pivot. */
export function renderCoverage(host, runs, meta, glossary, pivotSlug, onPivotToggle) {
  host.textContent = '';
  if (!runs.length) return null;
  const L = coverageLayout(runs, meta, pivotSlug);

  if (L.pivot) {
    const zoneLabels = zoneLabelsRow(L.zones);
    if (zoneLabels) host.appendChild(zoneLabels);
  }

  const colkey = zonedRow(L.zones, 'coverage__colkey', (bugIdx) =>
    el('span', { class: `tick ${bugIdx <= L.repo1Count ? 'is-repo1' : 'is-repo2'}` }));
  colkey.setAttribute('aria-hidden', 'true');
  host.appendChild(colkey);

  const rows = el('div', { class: 'coverage__rows' });
  L.rows.forEach(({ run, hasData, ticks }) => {
    const isPivot = Boolean(L.pivot && L.pivot.slug === run.slug);

    const label = el('div', { class: 'coverage__label' }, [
      el('span', { class: 'swatch', style: { 'background-color': runColor(run.color) } }),
      el('span', { class: 'coverage__name' }, [run.model, ' ', effortBadge(run, glossary)]),
      isPivot ? el('span', { class: 'coverage__chip', text: 'Sorted by' }) : null,
      el('span', { class: 'coverage__count', text: `${run.fixed}/${L.bugCount}` }),
    ]);

    let bar;
    if (hasData) {
      const tickByIdx = new Map(ticks.map((t) => [t.bugIdx, t]));
      bar = zonedRow(L.zones, 'coverage__ticks', (bugIdx) => {
        const t = tickByIdx.get(bugIdx);
        const tick = el('span', { class: `tick${t.hit ? ' is-hit' : ' is-miss'}` });
        if (t.hit) tick.style.setProperty('background-color', runColor(run.color));
        return tick;
      });
      bar.setAttribute('aria-hidden', 'true');
    } else {
      bar = el('div', { class: 'coverage__ticks coverage__ticks--nodata' }, [
        el('span', { class: 'coverage__nodata', text: 'No per-bug data available for this run.' }),
      ]);
    }

    const rowAttrs = {
      class: `coverage__row${hasData ? '' : ' coverage__row--nodata'}${isPivot ? ' is-pivot' : ''}`,
      'data-run': run.slug,
    };
    // Only a run with per-bug data can become the pivot — a nodata row stays
    // exactly the plain, greyed row it always was.
    if (hasData && onPivotToggle) {
      rowAttrs.role = 'button';
      rowAttrs.tabindex = '0';
      rowAttrs['aria-pressed'] = String(isPivot);
      rowAttrs['aria-label'] = `${isPivot ? 'Clear pivot, stop sorting columns by' : 'Sort columns by'} ${runLabel(run)}`;
    }
    const rowEl = el('div', rowAttrs, [label, bar]);
    if (hasData && onPivotToggle) {
      rowEl.addEventListener('click', (e) => {
        // the effort badge is its own link (effortBadge() in table.js) — let
        // it navigate on its own rather than also toggling the pivot
        if (e.target.closest('a')) return;
        onPivotToggle(run.slug);
      });
      rowEl.addEventListener('keydown', (e) => {
        // a nested focusable (the badge link) handles its own Enter — only
        // act when the row itself, not one of its children, has focus
        if (e.target !== rowEl) return;
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
          e.preventDefault();
          onPivotToggle(run.slug);
        }
      });
    }
    rows.appendChild(rowEl);
  });
  host.appendChild(rows);

  return L;
}
