/* The three maps: score against cost, against wall clock, and against turns.
   One layout function, one renderer, three axis specs — the only thing that differs
   between them is the x measure, its scale and the sentence under the plot.
   Layout is computed in a pure function so the on-screen SVG and the PNG export
   cannot drift apart.

   EVERY MAP HAS A LOG / LINEAR SWITCH (2026-09-29), and every map opens on log.
   The old split - cost and turns logarithmic, wall clock linear - rested on a
   sentence that said minutes spanned "under sevenfold". They did, until Sonnet 5.5
   at max took four hours: the board then spanned 68-fold and the linear time map
   pushed most runs into its left fifth. Log is the default because on all three
   measures the board spans well over an order of magnitude; linear stays one click
   away, because it is the honest picture of distance - equal steps are equal
   dollars, minutes or turns. The sentence under each map is COMPUTED from the board
   (scaleSentence), never typed, so it cannot go stale the way that one did. */

import {
  pointLabels, fmtCost, fmtWall, fmtTurns, fmtDate, COST_KIND_LABEL, NOTE_MARK, svgEl, el, measureText, EFFORT_RANK,
} from './format.js?v=d69cab3767';
import { runColor } from './theme.js?v=d69cab3767';

const LABEL_FONT = '10.5px Inter, system-ui, sans-serif';
const LOG_TICKS = [0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500];
const TURN_TICKS = [10, 20, 50, 100, 200, 500, 1000, 2000, 5000];
const MINUTE_TICKS = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
const CEILING = 105;

export const SCALES = ['log', 'linear'];

/* The x measures. `flag` names the field that marks a value as carrying its own
   note on how it was taken; a flagged point is drawn differently and says why.
   A spec here carries no scale: scaledAxis() adds one, with the titles that name it. */
export const AXES = {
  cost: {
    id: 'cost',
    key: 'cost_usd',
    defaultScale: 'log',
    name: 'Run cost, USD',
    nameCompact: 'Cost, USD',
    noun: 'Cost',
    unit: 'dollars',
    better: 'cheaper to the left',
    logTicks: LOG_TICKS,
    tickLabel: (t) => (t === 0 ? '$0' : t < 1 ? `$${t.toFixed(2).replace(/0$/, '')}` : `$${t}`),
    corner: 'cheap and strong',
    chartTitle: 'Score against cost',
    slug: 'score-vs-cost',
    fmt: fmtCost,
    flag: null,
  },
  time: {
    id: 'time',
    key: 'wall_min',
    defaultScale: 'log',
    name: 'Wall clock, minutes',
    nameCompact: 'Wall clock, min',
    noun: 'Wall clock',
    unit: 'minutes',
    better: 'faster to the left',
    logTicks: MINUTE_TICKS,
    tickLabel: (t) => String(t),
    corner: 'fast and strong',
    chartTitle: 'Score against wall clock',
    slug: 'score-vs-time',
    fmt: (v) => `${fmtWall(v)} min`,
    flag: 'wall_note',
  },
  turns: {
    id: 'turns',
    key: 'turns',
    defaultScale: 'log',
    name: 'Turns',
    nameCompact: 'Turns',
    noun: 'Turns',
    plural: true,
    unit: 'turns',
    better: 'fewer to the left',
    logTicks: TURN_TICKS,
    tickLabel: (t) => fmtTurns(t),
    corner: 'lean and strong',
    chartTitle: 'Score against turns',
    slug: 'score-vs-turns',
    fmt: (v) => `${fmtTurns(v)} turns`,
    flag: null,
  },
};

/** An axis spec with a scale applied: the titles name the scale, and a
    non-default scale gets its own export file name. */
export function scaledAxis(axis, scale) {
  const s = SCALES.includes(scale) ? scale : axis.defaultScale;
  const title = `${axis.name} — ${s === 'log' ? 'logarithmic' : 'linear'}, ${axis.better}`;
  return {
    ...axis,
    scale: s,
    title,
    titleCompact: `${axis.nameCompact} (${s === 'log' ? 'log' : 'linear'})`,
    exportTitle: title.toUpperCase(),
    slug: s === axis.defaultScale ? axis.slug : `${axis.slug}-${s}`,
  };
}

