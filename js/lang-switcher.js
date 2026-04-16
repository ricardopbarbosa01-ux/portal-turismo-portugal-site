/* ── Language Switcher — Portugal Travel Hub ── */
(function () {
  var PREF_KEY = 'pth_lang';

  /* Save preference when user clicks a lang btn */
  document.querySelectorAll('.lang-btn[data-lang]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      try { localStorage.setItem(PREF_KEY, btn.dataset.lang); } catch (_) {}
    });
  });

  /* Visually mark stored preference (for pages where active is ambiguous) */
  try {
    var pref = localStorage.getItem(PREF_KEY);
    var pageLang = document.documentElement.lang && document.documentElement.lang.slice(0, 2);
    if (pref && pref !== pageLang) {
      /* Subtle: make the preferred language btn slightly brighter if not current page */
      var preferred = document.querySelector('.lang-btn[data-lang="' + pref + '"]');
      if (preferred) preferred.style.fontWeight = '700';
    }
  } catch (_) {}
})();
