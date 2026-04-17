"""
patch-cookie-consent.py
Applies Google Consent Mode v2 + cookie-consent.js banner to all site HTML files.

Changes per file:
  1. If GA4 block present: prepend Consent Mode v2 default and split inline script.
  2. Add <script src="/js/cookie-consent.js"></script> before </body> (all pages).

Skips: node_modules, playwright-report, _audit, case-study-template, proposal-template.
"""
import os
import sys

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

SKIP_DIRS = {'node_modules', 'playwright-report', '_audit', '_scripts'}
SKIP_FILES = {'case-study-template.html', 'proposal-template.html'}

# ── GA4 pattern A: with comment ───────────────────────────────────────────────
GA4_A = (
    '  <!-- Google tag (gtag.js) -->\n'
    '  <script async src="https://www.googletagmanager.com/gtag/js?id=G-8YBQEM613J"></script>\n'
    '  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag(\'js\',new Date());gtag(\'config\',\'G-8YBQEM613J\');</script>'
)

# ── GA4 pattern B: without comment (guias/ and some root pages) ───────────────
GA4_B = (
    '  <script async src="https://www.googletagmanager.com/gtag/js?id=G-8YBQEM613J"></script>\n'
    '  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag(\'js\',new Date());gtag(\'config\',\'G-8YBQEM613J\');</script>'
)

# ── Replacement: Consent Mode v2 default BEFORE the GA4 loader ───────────────
GA4_REPLACEMENT = (
    '  <!-- Google tag (gtag.js) \u2013 Consent Mode v2 -->\n'
    '  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag(\'consent\',\'default\',{analytics_storage:\'denied\',wait_for_update:500});</script>\n'
    '  <script async src="https://www.googletagmanager.com/gtag/js?id=G-8YBQEM613J"></script>\n'
    '  <script>gtag(\'js\',new Date());gtag(\'config\',\'G-8YBQEM613J\');</script>'
)

COOKIE_SCRIPT_TAG = '  <script src="/js/cookie-consent.js"></script>\n'

stats = {'ga4_patched': 0, 'script_added': 0, 'already_done': 0, 'skipped': 0, 'errors': 0}
log = []

for root, dirs, files in os.walk(BASE):
    # Prune skip dirs in-place
    dirs[:] = [d for d in dirs if d not in SKIP_DIRS]

    for fname in files:
        if not fname.endswith('.html'):
            continue
        if fname in SKIP_FILES:
            stats['skipped'] += 1
            continue

        fpath = os.path.join(root, fname)
        try:
            with open(fpath, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            stats['errors'] += 1
            log.append('ERROR reading {}: {}'.format(fpath, e))
            continue

        original = content
        changed = False

        # 1. Patch GA4 block (only if not already patched)
        if 'Consent Mode v2' not in content:
            if GA4_A in content:
                content = content.replace(GA4_A, GA4_REPLACEMENT, 1)
                stats['ga4_patched'] += 1
                changed = True
            elif GA4_B in content:
                content = content.replace(GA4_B, GA4_REPLACEMENT, 1)
                stats['ga4_patched'] += 1
                changed = True

        # 2. Add cookie-consent.js before </body> (if not already present)
        if '/js/cookie-consent.js' not in content:
            if '</body>' in content:
                content = content.replace('</body>', COOKIE_SCRIPT_TAG + '</body>', 1)
                stats['script_added'] += 1
                changed = True
        else:
            if content == original:
                stats['already_done'] += 1

        if changed:
            try:
                with open(fpath, 'w', encoding='utf-8') as f:
                    f.write(content)
                rel = os.path.relpath(fpath, BASE)
                log.append('  PATCHED  ' + rel)
            except Exception as e:
                stats['errors'] += 1
                log.append('ERROR writing {}: {}'.format(fpath, e))

# ── Report ────────────────────────────────────────────────────────────────────
print('\n=== Cookie Consent Patch — Results ===\n')
print('GA4 blocks patched (Consent Mode v2) : {}'.format(stats['ga4_patched']))
print('cookie-consent.js script added       : {}'.format(stats['script_added']))
print('Already done (skipped)               : {}'.format(stats['already_done']))
print('Files skipped (templates)            : {}'.format(stats['skipped']))
print('Errors                               : {}'.format(stats['errors']))
print()
if log:
    print('\n'.join(log))
