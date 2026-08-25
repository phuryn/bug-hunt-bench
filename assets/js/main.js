/* Bug Hunt Bench — bootstrap, state, URL sync.
   One selection drives the table, the chart and the export. State lives in the query
   string so any view can be linked and reloaded. */

import {
  COLUMNS, SCORE_BAR_NOTE, glossaryTerm, slugify, fmtDate, el,
} from './format.js';
import { renderHead, renderBody, renderColgroup } from './table.js';
import { renderScatter } from './scatter.js';
import { renderPicker } from './selector.js';
import { exportView } from './export-png.js';
import { initTheme, hasAdjustedColors } from './theme.js';

const PRESETS = {
  featured: { test: (r) => r.featured === true, name: 'Featured runs' },
  all: { test: () => true, name: 'All runs' },
  ceiling: { test: (r) => r.ceiling === true, name: 'Ceiling runs only' },
  clear: { test: () => false, name: 'Nothing selected' },
};

const state = {
  selected: new Set(),
  sort: 'fixed',
  dir: 'desc',
  view: 'table',
  preset: 'featured',
};

let DATA = null;
let RUNS = [];
/* Bar scales are taken from the whole board, never from the current selection:
   changing what is selected must not silently rescale the rows that survive. */
let SCALES = { extrasMax: 0, wallMax: 0, costMax: 0 };
let SITE_URL = '';

const NUMBER_WORD = ['no', 'one', 'Two', 'Three', 'Four', 'Five', 'Six'];

const $ = (id) => document.getElementById(id);

/* ------------------------------------------------------------------ state */

function selectedRuns() {
  return RUNS.filter((r) => state.selected.has(r.slug));
}

function applyPreset(key) {
  state.preset = key;
  state.selected = new Set(RUNS.filter(PRESETS[key].test).map((r) => r.slug));
}

function detectPreset() {
  for (const key of Object.keys(PRESETS)) {
    const set = new Set(RUNS.filter(PRESETS[key].test).map((r) => r.slug));
    if (set.size === state.selected.size && [...set].every((s) => state.selected.has(s))) {
      return key;
    }
  }
  return null;
}

function readUrl() {
  const p = new URLSearchParams(location.search);
  const runsParam = p.get('runs');
  if (runsParam !== null) {
    const wanted = new Set(runsParam.split(',').filter(Boolean));
    state.selected = new Set(RUNS.filter((r) => wanted.has(r.slug)).map((r) => r.slug));
    state.preset = detectPreset();
  } else {
    const preset = p.get('preset');
    applyPreset(PRESETS[preset] ? preset : 'featured');
  }
  const sort = p.get('sort');
  if (sort && COLUMNS.some((c) => c.key === sort)) state.sort = sort;
  const dir = p.get('dir');
  if (dir === 'asc' || dir === 'desc') state.dir = dir;
  const view = p.get('view');
  if (view === 'scatter' || view === 'table') state.view = view;
}

function writeUrl() {
  const p = new URLSearchParams();
  if (state.preset) p.set('preset', state.preset);
  else p.set('runs', [...state.selected].join(','));
  if (state.sort !== 'fixed') p.set('sort', state.sort);
  if (state.dir !== 'desc') p.set('dir', state.dir);
  if (state.view !== 'table') p.set('view', state.view);
  const qs = p.toString();
  history.replaceState(null, '', qs ? `?${qs}` : location.pathname);
}

/* ------------------------------------------------------------- static bits */

