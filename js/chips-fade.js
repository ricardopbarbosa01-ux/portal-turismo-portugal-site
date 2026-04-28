(function () {
  'use strict';

  function initChipFade(bar) {
    function update() {
      bar.classList.toggle('can-scroll-right', bar.scrollLeft + bar.clientWidth < bar.scrollWidth - 4);
      bar.classList.toggle('can-scroll-left', bar.scrollLeft > 4);
    }
    bar.addEventListener('scroll', update, { passive: true });
    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(update).observe(bar);
    }
    update();
  }

  document.querySelectorAll('.chips-bar, .region-chips-bar, .tipo-chips-bar').forEach(initChipFade);
})();
