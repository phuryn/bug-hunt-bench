/* Run picker: native checkboxes, three levels deep at most, so keyboard and
   screen-reader behaviour is the platform's and not ours.

   WHY IT IS NOT A FLAT LIST ANY MORE. The board passed 66 runs, and a flat
   vendor-by-vendor list had two problems at once: the long vendors were unreadable
   (OpenAI alone is 19 rows - five efforts across four models, with the model name
   repeated on every line) and the short ones were noise (three vendors contributing
   a single row each, under a heading of their own). Both are solved by the same
   idea: put a level where the repetition is, and take one away where there is
   nothing to group.

   THE TWO RULES, thresholds rather than a hand-kept list of vendors, so the picker
   keeps working as the board grows:

     a vendor with more than one model gets a MODEL level - one collapsible group
        per model, the effort ladder inside it. The model name stops repeating and
        the tier becomes the only thing a row says, which is the only thing that
        varies.

     a vendor with OTHER_MAX_RUNS or fewer runs is folded into OTHER, where it
        keeps its own sub-heading and its own select-all. Nothing is hidden and
        nothing is renamed; a one-row vendor simply stops claiming a column of its
        own. This is also what keeps open-weights models released by one lab but
        served by somebody else out of that lab's own group, which is a real
        distinction rather than a cosmetic one.

     a group of ONE is not a group. A model with a single run, or a vendor inside
        OTHER with a single run, is drawn as a plain row - wrapping one thing in a
        container that has to be opened costs a click and buys nothing.

   GROUPS START CLOSED. The picker exists to CHANGE a selection, and at that job a
   closed group is better: the tri-state heading already reports all / some / none,
   so the whole board fits on one screen and the reader opens only the family they
   want to adjust. Open by default put an eighteen-row wall back on the page and
   said nothing the headings were not already saying.

   EVERY GROUP HEADER IS A REAL CHECKBOX, vendor and model alike, and it carries the
   indeterminate state. That is the difference between "select all" (a button, which
   can only act) and a checkbox (which also REPORTS: all, some, none). Asking for a
   model's efforts to behave "just like the whole provider" is asking for exactly
   this, at both levels. */

import { el, fmtDate, effortSuffix } from './format.js?v=37126e2520';
import { runColor } from './theme.js?v=37126e2520';

const OTHER_MAX_RUNS = 3;
const OTHER_LABEL = 'Other';

/* Open/closed state for the collapsible groups, kept here rather than in the
   board's state because it is a property of this widget and outlives nothing else.
   Everything starts closed; after that the reader owns it, and the picker rebuilds
   on every toggle, so a group that snapped shut the moment you cleared its last run
   would be unusable. */
const openGroups = new Map();

/* Every group checkbox drawn in the current picker, with the runs it stands for.
   A single run toggle must update its model heading and its vendor heading, and
   re-rendering the whole picker to do that would destroy the element the reader
   just clicked and take their keyboard focus with it. So the headings are
   refreshed in place instead. Rebuilt from scratch on every render. */
const groupBoxes = [];

export function refreshGroups(selected) {
  groupBoxes.forEach(({ box, group }) => tristate(box, group, selected));
}

function groupOpen(id) {
  return openGroups.get(id) === true;
}

function tristate(input, group, selected) {
  const on = group.filter((r) => selected.has(r.slug)).length;
  input.checked = on === group.length;
  input.indeterminate = on > 0 && on < group.length;
}

/* One run. `showName` is false inside a model group, where the heading already says
   the model and the tier is the only thing left that differs; `showSwatch` is false
   when the group header carries the colour for the whole family. */
function runRow(r, selected, onToggle, { showName, showSwatch }) {
  const input = el('input', { type: 'checkbox', id: `run-${r.slug}` });
  input.checked = selected.has(r.slug);
  input.addEventListener('change', () => onToggle(r.slug, input.checked));

  /* the tier the run was asked for, as the board's badge shows it - plus the two
     words the clamped row carries there */
  const meta = [String(r.effort || '').toUpperCase(), effortSuffix(r), fmtDate(r.date)]
    .filter(Boolean).join(' · ');

  const body = showName
    ? el('span', { class: 'run__body' }, [
      el('span', { class: 'run__name', text: r.model }),
      el('span', { class: 'run__meta' }, [
        meta,
        r.superseded ? ' · ' : null,
        r.superseded ? el('span', { class: 'tag tag--superseded', text: 'superseded' }) : null,
      ]),
    ])
    : el('span', { class: 'run__body' }, [
      el('span', { class: 'run__name run__name--tier', text: meta }),
      r.superseded ? el('span', { class: 'tag tag--superseded', text: 'superseded' }) : null,
    ]);

  return el('label', { class: `run${showSwatch ? '' : ' run--nosw'}`, for: `run-${r.slug}` }, [
    input,
    showSwatch ? el('span', { class: 'swatch', style: { 'background-color': runColor(r.color) } }) : null,
    body,
  ]);
}

