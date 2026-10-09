(function() {
  'use strict';

  // ── State ────────────────────────────────────────────────────────────────────
  const STATE = {
    region: 'all',
    quality: 'all',
    tag: 'all',
    sort: 'editorial',
    search: '',
    searchRaw: '',
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


  // ── Pesquisa (Lote B 09/10/2026, PL-03/INAV-02) ─────────────────────────────
  // Sem acentos ("nazare", "acores"), tambem na vila/concelho (town, subregion), nomes EN das regioes ("Azores",
  // "Lisbon") e por vila conhecida: "Portimao" junta as praias a <=12 km da vila (coordenadas aproximadas do centro).
  function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim(); }
  const TERM_ALIAS = { azores: 'acores', lisbon: 'lisboa', oporto: 'porto', centre: 'centro', center: 'centro', north: 'norte', west: 'oeste', 'west coast': 'oeste' };
  const TOWNS = {
    'portimao': [37.138, -8.537], 'lagos': [37.102, -8.674], 'albufeira': [37.089, -8.250], 'lagoa': [37.135, -8.453], 'carvoeiro': [37.096, -8.472],
    'armacao de pera': [37.102, -8.357], 'alvor': [37.129, -8.593], 'sagres': [37.009, -8.940], 'vila do bispo': [37.083, -8.912], 'aljezur': [37.318, -8.803],
    'faro': [37.019, -7.930], 'olhao': [37.026, -7.841], 'tavira': [37.127, -7.649], 'loule': [37.138, -8.023], 'quarteira': [37.069, -8.100], 'vilamoura': [37.077, -8.117],
    'vila real de santo antonio': [37.194, -7.416], 'monte gordo': [37.180, -7.451], 'odeceixe': [37.433, -8.770], 'zambujeira do mar': [37.524, -8.785],
    'vila nova de milfontes': [37.725, -8.783], 'milfontes': [37.725, -8.783], 'sines': [37.956, -8.869], 'porto covo': [37.852, -8.792], 'comporta': [38.381, -8.786],
    'troia': [38.480, -8.880], 'setubal': [38.524, -8.893], 'sesimbra': [38.444, -9.101], 'costa da caparica': [38.643, -9.235], 'almada': [38.680, -9.157],
    'lisboa': [38.722, -9.139], 'cascais': [38.697, -9.421], 'estoril': [38.705, -9.398], 'sintra': [38.800, -9.378], 'ericeira': [38.963, -9.418], 'mafra': [38.937, -9.327],
    'peniche': [39.356, -9.381], 'obidos': [39.361, -9.157], 'foz do arelho': [39.432, -9.225], 'nazare': [39.602, -9.071], 'sao martinho do porto': [39.513, -9.137],
    'figueira da foz': [40.150, -8.861], 'aveiro': [40.640, -8.653], 'espinho': [41.007, -8.641], 'porto': [41.150, -8.611], 'matosinhos': [41.182, -8.689],
    'vila do conde': [41.353, -8.743], 'povoa de varzim': [41.383, -8.761], 'esposende': [41.532, -8.781], 'viana do castelo': [41.693, -8.832], 'caminha': [41.874, -8.838],
    'funchal': [32.650, -16.908], 'ponta delgada': [37.741, -25.668], 'angra do heroismo': [38.655, -27.218], 'horta': [38.536, -28.627], 'coimbra': [40.203, -8.410], 'tomar': [39.602, -8.409]
  };
  let _matchCache = { term: null, fn: null };
  function matcher(rawTerm) {
    let t = norm(rawTerm);
    if (!t) return null;
    if (_matchCache.term === t) return _matchCache.fn;
    if (TERM_ALIAS[t]) t = TERM_ALIAS[t];
    let town = TOWNS[t] ? t : null;
    if (!town && t.length >= 4) { for (const k in TOWNS) { if (k.indexOf(t) === 0) { town = k; break; } } }
    const near = {};
    if (town) {
      const c = { lat: TOWNS[town][0], lng: TOWNS[town][1] }, r = c.lng < -15 ? 15 : 12;
      _beaches.forEach(function(b) { const d = haversine(c, b); if (d <= r) near[b.id] = d; });
    }
    const fn = function(b) {
      if (b._hay == null) b._hay = norm([b.name, b.region, b.subregion, b.town].filter(Boolean).join(' | '));
      return b._hay.indexOf(t) !== -1 || near[b.id] != null;
    };
    fn.near = town ? near : null;
    _matchCache = { term: norm(rawTerm), fn: fn };
    return fn;
  }
  let _booted = false;
  function _syncUrl() {
    if (!_booted || !window.history || !history.replaceState) return;
    try {
      const u = new URL(window.location.href), p = u.searchParams;
      const set = function(k, v) { if (v) p.set(k, v); else p.delete(k); };
      set('q', STATE.searchRaw || '');
      set('region', STATE.region !== 'all' ? STATE.region : '');
      set('quality', STATE.quality !== 'all' ? STATE.quality : '');
      set('tag', STATE.tag !== 'all' ? STATE.tag : '');
      set('sort', (STATE.sort === 'alpha' || STATE.sort === 'quality') ? STATE.sort : '');
      p.delete('tipo');
      const next = u.pathname + (p.toString() ? '?' + p.toString() : '') + u.hash;
      if (next !== window.location.pathname + window.location.search + window.location.hash) history.replaceState(history.state, '', next);
    } catch (e) {}
  }
  function _countLabel(n) {
    const el = document.getElementById('results-count-value'); if (!el) return;
    el.textContent = n;
    const tn = el.nextSibling; if (!tn || tn.nodeType !== 3) return;
    const en = (document.documentElement.lang || '').toLowerCase().indexOf('en') === 0;
    tn.textContent = ' ' + (en ? (n === 1 ? 'beach' : 'beaches') : (n === 1 ? 'praia' : 'praias'));
  }

  // ── Filter & sort ────────────────────────────────────────────────────────────
  function _apply() {
    if (!_dataReady) return;

    const match = matcher(STATE.search);

    let filtered = _beaches.filter(function(b) {
      if (STATE.region !== 'all' && b.region !== STATE.region) return false;
      if (STATE.quality !== 'all' && b.water_quality !== STATE.quality) return false;
      if (STATE.tag !== 'all') {
        const bTags = Array.isArray(b.tags) ? b.tags : [];
        if (!bTags.includes(STATE.tag)) return false;
      }
      if (match && !match(b)) return false;
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
    } else if (match && match.near) {
      // pesquisa por vila: as que tem a vila no nome/morada primeiro, depois por distancia
      const near = match.near;
      filtered = filtered.slice().sort(function(a, b) {
        const da = near[a.id] != null ? near[a.id] : -1, db = near[b.id] != null ? near[b.id] : -1;
        return da - db;
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

    // Update results count (com singular/plural)
    _countLabel(filtered.length);

    _updateCounters();
    _syncUrl();
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
          const match = matcher(STATE.search);
          if (match && !match(b)) return false;
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
        // v2 (2026-10-07): contagem num <span class="chip-n"> em vez de " (N)" — estilo em css/beach-filters-v2.css
        chip.textContent = chip.dataset.labelText;
        if (count > 0) { const n = document.createElement('span'); n.className = 'chip-n'; n.textContent = count; chip.appendChild(n); }

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
      // Lote B 09/10 (PL-08): textos e link na lingua da pagina
      const en = (document.documentElement.lang || '').toLowerCase().indexOf('en') === 0;
      const P = en ? { aria: 'Pro feature', close: 'Close', h: 'Nearest beaches is a Pro feature', p: 'See which beaches are closest to you, in real time. Available with the Pro plan from €4.99/month.', href: '/en/precos', cta: 'See plans' }
                   : { aria: 'Funcionalidade Pro', close: 'Fechar', h: 'Praias mais próximas é uma funcionalidade Pro', p: 'Veja quais praias estão mais próximas de si em tempo real. Disponível com o plano Pro a partir de €4,99/mês.', href: '/precos', cta: 'Ver planos' };
      modal.setAttribute('aria-label', P.aria);
      modal.innerHTML =
        '<div class="pro-upsell-content">' +
          '<button class="pro-upsell-close" aria-label="' + P.close + '">×</button>' +
          '<div class="pro-upsell-icon">📍</div>' +
          '<h3>' + P.h + '</h3>' +
          '<p>' + P.p + '</p>' +
          '<a href="' + P.href + '" class="pro-upsell-cta">' + P.cta + '</a>' +
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
        STATE.searchRaw = e.target.value.trim();
        STATE.search = STATE.searchRaw.toLowerCase();
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
      STATE.searchRaw = paramQ.trim();
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
    // Lote B: qualidade, etiqueta e ordenacao tambem vem do URL (o Voltar e os links partilhados repoem a lista)
    const paramQuality = p.get('quality'), paramTag = p.get('tag'), paramSort = p.get('sort');
    function press(cat, attr, val) {
      const chip = document.querySelector('.chip-group[data-category="' + cat + '"] .chip[data-' + attr + '="' + val + '"]');
      if (!chip) return false;
      chip.parentElement.querySelectorAll('.chip').forEach(function(c) { c.setAttribute('aria-pressed', 'false'); });
      chip.setAttribute('aria-pressed', 'true');
      return true;
    }
    if (paramQuality && press('quality', 'quality', paramQuality)) STATE.quality = paramQuality;
    if (paramTag && press('tags', 'tag', paramTag)) STATE.tag = paramTag;
    if (paramSort === 'alpha' || paramSort === 'quality') {
      const li = document.querySelector('#sort-options li[data-sort="' + paramSort + '"]');
      if (li && li.dataset.pro !== 'true') {
        STATE.sort = paramSort;
        li.parentElement.querySelectorAll('li').forEach(function(x) { x.setAttribute('aria-selected', 'false'); });
        li.setAttribute('aria-selected', 'true');
        const labelEl = document.getElementById('sort-current-value');
        if (labelEl) labelEl.textContent = li.textContent.replace(/🔒\s*/g, '').replace(/PRO\s*/g, '').trim();
      }
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
      _booted = true;
      _apply();
    },

    // Backward compat for how-card onclick buttons
    filterByProfile: function(region, quality) {
      STATE.region = region || 'all';
      STATE.quality = quality || 'all';
      STATE.search = ''; STATE.searchRaw = '';

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
      STATE.search = ''; STATE.searchRaw = '';

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
