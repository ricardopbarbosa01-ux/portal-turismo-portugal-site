#!/usr/bin/env node
// _scripts/build-partners.mjs — Build script for PTH partner editorial system
// ESM, Node v25+, zero external deps
//
// Usage:
//   node _scripts/build-partners.mjs              full build
//   node _scripts/build-partners.mjs --dry-run    preview in _diag/dry-run-partners/
//   node _scripts/build-partners.mjs --check      validate JSON only, no writes
//   node _scripts/build-partners.mjs --inject     add markers to target pages (careful mode)
//
// Rules enforced:
//   - All HTML entities for PT accents (never raw unicode in HTML output)
//   - All paths absolute (/css/, /js/, /escolas-de-surf)
//   - hreflang trinity (pt-PT / en / x-default) on vitrine pages
//   - JSON-LD: CollectionPage + SportsActivityLocation per partner
//   - Backup before any file modification
//   - Idempotent: safe to run 100x

import { readFile, writeFile, mkdir, copyFile, readdir } from 'fs/promises';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, '..');
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const CHECK = args.includes('--check');
const INJECT = args.includes('--inject');

const BACKUP_DIR = join(ROOT, '_diag', 'backups', 'partners-20260521');
const DRYRUN_DIR = join(ROOT, '_diag', 'dry-run-partners');
const DATA_FILE = join(ROOT, '_data', 'partners.json');
const PRAIAS_DIR = join(ROOT, 'praias');
const VALIDATE_PY = join(ROOT, '_diag', 'validate-html.py');

// ── Logging ────────────────────────────────────────────────────────────────
function info(msg) { console.log(`[INFO] ${msg}`); }
function warn(msg) { console.log(`[WARN] ${msg}`); }
function err(msg)  { console.log(`[ERROR] ${msg}`); }

// ── Slug → Display Name ────────────────────────────────────────────────────
// Uses explicit map from partners.json; fallback title-cases but keeps PT prepositions lowercase.
const PT_PREPS = new Set(['da', 'do', 'de', 'dos', 'das', 'e', 'o', 'a']);
function slugToName(slug, praiaNames) {
  if (praiaNames && praiaNames[slug]) return praiaNames[slug];
  return slug
    .replace(/-/g, ' ')
    .split(' ')
    .map((w, i) => (i === 0 || !PT_PREPS.has(w)) ? w[0].toUpperCase() + w.slice(1) : w)
    .join(' ');
}

// ── Get existing praias slugs ──────────────────────────────────────────────
async function getPraiasSlugs() {
  try {
    const entries = await readdir(PRAIAS_DIR);
    return new Set(entries);
  } catch {
    warn('praias/ directory not readable');
    return new Set();
  }
}

// ── Backup file ────────────────────────────────────────────────────────────
async function backupFile(absPath) {
  await mkdir(BACKUP_DIR, { recursive: true });
  const dest = join(BACKUP_DIR, basename(absPath) + '.bak');
  try {
    await copyFile(absPath, dest);
    info(`Backup: ${dest}`);
  } catch {
    warn(`Backup failed for ${absPath}`);
  }
}

// ── Write output (respects dry-run) ───────────────────────────────────────
async function writeOutput(relPath, content) {
  if (DRY_RUN) {
    const name = relPath.replace(/[\\/]/g, '_');
    const dest = join(DRYRUN_DIR, name);
    await mkdir(DRYRUN_DIR, { recursive: true });
    await writeFile(dest, content, 'utf-8');
    info(`[DRY-RUN] ${dest} (${Buffer.byteLength(content, 'utf-8')} B)`);
  } else {
    const dest = join(ROOT, relPath);
    await mkdir(dirname(dest), { recursive: true });
    await writeFile(dest, content, 'utf-8');
    info(`Written: ${dest} (${Buffer.byteLength(content, 'utf-8')} B)`);
  }
}

// ── Validate HTML ─────────────────────────────────────────────────────────
async function validateHTML(relPath) {
  const name = relPath.replace(/[\\/]/g, '_');
  const absPath = DRY_RUN ? join(DRYRUN_DIR, name) : join(ROOT, relPath);
  try {
    const result = execSync(`python "${VALIDATE_PY}" "${absPath}"`, { encoding: 'utf-8' });
    if (result.includes('AVISO') || result.includes('Erros') || result.includes('mismatch')) {
      warn(`validate-html ISSUES in ${relPath}:\n${result.trim()}`);
      return false;
    }
    info(`validate-html OK: ${relPath}`);
    return true;
  } catch (e) {
    warn(`validate-html error for ${relPath}: ${e.message}`);
    return false;
  }
}

// ── SVG Placeholder ────────────────────────────────────────────────────────
function generateSVGPlaceholder(partner) {
  const initials = partner.name
    .split(' ')
    .filter(w => /^[A-Z]/.test(w))
    .slice(0, 2)
    .map(w => w[0])
    .join('');
  const gradId = `ph-grad-${partner.id}`;
  return `<div class="partner-card__photo" role="img" aria-label="${partner.name}">
      <svg class="partner-card__photo-svg" viewBox="0 0 240 160" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="${gradId}" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#0a3d6b"/>
            <stop offset="100%" stop-color="#0d5190"/>
          </linearGradient>
        </defs>
        <rect width="240" height="160" fill="url(#${gradId})"/>
        <path d="M0 110 Q30 100 60 110 Q90 120 120 110 Q150 100 180 110 Q210 120 240 110 L240 160 L0 160Z" fill="rgba(201,168,76,0.15)"/>
        <path d="M0 125 Q30 115 60 125 Q90 135 120 125 Q150 115 180 125 Q210 135 240 125 L240 160 L0 160Z" fill="rgba(201,168,76,0.10)"/>
        <text x="120" y="85" text-anchor="middle" font-family="Georgia,serif" font-size="48" fill="#c9a84c" opacity="0.9">${initials}</text>
        <text x="120" y="108" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" fill="rgba(255,255,255,0.5)" letter-spacing="3">SURF SCHOOL</text>
      </svg>
    </div>`;
}

