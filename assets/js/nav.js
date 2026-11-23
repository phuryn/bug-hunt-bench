const menu = document.querySelector('.navmenu');

if (menu) {
  const summary = menu.querySelector('summary');
  document.addEventListener('click', (event) => {
    if (menu.open && !menu.contains(event.target)) menu.open = false;
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !menu.open || event.defaultPrevented) return;
    menu.open = false;
    if (menu.contains(document.activeElement)) summary.focus();
  });
}

export const comparisonIndex = fetch('/data/harness/index.json', { cache: 'no-cache' })
  .then((response) => response.ok ? response.json() : [])
  .catch(() => []);

comparisonIndex.then((reports) => {
  if (!menu) return;
  const links = [...menu.querySelectorAll('.navmenu__item')];
  for (const report of reports) {
    const link = links.find((item) => item.getAttribute('href') === `/harness/${report.slug}`);
    if (!link) continue;
    link.querySelector('.navmenu__meta').textContent = report.board_model
      ? `${report.harness_count} harnesses · ${report.runs_per_harness} high-effort runs each`
      : `${report.harness_count} harnesses · ${report.score_total} tasks · ${report.runs_per_harness} passes each`;
  }
});
