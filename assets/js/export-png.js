/* PNG export.
   Everything is drawn with the canvas 2D API — no SVG rasterisation, no library, no
   service. Rasterising the live SVG would lose the web fonts (an <img>-loaded SVG
   cannot reach them), and the labels are placed by measured text width, so a silent
   font substitution would shift every label. Drawing directly keeps the export
   identical to the screen and lets the attribution block be part of the image. */

import {
  COLUMNS, GROUPS, TOTALS, COST_KIND_LABEL, EFFORT_STATUS_LABEL,
  fmtCost, fmtWall, fmtInt, fmtDate, compareRuns,
} from './format.js';
import { scatterLayout } from './scatter.js';

const SCALE = 2;
const PAD = 32;

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function theme() {
  return {
    plate: cssVar('--plate') || '#f8f9fb',
    page: cssVar('--page') || '#eef0f3',
    panel: cssVar('--panel') || '#e3e6ea',
    hairline: cssVar('--hairline') || '#d6dae1',
    rule: cssVar('--rule') || '#c4cad3',
    ink: cssVar('--ink') || '#1c2026',
    ink2: cssVar('--ink-2') || '#3d444d',
    muted: cssVar('--muted') || '#6b727b',
    accent: cssVar('--accent') || '#3f6b8f',
    neutral: cssVar('--neutral') || '#aab1ba',
  };
}

const SANS = 'Inter, system-ui, sans-serif';
const SERIF = '"EB Garamond", Georgia, serif';

function hatchPattern(ctx, color) {
  const tile = document.createElement('canvas');
  tile.width = 4; tile.height = 4;
  const t = tile.getContext('2d');
  t.strokeStyle = color;
  t.lineWidth = 1.2;
  t.beginPath();
  t.moveTo(-1, 5); t.lineTo(5, -1);
  t.moveTo(1, 7); t.lineTo(7, 1);
  t.moveTo(-3, 3); t.lineTo(3, -3);
  t.stroke();
  return ctx.createPattern(tile, 'repeat');
}

/** Text with a surface-coloured halo, so a label stays readable over a rule. */
function haloText(ctx, str, x, y, font, color, align, halo) {
  ctx.save();
  ctx.font = font;
  ctx.textAlign = align || 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.lineWidth = 3;
  ctx.lineJoin = 'round';
  ctx.strokeStyle = halo;
  ctx.strokeText(str, x, y);
  ctx.fillStyle = color;
  ctx.fillText(str, x, y);
  ctx.restore();
}

/** Shrink a label until it fits its column, rather than letting it collide. */
function fitFont(ctx, str, maxW, weight, start, floor) {
  let size = start;
  while (size > floor) {
    ctx.font = `${weight} ${size}px ${SANS}`;
    if (ctx.measureText(str).width <= maxW) break;
    size -= 0.5;
  }
  return `${weight} ${size}px ${SANS}`;
}

function text(ctx, str, x, y, font, color, align) {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = align || 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(str, x, y);
}

function line(ctx, x1, y1, x2, y2, color, w) {
  ctx.strokeStyle = color;
  ctx.lineWidth = w || 1;
  ctx.beginPath();
  ctx.moveTo(x1, y1 + 0.5);
  ctx.lineTo(x2, y2 + 0.5);
  ctx.stroke();
}

function roundedRight(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w - rr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  ctx.lineTo(x, y + h);
  ctx.closePath();
  ctx.fill();
}

function truncate(ctx, str, font, maxW) {
  ctx.font = font;
  if (ctx.measureText(str).width <= maxW) return str;
  let s = str;
  while (s.length > 1 && ctx.measureText(`${s}…`).width > maxW) s = s.slice(0, -1);
  return `${s}…`;
}

/* ------------------------------------------------------------------ header */

function drawHeader(ctx, T, w, title, subtitle, meta, siteUrl) {
  const y0 = PAD + 14;
  let y = y0;
  ctx.save();
  if ('letterSpacing' in ctx) ctx.letterSpacing = '0.16em';
  text(ctx, 'BUG HUNT BENCH', PAD, y, `600 12px ${SANS}`, T.ink);
  ctx.restore();
  text(ctx, `Updated ${meta.updatedLong}`, w - PAD, y, `12px ${SANS}`, T.muted, 'right');

  y += 40;
  text(ctx, title, PAD, y, `500 32px ${SERIF}`, T.ink);
  y += 22;
  text(ctx, subtitle, PAD, y, `13px ${SANS}`, T.ink2);
  y += 18;
  text(ctx, siteUrl, PAD, y, `12px ${SANS}`, T.muted);
  y += 14;
  line(ctx, PAD, y, w - PAD, y, T.rule);
  return y + 1;
}

