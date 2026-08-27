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
  barRatio, barScales, effortSuffix, effortDefKey, defHref, el, svgEl, compareRuns,
} from './format.js?v=3ee7e267ba';
import { runColor } from './theme.js?v=3ee7e267ba';

const MOBILE_LABEL = {
  fixed: 'Fixed of 105',
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

export function renderColgroup(tableEl) {
  const existing = tableEl.querySelector('colgroup');
  if (existing) existing.remove();
  const cg = el('colgroup');
  COLUMNS.forEach((c) => {
    const col = el('col');
    col.style.setProperty('width', `${c.pct}%`);
    cg.appendChild(col);
  });
  tableEl.insertBefore(cg, tableEl.firstChild);
}

export function renderHead(headEl, state, onSort) {
  headEl.textContent = '';
  headEl.setAttribute('role', 'rowgroup');

  const groupRow = el('tr', { class: 'groups', role: 'row' });
  GROUPS.forEach((g) => {
    const span = COLUMNS.filter((c) => c.group === g.id).length;
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
  COLUMNS.forEach((c) => {
    const active = state.sort === c.key;
    const cls = [];
    if (c.group !== 'run' && COLUMNS.filter((x) => x.group === c.group)[0].key === c.key) cls.push('divide');
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

/* The sentences a row carries. They used to open in a disclosure row under the
   grid; they now ride on the model cell as a plain title - still there for
   anyone who wants them, invisible to everyone who does not, and costing the
   table no height at all. */
function rowTitle(run) {
  return [
    run.superseded ? `Superseded: ${run.superseded}` : null,
    run.caveat ? `Caveat: ${run.caveat}` : null,
    run.note ? `Note: ${run.note}` : null,
  ].filter(Boolean).join('\n') || null;
}

/* Two lines at most: the name with its effort badge, then vendor - harness.
   The badge is the tier the run was asked for - MAX / XHIGH / HIGH / DEFAULT -
   and it says nothing else, because what DEFAULT means is one sentence in the
   key rather than two words on every row that has it. The single exception is
   the clamped run, where the tool ran something lower than the badge asked for:
   that is a published correction and it stays on its own row. Either way the
   badge links at its definition, which reads in plain English, from the data. */
function modelCell(run, glossary) {
  const meta = [run.vendor, run.harness].filter(Boolean).join(' · ');
  const defKey = effortDefKey(run);
  const suffix = effortSuffix(run);
  const badge = el('a', {
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

  const body = el('span', { class: 'model__body' }, [
    el('span', { class: 'model__name' }, [run.model, ' ', badge]),
    el('span', { class: 'model__meta' }, [
      document.createTextNode(meta),
      run.superseded ? document.createTextNode(' ') : null,
      run.superseded ? el('span', { class: 'tag tag--superseded', text: 'superseded' }) : null,
    ]),
  ]);
  return el('td', { class: 'model-cell', role: 'cell', title: rowTitle(run) }, [
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
function barRow(kind, ratio, color, value) {
  const blank = ratio === null || ratio === 0;
  const bar = el('span', { class: `bar bar--${kind}${blank ? ' bar--empty' : ''}` });
  bar.style.setProperty('width', blank ? '0'
    : `calc((100% - var(--reserve)) * ${ratio.toFixed(4)})`);
  if (color) bar.style.setProperty('background-color', color);
  return el('span', { class: `bar-row bar-row--${kind}` }, [
    bar,
    el('span', { class: 'bar-val' }, [value]),
  ]);
}

function scoreCell(run, fixedMax) {
  return el('td', {
    class: 'score divide col--bar', role: 'cell', 'data-label': MOBILE_LABEL.fixed,
  }, [
    barRow('score', barRatio(run.fixed, fixedMax), runColor(run.color),
      el('span', { class: 'score__num' }, [
        document.createTextNode(fmtInt(run.fixed)),
        el('span', { class: 'score__den', text: `/${TOTALS.fixed}` }),
      ])),
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
function wallCell(run, wallMax) {
  const has = run.wall_min !== null && run.wall_min !== undefined;
  return el('td', {
    class: 'divide col--bar',
    role: 'cell',
    'data-label': MOBILE_LABEL.wall_min,
    title: run.wall_note ? `Wall clock: ${run.wall_note}` : null,
  }, [
    barRow('wall', barRatio(run.wall_min, wallMax), null,
      el('span', {}, [
        el('span', { class: 'wall__num', text: fmtWall(run.wall_min) }),
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
      el('span', { class: 'cost__val', text: fmtCost(run.cost_usd) })),
  ]);
}

export function renderBody(bodyEl, runs, state, glossary) {
  /* The scales come from the rows being drawn, so the leader fills its column
     and every other bar reads as a share of the leader. */
  const { fixedMax, extrasMax, wallMax, costMax } = barScales(runs);
  bodyEl.textContent = '';
  bodyEl.setAttribute('role', 'rowgroup');
  const sorted = runs.slice().sort((a, b) => compareRuns(a, b, state.sort, state.dir));

  sorted.forEach((run) => {
    const tr = el('tr', {
      role: 'row',
      class: run.superseded ? 'is-superseded' : null,
      'data-run': run.slug,
    });

    tr.appendChild(modelCell(run, glossary));
    tr.appendChild(scoreCell(run, fixedMax));
    tr.appendChild(extrasCell(run, extrasMax));
    tr.appendChild(wallCell(run, wallMax));
    tr.appendChild(costCell(run, costMax));

    // The head is generated from COLUMNS but the body is appended by hand, so the two
    // can drift: dropping the date column from COLUMNS left this row one cell longer
    // than its header (2026-08-25). Fail loudly in that case rather than shipping a
    // table whose columns do not line up with their headings.
    if (tr.children.length !== COLUMNS.length) {
      throw new Error(`row has ${tr.children.length} cells, COLUMNS has ${COLUMNS.length}`);
    }
    bodyEl.appendChild(tr);
  });

  return sorted;
}