function renderHero() {
  const m = DATA.meta;
  const updated = fmtDate(m.updated);
  ['hero-updated', 'footer-updated'].forEach((id) => {
    const t = $(id);
    t.setAttribute('datetime', m.updated);
    t.textContent = updated;
  });

  /* Kicker, headline, standfirst — the card's hierarchy. The headline is the
     finding, built from the data file like everything else; the product name
     lives in the kicker and the masthead. The markup ships "Bug Hunt Bench" as
     the h1 so a crawler that runs no JavaScript still gets a heading, and no
     figure is ever typed into the HTML. */
  const repos = [m.repo1_total, m.repo2_total].filter((v) => typeof v === 'number').length;
  const h1 = $('page-title');
  h1.textContent = '';
  h1.append(
    el('em', { text: `${m.planted_total} planted bugs.` }),
    ` ${NUMBER_WORD[repos]} repos. ${m.models} frontier models, ${m.runs} runs.`,
  );
  $('hero-lede').textContent = m.subtitle;
  if (m.source_repo) $('source-link').href = m.source_repo;

  // the 105-tick measure rule
  const plot = $('tickrule-plot');
  plot.textContent = '';
  const survivorsFrom = m.planted_total - m.survivors;
  for (let i = 0; i < m.planted_total; i += 1) {
    plot.appendChild(el('span', { class: i >= survivorsFrom ? 'is-survivor' : null }));
  }
  const brace = el('div', { class: 'tickrule__brace' });
  brace.style.setProperty('width', `${(m.survivors / m.planted_total) * 100}%`);
  plot.after(brace);
  const cap = $('tickrule-caption');
  cap.textContent = '';
  cap.append(
    'Each tick is one of the ',
    el('b', { text: String(m.planted_total) }),
    ' planted bugs. The ',
    el('b', { text: String(m.survivors) }),
    ' solid ticks have survived every model in every run to date.',
  );

  const best = RUNS.reduce((a, b) => (b.fixed > a.fixed ? b : a), RUNS[0]);
  const facts = [
    ['Planted bugs', String(m.planted_total), `${m.repo1_total} in repo 1 · ${m.repo2_total} in repo 2`],
    ['Survived everything', String(m.survivors), 'no model, no run, no round'],
    ['Models · runs', `${m.models} · ${m.runs}`, 'a model can appear at several tiers'],
    ['Best run to date', `${best.fixed} / ${m.planted_total}`, `${best.model} · ${fmtDate(best.date)}`],
  ];
  const dl = $('hero-facts');
  dl.textContent = '';
  facts.forEach(([term, value, note]) => {
    dl.appendChild(el('div', {}, [
      el('dt', { text: term }),
      el('dd', {}, [value, el('small', { text: note })]),
    ]));
  });
}

function renderProse() {
  const body = $('method-body');
  body.textContent = '';
  DATA.method.forEach((p, i) => {
    body.appendChild(el('div', { class: 'method-p' }, [
      el('span', { class: 'n', text: String(i + 1) }),
      el('p', { text: p }),
    ]));
  });

  const caveats = $('caveats-body');
  caveats.textContent = '';
  DATA.caveats.forEach((c) => caveats.appendChild(el('li', { text: c })));

  const gloss = $('glossary-body');
  gloss.textContent = '';
  Object.entries(DATA.glossary).forEach(([k, v]) => {
    gloss.appendChild(el('dt', { text: glossaryTerm(k) }));
    gloss.appendChild(el('dd', { text: v }));
  });

  // the extras rule, pulled out beside the table where it can be misread
  $('extras-pullquote').textContent = DATA.method[DATA.method.length - 1];
}

function keyList(prefix, labelPrefix) {
  const dl = el('dl', {});
  Object.entries(DATA.glossary)
    .filter(([k]) => k.startsWith(prefix))
    .forEach(([k, v]) => {
      dl.appendChild(el('dt', { text: k.slice(prefix.length).replace(/_/g, ' ') }));
      dl.appendChild(el('dd', { text: v }));
    });
  return el('div', {}, [el('h3', { text: labelPrefix }), dl]);
}

