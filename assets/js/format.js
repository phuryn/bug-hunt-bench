/* Shared vocabulary, formatters and column definitions.
   Every label the reader sees comes from here; raw enum values never reach the DOM. */

export const TOTALS = { fixed: 105, repo1_fixed: 45, repo2_fixed: 60 };

/* Bar geometry reference for the score.
   The score is out of 105 and every printed value still says so. The BAR is
   drawn against 100, exactly as on the printed card: with a 105-unit track the
   whole board lives between 8% and 40% and the differences that matter stop
   being visible. 100 is a reference length, not a denominator — a run cannot
   reach it either. The note below is the one place this is spelled out, and it
   is used verbatim on the page and in the PNG export so a screenshot that
   travels on its own carries it too. */
export const SCORE_BAR_REF = 100;
export const SCORE_BAR_NOTE = 'Bar length is drawn against a 100-unit reference so the runs spread out and can be told apart. The score itself is unchanged and still out of 105 — the number printed at the end of each bar is the real one.';

export const EFFORT_STATUS_LABEL = {
  first_party: 'first-party tier',
  verified: 'verified',
  verified_ceiling: 'verified ceiling',
  clamped: 'clamped',
  inert_default: 'inert default',
};

export const COST_KIND_LABEL = {
  bill: 'bill',
  list: 'list rate',
  floor: 'floor',
  free: 'free',
};