// ── Credentials Badges ────────────────────────────────────────────────────
function generateCredentialsBadges(partner, lang) {
  const isEN = lang === 'en';
  const badges = [];
  if (partner.founded && partner.years_in_operation) {
    const label = isEN
      ? `Est. ${partner.founded} &middot; ${partner.years_in_operation} yrs`
      : `Desde ${partner.founded} &middot; ${partner.years_in_operation} anos`;
    badges.push(`<span class="partner-card__badge">${label}</span>`);
  }
  if (partner.tripadvisor_ranking_text) {
    badges.push(`<span class="partner-card__badge partner-card__badge--gold">${partner.tripadvisor_ranking_text}</span>`);
  }
  if (partner.fps_certified) {
    badges.push(`<span class="partner-card__badge">${isEN ? 'FPS Certified' : 'Certificada FPS'}</span>`);
  }
  if (!badges.length) return '';
  return `    <div class="partner-card__credentials">
      ${badges.join('\n      ')}
    </div>`;
}

// ── Rating Block ──────────────────────────────────────────────────────────
function generateRatingBlock(partner, lang) {
  const isEN = lang === 'en';
  const blocks = [];
  if (partner.tripadvisor_rating && partner.tripadvisor_url) {
    const reviewsLabel = isEN
      ? `(${partner.tripadvisor_reviews} reviews)`
      : `(${partner.tripadvisor_reviews} avalia&ccedil;&otilde;es)`;
    const on = isEN ? 'on Tripadvisor' : 'no Tripadvisor';
    blocks.push(`<div class="partner-card__rating">
      <a href="${partner.tripadvisor_url}" target="_blank" rel="noopener noreferrer">
        <strong>${partner.tripadvisor_rating}</strong> &#9733; ${on} <span>${reviewsLabel}</span>
      </a>
    </div>`);
  }
  if (partner.google_rating != null && partner.google_rating >= 4.0 && partner.google_maps_url) {
    const reviewsLabel = isEN
      ? `(${partner.google_reviews} reviews)`
      : `(${partner.google_reviews} avalia&ccedil;&otilde;es)`;
    const on = isEN ? 'on Google' : 'no Google';
    blocks.push(`<div class="partner-card__rating">
      <a href="${partner.google_maps_url}" target="_blank" rel="noopener noreferrer">
        <strong>${partner.google_rating}</strong> &#9733; ${on} <span>${reviewsLabel}</span>
      </a>
    </div>`);
  }
  return blocks.join('\n    ');
}

// ── Social Block ──────────────────────────────────────────────────────────
const SVG_PHONE = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 3.07 9.8 19.79 19.79 0 0 1 .07 1.18 2 2 0 0 1 2 0h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L6.09 7.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`;
const SVG_IG    = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>`;
const SVG_FB    = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>`;

function generateSocialBlock(partner) {
  const links = [];
  if (partner.phone) {
    const tel = partner.phone.replace(/\s/g, '');
    links.push(`<a href="tel:${tel}" class="partner-card__social-link">${SVG_PHONE} ${partner.phone}</a>`);
  }
  if (partner.instagram_url && partner.instagram) {
    links.push(`<a href="${partner.instagram_url}" target="_blank" rel="noopener noreferrer" class="partner-card__social-link">${SVG_IG} ${partner.instagram}</a>`);
  }
  if (partner.facebook_url) {
    links.push(`<a href="${partner.facebook_url}" target="_blank" rel="noopener noreferrer" class="partner-card__social-link">${SVG_FB} Facebook</a>`);
  }
  if (!links.length) return '';
  return `    <div class="partner-card__social">
      ${links.join('\n      ')}
    </div>`;
}

// ── Card Large ─────────────────────────────────────────────────────────────
function generateCardLarge(partner, lang, availablePraias, praiaNames) {
  const isEN = lang === 'en';
  const tagline = isEN ? partner.tagline_en : partner.tagline_pt;
  const regionUpper = partner.region.toUpperCase();

  let mediaClass = 'partner-card__media';
  let mediaInner;
  if (partner.photo_url && partner.photo_treatment === 'logo-on-navy') {
    mediaClass += ' partner-card__media--logo';
    const titleAttr = partner.photo_credit ? ` title="${partner.photo_credit}"` : '';
    mediaInner = `<img src="${partner.photo_url}" alt="Logo ${partner.name}" class="partner-card__logo" loading="lazy" width="518" height="518"${titleAttr}>`;
  } else if (partner.photo_url) {
    mediaInner = `<div class="partner-card__photo">
      <img class="partner-card__photo-img" src="${partner.photo_url}" alt="${partner.name}" loading="lazy"${partner.photo_credit ? ` title="${partner.photo_credit}"` : ''}>
    </div>`;
  } else {
    mediaInner = generateSVGPlaceholder(partner);
  }

  const verifiedLabel = isEN ? 'VERIFIED' : 'VERIFICADO';
  const verifiedSince = isEN
    ? 'Verified by PTH since May 2026'
    : 'Verificado pelo PTH desde maio de 2026';
  const websiteLabel = isEN ? 'Visit website &rarr;' : 'Visitar site &rarr;';

  const praiaLinks = partner.praias_associadas.map(slug => {
    const name = slugToName(slug, praiaNames);
    return availablePraias.has(slug)
      ? `<li><a href="/praias/${slug}">${name}</a></li>`
      : `<li>${name}</li>`;
  }).join('\n          ');

  const credentialsBlock = generateCredentialsBadges(partner, lang);
  const ratingBlock      = generateRatingBlock(partner, lang);
  const socialBlock      = generateSocialBlock(partner);

  return `<article class="partner-card partner-card--large" id="${partner.id}" itemscope itemtype="https://schema.org/SportsActivityLocation">
  <div class="${mediaClass}">
    ${mediaInner}
  </div>
  <div class="partner-card__body">
    <p class="partner-card__eyebrow">${verifiedLabel} &middot; ${regionUpper}</p>
    <h2 class="partner-card__name" itemprop="name">${partner.name}</h2>
    <p class="partner-card__tagline" itemprop="description">${tagline}</p>
    <div class="partner-card__meta">
      <span class="partner-card__location" itemprop="address">${partner.town}</span>
      <span class="partner-card__languages">${partner.languages.join(' &middot; ')}</span>
    </div>
    <ul class="partner-card__praias">
      ${praiaLinks}
    </ul>
    ${credentialsBlock}
    ${ratingBlock}
    ${socialBlock}
    <div class="partner-card__actions">
      <a href="${partner.website}" class="partner-card__cta" target="_blank" rel="noopener noreferrer" itemprop="url">${websiteLabel}</a>
    </div>
    <p class="partner-card__verified">${verifiedSince}</p>
  </div>
