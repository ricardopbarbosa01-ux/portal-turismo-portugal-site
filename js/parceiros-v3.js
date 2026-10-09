/* js/parceiros-v3.js — /parceiros v3: calculadora das aulas, mapa/lista de zonas, foto do cartão por tipo, atalhos com foco.
 * O envio dos formulários, o cartão ao vivo e os planos continuam em js/parceiros.js (contratos de ids/data-*).
 */
(function () {
  'use strict';
  var root = document.querySelector('.pv3'); if (!root) return;
  var EN = (document.documentElement.lang || '').toLowerCase().indexOf('en') === 0;
  function track(n, p) { try { if (typeof window.track === 'function') window.track(n, p || {}); } catch (e) {} }

  // ── calculadora ──
  var r = document.getElementById('calc-price'), out = document.getElementById('calc-out');
  var PRICES = { local: 149, fund: 290 }, moved = false;
  function calc() {
    if (!r) return;
    var p = +r.value || 60;
    out.textContent = EN ? '€' + p : p + ' €';
    r.style.setProperty('--p', ((p - r.min) / (r.max - r.min) * 100) + '%');
    Object.keys(PRICES).forEach(function (k) {
      var n = Math.ceil(PRICES[k] / p);
      var v = root.querySelector('[data-calc="' + k + '"]'); if (v) v.textContent = n;
      var u = root.querySelector('[data-calc-u="' + k + '"]');
      if (u) u.textContent = EN ? (n === 1 ? 'lesson a year' : 'lessons a year') : (n === 1 ? 'aula por ano' : 'aulas por ano');
      var toks = root.querySelectorAll('[data-toks="' + k + '"] .pv3-tok');
      [].forEach.call(toks, function (t, i) { t.classList.toggle('is-on', i < n); });
    });
  }
  if (r) {
    r.addEventListener('input', function () { calc(); if (!moved) { moved = true; track('partner_calc_use', { lang: EN ? 'en' : 'pt' }); } });
    calc();
  }

  // ── zonas: mapa <-> lista <-> botão ──
  var cta = root.querySelector('[data-zone-cta]');
  function pick(id, user) {
    var name = '';
    [].forEach.call(root.querySelectorAll('[data-zpick]'), function (el) {
      var on = el.getAttribute('data-zpick') === id;
      el.classList.toggle('is-on', on);
      if (el.tagName === 'BUTTON') { el.setAttribute('aria-pressed', on ? 'true' : 'false'); if (on) name = el.querySelector('.pv3-zrow__n').textContent; }
    });
    if (cta && name) { cta.setAttribute('data-zone', id); cta.textContent = (EN ? 'Ask for ' : 'Pedir a zona ') + name; }
    if (user) track('partner_zone_pick', { zona: id, lang: EN ? 'en' : 'pt' });
  }
  [].forEach.call(root.querySelectorAll('[data-zpick]'), function (el) {
    el.addEventListener('click', function () { pick(el.getAttribute('data-zpick'), true); });
    // passar o rato só ilumina (não muda a escolha nem o botão)
    el.addEventListener('mouseenter', function () { var id = el.getAttribute('data-zpick'); [].forEach.call(root.querySelectorAll('[data-zpick]'), function (o) { o.classList.toggle('is-peek', o.getAttribute('data-zpick') === id); }); });
    el.addEventListener('mouseleave', function () { [].forEach.call(root.querySelectorAll('.is-peek'), function (o) { o.classList.remove('is-peek'); }); });
  });
  pick('lagos', false);

  // ── foto do cartão conforme o tipo ──
  var card = root.querySelector('[data-live]'), tipo = document.getElementById('p-tipo');
  function look() { if (card && tipo) card.setAttribute('data-look', /pesca|experiencias/.test(tipo.value) ? 'mar' : 'surf'); }
  if (tipo) { tipo.addEventListener('change', look); look(); }
  [].forEach.call(root.querySelectorAll('[data-set-tipo]'), function (b) { b.addEventListener('click', function () { setTimeout(look, 0); }); });
  // brilho enquanto escreve
  var tmr;
  ['p-negocio', 'p-local'].forEach(function (id) {
    var e = document.getElementById(id); if (!e || !card) return;
    e.addEventListener('input', function () { card.classList.add('is-typing'); clearTimeout(tmr); tmr = setTimeout(function () { card.classList.remove('is-typing'); }, 700); });
  });

  // ── atalhos que levam ao formulário e põem o cursor no campo ──
  [].forEach.call(root.querySelectorAll('a[data-focus]'), function (a) {
    a.addEventListener('click', function () {
      var f = document.getElementById(a.getAttribute('data-focus'));
      if (f) setTimeout(function () { try { f.focus({ preventScroll: true }); } catch (x) { f.focus(); } }, 450);
    });
  });
})();