/** Accepts a scaled axis, a bare spec (gets its default scale) or nothing (cost). */
export function resolveAxis(axis) {
  const a = axis || AXES.cost;
  return a.scale ? a : scaledAxis(a);
}

/** The sentence under a map: which scale it is on, and how wide the board is on
    that measure - read from the board every time, so it cannot go stale. */
export function scaleSentence(axis, allRuns) {
  const A = resolveAxis(axis);
  const vals = allRuns.map((r) => r[A.key]).filter((v) => v !== null && v !== undefined);
  const pos = vals.filter((v) => v > 0);
  if (pos.length < 2) return '';
  const lo = Math.min(...pos);
  const hi = Math.max(...pos);
  const zeros = vals.length - pos.length;
  const fold = Math.round(hi / lo).toLocaleString('en-US');
  const [it, runs] = A.plural ? ['they', 'run'] : ['it', 'runs'];
  const span = `across the board ${it} ${runs} from ${A.fmt(lo)} to ${A.fmt(hi)}`
    + `${zeros ? ` (not counting ${zeros === 1 ? 'one run' : `${zeros} runs`} at zero)` : ''}, a ${fold}-fold spread`;
  const is = A.plural ? 'are' : 'is';
  return A.scale === 'log'
    ? `${A.noun} ${is} on a logarithmic axis: ${span}, and on a linear axis most runs would crowd into the left margin. Each step along it is a multiple, not a fixed number of ${A.unit}.`
    : `${A.noun} ${is} on a linear axis from zero, so equal distances are equal ${A.unit} — but ${span}, so the low end crowds together.`;
}

/* What each map measures, in the words a sentence needs ("no turn figure"). */
const MEASURE_NAME = { cost: 'cost', time: 'wall-clock', turns: 'turn' };
const MEASURE_ARIA = { cost: 'run cost', time: 'wall clock', turns: 'turns taken' };

/* The y-axis stops just above the best run on the whole board, not at 105 and
   not at the leaderboard's 100-unit bar reference either. Both answer the same
   question - how do I separate these runs - with the number that separates best
   in each place: a fixed 100 for bars, which have to stay comparable between one
   screenshot and the next, and a dynamic cap here, because the chart is redrawn
   for whatever is selected and a fixed top would waste half the plot. The axis
   is ticked in real fixed counts either way, its title says "out of 105", and
   the note under the chart says where it stops and why. */
function yDomainTop(allRuns) {
  const best = Math.max(0, ...allRuns.map((r) => r.fixed || 0));
  return Math.min(CEILING, Math.ceil((best + 4) / 10) * 10);
}

const CANDIDATES = [
  [11, 4, 'start'], [-11, 4, 'end'],
  [0, -11, 'middle'], [0, 16, 'middle'],
  [9, -8, 'start'], [-9, -8, 'end'],
  [9, 15, 'start'], [-9, 15, 'end'],
  [16, 4, 'start'], [-16, 4, 'end'],
];

function overlaps(a, b) {
  return !(a.x1 < b.x0 || b.x1 < a.x0 || a.y1 < b.y0 || b.y1 < a.y0);
}

/** Runs that no other selected run beats on both x and score at once. Lower x is
    the better direction on both maps — cheaper, or faster. */
function frontierOf(points) {
  const keep = points.filter((p) => !points.some((q) => (
    q !== p && q.xv <= p.xv && q.score >= p.score && (q.xv < p.xv || q.score > p.score)
  )));
  return keep.sort((a, b) => a.xv - b.xv);
}

/* A linear axis from zero, ticked on a 1-2-2.5-5 ladder at whatever power of ten
   gives roughly one tick per 110px - the same density on dollars, minutes and
   turns, whose ranges differ by two orders of magnitude. */
function linearTicks(hi, plotW) {
  const want = Math.max(3, Math.min(8, Math.round(plotW / 110)));
  const mag = 10 ** Math.floor(Math.log10(hi / want));
  const step = [1, 2, 2.5, 5, 10].map((k) => k * mag).find((s) => hi / s <= want) || 10 * mag;
  const out = [];
  for (let v = 0; v <= hi + 1e-9; v += step) out.push(Math.round(v * 1e6) / 1e6);
  return out;
}

