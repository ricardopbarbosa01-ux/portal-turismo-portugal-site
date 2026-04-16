/**
 * nav.js — Mobile navigation handler
 * Replaces inline hamburger JS across all pages.
 * Creates the mobile-menu drawer dynamically from existing nav-links.
 */
(function () {
  'use strict';

  var toggle = document.getElementById('nav-toggle');
  if (!toggle) return;

  // ── Ensure button type is correct (iOS Safari touch fix) ──────
  toggle.setAttribute('type', 'button');

  // ── Build mobile menu dynamically ────────────────────────────
  var menu = document.getElementById('mobile-menu');
  if (!menu) {
    menu = document.createElement('div');
    menu.id = 'mobile-menu';
    menu.className = 'mobile-menu';
    menu.setAttribute('aria-hidden', 'true');
    menu.setAttribute('role', 'dialog');
    menu.setAttribute('aria-label', 'Menu de navegação');

    // Copy main nav links from .nav-links
    var navLinksEl = document.querySelector('.nav-links');
    if (navLinksEl) {
      var links = navLinksEl.querySelectorAll('a[href]');
      links.forEach(function (link) {
        var a = document.createElement('a');
        a.href = link.getAttribute('href');
        a.textContent = link.textContent.trim();
        if (link.classList.contains('active')) a.classList.add('active');
        if (link.hasAttribute('aria-current')) a.setAttribute('aria-current', link.getAttribute('aria-current'));
        menu.appendChild(a);
      });
    }

    // Add login + register at bottom of menu
    var authDiv = menu.querySelector('.mobile-auth');
    if (!authDiv) {
      var auth = document.createElement('div');
      auth.className = 'mobile-auth';
      auth.innerHTML =
        '<a href="login.html" class="btn-mobile-login">Entrar</a>' +
        '<a href="login.html#register" class="btn-mobile-register">Registar</a>';
      menu.appendChild(auth);
    }

    var navbar = document.getElementById('navbar');
    if (navbar) navbar.appendChild(menu);
  }

  // ── Overlay backdrop ─────────────────────────────────────────
  var overlay = document.createElement('div');
  overlay.className = 'mobile-overlay';
  document.body.appendChild(overlay);

  // ── Open / close helpers ──────────────────────────────────────
  function openMenu() {
    menu.classList.add('open');
    toggle.classList.add('active');
    toggle.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-hidden', 'false');
    overlay.classList.add('active');
    // Note: do NOT set body.overflow here — causes iOS touch freeze
  }

  function closeMenu() {
    menu.classList.remove('open');
    toggle.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
    overlay.classList.remove('active');
  }

  // ── Close on overlay click ────────────────────────────────────
  overlay.addEventListener('click', closeMenu);

  // ── Hamburger toggle (touch + click) ────────────────────────
  // touchstart handles iOS immediately (no 300ms delay).
  // preventDefault() stops the subsequent synthetic click so the
  // toggle doesn't fire twice on touch devices.
  var didTouch = false;

  toggle.addEventListener('touchstart', function (e) {
    e.preventDefault();
    didTouch = true;
    menu.classList.contains('open') ? closeMenu() : openMenu();
  }, { passive: false });

  toggle.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (didTouch) { didTouch = false; return; } // already handled by touchstart
    menu.classList.contains('open') ? closeMenu() : openMenu();
  });

  // ── Close on outside click ───────────────────────────────────
  document.addEventListener('click', function (e) {
    if (menu.classList.contains('open') &&
        !toggle.contains(e.target) &&
        !menu.contains(e.target)) {
      closeMenu();
    }
  });

  // ── Close on Escape ───────────────────────────────────────────
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  // ── Close when a menu link is clicked ────────────────────────
  menu.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') closeMenu();
  });

  // ── Scroll handler: add/remove scrolled class ─────────────────
  var navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', function () {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  }

})();
