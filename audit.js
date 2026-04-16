const fs = require('fs');
const path = require('path');

const PAGES_FULL = [
  'index.html', 'beaches.html', 'surf.html', 'pesca.html',
  'webcams.html', 'planear.html', 'precos.html', 'parceiros.html'
];

// Páginas sem navbar (intencional)
const PAGES_NO_NAV = ['login.html', 'dashboard.html'];

const PAGES = [...PAGES_FULL, ...PAGES_NO_NAV];

const issues = [];

function check(file, condition, severity, message) {
  if (!condition) issues.push({ file, severity, message });
}

PAGES.forEach(file => {
  if (!fs.existsSync(file)) {
    issues.push({ file, severity: 'ERROR', message: 'Ficheiro não existe' });
    return;
  }

  const html = fs.readFileSync(file, 'utf8');

  // 1. CSS correcto
  check(file, html.includes('style.css'), 'ERROR', 'style.css não carregado');

  // 2. nav.js presente
  check(file, html.includes('nav.js'), 'ERROR', 'nav.js não carregado');

  // 3. Supabase
  check(file, html.includes('supabase') || html.includes('config.js'), 'WARN', 'Supabase/config.js não carregado');

  // 4. Meta description
  check(file, html.includes('<meta name="description"'), 'WARN', 'Meta description em falta');

  // 5. Canonical
  check(file, html.includes('canonical'), 'WARN', 'Canonical em falta');

  // 6. Viewport meta
  check(file, html.includes('viewport'), 'ERROR', 'Meta viewport em falta');

  // 7. Navbar presente (não obrigatório em login/dashboard)
  if (!PAGES_NO_NAV.includes(file)) {
    check(file, html.includes('id="navbar"') || html.includes("id='navbar'"), 'ERROR', 'Navbar não encontrado');
  }

  // 8. Hamburger presente (não obrigatório em login/dashboard)
  if (!PAGES_NO_NAV.includes(file)) {
    check(file, html.includes('nav-toggle') || html.includes('hamburger'), 'ERROR', 'Hamburger não encontrado');
  }

  // 9. CSS inline antigo (navbar)
  const hasOldNavCSS = html.includes('.navbar {') && !html.includes('style.css');
  check(file, !hasOldNavCSS, 'ERROR', 'CSS de navbar inline sem style.css externo');

  // 10. mobile-nav-fix residual
  check(file, !html.includes('mobile-nav-fix'), 'WARN', 'CSS mobile-nav-fix residual encontrado');

  // 11. Domínio correcto nos canonicals
  if (html.includes('canonical')) {
    check(file,
      html.includes('portalturismoportugal.com') || !html.includes('pages.dev'),
      'WARN', 'Canonical aponta para pages.dev em vez de portalturismoportugal.com'
    );
  }

  // 12. Title presente
  check(file, html.includes('<title>'), 'WARN', 'Title em falta');

  // 13. Overflow-x no body
  // (só verificável via CSS, não HTML)

  // 14. Scripts com defer/async correctos
  const navJsDefer = html.match(/nav\.js[^"]*"[^>]*defer/);
  check(file, !navJsDefer, 'ERROR', 'nav.js carregado com defer — pode quebrar em iOS');
});

// Relatório
console.log('\n=== AUDITORIA DE QUALIDADE — Portugal Travel Hub ===\n');

const errors = issues.filter(i => i.severity === 'ERROR');
const warns = issues.filter(i => i.severity === 'WARN');

if (errors.length === 0 && warns.length === 0) {
  console.log('✅ Sem problemas encontrados!');
} else {
  if (errors.length > 0) {
    console.log(`❌ ERROS CRÍTICOS (${errors.length}):`);
    errors.forEach(i => console.log(`   ${i.file}: ${i.message}`));
  }
  if (warns.length > 0) {
    console.log(`\n⚠️  AVISOS (${warns.length}):`);
    warns.forEach(i => console.log(`   ${i.file}: ${i.message}`));
  }
}

console.log('\n=== FIM DA AUDITORIA ===');
