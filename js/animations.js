// Portal Turismo — GSAP ScrollTrigger Animations
// Replaces IntersectionObserver-based .reveal system

(function() {
  'use strict';

  // Respect reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  gsap.registerPlugin(ScrollTrigger);
  document.body.classList.add('gsap-active');

  // ── Hero entrance (CSS transitions + setTimeout for reliability) ──
  var heroBase = document.getElementById('preloader') ? 4200 : 300;
  var heroEls = [
    { sel: '.hero__line1', delay: 0 },
    { sel: '.hero__line2', delay: 200 },
    { sel: '.hero__subtitle', delay: 500 },
    { sel: '.hero__actions', delay: 700 },
    { sel: '.hero__based-in', delay: 900 },
    { sel: '.hero__right-content', delay: 400 },
    { sel: '.hero-eyebrow', delay: 600 }
  ];
  heroEls.forEach(function(item) {
    var el = document.querySelector(item.sel);
    if (!el) return;
    setTimeout(function() {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, heroBase + item.delay);
  });

  // ── Generic .reveal elements ────────────────────────────────
  gsap.utils.toArray('.reveal').forEach(function(el) {
    gsap.fromTo(el,
      { opacity: 0, y: 28 },
      {
        opacity: 1, y: 0, duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none'
        }
      }
    );
  });

  // ── Staggered card grids ────────────────────────────────────
  var gridSelectors = ['.intent-grid', '.conditions-grid', '.webcams-grid', '#fb-grid'];
  gridSelectors.forEach(function(sel) {
    var container = document.querySelector(sel);
    if (!container) return;
    var cards = container.querySelectorAll('.reveal, .intent-card, .condition-card, .fb-card');
    if (!cards.length) return;

    gsap.fromTo(cards,
      { opacity: 0, y: 30 },
      {
        opacity: 1, y: 0, duration: 0.6,
        stagger: 0.08, ease: 'power2.out',
        scrollTrigger: {
          trigger: container,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      }
    );
  });

  // ── Section headers — scale + fade ──────────────────────────
  gsap.utils.toArray('.section-header').forEach(function(header) {
    gsap.fromTo(header,
      { opacity: 0, y: 40, scale: 0.97 },
      {
        opacity: 1, y: 0, scale: 1, duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: header,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      }
    );
  });

  // ── Parallax on dark sections ───────────────────────────────
  gsap.utils.toArray('.page-section--dark').forEach(function(section) {
    gsap.fromTo(section,
      { backgroundPositionY: '0%' },
      {
        backgroundPositionY: '20%',
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      }
    );
  });

  // ── Refresh after dynamic content loads ─────────────────────
  window.addEventListener('load', function() {
    setTimeout(function() { ScrollTrigger.refresh(); }, 500);
  });

})();
