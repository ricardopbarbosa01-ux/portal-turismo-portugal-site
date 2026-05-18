/**
 * tests/prerender-googlebot.spec.ts
 *
 * Simulates Googlebot (JavaScript disabled) crawling pre-rendered /praias/ pages.
 * Validates that SEO-critical content (h1, description, canonical, Schema.org) is
 * present in the initial HTML without requiring JavaScript execution.
 *
 * Depends on:
 *   - praias/*.html (30 generated static files)
 *   - PLAYWRIGHT_BASE_URL pointing to a server that serves static files
 *
 * Run:
 *   npx playwright test tests/prerender-googlebot.spec.ts --reporter=line
 */

import { test, expect } from '@playwright/test';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');
const PRAIAS_DIR = join(PROJECT_ROOT, 'praias');

// Base URL — uses PLAYWRIGHT_BASE_URL env var or falls back to localhost for local testing
const BASE = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

// ── Sample beaches used in browser-based tests ────────────────────────────
// All three are Algarve beaches from the generated top 30
const SAMPLES = [
  {
    slug: 'praia-do-camilo',
    name_pt: 'Praia do Camilo',
    region: 'Algarve',
    supabase_id: 'd9af39d6-f9ae-483d-ab1d-e48a026dfd53'
  },
  {
    slug: 'praia-da-marinha',
    name_pt: 'Praia da Marinha',
    region: 'Algarve',
    supabase_id: '' // used only for structural tests
  },
  {
    slug: 'praia-de-benagil',
    name_pt: 'Praia de Benagil',
    region: 'Algarve',
    supabase_id: '' // used only for structural tests
  }
];

// ── File-system tests (no server required) ────────────────────────────────
test.describe('Pre-rendered beach pages — file-system checks (no server)', () => {

  test('All 30 generated files exist in praias/', () => {
    expect(existsSync(PRAIAS_DIR), `praias/ directory must exist`).toBe(true);
    const files = readdirSync(PRAIAS_DIR).filter(f => f.endsWith('.html'));
    expect(files.length).toBe(30);
  });

  test('All 30 generated files have no unresolved {{...}} placeholders', () => {
    expect(existsSync(PRAIAS_DIR), `praias/ directory must exist`).toBe(true);
    const files = readdirSync(PRAIAS_DIR).filter(f => f.endsWith('.html'));
    expect(files.length).toBe(30);
    for (const f of files) {
      const content = readFileSync(join(PRAIAS_DIR, f), 'utf8');
      expect(
        content,
        `${f} contains unresolved {{ placeholder — script may have missed a substitution`
      ).not.toMatch(/\{\{[^}]+\}\}/);
    }
  });

  test('praia-do-camilo.html: canonical has no .html suffix', () => {
    const content = readFileSync(join(PRAIAS_DIR, 'praia-do-camilo.html'), 'utf8');
    expect(content).toContain(
      'href="https://www.portalturismoportugal.com/praias/praia-do-camilo"'
    );
    // Ensure the canonical does NOT end with .html
    expect(content).not.toContain(
      'href="https://www.portalturismoportugal.com/praias/praia-do-camilo.html"'
    );
  });

  test('praia-do-camilo.html: Schema.org Beach has numeric lat/lng (not placeholders)', () => {
    const content = readFileSync(join(PRAIAS_DIR, 'praia-do-camilo.html'), 'utf8');
    // Extract JSON-LD blocks
    const ldBlocks = [...content.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
      .map(m => m[1].trim());
    expect(ldBlocks.length).toBeGreaterThanOrEqual(3);
    const types = ldBlocks.map(s => JSON.parse(s)['@type']);
    expect(types).toContain('Beach');
    expect(types).toContain('LocalBusiness');
    expect(types).toContain('BreadcrumbList');
    const beachLd = ldBlocks.map(s => JSON.parse(s)).find(o => o['@type'] === 'Beach');
    expect(beachLd).toBeDefined();
    expect(typeof beachLd!.geo.latitude).toBe('number');
    expect(typeof beachLd!.geo.longitude).toBe('number');
  });

  test('praia-do-camilo.html: GYG affiliate link is Algarve campaign', () => {
    const content = readFileSync(join(PRAIAS_DIR, 'praia-do-camilo.html'), 'utf8');
    expect(content).toContain('partner_id=0WTBHZE');
    expect(content).toContain('cmp=pthcard-algarve');
    expect(content).toContain('data-track="gyg-static-praia"');
    expect(content).toContain('rel="sponsored noopener noreferrer"');
  });

  test('praia-do-camilo.html: Amazon OneLink block present', () => {
    const content = readFileSync(join(PRAIAS_DIR, 'praia-do-camilo.html'), 'utf8');
    expect(content).toContain('pthportugal-21');
    expect(content).toContain('z-eu.associates-amazon.com');
  });

});

// ── Browser-based tests with JavaScript DISABLED (Googlebot simulation) ───
test.describe('Pre-rendered beach pages — Googlebot simulation (no JS)', () => {
  // Disable JavaScript for entire describe block — simulates Googlebot first-pass
  test.use({ javaScriptEnabled: false });

  for (const sample of SAMPLES) {
    test(`${sample.slug}: h1 visible without JS`, async ({ page }) => {
      await page.goto(`${BASE}/praias/${sample.slug}.html`);
      const h1 = page.locator('h1').first();
      await expect(h1).toContainText(sample.name_pt);
    });

    test(`${sample.slug}: meta description contains "Conheça" or "verificadas"`, async ({ page }) => {
      await page.goto(`${BASE}/praias/${sample.slug}.html`);
      const desc = await page.locator('meta[name="description"]').getAttribute('content');
      expect(desc).toBeTruthy();
      expect(desc!).toMatch(/Conheça|verificadas/);
    });

    test(`${sample.slug}: canonical without .html`, async ({ page }) => {
      await page.goto(`${BASE}/praias/${sample.slug}.html`);
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonical).toBe(
        `https://www.portalturismoportugal.com/praias/${sample.slug}`
      );
      expect(canonical).not.toMatch(/\.html$/);
    });

    test(`${sample.slug}: Schema.org Beach + LocalBusiness + BreadcrumbList inline`, async ({ page }) => {
      await page.goto(`${BASE}/praias/${sample.slug}.html`);
      const ldJsonBlocks = await page.locator('script[type="application/ld+json"]').allTextContents();
      expect(ldJsonBlocks.length).toBeGreaterThanOrEqual(3);
      const parsed = ldJsonBlocks.map(s => JSON.parse(s));
      const types = parsed.map(o => o['@type']);
      expect(types).toContain('Beach');
      expect(types).toContain('LocalBusiness');
      expect(types).toContain('BreadcrumbList');
      const beachLd = parsed.find(o => o['@type'] === 'Beach');
      expect(beachLd).toBeDefined();
      // lat/lng must be numbers (not string placeholders)
      expect(typeof beachLd!.geo.latitude).toBe('number');
      expect(typeof beachLd!.geo.longitude).toBe('number');
    });
  }

  test('praia-do-camilo: GYG affiliate link is Algarve campaign (browser)', async ({ page }) => {
    await page.goto(`${BASE}/praias/praia-do-camilo.html`);
    const gyg = page.locator('a[data-track="gyg-static-praia"]').first();
    await expect(gyg).toHaveAttribute('href', /partner_id=0WTBHZE/);
    await expect(gyg).toHaveAttribute('href', /cmp=pthcard-algarve/);
    await expect(gyg).toHaveAttribute('rel', /sponsored/);
  });

});
