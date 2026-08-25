/* PNG export.
   Follows the active theme: every colour is read from the live custom properties,
   so the exported card is the one on screen, and run colours go through the same
   runColor() the page uses.
   Everything is drawn with the canvas 2D API — no SVG rasterisation, no library, no
   service. Rasterising the live SVG would lose the web fonts (an <img>-loaded SVG
   cannot reach them), and the labels are placed by measured text width, so a silent
   font substitution would shift every label. Drawing directly keeps the export
   identical to the screen and lets the attribution block be part of the image. */

import {
  COLUMNS, GROUPS, TOTALS, BAR_SCALE_NOTE, NOTE_MARK, fmtCost, fmtWall, fmtInt,
  fmtDate, barRatio, barScales, effortSuffix, compareRuns, firstSentence,
  costSentence, segmentsText,
} from './format.js?v=1f04c8a829';
import { scatterLayout, AXES } from './scatter.js?v=1f04c8a829';
import { runColor, activeTheme } from './theme.js?v=1f04c8a829';

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
    bar: cssVar('--bar') || '#aab1ba',
  };
}

const SANS = 'Inter, system-ui, sans-serif';
const SERIF = '"EB Garamond", Georgia, serif';
const MONO = 'ui-monospace, SFMono-Regular, Consolas, monospace';

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

/** Shrink a mono line until it fits, before resorting to an ellipsis: the
    harness line is provenance, and half of it is worth less than all of it. */
