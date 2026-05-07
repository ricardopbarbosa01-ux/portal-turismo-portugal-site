/**
 * js/beaches-paginate.js
 * Progressive pagination for dynamically-rendered card grids.
 * Works with beaches.html (#beaches-grid) and pesca/surf.html (#spots-grid).
 * Uses MutationObserver to re-apply pagination whenever the grid is re-rendered
 * (e.g. after applyFilters() replaces grid.innerHTML).
 */
(function () {
  'use strict';

  var PAGE_SIZE = 20;

  function paginateGrid(grid) {
    if (!grid) return;

    // Collect real cards — exclude skeletons, empty-state divs, and the Load More button
    var cards = Array.from(grid.children).filter(function (el) {
      return (
        !el.classList.contains('skeleton-card') &&
        !el.classList.contains('state-premium-empty') &&
        !el.classList.contains('load-more-btn') &&
        el.getAttribute('role') !== 'status'
      );
    });

    // Remove stale Load More button from previous render
    var existing = grid.parentNode && grid.parentNode.querySelector('.load-more-btn[data-paginator]');
    if (existing) existing.remove();

    if (cards.length <= PAGE_SIZE) {
      // Show all — nothing to paginate
      cards.forEach(function (c) { c.style.display = ''; });
      return;
    }

    // Show first PAGE_SIZE, hide the rest
    cards.forEach(function (c, i) {
      c.style.display = i < PAGE_SIZE ? '' : 'none';
    });

    var currentEnd = PAGE_SIZE;
    var isEN = document.documentElement.lang === 'en';

    var btn = document.createElement('button');
    btn.className = 'load-more-btn';
    btn.setAttribute('data-paginator', '1');
    btn.setAttribute('data-grid-id', grid.id || '');
    updateBtnText(btn, cards.length, currentEnd, isEN);

    grid.parentNode.insertBefore(btn, grid.nextSibling);

    btn.addEventListener('click', function () {
      var start = currentEnd;
      var end = Math.min(start + PAGE_SIZE, cards.length);
      for (var i = start; i < end; i++) {
        cards[i].style.display = '';
      }
      currentEnd = end;
      if (currentEnd >= cards.length) {
        btn.remove();
      } else {
        updateBtnText(btn, cards.length, currentEnd, isEN);
      }
    });
  }

  function updateBtnText(btn, total, currentEnd, isEN) {
    var remaining = total - currentEnd;
    var next = Math.min(PAGE_SIZE, remaining);
    btn.textContent = isEN
      ? 'Show ' + next + ' more'
      : 'Ver mais ' + next;
  }

  function watchGrid(gridId) {
    var grid = document.getElementById(gridId);
    if (!grid) return;

    var debounce;
    var observer = new MutationObserver(function () {
      clearTimeout(debounce);
      debounce = setTimeout(function () { paginateGrid(grid); }, 60);
    });
    // childList fires when innerHTML is replaced (all children removed + new added)
    observer.observe(grid, { childList: true });

    // Apply if grid already has content (e.g. static render before this script loaded)
    if (grid.children.length > PAGE_SIZE) {
      paginateGrid(grid);
    }
  }

  function init() {
    watchGrid('beaches-grid');
    watchGrid('spots-grid');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
