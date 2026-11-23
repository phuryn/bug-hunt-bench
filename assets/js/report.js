/* The report keeps every harness in view. Shared renderers take the benchmark's
   score scale, measurement labels and per-run observations from the report data. */
import { COLUMNS, GROUPS, el } from './format.js?v=6a8ac2259b';
import { renderColgroup, renderHead, renderBody } from './table.js?v=6a8ac2259b';
import { AXES, renderScatter } from './scatter.js?v=6a8ac2259b';
import { renderCoverage, coverageOrderNote, coverageSummaryNote } from './coverage.js?v=6a8ac2259b';
import { initTheme } from './theme.js?v=6a8ac2259b';
import './nav.js?v=6a8ac2259b';

const $ = (id) => document.getElementById(id);

function renderIntro(meta) {
  const setup = meta.task_names
    ? `the same ${meta.score_total} Terminal-Bench tasks`
    : 'the same planted bugs across both repositories';
  $('report-lede').textContent =
    `Every run uses ${meta.model} at ${meta.effort} effort on ${setup}. `
    + `Only the harness varies, with ${meta.runs_per_harness} runs for each of ${meta.harness_count} harnesses`
    + (meta.has_turns ? '.' : ', and the published Terminal-Bench results carry no turn counts.');
  $('report-source').href = meta.source;
  $('report-footer-source').href = meta.source;
  $('report-cost-note').textContent = meta.cost_note;
  $('report-time-note').textContent = meta.time_note;
}

function renderKeys(meta, runs) {
  const keys = $('table-keys');
  keys.appendChild(el('div', {}, [
    el('h3', { text: 'Reading the score' }),
    el('p', { text: `The bar shows the mean of ${meta.runs_per_harness} runs on a shared scale out of ${meta.score_total}. Each dot marks one run, with a lane for each run so equal scores stay visible.` }),
    !meta.task_names ? el('p', {}, [
      `Repo 1 has ${meta.repo1_bug_count} planted bugs and repo 2 has ${meta.repo2_total}. `,
      el('a', { href: '/method#def-extras' }, ['Unplanted fixes']),
      ' are tracked separately from the score. The row’s title and JSON give the per-run scores, partial fixes and claimed-only fixes.',
    ]) : null,
  ]));
  keys.appendChild(el('div', {}, [
    el('h3', { text: 'Who built the harness' }),
    el('p', { text: 'Mini Harness is built by Pawel Huryn, the author of this site.' }),
    runs.some((r) => r.native) ? el('p', { text: 'A native harness is built by the lab that made the model.' }) : null,
  ]));
}

