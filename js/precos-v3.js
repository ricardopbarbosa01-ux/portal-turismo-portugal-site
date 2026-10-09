/* js/precos-v3.js — /precos e /en/precos v3 (Lote F8, 09/10/2026). Substitui o script inline do Lote F.
 * 1) Eventos: precos_cta_click {cta} / precos_b2b_click {cta} (mesmos nomes de antes).
 * 2) Lista do Pro (#pro, js/email-capture.js): ?de=favoritas pré-escolhe "favoritas"; pro_list_view/start/submit, form_error.
 * 3) Faixa "o mar agora" (#agora): 12 zonas, 1 pedido agrupado via PTHOpenMeteo (js/om-pool.js, com cache); se falhar, avisa.
 * 4) Calculadora: preço por cliente -> quantos clientes pagam o plano (aritmética simples, sem promessas).
 * 5) Botão "Menu" da barra inferior abre o menu do cabeçalho.
 */
document.addEventListener('DOMContentLoaded', function () {
  'use strict';
  var EN = (document.documentElement.lang || '').indexOf('en') === 0;
  var PAGE = { page: 'precos', lang: EN ? 'en' : 'pt' };
  function track(n, p) {
    var o = {}, k; for (k in PAGE) o[k] = PAGE[k]; for (k in (p || {})) o[k] = p[k];
    try { if (typeof window.track === 'function') window.track(n, o); else if (window.gtag) window.gtag('event', n, o); } catch (e) {}
  }
  function fmt(v, d) { var s = v.toFixed(d); return EN ? s : s.replace('.', ','); }
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var y = document.getElementById('footer-year'); if (y) y.textContent = new Date().getFullYear();

  var mob = document.getElementById('mob-menu-btn'), tog = document.getElementById('nav-toggle');
  if (mob && tog) mob.addEventListener('click', function (e) { e.stopPropagation(); tog.click(); });

  // ── 1. Cliques ──
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-prc-cta],[data-prc-b2b]');
    if (!a) return;
    if (a.hasAttribute('data-prc-cta')) track('precos_cta_click', { cta: a.getAttribute('data-prc-cta') });
    else track('precos_b2b_click', { cta: a.getAttribute('data-prc-b2b') });
  });

  // ── 2. Lista do Pro ──
  var pro = document.getElementById('pro');
  var form = pro && pro.querySelector('form[data-email-capture]');
  var fromFav = /(?:^|[?&])de=favoritas(?:&|$)/.test(location.search);
  if (form && fromFav) {
    var r = form.querySelector('input[data-ec-tag][value="favoritas"]'); if (r) r.checked = true;
    var note = pro.querySelector('[data-prc-fav]'); if (note) note.hidden = false;
  }
  function interest() { var c = form && form.querySelector('[data-ec-tag]:checked'); return c ? c.value : ''; }
  if (pro && 'IntersectionObserver' in window) {
    var seen = new IntersectionObserver(function (en) {
      if (en.some(function (x) { return x.isIntersecting; })) { track('pro_list_view', { from: fromFav ? 'favoritas' : 'direto' }); seen.disconnect(); }
    }, { threshold: 0.4 });
    seen.observe(pro);
  }
  if (form) {
    var email = form.querySelector('input[type="email"]'), started = false;
    if (email) email.addEventListener('focus', function () { if (!started) { started = true; track('pro_list_start', { interest: interest() }); } });
    var ok = document.getElementById('prc-pro-ok'), err = form.querySelector('[data-ec-error]');
    if (ok && window.MutationObserver) new MutationObserver(function () {
      if (!ok.hidden) track('pro_list_submit', { interest: interest(), source: form.getAttribute('data-source') + (interest() ? ':' + interest() : '') });
    }).observe(ok, { attributes: true, attributeFilter: ['hidden'] });
    var lastErr = '';
    if (err && window.MutationObserver) new MutationObserver(function () {
      if (err.hidden || !err.textContent) { lastErr = ''; return; }
      if (err.textContent === lastErr) return;
      lastErr = err.textContent;
      var why = email && email.getAttribute('aria-invalid') === 'true' ? 'email' : (/anti-spam/i.test(lastErr) ? 'turnstile' : 'network');
      track('form_error', { form: 'pro_list', reason: why });
    }).observe(err, { attributes: true, attributeFilter: ['hidden'], childList: true });
  }

  // ── 4. Calculadora ──
  var calc = document.querySelector('[data-calc]');
  if (calc) {
    var price = calc.querySelector('[data-calc-price]'), plan = calc.querySelector('[data-calc-plan]');
    var outN = calc.querySelector('[data-calc-n]'), outT = calc.querySelector('[data-calc-txt]');
    var T = EN ? { one: 'customer a year pays for the plan.', many: 'customers a year pay for the plan.', lt: 'Fewer than 1 a month.', pm: 'About %s a month.' }
               : { one: 'cliente num ano paga o plano.', many: 'clientes num ano pagam o plano.', lt: 'Menos de 1 por mês.', pm: 'Cerca de %s por mês.' };
    var used = false;
    var run = function () {
      var p = parseFloat(String(price.value).replace(',', '.')), c = +plan.value;
      if (!(p > 0) || !(c > 0)) { outN.textContent = '–'; outT.textContent = ''; return; }
      var n = Math.ceil(c / p), pm = n / 12;
      outN.textContent = n;
      outT.textContent = (n === 1 ? T.one : T.many) + ' ' + (pm < 1 ? T.lt : T.pm.replace('%s', fmt(pm, pm < 10 ? 1 : 0)));
    };
    var touch = function () { run(); if (!used) { used = true; track('precos_calc_use', {}); } };
    price.addEventListener('input', touch); plan.addEventListener('change', touch);
    run();
  }

  // ── 3. O mar agora ──
  var eq = document.getElementById('agora');
  if (!eq) return;
  var cols = [].slice.call(eq.querySelectorAll('[data-z]'));
  var src = eq.querySelector('[data-eq-src]'), noteEl = eq.querySelector('[data-eq-note]');
  var MAX = 4; // m: escala da barra (ondas acima de 4 m enchem a barra)
  function fail() {
    eq.classList.add('is-off');
    if (noteEl) noteEl.textContent = EN ? 'No model reading right now. Open a beach to see today’s sea.' : 'Sem leitura do modelo neste momento. Abra uma praia para ver o mar de hoje.';
  }
  if (!window.PTHOpenMeteo) { fail(); return; }
  var pts = cols.map(function (li) { return { id: li.getAttribute('data-z'), lat: +li.getAttribute('data-lat'), lng: +li.getAttribute('data-lng') }; });
  var done = false;
  var to = setTimeout(function () { if (!done) fail(); }, 9000);
  window.PTHOpenMeteo.marine(pts).then(function (m) {
    done = true; clearTimeout(to);
    m = m || {};
    var shown = 0, stamp = '';
    cols.forEach(function (li, i) {
      var id = li.getAttribute('data-z'), c = m[id] && m[id].c;
      var wave = c && c.wave_height, sst = c && c.sea_surface_temperature;
      var v = li.querySelector('[data-v]'), b = li.querySelector('[data-b]'), t = li.querySelector('[data-t]');
      if (!stamp && c && c.time) stamp = String(c.time).slice(11, 16);
      if (wave == null || !isFinite(wave)) { li.classList.add('is-none'); return; }
      shown++;
      v.innerHTML = fmt(wave, 1) + '<span class="u"> m</span>';
      if (sst != null && isFinite(sst)) t.textContent = fmt(sst, 0) + '°';
      li.classList.toggle('is-big', wave >= 2);
      li.setAttribute('aria-label', li.querySelector('.pc3-eq__n').textContent + ': ' + (EN ? 'waves ' : 'ondas ') + fmt(wave, 1) + ' m' + (sst != null ? (EN ? ', water ' : ', água ') + fmt(sst, 0) + ' °C' : ''));
      var h = Math.max(4, Math.min(100, wave / MAX * 100));
      if (reduce) b.style.height = h + '%';
      else setTimeout(function () { b.style.height = h + '%'; }, 120 + i * 55);
    });
    if (!shown) { fail(); return; }
    if (src && stamp) src.textContent = 'Open-Meteo · ' + stamp;
    track('precos_sea_shown', { n: shown });
  }, function () { done = true; clearTimeout(to); fail(); });
});
