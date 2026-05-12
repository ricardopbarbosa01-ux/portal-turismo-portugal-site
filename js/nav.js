/**
 * nav.js — Navigation handler
 * - Mobile hamburger menu (drawer built dynamically from .nav-links)
 * - Navbar auth state: centralised for all pages
 * - i18n: labels and logo href adapt to document.documentElement.lang
 */
(function () {
  'use strict';

  var toggle = document.getElementById('nav-toggle');
  if (!toggle) return;

  // ── i18n ─────────────────────────────────────────────────────
  var lang = (document.documentElement.lang || 'pt').slice(0, 2);
  var i18n = {
    pt: {
      signIn: 'Entrar',
      signUp: 'Registar',
      loginHref: '/login.html',
      registerHref: '/login.html#register',
      logoHref: '/',
      menuLabel: 'Menu de navegação'
    },
    en: {
      signIn: 'Sign In',
      signUp: 'Sign Up',
      loginHref: '/en/login.html',
      registerHref: '/en/login.html#register',
      logoHref: '/en/',
      menuLabel: 'Navigation menu'
    }
  };
  var t = i18n[lang] || i18n.pt;

  // ── Ensure button type is correct (iOS Safari touch fix) ──────
  toggle.setAttribute('type', 'button');

  // ── Logo href safety net ──────────────────────────────────────
  // Corrects any EN page where the logo still points to root '/'.
  var logoEl = document.querySelector('.nav-logo');
  if (logoEl && lang === 'en' && logoEl.getAttribute('href') === '/') {
    logoEl.setAttribute('href', t.logoHref);
  }

  // ── Build mobile menu dynamically ────────────────────────────
  var menu = document.getElementById('mobile-menu');
  if (!menu) {
    menu = document.createElement('div');
    menu.id = 'mobile-menu';
    menu.className = 'mobile-menu';
    menu.setAttribute('aria-hidden', 'true');
    menu.setAttribute('role', 'dialog');
    menu.setAttribute('aria-label', t.menuLabel);

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

    // Add login + register at bottom of menu (i18n labels and hrefs)
    var authDiv = menu.querySelector('.mobile-auth');
    if (!authDiv) {
      var auth = document.createElement('div');
      auth.className = 'mobile-auth';
      var loginA = document.createElement('a');
      loginA.href = t.loginHref;
      loginA.className = 'btn-mobile-login';
      loginA.textContent = t.signIn;
      auth.appendChild(loginA);
      var regA = document.createElement('a');
      regA.href = t.registerHref;
      regA.className = 'btn-mobile-register';
      regA.textContent = t.signUp;
      auth.appendChild(regA);
      menu.appendChild(auth);
    }

    // Clone desktop lang switcher into mobile menu
    var desktopLang = document.querySelector('.lang-switcher');
    if (desktopLang) {
      var mobileLang = document.createElement('div');
      mobileLang.className = 'mobile-lang';
      mobileLang.setAttribute('role', 'navigation');
      mobileLang.setAttribute('aria-label', lang === 'en' ? 'Language' : 'Idioma');
      Array.from(desktopLang.childNodes).forEach(function(node) {
        mobileLang.appendChild(node.cloneNode(true));
      });
      menu.appendChild(mobileLang);
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

// ── Navbar auth state (centralised) ──────────────────────────────
async function initNavAuth() {
  try {
    const { data: { user } } = await db.auth.getUser();
    const loginBtn = document.getElementById('nav-login-btn');
    const regBtn   = document.getElementById('nav-register-btn');
    if (!loginBtn || !regBtn) return;

    if (!user) return;

    // ── Role detection (parallel queries) ──────────────────────
    const isAdmin = user.app_metadata?.role === 'admin';

    // isPro: profiles.plan is the source of truth (SEC-04).
    // Cache in sessionStorage for 60s to avoid repeated DB hits.
    let isPro = false;
    let isPartner = false;

    try {
      const cacheKey = `pth_user_plan_${user.id}`;
      const cached = sessionStorage.getItem(cacheKey);
      let planFromCache = null;

      if (cached) {
        try {
          const { plan, ts } = JSON.parse(cached);
          if (Date.now() - ts < 60000) {
            planFromCache = plan;
            isPro = plan === 'pro';
          } else {
            sessionStorage.removeItem(cacheKey);
          }
        } catch (_) { sessionStorage.removeItem(cacheKey); }
      }

      if (planFromCache === null) {
        // Cache miss or stale — fetch profiles + partners in parallel
        const [profileRes, partnerRes] = await Promise.all([
          db.from('profiles').select('plan').eq('id', user.id).single(),
          db.from('partners').select('id').eq('user_id', user.id).eq('aprovado', true).maybeSingle()
        ]);
        const plan = profileRes.data?.plan ?? 'free';
        isPro = plan === 'pro';
        sessionStorage.setItem(cacheKey, JSON.stringify({ plan, ts: Date.now() }));
        isPartner = !!(partnerRes?.data);
      } else {
        // Plan from cache — still need partner check (not cached)
        const { data: partnerData } = await db
          .from('partners').select('id')
          .eq('user_id', user.id).eq('aprovado', true).maybeSingle();
        isPartner = !!partnerData;
      }
    } catch (_) {
      // Profiles/partner query failed — graceful fallback: isPro = false, isPartner = false
    }

    // ── i18n ───────────────────────────────────────────────────
    const lang = (document.documentElement.lang || 'pt').slice(0, 2);
    const isEN = lang === 'en';

    // ── Nav rendering by role combination ──────────────────────
    //
    // Dual-link scenarios (primary role + A Minha Conta + signout link):
    //   admin+Pro, partner+Pro
    //
    // Single-link scenarios (primary + Terminar Sessão):
    //   admin only, partner only, Pro only, free

    if (isAdmin && isPro) {
      // Primary: Dashboard (gold); Secondary: A Minha Conta (outline); Inline signout link
      loginBtn.textContent = 'Dashboard';
      loginBtn.href        = '/dashboard.html';
      loginBtn.className   = 'btn btn-primary';

      regBtn.textContent = isEN ? 'My Account' : 'A Minha Conta';
      regBtn.href        = isEN ? '/en/conta.html' : '/conta.html';
      regBtn.className   = 'btn btn-outline';

      _appendSignoutLink(regBtn, isEN);

    } else if (isPartner && isPro) {
      // Primary: Portal Parceiro (gold); Secondary: A Minha Conta (outline); Inline signout link
      loginBtn.textContent = isEN ? 'Partner Portal' : 'Portal Parceiro';
      loginBtn.href        = '/parceiro.html';
      loginBtn.className   = 'btn btn-primary';

      regBtn.textContent = isEN ? 'My Account' : 'A Minha Conta';
      regBtn.href        = isEN ? '/en/conta.html' : '/conta.html';
      regBtn.className   = 'btn btn-outline';

      _appendSignoutLink(regBtn, isEN);

    } else if (isAdmin) {
      // Admin only (no Pro): Dashboard + Terminar Sessão
      loginBtn.textContent = 'Dashboard';
      loginBtn.href        = '/dashboard.html';
      loginBtn.className   = 'btn btn-primary';

      _makeSignoutBtn(regBtn, isEN);

    } else if (isPartner) {
      // Partner only (no Pro): Portal Parceiro + Terminar Sessão
      loginBtn.textContent = isEN ? 'Partner Portal' : 'Portal Parceiro';
      loginBtn.href        = '/parceiro.html';
      loginBtn.className   = 'btn btn-primary';

      _makeSignoutBtn(regBtn, isEN);

    } else {
      // Pro or free: A Minha Conta + Terminar Sessão
      loginBtn.textContent = isEN ? 'My Account' : 'A Minha Conta';
      loginBtn.href        = isEN ? '/en/conta.html' : '/conta.html';
      loginBtn.className   = 'btn btn-primary';

      _makeSignoutBtn(regBtn, isEN);
    }

  } catch (_) {}
}

// Helper: turn regBtn into "Terminar Sessão" with signout handler
function _makeSignoutBtn(btn, isEN) {
  btn.textContent = isEN ? 'Sign Out' : 'Terminar Sessão';
  btn.href        = '#';
  btn.className   = 'btn btn-outline';
  btn.addEventListener('click', async function (e) {
    e.preventDefault();
    await db.auth.signOut();
    window.location.href = isEN ? '/en/' : '/';
  });
}

// Helper: append small "Terminar sessão" link after btn (dual-link mode)
function _appendSignoutLink(btn, isEN) {
  var existing = btn.parentElement && btn.parentElement.querySelector('.nav-signout-link');
  if (existing) return; // idempotent
  var a = document.createElement('a');
  a.className = 'nav-signout-link';
  a.href = '#';
  a.textContent = isEN ? 'Sign out' : 'Terminar sessão';
  a.addEventListener('click', async function (e) {
    e.preventDefault();
    await db.auth.signOut();
    window.location.href = isEN ? '/en/' : '/';
  });
  if (btn.parentElement) btn.parentElement.appendChild(a);
}

document.addEventListener('DOMContentLoaded', initNavAuth);