export function scatterLayout(runs, allRuns, width, height, axis) {
  const A = resolveAxis(axis);
  const compact = width < 620;
  const m = {
    top: 38,
    right: compact ? 16 : 26,
    bottom: compact ? 52 : 58,
    left: compact ? 38 : 52,
  };
  const plotW = Math.max(60, width - m.left - m.right);
  const plotH = Math.max(60, height - m.top - m.bottom);

  const val = (r) => r[A.key];
  const isNum = (v) => v !== null && v !== undefined;
  const yTop = yDomainTop(allRuns);
  const y = (s) => m.top + plotH - (s / yTop) * plotH;

  let x;
  let xTicks;
  let plotted;
  if (A.scale === 'log') {
    const vals = allRuns.map(val).filter((c) => isNum(c) && c > 0);
    const lo = vals.length ? Math.min(...vals) / 1.7 : 0.5;
    const hi = vals.length ? Math.max(...vals) * 1.7 : 100;
    const l0 = Math.log10(lo);
    const l1 = Math.log10(hi);
    x = (c) => m.left + ((Math.log10(c) - l0) / (l1 - l0)) * plotW;
    xTicks = (A.logTicks || LOG_TICKS).filter((t) => t >= lo && t <= hi).map((t) => ({
      v: t,
      x: x(t),
      label: A.tickLabel ? A.tickLabel(t) : String(t),
    }));
    // on a phone, half the ticks is still a readable log axis; all of them collide
    if (compact) xTicks = xTicks.filter((_, i) => i % 2 === 0);
    plotted = runs.filter((r) => isNum(val(r)) && val(r) > 0);
  } else {
    // a linear axis starts at zero: no dollars, no minutes and no turns are all real places
    const vals = allRuns.map(val).filter(isNum);
    const hi = vals.length ? Math.max(...vals) * 1.06 : 10;
    x = (c) => m.left + (c / hi) * plotW;
    xTicks = linearTicks(hi, plotW).map((t) => ({ v: t, x: x(t), label: A.tickLabel ? A.tickLabel(t) : String(t) }));
    plotted = runs.filter((r) => isNum(val(r)));
  }

  /* Two different reasons a run can have no place on a log axis, and they are not
     the same claim: a run with NO figure, and a run whose figure is genuinely
     ZERO — a known, meaningful number a logarithmic axis cannot place. Say which.
     A linear axis has neither problem; only the missing case can arise there. */
  const zeroRuns = A.scale === 'log' ? runs.filter((r) => val(r) === 0) : [];
  const missingRuns = runs.filter((r) => !isNum(val(r)));
  const skipped = runs.length - plotted.length;
  const labels = pointLabels(plotted);

  const points = plotted.map((r) => ({
    run: r,
    id: r.id,
    // the drawn colour, not the raw one: a couple of hues get a dark-mode variant
    color: runColor(r.color),
    xv: val(r),
    score: r.fixed,
    cx: x(val(r)),
    cy: y(r.fixed),
    flagged: Boolean(A.flag && r[A.flag]),
    label: (labels.get(r.id) || r.model) + (A.flag && r[A.flag] ? ` ${NOTE_MARK}` : ''),
  })).sort((a, b) => b.score - a.score);

  // Greedy label placement: first come, first served, in score order.
  const placedRects = [];
  const pointRects = points.map((p) => ({
    x0: p.cx - 8, x1: p.cx + 8, y0: p.cy - 8, y1: p.cy + 8,
  }));
  points.forEach((p) => {
    const w = measureText(p.label, LABEL_FONT);
    let done = false;
    for (const [dx, dy, anchor] of CANDIDATES) {
      const lx = p.cx + dx;
      const ly = p.cy + dy;
      const x0 = anchor === 'start' ? lx : anchor === 'end' ? lx - w : lx - w / 2;
      const rect = { x0: x0 - 2, x1: x0 + w + 2, y0: ly - 9, y1: ly + 3 };
      if (rect.x0 < 2 || rect.x1 > width - 2 || rect.y0 < 6 || rect.y1 > m.top + plotH + 4) continue;
      if (placedRects.some((r) => overlaps(rect, r))) continue;
      if (pointRects.some((r) => overlaps(rect, r))) continue;
      placedRects.push(rect);
      p.labelPos = { x: lx, y: ly, anchor };
      done = true;
      break;
    }
    if (!done) p.labelPos = null;
  });

  const yStep = yTop > 60 ? 20 : 10;
  const yTicks = [];
  for (let v = 0; v <= yTop; v += yStep) yTicks.push({ v, y: y(v) });

  // Family lines (Pawel 2026-08-27): join one model's efforts in dial order (low -> max) and give
  // the whole family one colour on these two maps, so a reader sees a trajectory, not loose dots.
  // The Pareto frontier is computed separately below and still governs.
  const effRankOf = (e) => {
    const i = EFFORT_RANK.indexOf(String(e || '').toLowerCase());
    return i < 0 ? EFFORT_RANK.length : i;
  };
  const fam = new Map();
  points.forEach((p) => {
    if (!fam.has(p.run.model)) fam.set(p.run.model, []);
    fam.get(p.run.model).push(p);
  });
  const familyLines = [];
  fam.forEach((grp, model) => {
    const ordered = grp.slice().sort((a, b) => effRankOf(a.run.effort) - effRankOf(b.run.effort));
    const famColor = ordered[0].color;                 // the top-effort member's colour
    ordered.forEach((p) => { p.color = famColor; });   // one colour per family on these views
    if (ordered.length > 1) {
      let d = `M${ordered[0].cx.toFixed(1)} ${ordered[0].cy.toFixed(1)}`;
      for (let i = 1; i < ordered.length; i += 1) d += ` L${ordered[i].cx.toFixed(1)} ${ordered[i].cy.toFixed(1)}`;
      familyLines.push({ model, color: famColor, d, points: ordered });
    }
  });

  const frontier = frontierOf(points);
  let frontierPath = '';
  if (frontier.length > 1) {
    frontierPath = `M${frontier[0].cx.toFixed(1)} ${frontier[0].cy.toFixed(1)}`;
    for (let i = 1; i < frontier.length; i += 1) {
      frontierPath += ` L${frontier[i].cx.toFixed(1)} ${frontier[i].cy.toFixed(1)}`;
    }
  }

  return {
    axis: A, width, height, m, plotW, plotH, compact,
    x, y, xTicks, yTicks, yTop, points, frontier, frontierPath, familyLines,
    skipped, zeroRuns, missingRuns,
    flagged: points.filter((p) => p.flagged),
    ceilingY: yTop === CEILING ? y(CEILING) : null, baseY: y(0),
  };
}