function drawFooter(ctx, T, w, y, lines) {
  line(ctx, PAD, y, w - PAD, y, T.hairline);
  let yy = y + 18;
  lines.forEach((l) => {
    text(ctx, l, PAD, yy, `11.5px ${SANS}`, T.muted);
    yy += 15;
  });
  return yy;
}

/* ------------------------------------------------------------------- table */

function drawTable(ctx, T, runs, state, w) {
  const cols = COLUMNS.map((c) => ({ ...c }));
  const totalW = cols.reduce((s, c) => s + c.w, 0);
  const scale = (w - PAD * 2) / totalW;
  let x = PAD;
  cols.forEach((c) => { c.x = x; c.width = c.w * scale; x += c.width; });

  let y = ctx.__y;
  const rowH = 42;

  // group header
  y += 24;
  GROUPS.forEach((g) => {
    const groupCols = cols.filter((c) => c.group === g.id);
    if (!groupCols.length || !g.label) return;
    const gx = groupCols[0].x;
    text(ctx, g.label.toUpperCase(), gx + 8, y, `600 10px ${SANS}`, g.id === 'score' ? T.ink : T.muted);
  });
  y += 8;
  line(ctx, PAD, y, w - PAD, y, T.hairline);

  // column header
  y += 20;
  cols.forEach((c) => {
    const active = state.sort === c.key;
    const label = c.label + (c.unit ? ` ${c.unit}` : '');
    const mark = active ? (state.dir === 'asc' ? ' ▲' : ' ▼') : '';
    const right = c.align === 'left' ? null : 'right';
    const tx = c.align === 'left' ? c.x + 8 : c.x + c.width - 8;
    const str = (label + mark).toUpperCase();
    const font = fitFont(ctx, str, c.width - 14, 600, 10, 7);
    text(ctx, str, tx, y, font, active ? T.ink : T.muted, right);
  });
  y += 9;
  line(ctx, PAD, y, w - PAD, y, T.rule);
  ctx.__groupRules = cols.filter((c, i) => i > 0 && c.group !== cols[i - 1].group).map((c) => c.x);
  const rulesTop = y;

  const extrasMax = ctx.__extrasMax;
  const hatch = hatchPattern(ctx, T.muted);
  const sorted = runs.slice().sort((a, b) => compareRuns(a, b, state.sort, state.dir));

  sorted.forEach((run) => {
    const top = y;
    y += rowH;
    const baseline = top + 19;

    cols.forEach((c) => {
      const rightX = c.x + c.width - 8;
      if (c.key === 'model') {
        ctx.fillStyle = run.color;
        ctx.fillRect(c.x + 8, top + 10, 9, 9);
        const name = truncate(ctx, run.model, `500 13px ${SANS}`, c.width - 30);
        text(ctx, name, c.x + 24, baseline, `500 13px ${SANS}`, run.superseded ? T.muted : T.ink);
        const status = EFFORT_STATUS_LABEL[run.effort_status] || run.effort_status;
        const metaStr = `${run.effort} · ${status} · ${run.vendor}${run.superseded ? ' · superseded' : ''}`;
        text(ctx, truncate(ctx, metaStr, `10px ${SANS}`, c.width - 30), c.x + 24, baseline + 13, `10px ${SANS}`, T.muted);
      } else if (c.key === 'fixed') {
        const numW = 46;
        const trackW = c.width - numW - 18;
        const ty = top + 15;
        ctx.fillStyle = T.panel;
        ctx.fillRect(c.x + 4, ty, trackW, 9);
        ctx.fillStyle = run.color;
        roundedRight(ctx, c.x + 4, ty, Math.max(2, (run.fixed / TOTALS.fixed) * trackW), 9, 3);
        text(ctx, fmtInt(run.fixed), rightX - 20, baseline + 3, `600 15px ${SANS}`, T.ink, 'right');
        text(ctx, `/${TOTALS.fixed}`, rightX, baseline + 3, `11px ${SANS}`, T.neutral, 'right');
      } else if (c.key === 'extras') {
        const numW = 22;
        const trackW = c.width - numW - 18;
        const ty = top + 17;
        const fw = extrasMax ? (run.extras / extrasMax) * trackW : 0;
        line(ctx, c.x + 4, ty + 6, c.x + 4 + trackW, ty + 6, T.hairline);
        if (fw > 0) {
          ctx.fillStyle = hatch;
          ctx.fillRect(c.x + 4, ty, fw, 6);
          line(ctx, c.x + 4, ty + 6, c.x + 4 + fw, ty + 6, T.muted);
        }
        text(ctx, fmtInt(run.extras), rightX, baseline, `12px ${SANS}`, T.muted, 'right');
      } else if (c.key === 'cost_usd') {
        const kind = COST_KIND_LABEL[run.cost_kind] || run.cost_kind;
        ctx.font = `10px ${SANS}`;
        const kw = ctx.measureText(kind).width;
        text(ctx, kind, rightX, baseline, `10px ${SANS}`, T.muted, 'right');
        text(ctx, fmtCost(run.cost_usd), rightX - kw - 6, baseline, `12px ${SANS}`, T.ink2, 'right');
      } else if (c.key === 'date') {
        text(ctx, fmtDate(run.date), rightX, baseline, `11.5px ${SANS}`, T.muted, 'right');
      } else if (c.key === 'wall_min') {
        text(ctx, fmtWall(run.wall_min), rightX, baseline, `12px ${SANS}`, T.ink2, 'right');
      } else {
        const v = run[c.key];
        text(ctx, fmtInt(v), rightX, baseline, `12px ${SANS}`, v === 0 ? T.neutral : T.ink2, 'right');
      }
    });

    line(ctx, PAD, y - 1, w - PAD, y - 1, T.hairline);
  });

  ctx.strokeStyle = T.hairline;
  ctx.lineWidth = 1;
  ctx.__groupRules.forEach((gx) => {
    ctx.beginPath();
    ctx.moveTo(gx + 0.5, rulesTop - 44);
    ctx.lineTo(gx + 0.5, y - 1);
    ctx.stroke();
  });

  ctx.__y = y;
  return sorted;
}