</article>`;
}

// ── Card Medium ────────────────────────────────────────────────────────────
function generateCardMedium(partner, lang, praiaNames) {
  const isEN = lang === 'en';
  const vitrinePath = isEN ? '/en/surf-schools' : '/escolas-de-surf';
  const partnerLabel = isEN ? 'VERIFIED PARTNER' : 'PARCEIRO VERIFICADO';
  const firstTwo = partner.praias_associadas.slice(0, 2).map(s => slugToName(s, praiaNames)).join(', ');
  const rest = partner.praias_associadas.length - 2;
  const praiaNote = isEN
    ? `Lessons at ${firstTwo} and ${rest} more beach${rest !== 1 ? 'es' : ''}`
    : `Aulas em ${firstTwo} e mais ${rest} praia${rest !== 1 ? 's' : ''}`;
  const shortDesc = isEN ? partner.tagline_en : partner.tagline_pt;

  const compactParts = [];
  if (partner.founded) compactParts.push(`Desde ${partner.founded}`);
  if (partner.tripadvisor_rating) compactParts.push(`${partner.tripadvisor_rating} &#9733; Tripadvisor`);
  const compactMeta = compactParts.length
    ? `\n    <p><small>${compactParts.join(' &middot; ')}</small></p>` : '';

  return `<aside class="partner-card partner-card--medium">
    <p class="partner-card__eyebrow">${partnerLabel}</p>
    <h3><a href="${vitrinePath}#${partner.id}">${partner.name}</a></h3>
    <p>${shortDesc}</p>${compactMeta}
    <p><small>${praiaNote}</small></p>
  </aside>`;
}

// ── JSON-LD ────────────────────────────────────────────────────────────────
function generateJsonLd(partners, lang) {
  const isEN = lang === 'en';
  const url = isEN
    ? 'https://www.portalturismoportugal.com/en/surf-schools'
    : 'https://www.portalturismoportugal.com/escolas-de-surf';
  const name = isEN
    ? 'Verified Surf Schools in Portugal'
    : 'Escolas de surf verificadas em Portugal';
  const desc = isEN
    ? 'Operators editorially assessed by Portugal Travel Hub.'
    : 'Operadores avaliados pela equipa editorial do Portugal Travel Hub.';

  const hasPart = partners.map(p => {
    const item = {
      '@type': 'SportsActivityLocation',
      '@id': `https://www.portalturismoportugal.com/escolas-de-surf#${p.id}`,
      'name': p.name,
      'description': isEN ? p.tagline_en : `${p.name} — ${p.town}, ${p.region}`,
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': p.town,
        'addressRegion': p.region,
        'addressCountry': 'PT'
      },
      'url': p.website,
      'sport': 'Surfing',
      'availableLanguage': p.languages.map(l => l.toLowerCase())
    };
    if (p.founded) item.foundingDate = String(p.founded);
    if (p.phone) item.telephone = p.phone;
    const sameAs = [p.instagram_url, p.facebook_url, p.tripadvisor_url].filter(Boolean);
    if (sameAs.length) item.sameAs = sameAs;
    if (p.tripadvisor_rating && p.tripadvisor_reviews) {
      item.aggregateRating = {
        '@type': 'AggregateRating',
        'ratingValue': String(p.tripadvisor_rating),
        'reviewCount': String(p.tripadvisor_reviews),
        'bestRating': '5',
        'worstRating': '1'
      };
    }
    if (p.fps_certified) {
      item.hasCredential = {
        '@type': 'EducationalOccupationalCredential',
        'name': 'Federação Portuguesa de Surf'
      };
    }
    return item;
  });

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        'name': name,
        'description': desc,
        'url': url,
        'inLanguage': isEN ? 'en' : 'pt-PT',
        'publisher': {
          '@type': 'Organization',
          'name': 'Portugal Travel Hub',
          'url': 'https://www.portalturismoportugal.com'
        },
        'hasPart': hasPart
      },
      {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': isEN ? 'Home' : 'Inicio', 'item': 'https://www.portalturismoportugal.com/' },
          { '@type': 'ListItem', 'position': 2, 'name': name, 'item': url }
        ]
      }
    ]
  };

  return `  <script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n  </script>`;
}

// ── NAV / FOOTER blocks (shared) ──────────────────────────────────────────
const NAV_COMMON_SCRIPTS = `<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
<script src="/js/nav.js?v=20260422c" defer></script>
<script src="/js/config.js?v=20260508-isactive" defer></script>
<script>
  document.getElementById('mob-menu-btn')?.addEventListener('click', (e) => { e.stopPropagation(); document.getElementById('nav-toggle').click(); });
</script>
<script>
  document.addEventListener('DOMContentLoaded', function () {
    var footerSearchForm = document.querySelector('.footer-search-form');
    if (footerSearchForm) {
      footerSearchForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var q = document.getElementById('footer-search-input')?.value.trim();
        if (q) window.location.href = '/beaches.html?q=' + encodeURIComponent(q);
      });
    }
  });
</script>`;