/* A collapsible sub-group: a model inside a big vendor, or a small vendor inside
   OTHER. The same component either way - only what the heading names changes. */
/* `nameRows` is what distinguishes the two callers. Inside a MODEL group the
   heading already names the model, so a row only has to say its tier; inside OTHER
   the heading names the VENDOR, so the rows still have to name their model - a row
   reading only "DEFAULT - 26 Jul" under a heading reading "Moonshot AI" has lost
   the one thing a reader was looking for. */
function subGroup(id, title, group, selected, onToggle, onGroupToggle, nameRows) {
  if (group.length === 1) {
    return runRow(group[0], selected, onToggle, { showName: true, showSwatch: true });
  }
  const shared = !nameRows && new Set(group.map((r) => r.color)).size === 1;

  const box = el('input', { type: 'checkbox', class: 'group__box' });
  box.setAttribute('aria-label', `Select all ${group.length} ${title} runs`);
  tristate(box, group, selected);
  groupBoxes.push({ box, group });
  /* inside a <summary> a click on the checkbox would also open or close the group;
     the checkbox takes its own click and the summary keeps the rest */
  box.addEventListener('click', (e) => e.stopPropagation());
  box.addEventListener('change', () => onGroupToggle(group, box.checked));

  const summary = el('summary', { class: 'group__head' }, [
    box,
    shared ? el('span', { class: 'swatch', style: { 'background-color': runColor(group[0].color) } }) : null,
    el('span', { class: 'group__name', text: title }),
    el('span', { class: 'group__count', text: String(group.length) }),
  ]);

  const details = el('details', { class: 'group' }, [summary]);
  details.open = groupOpen(id);
  details.addEventListener('toggle', () => openGroups.set(id, details.open));
  group.forEach((r) => details.appendChild(
    runRow(r, selected, onToggle, { showName: !shared, showSwatch: !shared }),
  ));
  return details;
}

function vendorFieldset(name, group, selected, onGroupToggle, children) {
  const box = el('input', { type: 'checkbox', class: 'vendor__box' });
  box.setAttribute('aria-label', `Select all ${group.length} ${name} runs`);
  tristate(box, group, selected);
  groupBoxes.push({ box, group });
  box.addEventListener('change', () => onGroupToggle(group, box.checked));

  const legend = el('legend', {}, [
    el('label', { class: 'vendor' }, [
      box,
      el('span', { class: 'vendor__name', text: name }),
      el('span', { class: 'vendor__count', text: String(group.length) }),
    ]),
  ]);
  const fs = el('fieldset', {}, [legend]);
  children.forEach((c) => fs.appendChild(c));
  return fs;
}

function byKey(runs, key) {
  const order = [];
  const map = new Map();
  runs.forEach((r) => {
    const k = r[key];
    if (!map.has(k)) { map.set(k, []); order.push(k); }
    map.get(k).push(r);
  });
  return { order, map };
}

const rank = (a, b) => (a.group_rank ?? 1e9) - (b.group_rank ?? 1e9);

export function renderPicker(gridEl, runs, selected, onToggle, onGroupToggle) {
  gridEl.textContent = '';
  groupBoxes.length = 0;
  const { order: vendors, map: byVendor } = byKey(runs, 'vendor');

  const big = vendors.filter((v) => byVendor.get(v).length > OTHER_MAX_RUNS);
  const small = vendors.filter((v) => byVendor.get(v).length <= OTHER_MAX_RUNS);

  big.forEach((vendor) => {
    const group = byVendor.get(vendor).slice().sort(rank);
    const { order: models, map: byModel } = byKey(group, 'model');
    const children = models.length > 1
      ? models.map((m) => subGroup(`${vendor}/${m}`, m, byModel.get(m),
        selected, onToggle, onGroupToggle, false))
      : group.map((r) => runRow(r, selected, onToggle, { showName: true, showSwatch: true }));
    gridEl.appendChild(vendorFieldset(vendor, group, selected, onGroupToggle, children));
  });

  if (!small.length) return;
  /* OTHER gets a select-all over everything inside it, and each vendor under it
     keeps its own. Ordered by size, so the single-row vendors sit together at the
     bottom instead of being scattered through the group. */
  const all = small.flatMap((v) => byVendor.get(v));
  const ordered = small.slice().sort((a, b) => byVendor.get(b).length - byVendor.get(a).length);
  const children = ordered.map((v) => subGroup(
    `other/${v}`, v, byVendor.get(v).slice().sort(rank), selected, onToggle, onGroupToggle, true,
  ));
  gridEl.appendChild(vendorFieldset(OTHER_LABEL, all, selected, onGroupToggle, children));
}
