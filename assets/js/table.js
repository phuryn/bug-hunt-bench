/* The leaderboard table.
   Six columns - model, fixed, extras, wall clock, cost, date - and four bars, on
   the card's rhythm: bar from the left edge of the cell, value printed at its
   end. They are deliberately not interchangeable.

     score   the run's own colour, full height, scaled to the best score shown
     extras  grey hatch at half height, scaled to the biggest extras count shown,
             sitting in a column group headed "Tracked, not scored"
     wall    flat neutral grey, scaled to the slowest run shown
     cost    flat neutral grey, scaled to the dearest run shown

   Only the score bar ever carries a run's colour.

   A cell shows the number. It does not show what kind of number it is: the cost
   tag used to be printed under every dollar figure and the effort status beside
   every model, and a word repeated down a column is noise, not information. The
   exceptions are named once, in the key under the table, generated from the rows
   on screen - and one badge suffix survives inline, on the single clamped row,
   because a published correction cannot be left to a key.

   There is no row detail and no dagger either. Partial and claimed-only are in
   the data and defined on the method page; the sentences a row carries - a
   caveat, a note, a supersession - ride on the cell as a plain title, which
   costs no layout and needs no marker. */

import {
  COLUMNS, GROUPS, TOTALS, fmtCost, fmtWall, fmtInt,
  barRatio, barScales, effortSuffix, effortDefKey, defHref, el, svgEl, compareRuns, sampleTitle,
} from './format.js?v=5919157f8a';
import { runColor } from './theme.js?v=5919157f8a';

const MOBILE_LABEL = {
  extras: 'Unplanted (not scored)',
  wall_min: 'Wall clock (min)',
  cost_usd: 'Cost',
};

function arrow(dir) {
  return svgEl('svg', { class: 'arrow', width: 7, height: 5, viewBox: '0 0 7 5', 'aria-hidden': 'true' }, [
    svgEl('path', {
      d: dir === 'asc' ? 'M3.5 0 7 5H0z' : 'M3.5 5 0 0h7z',
      fill: 'currentColor',
    }),
  ]);
}

export function renderColgroup(tableEl, columns = COLUMNS) {
  const existing = tableEl.querySelector('colgroup');
  if (existing) existing.remove();
  const cg = el('colgroup');
  columns.forEach((c) => {
    const col = el('col');
    col.style.setProperty('width', `${c.pct}%`);
    cg.appendChild(col);
  });
  tableEl.insertBefore(cg, tableEl.firstChild);
}

export function renderHead(headEl, state, onSort, columns = COLUMNS, groups = GROUPS) {
  headEl.textContent = '';
  headEl.setAttribute('role', 'rowgroup');

  const groupRow = el('tr', { class: 'groups', role: 'row' });
  groups.forEach((g) => {
    const span = columns.filter((c) => c.group === g.id).length;
    if (!span) return;
    /* the group label is the one header that is not a sort button, so it is
       where a column can carry a link to its own definition without stealing
       the click that sorts it */
    groupRow.appendChild(el('th', {
      colspan: span > 1 ? span : null,
      scope: g.label ? (span > 1 ? 'colgroup' : 'col') : null,
      class: [g.cls, g.label ? 'divide' : ''].filter(Boolean).join(' '),
      role: 'columnheader',
    }, g.label
      ? [g.def
        ? el('a', { class: 'deflink', href: defHref(g.def), title: `What "${g.label}" means` }, [g.label])
        : document.createTextNode(g.label)]
      : null));
  });
  headEl.appendChild(groupRow);

  const colRow = el('tr', { class: 'cols', role: 'row' });
  columns.forEach((c) => {
    const active = state.sort === c.key;
    const cls = [];
    if (c.group !== 'run' && columns.find((x) => x.group === c.group).key === c.key) cls.push('divide');
    if (c.align === 'left' && c.key !== 'model') cls.push('col--bar');
    const th = el('th', {
      scope: 'col',
      role: 'columnheader',
      class: cls.length ? cls.join(' ') : null,
      'aria-sort': active ? (state.dir === 'asc' ? 'ascending' : 'descending') : null,
    });
    const btn = el('button', {
      type: 'button',
      class: 'sortbtn',
      title: `Sort by ${c.label}`,
    }, [
      document.createTextNode(c.label),
      c.unit ? el('span', { class: 'unit', text: c.unit }) : null,
      arrow(active ? state.dir : 'desc'),
    ]);
    btn.addEventListener('click', () => onSort(c.key));
    th.appendChild(btn);
    colRow.appendChild(th);
  });
  headEl.appendChild(colRow);
}

