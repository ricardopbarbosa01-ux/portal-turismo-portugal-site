#!/usr/bin/env python3
"""
update-footer-refund-policy.py
Add Refund Policy link to global footer (PT + EN).

Handles 5 footer variant patterns across the site.
Run from project root.
"""
import os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

REPLACEMENTS = [
    # Pattern 1 (PT): Privacidade + termos.html  [most common]
    (
        'Privacidade</a> · <a href="termos.html">Termos</a>',
        'Privacidade</a> · <a href="refund-policy.html">Pol&iacute;tica de Reembolso</a> · <a href="termos.html">Termos</a>',
    ),
    # Pattern 2 (PT): Privacidade + terms.html
    (
        'Privacidade</a> · <a href="terms.html">Termos</a>',
        'Privacidade</a> · <a href="refund-policy.html">Pol&iacute;tica de Reembolso</a> · <a href="terms.html">Termos</a>',
    ),
    # Pattern 3 (mixed): English labels + PT links (best-beaches-algarve etc)
    (
        'Privacy</a> · <a href="termos.html">Terms</a>',
        'Privacy</a> · <a href="refund-policy.html">Refund Policy</a> · <a href="termos.html">Terms</a>',
    ),
    # Pattern 4 (mixed): English labels + EN links on PT domain
    (
        '/en/privacy.html">Privacy</a> · <a href="/en/terms.html">Terms</a>',
        '/en/privacy.html">Privacy</a> · <a href="/en/refund-policy.html">Refund Policy</a> · <a href="/en/terms.html">Terms</a>',
    ),
    # Pattern 5 (EN folder): /en/privacy.html + /en/terms.html
    (
        'href="/en/privacy.html">Privacy</a> · <a href="/en/terms.html">Terms</a>',
        'href="/en/privacy.html">Privacy</a> · <a href="/en/refund-policy.html">Refund Policy</a> · <a href="/en/terms.html">Terms</a>',
    ),
]

# Files to skip: already updated + PASSO-8 hard rule (no-touch)
SKIP_FILES = {
    'refund-policy.html',      # already has link
    'en/refund-policy.html',   # already has link
    'termos.html',             # PASSO 8: NÃO alterar
    'privacidade.html',        # PASSO 8: NÃO alterar
}

def collect_html_files():
    files = []
    for fname in os.listdir(ROOT):
        if fname.endswith('.html') and fname not in SKIP_FILES:
            files.append(os.path.join(ROOT, fname))
    en_dir = os.path.join(ROOT, 'en')
    if os.path.isdir(en_dir):
        for fname in os.listdir(en_dir):
            if fname.endswith('.html') and f'en/{fname}' not in SKIP_FILES:
                files.append(os.path.join(en_dir, fname))
    return sorted(files)


def process_file(path, dry_run=False):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    modified = content
    changes = []
    for old, new in REPLACEMENTS:
        if old in modified:
            modified = modified.replace(old, new)
            changes.append(old[:60] + '...')

    if changes:
        rel = os.path.relpath(path, ROOT).replace('\\', '/')
        if not dry_run:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(modified)
        return rel, changes
    return None, None


def main():
    dry_run = '--dry-run' in sys.argv
    mode = 'DRY RUN' if dry_run else 'APPLY'
    print(f'=== update-footer-refund-policy.py [{mode}] ===')

    files = collect_html_files()
    total = len(files)
    updated = []

    for path in files:
        rel, changes = process_file(path, dry_run=dry_run)
        if rel:
            updated.append((rel, changes))
            for c in changes:
                print(f'  {rel}: matched "{c}"')

    print(f'\nTotal files scanned : {total}')
    print(f'Files updated       : {len(updated)}')
    if dry_run:
        print('(no files written — dry run)')
    return 0


if __name__ == '__main__':
    sys.exit(main())
