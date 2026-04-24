/**
 * tests/visual/helpers.js — Utilitários para auditoria visual automática
 *
 * Depende de: @playwright/test (page object passado externamente)
 */

const path = require('path');
const fs = require('fs');

const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');

/**
 * Garante que o diretório de screenshots existe.
 */
function ensureScreenshotsDir() {
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }
}

/**
 * Navega para uma URL, aplica zoom via CSS transform no <body>,
 * e captura screenshot full-page.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} url - URL completa da página
 * @param {number} zoom - Percentagem (ex: 80, 100, 125)
 * @param {string} label - Sufixo para o nome do ficheiro
 * @returns {Promise<string>} Caminho absoluto do screenshot
 */
async function captureAtZoom(page, url, zoom, label) {
  ensureScreenshotsDir();

  await page.goto(url, { waitUntil: 'networkidle' });

  const scale = zoom / 100;

  // Aplica zoom via CSS transform no body — preserva layout real
  await page.evaluate((s) => {
    document.body.style.transformOrigin = 'top left';
    document.body.style.transform = `scale(${s})`;
    document.body.style.width = `${(1 / s) * 100}%`;
  }, scale);

  // Aguarda estabilização após transform
  await page.waitForTimeout(300);

  const safeName = label || url.replace(/[^a-z0-9]/gi, '-').replace(/-+/g, '-');
  const filename = `${safeName}-${zoom}pct.png`;
  const outputPath = path.join(SCREENSHOTS_DIR, filename);

  await page.screenshot({ path: outputPath, fullPage: true });

  return outputPath;
}

/**
 * Extrai cores de texto e fundo de um elemento, percorrendo os ancestors
 * para encontrar o fundo efectivo. Detecta background-image e overlays
 * semi-transparentes que tornam a medição automática impossível.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} selector
 * @returns {Promise<{
 *   color: string,
 *   backgroundColor: string,
 *   effectiveBackgroundColor: string|null,
 *   measurementPossible: boolean,
 *   reason?: string
 * }|null>}
 */
async function extractColors(page, selector) {
  return await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;

    const style = window.getComputedStyle(el);
    const color = style.color;
    const backgroundColor = style.backgroundColor;

    function parseAlpha(cssColor) {
      const m = cssColor.match(/rgba\(\s*[\d.]+,\s*[\d.]+,\s*[\d.]+,\s*([\d.]+)\s*\)/);
      return m ? parseFloat(m[1]) : null;
    }

    // Detecta se um nó tem filhos absolutamente posicionados que formam o fundo visual
    // (padrões hero: <video position:absolute>, overlay div, bg image absolutamente posicionada)
    function hasAbsoluteLayers(node) {
      return Array.from(node.children).some((child) => {
        const cs = window.getComputedStyle(child);
        if (cs.position !== 'absolute' && cs.position !== 'fixed') return false;
        // Elemento media (video, img, canvas) = fundo visual
        if (['VIDEO', 'IMG', 'CANVAS'].includes(child.tagName)) return true;
        // Div/element com background = overlay
        const bg = cs.backgroundColor;
        const bgImg = cs.backgroundImage;
        if (bgImg && bgImg !== 'none') return true;
        if (!bg || bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') return false;
        const alpha = parseAlpha(bg);
        return alpha === null || alpha > 0.05; // ignorar alpha quase zero
      });
    }

    let node = el;
    while (node && node !== document.documentElement) {
      const ns = window.getComputedStyle(node);

      // CSS background-image (gradiente, url()) — impossível medir
      const bgImg = ns.backgroundImage;
      if (bgImg && bgImg !== 'none') {
        return { color, backgroundColor, effectiveBackgroundColor: null, measurementPossible: false, reason: 'background_image' };
      }

      // Filhos absolutamente posicionados que formam fundo visual (video hero, overlay)
      if (hasAbsoluteLayers(node)) {
        return { color, backgroundColor, effectiveBackgroundColor: null, measurementPossible: false, reason: 'absolute_background_layer' };
      }

      const bgColor = ns.backgroundColor;

      if (!bgColor || bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent') {
        node = node.parentElement;
        continue;
      }

      const alpha = parseAlpha(bgColor);
      if (alpha !== null && alpha < 0.95) {
        // Overlay semi-transparente — fundo real depende do que está por baixo
        return { color, backgroundColor, effectiveBackgroundColor: null, measurementPossible: false, reason: 'transparent_overlay' };
      }

      return { color, backgroundColor, effectiveBackgroundColor: bgColor, measurementPossible: true };
    }

    return { color, backgroundColor, effectiveBackgroundColor: 'rgb(255, 255, 255)', measurementPossible: true };
  }, selector);
}

/**
 * Converte string CSS rgb/rgba para array [r, g, b].
 *
 * @param {string} cssColor - Ex: "rgb(10, 61, 107)"
 * @returns {number[]}
 */
function parseRgb(cssColor) {
  const match = cssColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return [0, 0, 0];
  return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
}

/**
 * Calcula luminância relativa de uma cor RGB (fórmula WCAG 2.1).
 *
 * @param {number[]} rgb - Array [r, g, b] 0-255
 * @returns {number} Luminância 0-1
 */
function relativeLuminance(rgb) {
  const [r, g, b] = rgb.map((c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calcula o rácio de contraste WCAG entre duas cores CSS.
 *
 * @param {string} color1 - CSS rgb string
 * @param {string} color2 - CSS rgb string
 * @returns {number} Rácio (ex: 4.5 significa 4.5:1)
 */
function calculateContrast(color1, color2) {
  const l1 = relativeLuminance(parseRgb(color1));
  const l2 = relativeLuminance(parseRgb(color2));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return parseFloat(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
}

/**
 * Audita uma lista de selectores na página actual para conformidade
 * WCAG AA de contraste de texto.
 *
 * Cada resultado tem um campo `status`:
 *   "pass"                     — rácio >= minRatio
 *   "fail"                     — rácio < minRatio (problema real)
 *   "requires_visual_inspection" — fundo não medível (background-image ou overlay)
 *   "not_found"                — selector não existe na página
 *
 * @param {import('@playwright/test').Page} page
 * @param {string[]} selectors
 * @param {number} [minRatio=4.5]
 * @returns {Promise<Array>}
 */
async function auditElementsForContrast(page, selectors, minRatio = 4.5) {
  const results = [];

  for (const selector of selectors) {
    const colors = await extractColors(page, selector).catch(() => null);

    if (!colors) {
      results.push({ selector, status: 'not_found', ratio: null, passed: null });
      continue;
    }

    if (!colors.measurementPossible) {
      results.push({
        selector,
        status: 'requires_visual_inspection',
        reason: colors.reason,
        textColor: colors.color,
        bgColor: null,
        ratio: null,
        passed: null,
      });
      continue;
    }

    const { color, effectiveBackgroundColor } = colors;
    const ratio = calculateContrast(color, effectiveBackgroundColor);
    const passed = ratio >= minRatio;

    results.push({
      selector,
      status: passed ? 'pass' : 'fail',
      ratio,
      passed,
      textColor: color,
      bgColor: effectiveBackgroundColor,
      suggestion: passed
        ? null
        : `Contraste ${ratio}:1 — precisa de +${(minRatio - ratio).toFixed(2)} para WCAG AA.`,
    });
  }

  return results;
}

module.exports = {
  captureAtZoom,
  extractColors,
  calculateContrast,
  auditElementsForContrast,
  SCREENSHOTS_DIR,
};
