/* Shared vocabulary, formatters and column definitions.
   Every label the reader sees comes from here; raw enum values never reach the DOM. */

export const TOTALS = { fixed: 105, repo1_fixed: 45, repo2_fixed: 60 };

/* Bar geometry.
   Every bar on the board is scaled to the LONGEST figure among the rows
   currently shown, so the leading run fills its column and every other bar is
   read as a share of the leader rather than as a share of an abstract track.
   The printed value is untouched and still carries its own denominator (42/105),
   because the length answers "how does this compare" and the number answers
   "what was it". Scaling to the selection means filtering re-lengthens the
   survivors, which is the point: the reader is always comparing what is on
   screen. The note below is the one place this is spelled out, and it is used
   verbatim on the page and in the PNG export so a screenshot that travels on
   its own carries it too. */
export const BAR_SCALE_NOTE = 'Every bar is scaled to the longest figure among the runs shown, so the leader fills its column and the rest read as a share of it. The printed number is always the real one — the score is still out of 105.';

/** The four bar scales, taken from the rows being drawn. One helper, because
    the table and the PNG export must agree on the geometry. */
export function barScales(runs) {
  const maxOf = (key) => Math.max(0, ...runs.map((r) => r[key] || 0));
  return {
    fixedMax: maxOf('fixed'),
    extrasMax: maxOf('extras'),
    wallMax: maxOf('wall_min'),
    costMax: maxOf('cost_usd'),
  };
}

/* The effort a run was asked for is the badge: MAX / XHIGH / HIGH / DEFAULT.
   The two-word status vocabulary that used to be printed beside it -
   "first-party tier", "verified ceiling", "inert default" - asked the reader to
   hold two independent facts at once (was the setting checked, and is it the
   model's top setting) and scrambled into "inert ceiling" on the way back out.
   The enum stays a machine key, and the words come off the grid: what DEFAULT
   means is one sentence in the key under the table, not two words repeated down
   a column of six rows.

   Exactly one case keeps its words on the row. `clamped` means the tool was
   asked for a higher tier and quietly ran a lower one - a published correction
   on a single run, and a key cannot carry a correction for a row a reader may
   never scroll past. Everything else is one click away on the method page, in
   plain English, straight from the data file. */
export const EFFORT_SUFFIX = {
  verified_ceiling: null,
  verified: null,
  first_party: null,
  clamped: 'ran lower',
  inert_default: null,
};

/** The words to print after the effort badge, or null when the badge says it
    all. An unknown status is shown rather than swallowed: a new enum value from
    the generator should be visible, not silently dropped. */
export function effortSuffix(run) {
  const status = run.effort_status;
  if (!status) return null;
  if (!(status in EFFORT_SUFFIX)) return String(status).replace(/_/g, ' ');
  return EFFORT_SUFFIX[status];
}

/** Glossary key for a run's effort status, so a badge can link at its definition. */
export const effortDefKey = (run) => (run.effort_status ? `effort_${run.effort_status}` : null);

/* A figure that carries a note of its own is marked on the charts, where the
   axis would otherwise be misread. One glyph, defined once: the table no longer
   carries a mark at all, so this is not the dagger it used to share. */
export const NOTE_MARK = '*';

/* What kind of dollar figure this is, in words a reader does not have to look
   up: "floor" alone read as jargon beside a number, and a reconstructed lower
   bound is exactly the case where a reader must not assume a bill. The full
   definition stays one click away on the method page. */
export const COST_KIND_LABEL = {
  bill: 'billed',
  list: 'list rate',
  floor: 'lower bound',
  free: 'free',
};

/* The same four kinds, as they read inside a sentence. The board no longer tags
   every dollar figure - a word under all twenty-five of them was the same word
   over and over - so the exceptions are named once, in the key, in prose. */
export const COST_KIND_PHRASE = {
  bill: { one: 'a real bill', many: 'real bills' },
  list: { one: 'a list-rate estimate', many: 'list-rate estimates' },
  floor: { one: 'a reconstructed lower bound', many: 'reconstructed lower bounds' },
  free: { one: 'free', many: 'free' },
};

const isNum = (v) => v !== null && v !== undefined && !Number.isNaN(v);

/** How to name a group of runs in the sentence: their model names, collapsed to
    the family when they all share one ("Grok 4.6" + "Grok 4.5" -> "Grok
    figures"), so the sentence names runs the way a reader would. Parenthetical
    qualifiers are dropped; they are on the row. */
function familyNames(rows) {
  const clean = (m) => String(m).replace(/\s*\([^)]*\)\s*/g, ' ').replace(/\s+/g, ' ').trim();
  const names = [...new Set(rows.map((r) => clean(r.model)).filter(Boolean))];
  const firsts = new Set(names.map((n) => n.split(' ')[0]));
  if (names.length > 1 && firsts.size === 1) return { names: [`${[...firsts][0]} figures`], plural: true };
  return { names, plural: names.length > 1 };
}