function renderKeys() {
  const keys = $('table-keys');
  keys.textContent = '';

  keys.appendChild(el('div', {}, [
    el('h3', { text: 'Reading the bars' }),
    el('p', {}, [
      el('span', { class: 'swatch-key swatch-key--score' }),
      'Solid, in the run’s own colour: planted bugs fixed, out of 105.',
    ]),
    el('p', { class: 'note', text: SCORE_BAR_NOTE }),
    el('p', {}, [
      el('span', { class: 'swatch-key swatch-key--extras' }),
      'Hatched grey, half height: extras. Scaled against the highest extras count on the board, never against the score.',
    ]),
    el('p', {}, [
      el('span', { class: 'swatch-key swatch-key--meta' }),
      'Flat grey: wall clock and cost, each scaled to the highest figure on the board. Grey, never the run’s colour, because neither is the score — and a cost bar is only comparable to another bar with the same tag.',
    ]),
    el('p', { text: '† marks a run carrying a note, a caveat, or a supersession. Open it on the row.' }),
    hasAdjustedColors(RUNS)
      ? el('p', { class: 'note', text: 'In the dark theme a run colour that would be invisible on a dark surface is shown lightened. The hue is the run’s own; only the brightness moves, and only on screen.' })
      : null,
  ]));

  keys.appendChild(keyList('cost_', 'What the cost tag means'));
  keys.appendChild(keyList('effort_', 'What the effort tag means'));

  keys.appendChild(el('div', {}, [
    el('h3', { text: 'Variance' }),
    el('p', { text: DATA.caveats[0] }),
    el('p', { text: 'One run is one run. Read gaps of a point or two as noise.' }),
  ]));
}

function patchSchema() {
  const node = $('dataset-schema');
  if (!node) return;
  try {
    const json = JSON.parse(node.textContent);
    json.dateModified = DATA.meta.updated;
    if (SITE_URL) {
      json.url = SITE_URL;
      json.distribution.contentUrl = `${SITE_URL}data/benchmark.json`;
    }
    if (DATA.meta.source_repo) json.sameAs = DATA.meta.source_repo;
    node.textContent = JSON.stringify(json, null, 2);
  } catch (err) {
    /* a malformed block is a build problem, not a runtime one — leave it alone */
  }
}

/* ---------------------------------------------------------------- renderers */

let lastChartWidth = 0;

function renderViews() {
  const runs = selectedRuns();
  const empty = runs.length === 0;

  $('table-empty').hidden = !empty;
  $('tablewrap').hidden = empty;
  $('extras-pullquote').hidden = empty;
  $('table-keys').hidden = empty;
  $('scatter-empty').hidden = !empty;
  $('chart').hidden = empty;
  $('export-png').disabled = empty;
  $('export-png').title = empty ? 'Select at least one run to export' : 'Download the current view as a PNG';

  renderHead($('board-head'), state, onSort);
  renderBody($('board-body'), runs, state, DATA.glossary, SCALES);

  const legend = $('chart-legend');
  legend.textContent = '';
  if (state.view === 'scatter' && !empty) {
    const L = renderScatter($('chart'), runs, RUNS);
    lastChartWidth = $('chart').clientWidth;
    if (L) {
      L.points.slice().sort((a, b) => b.score - a.score).forEach((p) => {
        legend.appendChild(el('span', {}, [
          el('i', { style: { 'background-color': p.color } }),
          `${p.run.id} — ${p.run.fixed}`,
        ]));
      });
    }
  }

  const label = state.preset ? PRESETS[state.preset].name : 'Custom selection';
  $('picker-summary').textContent = '';
  $('picker-summary').append(
    'Choose runs — ',
    el('b', { text: `${runs.length} of ${RUNS.length}` }),
    ` selected · ${label}`,
  );
  document.querySelectorAll('.preset').forEach((b) => {
    b.setAttribute('aria-pressed', String(b.dataset.preset === state.preset));
  });
}

function renderAll() {
  renderPicker($('picker-grid'), RUNS, state.selected, onToggleRun, onToggleVendor);
  renderKeys();
  renderViews();
  writeUrl();
}

/* ------------------------------------------------------------------ events */

function onSort(key) {
  if (state.sort === key) {
    state.dir = state.dir === 'asc' ? 'desc' : 'asc';
  } else {
    state.sort = key;
    state.dir = key === 'model' || key === 'date' ? 'asc' : 'desc';
  }
  const hadFocus = document.activeElement && document.activeElement.classList.contains('sortbtn');
  renderViews();
  // the header is rebuilt on every sort, so hand focus back to the column just used
  if (hadFocus) {
    const idx = COLUMNS.findIndex((c) => c.key === key);
    const btn = document.querySelectorAll('#board-head .cols .sortbtn')[idx];
    if (btn) btn.focus();
  }
  writeUrl();
}

function onToggleRun(slug, on) {
  if (on) state.selected.add(slug);
  else state.selected.delete(slug);
  state.preset = detectPreset();
  renderViews();
  writeUrl();
}

