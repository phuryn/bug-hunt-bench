/* The method page: the argument, the caveats, and the definitions.
   Same data file as the board, same theme system, same masthead — a second
   real page, not a route. Nothing here is written twice: the method steps, the
   caveats and every definition are rendered from data/benchmark.json, which is
   why moving them off the board cost no duplication.

   Every term gets a stable id (def-<key>, caveat-<n>) because the board links
   straight at them: a reader who clicks "cost tag" under the table should land
   on that definition, not at the top of this page. */

import { glossaryTerm, fmtDate, el } from './format.js?v=8b9888d19c';
import { initTheme } from './theme.js?v=8b9888d19c';

const $ = (id) => document.getElementById(id);

/* The content is fetched, so the browser has already done its hash scroll on an
   empty page by the time the target exists. Do it again once it does. */
function scrollToHash() {
  const id = decodeURIComponent(location.hash.replace('#', ''));
  if (!id) return;
  const target = document.getElementById(id);
  if (!target) return;
  target.scrollIntoView({ block: 'start' });
  // a definition term is not focusable by default; make the landing spot announce
  if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
}

function render(DATA) {
  const updated = fmtDate(DATA.meta.updated);
  ['hero-updated', 'footer-updated'].forEach((id) => {
    const t = $(id);
    if (!t) return;
    t.setAttribute('datetime', DATA.meta.updated);
    t.textContent = updated;
  });
  if (DATA.meta.source_repo) {
    const src = $('source-link');
    if (src) src.href = DATA.meta.source_repo;
  }

  const body = $('method-body');
  body.textContent = '';
  DATA.method.forEach((p, i) => {
    body.appendChild(el('div', { class: 'method-p', id: `step-${i + 1}` }, [
      el('span', { class: 'n', text: String(i + 1) }),
      el('p', { text: p }),
    ]));
  });

  const caveats = $('caveats-body');
  caveats.textContent = '';
  DATA.caveats.forEach((c, i) => {
    caveats.appendChild(el('li', { id: `caveat-${i + 1}`, text: c }));
  });

  const gloss = $('glossary-body');
  gloss.textContent = '';
  Object.entries(DATA.glossary).forEach(([k, v]) => {
    gloss.appendChild(el('dt', { id: `def-${k}`, text: glossaryTerm(k) }));
    gloss.appendChild(el('dd', { text: v }));
  });
}

async function boot() {
  const res = await fetch('/data/benchmark.json', { cache: 'no-cache' });
  const DATA = await res.json();
  render(DATA);
  initTheme();
  scrollToHash();
  /* The web fonts land after the first paint and reflow everything above the
     target, so a jump made before they arrive lands short. Do it once more when
     they are in. */
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(scrollToHash);
  window.addEventListener('hashchange', scrollToHash);
}

boot().catch((err) => {
  const host = $('method-body');
  if (host) {
    host.textContent = '';
    host.appendChild(el('p', {
      class: 'empty',
      text: 'The benchmark data could not be loaded. Read it directly at data/benchmark.json.',
    }));
  }
  throw err;
});
