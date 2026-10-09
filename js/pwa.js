/* js/pwa.js — instalar o Portal como app, em todo o site (Lote H2, 09/10/2026)
 * - Regista /sw.js (antes so a pagina inicial e o planeador o faziam).
 * - Chrome/Edge/Android: guarda o 'beforeinstallprompt' e mostra (a) um botao "Instalar a app" no rodape e
 *   (b) uma barra discreta a partir da 2.a pagina vista ou 25 s na pagina, so depois de o aviso de cookies estar resolvido.
 * - iPhone/iPad (Safari nao tem prompt): o mesmo botao abre as instrucoes "Partilhar > Adicionar ao ecra principal".
 * - Fechar a barra = nao volta durante 30 dias. Ja instalada (modo standalone) = nada aparece.
 * - Qualquer elemento com [data-pwa-install] tambem abre a instalacao.
 * Sem dependencias. Estilos injetados (style-src permite 'unsafe-inline').
 */
(function () {
  'use strict';
  if (window.__pthPwa) return; window.__pthPwa = 1;
  var EN = (document.documentElement.lang || '').toLowerCase().indexOf('en') === 0;
  var T = EN ? {
    t: 'Portal Turismo on your home screen', d: 'Sea, tides, webcams and beaches in one tap.', go: 'Install', ft: 'Install the app', x: 'Close',
    iosT: 'Add to your home screen', ios1: 'Tap Share', ios2: 'in the Safari bar.', ios3: 'Choose “Add to Home Screen”.', ok: 'Got it'
  } : {
    t: 'O Portal Turismo no ecrã inicial', d: 'Mar, marés, webcams e praias num toque.', go: 'Instalar', ft: 'Instalar a app', x: 'Fechar',
    iosT: 'Adicionar ao ecrã principal', ios1: 'Toque em Partilhar', ios2: 'na barra do Safari.', ios3: 'Escolha “Adicionar ao ecrã principal”.', ok: 'Percebi'
  };
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } return null; }
  function ss(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) { return null; } return null; }
  function track(name, p) { try { if (window.track) window.track(name, p || {}); else if (window.gtag) window.gtag('event', name, p || {}); } catch (e) {} }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('/sw.js').catch(function () {}); });
  }
  var standalone = false;
  try { standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true; } catch (e) {}
  if (standalone) { document.documentElement.classList.add('pth-app'); return; }

  var ua = navigator.userAgent || '';
  var iOS = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var iosSafari = iOS && /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS|GSA\//.test(ua);
  var deferred = null, bar = null, ftBtn = null, styled = false;

  // contagem de paginas vistas nesta visita (so para decidir quando mostrar a barra)
  var views = (parseInt(ss('pth-pwa-v'), 10) || 0) + 1; ss('pth-pwa-v', String(views));

  var ICON_SHARE = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="M8 7l4-4 4 4"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg>';
  function css() {
    if (styled) return; styled = true;
    var s = document.createElement('style');
    s.textContent =
      '.pth-pwa{position:fixed;z-index:8990;left:16px;right:16px;bottom:calc(16px + env(safe-area-inset-bottom,0px));max-width:440px;margin:0 auto;display:flex;align-items:center;gap:12px;padding:12px 12px 12px 14px;border-radius:16px;background:#07152A;color:#fff;border:1px solid rgba(232,201,122,.32);box-shadow:0 18px 44px rgba(3,10,22,.38);font:400 14px/1.35 Inter,system-ui,-apple-system,"Segoe UI",sans-serif;transform:translateY(140%);transition:transform .35s cubic-bezier(.22,1,.36,1)}' +
      '.pth-pwa.is-on{transform:none}' +
      '@media (min-width:900px){.pth-pwa{left:24px;right:auto;bottom:24px;margin:0}}' +
      '.pth-pwa img{width:40px;height:40px;border-radius:10px;flex:0 0 40px;background:#0b2340}' +
      '.pth-pwa__tx{flex:1;min-width:0}.pth-pwa__t{margin:0;font-weight:600;font-size:14px}.pth-pwa__d{margin:2px 0 0;font-size:12.5px;color:rgba(255,255,255,.66)}' +
      '.pth-pwa__go{flex:0 0 auto;min-height:40px;padding:0 16px;border:0;border-radius:10px;background:linear-gradient(135deg,#c9a84c,#e8c97a);color:#07152A;font:700 13.5px Inter,system-ui,sans-serif;cursor:pointer}' +
      '.pth-pwa__x{flex:0 0 auto;width:32px;height:32px;border:0;border-radius:8px;background:transparent;color:rgba(255,255,255,.55);font-size:22px;line-height:1;cursor:pointer}' +
      '.pth-pwa__x:hover{color:#fff;background:rgba(255,255,255,.08)}.pth-pwa button:focus-visible,.pth-pwa-ft:focus-visible,.pth-ios button:focus-visible{outline:2px solid #e8c97a;outline-offset:2px}' +
      '.pth-pwa-ft{display:inline-flex;align-items:center;gap:8px;margin:14px 0 0;min-height:38px;padding:0 14px;border-radius:999px;border:1px solid rgba(232,201,122,.45);background:transparent;color:inherit;font:600 13px Inter,system-ui,sans-serif;cursor:pointer}' +
      '.pth-pwa-ft[hidden]{display:none}.pth-pwa-ft:hover{background:rgba(232,201,122,.12)}.pth-pwa-ft svg{width:16px;height:16px}' +
      '.pth-ios{position:fixed;inset:0;z-index:9500;display:flex;align-items:flex-end;justify-content:center;background:rgba(3,10,22,.55);font:400 15px/1.45 Inter,system-ui,-apple-system,sans-serif}' +
      '.pth-ios__c{width:100%;max-width:440px;margin:0 12px calc(12px + env(safe-area-inset-bottom,0px));padding:20px 20px 16px;border-radius:20px;background:#fff;color:#07152A}' +
      '.pth-ios__c h2{margin:0 0 12px;font:700 20px/1.2 "Bodoni Moda",Georgia,serif}.pth-ios__c ol{margin:0;padding:0 0 0 20px}.pth-ios__c li{margin:0 0 8px}.pth-ios__c li svg{vertical-align:-3px;margin:0 2px;color:#0a64c8}' +
      '.pth-ios__c button{margin-top:10px;width:100%;min-height:44px;border:0;border-radius:12px;background:#07152A;color:#fff;font:600 15px Inter,system-ui,sans-serif;cursor:pointer}' +
      '@media (prefers-reduced-motion:reduce){.pth-pwa{transition:none}}';
    document.head.appendChild(s);
  }
  function canInstall() { return !!deferred || iosSafari; }

  function iosSheet() {
    css();
    var w = document.createElement('div'); w.className = 'pth-ios'; w.setAttribute('role', 'dialog'); w.setAttribute('aria-modal', 'true'); w.setAttribute('aria-labelledby', 'pth-ios-h');
    w.innerHTML = '<div class="pth-ios__c"><h2 id="pth-ios-h">' + T.iosT + '</h2><ol><li>' + T.ios1 + ' ' + ICON_SHARE + ' ' + T.ios2 + '</li><li>' + T.ios3 + '</li></ol><button type="button">' + T.ok + '</button></div>';
    function close() { w.remove(); document.removeEventListener('keydown', onKey); }
    function onKey(e) { if (e.key === 'Escape') close(); }
    w.addEventListener('click', function (e) { if (e.target === w || e.target.tagName === 'BUTTON') close(); });
    document.addEventListener('keydown', onKey);
    document.body.appendChild(w); w.querySelector('button').focus();
    track('pwa_install_ios_help');
  }
  function install(src) {
    track('pwa_install_click', { source: src || 'other' });
    if (deferred) {
      var p = deferred; deferred = null; hideBar(true);
      p.prompt();
      p.userChoice.then(function (c) { track('pwa_install_choice', { outcome: c && c.outcome }); if (c && c.outcome === 'accepted') ls('pth-pwa', 'installed'); else syncFooter(); }).catch(function () {});
      return;
    }
    if (iosSafari) { hideBar(true); iosSheet(); }
  }
  window.PTHApp = { install: install, canInstall: canInstall };

  function hideBar(keep) {
    if (!bar) return; bar.classList.remove('is-on');
    var b = bar; bar = null; setTimeout(function () { b.remove(); }, 400);
    if (!keep) ls('pth-pwa', String(Date.now()));
  }
  function dismissedRecently() {
    var v = ls('pth-pwa'); if (!v) return false; if (v === 'installed') return true;
    return Date.now() - (parseInt(v, 10) || 0) < 30 * 864e5;
  }
  function consentDone() { return !!ls('cookie_consent') && !document.getElementById('cookie-consent-banner'); }
  function showBar() {
    if (bar || !canInstall() || dismissedRecently() || !consentDone()) return;
    if (document.querySelector('.pth-ios')) return;
    css();
    bar = document.createElement('div'); bar.className = 'pth-pwa'; bar.setAttribute('role', 'region'); bar.setAttribute('aria-label', T.ft);
    bar.innerHTML = '<img src="/icon-192.png" alt="" width="40" height="40"><div class="pth-pwa__tx"><p class="pth-pwa__t">' + T.t + '</p><p class="pth-pwa__d">' + T.d + '</p></div>' +
      '<button type="button" class="pth-pwa__go">' + T.go + '</button><button type="button" class="pth-pwa__x" aria-label="' + T.x + '">&times;</button>';
    bar.querySelector('.pth-pwa__go').addEventListener('click', function () { install('bar'); });
    bar.querySelector('.pth-pwa__x').addEventListener('click', function () { hideBar(false); track('pwa_bar_dismiss'); });
    // por cima da barra de navegacao inferior do telemovel (.bottom-nav / .mobile-bottom-nav), se estiver visivel
    var nav = [].slice.call(document.querySelectorAll('.bottom-nav, .mobile-bottom-nav')).filter(function (n) { var c = getComputedStyle(n); return c.display !== 'none' && c.visibility !== 'hidden' && c.position === 'fixed' && n.getBoundingClientRect().height > 0; })[0];
    if (nav) bar.style.bottom = Math.round(window.innerHeight - nav.getBoundingClientRect().top + 10) + 'px';
    document.body.appendChild(bar);
    requestAnimationFrame(function () { requestAnimationFrame(function () { if (bar) bar.classList.add('is-on'); }); });
    track('pwa_bar_view');
  }
  function syncFooter() {
    if (!canInstall()) { if (ftBtn) ftBtn.hidden = true; return; }
    if (ftBtn) { ftBtn.hidden = false; return; }
    var host = document.querySelector('footer .ft2__bottom') || document.querySelector('footer[role="contentinfo"]') || document.querySelector('footer');
    if (!host) return;
    css();
    ftBtn = document.createElement('button'); ftBtn.type = 'button'; ftBtn.className = 'pth-pwa-ft';
    ftBtn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M12 7v7"/><path d="M9 11l3 3 3-3"/></svg>' + T.ft;
    ftBtn.addEventListener('click', function () { install('footer'); });
    host.appendChild(ftBtn);
  }
  var timer = null;
  function schedule() {
    syncFooter();
    if (dismissedRecently()) return;
    if (views >= 2) { setTimeout(waitConsent, 3000); return; }
    if (!timer) timer = setTimeout(waitConsent, 25000);
  }
  var tries = 0;
  function waitConsent() { if (consentDone()) { showBar(); return; } if (++tries < 40) setTimeout(waitConsent, 3000); }

  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; schedule(); });
  window.addEventListener('appinstalled', function () { ls('pth-pwa', 'installed'); deferred = null; hideBar(true); syncFooter(); track('pwa_installed'); });
  document.addEventListener('click', function (e) {
    var t = e.target && e.target.closest ? e.target.closest('[data-pwa-install]') : null;
    if (t) { e.preventDefault(); install('link'); }
  });
  function boot() { if (iosSafari) schedule(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
