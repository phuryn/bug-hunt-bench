/* Run picker: native checkboxes grouped by vendor, so keyboard and screen-reader
   behaviour is the platform's, not ours. */

import { el, fmtDate, effortSuffix } from './format.js?v=07af07f3fb';
import { runColor } from './theme.js?v=07af07f3fb';

export function renderPicker(gridEl, runs, selected, onToggle, onVendorToggle) {
  gridEl.textContent = '';
  const vendors = [];
  const byVendor = new Map();
  runs.forEach((r) => {
    if (!byVendor.has(r.vendor)) { byVendor.set(r.vendor, []); vendors.push(r.vendor); }
    byVendor.get(r.vendor).push(r);
  });

  vendors.forEach((vendor) => {
    const group = byVendor.get(vendor);
    group.sort((a, b) => (a.group_rank ?? 1e9) - (b.group_rank ?? 1e9));
    const allOn = group.every((r) => selected.has(r.slug));
    const toggle = el('button', {
      type: 'button',
      class: 'vendor-toggle',
      text: `${vendor} (${group.length})`,
    });
    toggle.setAttribute('aria-label', `${allOn ? 'Clear' : 'Select'} all ${group.length} ${vendor} runs`);
    toggle.addEventListener('click', () => onVendorToggle(group, !allOn));

    const fs = el('fieldset', {}, [el('legend', {}, [toggle])]);

    group.forEach((r) => {
      const input = el('input', {
        type: 'checkbox',
        id: `run-${r.slug}`,
        checked: selected.has(r.slug),
      });
      input.checked = selected.has(r.slug);
      input.addEventListener('change', () => onToggle(r.slug, input.checked));
      const label = el('label', { class: 'run', for: `run-${r.slug}` }, [
        input,
        el('span', { class: 'swatch', style: { 'background-color': runColor(r.color) } }),
        el('span', { class: 'run__body' }, [
          el('span', { class: 'run__name', text: r.model }),
          el('span', { class: 'run__meta' }, [
            /* the tier the run was asked for, as the board's badge shows it -
               plus the two words the clamped row carries there */
            [String(r.effort || '').toUpperCase(), effortSuffix(r), fmtDate(r.date)]
              .filter(Boolean).join(' · '),
            r.superseded ? ' · ' : null,
            r.superseded ? el('span', { class: 'tag tag--superseded', text: 'superseded' }) : null,
          ]),
        ]),
      ]);
      fs.appendChild(label);
    });

    gridEl.appendChild(fs);
  });
}
