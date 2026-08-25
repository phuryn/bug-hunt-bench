/* Theme boot — the only classic (non-module) script on the page.
   It is loaded synchronously in <head> so the theme attribute is on <html> before
   the first paint: a module or a deferred script would run after the page has
   already been painted in the wrong theme. It stays this small on purpose, and
   it is a separate file rather than an inline <script> because the CSP does not
   allow 'unsafe-inline'. Everything else about theming lives in theme.js. */
(function () {
  var KEY = 'bhb-theme';
  var stored = null;
  try { stored = window.localStorage.getItem(KEY); } catch (err) { /* private mode */ }
  var chosen = (stored === 'dark' || stored === 'light') ? stored : null;
  var system = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark' : 'light';
  var theme = chosen || system;
  var root = document.documentElement;
  root.setAttribute('data-theme', theme);
  // remembered for theme.js, so it knows whether to keep following the OS
  root.setAttribute('data-theme-source', chosen ? 'user' : 'system');
  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#101419' : '#eef0f3');
}());

// the board is JS-rendered; mark the document so the placeholder shows and the
// real regions stay hidden until there is something in them (no empty-looking page)
document.documentElement.classList.add('is-loading');
