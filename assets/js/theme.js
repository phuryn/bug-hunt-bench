/* Theme: light (default, and what the printed card looks like) and dark.
   First visit follows the OS; the toggle overrides it and the override is
   remembered. The no-flash part is theme-boot.js, which runs before paint.

   Run colours come from the data file and are tuned for the light surface, so
   they are used verbatim wherever they still work. Two of them do not survive a
   dark surface at all — a colour has to be *seen* before it can identify a run —
   and those get a dark-mode-only variant, computed here rather than hand-listed
   so a future data refresh cannot introduce an invisible colour unnoticed. */

export const THEME_KEY = 'bhb-theme';
const THEMES = { light: '#eef0f3', dark: '#101419' };

/* A run colour is left exactly as the data gives it unless it falls below
   TRIGGER against the dark data surface — the point where a filled bar stops
   reading as a shape at all. Then the OKLCH hue angle is kept, the chroma is
   raised to a floor (so a near-neutral does not lift into the same grey family
   as the neutral bars and the other slate run), and the lightness is raised
   until the swatch clears TARGET. On the current board that moves exactly two
   of the twenty hues, and the worst separation between any two run colours in
   dark (ΔE 5.8, OKLab ×100) matches the light palette's own worst pair (5.9). */
const TRIGGER = 2.2;
const TARGET = 3.5;
const CHROMA_FLOOR = 0.06;

/* ------------------------------------------------------- colour arithmetic */

const toLin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toSrgb = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * (c ** (1 / 2.4)) - 0.055);
const clamp01 = (v) => Math.min(1, Math.max(0, v));

function parseHex(hex) {
  let h = String(hex).trim().replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (!/^[0-9a-f]{6}$/i.test(h)) return null;
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
}

function toHex(rgb) {
  return `#${rgb.map((v) => Math.round(clamp01(v) * 255).toString(16).padStart(2, '0')).join('')}`;
}

function luminance(rgb) {
  const [r, g, b] = rgb.map(toLin);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

function rgbToOklch(rgb) {
  const [r, g, b] = rgb.map(toLin);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s;
  return [L, Math.hypot(A, B), Math.atan2(B, A)];
}

function oklchToRgb([L, C, h]) {
  const A = C * Math.cos(h);
  const B = C * Math.sin(h);
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.2914855480 * B) ** 3;
  return [
    toSrgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    toSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    toSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s),
  ];
}

/* ------------------------------------------------------------- theme state */

export function activeTheme() {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

let surfaceCache = { theme: null, rgb: null };

/** The data surface the marks are drawn on, read from the live stylesheet. */
function dataSurface() {
  const t = activeTheme();
  if (surfaceCache.theme !== t) {
    const v = getComputedStyle(document.documentElement).getPropertyValue('--plate').trim();
    surfaceCache = { theme: t, rgb: parseHex(v) || parseHex('#f8f9fb') };
  }
  return surfaceCache.rgb;
}

const colorCache = new Map();

/** The colour a run is actually drawn in, for the theme that is on right now.
    In light this is always the data's own hex, with no exceptions: the palette
    was tuned for the light surface and is what the printed card uses. Several
    of the pale hues sit under 3:1 there too, and the answer to that is the one
    the board already gives — the run's name beside every swatch and the value
    printed at the end of every bar — not a repaint. */
export function runColor(hex) {
  const t = activeTheme();
  if (t !== 'dark') return hex;
  const key = `${t}|${hex}`;
  if (colorCache.has(key)) return colorCache.get(key);
  let out = hex;
  const rgb = parseHex(hex);
  const surface = dataSurface();
  if (rgb && surface && contrast(rgb, surface) < TRIGGER) {
    const [L0, C0, h] = rgbToOklch(rgb);
    let L = L0;
    const C = Math.max(C0, CHROMA_FLOOR);
    for (let i = 0; i < 400 && L < 0.9; i += 1) {
      const cand = oklchToRgb([L, C, h]);
      out = toHex(cand);
      if (contrast(cand.map(clamp01), surface) >= TARGET) break;
      L += 0.004;
    }
  }
  colorCache.set(key, out);
  return out;
}

/** True when at least one run colour is being shown as a dark-mode variant. */
export function hasAdjustedColors(runs) {
  return activeTheme() === 'dark' && runs.some((r) => runColor(r.color) !== r.color);
}

/* ----------------------------------------------------------------- toggle */

const listeners = new Set();

function apply(theme, source) {
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  root.setAttribute('data-theme-source', source);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', THEMES[theme]);
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.setAttribute('aria-pressed', String(theme === 'dark'));
  listeners.forEach((fn) => fn(theme));
}

export function initTheme(onChange) {
  if (onChange) listeners.add(onChange);
  const btn = document.getElementById('theme-toggle');
  if (btn) {
    btn.setAttribute('aria-pressed', String(activeTheme() === 'dark'));
    btn.addEventListener('click', () => {
      const next = activeTheme() === 'dark' ? 'light' : 'dark';
      try { window.localStorage.setItem(THEME_KEY, next); } catch (err) { /* private mode */ }
      apply(next, 'user');
    });
  }
  // no stored choice yet → keep following the OS while the page is open
  const mq = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
  if (mq && mq.addEventListener) {
    mq.addEventListener('change', (e) => {
      if (document.documentElement.getAttribute('data-theme-source') === 'user') return;
      apply(e.matches ? 'dark' : 'light', 'system');
    });
  }
}