// ── Vitrine PT ─────────────────────────────────────────────────────────────
function generateVitrinePT(partners, availablePraias, praiaNames) {
  const cardsHTML = partners.map(p => generateCardLarge(p, 'pt', availablePraias, praiaNames)).join('\n\n');
  const jsonLd = generateJsonLd(partners, 'pt');

  return `<!DOCTYPE html>
<html lang="pt-PT">
<head>
  <meta charset="UTF-8">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <!-- META VERIFICATIONS — site ownership proofs for third-party services -->
  <meta name="verification" content="d0777839626596440c5ac94e27e8b9e8"> <!-- Awin -->
  <!-- /META VERIFICATIONS -->
  <!-- PWA -->
  <link rel="manifest" href="/manifest.webmanifest">
  <meta name="theme-color" content="#0a3d6b">
  <link rel="apple-touch-icon" href="/icons/icon-192.svg">
  <!-- Google tag (gtag.js) &ndash; Consent Mode v2 -->
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{analytics_storage:'denied',wait_for_update:500});</script>
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-8YBQEM613J"></script>
  <script>gtag('js',new Date());gtag('config','G-8YBQEM613J');</script>
  <title>Escolas de surf verificadas em Portugal &middot; Portugal Travel Hub</title>
  <meta name="description" content="Escolas de surf avaliadas editorialmente pelo Portugal Travel Hub. Cobramos pela verifica&ccedil;&atilde;o que fazemos &mdash; nunca por posi&ccedil;&atilde;o.">
  <link rel="canonical" href="https://www.portalturismoportugal.com/escolas-de-surf">
  <link rel="alternate" hreflang="pt-PT" href="https://www.portalturismoportugal.com/escolas-de-surf">
  <link rel="alternate" hreflang="en" href="https://www.portalturismoportugal.com/en/surf-schools">
  <link rel="alternate" hreflang="x-default" href="https://www.portalturismoportugal.com/escolas-de-surf">
  <meta name="robots" content="index, follow">
  <meta property="og:type" content="website">
  <meta property="og:title" content="Escolas de surf verificadas em Portugal &middot; Portugal Travel Hub">
  <meta property="og:description" content="Operadores avaliados editorialmente pelo Portugal Travel Hub. Cobramos pela verifica&ccedil;&atilde;o &mdash; nunca por posi&ccedil;&atilde;o.">
  <meta property="og:url" content="https://www.portalturismoportugal.com/escolas-de-surf">
  <meta property="og:locale" content="pt_PT">
  <meta property="og:site_name" content="Portugal Travel Hub">
  <meta property="og:image" content="https://www.portalturismoportugal.com/og-image.png">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Escolas de surf verificadas em Portugal &middot; Portugal Travel Hub">
  <meta name="twitter:description" content="Operadores avaliados editorialmente. Cobramos pela verifica&ccedil;&atilde;o &mdash; nunca por posi&ccedil;&atilde;o.">
  <meta name="twitter:image" content="https://www.portalturismoportugal.com/og-image.png">
  <meta name="twitter:url" content="https://www.portalturismoportugal.com/escolas-de-surf">
${jsonLd}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,600;0,6..96,700;1,6..96,600&family=IBM+Plex+Mono:wght@400&family=Inter:wght@400;500;600&display=optional" rel="stylesheet" media="print" onload="this.media='all'">
  <noscript><link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,600;0,6..96,700;1,6..96,600&family=IBM+Plex+Mono:wght@400&family=Inter:wght@400;500;600&display=optional" rel="stylesheet"></noscript>
  <link rel="preconnect" href="https://cdn.jsdelivr.net">
  <link rel="stylesheet" href="/css/style.css?v=20260520-qw5">
  <link rel="stylesheet" href="/css/partners-page.css?v=20260521-v2">
  <script src="/js/image-autofix.js"></script>
</head>
<body>

<a href="#main" class="skip-link">Saltar para o conte&uacute;do</a>

<!-- Navbar -->
<nav class="navbar" role="navigation" aria-label="Navega&ccedil;&atilde;o principal" id="navbar">

  <a href="/" class="nav-logo" aria-label="Portugal Travel Hub - Home">
    <div class="nav-logo-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
    </div>
    Portugal Travel Hub
  </a>

  <div class="nav-links" role="list">
    <a href="/beaches.html" role="listitem">Praias</a>
    <a href="/surf.html" role="listitem">Surf</a>
    <a href="/pesca.html" role="listitem">Pesca</a>
    <a href="/webcams.html" role="listitem">Webcams</a>
    <a href="/planear.html" role="listitem">Planear</a>
    <a href="/guias.html" role="listitem">Guias</a>
    <a href="/precos.html" role="listitem">Pre&ccedil;os</a>
    <a href="/parceiros.html" role="listitem">Parceiros</a>
  </div>

  <div class="nav-actions">
    <div class="lang-switcher" aria-label="Sele&ccedil;&atilde;o de idioma">
      <span class="lang-btn lang-btn--active" aria-current="true" hreflang="pt">PT</span>
      <span class="lang-sep" aria-hidden="true">|</span>
      <a href="/en/surf-schools.html" class="lang-btn" data-lang="en" onclick="try{localStorage.setItem('pth_lang','en')}catch(_){}" hreflang="en">EN</a>
    </div>
    <a href="/login.html" class="btn btn-outline" id="nav-login-btn">Entrar</a>
    <a href="/login.html#register" class="btn btn-primary" id="nav-register-btn">Registar</a>
    <button class="hamburger" type="button" id="nav-toggle" aria-label="Abrir menu" aria-expanded="false">
      <span></span>
      <span></span>
      <span></span>
    </button>
  </div>

</nav>

<main id="main">

  <section class="partners-hero">
    <div class="partners-hero__inner">
      <p class="partners-hero__eyebrow">VERIFICA&Ccedil;&Atilde;O EDITORIAL</p>
      <h1 class="partners-hero__title">Escolas de surf<br><em>verificadas em Portugal</em></h1>
      <p class="partners-hero__lead">Operadores avaliados pela equipa editorial do Portugal Travel Hub. Cobramos pela verifica&ccedil;&atilde;o que fazemos &mdash; nunca por posi&ccedil;&atilde;o.</p>
    </div>
  </section>

  <section class="partners-grid" aria-label="Escolas de surf verificadas">
    <div class="partners-grid__inner">

${cardsHTML}

    </div>
  </section>

  <section class="partners-methodology">
    <div class="partners-methodology__inner">
      <h2>O que verificamos</h2>
      <p>Cada escola no portal passou por um processo de verifica&ccedil;&atilde;o editorial: confirma&ccedil;&atilde;o de exist&ecirc;ncia e actividade, valida&ccedil;&atilde;o de localiza&ccedil;&atilde;o e praias servidas, e contacto directo com o operador. N&atilde;o aceitamos comiss&otilde;es por visitas ou reservas. Para saber mais sobre os nossos crit&eacute;rios, veja a nossa <a href="/metodologia-editorial.html">metodologia editorial</a>.</p>
    </div>
  </section>

  <section class="partners-cta-b2b">
    <div class="partners-cta-b2b__inner">
      <h2>&Eacute; escola, hotel ou operador?</h2>
      <p>Conhe&ccedil;a o nosso processo de parceria editorial.</p>
      <a href="/parceiros.html" class="btn-secondary">Saber mais &rarr;</a>
    </div>
  </section>

</main>

<footer class="footer" role="contentinfo">
  <div class="footer-grid">
    <div class="footer-brand">
      <div class="footer-logo">
        <div class="footer-logo-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
        </div>
        Portugal Travel Hub
      </div>
      <p class="footer-tagline">
        O portal de refer&ecirc;ncia de praias em Portugal &mdash; condi&ccedil;&otilde;es, webcams, surf, pesca e planeamento de viagens.
      </p>
      <form class="footer-search-form" role="search" aria-label="Pesquisar praia">
        <div class="footer-search-bar">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="search" id="footer-search-input" placeholder="Pesquisar praia..." aria-label="Pesquisar praia">
          <button type="submit" class="footer-search-btn" aria-label="Pesquisar">Ir</button>
        </div>
      </form>
    </div>

    <nav class="footer-col" aria-label="Destinos">
      <h3 class="footer-heading">Destinos</h3>
      <ul>
        <li><a href="/beaches.html?region=Algarve">Algarve</a></li>
        <li><a href="/beaches.html?region=Lisboa">Lisboa</a></li>
        <li><a href="/beaches.html?region=Porto">Porto</a></li>
        <li><a href="/beaches.html?region=Alentejo">Alentejo</a></li>
      </ul>
    </nav>

    <nav class="footer-col" aria-label="Portal">
      <h3 class="footer-heading">Portal</h3>
      <ul>
        <li><a href="/beaches.html">Praias</a></li>
        <li><a href="/webcams.html">Webcams</a></li>
        <li><a href="/surf.html">Surf</a></li>
        <li><a href="/pesca.html">Pesca</a></li>
        <li><a href="/planear.html">Planear Viagem</a></li>
      </ul>
    </nav>

    <nav class="footer-col" aria-label="Parceiros &amp; Ajuda">
      <h3 class="footer-heading">Parceiros &amp; Ajuda</h3>
      <ul>
        <li><a href="/parceiros.html">Parceiros</a></li>
        <li><a href="/media-kit.html">Media Kit</a></li>
        <li><a href="/sobre.html">Sobre N&oacute;s</a></li>
        <li><a href="/contact.html">Contacto</a></li>
        <li><a href="/privacidade.html">Privacidade</a></li>
      </ul>
    </nav>
  </div>

  <div class="footer-bottom">
    <span>&copy; 2026 Portugal Travel Hub. Todos os direitos reservados.</span>
    <span><a href="/sobre.html">Sobre</a> &middot; <a href="/metodologia-editorial.html">Metodologia</a> &middot; <a href="/transparencia-comercial.html">Transpar&ecirc;ncia</a> &middot; <a href="/contact.html">Contacto</a> &middot; <a href="/privacidade.html">Privacidade</a> &middot; <a href="/refund-policy.html">Pol&iacute;tica de Reembolso</a> &middot; <a href="/termos.html">Termos</a> &middot; <a href="/cookies.html">Cookies</a></span>
  </div>
</footer>

<!-- Mobile bottom nav -->
<nav class="mobile-bottom-nav" aria-label="Navega&ccedil;&atilde;o r&aacute;pida">
  <div class="mobile-bottom-nav-inner">
    <a href="/" class="mobile-nav-item" aria-label="In&iacute;cio">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12L12 3l9 9"/><path d="M9 21V12h6v9"/></svg>
      In&iacute;cio
    </a>
    <a href="/beaches.html" class="mobile-nav-item" aria-label="Praias">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 14c0 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2"/><path d="M2 20c0 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2"/><line x1="12" y1="2" x2="12" y2="10"/></svg>
      Praias
    </a>
    <a href="/surf.html" class="mobile-nav-item" aria-label="Surf">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12c0 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2"/><path d="M8 6l4-4 4 4"/></svg>
      Surf
    </a>
    <button class="mobile-nav-item" id="mob-menu-btn" aria-label="Abrir menu">
      <svg viewBox="0 0 24 24" aria-hidden="true"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      Menu
    </button>
  </div>
</nav>

${NAV_COMMON_SCRIPTS}
</body>
</html>`;
}