/* ----------------------------------------------------------------- scatter */

function drawScatter(ctx, T, runs, allRuns, w) {
  const top = ctx.__y + 20;
  const plotW = w - PAD * 2;
  const height = Math.round(plotW * 0.5);
  const L = scatterLayout(runs, allRuns, plotW, height);
  ctx.save();
  ctx.translate(PAD, top);

  L.yTicks.forEach((t) => {
    line(ctx, L.m.left, t.y, L.m.left + L.plotW, t.y, T.hairline);
    text(ctx, String(t.v), L.m.left - 8, t.y + 4, `10.5px ${SANS}`, T.muted, 'right');
  });
  L.xTicks.forEach((t) => {
    line(ctx, t.x, L.m.top, t.x, L.m.top + L.plotH, T.hairline);
    text(ctx, t.label, t.x, L.m.top + L.plotH + 18, `10.5px ${SANS}`, T.muted, 'center');
  });
  line(ctx, L.m.left, L.baseY, L.m.left + L.plotW, L.baseY, T.rule);
  ctx.strokeStyle = T.rule;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(L.m.left + 0.5, L.m.top);
  ctx.lineTo(L.m.left + 0.5, L.baseY);
  ctx.stroke();

  if (L.ceilingY !== null) {
    line(ctx, L.m.left, L.ceilingY, L.m.left + L.plotW, L.ceilingY, T.rule);
    text(ctx, '105 — every planted bug', L.m.left + L.plotW, L.ceilingY - 7, `10.5px ${SANS}`, T.muted, 'right');
  }
  text(ctx, 'CHEAP AND STRONG', L.m.left + 8, L.m.top + 16, `10px ${SANS}`, T.muted);

  text(ctx, 'RUN COST, USD — LOGARITHMIC, CHEAPER TO THE LEFT', L.m.left, height - 12, `600 10px ${SANS}`, T.ink2);
  ctx.save();
  ctx.translate(12, L.m.top + L.plotH / 2);
  ctx.rotate(-Math.PI / 2);
  text(ctx, 'PLANTED BUGS FIXED, OUT OF 105', 0, 0, `600 10px ${SANS}`, T.ink2, 'center');
  ctx.restore();

  if (L.frontier.length > 1) {
    ctx.strokeStyle = T.accent;
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(L.frontier[0].cx, L.frontier[0].cy);
    for (let i = 1; i < L.frontier.length; i += 1) {
      ctx.lineTo(L.frontier[i].cx, L.frontier[i - 1].cy);
      ctx.lineTo(L.frontier[i].cx, L.frontier[i].cy);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  L.points.forEach((p) => {
    ctx.fillStyle = T.plate;
    ctx.beginPath();
    ctx.arc(p.cx, p.cy, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.cx, p.cy, 5, 0, Math.PI * 2);
    ctx.fill();
  });
  L.points.forEach((p) => {
    if (!p.labelPos) return;
    haloText(ctx, p.label, p.labelPos.x, p.labelPos.y, `10.5px ${SANS}`,
      T.ink2, p.labelPos.anchor === 'middle' ? 'center' : p.labelPos.anchor, T.plate);
  });

  ctx.restore();
  ctx.__y = top + height + 8;

  // legend — identity is never colour alone
  const cols = 3;
  const colW = (w - PAD * 2) / cols;
  let ly = ctx.__y + 16;
  L.points.slice().sort((a, b) => b.score - a.score).forEach((p, i) => {
    const cx = PAD + (i % cols) * colW;
    const cy = ly + Math.floor(i / cols) * 17;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(cx + 5, cy - 4, 4.5, 0, Math.PI * 2);
    ctx.fill();
    text(ctx, truncate(ctx, `${p.run.id} — ${p.run.fixed}`, `11.5px ${SANS}`, colW - 26),
      cx + 15, cy, `11.5px ${SANS}`, T.ink2);
  });
  ly += Math.ceil(L.points.length / cols) * 17;
  ctx.__y = ly + 8;
  return L;
}

/* -------------------------------------------------------------------- main */

export async function exportView({ view, runs, allRuns, state, meta, siteUrl, presetName }) {
  if (document.fonts && document.fonts.ready) await document.fonts.ready;
  const T = theme();

  const w = view === 'table' ? 1240 : 1100;
  const sortCol = COLUMNS.find((c) => c.key === state.sort);
  const sortLabel = `${sortCol ? sortCol.label : state.sort} ${state.dir === 'asc' ? 'ascending' : 'descending'}`;

  const footerLines = [
    view === 'table'
      ? `${runs.length} of ${allRuns.length} runs shown — ${presetName}. Sorted by ${sortLabel}.`
      : `${runs.length} of ${allRuns.length} runs shown — ${presetName}. Cost on a logarithmic axis; the score axis stops above the board's best run, which is out of 105.`,
    'Score = planted bugs fixed, verified blind against a withheld answer key. Extras are real defects that were never planted; they are tracked, never added to the score.',
    `Cost figures are tagged bill / list rate / floor / free and are not interchangeable. ${siteUrl}`,
  ];

  const extrasMax = Math.max(...allRuns.map((r) => r.extras || 0));
  const headH = 150;
  let bodyH;
  if (view === 'table') {
    bodyH = 24 + 8 + 20 + 9 + runs.length * 42 + 20;
  } else {
    const plotW = w - PAD * 2;
    bodyH = 20 + Math.round(plotW * 0.5) + 8 + 16 + Math.ceil(runs.length / 3) * 17 + 16;
  }
  const footH = 18 + footerLines.length * 15 + 14;
  const h = headH + bodyH + footH;

  const canvas = document.createElement('canvas');
  canvas.width = w * SCALE;
  canvas.height = h * SCALE;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
  ctx.__extrasMax = extrasMax;

  ctx.fillStyle = T.plate;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = T.hairline;
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, w - 1, h - 1);

  const title = view === 'table' ? 'Leaderboard' : 'Score against cost';
  const subtitle = 'Planted bugs only — extras are never added to the score.';
  ctx.__y = drawHeader(ctx, T, w, title, subtitle, { updatedLong: fmtDate(meta.updated) }, siteUrl);

  if (view === 'table') drawTable(ctx, T, runs, state, w);
  else drawScatter(ctx, T, runs, allRuns, w);

  drawFooter(ctx, T, w, Math.max(ctx.__y + 10, h - footH), footerLines);

  const blob = await new Promise((res) => canvas.toBlob(res, 'image/png'));
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `bug-hunt-bench-${view === 'table' ? 'leaderboard' : 'score-vs-cost'}-${meta.updated}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  return { width: canvas.width, height: canvas.height, blob };
}