/* THE SENTENCES A ROW CARRIES ARE NOT ON THIS PAGE ANY MORE (Pawel, 2026-09-14:
   "all the details on GitHub, not in the leaderboard on hover").

   They lived in a disclosure row once, then as a `title` on the model cell - and a
   tooltip was the wrong home for them all along. Some of these notes run past four
   thousand characters: a browser truncates them without saying so, touch devices never
   see them, they cannot be searched, and they cannot be linked to. They are the audit
   trail for a published number.

   They are generated into results/run-notes.md on GitHub instead, one section per row,
   next to the metrics CSVs that hold the runs behind each one. The caption under the
   board links there. Nothing is hidden; it is filed where it can be read. */

/* Two lines at most: the name with its effort badge, then vendor - harness.
   The badge is the tier the run was asked for - MAX / XHIGH / HIGH / DEFAULT -
   and it says nothing else, because what DEFAULT means is one sentence in the
   key rather than two words on every row that has it. The single exception is
   the clamped run, where the tool ran something lower than the badge asked for:
   that is a published correction and it stays on its own row. Either way the
   badge links at its definition, which reads in plain English, from the data. */
/** The effort badge alone: the tier a run was asked for, linked at its
    definition. Factored out of modelCell so any other view that shows a
    run's identity next to its badge can use the same element rather than
    rebuilding it — currently table.js here and coverage.js. */
export function effortBadge(run, glossary) {
  const defKey = effortDefKey(run);
  const suffix = effortSuffix(run);
  return el('a', {
    class: 'badge',
    href: defKey ? defHref(defKey) : null,
    title: (glossary && glossary[defKey]) || `Reasoning effort tier requested for this run: ${run.effort}`,
    /* the tier and its suffix are two elements with no whitespace between them,
       which a screen reader would run together as one word */
    'aria-label': `Effort tier: ${run.effort}${suffix ? `, ${suffix}` : ''}`,
  }, [
    el('span', { class: 'badge__tier', text: run.effort }),
    suffix ? el('span', { class: 'badge__note', text: suffix }) : null,
  ]);
}

/** How many independent runs a row is built from. Older data files have no `n_runs`,
    and a missing field must read as "one run", never as "not a run". */
export const nRuns = (run) => (Number.isFinite(run.n_runs) && run.n_runs > 0 ? run.n_runs : 1);

function modelCell(run, glossary) {
  /* A MEAN ROW MUST SAY IT IS ONE - and it says it the same way the row says everything
     else about its provenance: as one more term on the meta line, "Meta · Muse Code /
     Meta API · n=3". It is not a status, so it takes no border and no badge; a bordered
     "mean of 3 runs" tag drew more eye than the score it qualifies. Without the term the
     row renders identically to a single run - same name, same badge, same columns - and
     the decimal on the score has nothing to explain it. */
  const report = Boolean(run.samples);
  const meta = (report ? [run.harness_version, `n=${nRuns(run)}`] :
    [run.vendor, run.harness, nRuns(run) > 1 ? `n=${nRuns(run)}` : null])
    .filter(Boolean).join(' · ');
  const badges = report ? [
    run.native ? el('span', { class: 'tag tag--native', text: 'native' }) : null,
    run.authors_harness ? el('span', { class: 'tag tag--author', text: 'author’s harness' }) : null,
  ] : [effortBadge(run, glossary)];

  const body = el('span', { class: 'model__body' }, [
    el('span', { class: 'model__name' }, [run.label || run.model, ' ', ...badges]),
    el('span', { class: 'model__meta' }, [
      document.createTextNode(meta),
      run.superseded ? document.createTextNode(' ') : null,
      run.superseded ? el('span', { class: 'tag tag--superseded', text: 'superseded' }) : null,
    ]),
    report && run.caveat ? el('span', { class: 'model__caveat', text: run.caveat }) : null,
  ]);
  return el('td', { class: 'model-cell', role: 'cell' }, [
    el('span', { class: 'model' }, [
      el('span', { class: 'swatch', style: { 'background-color': runColor(run.color) } }),
      body,
    ]),
  ]);
}

/* One bar, one value at its end. A missing figure and a genuine zero both draw
   no bar at all: every other bar keeps a 2px floor so the cheapest run still
   shows a tick, and that floor must not invent a mark for a run worth nothing.
   The value's own width is reserved out of the track in CSS (--reserve), so a
   full-length bar cannot push its number out of the cell. */
