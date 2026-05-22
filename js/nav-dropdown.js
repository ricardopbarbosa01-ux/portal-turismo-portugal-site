(function() {
  const dropdowns = document.querySelectorAll('[data-nav-dropdown]');
  dropdowns.forEach(dd => {
    const trigger = dd.querySelector('.nav-dropdown__trigger');
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const isOpen = dd.getAttribute('data-open') === 'true';
      document.querySelectorAll('[data-nav-dropdown][data-open="true"]').forEach(d => {
        d.setAttribute('data-open', 'false');
        d.querySelector('.nav-dropdown__trigger').setAttribute('aria-expanded', 'false');
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
        d.querySelector('.nav-dropdown__trigger').setAttribute('aria-expanded', 'false');
      });
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('[data-nav-dropdown][data-open="true"]').forEach(d => {
        d.setAttribute('data-open', 'false');
        d.querySelector('.nav-dropdown__trigger').setAttribute('aria-expanded', 'false');
      });
    }
  });
})();