// ── Vitrine EN ─────────────────────────────────────────────────────────────
function generateVitrineEN(partners, availablePraias, praiaNames) {
  const cardsHTML = partners.map(p => generateCardLarge(p, 'en', availablePraias, praiaNames)).join('\n\n');
  const jsonLd = generateJsonLd(partners, 'en');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <!-- META VERIFICATIONS — site ownership proofs for third-party services -->
  <meta name="verification" content="d0777839626596440c5ac94e27e8b9e8"> <!-- Awin -->
  <!-- /META VERIFICATIONS -->
  <!-- PWA -->
  <link rel="manifest" href="/manifest.webmanifest">
  <meta name="theme-color" content="#0a3d6b">
  <link rel="apple-touch-icon" href="/icons/icon-192.svg">
  <!-- Google tag (gtag.js) &ndash; Consent Mode v2 -->
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{analytics_storage:'denied',wait_for_update:500});</script>
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-8YBQEM613J"></script>
  <script>gtag('js',new Date());gtag('config','G-8YBQEM613J');</script>
  <title>Verified Surf Schools in Portugal &middot; Portugal Travel Hub</title>
  <meta name="description" content="Surf schools editorially verified by Portugal Travel Hub. We charge for the verification we do &mdash; never for position.">
  <link rel="canonical" href="https://www.portalturismoportugal.com/en/surf-schools">
  <link rel="alternate" hreflang="en" href="https://www.portalturismoportugal.com/en/surf-schools">
  <link rel="alternate" hreflang="pt-PT" href="https://www.portalturismoportugal.com/escolas-de-surf">
  <link rel="alternate" hreflang="x-default" href="https://www.portalturismoportugal.com/escolas-de-surf">
  <meta name="robots" content="index, follow">
  <meta property="og:type" content="website">
  <meta property="og:title" content="Verified Surf Schools in Portugal &middot; Portugal Travel Hub">
  <meta property="og:description" content="Operators editorially assessed by Portugal Travel Hub. We charge for verification &mdash; never for position.">
  <meta property="og:url" content="https://www.portalturismoportugal.com/en/surf-schools">
  <meta property="og:locale" content="en_GB">
  <meta property="og:site_name" content="Portugal Travel Hub">
  <meta property="og:image" content="https://www.portalturismoportugal.com/og-image.png">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Verified Surf Schools in Portugal &middot; Portugal Travel Hub">
  <meta name="twitter:description" content="Operators editorially assessed by Portugal Travel Hub.">
  <meta name="twitter:image" content="https://www.portalturismoportugal.com/og-image.png">
  <meta name="twitter:url" content="https://www.portalturismoportugal.com/en/surf-schools">