function barRow(kind, ratio, color, value, marks = []) {
  const blank = ratio === null || ratio === 0;
  const bar = el('span', { class: `bar bar--${kind}${blank ? ' bar--empty' : ''}` });
  bar.style.setProperty('width', blank ? '0'
    : `calc((100% - var(--reserve)) * ${ratio.toFixed(4)})`);
  if (color) bar.style.setProperty('background-color', color);
  return el('span', { class: `bar-row bar-row--${kind}${marks.length ? ' bar-row--samples' : ''}` }, [
    bar, ...marks,
    el('span', { class: 'bar-val' }, [value]),
  ]);
}

function scoreCell(run, fixedMax, scoreTotal) {
  const color = runColor(run.color);
  const marks = (run.samples || []).map((sample, i) => el('span', {
    class: 'bar__sample', 'aria-hidden': 'true', title: `Run ${sample.run}: ${sample.fixed}`,
    style: {
      '--sample-position': barRatio(sample.fixed, fixedMax),
      '--sample-lane': i,
      '--sample-color': color,
    },
  }));
  return el('td', {
    class: 'score divide col--bar', role: 'cell', 'data-label': `Score of ${scoreTotal}`,
  }, [
    barRow('score', barRatio(run.fixed, fixedMax), color,
      el('span', { class: 'score__num' }, [
        document.createTextNode(fmtInt(run.fixed)),
        el('span', { class: 'score__den', text: `/${scoreTotal}` }),
      ]), marks),
  ]);
}

function extrasCell(run, extrasMax) {
  return el('td', {
    class: 'extras col--bar', role: 'cell', 'data-label': MOBILE_LABEL.extras,
  }, [
    barRow('extras', barRatio(run.extras, extrasMax), null,
      el('span', { class: 'extras__num', text: fmtInt(run.extras) })),
  ]);
}

/* Wall clock is one measure on every row. Three rows carry a note on how their
   figure was taken; that sentence rides on the cell rather than on a marker, and
   the same rows wear a broken ring on the score-vs-time map, which is where a
   bent minute figure would actually mislead a reader. */
function wallCell(run, wallMax, timeLabel) {
  const has = run.wall_min !== null && run.wall_min !== undefined;
  return el('td', {
    class: 'divide col--bar',
    role: 'cell',
    'data-label': timeLabel ? `${timeLabel} (min)` : MOBILE_LABEL.wall_min,
    title: run.wall_note,
  }, [
    barRow('wall', barRatio(run.wall_min, wallMax), null,
      el('span', {}, [
        el('span', { class: 'wall__num', text: run.samples ? fmtInt(run.wall_min) : fmtWall(run.wall_min) }),
        has ? el('span', { class: 'wall__unit', text: 'min' }) : null,
      ])),
  ]);
}

/* The dollar figure, and only the dollar figure. Which of these are bills, which
   are list-rate estimates and which are reconstructed lower bounds is one
   sentence in the key, built from the rows on screen - printing the tag under
   all twenty-five of them was the same four words over and over. */
function costCell(run, costMax) {
  return el('td', { class: 'col--bar', role: 'cell', 'data-label': MOBILE_LABEL.cost_usd }, [
    barRow('cost', barRatio(run.cost_usd, costMax), null,
      el('span', { class: 'cost__val', text: (run.cost_estimated ? '≈' : '') + fmtCost(run.cost_usd) })),
  ]);
}

export function renderBody(bodyEl, runs, state, glossary, options = {}) {
  const { columns = COLUMNS, scoreTotal = TOTALS.fixed, timeLabel } = options;
  /* The scales come from the rows being drawn, so the leader fills its column
     and every other bar reads as a share of the leader. */
  const { fixedMax, extrasMax, wallMax, costMax } = barScales(runs);
  const cells = {
    model: (r) => modelCell(r, glossary),
    fixed: (r) => scoreCell(r, r.samples ? scoreTotal : fixedMax, scoreTotal),
    extras: (r) => extrasCell(r, extrasMax),
    wall_min: (r) => wallCell(r, wallMax, timeLabel),
    cost_usd: (r) => costCell(r, costMax),
  };
  bodyEl.textContent = '';
  bodyEl.setAttribute('role', 'rowgroup');
  const sorted = runs.slice().sort((a, b) => compareRuns(a, b, state.sort, state.dir));

  sorted.forEach((run) => {
    const tr = el('tr', {
      role: 'row',
      class: run.superseded ? 'is-superseded' : null,
      'data-run': run.slug,
      title: run.samples ? sampleTitle(run) : null,
    });

    columns.forEach(({ key }) => tr.appendChild(cells[key](run)));
    bodyEl.appendChild(tr);
  });

  return sorted;
}
