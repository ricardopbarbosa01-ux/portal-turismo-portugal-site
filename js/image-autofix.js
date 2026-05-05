(function () {
  'use strict';

  var EDGE_URL = 'https://glupdjvdvunogkqgxoui.supabase.co/functions/v1/pexels-search';
  var ANON_KEY = 'sb_publishable_HKdE2IRmz9lMDcg4p3l1tw_HiTdD4nw';
  var CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

  window.autoFixImage = async function (img) {
    if (img.dataset.autofixTried) return;
    img.dataset.autofixTried = '1';

    var keyword = (img.dataset.fallbackKeyword || img.alt || 'portugal coast').trim();
    var cacheKey = 'pth_img:' + keyword.toLowerCase();

    // 1. Try localStorage cache first
    try {
      var cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');
      if (cached && cached.url && cached.expires > Date.now()) {
        img.src = cached.url;
        return;
      }
    } catch (_) {}

    // 2. Call Edge Function
    try {
      var res = await fetch(EDGE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': ANON_KEY },
        body: JSON.stringify({ query: keyword }),
      });
      if (!res.ok) throw new Error('edge ' + res.status);
      var data = await res.json();
      if (data.url) {
        img.src = data.url;
        try {
          localStorage.setItem(cacheKey, JSON.stringify({
            url: data.url,
            expires: Date.now() + CACHE_TTL_MS,
          }));
        } catch (_) {}
        return;
      }
    } catch (_) {}

    // 3. Final fallback: gradient background
    img.style.display = 'none';
    if (img.parentElement) {
      img.parentElement.style.background = 'linear-gradient(135deg, #0a3d6b, #1a5fa3)';
      img.parentElement.style.minHeight = '200px';
    }
  };
})();
