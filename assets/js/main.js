/* Bug Hunt Bench — bootstrap, state, URL sync.
   One selection drives the table, both maps and the export. State lives in the
   query string so any view can be linked and reloaded.

   This page is the board. The method, the caveats and the definitions live on
   /method, rendered from the same data file — never duplicated into markup —
   and everything here that needs one of them links at the exact anchor. */

import {
  COLUMNS, SCORE_BAR_NOTE, caveatHref, defHref, methodHref, slugify, fmtDate, el,
} from './format.js?v=5edf3dde1d';
import { renderHead, renderBody, renderColgroup } from './table.js?v=5edf3dde1d';
import { renderScatter, AXES } from './scatter.js?v=5edf3dde1d';
import { renderPicker } from './selector.js?v=5edf3dde1d';
import { exportView } from './export-png.js?v=5edf3dde1d';
import { initTheme, hasAdjustedColors } from './theme.js?v=5edf3dde1d';

const PRESETS = {
  featured: { test: (r) => r.featured === true, name: 'Featured runs' },
  all: { test: () => true, name: 'All runs' },
  ceiling: { test: (r) => r.ceiling === true, name: 'Ceiling runs only' },
  clear: { test: () => false, name: 'Nothing selected' },
};

/* The three views and the panels they live in. A fourth measure would mean an
   axis spec in scatter.js and a row here — not a new renderer. */
const VIEWS = {
  table: { panel: 'panel-table', tab: 'tab-table' },
  scatter: {
    panel: 'panel-scatter', tab: 'tab-scatter', axis: AXES.cost,
    host: 'chart', legend: 'chart-legend', empty: 'scatter-empty', note: 'axis-note',
  },
  time: {
    panel: 'panel-time', tab: 'tab-time', axis: AXES.time,
    host: 'chart-time', legend: 'time-legend', empty: 'time-empty', note: 'time-axis-note',
  },
};
const CHART_VIEWS = ['scatter', 'time'];

/* Which caveat belongs beside which map. Matched on its opening words, with the
   generator's current position as a fallback, so a reordered data file moves the
   right sentence rather than a confidently wrong one. */
