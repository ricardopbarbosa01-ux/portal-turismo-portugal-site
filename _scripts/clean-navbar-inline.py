#!/usr/bin/env python3
"""
PTH Navbar Inline CSS Cleanup
Removes navbar-related inline CSS and duplicate mobile nav JS from HTML files.
css/style.css becomes the single source of truth for all navbar styles.
"""
import re
import sys
from pathlib import Path

BASE = Path(__file__).parent.parent

# Selectors that belong to navbar — any inline CSS rule with these should be removed
NAV_RE = re.compile(
    r'(?:^|\s|,)'
    r'(?:'
    r'\.navbar\b|'
    r'\.nav-logo\b|'
    r'\.nav-links\b|'
    r'\.nav-actions\b|'
    r'\.nav-toggle\b|'
    r'\.nav-close\b|'
    r'\.nav-backdrop\b|'
    r'\.nav-mobile-open\b|'
    r'\.lang-switcher\b|'
    r'\.lang-btn\b|'
    r'\.hamburger\b|'
    r'#nav-login-btn\b|'
    r'#nav-register-btn\b|'
    r'\.mobile-overlay\b'
    r')'
)

def is_nav_selector(text):
    return bool(NAV_RE.search(text.strip()))

def strip_nav_from_css(css):
    """Remove nav CSS rules from a CSS block using brace-depth tracking."""
    lines = css.split('\n')
    out = []
    i = 0
    while i < len(lines):
        line = lines[i]
        s = line.strip()

        # Skip nav-related comments (e.g. /* ── Navbar ── */)
        if re.match(r'/\*\s*[─━\-═]+\s*[Nn]av', s):
            i += 1
            continue

        # Handle @media blocks: collect entire block first
        if re.match(r'@media\b', s):
            blk = [line]
            depth = s.count('{') - s.count('}')
            i += 1
            while i < len(lines) and depth > 0:
                blk.append(lines[i])
                depth += lines[i].count('{') - lines[i].count('}')
                i += 1
            block_str = '\n'.join(blk)
            # Extract inner content using first/last brace positions (handles indentation)
            try:
                first_brace = block_str.index('{')
                inner = block_str[first_brace + 1:]
                last_close = inner.rstrip().rfind('}')
                if last_close >= 0:
                    inner = inner[:last_close]
            except ValueError:
                out.extend(blk)
                continue
            # Find all simple rule pairs inside the @media block
            rule_pairs = re.findall(r'([^{}]+)\{([^{}]*)\}', inner, re.DOTALL)
            if rule_pairs and all(is_nav_selector(sel) for sel, _ in rule_pairs):
                # Entirely nav-related — skip entire block
                continue
            # Keep entire block unchanged (non-nav or mixed)
            out.extend(blk)
            continue

        # Regular rule: check if selector is nav-related
        if is_nav_selector(s):
            # Skip this rule including its block (track brace depth)
            depth = s.count('{') - s.count('}')
            i += 1
            if depth > 0:
                while i < len(lines) and depth > 0:
                    depth += lines[i].count('{') - lines[i].count('}')
                    i += 1
            continue

        out.append(line)
        i += 1

    result = '\n'.join(out)
    result = re.sub(r'\n{3,}', '\n\n', result)
    return result.strip()


def process_file(filepath, dry_run=False):
    html = Path(filepath).read_text('utf-8')
    original = html

    # 1. Remove navbar CSS from all <style> blocks
    def fix_style(m):
        cleaned = strip_nav_from_css(m.group(1))
        if not cleaned:
            return ''
        return f'<style>\n{cleaned}\n</style>'
    html = re.sub(r'<style[^>]*>(.*?)</style>', fix_style, html, flags=re.DOTALL)

    # 2. Remove inline <script> blocks with openMobileNav / closeMobileNav
    #    (only when nav.js is also present — avoids removing scripts on pages without nav.js)
    if 'nav.js' in html:
        def fix_script(m):
            s = m.group(0)
            if 'openMobileNav' in s or 'closeMobileNav' in s:
                return ''
            return s
        html = re.sub(r'<script>.*?</script>', fix_script, html, flags=re.DOTALL)

    # Clean up extra blank lines
    html = re.sub(r'\n{4,}', '\n\n\n', html)

    changed = html != original
    if changed and not dry_run:
        Path(filepath).write_text(html, 'utf-8')
    return changed


FILES = [
    'best-beaches-algarve.html',
    'cookies.html',
    'en/alentejo-coast-beaches.html',
    'en/algarve-beaches.html',
    'en/beach.html',
    'en/beaches-for-kids-portugal.html',
    'en/beaches-near-lisbon.html',
    'en/beginner-surf-beaches-algarve.html',
    'en/beginner-surf-beaches-portugal.html',
    'en/best-beaches-portugal.html',
    'en/best-sunset-beaches.html',
    'en/calm-beaches-algarve.html',
    'en/central-portugal-beaches.html',
    'en/cookies.html',
    'en/family-beaches-algarve.html',
    'en/guides.html',
    'en/hidden-beaches-algarve.html',
    'en/madeira-beaches.html',
    'en/partner-demo.html',
    'en/privacy.html',
    'en/surf-algarve.html',
    'en/surfing-portugal.html',
    'en/terms.html',
    'en/where-to-stay-alentejo-coast.html',
    'en/where-to-stay-algarve-beach.html',
    'en/where-to-stay-central-portugal-beaches.html',
    'en/where-to-stay-lisbon-beaches.html',
    'en/where-to-stay-madeira-near-the-beach.html',
    'en/where-to-stay-northern-portugal-beaches.html',
    'en/where-to-stay-west-coast-portugal.html',
    'family-beaches-algarve.html',
    'melhores-praias-por-do-sol.html',
    'metodologia-editorial.html',
    'onde-ficar-algarve-praia.html',
    'onde-ficar-centro-portugal-praia.html',
    'onde-ficar-costa-alentejo-praia.html',
    'onde-ficar-madeira-perto-da-praia.html',
    'onde-ficar-norte-portugal-praia.html',
    'onde-ficar-oeste-praia.html',
    'partner-demo.html',
    'praias-madeira.html',
    'privacidade.html',
    'sobre.html',
    'termos.html',
    'transparencia-comercial.html',
]


if __name__ == '__main__':
    dry_run = '--dry-run' in sys.argv
    mode = 'DRY RUN' if dry_run else 'LIVE'
    print(f'=== PTH Navbar Inline CSS Cleanup [{mode}] ===\n')
    changed_count = 0
    skipped = 0
    for rel in FILES:
        fp = BASE / rel
        if not fp.exists():
            print(f'  SKIP (missing): {rel}')
            skipped += 1
            continue
        was_changed = process_file(fp, dry_run=dry_run)
        status = 'CHANGED' if was_changed else 'ok    '
        if was_changed:
            changed_count += 1
        print(f'  {status}: {rel}')
    print(f'\nResult: {changed_count} changed, {len(FILES)-changed_count-skipped} unchanged, {skipped} missing')
    print(f'Total files targeted: {len(FILES)}')