/** Turn a glossary key into a readable term. Generic, so new keys keep working. */
export function glossaryTerm(key) {
  if (key.startsWith('cost_')) return 'Cost: ' + key.slice(5).replace(/_/g, ' ');
  if (key.startsWith('effort_')) return 'Effort: ' + key.slice(7).replace(/_/g, ' ');
  const words = key.replace(/_/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function slugify(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function fmtDate(iso) {
  if (!iso) return '—';
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  return `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]} ${m[1]}`;
}

export function fmtDateLong(iso) {
  if (!iso) return '';
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  return `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]} ${m[1]}`;
}

export function fmtCost(v) {
  if (v === null || v === undefined) return '—';
  return '$' + v.toFixed(2);
}

export function fmtWall(v) {
  if (v === null || v === undefined) return '—';
  return v.toFixed(1);
}

/** Bar width as a share of the track, with the value's own width reserved out of it.
    Kept here because the table and the PNG export must agree on the geometry. */
export function barRatio(value, max) {
  if (value === null || value === undefined || !(max > 0)) return null;
  return Math.max(0, Math.min(1, value / max));
}

export function fmtInt(v) {
  return v === null || v === undefined ? '—' : String(v);
}

/** Column model, shared by the table, the sorter and the PNG export.
    `pct` sizes the on-screen colgroup; `w` is the export's own ratio, tuned
    separately because the canvas has no line wrapping and the model column needs
    more room there than it does on screen. */
export const COLUMNS = [
  { key: 'model', label: 'Model / run', group: 'run', kind: 'text', align: 'left', pct: 18, w: 270 },
  { key: 'fixed', label: 'Fixed', unit: '/105', group: 'score', kind: 'score', align: 'left', pct: 22, w: 260 },
  { key: 'repo1_fixed', label: 'Repo 1', unit: '/45', group: 'score', pct: 6.5, w: 68 },
  { key: 'repo2_fixed', label: 'Repo 2', unit: '/60', group: 'score', pct: 6.5, w: 68 },
  { key: 'extras', label: 'Extras', group: 'not', kind: 'extras', align: 'left', pct: 9, w: 104 },
  { key: 'wall_min', label: 'Wall clock', unit: 'min', group: 'meta', kind: 'wall', align: 'left', pct: 13.5, w: 152 },
  { key: 'cost_usd', label: 'Cost', unit: 'usd', group: 'meta', kind: 'cost', align: 'left', pct: 16, w: 196 },
  { key: 'date', label: 'Date', group: 'meta', kind: 'date', pct: 8.5, w: 92 },
];

/* Partial and claimed-only are NOT columns. Most rows are zero on both, and two
   more columns of width bought a reader nothing on the grid. They are still on
   the board — every row's detail carries them, labelled and linked to their own
   definition — because "claimed only: 0" is a real signal about a model, just
   not one worth a column. Keys the row detail prints, in this order. */
export const DETAIL_FIGURES = [
  { key: 'partial', label: 'Partial' },
  { key: 'claimed_only', label: 'Claimed only' },
];

export const GROUPS = [
  { id: 'run', label: '', cls: 'g-run' },
  { id: 'score', label: 'Score — planted bugs only', cls: 'g-score', def: 'fixed' },
  { id: 'not', label: 'Tracked, not scored', cls: 'g-not', def: 'extras' },
  { id: 'meta', label: 'Run', cls: 'g-meta' },
];

/* The method, the caveats and the definitions live on their own page now, so the
   board opens on the board. Everything that needs one of them links to the exact
   anchor rather than to the top of that page. One place builds those links. */
export const METHOD_PATH = '/method';
export const methodHref = (hash) => (hash ? `${METHOD_PATH}#${hash}` : METHOD_PATH);
/** Anchor for a glossary key, matched by the id method.js stamps on each term. */
export const defHref = (key) => methodHref(`def-${key}`);
export const caveatHref = (i) => methodHref(`caveat-${i + 1}`);

/** First sentence of a data string, for places that have room for one line.
    Falls back to the whole string rather than to a truncation that could cut a
    qualifier off a claim. */
export function firstSentence(s) {
  const str = String(s || '').trim();
  const m = /^(.+?[.!?])(\s|$)/.exec(str);
  return m && m[1].length >= 40 ? m[1] : str;
}

/** Sort comparator. Nulls and undefined always sort last, whichever direction. */
export function compareRuns(a, b, key, dir) {
  const sign = dir === 'asc' ? 1 : -1;
  let av;
  let bv;
  if (key === 'model') {
    av = a.id.toLowerCase();
    bv = b.id.toLowerCase();
  } else {
    av = a[key];
    bv = b[key];
  }
  const aNull = av === null || av === undefined || av === '';
  const bNull = bv === null || bv === undefined || bv === '';
  if (aNull && bNull) return 0;
  if (aNull) return 1;
  if (bNull) return -1;
  if (typeof av === 'string') return av.localeCompare(bv) * sign;
  if (av === bv) return 0;
  return (av < bv ? -1 : 1) * sign;
}

/** Build a display label for a run inside a chart, disambiguating shared model names. */
export function pointLabels(runs) {
  const byModel = new Map();
  runs.forEach((r) => {
    if (!byModel.has(r.model)) byModel.set(r.model, []);
    byModel.get(r.model).push(r);
  });
  const out = new Map();
  byModel.forEach((group) => {
    if (group.length === 1) {
      out.set(group[0].id, group[0].model);
      return;
    }
    group.forEach((r) => {
      const sameEffort = group.filter((g) => g.effort === r.effort);
      const label = sameEffort.length > 1
        ? `${r.model} · ${r.effort} · ${fmtDate(r.date).replace(/ \d{4}$/, '')}`
        : `${r.model} · ${r.effort}`;
      out.set(r.id, label);
    });
  });
  return out;
}

/** An <a> to a definition on the method page. Text in as text, never as markup. */
export function defLink(key, label) {
  return el('a', { class: 'deflink', href: defHref(key) }, [label]);
}

/** DOM helper. Text always goes in as text — never as markup. */
export function el(tag, attrs, children) {
  const node = document.createElement(tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (v === false || v === null || v === undefined) continue;
      if (k === 'text') node.textContent = v;
      else if (k === 'class') node.className = v;
      else if (k === 'dataset') Object.assign(node.dataset, v);
      else if (k === 'style') for (const [p, pv] of Object.entries(v)) node.style.setProperty(p, pv);
      else if (v === true) node.setAttribute(k, '');
      else node.setAttribute(k, v);
    }
  }
  if (children) {
    (Array.isArray(children) ? children : [children]).forEach((c) => {
      if (c === null || c === undefined) return;
      node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
  }
  return node;
}

const SVG_NS = 'http://www.w3.org/2000/svg';

export function svgEl(tag, attrs, children) {
  const node = document.createElementNS(SVG_NS, tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (v === false || v === null || v === undefined) continue;
      if (k === 'text') node.textContent = v;
      else node.setAttribute(k, v);
    }
  }
  if (children) {
    (Array.isArray(children) ? children : [children]).forEach((c) => {
      if (c === null || c === undefined) return;
      node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
  }
  return node;
}

/** Text measurement that matches what the browser will actually draw. */
let measureCtx = null;
export function measureText(text, font) {
  if (!measureCtx) measureCtx = document.createElement('canvas').getContext('2d');
  measureCtx.font = font;
  return measureCtx.measureText(text).width;
}