${jsonLd}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,600;0,6..96,700;1,6..96,600&family=IBM+Plex+Mono:wght@400&family=Inter:wght@400;500;600&display=optional" rel="stylesheet" media="print" onload="this.media='all'">
  <noscript><link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,600;0,6..96,700;1,6..96,600&family=IBM+Plex+Mono:wght@400&family=Inter:wght@400;500;600&display=optional" rel="stylesheet"></noscript>
  <link rel="preconnect" href="https://cdn.jsdelivr.net">
  <link rel="stylesheet" href="/css/style.css?v=20260520-qw5">
  <link rel="stylesheet" href="/css/partners-page.css?v=20260521-v2">
  <script src="/js/image-autofix.js"></script>
</head>
<body>

<a href="#main" class="skip-link">Skip to content</a>

<!-- Navbar -->
<nav class="navbar" role="navigation" aria-label="Main navigation" id="navbar">

  <a href="/" class="nav-logo" aria-label="Portugal Travel Hub - Home">
    <div class="nav-logo-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
    </div>
    Portugal Travel Hub
  </a>

  <div class="nav-links" role="list">
    <a href="/en/beaches.html" role="listitem">Beaches</a>
    <a href="/en/surf.html" role="listitem">Surf</a>
    <a href="/en/pesca.html" role="listitem">Fishing</a>
    <a href="/en/webcams.html" role="listitem">Webcams</a>
    <a href="/planear.html" role="listitem">Plan</a>
    <a href="/en/guides.html" role="listitem">Guides</a>
    <a href="/precos.html" role="listitem">Pricing</a>
    <a href="/en/parceiros.html" role="listitem">Partners</a>
  </div>

  <div class="nav-actions">
    <div class="lang-switcher" aria-label="Language selection">
      <a href="/escolas-de-surf.html" class="lang-btn" data-lang="pt" onclick="try{localStorage.setItem('pth_lang','pt')}catch(_){}" hreflang="pt">PT</a>
      <span class="lang-sep" aria-hidden="true">|</span>
      <span class="lang-btn lang-btn--active" aria-current="true" hreflang="en">EN</span>
    </div>
    <a href="/en/login.html" class="btn btn-outline" id="nav-login-btn">Sign in</a>
    <a href="/en/login.html#register" class="btn btn-primary" id="nav-register-btn">Register</a>
    <button class="hamburger" type="button" id="nav-toggle" aria-label="Open menu" aria-expanded="false">
      <span></span>
      <span></span>
      <span></span>
    </button>
  </div>

</nav>

<main id="main">

  <section class="partners-hero">
    <div class="partners-hero__inner">
      <p class="partners-hero__eyebrow">EDITORIAL VERIFICATION</p>
      <h1 class="partners-hero__title">Surf schools<br><em>verified in Portugal</em></h1>
      <p class="partners-hero__lead">Operators assessed by the Portugal Travel Hub editorial team. We charge for the verification we do &mdash; never for position.</p>
    </div>
  </section>

  <section class="partners-grid" aria-label="Verified surf schools">
    <div class="partners-grid__inner">

${cardsHTML}

    </div>
  </section>

  <section class="partners-methodology">
    <div class="partners-methodology__inner">
      <h2>What we verify</h2>
      <p>Every school listed here has passed our editorial verification: confirming existence and activity, validating location and beaches served, and direct contact with the operator. We do not accept commissions on visits or bookings. To learn more about our criteria, see our <a href="/en/methodology.html">editorial methodology</a>.</p>
    </div>
  </section>

  <section class="partners-cta-b2b">
    <div class="partners-cta-b2b__inner">
      <h2>Are you a school, hotel or operator?</h2>
      <p>Learn about our editorial partnership process.</p>
      <a href="/en/parceiros.html" class="btn-secondary">Learn more &rarr;</a>
    </div>
  </section>

</main>

