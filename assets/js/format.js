/* Shared vocabulary, formatters and column definitions.
   Every label the reader sees comes from here; raw enum values never reach the DOM. */

export const TOTALS = { fixed: 105, repo1_fixed: 45, repo2_fixed: 60 };

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

export function fmtInt(v) {
  return v === null || v === undefined ? '—' : String(v);
}

/** Column model, shared by the table, the sorter and the PNG export. */
export const COLUMNS = [
  { key: 'model', label: 'Model / run', group: 'run', kind: 'text', align: 'left', pct: 21.5, w: 244 },
  { key: 'fixed', label: 'Fixed', unit: '/105', group: 'score', kind: 'score', pct: 15.5, w: 196 },
  { key: 'repo1_fixed', label: 'Repo 1', unit: '/45', group: 'score', pct: 6, w: 64 },
  { key: 'repo2_fixed', label: 'Repo 2', unit: '/60', group: 'score', pct: 6, w: 64 },
  { key: 'partial', label: 'Partial', group: 'not', pct: 6, w: 62 },
  { key: 'claimed_only', label: 'Claimed only', group: 'not', pct: 7.5, w: 86 },
  { key: 'extras', label: 'Extras', group: 'not', kind: 'extras', pct: 9, w: 106 },
  { key: 'wall_min', label: 'Wall clock', unit: 'min', group: 'meta', pct: 9.5, w: 108 },
  { key: 'cost_usd', label: 'Cost', unit: 'usd', group: 'meta', kind: 'cost', pct: 11, w: 118 },
  { key: 'date', label: 'Date', group: 'meta', kind: 'date', pct: 8, w: 90 },
];

export const GROUPS = [
  { id: 'run', label: '', cls: 'g-run' },
  { id: 'score', label: 'Score — planted bugs only', cls: 'g-score' },
  { id: 'not', label: 'Tracked, not scored', cls: 'g-not' },
  { id: 'meta', label: 'Run', cls: 'g-meta' },
];

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
