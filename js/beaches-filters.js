(function() {
  'use strict';

  // ── State ────────────────────────────────────────────────────────────────────
  const STATE = {
    region: 'all',
    quality: 'all',
    tag: 'all',
    sort: 'editorial',
    search: '',
  };

  let _beaches = [];
  let _dataReady = false;
  let _userPlan = 'free';

  // ── Internal helpers ─────────────────────────────────────────────────────────
  function debounce(fn, ms) {
    let t;
    return function() {
      clearTimeout(t);
      const args = arguments;
      t = setTimeout(function() { fn.apply(null, args); }, ms);
    };
  }

  function hashCode(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i) | 0;
    return Math.abs(h);
  }

  function haversine(p1, b) {
    if (!b.latitude || !b.longitude) return Infinity;
    const R = 6371;
    const dLat = (b.latitude - p1.lat) * Math.PI / 180;
    const dLng = (b.longitude - p1.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(p1.lat * Math.PI / 180) * Math.cos(b.latitude * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  // ── Filter & sort ────────────────────────────────────────────────────────────
  function _apply() {
    if (!_dataReady) return;

    const term = STATE.search;

    let filtered = _beaches.filter(function(b) {
      if (STATE.region !== 'all' && b.region !== STATE.region) return false;
      if (STATE.quality !== 'all' && b.water_quality !== STATE.quality) return false;
      if (STATE.tag !== 'all') {
        const bTags = Array.isArray(b.tags) ? b.tags : [];
        if (!bTags.includes(STATE.tag)) return false;
      }
      if (term) {
        const nameMatch = (b.name || '').toLowerCase().includes(term);
        const regionMatch = (b.region || '').toLowerCase().includes(term);
        if (!nameMatch && !regionMatch) return false;
      }
      return true;
    });

    // Sort
    if (STATE.sort === 'alpha') {
      filtered = filtered.slice().sort(function(a, b) {
        return a.name.localeCompare(b.name, 'pt');
      });
    } else if (STATE.sort === 'quality') {
      const q = { Excelente: 0, Boa: 1, Suficiente: 2, 'Má': 3 };
      filtered = filtered.slice().sort(function(a, b) {
        return (q[a.water_quality] != null ? q[a.water_quality] : 4) -
               (q[b.water_quality] != null ? q[b.water_quality] : 4);
      });
    } else if (STATE.sort === 'nearest' && window.PTH_USER_POSITION) {
      filtered = filtered.slice().sort(function(a, b) {
        return haversine(window.PTH_USER_POSITION, a) - haversine(window.PTH_USER_POSITION, b);
      });
    } else {
      // editorial: ranked first (ASC), unranked second (daily deterministic shuffle)
      const seed = new Date().toISOString().split('T')[0];
      filtered = filtered.slice().sort(function(a, b) {
        const ra = a.editorial_rank;
        const rb = b.editorial_rank;
        if (ra && rb) return ra - rb;
        if (ra) return -1;
        if (rb) return 1;
        return hashCode(String(a.id) + seed) - hashCode(String(b.id) + seed);
      });
    }

    // Delegate rendering to the inline script's global renderBeaches()
    if (typeof window.renderBeaches === 'function') {
      window.renderBeaches(filtered);
    }

    // Update results count
    const countEl = document.getElementById('results-count-value');
    if (countEl) countEl.textContent = filtered.length;

    _updateCounters();
  }

  // ── Chip counters ────────────────────────────────────────────────────────────
  function _updateCounters() {
    document.querySelectorAll('.chip-group').forEach(function(group) {
      const category = group.dataset.category;

      group.querySelectorAll('.chip').forEach(function(chip) {
        let value;
        if (category === 'region') value = chip.dataset.region;
        else if (category === 'quality') value = chip.dataset.quality;
        else if (category === 'tags') value = chip.dataset.tag;

        if (value === 'all' || value === '' || value == null) {
          chip.removeAttribute('aria-disabled');
          return;
        }

        // Count how many beaches would match if this chip were toggled (with other filters)
        const count = _beaches.filter(function(b) {
          const term = STATE.search;
          if (term) {
            const nm = (b.name || '').toLowerCase().includes(term);
            const rm = (b.region || '').toLowerCase().includes(term);
            if (!nm && !rm) return false;
          }
          if (category !== 'region' && STATE.region !== 'all' && b.region !== STATE.region) return false;
          if (category !== 'quality' && STATE.quality !== 'all' && b.water_quality !== STATE.quality) return false;
          if (category !== 'tags' && STATE.tag !== 'all') {
            const bTags = Array.isArray(b.tags) ? b.tags : [];
            if (!bTags.includes(STATE.tag)) return false;
          }

          if (category === 'region') return b.region === value;
          if (category === 'quality') return b.water_quality === value;
          if (category === 'tags') {
            const bTags = Array.isArray(b.tags) ? b.tags : [];
            return bTags.includes(value);
          }
          return false;
        }).length;

        // Preserve original label text
        if (!chip.dataset.labelText) {
          chip.dataset.labelText = chip.textContent.trim();
        }
        chip.textContent = chip.dataset.labelText + (count > 0 ? ' (' + count + ')' : '');

        if (count === 0) chip.setAttribute('aria-disabled', 'true');
        else chip.removeAttribute('aria-disabled');
      });
    });
  }

  // ── Sort dropdown ─────────────────────────────────────────────────────────────
  function _bindSort() {
    const sortBtn = document.getElementById('sort-button');
    const sortOpts = document.getElementById('sort-options');
    if (!sortBtn || !sortOpts) return;

    sortBtn.addEventListener('click', function() {
      const expanded = sortBtn.getAttribute('aria-expanded') === 'true';
      sortBtn.setAttribute('aria-expanded', String(!expanded));
      if (expanded) {
        sortOpts.setAttribute('hidden', '');
      } else {
        sortOpts.removeAttribute('hidden');
      }
    });

    sortOpts.querySelectorAll('li[role="option"]').forEach(function(opt) {
      opt.addEventListener('click', function() { _handleSortChoice(opt); });
    });

    // Close on outside click
    document.addEventListener('click', function(e) {
      if (!sortBtn.contains(e.target) && !sortOpts.contains(e.target)) {
        sortBtn.setAttribute('aria-expanded', 'false');
        sortOpts.setAttribute('hidden', '');
      }
    });
  }

  function _handleSortChoice(option) {
    const sortValue = option.dataset.sort;
    const isPro = option.dataset.pro === 'true';

    if (isPro && _userPlan !== 'pro') {
      _showProUpsell();
      return;
    }

    if (sortValue === 'nearest') {
      _requestGeolocation();
    }

    // Update aria-selected
    option.parentElement.querySelectorAll('li').forEach(function(li) {
      li.setAttribute('aria-selected', 'false');
    });
    option.setAttribute('aria-selected', 'true');

    // Update button label (strip lock icon and PRO badge text)
    const rawText = option.textContent.replace(/🔒\s*/g, '').replace(/PRO\s*/g, '').trim();
    const labelEl = document.getElementById('sort-current-value');
    if (labelEl) labelEl.textContent = rawText;

    // Close dropdown
    const sortBtn = document.getElementById('sort-button');
    const sortOpts = document.getElementById('sort-options');
    if (sortBtn) sortBtn.setAttribute('aria-expanded', 'false');
    if (sortOpts) sortOpts.setAttribute('hidden', '');

    STATE.sort = sortValue;
    _apply();
  }

  // ── Pro upsell ────────────────────────────────────────────────────────────────
  function _showProUpsell() {
    let modal = document.querySelector('.pro-upsell-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.className = 'pro-upsell-modal';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-label', 'Funcionalidade Pro');
      modal.innerHTML =
        '<div class="pro-upsell-content">' +
          '<button class="pro-upsell-close" aria-label="Fechar">×</button>' +
          '<div class="pro-upsell-icon">📍</div>' +
          '<h3>Geolocalização é uma feature Pro</h3>' +
          '<p>Veja quais praias estão mais próximas de si em tempo real. Disponível com o plano Pro a partir de €4,99/mês.</p>' +
          '<a href="/precos.html" class="pro-upsell-cta">Ver planos</a>' +
        '</div>';
      document.body.appendChild(modal);

      modal.addEventListener('click', function(e) {
        if (e.target === modal || e.target.matches('.pro-upsell-close')) {
          modal.removeAttribute('open');
        }
      });
    }
    modal.setAttribute('open', '');
  }

  function _requestGeolocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      function(pos) {
        window.PTH_USER_POSITION = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        _apply();
      },
      function(err) { console.warn('Geolocation denied:', err.message); }
    );
  }

  // ── Event binding ─────────────────────────────────────────────────────────────
  function _bindEvents() {
    // Search
    const searchInput = document.getElementById('beach-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', debounce(function(e) {
        STATE.search = e.target.value.trim().toLowerCase();
        _apply();
      }, 200));
    }

    // Chips (event delegation per group)
    document.querySelectorAll('.chip-group').forEach(function(group) {
      const category = group.dataset.category;
      group.addEventListener('click', function(e) {
        const chip = e.target.closest('.chip');
        if (!chip) return;
        if (chip.getAttribute('aria-disabled') === 'true') return;

        let value;
        if (category === 'region') value = chip.dataset.region;
        else if (category === 'quality') value = chip.dataset.quality;
        else if (category === 'tags') value = chip.dataset.tag;
        if (value == null) return;

        // Update STATE
        if (category === 'region') {
          STATE.region = value;
          // Sync region banner (backward compat)
          if (typeof window.updateRegionBanner === 'function') {
            window.updateRegionBanner(value === 'all' ? '' : value);
          }
        } else if (category === 'quality') {
          STATE.quality = value;
        } else if (category === 'tags') {
          STATE.tag = value;
        }

        // Update aria-pressed within group
        group.querySelectorAll('.chip').forEach(function(c) {
          c.setAttribute('aria-pressed', 'false');
        });
        chip.setAttribute('aria-pressed', 'true');

        _apply();
      });
    });

    _bindSort();
  }

  // ── URL param bootstrap ───────────────────────────────────────────────────────
  function _readUrlParams() {
    const p = new URLSearchParams(window.location.search);
    const paramQ = p.get('q');
    const paramRegion = p.get('region');
    const paramTipo = p.get('tipo');

    if (paramQ) {
      STATE.search = paramQ.toLowerCase();
      const inp = document.getElementById('beach-search-input');
      if (inp) inp.value = paramQ;
    }
    if (paramRegion) {
      STATE.region = paramRegion;
      const chip = document.querySelector('.chip-group[data-category="region"] .chip[data-region="' + paramRegion + '"]');
      if (chip) {
        document.querySelectorAll('.chip-group[data-category="region"] .chip').forEach(function(c) {
          c.setAttribute('aria-pressed', 'false');
        });
        chip.setAttribute('aria-pressed', 'true');
      }
      if (typeof window.updateRegionBanner === 'function') window.updateRegionBanner(paramRegion);
    }
    // Map old tipo values to new tag values
    const tipoToTag = { surf: 'surf', pesca: 'fishing', família: 'family', natureza: 'wild_nature' };
    if (paramTipo && tipoToTag[paramTipo]) {
      STATE.tag = tipoToTag[paramTipo];
      const chip = document.querySelector('.chip-group[data-category="tags"] .chip[data-tag="' + STATE.tag + '"]');
      if (chip) {
        document.querySelectorAll('.chip-group[data-category="tags"] .chip').forEach(function(c) {
          c.setAttribute('aria-pressed', 'false');
        });
        chip.setAttribute('aria-pressed', 'true');
      }
    }
  }

  // ── Public API ────────────────────────────────────────────────────────────────
  window.BeachFilters = {
    // Called by loadBeaches() after beaches are fetched
    setData: function(beaches) {
      _beaches = beaches || [];
      _dataReady = true;

      // Detect Pro plan (best-effort)
      _userPlan = (window.PTH_USER && window.PTH_USER.plan) || 'free';

      // Update total count
      const countEl = document.getElementById('results-count-value');
      if (countEl) countEl.textContent = _beaches.length;

      // Read URL params on first load
      _readUrlParams();
      _apply();
    },

    // Backward compat for how-card onclick buttons
    filterByProfile: function(region, quality) {
      STATE.region = region || 'all';
      STATE.quality = quality || 'all';
      STATE.search = '';

      const searchInput = document.getElementById('beach-search-input');
      if (searchInput) searchInput.value = '';

      // Sync region chips
      document.querySelectorAll('.chip-group[data-category="region"] .chip').forEach(function(c) {
        const isActive = (STATE.region === 'all' && c.dataset.region === 'all') ||
                         c.dataset.region === STATE.region;
        c.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });
      // Sync quality chips
      document.querySelectorAll('.chip-group[data-category="quality"] .chip').forEach(function(c) {
        const isActive = (STATE.quality === 'all' && c.dataset.quality === 'all') ||
                         c.dataset.quality === STATE.quality;
        c.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });

      if (typeof window.updateRegionBanner === 'function') {
        window.updateRegionBanner(STATE.region === 'all' ? '' : STATE.region);
      }

      _apply();
      const main = document.getElementById('main');
      if (main) main.scrollIntoView({ behavior: 'smooth' });
    },

    reset: function() {
      STATE.region = 'all';
      STATE.quality = 'all';
      STATE.tag = 'all';
      STATE.sort = 'editorial';
      STATE.search = '';

      const searchInput = document.getElementById('beach-search-input');
      if (searchInput) searchInput.value = '';

      document.querySelectorAll('.chip').forEach(function(c) {
        const isDefault = c.dataset.region === 'all' || c.dataset.quality === 'all' || c.dataset.tag === 'all';
        c.setAttribute('aria-pressed', isDefault ? 'true' : 'false');
      });

      // Reset sort display
      const sortLabel = document.getElementById('sort-current-value');
      if (sortLabel) sortLabel.textContent = sortLabel.closest('.sort-dropdown-wrapper')
        ? (document.documentElement.lang === 'en' ? 'Editorial highlights' : 'Destaque editorial')
        : 'Destaque editorial';

      document.querySelectorAll('#sort-options li').forEach(function(li) {
        li.setAttribute('aria-selected', li.dataset.default === 'true' ? 'true' : 'false');
      });

      if (typeof window.updateRegionBanner === 'function') window.updateRegionBanner('');
      _apply();
    },
  };

  // Expose legacy compat globals
  window.clearFilters = function() { window.BeachFilters.reset(); };
  window.filterByProfile = function(r, q) { window.BeachFilters.filterByProfile(r, q); };

  // Boot on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _bindEvents);
  } else {
    _bindEvents();
  }
})();