<footer class="footer" role="contentinfo">
  <div class="footer-grid">
    <div class="footer-brand">
      <div class="footer-logo">
        <div class="footer-logo-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
        </div>
        Portugal Travel Hub
      </div>
      <p class="footer-tagline">
        Portugal&rsquo;s reference portal for beaches &mdash; conditions, webcams, surf, fishing and trip planning.
      </p>
      <form class="footer-search-form" role="search" aria-label="Search beach">
        <div class="footer-search-bar">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="search" id="footer-search-input" placeholder="Search beach..." aria-label="Search beach">
          <button type="submit" class="footer-search-btn" aria-label="Search">Go</button>
        </div>
      </form>
    </div>

    <nav class="footer-col" aria-label="Destinations">
      <h3 class="footer-heading">Destinations</h3>
      <ul>
        <li><a href="/en/beaches.html?region=Algarve">Algarve</a></li>
        <li><a href="/en/beaches.html?region=Lisboa">Lisbon</a></li>
        <li><a href="/en/beaches.html?region=Porto">Porto</a></li>
        <li><a href="/en/beaches.html?region=Alentejo">Alentejo</a></li>
      </ul>
    </nav>

    <nav class="footer-col" aria-label="Portal">
      <h3 class="footer-heading">Portal</h3>
      <ul>
        <li><a href="/en/beaches.html">Beaches</a></li>
        <li><a href="/en/webcams.html">Webcams</a></li>
        <li><a href="/en/surf.html">Surf</a></li>
        <li><a href="/en/pesca.html">Fishing</a></li>
        <li><a href="/planear.html">Plan a Trip</a></li>
      </ul>
    </nav>

    <nav class="footer-col" aria-label="Partners &amp; Help">
      <h3 class="footer-heading">Partners &amp; Help</h3>
      <ul>
        <li><a href="/en/parceiros.html">Partners</a></li>
        <li><a href="/en/media-kit.html">Media Kit</a></li>
        <li><a href="/en/our-story.html">About Us</a></li>
        <li><a href="/en/contact.html">Contact</a></li>
        <li><a href="/en/cookies.html">Privacy</a></li>
      </ul>
    </nav>
  </div>

  <div class="footer-bottom">
    <span>&copy; 2026 Portugal Travel Hub. All rights reserved.</span>
    <span><a href="/en/our-story.html">About</a> &middot; <a href="/en/methodology.html">Methodology</a> &middot; <a href="/transparencia-comercial.html">Transparency</a> &middot; <a href="/en/contact.html">Contact</a> &middot; <a href="/en/cookies.html">Privacy</a> &middot; <a href="/refund-policy.html">Refund Policy</a> &middot; <a href="/termos.html">Terms</a> &middot; <a href="/en/cookies.html">Cookies</a></span>
  </div>
</footer>

<!-- Mobile bottom nav -->
<nav class="mobile-bottom-nav" aria-label="Quick navigation">
  <div class="mobile-bottom-nav-inner">
    <a href="/" class="mobile-nav-item" aria-label="Home">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12L12 3l9 9"/><path d="M9 21V12h6v9"/></svg>
      Home
    </a>
    <a href="/en/beaches.html" class="mobile-nav-item" aria-label="Beaches">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 14c0 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2"/><path d="M2 20c0 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2"/><line x1="12" y1="2" x2="12" y2="10"/></svg>
      Beaches
    </a>
    <a href="/en/surf.html" class="mobile-nav-item" aria-label="Surf">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12c0 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2"/><path d="M8 6l4-4 4 4"/></svg>
      Surf
    </a>
    <button class="mobile-nav-item" id="mob-menu-btn" aria-label="Open menu">
      <svg viewBox="0 0 24 24" aria-hidden="true"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      Menu
    </button>
  </div>
</nav>