function tipRow(label, value) {
  return el('div', { class: 'tip-row' }, [`${label}: ${value}`]);
}

function tooltipContent(p, axis) {
  const r = p.run;
  const kind = COST_KIND_LABEL[r.cost_kind] || r.cost_kind;
  const frag = document.createDocumentFragment();
  frag.appendChild(el('span', { class: 'tip-val', text: `${r.fixed} of 105 fixed` }));
  frag.appendChild(el('div', { class: 'tip-name' }, [
    el('i', { class: 'tip-key', style: { 'background-color': p.color } }),
    `${r.model}${r.effort ? ` · ${r.effort}` : ''}`,
  ]));
  const rows = {
    cost: () => tipRow('Cost', `${fmtCost(r.cost_usd)} (${kind})`),
    time: () => tipRow('Wall clock', `${fmtWall(r.wall_min)} min`),
    turns: () => tipRow('Turns', r.turns === null || r.turns === undefined ? 'not counted' : fmtTurns(r.turns)),
  };
  // the measure this map is about goes first, the other two after it
  const order = [axis.id, ...['cost', 'time', 'turns'].filter((k) => k !== axis.id)];
  order.forEach((k) => { if (rows[k]) frag.appendChild(rows[k]()); });
  frag.appendChild(tipRow('Unplanted, not scored', String(r.extras)));
  frag.appendChild(tipRow('Claimed only', String(r.claimed_only)));
  frag.appendChild(tipRow('Run date', fmtDate(r.date)));
  if (r.wall_note) frag.appendChild(el('div', { class: 'tip-note', text: `${NOTE_MARK} ${r.wall_note}` }));
  return frag;
}

