/** js/partners-directory.js — Partners Directory: filters, accordion, mobile drawer
 *  Vanilla JS ES2020+. Strict mode IIFE. Zero globals. Zero dependencies.
 *  Depends on: partners-directory.css (.pd-* classes)
 */
(function () {
  'use strict';

  const STATE = {
    filters: { region: [], language: [], fps: false, founder: false },
    expanded: new Set(),
  };

  // ─── Init ───────────────────────────────────────────────────────────────────

  function init() {
    bindAccordion();
    bindFilters();
    bindMobileDrawer();
    readURLState();
    applyFilters();
  }

  // ─── Accordion ──────────────────────────────────────────────────────────────

  function bindAccordion() {
    const list = document.querySelector('.pd-list');
    if (!list) return;

    // Event delegation on the list container
    list.addEventListener('click', function (e) {
      const toggle = e.target.closest('.pd-row__toggle');
      const row = e.target.closest('.pd-row');

      if (toggle && row) {
        e.stopPropagation();
        toggleRow(row, toggle);
        return;
      }

      // Click anywhere on pd-row (not on a link/button inside) also toggles
      if (row && !e.target.closest('a') && !e.target.closest('button')) {
        const t = row.querySelector('.pd-row__toggle');
        toggleRow(row, t);
      }
    });

    // Esc closes currently expanded rows
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      const expanded = list.querySelectorAll('.pd-expand--open');
      expanded.forEach(function (exp) {
        const row = exp.closest('.pd-row');
        if (row) {
          const toggle = row.querySelector('.pd-row__toggle');
          closeRow(row, toggle, exp);
        }
      });
    });
  }

  function toggleRow(row, toggle) {
    const expand = row.querySelector('.pd-expand');
    if (!expand) return;

    const isOpen = expand.classList.contains('pd-expand--open');
    if (isOpen) {
      closeRow(row, toggle, expand);
    } else {
      openRow(row, toggle, expand);
    }
  }

  function openRow(row, toggle, expand) {
    expand.classList.add('pd-expand--open');
    expand.removeAttribute('aria-hidden');
    if (toggle) {
      toggle.setAttribute('aria-expanded', 'true');
      const icon = toggle.querySelector('.pd-row__toggle-icon');
      if (icon) icon.textContent = '▴';
    }
    const id = row.dataset.pdId;
    if (id) STATE.expanded.add(id);
    writeURLState();
  }

  function closeRow(row, toggle, expand) {
    expand.classList.remove('pd-expand--open');
    expand.setAttribute('aria-hidden', 'true');
    if (toggle) {
      toggle.setAttribute('aria-expanded', 'false');
      const icon = toggle.querySelector('.pd-row__toggle-icon');
      if (icon) icon.textContent = '▾';
    }
    const id = row.dataset.pdId;
    if (id) STATE.expanded.delete(id);
    writeURLState();
  }

  // ─── Filters ────────────────────────────────────────────────────────────────

  function bindFilters() {
    // Delegate to document — works for both sidebar and drawer checkboxes
    document.addEventListener('change', function (e) {
      const input = e.target.closest('input[data-pd-filter]');
      if (!input) return;
      updateFilterState(input);
      syncCheckboxPairs(input);
      applyFilters();
    });

    // Clear buttons (sidebar + drawer may each have one)
    document.addEventListener('click', function (e) {
      const btn = e.target.closest('.pd-sidebar__clear');
      if (!btn) return;
      resetFilters();
    });
  }

  function updateFilterState(input) {
    const filterKey = input.dataset.pdFilter; // 'region', 'language', 'fps', 'founder'
    const value = input.value;

    if (filterKey === 'fps' || filterKey === 'founder') {
      STATE.filters[filterKey] = input.checked;
    } else {
      const arr = STATE.filters[filterKey];
      if (!arr) return;
      if (input.checked) {
        if (arr.indexOf(value) === -1) arr.push(value);
      } else {
        const idx = arr.indexOf(value);
        if (idx !== -1) arr.splice(idx, 1);
      }
    }
  }

  // Keep sidebar + drawer checkboxes in sync
  function syncCheckboxPairs(changedInput) {
    const filterKey = changedInput.dataset.pdFilter;
    const value = changedInput.value;
    const all = document.querySelectorAll('input[data-pd-filter="' + filterKey + '"]');
    all.forEach(function (inp) {
      if (inp === changedInput) return;
      if (filterKey === 'fps' || filterKey === 'founder') {
        inp.checked = changedInput.checked;
      } else if (inp.value === value) {
        inp.checked = changedInput.checked;
      }
    });
  }

  function resetFilters() {
    STATE.filters.region = [];
    STATE.filters.language = [];
    STATE.filters.fps = false;
    STATE.filters.founder = false;

    document.querySelectorAll('input[data-pd-filter]').forEach(function (inp) {
      inp.checked = false;
    });

    applyFilters();
  }

  // ─── Apply filters ──────────────────────────────────────────────────────────

  function applyFilters() {
    const rows = document.querySelectorAll('.pd-row');
    let visible = 0;

    rows.forEach(function (row) {
      const show = rowMatchesFilters(row);
      // .pd-expand is inside .pd-row — hiding the row also hides expand
      row.style.display = show ? '' : 'none';
      if (show) visible++;
    });

    updateResultCount(visible);
    writeURLState();
  }

  function rowMatchesFilters(row) {
    const { region, language, fps, founder } = STATE.filters;

    if (region.length > 0) {
      const rowRegion = (row.dataset.pdRegion || '').toLowerCase();
      const match = region.some(function (r) {
        return rowRegion === r.toLowerCase() || rowRegion.indexOf(r.toLowerCase()) !== -1;
      });
      if (!match) return false;
    }

    if (language.length > 0) {
      const rowLang = (row.dataset.pdLang || '').toLowerCase();
      const match = language.some(function (l) {
        return rowLang.indexOf(l.toLowerCase()) !== -1;
      });
      if (!match) return false;
    }

    if (fps) {
      if (row.dataset.pdFps !== '1') return false;
    }

    if (founder) {
      if (!row.classList.contains('pd-row--founder')) return false;
    }

    return true;
  }

  function updateResultCount(count) {
    // .pd-result-count contains the full "N escolas" / "N schools" text
    const el = document.querySelector('.pd-result-count');
    if (!el) return;
    // Detect language from html[lang] attribute to set correct label
    const lang = document.documentElement.lang || 'pt';
    const isEN = lang.startsWith('en');
    const label = isEN
      ? (count === 1 ? 'school' : 'schools')
      : (count === 1 ? 'escola' : 'escolas');
    el.textContent = count + ' ' + label;
  }

  // ─── Mobile Drawer ──────────────────────────────────────────────────────────

  function bindMobileDrawer() {
    const btn = document.querySelector('.pd-mobile-filters-btn');
    const drawer = document.querySelector('.pd-drawer');
    const backdrop = document.querySelector('.pd-drawer__backdrop');
    const closeBtn = document.querySelector('.pd-drawer__close');

    if (!btn || !drawer) return;

    btn.addEventListener('click', function () {
      openDrawer(drawer, backdrop, btn);
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        closeDrawer(drawer, backdrop, btn);
      });
    }

    if (backdrop) {
      backdrop.addEventListener('click', function () {
        closeDrawer(drawer, backdrop, btn);
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('pd-drawer--open')) {
        closeDrawer(drawer, backdrop, btn);
      }
    });
  }

  function openDrawer(drawer, backdrop, triggerBtn) {
    drawer.classList.add('pd-drawer--open');
    drawer.setAttribute('aria-hidden', 'false');
    if (backdrop) backdrop.classList.add('pd-drawer__backdrop--visible');
    document.body.style.overflow = 'hidden';
    // Focus first interactive element inside drawer
    const first = drawer.querySelector('button, input, a');
    if (first) first.focus();
    if (triggerBtn) triggerBtn.setAttribute('aria-expanded', 'true');
  }

  function closeDrawer(drawer, backdrop, triggerBtn) {
    drawer.classList.remove('pd-drawer--open');
    drawer.setAttribute('aria-hidden', 'true');
    if (backdrop) backdrop.classList.remove('pd-drawer__backdrop--visible');
    document.body.style.overflow = '';
    if (triggerBtn) {
      triggerBtn.setAttribute('aria-expanded', 'false');
      triggerBtn.focus();
    }
  }

  // ─── URL state ──────────────────────────────────────────────────────────────

  function readURLState() {
    const params = new URLSearchParams(window.location.search);

    const regionParam = params.get('region');
    if (regionParam) {
      STATE.filters.region = regionParam.split(',').filter(Boolean);
    }

    const langParam = params.get('lang');
    if (langParam) {
      STATE.filters.language = langParam.split(',').filter(Boolean);
    }

    STATE.filters.fps = params.get('fps') === '1';
    STATE.filters.founder = params.get('founder') === '1';

    // Mark matching checkboxes
    document.querySelectorAll('input[data-pd-filter]').forEach(function (inp) {
      const key = inp.dataset.pdFilter;
      if (key === 'region') {
        inp.checked = STATE.filters.region.indexOf(inp.value) !== -1;
      } else if (key === 'language') {
        inp.checked = STATE.filters.language.indexOf(inp.value) !== -1;
      } else if (key === 'fps') {
        inp.checked = STATE.filters.fps;
      } else if (key === 'founder') {
        inp.checked = STATE.filters.founder;
      }
    });

    // Restore expanded rows
    const expandedParam = params.get('open');
    if (expandedParam) {
      expandedParam.split(',').filter(Boolean).forEach(function (id) {
        STATE.expanded.add(id);
        const row = document.querySelector('.pd-row[data-pd-id="' + id + '"]');
        if (row) {
          const toggle = row.querySelector('.pd-row__toggle');
          const expand = row.querySelector('.pd-expand');
          if (expand) openRow(row, toggle, expand);
        }
      });
    }
  }

  function writeURLState() {
    const params = new URLSearchParams();

    if (STATE.filters.region.length > 0) {
      params.set('region', STATE.filters.region.join(','));
    }
    if (STATE.filters.language.length > 0) {
      params.set('lang', STATE.filters.language.join(','));
    }
    if (STATE.filters.fps) params.set('fps', '1');
    if (STATE.filters.founder) params.set('founder', '1');

    const openIds = Array.from(STATE.expanded);
    if (openIds.length > 0) {
      params.set('open', openIds.join(','));
    }

    const qs = params.toString();
    const newURL = window.location.pathname + (qs ? '?' + qs : '');
    history.replaceState(null, '', newURL);
  }

  // ─── Boot ───────────────────────────────────────────────────────────────────

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