${NAV_COMMON_SCRIPTS}
</body>
</html>`;
}

// ── Inject into page ───────────────────────────────────────────────────────
async function injectIntoPage(target, sectionHTML, dryRun) {
  const { file, marker_start, marker_end, insert_before_if_missing } = target;
  const filePath = join(ROOT, file);

  let content;
  try {
    content = await readFile(filePath, 'utf-8');
  } catch {
    err(`Cannot read ${file}`);
    return { status: 'error', file };
  }

  const startMarker = marker_start;
  const endMarker = marker_end;

  // Markers already exist — replace content between them (idempotent)
  if (content.includes(startMarker)) {
    const startIdx = content.indexOf(startMarker);
    const endIdx = content.indexOf(endMarker, startIdx);
    if (endIdx === -1) {
      warn(`${file}: start marker found but end marker missing`);
      return { status: 'warn', file, reason: 'missing-end-marker' };
    }
    const newContent =
      content.slice(0, startIdx + startMarker.length) +
      '\n' + sectionHTML + '\n' +
      content.slice(endIdx);

    if (dryRun) {
      const dest = join(DRYRUN_DIR, file.replace(/[\\/]/g, '_'));
      await mkdir(DRYRUN_DIR, { recursive: true });
      await writeFile(dest, newContent, 'utf-8');
    } else {
      await backupFile(filePath);
      await writeFile(filePath, newContent, 'utf-8');
    }
    const lines = sectionHTML.split('\n').length;
    info(`Injected into ${file} (markers existed, ${lines} lines)`);
    return { status: 'ok', file, lines };
  }

  // No markers — need --inject flag to create them
  if (!INJECT && dryRun === false) {
    warn(`${file}: no markers found — run with --inject to create`);
    return { status: 'warn', file, reason: 'no-markers' };
  }

  // --inject mode or dry-run with injection preview
  const anchor = insert_before_if_missing;
  if (!anchor || !content.includes(anchor)) {
    warn(`${file}: anchor '${anchor}' not found — skipped`);
    return { status: 'warn', file, reason: 'anchor-not-found' };
  }

  const anchorIdx = content.indexOf(anchor);
  const insertion = '\n' + startMarker + '\n' + sectionHTML + '\n' + endMarker + '\n';
  const newContent = content.slice(0, anchorIdx) + insertion + content.slice(anchorIdx);

  if (dryRun) {
    const dest = join(DRYRUN_DIR, file.replace(/[\\/]/g, '_'));
    await mkdir(DRYRUN_DIR, { recursive: true });
    await writeFile(dest, newContent, 'utf-8');
    info(`[DRY-RUN] ${file}: markers would be created before '${anchor.slice(0, 40)}'`);
  } else {
    await backupFile(filePath);
    await writeFile(filePath, newContent, 'utf-8');
    info(`${file}: markers created and content injected`);
  }
  const lines = sectionHTML.split('\n').length;
  return { status: 'ok', file, lines, created: true };
}

// ── Update sitemap ─────────────────────────────────────────────────────────
async function updateSitemap(urls, dryRun) {
  const sitemapPath = join(ROOT, 'sitemap.xml');
  let content;
  try {
    content = await readFile(sitemapPath, 'utf-8');
  } catch {
    warn('sitemap.xml not found — skipping');
    return 0;
  }

  let added = 0;
  for (const { loc, lastmod, changefreq, priority } of urls) {
    if (content.includes(loc)) {
      info(`Sitemap: ${loc} already present — skip`);
      continue;
    }
    const entry = `\n  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
    content = content.replace('</urlset>', entry + '\n</urlset>');
    added++;
    info(`Sitemap: +${loc}`);
  }

  if (added > 0) {
    if (dryRun) {
      const dest = join(DRYRUN_DIR, 'sitemap.xml');
      await mkdir(DRYRUN_DIR, { recursive: true });
      await writeFile(dest, content, 'utf-8');
    } else {
      await writeFile(sitemapPath, content, 'utf-8');
    }
  }
  return added;
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n=== BUILD PARTNERS ===');
  if (DRY_RUN) info('Mode: DRY-RUN (writes to _diag/dry-run-partners/)');
  if (CHECK)   info('Mode: CHECK (validate only, no writes)');
  if (INJECT)  info('Mode: INJECT (will create markers in target pages)');
  if (!DRY_RUN && !CHECK && !INJECT) info('Mode: FULL BUILD');

  // 1. Read data
  let data;
  try {
    data = JSON.parse(await readFile(DATA_FILE, 'utf-8'));
    info(`Loaded ${DATA_FILE} — ${data.partners.length} partner(s)`);
  } catch (e) {
    err(`Cannot read partners.json: ${e.message}`);
    process.exit(1);
  }

  if (CHECK) {
    info('JSON valid.');
    data.partners.forEach(p => info(`  - ${p.id} | tier: ${p.tier} | praias: ${p.praias_associadas.length}`));
    return;
  }

  // 2. Validate praias slugs
  const availablePraias = await getPraiasSlugs();
  const warnings = [];

  for (const p of data.partners) {
    const confirmed = p.praias_associadas.filter(s => availablePraias.has(s));
    const missing   = p.praias_associadas.filter(s => !availablePraias.has(s));
    info(`${p.id}: ${p.praias_associadas.length} declared, ${confirmed.length} confirmed in /praias/`);
    if (missing.length > 0) {
      missing.forEach(s => {
        warn(`  ${p.id}: '${s}' NOT in /praias/ — renders as text (no link)`);
        warnings.push(`${p.id}: slug '${s}' missing in /praias/`);
      });
    }
  }

  // 3. Generate vitrine pages
  const praiaNames = data.praia_names || {};
  const vitrinePT = generateVitrinePT(data.partners, availablePraias, praiaNames);
  const vitrineEN = generateVitrineEN(data.partners, availablePraias, praiaNames);
  const ptSize = Buffer.byteLength(vitrinePT, 'utf-8');
  const enSize = Buffer.byteLength(vitrineEN, 'utf-8');

  await writeOutput('escolas-de-surf.html', vitrinePT);
  await writeOutput('en/surf-schools.html', vitrineEN);

  // 4. Validate vitrine HTML
  const ptValid = await validateHTML('escolas-de-surf.html');
  const enValid = await validateHTML('en/surf-schools.html');

  // 5. Injection targets
  const injectResults = [];

  for (const target of data.injection_targets) {
    const { context, filter, lang, max_cards, section_title_pt, section_title_en } = target;

    const filtered = data.partners.filter(p => {
      if (filter.region_slug && p.region_slug !== filter.region_slug) return false;
      if (filter.especialidade_includes && !p.especialidade.includes(filter.especialidade_includes)) return false;
      return true;
    });

    if (filtered.length === 0) {
      warn(`No partners match filter for context '${context}'`);
      injectResults.push({ status: 'warn', file: target.file, reason: 'no-match' });
      continue;
    }

    const sectionTitle = lang === 'en' ? section_title_en : section_title_pt;
    const cardsHTML = filtered
      .slice(0, max_cards)
      .map(p => generateCardMedium(p, lang, praiaNames))
      .join('\n');

    const sectionHTML = `<section class="partners-mentions">
  <h2 class="sec-title">${sectionTitle}</h2>
${cardsHTML}
</section>`;

    const result = await injectIntoPage(target, sectionHTML, DRY_RUN);
    injectResults.push(result);

    if (!DRY_RUN && result.status === 'ok') {
      await validateHTML(target.file);
    }
  }

  // 6. Sitemap
  const sitemapUrls = [
    { loc: 'https://www.portalturismoportugal.com/escolas-de-surf',  lastmod: '2026-05-21', changefreq: 'weekly', priority: '0.8' },
    { loc: 'https://www.portalturismoportugal.com/en/surf-schools',  lastmod: '2026-05-21', changefreq: 'weekly', priority: '0.8' }
  ];
  const sitemapAdded = await updateSitemap(sitemapUrls, DRY_RUN);

  // 7. Print summary
  console.log('\n=== BUILD PARTNERS SUMMARY ===');
  console.log(`Parceiros processados: ${data.partners.length}`);
  data.partners.forEach(p => {
    const c = p.praias_associadas.filter(s => availablePraias.has(s)).length;
    console.log(`  ${p.id}: ${p.praias_associadas.length} praias declaradas, ${c} confirmadas em /praias/`);
  });

  console.log('\nPáginas geradas:');
  console.log(`  ${ptValid ? '✓' : '⚠'} escolas-de-surf.html (${ptSize} B, JSON-LD OK, hreflang OK)`);
  console.log(`  ${enValid ? '✓' : '⚠'} en/surf-schools.html (${enSize} B, JSON-LD OK, hreflang OK)`);

  console.log('\nPáginas editadas (injeção):');
  for (const r of injectResults) {
    const icon = r.status === 'ok' ? '✓' : '⚠';
    const note = r.reason  ? ` — ${r.reason}` :
                 r.created ? ` (marcadores criados, ${r.lines} linhas)` :
                 r.lines   ? ` (${r.lines} linhas injectadas)` : '';
    console.log(`  ${icon} ${r.file}${note}`);
  }

  console.log(`\nSitemap actualizado: +${sitemapAdded} URL(s)`);

  if (warnings.length > 0) {
    console.log('\nAvisos:');
    warnings.forEach(w => console.log(`  ⚠ ${w}`));
  }

  const outputDir = DRY_RUN ? DRYRUN_DIR : ROOT;
  console.log(`\nOutput: ${outputDir}`);
  console.log('=== DONE ===\n');
}

main().catch(e => { console.error('[FATAL]', e.message); process.exit(1); });
