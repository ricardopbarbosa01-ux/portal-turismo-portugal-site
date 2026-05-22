(function() {
  const dropdowns = document.querySelectorAll('[data-nav-dropdown]');
  dropdowns.forEach(dd => {
    // 2026-05-22: accepts both selectors during migration; remove .nav-dropdown__trigger after inject --update propagates.
    const trigger = dd.querySelector('.pth-dd__trigger, .nav-dropdown__trigger');
    if (!trigger) return;
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const isOpen = dd.getAttribute('data-open') === 'true';
      document.querySelectorAll('[data-nav-dropdown][data-open="true"]').forEach(d => {
        d.setAttribute('data-open', 'false');
        // 2026-05-22: accepts both selectors during migration; remove .nav-dropdown__trigger after inject --update propagates.
        const t = d.querySelector('.pth-dd__trigger, .nav-dropdown__trigger');
        if (t) t.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        dd.setAttribute('data-open', 'true');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('[data-nav-dropdown]')) {
      document.querySelectorAll('[data-nav-dropdown][data-open="true"]').forEach(d => {
        d.setAttribute('data-open', 'false');
        // 2026-05-22: accepts both selectors during migration; remove .nav-dropdown__trigger after inject --update propagates.
        const t = d.querySelector('.pth-dd__trigger, .nav-dropdown__trigger');
        if (t) t.setAttribute('aria-expanded', 'false');
      });
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('[data-nav-dropdown][data-open="true"]').forEach(d => {
        d.setAttribute('data-open', 'false');
        // 2026-05-22: accepts both selectors during migration; remove .nav-dropdown__trigger after inject --update propagates.
        const t = d.querySelector('.pth-dd__trigger, .nav-dropdown__trigger');
        if (t) t.setAttribute('aria-expanded', 'false');
      });
    }
  });
})();