const CHART_CAVEAT = {
  time: { index: 1, starts: 'Wall clock' },
  cost: { index: 2, starts: 'Cost' },
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
  /* A sort key that is no longer a column — an old ?sort=claimed_only link, say —
     is simply not applied, and the board opens on its default sort. A stale link
     has to degrade, never throw. */
  const sort = p.get('sort');
  if (sort && COLUMNS.some((c) => c.key === sort)) state.sort = sort;
  const dir = p.get('dir');
  if (dir === 'asc' || dir === 'desc') state.dir = dir;
  const view = p.get('view');
  if (VIEWS[view]) state.view = view;
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

/** The caveat that belongs to a map, and the anchor for the whole of it. */
function chartCaveat(axisId) {
  const spec = CHART_CAVEAT[axisId];
  if (!spec || !Array.isArray(DATA.caveats)) return null;
  const found = DATA.caveats.findIndex((c) => String(c).startsWith(spec.starts));
  const i = found >= 0 ? found : spec.index;
  const text = DATA.caveats[i];
  return text ? { text, href: caveatHref(i) } : null;
}

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

  /* The 105-tick measure rule — the one place on this page where a colour means
     something on its own account rather than identifying a run.

     Two states, and each carries three channels, because red-green is exactly
     the pair that fails for a deuteranope and on a mono printer: a bug fixed by
     at least one model is a HOLLOW GREEN tick at two-thirds height; a bug
     nothing has ever fixed is a SOLID RED tick at full height. Strip the colour
     and fill plus height still separate them; strip everything and the caption
     still names both. The survivors are the story, so they get the heavy mark. */
  const plot = $('tickrule-plot');
  plot.textContent = '';
  const survivorsFrom = m.planted_total - m.survivors;
  for (let i = 0; i < m.planted_total; i += 1) {
    plot.appendChild(el('span', { class: i >= survivorsFrom ? 'tick tick--survivor' : 'tick tick--fixed' }));
  }
  const cap = $('tickrule-caption');
  cap.textContent = '';
  cap.append(
    'Each tick is one of the ',
    el('b', { text: String(m.planted_total) }),
    ' planted bugs. ',
    el('span', { class: 'tickkey tickkey--fixed' }, [
      el('i', { class: 'tickkey__mark', 'aria-hidden': 'true' }),
      'Hollow green — fixed by at least one model, in any run to date',
    ]),
    ' (',
    el('b', { text: String(survivorsFrom) }),
    '). ',
    el('span', { class: 'tickkey tickkey--survivor' }, [
      el('i', { class: 'tickkey__mark', 'aria-hidden': 'true' }),
      'Solid red — never fixed, by anything',
    ]),
    ' (',
    el('b', { text: String(m.survivors) }),
    ').',
  );
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

/* -------------------------------------------------------------------- keys */

function keyList(prefix, labelPrefix) {
  const dl = el('dl', {});
  Object.entries(DATA.glossary)
    .filter(([k]) => k.startsWith(prefix))
    .forEach(([k, v]) => {
      // the term links at its own definition, not at the top of the method page
      dl.appendChild(el('dt', {}, [
        el('a', { class: 'deflink', href: defHref(k) }, [k.slice(prefix.length).replace(/_/g, ' ')]),
      ]));
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
      'Hatched grey, half height: ',
      el('a', { class: 'deflink', href: defHref('extras') }, ['extras']),
      '. Scaled against the highest extras count on the board, never against the score.',
    ]),
    el('p', {}, [
      el('span', { class: 'swatch-key swatch-key--meta' }),
      'Flat grey: wall clock and cost, each scaled to the highest figure on the board. Grey, never the run’s colour, because neither is the score — and a cost bar is only comparable to another bar with the same tag.',
    ]),
    el('p', {}, [
      el('b', { class: 'keys__dagger', text: '†' }),
      ' opens a row’s detail: ',
      el('a', { class: 'deflink', href: defHref('partial') }, ['partial']),
      ', ',
      el('a', { class: 'deflink', href: defHref('claimed_only') }, ['claimed only']),
      ', and any note, caveat or supersession the run carries. On a wall-clock figure it opens the note on that figure.',
    ]),
    hasAdjustedColors(RUNS)
      ? el('p', { class: 'note', text: 'In the dark theme a run colour that would be invisible on a dark surface is shown lightened. The hue is the run’s own; only the brightness moves, and only on screen.' })
      : null,
  ]));

  keys.appendChild(keyList('cost_', 'What the cost tag means'));
  keys.appendChild(keyList('effort_', 'What the effort tag means'));

  keys.appendChild(el('div', {}, [
    el('h3', { text: 'Variance' }),
    el('p', { text: DATA.caveats[0] }),
    el('p', {}, [
      'One run is one run. Read gaps of a point or two as noise. ',
      el('a', { class: 'deflink', href: methodHref('caveats') }, ['All four caveats']),
      '.',
    ]),
  ]));

  // the extras rule, pulled out beside the table where it can be misread
  $('extras-pullquote').textContent = DATA.method[DATA.method.length - 1];
}

/* ---------------------------------------------------------------- renderers */

const lastChartWidth = { scatter: 0, time: 0 };

/** The sentence that belongs to a map, drawn inside the plate with the plot. */
function chartFootnote(axisId) {
  const cav = chartCaveat(axisId);
  if (!cav) return null;
  return (L) => {
    const parts = [
      document.createTextNode(`${cav.text} `),
      el('a', { class: 'deflink', href: cav.href }, ['In the caveats']),
      document.createTextNode('.'),
    ];
    if (L.flagged && L.flagged.length) {
      parts.push(el('span', { class: 'chart__def-flag' }, [
        `† ${L.flagged.length} of the ${L.points.length} runs shown carry a note on their own figure — it is on the point, and on the row.`,
      ]));
    }
    return parts;
  };
}

