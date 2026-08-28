/* Bug Hunt Bench — bootstrap, state, URL sync.
   One selection drives the table, both maps and the export. State lives in the
   query string so any view can be linked and reloaded.

   This page is the board. The method, the caveats and the definitions live on
   /method, rendered from the same data file — never duplicated into markup —
   and everything here that needs one of them links at the exact anchor. */

import {
  COLUMNS, BAR_SCALE_NOTE, NOTE_MARK, costSentence, firstSentence,
  caveatHref, defHref, methodHref, slugify, fmtDate, el, EFFORT_RANK,
} from './format.js?v=1417b1e724';
import { renderHead, renderBody, renderColgroup } from './table.js?v=1417b1e724';
import { renderScatter, AXES } from './scatter.js?v=1417b1e724';
import { renderPicker } from './selector.js?v=1417b1e724';
import { exportView } from './export-png.js?v=1417b1e724';
import { initTheme, hasAdjustedColors } from './theme.js?v=1417b1e724';
import { renderCoverage, coverageOrderNote, coverageSummaryNote } from './coverage.js?v=1417b1e724';

const PRESETS = {
  featured: { test: (r) => r.featured === true, name: 'Featured runs' },
  all: { test: () => true, name: 'All runs' },
  ceiling: { test: (r) => r.ceiling === true, name: 'Ceiling runs only' },
  /* One row per vendor: its best `fixed` score, ties broken by the cheaper
     run. RUNS never carries a superseded row — newestPerTier() filters those
     out at boot — so "non-superseded" needs no test of its own here. Exists
     to keep the Coverage view readable: the full board is 20+ rows of ticks,
     this is one per lab. */
  'best-per-lab': {
    name: 'Best per lab',
    select: (runs) => {
      const bestByVendor = new Map();
      runs.forEach((r) => {
        const cur = bestByVendor.get(r.vendor);
        const better = !cur
          || r.fixed > cur.fixed
          || (r.fixed === cur.fixed && (r.cost_usd ?? Infinity) < (cur.cost_usd ?? Infinity));
        if (better) bestByVendor.set(r.vendor, r);
      });
      return new Set([...bestByVendor.values()].map((r) => r.slug));
    },
  },
  clear: { test: () => false, name: 'Nothing selected' },
};

/** A preset's selected slugs. Most presets are a per-row test; "best per lab"
    is a per-vendor pick that has to see every run at once. One entry point
    either way, so applyPreset/detectPreset don't care which kind a preset is. */
function presetSlugs(key, runs) {
  const p = PRESETS[key];
  return p.select ? p.select(runs) : new Set(runs.filter(p.test).map((r) => r.slug));
}