function onToggleVendor(group, on) {
  group.forEach((r) => {
    if (on) state.selected.add(r.slug);
    else state.selected.delete(r.slug);
  });
  state.preset = detectPreset();
  renderAll();
}

function setView(view, focus) {
  state.view = view;
  document.querySelectorAll('.tab').forEach((t) => {
    const on = t.dataset.view === view;
    t.setAttribute('aria-selected', String(on));
    t.tabIndex = on ? 0 : -1;
    if (on && focus) t.focus();
  });
  $('panel-table').hidden = view !== 'table';
  $('panel-scatter').hidden = view !== 'scatter';
  renderViews();
  writeUrl();
}

function wire() {
  document.querySelectorAll('.preset').forEach((btn) => {
    btn.addEventListener('click', () => {
      applyPreset(btn.dataset.preset);
      renderAll();
    });
  });

  const tabs = [...document.querySelectorAll('.tab')];
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => setView(tab.dataset.view));
    tab.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      setView(next.dataset.view, true);
    });
  });

  document.querySelectorAll('[data-goto-view]').forEach((b) => {
    b.addEventListener('click', () => {
      setView(b.dataset.gotoView, true);
      $('panel-table').scrollIntoView({ block: 'start', behavior: 'smooth' });
    });
  });

  const exportBtn = $('export-png');
  exportBtn.addEventListener('click', async () => {
    const original = exportBtn.textContent;
    exportBtn.classList.add('is-busy');
    exportBtn.textContent = 'Rendering…';
    try {
      await exportView({
        view: state.view,
        runs: selectedRuns(),
        allRuns: RUNS,
        state,
        meta: DATA.meta,
        scales: SCALES,
        siteUrl: SITE_URL || location.origin + location.pathname,
        presetName: state.preset ? PRESETS[state.preset].name : 'Custom selection',
      });
    } finally {
      exportBtn.classList.remove('is-busy');
      exportBtn.textContent = original;
    }
  });

  window.addEventListener('popstate', () => {
    readUrl();
    renderAll();
    setView(state.view);
  });

  if (window.ResizeObserver) {
    const ro = new ResizeObserver(() => {
      if (state.view !== 'scatter') return;
      const w = $('chart').clientWidth;
      if (Math.abs(w - lastChartWidth) < 6) return;
      lastChartWidth = w;
      renderViews();
    });
    ro.observe($('chart'));
  }
}

/* -------------------------------------------------------------------- boot */

async function boot() {
  const canonical = document.querySelector('link[rel="canonical"]');
  SITE_URL = canonical ? canonical.href : '';

  const res = await fetch('data/benchmark.json', { cache: 'no-cache' });
  DATA = await res.json();

  RUNS = DATA.runs.map((r) => ({ ...r, slug: slugify(r.id) }));
  const maxOf = (key) => Math.max(0, ...RUNS.map((r) => r[key] || 0));
  SCALES = { extrasMax: maxOf('extras'), wallMax: maxOf('wall_min'), costMax: maxOf('cost_usd') };

  const board = document.getElementById('board');
  board.setAttribute('role', 'table');
  renderColgroup(board);

  // the scatter's y-axis stops above the board's best run; say so in the note
  const best = RUNS.reduce((a, b) => (b.fixed > a.fixed ? b : a), RUNS[0]);
  const axisNote = $('axis-note');
  if (axisNote) {
    axisNote.textContent = `The score axis stops short of 105 on purpose — the best run on the board to date fixed ${best.fixed}, and a 0–105 axis would push every point into the bottom third. It is ticked in real fixed counts, and it moves with the board rather than with the selection.`;
  }

  renderHero();
  renderProse();
  renderKeys();
  patchSchema();

  readUrl();
  wire();
  // a theme change repaints every run colour, so the whole board is rebuilt
  initTheme(() => renderAll());
  renderAll();
  setView(state.view);
}

boot().catch((err) => {
  const host = document.getElementById('panel-table');
  if (host) {
    host.textContent = '';
    host.appendChild(el('p', {
      class: 'empty',
      text: 'The benchmark data could not be loaded. Read it directly at data/benchmark.json.',
    }));
  }
  throw err;
});
