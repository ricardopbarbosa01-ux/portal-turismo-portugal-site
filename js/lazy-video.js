/** js/lazy-video.js — Lazy-load de vídeos hero via IntersectionObserver
 *
 * Uso: <video class="hero__video" data-src="..." preload="none" playsinline muted loop>
 *   O src real fica em data-src e só é atribuído quando o vídeo entra no viewport.
 *   Remove 5.2 MB (vídeo Pexels) do initial load mobile.
 *
 * Depends on: nada (vanilla JS, carrega com defer).
 **/
(function () {
  'use strict';

  function initLazyVideo(video) {
    var src = video.getAttribute('data-src');
    if (!src) return;

    // Fallback: sem IntersectionObserver (browsers muito antigos), carrega já.
    if (typeof IntersectionObserver === 'undefined') {
      video.src = src;
      video.removeAttribute('data-src');
      video.load();
      video.play().catch(function () { /* autoplay bloqueado — OK */ });
      return;
    }

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        video.src = src;
        video.removeAttribute('data-src');
        video.load();
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () { /* autoplay policy bloqueou — poster fica visível */ });
        }
        obs.unobserve(video);
        obs.disconnect();
      });
    }, { threshold: 0.1 });

    observer.observe(video);
  }

  function boot() {
    var videos = document.querySelectorAll('video[data-src]');
    for (var i = 0; i < videos.length; i++) {
      initLazyVideo(videos[i]);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
