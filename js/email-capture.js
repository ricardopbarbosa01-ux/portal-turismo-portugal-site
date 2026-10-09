/* js/email-capture.js — captação de email e Turnstile partilhados (Lote F, 09/10/2026)
 *
 * 1) PTHCapture.turnstile(el) -> Promise<{ token(), reset() }>
 *    Carrega https://challenges.cloudflare.com/turnstile/v0/api.js (render=explicit) UMA vez, só quando é preciso,
 *    e desenha o widget dentro de `el`. Usado por este ficheiro e por js/parceiros.js.
 * 2) Formulários <form data-email-capture data-source="precos-pro-lista"> -> POST submit-surf {email, source, turnstileToken}
 *    (tabela surf_subscribers). Opcional: um campo com [data-ec-tag] (select/radio) acrescenta ":valor" ao source.
 *    Markup esperado dentro do form: input[type=email], [data-ec-ts] (onde o Turnstile é desenhado), button[type=submit],
 *    [data-ec-error] (role=alert). Fora ou dentro: [data-ec-success] (tabindex=-1) — procurado primeiro pelo id em
 *    data-success="id", senão dentro do form.
 *    O Turnstile só carrega quando o formulário se aproxima do ecrã (ou ao primeiro focus), para não pesar na página.
 * Sem localStorage. Depois de um erro o token é renovado (turnstile.reset), por isso pode tentar outra vez.
 */
(function () {
  'use strict';
  var SITEKEY = '0x4AAAAAADFrwvqNt1FGaqkB';
  var FN = 'https://glupdjvdvunogkqgxoui.supabase.co/functions/v1/';
  var KEY = 'sb_publishable_HKdE2IRmz9lMDcg4p3l1tw_HiTdD4nw';
  var EN = (document.documentElement.lang || '').toLowerCase().indexOf('en') === 0;
  var T = EN ? {
    bad: 'Please enter a valid email address.',
    robot: 'The anti-spam check is still loading. Wait a second and try again.',
    fail: 'We could not save it. Please try again in a moment.',
    busy: 'Sending…'
  } : {
    bad: 'Escreva um email válido.',
    robot: 'A verificação anti-spam ainda está a carregar. Aguarde um segundo e tente outra vez.',
    fail: 'Não conseguimos guardar. Tente outra vez daqui a pouco.',
    busy: 'A enviar…'
  };

  function track(n, p) { try { if (typeof window.track === 'function') window.track(n, p || {}); else if (window.gtag) window.gtag('event', n, p || {}); } catch (e) {} }

  // ── Turnstile (explícito, carregado uma vez) ──
  var apiPromise = null;
  function loadApi() {
    if (window.turnstile && window.turnstile.render) return Promise.resolve(window.turnstile);
    if (apiPromise) return apiPromise;
    apiPromise = new Promise(function (resolve, reject) {
      window.__pthTsReady = function () { resolve(window.turnstile); };
      var s = document.createElement('script');
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=__pthTsReady';
      s.async = true; s.defer = true;
      s.onerror = function () { apiPromise = null; reject(new Error('turnstile load')); };
      document.head.appendChild(s);
    });
    return apiPromise;
  }
  function turnstile(el) {
    if (el.__pthTs) return el.__pthTs;
    var tok = '', wid = null;
    el.__pthTs = loadApi().then(function (ts) {
      wid = ts.render(el, {
        sitekey: SITEKEY, size: 'flexible', appearance: 'interaction-only', theme: el.getAttribute('data-theme') || 'auto', language: EN ? 'en' : 'pt-PT',
        callback: function (t) { tok = t; },
        'expired-callback': function () { tok = ''; try { ts.reset(wid); } catch (e) {} },
        'error-callback': function () { tok = ''; }
      });
      return {
        token: function () { return tok || (el.querySelector('[name="cf-turnstile-response"]') || {}).value || ''; },
        reset: function () { tok = ''; try { ts.reset(wid); } catch (e) {} }
      };
    });
    return el.__pthTs;
  }
  window.PTHCapture = { turnstile: turnstile, endpoint: FN, key: KEY, track: track };

  // ── Formulários de email ──
  function bind(form) {
    if (form.__ec) return; form.__ec = 1;
    var email = form.querySelector('input[type="email"]');
    var btn = form.querySelector('button[type="submit"]');
    var tsEl = form.querySelector('[data-ec-ts]');
    var err = form.querySelector('[data-ec-error]');
    var sid = form.getAttribute('data-success');
    var ok = (sid && document.getElementById(sid)) || form.querySelector('[data-ec-success]');
    var label = btn ? btn.innerHTML : '';
    var ts = null, started = false;
    function start() { if (started || !tsEl) return; started = true; ts = turnstile(tsEl); }
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (en) { if (en.some(function (x) { return x.isIntersecting; })) { start(); io.disconnect(); } }, { rootMargin: '400px 0px' });
      io.observe(form);
    } else start();
    form.addEventListener('focusin', start);
    function showErr(m) { if (err) { err.textContent = m; err.hidden = false; } }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.__busy) return;
      if (err) { err.textContent = ''; err.hidden = true; }
      var v = (email && email.value || '').trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { showErr(T.bad); if (email) { email.setAttribute('aria-invalid', 'true'); email.focus(); } return; }
      if (email) email.removeAttribute('aria-invalid');
      start();
      var source = form.getAttribute('data-source') || location.pathname;
      var tagEl = form.querySelector('[data-ec-tag]:checked') || form.querySelector('select[data-ec-tag]');
      if (tagEl && tagEl.value) source += ':' + tagEl.value;
      form.__busy = true; if (btn) { btn.disabled = true; btn.textContent = T.busy; }
      (ts || Promise.reject(new Error('no-ts'))).then(function (h) {
        var t = h.token();
        if (!t) { var e2 = new Error('robot'); e2.h = h; throw e2; }
        return fetch(FN + 'submit-surf', {
          method: 'POST', headers: { 'Content-Type': 'application/json', apikey: KEY },
          body: JSON.stringify({ turnstileToken: t, email: v, source: source })
        }).then(function (r) { if (!r.ok) { var e3 = new Error('HTTP ' + r.status); e3.h = h; throw e3; } return r; });
      }).then(function () {
        track('email_capture_submit', { source: source });
        form.hidden = true; form.setAttribute('aria-hidden', 'true');
        if (ok) { ok.hidden = false; ok.classList.add('is-on'); try { ok.focus(); } catch (x) {} }
      }).catch(function (e4) {
        showErr(e4 && e4.message === 'robot' ? T.robot : T.fail);
        if (e4 && e4.h) e4.h.reset();
        track('email_capture_error', { source: source, reason: (e4 && e4.message) || 'x' });
      }).then(function () {
        form.__busy = false; if (btn && !form.hidden) { btn.disabled = false; btn.innerHTML = label; }
      });
    });
  }
  function init() { [].forEach.call(document.querySelectorAll('form[data-email-capture]'), bind); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