function fitMono(ctx, str, maxW, start, floor) {
  let size = start;
  while (size > floor) {
    ctx.font = `${size}px ${MONO}`;
    if (ctx.measureText(str).width <= maxW) break;
    size -= 0.25;
  }
  return `${size}px ${MONO}`;
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

/** Wrap a sentence to a width. The canvas has no line breaking of its own, and a
    definition that runs off the edge of the card is worse than no card. */
function wrapText(ctx, str, font, maxW) {
  ctx.font = font;
  const words = String(str).split(/\s+/);
  const lines = [];
  let line = '';
  words.forEach((word) => {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > maxW) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  });
  if (line) lines.push(line);
  return lines;
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
  /* the same geometry as the screen: every bar scaled to the longest figure
     among the rows ON THIS CARD, so an exported selection reads like the
     selection it was exported from */
  const { fixedMax, extrasMax, wallMax, costMax } = barScales(runs);
  const cols = COLUMNS.map((c) => ({ ...c }));
  const totalW = cols.reduce((s, c) => s + c.w, 0);
  const scale = (w - PAD * 2) / totalW;
  let x = PAD;
  cols.forEach((c) => { c.x = x; c.width = c.w * scale; x += c.width; });

  let y = ctx.__y;
  const rowH = 50;

  /* Group header. "Tracked, not scored" heads a single column now, so a label
     can be wider than the group it describes - it wraps inside its own width
     rather than running over the neighbour it does not describe. */
  y += 34;
  GROUPS.forEach((g) => {
    const groupCols = cols.filter((c) => c.group === g.id);
    if (!groupCols.length || !g.label) return;
    const gx = groupCols[0].x;
    const gw = groupCols.reduce((sum, c) => sum + c.width, 0) - 12;
    const font = `600 10px ${SANS}`;
    const lines = wrapText(ctx, g.label.toUpperCase(), font, gw).slice(0, 2);
    lines.forEach((l, i) => {
      text(ctx, l, gx + 8, y - (lines.length - 1 - i) * 11, font, g.id === 'score' ? T.ink : T.muted);
    });
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
  line(ctx, PAD, y, w - PAD, y, T.ink, 2);
  ctx.__groupRules = cols.filter((c, i) => i > 0 && c.group !== cols[i - 1].group).map((c) => c.x);
  const rulesTop = y;

  const hatch = hatchPattern(ctx, T.muted);

  /* the on-screen geometry, in canvas terms: bar from the left edge of the
     column, value printed at its end, the value's width reserved out of the
     track so a full-length bar cannot push its own number off the column */
  const drawBar = (c, top, ratio, height, fill, reserve) => {
    const trackW = Math.max(10, c.width - 8 - reserve);
    if (ratio === null || ratio === 0) return c.x + 4;
    const bw = Math.max(1.5, ratio * trackW);
    ctx.fillStyle = fill;
    roundedRight(ctx, c.x + 4, top, bw, height, 4);
    return c.x + 4 + bw;
  };
  const sorted = runs.slice().sort((a, b) => compareRuns(a, b, state.sort, state.dir));

  sorted.forEach((run) => {
    const top = y;
    y += rowH;
    const baseline = top + 19;

    cols.forEach((c) => {
      const rightX = c.x + c.width - 8;
      if (c.key === 'model') {
        ctx.fillStyle = runColor(run.color);
        ctx.fillRect(c.x + 8, top + 12, 11, 11);
        /* name and badge on one line, vendor · harness under it — the screen's
           two lines, and nothing else: what the tier means is in the footer */
        const suffix = effortSuffix(run);
        const badge = `${String(run.effort || '').toUpperCase()}${suffix ? ` · ${suffix}` : ''}`;
        ctx.font = `600 14px ${SANS}`;
        const nameW = Math.min(ctx.measureText(run.model).width, c.width - 40 - ctx.measureText(badge).width);
        const name = truncate(ctx, run.model, `600 14px ${SANS}`, nameW);
        text(ctx, name, c.x + 26, baseline, `600 14px ${SANS}`, run.superseded ? T.muted : T.ink);
        ctx.font = `600 14px ${SANS}`;
        text(ctx, badge, c.x + 32 + ctx.measureText(name).width, baseline - 1, `600 9px ${SANS}`, T.ink2);
        const metaStr = `${[run.vendor, run.harness].filter(Boolean).join(' · ')}${run.superseded ? ' · superseded' : ''}`;
        const metaFont = fitMono(ctx, metaStr, c.width - 32, 9.5, 7.5);
        text(ctx, truncate(ctx, metaStr, metaFont, c.width - 32), c.x + 26, baseline + 14, metaFont, T.muted);
      } else if (c.key === 'fixed') {
        const end = drawBar(c, top + 11, barRatio(run.fixed, fixedMax), 18,
          runColor(run.color), 58);
        ctx.font = `600 15px ${SANS}`;
        const nw = ctx.measureText(fmtInt(run.fixed)).width;
        text(ctx, fmtInt(run.fixed), end + 10, baseline + 4, `600 15px ${SANS}`, T.ink);
        text(ctx, `/${TOTALS.fixed}`, end + 12 + nw, baseline + 4, `11px ${SANS}`, T.neutral);
      } else if (c.key === 'extras') {
        const end = drawBar(c, top + 16, barRatio(run.extras, extrasMax), 9, hatch, 28);
        text(ctx, fmtInt(run.extras), end + 10, baseline + 2, `12px ${SANS}`, T.muted);
      } else if (c.key === 'wall_min') {
        const end = drawBar(c, top + 14, barRatio(run.wall_min, wallMax), 13, T.bar, 62);
        ctx.font = `12.5px ${SANS}`;
        const vw = ctx.measureText(fmtWall(run.wall_min)).width;
        text(ctx, fmtWall(run.wall_min), end + 10, baseline + 2, `12.5px ${SANS}`, T.ink2);
        if (run.wall_min !== null && run.wall_min !== undefined) {
          text(ctx, 'min', end + 13 + vw, baseline + 2, `10px ${SANS}`, T.neutral);
        }
      } else if (c.key === 'cost_usd') {
        // the figure only; which of these are bills and which are estimates is
        // one generated sentence in the footer, as it is in the key on the page
        const end = drawBar(c, top + 13, barRatio(run.cost_usd, costMax), 13, T.bar, 56);
        text(ctx, fmtCost(run.cost_usd), end + 10, baseline + 2, `12.5px ${SANS}`, T.ink2);
      } else if (c.key === 'date') {
        text(ctx, fmtDate(run.date), rightX, baseline, `11.5px ${SANS}`, T.muted, 'right');
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
    ctx.moveTo(gx + 0.5, rulesTop - 54);
    ctx.lineTo(gx + 0.5, y - 1);
    ctx.stroke();
  });

  ctx.__y = y;
  return sorted;
}

/* ----------------------------------------------------------------- scatter */

function drawScatter(ctx, T, runs, allRuns, w, axis, defLines) {
  const A = axis || AXES.cost;
  const top = ctx.__y + 20;
  const plotW = w - PAD * 2;
  const height = Math.round(plotW * 0.5);
  const L = scatterLayout(runs, allRuns, plotW, height, A);
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
  text(ctx, A.corner.toUpperCase(), L.m.left + 8, L.m.top + 16, `10px ${SANS}`, T.muted);

  text(ctx, A.exportTitle, L.m.left, height - 12, `600 10px ${SANS}`, T.ink2);
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
    ctx.strokeStyle = T.hairline;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.cx, p.cy, 5, 0, Math.PI * 2);
    ctx.fill();
    // the same broken ring the page draws: this figure carries a note of its own
    if (p.flagged) {
      ctx.save();
      ctx.strokeStyle = T.muted;
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2.5]);
      ctx.beginPath();
      ctx.arc(p.cx, p.cy, 10.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  });
  L.points.forEach((p) => {
    if (!p.labelPos) return;
    haloText(ctx, p.label, p.labelPos.x, p.labelPos.y, `10.5px ${SANS}`,
      T.ink2, p.labelPos.anchor === 'middle' ? 'center' : p.labelPos.anchor, T.plate);
  });

  ctx.restore();
  ctx.__y = top + height + 8;

  /* What the measure IS, drawn with the plot rather than left to the footer: an
     exported card travels on its own, and a reader who meets it there has no
     page to read it against. */
  if (defLines && defLines.length) {
    let dy = ctx.__y + 14;
    line(ctx, PAD, dy - 10, w - PAD, dy - 10, T.hairline);
    defLines.forEach((l) => {
      text(ctx, l, PAD, dy, `11.5px ${SANS}`, T.ink2);
      dy += 15;
    });
    ctx.__y = dy - 4;
  }

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
    text(ctx, truncate(ctx, `${p.run.id} — ${p.run.fixed}${p.flagged ? ` ${NOTE_MARK}` : ''}`, `11.5px ${SANS}`, colW - 26),
      cx + 15, cy, `11.5px ${SANS}`, T.ink2);
  });
  ly += Math.ceil(L.points.length / cols) * 17;
  ctx.__y = ly + 8;
  return L;
}