/* The four views and the panels they live in. Score-vs-cost and score-vs-time
   share one axis-driven renderer (scatter.js) — a fifth x/y measure there
   would mean an axis spec and a row here, not a new renderer. Coverage has no
   axis: it is its own renderer (coverage.js), wired in below. */
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
  coverage: {
    panel: 'panel-coverage', tab: 'tab-coverage',
    host: 'coverage-host', empty: 'coverage-empty', note: 'coverage-note',
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
let SITE_URL = '';
// set once at boot: whether any run on the board carries `fixed_bugs` at all
let coverageEnabled = false;

const NUMBER_WORD = ['no', 'one', 'Two', 'Three', 'Four', 'Five', 'Six'];

const $ = (id) => document.getElementById(id);

/* ------------------------------------------------------------------ state */

function selectedRuns() {
  return RUNS.filter((r) => state.selected.has(r.slug));
}

function applyPreset(key) {
  state.preset = key;
  state.selected = presetSlugs(key, RUNS);
}

function detectPreset() {
  for (const key of Object.keys(PRESETS)) {
    const set = presetSlugs(key, RUNS);
    if (set.size === state.selected.size && [...set].every((s) => state.selected.has(s))) {
      return key;
    }
  }
  return null;
}

/* Coverage needs `fixed_bugs` on at least one run; older data won't have it
   yet (see the data contract this view was built against). The tab is hidden
   rather than shown pointing at an always-empty view, and a stale ?view=
   link that names it anyway falls back to the table. */
function sanitizeView() {
  if (state.view === 'coverage' && !coverageEnabled) state.view = 'table';
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
  const wrap = document.getElementById('hero-updated-wrap');
  if (wrap) wrap.hidden = false;   // only once there is a date to show
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
     at least one model is a SOLID GREEN tick; a bug nothing has ever fixed is a
     HOLLOW RED tick. Equal height, so the rule reads as one measure of 105 and
     the difference is fill, not size (Pawel, 2026-08-25). Strip the colour
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
      'Solid green — fixed by at least one model, in any run to date',
    ]),
    ' (',
    el('b', { text: String(survivorsFrom) }),
    '). ',
    el('span', { class: 'tickkey tickkey--survivor' }, [
      el('i', { class: 'tickkey__mark', 'aria-hidden': 'true' }),
      'Hollow red — never fixed, by anything',
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

/* The key carries the vocabulary the grid no longer prints. A cell shows a
   number; what kind of number it is is said ONCE, here, for the rows on screen -
   because a tag under every dollar figure and a status beside every model name
   is the same word repeated twenty-five times, which is noise a reader has to
   step over on the way to the figures. Everything here is generated from the
   data file and from the current selection, so it cannot go stale or contradict
   the board, and every term links at its full definition on the method page. */


/** The effort tiers actually on screen, in the order a reader ranks them. */
function tiersShown(runs) {
  const tiers = [...new Set(runs.map((r) => r.effort).filter(Boolean))];
  return tiers.sort((a, b) => {
    const ra = EFFORT_RANK.indexOf(String(a).toLowerCase());
    const rb = EFFORT_RANK.indexOf(String(b).toLowerCase());
    return (ra < 0 ? EFFORT_RANK.length : ra) - (rb < 0 ? EFFORT_RANK.length : rb);
  }).map((t) => String(t).toUpperCase());
}

/** The generated cost sentence, with each kind linked at its own definition. */
function costKey(runs) {
  const seg = costSentence(runs, DATA.glossary);
  if (!seg) return null;
  const p = el('p', {});
  seg.forEach((part) => {
    p.appendChild(part.def
      ? el('a', { class: 'deflink', href: defHref(part.def) }, [part.text])
      : document.createTextNode(part.text));
  });
  return el('div', {}, [el('h3', { text: 'What the costs are' }), p]);
}

/* The badge is the tier the run asked for. Two statuses need a sentence, and
   both are printed only when a row on screen actually carries one: DEFAULT,
   which is not a tier at all but a route with no working dial, and the clamped
   run, which is the one row still carrying words of its own. */
function effortKey(runs) {
  const block = el('div', {}, [
    el('h3', { text: 'What the effort badge means' }),
    el('p', {}, [`The tier the run was asked for: ${tiersShown(runs).join(' · ')}. Every badge links at its own definition.`]),
  ]);
  const line = (status, term) => {
    if (!runs.some((r) => r.effort_status === status)) return;
    const def = DATA.glossary[`effort_${status}`];
    if (!def) return;
    block.appendChild(el('p', {}, [
      el('a', { class: 'deflink keys__term', href: defHref(`effort_${status}`) }, [term]),
      ` — ${firstSentence(def)}`,
    ]));
  };
  line('inert_default', 'DEFAULT');
  line('clamped', 'ran lower');
  return block;
}

function renderKeys() {
  const keys = $('table-keys');
  const runs = selectedRuns();
  keys.textContent = '';
  /* the key describes the rows on screen, so with none on screen there is
     nothing to describe - and the whole block is hidden anyway */
  if (!runs.length) return;

  keys.appendChild(el('div', {}, [
    el('h3', { text: 'Reading the bars' }),
    el('p', {}, [
      el('span', { class: 'swatch-key swatch-key--score' }),
      'Solid, in the run’s own colour: planted bugs fixed, out of 105.',
    ]),
    el('p', { class: 'note', text: BAR_SCALE_NOTE }),
    el('p', {}, [
      el('span', { class: 'swatch-key swatch-key--extras' }),
      'Hatched grey, half height: ',
      el('a', { class: 'deflink', href: defHref('extras') }, ['extras']),
      '. Scaled against extras, never against the score.',
    ]),
    el('p', {}, [
      el('span', { class: 'swatch-key swatch-key--meta' }),
      'Flat grey: wall clock and cost. Grey, never the run’s colour, because neither is the score.',
    ]),
    el('p', {}, [
      'Not on the grid: ',
      el('a', { class: 'deflink', href: defHref('partial') }, ['partial']),
      ' and ',
      el('a', { class: 'deflink', href: defHref('claimed_only') }, ['claimed-only']),
      ' fixes, and the repo 1 / repo 2 split. All four are in the data and on the ',
      el('a', { class: 'deflink', href: methodHref('definitions') }, ['method page']),
      '.',
    ]),
    hasAdjustedColors(RUNS)
      ? el('p', { class: 'note', text: 'In the dark theme a run colour that would be invisible on a dark surface is shown lightened. The hue is the run’s own; only the brightness moves, and only on screen.' })
      : null,
  ]));

  const cost = costKey(runs);
  if (cost) keys.appendChild(cost);
  keys.appendChild(effortKey(runs));

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
        `${NOTE_MARK} ${L.flagged.length} of the ${L.points.length} runs shown carry a note on how that figure was taken — the marked points, and the caveat above.`,
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
      `${p.run.model}${p.run.effort ? ` · ${p.run.effort}` : ''} — ${p.run.fixed}`,
    ]));
  });
}

