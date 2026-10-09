/** js/partners-directory.js — Partners Directory: filters, accordion, mobile drawer
 *  Vanilla JS ES2020+. Strict mode IIFE. Zero globals. Zero dependencies.
 *  Depends on: partners-directory.css (.pd-* classes)
 *  Lote F 09/10/2026: conteudo fechado com inert (sem Tab); clique dentro do cartao aberto ja nao o fecha;
 *  eventos school_expand / school_outbound_click {school,type} / escolas_filter; contador de filtros ativos
 *  (.pd-mobile-count); estado vazio (.esc-dir__empty); foco preso no drawer; ancora faz scroll para a linha.
 */
(function () {
  'use strict';

  const STATE = {
    filters: { region: [], language: [], fps: false, founder: false },
    expanded: new Set(),
  };

  // ─── Init ───────────────────────────────────────────────────────────────────

  function track(name, params) {
    try {
      if (typeof window.track === 'function') window.track(name, params || {});
      else if (typeof window.gtag === 'function') window.gtag('event', name, params || {});
    } catch (_) {}
  }

  function init() {
    document.querySelectorAll('.pd-expand:not(.pd-expand--open)').forEach(function (exp) { exp.inert = true; });
    bindAccordion();
    bindOutbound();
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
        toggleRow(row, toggle, true);
        return;
      }

      // Click anywhere on pd-row (not on a link/button inside, nor inside the open card) also toggles
      if (row && !e.target.closest('a') && !e.target.closest('button') && !e.target.closest('.pd-expand')) {
        const t = row.querySelector('.pd-row__toggle');
        toggleRow(row, t, true);
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

  function toggleRow(row, toggle, byUser) {
    const expand = row.querySelector('.pd-expand');
    if (!expand) return;

    const isOpen = expand.classList.contains('pd-expand--open');
    if (isOpen) {
      closeRow(row, toggle, expand);
    } else {
      openRow(row, toggle, expand);
      if (byUser) track('school_expand', { school: row.dataset.pdId || '' });
    }
  }

  // Texto do botao (opcional): <span class="pd-row__toggle-txt" data-open="Fechar" data-closed="Ver detalhes">
  function setToggleText(toggle, open) {
    const t = toggle.querySelector('.pd-row__toggle-txt');
    if (!t) return;
    const v = t.getAttribute(open ? 'data-open' : 'data-closed');
    if (v) t.textContent = v;
  }

  function openRow(row, toggle, expand) {
    expand.classList.add('pd-expand--open');
    expand.removeAttribute('aria-hidden');
    expand.inert = false;
    if (toggle) {
      toggle.setAttribute('aria-expanded', 'true');
      const icon = toggle.querySelector('.pd-row__toggle-icon');
      if (icon) icon.textContent = '▴';
      setToggleText(toggle, true);
    }
    const id = row.dataset.pdId;
    if (id) STATE.expanded.add(id);
    writeURLState();
  }

  function closeRow(row, toggle, expand) {
    expand.classList.remove('pd-expand--open');
    expand.setAttribute('aria-hidden', 'true');
    expand.inert = true;
    if (toggle) {
      toggle.setAttribute('aria-expanded', 'false');
      const icon = toggle.querySelector('.pd-row__toggle-icon');
      if (icon) icon.textContent = '▾';
      setToggleText(toggle, false);
    }
    const id = row.dataset.pdId;
    if (id) STATE.expanded.delete(id);
    writeURLState();
  }

  // ─── Outbound clicks (site / tel / instagram / facebook / review) ───────────
  // Base do argumento comercial: "enviamos-lhe N visitas". Sem preventDefault.

  function bindOutbound() {
    const list = document.querySelector('.pd-list');
    if (!list) return;
    function onOut(e) {
      const a = e.target.closest && e.target.closest('a[href]');
      if (!a || !list.contains(a)) return;
      const row = a.closest('.pd-row');
      if (!row) return;
      const href = a.getAttribute('href') || '';
      let type = a.getAttribute('data-esc-out') || '';
      if (!type) {
        if (/^tel:/i.test(href)) type = 'tel';
        else if (/instagram\.com/i.test(href)) type = 'instagram';
        else if (/facebook\.com/i.test(href)) type = 'facebook';
        else if (/tripadvisor\.|google\.[a-z.]+\/maps/i.test(href)) type = 'review';
        else if (/^https?:/i.test(href) && a.hostname !== location.hostname) type = 'site';
      }
      if (!type) return; // ligacoes internas (praias) nao sao "saidas"
      track('school_outbound_click', { school: row.dataset.pdId || '', type: type });
    }
    list.addEventListener('click', onOut);
    list.addEventListener('auxclick', function (e) { if (e.button === 1) onOut(e); });
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
      track('escolas_filter', { filter: input.dataset.pdFilter, value: input.checked ? input.value : '' });
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
    updateActiveCount();
    const empty = document.querySelector('.esc-dir__empty');
    if (empty) empty.hidden = visible !== 0;
    writeURLState();
  }

  function updateActiveCount() {
    const el = document.querySelector('.pd-mobile-count');
    if (!el) return;
    const f = STATE.filters;
    const n = f.region.length + f.language.length + (f.fps ? 1 : 0) + (f.founder ? 1 : 0);
    el.textContent = n ? String(n) : '';
    el.hidden = !n;
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
      if (!drawer.classList.contains('pd-drawer--open')) return;
      if (e.key === 'Escape') {
        closeDrawer(drawer, backdrop, btn);
        return;
      }
      if (e.key === 'Tab') { // aria-modal: manter o foco dentro do drawer
        const f = Array.prototype.filter.call(drawer.querySelectorAll('button, input, a[href], select'), function (x) { return !x.disabled; });
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
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
    // Revisao 09/10: manter o hash quando NAO e uma escola (ex.: #listagem vindo de um email); o de escola passa a ?open=
    const h = window.location.hash;
    let keep = '';
    if (h && h.length > 1) {
      let el = null;
      try { el = document.getElementById(decodeURIComponent(h.slice(1))); } catch (_) {}
      if (!(el && el.closest('.pd-row'))) keep = h;
    }
    const newURL = window.location.pathname + (qs ? '?' + qs : '') + keep;
    history.replaceState(null, '', newURL);
  }

  // ─── Hash auto-open ─────────────────────────────────────────────────────────

  // Captured before init() so writeURLState() cannot strip it.
  const _startHash = window.location.hash;

  function openCardByHash(hash) {
    const h = (hash !== undefined) ? hash : window.location.hash;
    if (!h || h.length < 2) return;
    const id = h.slice(1);
    const anchor = document.getElementById(id);
    if (!anchor) return;
    const row = anchor.closest('.pd-row');
    if (!row) return;
    const expand = row.querySelector('.pd-expand');
    if (!expand || expand.classList.contains('pd-expand--open')) return;
    const toggle = row.querySelector('.pd-row__toggle');
    if (row.style.display === 'none') resetFilters(); // a ancora pede uma escola escondida pelos filtros
    openRow(row, toggle, expand);
    const smooth = !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    setTimeout(function () { row.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' }); }, 100);
    keepAligned(row);
  }

  // Revisao 09/10: o que esta acima (widget GYG, imagens, fontes) pode crescer depois do salto e empurrar a escola
  // para baixo do header fixo. Durante ~12 s volta a alinhar a linha, ate o utilizador mexer na pagina.
  function keepAligned(row) {
    if (!('ResizeObserver' in window)) return;
    let stop = false, t0 = Date.now(), last = null;
    const quit = function () { stop = true; };
    ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(function (ev) { window.addEventListener(ev, quit, { once: true, passive: true }); });
    const ro = new ResizeObserver(function () {
      if (stop || Date.now() - t0 > 12000) { ro.disconnect(); return; }
      const top = row.getBoundingClientRect().top;
      const want = parseFloat(getComputedStyle(row).scrollMarginTop) || 0;
      if (Math.abs(top - want) > 4 && last !== Math.round(top)) {
        last = Math.round(top);
        row.scrollIntoView({ behavior: 'auto', block: 'start' });
      }
    });
    ro.observe(document.body);
    setTimeout(function () { ro.disconnect(); }, 12500);
  }

  window.addEventListener('hashchange', function () { openCardByHash(); });

  // ─── Boot ───────────────────────────────────────────────────────────────────

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { init(); openCardByHash(_startHash); });
  } else {
    init();
    openCardByHash(_startHash);
  }
})();
