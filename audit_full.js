const fs = require('fs');
const path = require('path');

const results = { critical: [], warning: [], info: [], passed: [] };

function fail(category, file, msg) { results.critical.push(`[${category}] ${file}: ${msg}`); }
function warn(category, file, msg) { results.warning.push(`[${category}] ${file}: ${msg}`); }
function pass(category, msg) { results.passed.push(`[${category}] ${msg}`); }
function info(category, msg) { results.info.push(`[${category}] ${msg}`); }

const PAGES = [
  'index.html','beaches.html','surf.html','pesca.html','webcams.html',
  'planear.html','precos.html','parceiros.html','login.html',
  'dashboard.html','beach.html'
];

const JS_FILES = [
  'js/config.js','js/login.js','js/parceiros.js','js/planear.js',
  'js/nav.js','js/favorites.js'
];

// ── SEGURANÇA ────────────────────────────────────────────────────────────

// 1. Chaves expostas no código client-side
const DANGEROUS_PATTERNS = [
  { pattern: /sb_secret_/g, name: 'Supabase SERVICE ROLE key exposta' },
  { pattern: /re_[a-zA-Z0-9]{30,}/g, name: 'Resend API key exposta' },
  { pattern: /sk_live_/g, name: 'Stripe live key exposta' },
  { pattern: /password\s*[:=]\s*["\'][^"\']{6,}/gi, name: 'Password hardcoded' },
];

[...PAGES, ...JS_FILES].forEach(file => {
  if (!fs.existsSync(file)) return;
  const content = fs.readFileSync(file, 'utf8');
  DANGEROUS_PATTERNS.forEach(({ pattern, name }) => {
    if (pattern.test(content)) fail('SEGURANÇA', file, name);
    pattern.lastIndex = 0;
  });
});

// 2. Anon key exposta (aceitável mas documentar)
PAGES.forEach(file => {
  if (!fs.existsSync(file)) return;
  const c = fs.readFileSync(file, 'utf8');
  if (c.includes('sb_publishable_')) info('SEGURANÇA', `${file}: anon key exposta (aceitável para client-side)`);
});

// 3. Console.log com dados sensíveis
JS_FILES.forEach(file => {
  if (!fs.existsSync(file)) return;
  const c = fs.readFileSync(file, 'utf8');
  const lines = c.split('\n');
  lines.forEach((line, i) => {
    if (/console\.(log|warn|error).*?(password|token|key|secret)/i.test(line)) {
      warn('SEGURANÇA', file, `console.log com dado sensível linha ${i+1}`);
    }
  });
});

// 4. HTTPS em todos os links externos
PAGES.forEach(file => {
  if (!fs.existsSync(file)) return;
  const c = fs.readFileSync(file, 'utf8');
  const httpLinks = c.match(/href="http:\/\/[^"]+"/g) || [];
  if (httpLinks.length > 0) warn('SEGURANÇA', file, `Links HTTP não-HTTPS: ${httpLinks.slice(0,3).join(', ')}`);
});

// ── FUNCIONAL ────────────────────────────────────────────────────────────

// 5. Todas as páginas têm style.css
PAGES.forEach(file => {
  if (!fs.existsSync(file)) return;
  const c = fs.readFileSync(file, 'utf8');
  if (!c.includes('style.css')) fail('FUNCIONAL', file, 'style.css não carregado');
  else pass('FUNCIONAL', `${file}: style.css OK`);
});

// 6. nav.js presente em todas as páginas excepto login/dashboard
const NAV_PAGES = PAGES.filter(p => !['login.html','dashboard.html'].includes(p));
NAV_PAGES.forEach(file => {
  if (!fs.existsSync(file)) return;
  const c = fs.readFileSync(file, 'utf8');
  if (!c.includes('nav.js')) fail('FUNCIONAL', file, 'nav.js não carregado');
});

// 7. nav.js sem defer
PAGES.forEach(file => {
  if (!fs.existsSync(file)) return;
  const c = fs.readFileSync(file, 'utf8');
  if (/nav\.js[^"]*"\s+defer/i.test(c)) fail('FUNCIONAL', file, 'nav.js tem defer — quebra iOS');
});

// 8. Formulários têm prevenção de submit default
['js/login.js','js/parceiros.js','js/planear.js'].forEach(file => {
  if (!fs.existsSync(file)) return;
  const c = fs.readFileSync(file, 'utf8');
  if (!c.includes('preventDefault')) fail('FUNCIONAL', file, 'Sem preventDefault nos forms');
  else pass('FUNCIONAL', `${file}: preventDefault OK`);
});

// 9. Edge Functions existem
const FUNCTIONS = ['ls-webhook','send-welcome','send-plan-confirm','send-partner-alert'];
FUNCTIONS.forEach(fn => {
  const p = `supabase/functions/${fn}/index.ts`;
  if (!fs.existsSync(p)) fail('FUNCIONAL', p, 'Edge Function não existe');
  else pass('FUNCIONAL', `${fn}: Edge Function existe`);
});

// 10. Domínio de produção nos canonicals
PAGES.forEach(file => {
  if (!fs.existsSync(file)) return;
  const c = fs.readFileSync(file, 'utf8');
  if (c.includes('canonical') && c.includes('pages.dev')) {
    fail('FUNCIONAL', file, 'Canonical aponta para pages.dev em vez de portalturismoportugal.com');
  }
});

// ── SEO ──────────────────────────────────────────────────────────────────

// 11. Meta tags essenciais
PAGES.forEach(file => {
  if (!fs.existsSync(file)) return;
  const c = fs.readFileSync(file, 'utf8');
  if (!c.includes('<meta name="description"')) warn('SEO', file, 'Meta description em falta');
  if (!c.includes('<title>')) warn('SEO', file, 'Title em falta');
  if (!c.includes('og:title')) warn('SEO', file, 'OG title em falta');
  if (!c.includes('canonical')) warn('SEO', file, 'Canonical em falta');
  if (!c.includes('viewport')) fail('SEO', file, 'Meta viewport em falta');
});

// 12. sitemap.xml existe
if (!fs.existsSync('sitemap.xml')) fail('SEO', 'sitemap.xml', 'Ficheiro não existe');
else pass('SEO', 'sitemap.xml existe');

// 13. robots.txt existe
if (!fs.existsSync('robots.txt')) fail('SEO', 'robots.txt', 'Ficheiro não existe');
else pass('SEO', 'robots.txt existe');

// ── PERFORMANCE ──────────────────────────────────────────────────────────

// 14. Imagens com lazy loading
PAGES.forEach(file => {
  if (!fs.existsSync(file)) return;
  const c = fs.readFileSync(file, 'utf8');
  const imgs = (c.match(/<img[^>]+>/g) || []);
  const withoutLazy = imgs.filter(img => !img.includes('loading='));
  if (withoutLazy.length > 3) warn('PERFORMANCE', file, `${withoutLazy.length} imagens sem lazy loading`);
});

// 15. Scripts sem async/defer desnecessários
PAGES.forEach(file => {
  if (!fs.existsSync(file)) return;
  const c = fs.readFileSync(file, 'utf8');
  const scripts = (c.match(/<script\s+src=[^>]+>/g) || []);
  const blocking = scripts.filter(s => !s.includes('defer') && !s.includes('async') && !s.includes('nav.js'));
  if (blocking.length > 2) warn('PERFORMANCE', file, `${blocking.length} scripts bloqueantes`);
});

// ── RELATÓRIO ────────────────────────────────────────────────────────────

console.log('\n╔══════════════════════════════════════════════════════════╗');
console.log('║     AUDITORIA COMPLETA — Portugal Travel Hub            ║');
console.log('╚══════════════════════════════════════════════════════════╝\n');

if (results.critical.length === 0) {
  console.log('✅ CRÍTICOS: Nenhum problema crítico encontrado\n');
} else {
  console.log(`❌ CRÍTICOS (${results.critical.length}):`);
  results.critical.forEach(r => console.log('   ' + r));
  console.log('');
}

if (results.warning.length === 0) {
  console.log('✅ AVISOS: Nenhum aviso\n');
} else {
  console.log(`⚠️  AVISOS (${results.warning.length}):`);
  results.warning.forEach(r => console.log('   ' + r));
  console.log('');
}

console.log(`ℹ️  INFO (${results.info.length}):`);
results.info.forEach(r => console.log('   ' + r));

console.log(`\n✅ PASSOU (${results.passed.length} verificações)`);
console.log('\n══════════════════════════════════════════════════════════\n');