/** Coverage: which bugs each selected run fixed. Redrawn on every selection
    change, because the column order and the summary counts are both a
    property of the selection, not fixed facts about the data. */
function renderCoverageView() {
  const runs = selectedRuns();
  const L = renderCoverage($('coverage-host'), runs, DATA.meta, DATA.glossary);
  const note = $('coverage-note');
  note.textContent = '';
  if (!L) return;
  note.appendChild(el('p', { class: 'chart__note', text: coverageOrderNote(L) }));
  const summary = coverageSummaryNote(L);
  if (summary) note.appendChild(el('p', { class: 'chart__note', text: summary }));
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
  $('coverage-empty').hidden = !empty;
  $('coverage-host').hidden = empty;
  if (empty) $('coverage-note').textContent = '';
  $('export-png').disabled = empty;
  $('export-png').title = empty ? 'Select at least one run to export' : 'Download the current view as a PNG';

  renderHead($('board-head'), state, onSort);
  renderBody($('board-body'), runs, state, DATA.glossary);
  /* the key names the exceptions among the rows on screen, so it is rebuilt
     with them - not once at boot */
  renderKeys();

  if (!empty && VIEWS[state.view].axis) renderChart(state.view);
  else if (!empty && state.view === 'coverage') renderCoverageView();

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

  // a hidden tab (Coverage, with no coverage data on the board) is not a stop
  // on the keyboard cycle any more than it is a click target
  const tabs = [...document.querySelectorAll('.tab')].filter((t) => !t.hidden);
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
        glossary: DATA.glossary,
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
    sanitizeView();
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

/* The board shows exactly one run per (model, effort): the newest by date.
   Superseded rows and older duplicates drop out of every view, the picker and the
   export — the full history stays on GitHub. Order is preserved from the data file
   (emitted vendor -> model -> effort), so filtering never reshuffles the groups. */
function newestPerTier(runs) {
  const newest = new Map();
  for (const r of runs) {
    const k = `${r.model}|${r.effort}`;
    const cur = newest.get(k);
    if (!cur || String(r.date || '') > String(cur.date || '')) newest.set(k, r);
  }
  const keep = new Set(newest.values());
  return runs.filter((r) => keep.has(r));
}

async function boot() {
  if (forwardMovedAnchor()) return;

  const canonical = document.querySelector('link[rel="canonical"]');
  SITE_URL = canonical ? canonical.href : '';

  const res = await fetch('data/benchmark.json', { cache: 'no-cache' });
  DATA = await res.json();

  RUNS = newestPerTier(DATA.runs.filter((r) => !r.superseded)).map((r) => ({ ...r, slug: slugify(r.id) }));

  // Coverage needs at least one run with per-bug data; hide the tab rather
  // than open onto a view that can only ever say "no per-bug data available".
  coverageEnabled = RUNS.some((r) => Array.isArray(r.fixed_bugs));
  const coverageTab = $('tab-coverage');
  if (coverageTab) coverageTab.hidden = !coverageEnabled;

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
  sanitizeView();
  wire();
  // a theme change repaints every run colour, so the whole board is rebuilt
  initTheme(() => renderAll());
  renderAll();
  setView(state.view);

  // the board is real now; the placeholder has done its job
  ['board-skeleton', 'tickrule-skeleton'].forEach((id) => {
    const n = document.getElementById(id);
    if (n) n.remove();
  });
  document.documentElement.classList.remove('is-loading');
}

boot().catch((err) => {
  // never leave the skeleton pulsing forever - a failed load must look failed
  ['board-skeleton', 'tickrule-skeleton'].forEach((id) => {
    const n = document.getElementById(id);
    if (n) n.remove();
  });
  document.documentElement.classList.remove('is-loading');
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
