/* The leaderboard table.
   One bar per row and it is the score. Extras get a hatched grey ghost bar at half
   the height, in a column group headed "Tracked, not scored", so the two can never
   be read as the same quantity. */

import {
  COLUMNS, GROUPS, TOTALS, EFFORT_STATUS_LABEL, COST_KIND_LABEL,
  fmtCost, fmtWall, fmtInt, fmtDate, el, svgEl, compareRuns,
} from './format.js';

const MOBILE_LABEL = {
  fixed: 'Fixed of 105',
  repo1_fixed: 'Repo 1 of 45',
  repo2_fixed: 'Repo 2 of 60',
  partial: 'Partial',
  claimed_only: 'Claimed only',
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
    groupRow.appendChild(el('th', {
      colspan: span > 1 ? span : null,
      scope: g.label ? 'colgroup' : null,
      class: [g.cls, g.label ? 'divide' : ''].filter(Boolean).join(' '),
      text: g.label,
      role: 'columnheader',
    }));
  });
  headEl.appendChild(groupRow);

  const colRow = el('tr', { class: 'cols', role: 'row' });
  COLUMNS.forEach((c) => {
    const active = state.sort === c.key;
    const th = el('th', {
      scope: 'col',
      role: 'columnheader',
      class: c.group !== 'run' && COLUMNS.filter((x) => x.group === c.group)[0].key === c.key ? 'divide' : null,
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
      el('span', { class: 'swatch', style: { 'background-color': run.color } }),
      body,
    ]),
  ]);
}

function scoreCell(run) {
  const pct = (run.fixed / TOTALS.fixed) * 100;
  const fill = el('span', { class: 'score__fill' });
  fill.style.setProperty('width', `${pct}%`);
  fill.style.setProperty('background-color', run.color);
  return el('td', {
    class: 'score divide', role: 'cell', 'data-label': MOBILE_LABEL.fixed,
  }, [
    el('span', { class: 'score__inner' }, [
      el('span', { class: 'score__track' }, [fill]),
      el('span', { class: 'score__num' }, [
        document.createTextNode(fmtInt(run.fixed)),
        el('span', { class: 'score__den', text: `/${TOTALS.fixed}` }),
      ]),
    ]),
  ]);
}

function extrasCell(run, extrasMax) {
  const pct = extrasMax > 0 ? (run.extras / extrasMax) * 100 : 0;
  const fill = el('span', { class: 'extras__fill' });
  fill.style.setProperty('width', `${pct}%`);
  return el('td', {
    class: 'extras', role: 'cell', 'data-label': MOBILE_LABEL.extras,
  }, [
    el('span', { class: 'extras__inner' }, [
      el('span', { class: 'extras__track' }, [fill]),
      el('span', { class: 'extras__num', text: fmtInt(run.extras) }),
    ]),
  ]);
}

function costCell(run, glossary) {
  const kind = COST_KIND_LABEL[run.cost_kind] || run.cost_kind;
  return el('td', { role: 'cell', 'data-label': MOBILE_LABEL.cost_usd }, [
    el('span', { class: 'cost' }, [
      el('span', { class: 'cost__val', text: fmtCost(run.cost_usd) }),
      el('abbr', {
        class: 'cost__kind',
        text: kind,
        title: glossary[`cost_${run.cost_kind}`] || kind,
      }),
    ]),
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

function annotationRow(run, colCount) {
  const cell = el('td', { colspan: colCount, role: 'cell' });
  const parts = [
    ['Superseded', run.superseded],
    ['Caveat', run.caveat],
    ['Note', run.note],
  ];
  parts.forEach(([label, textValue]) => {
    if (!textValue) return;
    cell.appendChild(el('p', {}, [el('b', { text: label }), document.createTextNode(textValue)]));
  });
  const row = el('tr', { class: 'annotation-row', role: 'row' }, [cell]);
  return row;
}

export function renderBody(bodyEl, runs, state, glossary, extrasMax) {
  bodyEl.textContent = '';
  bodyEl.setAttribute('role', 'rowgroup');
  const sorted = runs.slice().sort((a, b) => compareRuns(a, b, state.sort, state.dir));

  sorted.forEach((run) => {
    const tr = el('tr', {
      role: 'row',
      class: run.superseded ? 'is-superseded' : null,
      'data-run': run.slug,
    });

    const mCell = modelCell(run, glossary);
    const hasNote = Boolean(run.superseded || run.caveat || run.note);
    let noteRow = null;
    if (hasNote) {
      noteRow = annotationRow(run, COLUMNS.length);
      noteRow.hidden = true;
      const btn = el('button', {
        type: 'button',
        class: 'notebtn',
        'aria-expanded': 'false',
        title: 'Show the note on this run',
        text: '†',
      });
      btn.setAttribute('aria-label', `Show the note on ${run.id}`);
      btn.addEventListener('click', () => {
        const open = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', open ? 'false' : 'true');
        noteRow.hidden = open;
      });
      mCell.querySelector('.model__meta').appendChild(btn);
    }
    tr.appendChild(mCell);

    tr.appendChild(scoreCell(run));
    tr.appendChild(numCell(run.repo1_fixed, MOBILE_LABEL.repo1_fixed));
    tr.appendChild(numCell(run.repo2_fixed, MOBILE_LABEL.repo2_fixed));
    const partial = numCell(run.partial, MOBILE_LABEL.partial);
    partial.classList.add('divide');
    tr.appendChild(partial);
    tr.appendChild(numCell(run.claimed_only, MOBILE_LABEL.claimed_only, 'num--flag'));
    tr.appendChild(extrasCell(run, extrasMax));
    const wall = numCell(run.wall_min === null ? null : fmtWall(run.wall_min), MOBILE_LABEL.wall_min);
    wall.classList.add('divide');
    tr.appendChild(wall);
    tr.appendChild(costCell(run, glossary));
    tr.appendChild(el('td', { role: 'cell', 'data-label': MOBILE_LABEL.date }, [
      el('time', { datetime: run.date, text: fmtDate(run.date) }),
    ]));

    bodyEl.appendChild(tr);
    if (noteRow) bodyEl.appendChild(noteRow);
  });

  return sorted;
}

/* numCell takes pre-formatted strings for floats; keep integers going through fmtInt. */
