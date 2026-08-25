/* Score vs cost.
   Cost on a log x-axis (the board spans roughly two hundredfold), score on a linear
   y-axis that stops just above the best run on the board. Layout is computed once,
   in a pure function, so the on-screen SVG and the PNG export cannot drift apart. */

import { pointLabels, fmtCost, fmtWall, fmtDate, COST_KIND_LABEL, svgEl, el, measureText } from './format.js';
import { runColor } from './theme.js';

const LABEL_FONT = '10.5px Inter, system-ui, sans-serif';
const LOG_TICKS = [0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500];
const CEILING = 105;

/* The y-axis stops just above the best run on the whole board, not at 105 and
   not at the leaderboard's 100-unit bar reference either. Both answer the same
   question - how do I separate these runs - with the number that separates best
   in each place: a fixed 100 for bars, which have to stay comparable between one
   screenshot and the next, and a dynamic cap here, because the chart is redrawn
   for whatever is selected and a fixed top would waste half the plot. The axis
   is ticked in real fixed counts either way, its title says "out of 105", and
   the note under the chart says where it stops and why.
   The ceiling story is told by the tick rule in the header; here the job is
   telling runs apart, and a 0–105 axis spends two thirds of the plot on empty
   space and squashes every point into one band. The axis title and the note
   under the chart both keep "of 105" in front of the reader. */
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

/** Runs that no other selected run beats on both cost and score at once. */
function frontierOf(points) {
  const keep = points.filter((p) => !points.some((q) => (
    q !== p && q.cost <= p.cost && q.score >= p.score && (q.cost < p.cost || q.score > p.score)
  )));
  return keep.sort((a, b) => a.cost - b.cost);
}