function listNames(names) {
  if (names.length <= 2) return names.join(' and ');
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

/** The half of a definition that explains the term, if it has one: everything
    after the dash or colon the generator writes ("Reconstructed lower bound -
    this CLI reports context occupancy, not billing"). */
function explanationTail(def) {
  const m = /^[^-:—]+[-:—]\s*(.+)$/.exec(String(def || '').trim());
  if (!m) return null;
  return m[1].replace(/\s*\.\s*$/, '');
}

/* Which costs are bills and which are estimates, said once for the rows on
   screen instead of on every row. Built from the data, so a new arm, a changed
   tag or a different selection rewrites the sentence rather than dating it.
   Returns segments - plain text, or text that links at its own definition - so
   the page can render links and the PNG export can render the same words flat. */
export function costSentence(runs, glossary) {
  const rows = runs.filter((r) => isNum(r.cost_usd) && r.cost_kind);
  if (!rows.length) return null;
  const groups = new Map();
  rows.forEach((r) => {
    if (!groups.has(r.cost_kind)) groups.set(r.cost_kind, []);
    groups.get(r.cost_kind).push(r);
  });
  /* The kind most rows share leads the sentence; the exceptions follow in the
     vocabulary's own order, so the same selection always reads the same way. */
  const vocab = Object.keys(COST_KIND_PHRASE);
  const rank = (k) => (vocab.indexOf(k) < 0 ? vocab.length : vocab.indexOf(k));
  const order = [...groups.entries()]
    .sort((a, b) => b[1].length - a[1].length || rank(a[0]) - rank(b[0]));

  const phrase = (kind, plural) => {
    const p = COST_KIND_PHRASE[kind];
    if (!p) return COST_KIND_LABEL[kind] || kind;
    return plural ? p.many : p.one;
  };
  const verb = (kind, plural) => {
    if (kind === 'free') return plural ? 'were' : 'was';
    return plural ? 'are' : 'is';
  };
  const gloss = glossary || {};
  const seg = [];
  const [leadKind, leadRows] = order[0];

  if (order.length === 1) {
    seg.push({ text: rows.length > 1 ? 'Every cost shown is ' : 'The cost shown is ' });
    seg.push({ text: phrase(leadKind, false), def: `cost_${leadKind}` });
    seg.push({ text: '.' });
    return seg;
  }

  seg.push({ text: leadRows.length > 1 ? 'Costs are ' : 'The cost is ' });
  seg.push({ text: phrase(leadKind, leadRows.length > 1), def: `cost_${leadKind}` });
  seg.push({ text: ' unless noted: ' });
  order.slice(1).forEach(([kind, rs], i) => {
    if (i) seg.push({ text: '; ' });
    const { names, plural } = familyNames(rs);
    seg.push({ text: `${listNames(names)} ${verb(kind, plural)} ` });
    seg.push({ text: phrase(kind, plural), def: `cost_${kind}` });
    const tail = explanationTail(gloss[`cost_${kind}`]);
    if (tail) seg.push({ text: ` (${tail})` });
  });
  seg.push({ text: '.' });
  return seg;
}

/** The same sentence as flat text, for the canvas, which has no links. */
export const segmentsText = (seg) => (seg ? seg.map((s) => s.text).join('') : '');

/* How each effort key is NAMED on the definitions page. The board shows the
   badge and, in two cases, two words; a reader who follows one of those links
   has to land on the same words, not on the enum. Kept beside the suffix map so
   the two cannot drift. */
export const EFFORT_TERM = {
  verified_ceiling: 'its max',
  verified: 'setting checked',
  first_party: 'the vendor’s own setting',
  clamped: 'ran lower',
  inert_default: 'no dial',
};

/** Turn a glossary key into a readable term — the same words the board prints.
    Falls back to the key itself, so a term the generator adds still renders. */
export function glossaryTerm(key) {
  if (key.startsWith('cost_')) {
    const k = key.slice(5);
    return 'Cost: ' + (COST_KIND_LABEL[k] || k.replace(/_/g, ' '));
  }
  if (key.startsWith('effort_')) {
    const k = key.slice(7);
    return 'Effort: ' + (EFFORT_TERM[k] || k.replace(/_/g, ' '));
  }
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
  { key: 'model', label: 'Model / run', group: 'run', kind: 'text', align: 'left', pct: 24, w: 300 },
  { key: 'fixed', label: 'Fixed', unit: '/105', group: 'score', kind: 'score', align: 'left', pct: 26, w: 300 },
  { key: 'extras', label: 'Extras', group: 'not', kind: 'extras', align: 'left', pct: 11, w: 130 },
  { key: 'wall_min', label: 'Wall clock', unit: 'min', group: 'meta', kind: 'wall', align: 'left', pct: 14.5, w: 170 },
  { key: 'cost_usd', label: 'Cost', unit: 'usd', group: 'meta', kind: 'cost', align: 'left', pct: 15.5, w: 190 },
  { key: 'date', label: 'Date', group: 'meta', kind: 'date', pct: 9, w: 100 },
];

/* Six columns, and the ones that are NOT here are a decision, not an oversight.
   The repo 1 / repo 2 split is in the data and on the method page: it is how the
   105 bugs are distributed, not a ranking, and two narrow number columns bought
   the dashboard nothing. Partial and claimed-only are in the data and defined on
   the method page too — most rows are zero on both. A ?sort= link naming any of
   them is simply not applied (main.js validates against this list), so an old
   link opens on the default sort instead of throwing. */

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