export function renderScatter(host, runs, allRuns, axis, footnote) {
  const A = resolveAxis(axis);
  host.classList.add('chart-host');
  host.textContent = '';
  if (!runs.length) return null;

  const width = Math.max(320, host.clientWidth || 900);
  const height = width < 620 ? 400 : Math.min(520, Math.round(width * 0.46));
  const L = scatterLayout(runs, allRuns, width, height, A);

  const svg = svgEl('svg', {
    viewBox: `0 0 ${width} ${height}`,
    width,
    height,
    'aria-label': `Planted bugs fixed plotted against ${MEASURE_ARIA[A.id] || 'run cost'}, on a ${A.scale === 'log' ? 'logarithmic' : 'linear'} axis. Every value is also in the leaderboard table.`,
  });
  svg.appendChild(svgEl('title', { text: `${A.chartTitle}, for the selected runs` }));

  const grid = svgEl('g', { 'aria-hidden': 'true' });
  L.yTicks.forEach((t) => {
    grid.appendChild(svgEl('line', {
      class: 'grid-line', x1: L.m.left, x2: L.m.left + L.plotW, y1: t.y, y2: t.y,
    }));
    grid.appendChild(svgEl('text', {
      class: 'tick-label', x: L.m.left - 8, y: t.y + 3.5, 'text-anchor': 'end', text: String(t.v),
    }));
  });
  L.xTicks.forEach((t) => {
    grid.appendChild(svgEl('line', {
      class: 'grid-line', x1: t.x, x2: t.x, y1: L.m.top, y2: L.m.top + L.plotH,
    }));
    grid.appendChild(svgEl('text', {
      class: 'tick-label', x: t.x, y: L.m.top + L.plotH + 18, 'text-anchor': 'middle', text: t.label,
    }));
  });
  grid.appendChild(svgEl('line', {
    class: 'axis-line', x1: L.m.left, x2: L.m.left + L.plotW, y1: L.baseY, y2: L.baseY,
  }));
  grid.appendChild(svgEl('line', {
    class: 'axis-line', x1: L.m.left, x2: L.m.left, y1: L.m.top, y2: L.baseY,
  }));
  svg.appendChild(grid);

  const ceil = svgEl('g', { 'aria-hidden': 'true' });
  if (L.ceilingY !== null) {
    ceil.appendChild(svgEl('line', {
      class: 'axis-line', x1: L.m.left, x2: L.m.left + L.plotW, y1: L.ceilingY, y2: L.ceilingY,
    }));
    ceil.appendChild(svgEl('text', {
      class: 'ceiling-label', x: L.m.left + L.plotW, y: L.ceilingY - 7, 'text-anchor': 'end',
      text: '105 — every planted bug',
    }));
  }
  ceil.appendChild(svgEl('text', {
    class: 'corner-label', x: L.m.left + 8, y: L.m.top + 16, text: A.corner,
  }));
  svg.appendChild(ceil);

  // axis titles
  svg.appendChild(svgEl('text', {
    class: 'axis-title', x: L.m.left, y: height - 14,
    text: L.compact ? A.titleCompact : A.title,
  }));
  svg.appendChild(svgEl('text', {
    class: 'axis-title', x: -(L.m.top + L.plotH / 2), y: 13,
    transform: 'rotate(-90)', 'text-anchor': 'middle',
    text: L.compact ? 'Fixed, of 105' : 'Planted bugs fixed, out of 105',
  }));

  L.familyLines.forEach((f) => {
    svg.appendChild(svgEl('path', { class: 'family-line', d: f.d, stroke: f.color, 'aria-hidden': 'true' }));
  });
  // Pareto frontier removed 2026-08-27 (Pawel: too chaotic alongside the family lines - to be
  // rethought). frontierOf/frontierPath still computed in scatterLayout; re-enable by drawing
  // L.frontierPath as a <path class="frontier"> here.

  const tip = el('div', { class: 'chart__tip', role: 'status', hidden: true });
  const marks = svgEl('g', {});

  const showTip = (p, group) => {
    tip.textContent = '';
    tip.appendChild(tooltipContent(p, A));
    tip.hidden = false;
    const hostW = host.clientWidth;
    const scale = hostW / width;
    const tw = tip.offsetWidth;
    let left = p.cx * scale + 14;
    if (left + tw > hostW - 6) left = p.cx * scale - tw - 14;
    if (left < 4) left = 4;
    tip.style.setProperty('left', `${left}px`);
    tip.style.setProperty('top', `${Math.max(4, p.cy * scale - 12)}px`);
    group.classList.add('is-active');
  };
  const hideTip = (group) => {
    tip.hidden = true;
    if (group) group.classList.remove('is-active');
  };

  L.points.forEach((p) => {
    const g = svgEl('g', { class: 'pt' });
    g.appendChild(svgEl('circle', { class: 'pt-halo', cx: p.cx, cy: p.cy, r: 9 }));
    g.appendChild(svgEl('circle', { class: 'pt-ring', cx: p.cx, cy: p.cy, r: 7 }));
    g.appendChild(svgEl('circle', { cx: p.cx, cy: p.cy, r: 5, fill: p.color }));
    /* A figure that carries its own note wears a broken ring, and its label
       wears a star. The table carries no marker at all now, so this pair is the
       only place a bent figure is flagged - which is the place it matters, since
       a reader compares minutes along the axis. Neither mark is a colour, so
       both survive the run colour underneath, a colourblind reader and a
       black-and-white print. */
    if (p.flagged) {
      g.appendChild(svgEl('circle', { class: 'pt-flag', cx: p.cx, cy: p.cy, r: 10.5 }));
    }
    if (p.labelPos) {
      g.appendChild(svgEl('text', {
        class: 'pt-label', x: p.labelPos.x, y: p.labelPos.y,
        'text-anchor': p.labelPos.anchor, text: p.label,
      }));
    }
    const hit = svgEl('circle', {
      class: 'hit', cx: p.cx, cy: p.cy, r: 18, tabindex: '0', role: 'button',
      'aria-label': `${p.run.model}${p.run.effort ? ` · ${p.run.effort}` : ''}: ${p.run.fixed} of 105 fixed, ${A.fmt(p.xv)}${p.flagged ? `. Note on this figure: ${p.run[A.flag]}` : ''}`,
    });
    hit.addEventListener('pointerenter', () => showTip(p, g));
    hit.addEventListener('pointerleave', () => hideTip(g));
    hit.addEventListener('focus', () => showTip(p, g));
    hit.addEventListener('blur', () => hideTip(g));
    g.appendChild(hit);
    marks.appendChild(g);
  });
  svg.appendChild(marks);

  host.appendChild(svg);
  host.appendChild(tip);

  /* What the measure IS, inside the plate with the plot, so it travels with the
     chart instead of sitting somewhere below it. */
  if (footnote) {
    const parts = footnote(L);
    if (parts) host.appendChild(el('p', { class: 'chart__def' }, parts));
  }

  if (L.skipped > 0) {
    const parts = [];
    const zero = L.zeroRuns || [];
    const missing = L.missingRuns || [];
    if (zero.length) {
      const names = zero.map((r) => r.model).join(', ');
      parts.push(`${names} cost nothing to run, and zero has no place on a logarithmic cost axis — switch the axis to linear to see ${zero.length === 1 ? 'it' : 'them'} at $0.`);
    }
    if (missing.length) {
      parts.push(`${missing.length} selected run${missing.length === 1 ? ' carries' : 's carry'} no ${MEASURE_NAME[A.id] || 'cost'} figure.`);
    }
    parts.push(`${L.skipped === 1 ? 'It is' : 'They are'} in the table.`);
    host.appendChild(el('p', { class: 'chart__def chart__def--skip', text: parts.join(' ') }));
  }

  return L;
}
