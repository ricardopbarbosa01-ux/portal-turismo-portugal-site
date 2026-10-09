/* js/escolas-v2.js — /escolas-de-surf e /en/surf-schools (Lote F, 09/10/2026)
 * 1) Formulário "A sua escola não está aqui?" (#esc-listing) -> POST submit-partner-lead com EXATAMENTE as 11 chaves
 *    de partner_leads (+ turnstileToken). Turnstile via PTHCapture.turnstile (js/email-capture.js). Erro: mensagem,
 *    botão mailto já preenchido e novo token (reset) para tentar outra vez. Nada fica em localStorage.
 * 2) Pequenos comportamentos que antes estavam inline: botão "Menu" da barra inferior, aviso i18n (EN),
 *    imagens partidas, nome da zona na mensagem de sucesso da faixa "noutra zona".
 */
(function () {
  'use strict';
  var EN = (document.documentElement.lang || '').toLowerCase().indexOf('en') === 0;
  var T = EN ? {
    need: 'Fill in the school name, email and town or beach.',
    bad: 'Please enter a valid email address.',
    robot: 'The anti-spam check is still loading. Wait a second and try again.',
    fail: 'We could not send this. Try again, or use this pre-filled email instead:',
    busy: 'Sending…',
    subj: 'Free listing request: ',
    body: 'School: {n}\nEmail: {e}\nTown or beach: {l}\nWebsite or Instagram: {w}\n'
  } : {
    need: 'Preencha o nome da escola, o email e a localidade ou praia.',
    bad: 'Escreva um email válido.',
    robot: 'A verificação anti-spam ainda está a carregar. Aguarde um segundo e tente outra vez.',
    fail: 'Não conseguimos enviar. Tente outra vez ou use este email, já preenchido:',
    busy: 'A enviar…',
    subj: 'Pedido de listagem gratuita: ',
    body: 'Escola: {n}\nEmail: {e}\nLocalidade ou praia: {l}\nSite ou Instagram: {w}\n'
  };
  var FN = 'https://glupdjvdvunogkqgxoui.supabase.co/functions/v1/';
  var KEY = 'sb_publishable_HKdE2IRmz9lMDcg4p3l1tw_HiTdD4nw';

  function track(n, p) { try { if (typeof window.track === 'function') window.track(n, p || {}); else if (window.gtag) window.gtag('event', n, p || {}); } catch (e) {} }

  // ── Listagem gratuita ──────────────────────────────────────
  function listing() {
    var form = document.getElementById('esc-listing');
    if (!form) return;
    var ok = document.getElementById('esc-listing-ok');
    var btn = form.querySelector('button[type="submit"]');
    var tsEl = form.querySelector('[data-esc-ts]');
    var errBox = form.querySelector('.esc-form__err');
    var errTxt = form.querySelector('[data-esc-err]');
    var mailWrap = form.querySelector('.esc-form__mail');
    var mailA = form.querySelector('[data-esc-mailto]');
    var f = function (n) { return form.elements[n]; };
    var label = btn.innerHTML, ts = null, started = false, busy = false;

    function startTs() {
      if (started || !tsEl || !window.PTHCapture) return;
      started = true; ts = window.PTHCapture.turnstile(tsEl);
      ts.catch(function () { started = false; ts = null; });
    }
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (en) { if (en.some(function (x) { return x.isIntersecting; })) { startTs(); io.disconnect(); } }, { rootMargin: '400px 0px' });
      io.observe(form);
    }
    var firstFocus = true;
    form.addEventListener('focusin', function () {
      startTs();
      if (firstFocus) { firstFocus = false; track('school_listing_start', { lang: EN ? 'en' : 'pt' }); }
    });

    function clean(v) { return (v || '').trim(); }
    function payload() {
      var web = clean(f('web').value), website = '', instagram = '';
      if (web) {
        if (/^@/.test(web) || /instagram\.com/i.test(web)) instagram = web; else website = web;
      }
      return {
        negocio: clean(f('negocio').value),
        tipo: 'surf',
        objetivo: 'visibilidade',
        plano: 'base',
        contacto: '',
        email: clean(f('email').value),
        localizacao: clean(f('localizacao').value),
        regiao: '',
        website: website,
        instagram: instagram,
        mensagem: '[origem: ' + (form.getAttribute('data-origem') || 'escolas-listagem') + '] [plano: Base]'
      };
    }
    function showErr(msg, withMail, p) {
      errTxt.textContent = msg; errBox.hidden = false;
      if (withMail && p) {
        var body = T.body.replace('{n}', p.negocio).replace('{e}', p.email).replace('{l}', p.localizacao).replace('{w}', p.website || p.instagram);
        mailA.href = 'mailto:ola@portalturismoportugal.com?subject=' + encodeURIComponent(T.subj + p.negocio) + '&body=' + encodeURIComponent(body);
        mailWrap.hidden = false;
      } else mailWrap.hidden = true;
    }
    mailA.addEventListener('click', function () { track('partner_mailto_fallback', { form: 'listagem' }); });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (busy) return;
      errBox.hidden = true; mailWrap.hidden = true;
      ['negocio', 'email', 'localizacao'].forEach(function (n) { f(n).removeAttribute('aria-invalid'); });
      var p = payload();
      var missing = ['negocio', 'email', 'localizacao'].filter(function (n) { return !p[n]; });
      if (missing.length) {
        missing.forEach(function (n) { f(n).setAttribute('aria-invalid', 'true'); });
        showErr(T.need); f(missing[0]).focus(); track('form_error', { form: 'listagem', reason: 'required' }); return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) {
        f('email').setAttribute('aria-invalid', 'true'); showErr(T.bad); f('email').focus();
        track('form_error', { form: 'listagem', reason: 'email' }); return;
      }
      startTs();
      busy = true; btn.disabled = true; btn.textContent = T.busy;
      (ts || Promise.reject(new Error('robot'))).then(function (h) {
        var tok = h.token();
        if (!tok) { var r = new Error('robot'); r.h = h; throw r; }
        var body = { turnstileToken: tok };
        Object.keys(p).forEach(function (k) { body[k] = p[k]; });
        return fetch(FN + 'submit-partner-lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', apikey: KEY },
          body: JSON.stringify(body)
        }).then(function (res) { if (!res.ok) { var x = new Error('HTTP ' + res.status); x.h = h; throw x; } return res; });
      }).then(function () {
        track('school_listing_submit', { lang: EN ? 'en' : 'pt' });
        form.hidden = true;
        var em = ok.querySelector('[data-esc-email]'); if (em) em.textContent = p.email;
        ok.hidden = false; try { ok.focus(); } catch (x) {}
      }).catch(function (err) {
        var robot = err && err.message === 'robot';
        showErr(robot ? T.robot : T.fail, !robot, p);
        if (err && err.h) err.h.reset();
        track('form_error', { form: 'listagem', reason: robot ? 'turnstile' : 'network' });
      }).then(function () {
        busy = false; if (!form.hidden) { btn.disabled = false; btn.innerHTML = label; }
      });
    });
  }

  // ── Comportamentos pequenos ────────────────────────────────
  function misc() {
    var mob = document.getElementById('mob-menu-btn');
    if (mob) mob.addEventListener('click', function (e) { e.stopPropagation(); var t = document.getElementById('nav-toggle'); if (t) t.click(); });

    var n = document.getElementById('i18n-notice');
    if (n) {
      var seen = false; try { seen = !!localStorage.getItem('i18n-notice-ok'); } catch (e) {}
      if (!seen) n.hidden = false;
      var x = n.querySelector('.i18n-notice-close');
      if (x) x.addEventListener('click', function () { n.hidden = true; try { localStorage.setItem('i18n-notice-ok', '1'); } catch (e) {} });
    }

    var sel = document.querySelector('.esc-zone select[data-ec-tag]');
    var zn = document.querySelector('[data-esc-zone-name]');
    if (sel && zn) {
      var upd = function () { var o = sel.options[sel.selectedIndex]; if (o) zn.textContent = o.textContent; };
      sel.addEventListener('change', upd); upd();
    }
  }
  // imagens partidas (logótipos e fotos no Storage): esbate em vez de mostrar o ícone partido
  document.addEventListener('error', function (e) {
    var t = e.target;
    if (t && t.tagName === 'IMG' && t.closest && t.closest('.esc')) t.classList.add('is-broken');
  }, true);

  // Âncoras de secção vindas de fora (ex.: /escolas-de-surf#listagem num email): o salto do browser acontece cedo e o
  // que está acima (fontes, imagens, widget GYG) ainda cresce depois. Volta a alinhar durante ~12 s, até o utilizador
  // mexer na página. As âncoras de escola são tratadas em js/partners-directory.js.
  function sectionAnchor() {
    var h = location.hash, el = null;
    if (!h || h.length < 2 || !('ResizeObserver' in window)) return;
    try { el = document.getElementById(decodeURIComponent(h.slice(1))); } catch (e) {}
    if (!el || (el.closest && el.closest('.pd-row'))) return;
    var stop = false, t0 = Date.now();
    var quit = function () { stop = true; };
    ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(function (ev) { window.addEventListener(ev, quit, { once: true, passive: true }); });
    var align = function () {
      if (stop || Date.now() - t0 > 12000) { ro.disconnect(); return; }
      var want = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
      if (Math.abs(el.getBoundingClientRect().top - want) > 4) el.scrollIntoView({ behavior: 'auto', block: 'start' });
    };
    var ro = new ResizeObserver(align);
    ro.observe(document.body);
    window.addEventListener('load', align, { once: true });
    setTimeout(function () { ro.disconnect(); }, 12500);
  }

  function init() { listing(); misc(); sectionAnchor(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