export function scatterLayout(runs, allRuns, width, height) {
  const compact = width < 620;
  const m = {
    top: 38,
    right: compact ? 16 : 26,
    bottom: compact ? 52 : 58,
    left: compact ? 38 : 52,
  };
  const plotW = Math.max(60, width - m.left - m.right);
  const plotH = Math.max(60, height - m.top - m.bottom);

  const costs = allRuns.map((r) => r.cost_usd).filter((c) => c !== null && c !== undefined && c > 0);
  const lo = costs.length ? Math.min(...costs) / 1.7 : 0.5;
  const hi = costs.length ? Math.max(...costs) * 1.7 : 100;
  const l0 = Math.log10(lo);
  const l1 = Math.log10(hi);
  const yTop = yDomainTop(allRuns);
  const x = (c) => m.left + ((Math.log10(c) - l0) / (l1 - l0)) * plotW;
  const y = (s) => m.top + plotH - (s / yTop) * plotH;

  let xTicks = LOG_TICKS.filter((t) => t >= lo && t <= hi).map((t) => ({
    v: t,
    x: x(t),
    label: t < 1 ? `$${t.toFixed(2).replace(/0$/, '')}` : `$${t}`,
  }));
  // on a phone, half the ticks is still a readable log axis; all of them collide
  if (compact) xTicks = xTicks.filter((_, i) => i % 2 === 0);
  const yStep = yTop > 60 ? 20 : 10;
  const yTicks = [];
  for (let v = 0; v <= yTop; v += yStep) yTicks.push({ v, y: y(v) });

  const plotted = runs.filter((r) => r.cost_usd !== null && r.cost_usd !== undefined && r.cost_usd > 0);
  const skipped = runs.length - plotted.length;
  const labels = pointLabels(plotted);

  const points = plotted.map((r) => ({
    run: r,
    id: r.id,
    // the drawn colour, not the raw one: a couple of hues get a dark-mode variant
    color: runColor(r.color),
    cost: r.cost_usd,
    score: r.fixed,
    cx: x(r.cost_usd),
    cy: y(r.fixed),
    label: labels.get(r.id) || r.model,
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

  const frontier = frontierOf(points);
  let frontierPath = '';
  if (frontier.length > 1) {
    frontierPath = `M${frontier[0].cx.toFixed(1)} ${frontier[0].cy.toFixed(1)}`;
    for (let i = 1; i < frontier.length; i += 1) {
      frontierPath += ` H${frontier[i].cx.toFixed(1)} V${frontier[i].cy.toFixed(1)}`;
    }
  }

  return {
    width, height, m, plotW, plotH, compact,
    x, y, xTicks, yTicks, yTop, points, frontier, frontierPath, skipped,
    ceilingY: yTop === CEILING ? y(CEILING) : null, baseY: y(0),
  };
}

function tipRow(label, value) {
  return el('div', { class: 'tip-row' }, [`${label}: ${value}`]);
}

function tooltipContent(p) {
  const r = p.run;
  const kind = COST_KIND_LABEL[r.cost_kind] || r.cost_kind;
  const frag = document.createDocumentFragment();
  frag.appendChild(el('span', { class: 'tip-val', text: `${r.fixed} of 105 fixed` }));
  frag.appendChild(el('div', { class: 'tip-name' }, [
    el('i', { class: 'tip-key', style: { 'background-color': runColor(r.color) } }),
    r.id,
  ]));
  frag.appendChild(tipRow('Cost', `${fmtCost(r.cost_usd)} (${kind})`));
  frag.appendChild(tipRow('Wall clock', `${fmtWall(r.wall_min)} min`));
  frag.appendChild(tipRow('Extras, not scored', String(r.extras)));
  frag.appendChild(tipRow('Claimed only', String(r.claimed_only)));
  frag.appendChild(tipRow('Run date', fmtDate(r.date)));
  return frag;
}

export function renderScatter(host, runs, allRuns) {
  host.classList.add('chart-host');
  host.textContent = '';
  if (!runs.length) return null;

  const width = Math.max(320, host.clientWidth || 900);
  const height = width < 620 ? 400 : Math.min(520, Math.round(width * 0.46));
  const L = scatterLayout(runs, allRuns, width, height);

  const svg = svgEl('svg', {
    viewBox: `0 0 ${width} ${height}`,
    width, height,
    'aria-label': 'Planted bugs fixed plotted against run cost. Every value is also in the leaderboard table.',
  });
  svg.appendChild(svgEl('title', { text: 'Score against cost, for the selected runs' }));

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
    class: 'corner-label', x: L.m.left + 8, y: L.m.top + 16, text: 'cheap and strong',
  }));
  svg.appendChild(ceil);

  // axis titles
  svg.appendChild(svgEl('text', {
    class: 'axis-title', x: L.m.left, y: height - 14,
    text: L.compact ? 'Cost, USD (log)' : 'Run cost, USD — logarithmic, cheaper to the left',
  }));
  svg.appendChild(svgEl('text', {
    class: 'axis-title', x: -(L.m.top + L.plotH / 2), y: 13,
    transform: 'rotate(-90)', 'text-anchor': 'middle',
    text: L.compact ? 'Fixed, of 105' : 'Planted bugs fixed, out of 105',
  }));

  if (L.frontierPath) {
    svg.appendChild(svgEl('path', { class: 'frontier', d: L.frontierPath, 'aria-hidden': 'true' }));
  }

  const tip = el('div', { class: 'chart__tip', role: 'status', hidden: true });
  const marks = svgEl('g', {});

  const showTip = (p, group) => {
    tip.textContent = '';
    tip.appendChild(tooltipContent(p));
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
    if (p.labelPos) {
      g.appendChild(svgEl('text', {
        class: 'pt-label', x: p.labelPos.x, y: p.labelPos.y,
        'text-anchor': p.labelPos.anchor, text: p.label,
      }));
    }
    const hit = svgEl('circle', {
      class: 'hit', cx: p.cx, cy: p.cy, r: 18, tabindex: '0', role: 'button',
      'aria-label': `${p.run.id}: ${p.run.fixed} of 105 fixed, ${fmtCost(p.cost)} ${COST_KIND_LABEL[p.run.cost_kind] || ''}`,
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

  if (L.skipped > 0) {
    host.appendChild(el('p', {
      class: 'chart__note',
      text: `${L.skipped} selected run${L.skipped === 1 ? ' carries' : 's carry'} no cost figure and cannot be placed on a cost axis. ${L.skipped === 1 ? 'It is' : 'They are'} in the table.`,
    }));
  }

  return L;
}
