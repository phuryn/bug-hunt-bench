/* The leaderboard table.
   Four bars per row, on the card's rhythm: bar from the left edge of the cell,
   value printed at its end. They are deliberately not interchangeable.

     score   the run's own colour, full height, drawn against a 100-unit reference
     extras  grey hatch at half height, scaled to the biggest extras count on the
             board, sitting in a column group headed "Tracked, not scored"
     wall    flat neutral grey, scaled to the slowest run on the board
     cost    flat neutral grey, scaled to the dearest run on the board, and the
             bill / list / floor / free tag stays printed beside the figure,
             because a bar makes lengths look comparable and these are not

   Only the score bar ever carries a run's colour. */

import {
  COLUMNS, GROUPS, TOTALS, SCORE_BAR_REF, EFFORT_STATUS_LABEL, COST_KIND_LABEL,
  DETAIL_FIGURES, fmtCost, fmtWall, fmtInt, fmtDate, barRatio, defHref, defLink,
  el, svgEl, compareRuns,
} from './format.js?v=5edf3dde1d';
import { runColor } from './theme.js?v=5edf3dde1d';

const MOBILE_LABEL = {
  fixed: 'Fixed of 105',
  repo1_fixed: 'Repo 1 of 45',
  repo2_fixed: 'Repo 2 of 60',
  extras: 'Extras (not scored)',
  wall_min: 'Wall clock (min)',
  cost_usd: 'Cost',
  date: 'Date',
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
      scope: g.label ? 'colgroup' : null,
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

function modelCell(run, glossary) {
  const meta = [run.vendor, run.harness].filter(Boolean).join(' · ');
  const statusLabel = EFFORT_STATUS_LABEL[run.effort_status] || run.effort_status;
  const body = el('span', { class: 'model__body' }, [
    el('span', { class: 'model__name' }, [
      run.model,
      ' ',
      el('span', {
        class: 'badge',
        text: run.effort,
        title: `Reasoning effort tier requested for this run: ${run.effort}`,
      }),
    ]),
    el('span', { class: 'model__meta' }, [
      el('span', {
        class: 'status',
        text: statusLabel,
        title: glossary[`effort_${run.effort_status}`] || '',
      }),
      document.createTextNode(` · ${meta}`),
      run.superseded ? document.createTextNode(' ') : null,
      run.superseded ? el('span', { class: 'tag tag--superseded', text: 'superseded' }) : null,
    ]),
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

function scoreCell(run) {
  return el('td', {
    class: 'score divide col--bar', role: 'cell', 'data-label': MOBILE_LABEL.fixed,
  }, [
    barRow('score', barRatio(run.fixed, SCORE_BAR_REF), runColor(run.color),
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
   figure was taken, and those rows say so where the figure is, not only in the
   caveats: the dagger sits on the cell and opens the same row detail. */
function wallCell(run, wallMax) {
  const has = run.wall_min !== null && run.wall_min !== undefined;
  const cell = el('td', {
    class: `divide col--bar${run.wall_note ? ' has-note' : ''}`,
    role: 'cell',
    'data-label': MOBILE_LABEL.wall_min,
  }, [
    barRow('wall', barRatio(run.wall_min, wallMax), null,
      el('span', {}, [
        el('span', { class: 'wall__num', text: fmtWall(run.wall_min) }),
        has ? el('span', { class: 'wall__unit', text: 'min' }) : null,
      ])),
  ]);
  return cell;
}

function costCell(run, glossary, costMax) {
  const kind = COST_KIND_LABEL[run.cost_kind] || run.cost_kind;
  const has = run.cost_usd !== null && run.cost_usd !== undefined;
  return el('td', { class: 'col--bar', role: 'cell', 'data-label': MOBILE_LABEL.cost_usd }, [
    barRow('cost', barRatio(run.cost_usd, costMax), null,
      el('span', { class: 'cost' }, [
        el('span', { class: 'cost__val', text: fmtCost(run.cost_usd) }),
        has ? el('abbr', {
          class: 'cost__kind',
          text: kind,
          title: glossary[`cost_${run.cost_kind}`] || kind,
        }) : null,
      ])),
  ]);
}

function numCell(value, label, extraClass) {
  const cls = ['num'];
  if (value === 0) cls.push('num--zero');
  else if (extraClass) cls.push(extraClass);
  return el('td', { role: 'cell', 'data-label': label }, [
    el('span', { class: cls.join(' '), text: fmtInt(value) }),
  ]);
}

/* Every row has a detail now, because partial and claimed-only live here rather
   than in two columns of mostly zeroes. The figures come first, each label
   linked to its own definition; then the wall-clock note, then whatever the run
   carries — a supersession, a caveat, a note. */
function detailRow(run, colCount) {
  const cell = el('td', { colspan: colCount, role: 'cell' });

  const figs = el('p', { class: 'detail__figs' });
  DETAIL_FIGURES.forEach(({ key, label }, i) => {
    if (i) figs.appendChild(el('span', { class: 'detail__sep', text: '·' }));
    figs.appendChild(el('span', { class: 'detail__fig' }, [
      defLink(key, label),
      el('b', {
        class: run[key] ? 'detail__val' : 'detail__val detail__val--zero',
        text: fmtInt(run[key]),
      }),
    ]));
  });
  cell.appendChild(figs);

  [
    ['Wall clock', run.wall_note],
    ['Superseded', run.superseded],
    ['Caveat', run.caveat],
    ['Note', run.note],
  ].forEach(([label, textValue]) => {
    if (!textValue) return;
    cell.appendChild(el('p', {}, [el('b', { text: label }), document.createTextNode(textValue)]));
  });

  return el('tr', { class: 'annotation-row', role: 'row' }, [cell]);
}

/* One disclosure, two places that can open it: the model name and — when the row
   has one — the wall-clock figure. Both buttons stay in step, because a reader
   who opened it from one and sees the other still claiming "collapsed" has been
   told something untrue. */
function makeToggle(run, row, buttons, where) {
  const btn = el('button', {
    type: 'button',
    class: 'notebtn',
    'aria-expanded': 'false',
    'aria-controls': `detail-${run.slug}`,
    text: '†',
  });
  btn.setAttribute('aria-label', where === 'wall'
    ? `Show the note on the wall-clock figure for ${run.id}`
    : `Show the detail for ${run.id}`);
  btn.title = where === 'wall'
    ? 'How this wall-clock figure was taken'
    : 'Partial, claimed-only and any note on this run';
  btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') === 'true';
    row.hidden = open;
    buttons.forEach((b) => b.setAttribute('aria-expanded', open ? 'false' : 'true'));
  });
  buttons.push(btn);
  return btn;
}

export function renderBody(bodyEl, runs, state, glossary, scales) {
  const { extrasMax, wallMax, costMax } = scales;
  bodyEl.textContent = '';
  bodyEl.setAttribute('role', 'rowgroup');
  const sorted = runs.slice().sort((a, b) => compareRuns(a, b, state.sort, state.dir));

  sorted.forEach((run) => {
    const tr = el('tr', {
      role: 'row',
      class: run.superseded ? 'is-superseded' : null,
      'data-run': run.slug,
    });

    const detail = detailRow(run, COLUMNS.length);
    detail.hidden = true;
    detail.querySelector('td').id = `detail-${run.slug}`;
    const buttons = [];

    const mCell = modelCell(run, glossary);
    mCell.querySelector('.model__meta').appendChild(makeToggle(run, detail, buttons, 'model'));
    tr.appendChild(mCell);

    tr.appendChild(scoreCell(run));
    tr.appendChild(numCell(run.repo1_fixed, MOBILE_LABEL.repo1_fixed));
    tr.appendChild(numCell(run.repo2_fixed, MOBILE_LABEL.repo2_fixed));
    tr.appendChild(extrasCell(run, extrasMax));
    const wall = wallCell(run, wallMax);
    if (run.wall_note) wall.querySelector('.bar-val').appendChild(makeToggle(run, detail, buttons, 'wall'));
    tr.appendChild(wall);
    tr.appendChild(costCell(run, glossary, costMax));
    tr.appendChild(el('td', { role: 'cell', 'data-label': MOBILE_LABEL.date }, [
      el('time', { datetime: run.date, text: fmtDate(run.date) }),
    ]));

    bodyEl.appendChild(tr);
    bodyEl.appendChild(detail);
  });

  return sorted;
}