function renderChart(key) {
  const V = VIEWS[key];
  const runs = selectedRuns();
  const legend = $(V.legend);
  legend.textContent = '';
  if (!runs.length) return;
  const L = renderScatter($(V.host), runs, RUNS, V.axis, chartFootnote(V.axis.id));
  lastChartWidth[key] = $(V.host).clientWidth;
  if (!L) return;
  L.points.slice().sort((a, b) => b.score - a.score).forEach((p) => {
    legend.appendChild(el('span', {}, [
      el('i', { style: { 'background-color': p.color } }),
      `${p.run.id} — ${p.run.fixed}`,
    ]));
  });
}

/* The picker is 25 runs deep and starts closed. Building it into the collapsed
   details put a few hundred words of markup between the reader and the board for
   nothing, so it is built when it is opened and dropped when it is shut. */
function renderPickerIfOpen() {
  const grid = $('picker-grid');
  if (!$('picker').open) {
    grid.textContent = '';
    return;
  }
  renderPicker(grid, RUNS, state.selected, onToggleRun, onToggleVendor);
}

function renderViews() {
  const runs = selectedRuns();
  const empty = runs.length === 0;

  $('table-empty').hidden = !empty;
  $('tablewrap').hidden = empty;
  $('extras-pullquote').hidden = empty;
  $('table-keys').hidden = empty;
  CHART_VIEWS.forEach((k) => {
    $(VIEWS[k].empty).hidden = !empty;
    $(VIEWS[k].host).hidden = empty;
    if (empty) $(VIEWS[k].legend).textContent = '';
  });
  $('export-png').disabled = empty;
  $('export-png').title = empty ? 'Select at least one run to export' : 'Download the current view as a PNG';

  renderHead($('board-head'), state, onSort);
  renderBody($('board-body'), runs, state, DATA.glossary, SCALES);

  if (!empty && VIEWS[state.view].axis) renderChart(state.view);

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
  renderPickerIfOpen();
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
  state.view = VIEWS[view] ? view : 'table';
  document.querySelectorAll('.tab').forEach((t) => {
    const on = t.dataset.view === state.view;
    t.setAttribute('aria-selected', String(on));
    t.tabIndex = on ? 0 : -1;
    if (on && focus) t.focus();
  });
  Object.entries(VIEWS).forEach(([k, V]) => { $(V.panel).hidden = k !== state.view; });
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

  $('picker').addEventListener('toggle', renderPickerIfOpen);

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
      const axis = VIEWS[state.view].axis || null;
      const cav = axis ? chartCaveat(axis.id) : null;
      await exportView({
        view: state.view,
        axis,
        runs: selectedRuns(),
        allRuns: RUNS,
        state,
        meta: DATA.meta,
        scales: SCALES,
        caveat: cav ? cav.text : null,
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
    CHART_VIEWS.forEach((k) => {
      const ro = new ResizeObserver(() => {
        if (state.view !== k) return;
        const w = $(VIEWS[k].host).clientWidth;
        if (Math.abs(w - lastChartWidth[k]) < 6) return;
        lastChartWidth[k] = w;
        renderViews();
      });
      ro.observe($(VIEWS[k].host));
    });
  }
}

/* -------------------------------------------------------------------- boot */

/* The method, the caveats and the definitions used to be sections of this page,
   and those anchors were in the masthead for long enough to have been shared.
   Send an old link to the section it names on the page that now holds it. */
const MOVED = { method: 'method', caveats: 'caveats', glossary: 'definitions' };

function forwardMovedAnchor() {
  const id = location.hash.replace('#', '');
  if (!MOVED[id]) return false;
  location.replace(methodHref(MOVED[id]));
  return true;
}

async function boot() {
  if (forwardMovedAnchor()) return;

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

  // both maps stop their score axis above the board's best run; say so in the note
  const best = RUNS.reduce((a, b) => (b.fixed > a.fixed ? b : a), RUNS[0]);
  const axisNote = `The score axis stops short of 105 on purpose — the best run on the board to date fixed ${best.fixed}, and a 0–105 axis would push every point into the bottom third. It is ticked in real fixed counts, and it moves with the board rather than with the selection.`;
  CHART_VIEWS.forEach((k) => {
    const node = $(VIEWS[k].note);
    if (node) node.textContent = axisNote;
  });

  renderHero();
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
