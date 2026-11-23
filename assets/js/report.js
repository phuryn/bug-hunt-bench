/* The report keeps every harness in view. Shared renderers take the benchmark's
   score scale, measurement labels and per-run observations from the report data. */
import { COLUMNS, GROUPS, el, fmtDate, runName, reportFootnotes } from './format.js?v=b73833cb8d';
import { renderColgroup, renderHead, renderBody } from './table.js?v=b73833cb8d';
import { AXES, renderScatter } from './scatter.js?v=b73833cb8d';
import { renderCoverage, coverageOrderNote, coverageSummaryNote } from './coverage.js?v=b73833cb8d';
import { initTheme } from './theme.js?v=b73833cb8d';
import { exportView } from './export-png.js?v=b73833cb8d';
import './nav.js?v=b73833cb8d';

const $ = (id) => document.getElementById(id);
const names = (runs) => new Intl.ListFormat('en').format(runs.map(runName).sort());

function renderIntro(meta, runs) {
  const setup = meta.task_names
    ? `the same ${meta.score_total} Terminal-Bench tasks`
    : 'the same planted bugs across both repositories';
  $('report-lede').textContent =
    `Every run uses ${meta.model} at ${meta.effort} effort on ${setup}. `
    + `Only the harness varies, with ${meta.runs_per_harness} runs for each of ${meta.harness_count} harnesses.`;
  if (meta.task_names) {
    const counted = runs.filter((run) => Number.isFinite(run.turns));
    if (meta.has_turns) {
      $('report-lede').textContent += ` Turn counts are available for ${counted.length} of ${runs.length} harnesses.`;
    } else if (counted.length) {
      $('report-lede').textContent += ` Only ${names(counted)}’s logs from these runs were kept.`;
    }
  }
  $('report-source').href = meta.source;
  $('report-footer-source').href = meta.source;
  const updated = $('report-updated');
  updated.dateTime = meta.updated;
  updated.textContent = `Updated ${fmtDate(meta.updated)}`;
  updated.hidden = false;
  $('report-cost-note').textContent = meta.cost_note;
  $('report-time-note').textContent = meta.time_note;
}

function scoreNote(meta) {
  return `The bar shows the mean of ${meta.runs_per_harness} runs on a shared scale out of ${meta.score_total}. Each dot marks one run, with a lane for each run so equal scores stay visible.`;
}

function renderKeys(meta, runs) {
  const keys = $('table-keys');
  keys.appendChild(el('div', {}, [
    el('h3', { text: 'Reading the score' }),
    el('p', { text: scoreNote(meta) }),
    !meta.task_names ? el('p', {}, [
      `Repo 1 has ${meta.repo1_bug_count} planted bugs and repo 2 has ${meta.repo2_total}. `,
      el('a', { href: '/method#def-extras' }, ['Unplanted fixes']),
      ' are tracked separately from the score. The row’s title and JSON give the per-run scores, partial fixes and claimed-only fixes.',
    ]) : null,
  ]));
  keys.appendChild(el('div', {}, [
    el('h3', { text: 'Who built the harness' }),
    el('p', {}, [
      el('a', { href: 'https://github.com/phuryn/mini-harness' }, ['Mini Harness']),
      ' is built by Pawel Huryn, the author of this site.',
    ]),
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

  function axisFor(key) {
    return AXES[key] && {
      ...AXES[key], scoreTotal: meta.score_total, scoreLabel: meta.score_label,
      ...(key === 'time' ? {
        noun: meta.time_label, name: `${meta.time_label}, minutes`, nameCompact: `${meta.time_label}, min`,
        chartTitle: `Score against ${meta.time_label.toLowerCase()}`,
        measureLabel: meta.time_label.toLowerCase(), flag: meta.task_names ? null : 'wall_note',
      } : {}),
      ...(key === 'turns' && meta.task_names ? { describeSkipped: terminalTurnsOmissions } : {}),
    };
  }

  function terminalTurnsOmissions({ missingRuns, zeroRuns }) {
    return [
      missingRuns.length && `${names(missingRuns)} ${missingRuns.length === 1 ? 'is' : 'are'} left out: some of their runs left no log to count turns from.`,
      zeroRuns.length && `${names(zeroRuns)} recorded zero turns, which the logarithmic axis cannot show.`,
    ].filter(Boolean).join(' ');
  }

  function chartCaption(layout) {
    const parts = [
      'Dots show means. Whiskers span the lowest and highest recorded values across runs. The score axis focuses on the measured range. ',
      'The horizontal axis is logarithmic.',
    ];
    if (layout.flagged.length) parts.push(' A broken ring marks harnesses with runs affected by overlapping work or recorded machine contention.');
    if (layout.axis.id === 'turns') {
      parts.push(` Turns count tool calls plus one per ${meta.task_names ? 'task' : 'repository leg'}.`);
    }
    if (layout.points.some((p) => p.incompleteCost)) {
      parts.push(' Cost whiskers are omitted for harnesses with missing task costs.');
    }
    return parts.join('');
  }

  function renderChart() {
    const key = state.view;
    const host = panels.get(key).querySelector('.chart-host');
    const layout = renderScatter(host, runs, runs, axisFor(key), chartCaption);
    if (key === 'turns' && meta.task_names && layout) {
      const notes = reportFootnotes(layout.points.map(({ run, notes }) =>
        [run, notes.filter((note) => note.column === 'turns')]));
      host.append(...notes.map((note) => el('p', { class: 'chart__def', text: note })));
    }
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

  renderIntro(meta, runs);
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
  const exportBtn = $('export-png');
  exportBtn.addEventListener('click', async () => {
    if (exportBtn.classList.contains('is-busy')) return;
    const original = exportBtn.textContent;
    const view = state.view;
    exportBtn.classList.add('is-busy');
    exportBtn.textContent = 'Rendering…';
    try {
      await exportView({
        view, axis: axisFor(view), runs, allRuns: runs, state: { ...state },
        meta,
        siteUrl: document.querySelector('link[rel="canonical"]').href,
        report: {
          title: document.querySelector('.report-head h1').textContent.trim(),
          viewName: $('report-views').querySelector('.tab[aria-selected="true"]').textContent.trim(),
          columns, groups, chartCaption,
          notes: [
            ...(view === 'table' ? [...$('table-keys').querySelectorAll('p')].map((note) => note.textContent) : []),
            ...['report-cost-note', 'report-time-note'].map($).filter((note) => !note.hidden)
              .map((note) => note.textContent),
          ],
        },
      });
    } finally {
      exportBtn.classList.remove('is-busy');
      exportBtn.textContent = original;
    }
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