async function boot() {
  const path = $('report-json').getAttribute('href');
  const response = await fetch(path, { cache: 'no-cache' });
  if (!response.ok) throw new Error(`Report data returned HTTP ${response.status}`);
  const { meta, runs } = await response.json();
  const tabs = [...document.querySelectorAll('.tab')];
  const panels = new Map(tabs.map((tab) => [tab.dataset.view, $(tab.getAttribute('aria-controls'))]));
  const state = { sort: 'fixed', dir: 'desc', view: 'table' };
  const columns = COLUMNS.filter((c) => c.key !== 'extras' || !meta.task_names).map((c) => {
    if (c.key === 'model') return { ...c, label: 'Harness', pct: meta.task_names ? 32 : 26 };
    if (c.key === 'fixed') return { ...c, label: meta.task_names ? 'Passed' : 'Fixed', unit: `/${meta.score_total}`, pct: meta.task_names ? 32 : 29 };
    if (c.key === 'wall_min') return { ...c, label: meta.time_label, pct: meta.task_names ? 18 : 16 };
    return c.key === 'cost_usd' && meta.task_names ? { ...c, pct: 18 } : c;
  });
  const groups = GROUPS.map((g) => g.id === 'score' && meta.task_names
    ? { ...g, label: 'Score · tasks passed', def: null }
    : g.id === 'meta' ? { ...g, label: 'Per run' } : g);

  function renderTable() {
    renderHead($('board-head'), state, (key) => {
      const old = state.sort === key;
      state.dir = old ? (state.dir === 'asc' ? 'desc' : 'asc') : key === 'model' ? 'asc' : 'desc';
      state.sort = key;
      renderTable();
      $('board-head').querySelector('th[aria-sort] button').focus();
    }, columns, groups);
    renderBody($('board-body'), runs, state, null, {
      columns, scoreTotal: meta.score_total, timeLabel: meta.time_label,
    });
  }

  function renderChart() {
    const key = state.view;
    const axis = {
      ...AXES[key], scoreTotal: meta.score_total, scoreLabel: meta.score_label,
      ...(key === 'time' ? {
        noun: meta.time_label, name: `${meta.time_label}, minutes`, nameCompact: `${meta.time_label}, min`,
        chartTitle: `Score against ${meta.time_label.toLowerCase()}`,
        measureLabel: meta.time_label.toLowerCase(), flag: meta.has_turns ? 'wall_note' : null,
      } : {}),
    };
    renderScatter(panels.get(key).querySelector('.chart-host'), runs, runs, axis, (layout) => {
      const parts = [
        'Dots show means. Whiskers span the lowest and highest recorded values across runs. The score axis focuses on the measured range. ',
        'The horizontal axis is logarithmic.',
      ];
      if (layout.flagged.length) parts.push(' * Marks harnesses with runs affected by overlapping work or recorded machine contention.');
      if (key === 'turns') parts.push(' Turns count tool calls plus one per repository leg.');
      if (layout.points.some((p) => p.incompleteCost)) {
        parts.push(' Cost whiskers are omitted for harnesses with missing task costs.');
      }
      return parts;
    });
  }

  function render() {
    $('report-cost-note').hidden = !['table', 'cost'].includes(state.view);
    $('report-time-note').hidden = !['table', 'time'].includes(state.view);
    if (state.view === 'table') renderTable();
    else if (state.view === 'coverage') {
      const layout = renderCoverage($('coverage-host'), runs, meta);
      $('coverage-note').replaceChildren(
        el('p', { class: 'chart__note', text: coverageOrderNote(layout) }),
        el('p', { class: 'chart__note', text: coverageSummaryNote(layout) }),
      );
    } else renderChart();
  }

  function show(tab, focus = false) {
    state.view = tab.dataset.view;
    tabs.forEach((item) => {
      const active = item === tab;
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
      panels.get(item.dataset.view).hidden = !active;
    });
    if (focus) tab.focus();
    render();
  }

  renderIntro(meta);
  renderColgroup($('report-board'), columns);
  renderKeys(meta, runs);
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => show(tab));
    tab.addEventListener('keydown', (event) => {
      const next = {
        ArrowLeft: (i + tabs.length - 1) % tabs.length, ArrowRight: (i + 1) % tabs.length,
        Home: 0, End: tabs.length - 1,
      }[event.key];
      if (next === undefined) return;
      event.preventDefault();
      show(tabs[next], true);
    });
  });
  initTheme(render);
  const charts = [...document.querySelectorAll('.chart-host')];
  for (const host of charts) {
    let width = 0;
    new ResizeObserver(() => {
      if (host.clientWidth && width !== host.clientWidth) {
        width = host.clientWidth;
        if (!host.closest('.panel').hidden && !['table', 'coverage'].includes(state.view)) renderChart();
      }
    }).observe(host);
  }
  if (document.fonts?.ready) document.fonts.ready.then(() => {
    if (!['table', 'coverage'].includes(state.view)) renderChart();
  });
  show(tabs[0]);
  document.documentElement.classList.remove('is-loading');
}

boot().catch((error) => {
  document.documentElement.classList.remove('is-loading');
  $('report-views').replaceChildren(el('p', { class: 'empty', text: 'The report data could not be loaded. You can still open the report JSON above.' }));
  console.error(error);
});