/* -------------------------------------------------------------------- main */

export async function exportView({
  view, axis, runs, allRuns, state, meta, glossary, caveat, siteUrl, presetName,
}) {
  if (document.fonts && document.fonts.ready) await document.fonts.ready;
  const T = theme();
  const isChart = Boolean(axis);

  const w = isChart ? 1100 : 1240;
  const sortCol = COLUMNS.find((c) => c.key === state.sort);
  const sortLabel = `${sortCol ? sortCol.label : state.sort} ${state.dir === 'asc' ? 'ascending' : 'descending'}`;

  /* The definition line, and — only when there are any on this card — how many of
     the runs shown carry a note on their own figure. Measured before the canvas
     is sized, because wrapping decides how tall the card has to be. */
  const measure = document.createElement('canvas').getContext('2d');
  let defLines = [];
  if (isChart && caveat) {
    const flagged = axis.flag ? runs.filter((r) => r[axis.flag]).length : 0;
    const defText = firstSentence(caveat)
      + (flagged ? ` ${NOTE_MARK} ${flagged} of the ${runs.length} runs shown carry a note on how that figure was taken.` : '');
    defLines = wrapText(measure, defText, `11.5px ${SANS}`, w - PAD * 2);
  }

  /* The card travels on its own, so every sentence the page keeps in the key
     under the table has to be on it: how the bars are scaled, and which of these
     dollar figures are bills. The cost sentence is generated from the runs on
     THIS card, exactly as the key generates it from the runs on screen. */
  const costLine = !isChart || axis.id === 'cost'
    ? segmentsText(costSentence(runs, glossary))
    : '';
  const footerLines = [
    isChart
      ? `${runs.length} of ${allRuns.length} runs shown — ${presetName}. ${axis.id === 'cost' ? 'Cost on a logarithmic axis' : 'Wall clock on a linear axis'}; the score axis stops above the board's best run, which is out of 105.`
      : `${runs.length} of ${allRuns.length} runs shown — ${presetName}. Sorted by ${sortLabel}.`,
    'Score = planted bugs fixed, verified blind against a withheld answer key. Extras are real defects that were never planted; they are tracked, never added to the score.',
    // the same sentence the page carries, because an exported PNG travels alone
    isChart ? null : BAR_SCALE_NOTE,
    costLine || null,
    siteUrl,
  ].filter(Boolean)
    // the canvas has no line breaking: wrap here or a long sentence runs off the card
    .flatMap((l) => wrapText(measure, l, `11.5px ${SANS}`, w - PAD * 2));

  const headH = 150;
  let bodyH;
  if (isChart) {
    const plotW = w - PAD * 2;
    bodyH = 20 + Math.round(plotW * 0.5) + 8
      + (defLines.length ? 14 + defLines.length * 15 - 4 : 0)
      + 16 + Math.ceil(runs.length / 3) * 17 + 16;
  } else {
    bodyH = 34 + 8 + 20 + 9 + runs.length * 50 + 20;
  }
  const footH = 18 + footerLines.length * 15 + 14;
  const h = headH + bodyH + footH;

  const canvas = document.createElement('canvas');
  canvas.width = w * SCALE;
  canvas.height = h * SCALE;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);

  ctx.fillStyle = T.plate;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = T.hairline;
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, w - 1, h - 1);

  const title = isChart ? axis.chartTitle : 'Leaderboard';
  const subtitle = 'Planted bugs only — extras are never added to the score.';
  ctx.__y = drawHeader(ctx, T, w, title, subtitle, { updatedLong: fmtDate(meta.updated) }, siteUrl);

  if (isChart) drawScatter(ctx, T, runs, allRuns, w, axis, defLines);
  else drawTable(ctx, T, runs, state, w);

  drawFooter(ctx, T, w, Math.max(ctx.__y + 10, h - footH), footerLines);

  const blob = await new Promise((res) => canvas.toBlob(res, 'image/png'));
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  // the view and the theme are both baked into the file name, so two exports never collide
  a.download = `bug-hunt-bench-${isChart ? axis.slug : 'leaderboard'}-${activeTheme()}-${meta.updated}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  return { width: canvas.width, height: canvas.height, blob };
}
