#!/usr/bin/env python3
"""
Build en/404.html from 404.html PT.

Reads 404.html, applies PT→EN substitutions (text, hrefs, lang attrs,
canonical, localStorage), writes en/404.html.

Idempotent: re-running produces identical output.
"""
import re
import sys
from pathlib import Path

SOURCE = Path("404.html")
TARGET = Path("en/404.html")

# Slug map: PT filename → EN filename (only where they diverge)
SLUG_MAP = {
    "guias.html": "guides.html",
    "escolas-de-surf.html": "surf-schools.html",
    "sobre.html": "about.html",
    "privacidade.html": "privacy.html",
    "metodologia-editorial.html": "methodology.html",
    "transparencia-comercial.html": "transparency.html",
    "termos.html": "terms.html",
}

# Text replacements (ORDER MATTERS — longer phrases first)
TEXT_MAP = [
    # Meta + title
    ('<title>404 — Página não encontrada · Portugal Travel Hub</title>',
     '<title>404 — Page not found · Portugal Travel Hub</title>'),
    ('<title>Página não encontrada · Portugal Travel Hub</title>',
     '<title>Page not found · Portugal Travel Hub</title>'),

    # Meta description (cobrir variantes possíveis)
    ('A página que procura não existe ou foi movida. Volte à página inicial ou explore as praias de Portugal.',
     "The page you're looking for doesn't exist or has been moved. Go back to the homepage or explore Portugal's beaches."),

    # Headings + body
    ('Página não encontrada', 'Page not found'),
    ('A página que procura não existe ou foi movida.',
     "The page you're looking for doesn't exist or has been moved."),
    ('Voltar à página inicial', 'Back to homepage'),
    ('Explorar praias', 'Explore beaches'),

    # Skip link + aria
    ('Saltar para o conteúdo', 'Skip to content'),
    ('Navegação principal', 'Main navigation'),
    ('Seleção de idioma', 'Language selection'),
    ('Abrir menu', 'Open menu'),

    # Nav items
    ('>Praias<', '>Beaches<'),
    ('Pesca (Charters)', 'Fishing (Charters)'),
    ('title="Em breve"', 'title="Coming soon"'),
    ('>Pesca<', '>Fishing<'),
    ('>Planear<', '>Plan<'),
    ('>Guias<', '>Guides<'),
    ('>Preços<', '>Pricing<'),
    ('>Parceiros Verificados<', '>Verified Partners<'),
    ('>Verificado<', '>Verified<'),
    ('>Escolas de Surf<', '>Surf Schools<'),
    ('Ver todas →', 'See all →'),
    ('>Em desenvolvimento<', '>Coming soon<'),
    ('>Para o seu Negócio<', '>For Your Business<'),

    # Footer tagline
    ('O portal premium para as praias de Portugal — condições em tempo real, webcams e previsões.',
     "Portugal's premium beach portal — real-time conditions, webcams and forecasts."),

    # Footer sections
    ('>Destinos<', '>Destinations<'),
    ('>Empresa<', '>Company<'),
    ('>Sobre Nós<', '>About Us<'),
    ('>Contacto<', '>Contact<'),
    ('>Legal<', '>Legal<'),
    ('>Privacidade<', '>Privacy<'),
    ('>Termos<', '>Terms<'),
    ('>Sobre<', '>About<'),
    ('>Metodologia<', '>Methodology<'),
    ('>Transparência<', '>Transparency<'),
    ('>Política de Reembolso<', '>Refund Policy<'),
    ('>Cookies<', '>Cookies<'),
    ('Todos os direitos reservados.', 'All rights reserved.'),
]

def rewrite_href(match):
    """Rewrite href values. Handles:
    - Root '/' → '/en/'
    - Bare 'foo.html' → '/en/<slug>.html' (with slug map)
    - '/foo.html' → '/en/<slug>.html'
    - 'foo.html#frag' → '/en/<slug>.html#frag'
    - Leave external (http*, mailto, tel, #frag) untouched
    - Leave already-en hrefs untouched
    """
    full = match.group(0)
    quote = match.group(1)
    href = match.group(2)

    # Skip external and anchor-only and asset paths
    if href.startswith(('http://', 'https://', 'mailto:', 'tel:', '#')):
        return full
    # Skip css/js/img assets
    if href.startswith(('/css/', '/js/', '/img/', '/images/', '/fonts/',
                        '/videos/', 'css/', 'js/', 'img/')):
        return full
    # Skip already-en
    if href.startswith('/en/') or href.startswith('en/'):
        return full

    # Root → /en/
    if href == '/':
        return f'href={quote}/en/{quote}'

    # Split fragment
    if '#' in href:
        path, frag = href.split('#', 1)
        frag = '#' + frag
    else:
        path, frag = href, ''

    # Strip leading slash for slug lookup
    clean = path.lstrip('/')

    # Apply slug map if filename matches
    if clean in SLUG_MAP:
        clean = SLUG_MAP[clean]

    # Only rewrite if looks like .html or known route
    if clean.endswith('.html') or clean in ('parceiros', 'escolas-de-surf'):
        return f'href={quote}/en/{clean}{frag}{quote}'

    return full

def main():
    if not SOURCE.exists():
        print(f"ERRO: {SOURCE} não existe", file=sys.stderr)
        sys.exit(1)

    # Read as UTF-8 strict
    raw = SOURCE.read_bytes()
    try:
        html = raw.decode('utf-8')
    except UnicodeDecodeError as e:
        print(f"ERRO encoding: {e}", file=sys.stderr)
        sys.exit(2)

    # Mojibake guard
    if 'NegÃ³cio' in html or 'NegÃƒÂ³cio' in html:
        print("ERRO: mojibake detectado no source 404.html", file=sys.stderr)
        sys.exit(2)

    # 1. lang attribute
    html = html.replace('<html lang="pt-PT">', '<html lang="en">')
    html = html.replace('<html lang="pt">', '<html lang="en">')

    # 2. Canonical
    html = re.sub(
        r'<link rel="canonical" href="[^"]*"',
        '<link rel="canonical" href="https://www.portalturismoportugal.com/en/404"',
        html
    )

    # 3. og:url / twitter:url (se existirem)
    html = re.sub(
        r'(property="og:url" content=")[^"]*(")',
        r'\1https://www.portalturismoportugal.com/en/404\2',
        html
    )
    html = re.sub(
        r'(name="twitter:url" content=")[^"]*(")',
        r'\1https://www.portalturismoportugal.com/en/404\2',
        html
    )

    # 4. og:locale (se existir)
    html = re.sub(
        r'(property="og:locale" content=")pt_PT(")',
        r'\1en_US\2',
        html
    )

    # 5. Text replacements (order matters — apply as defined)
    for pt, en in TEXT_MAP:
        html = html.replace(pt, en)

    # 6. Rewrite all hrefs
    # Match href="..." or href='...'
    href_re = re.compile(r'''href=(["'])([^"']+)\1''')
    html = href_re.sub(rewrite_href, html)

    # 7. localStorage pth_lang — rewrite any PT defaults in inline scripts
    # (must run BEFORE lang switcher swap so the new PT button keeps 'pt')
    html = html.replace(
        "localStorage.setItem('pth_lang','pt')",
        "localStorage.setItem('pth_lang','en')"
    )
    html = html.replace(
        'localStorage.setItem("pth_lang","pt")',
        'localStorage.setItem("pth_lang","en")'
    )

    # 8. Lang switcher — structural swap (runs AFTER step 7 so PT button's
    # newly-inserted 'pth_lang','pt' is NOT overwritten by step 7)
    html = html.replace(
        '<span class="lang-btn lang-btn--active" aria-current="true" hreflang="pt">PT</span>',
        '<a href="/" class="lang-btn" data-lang="pt" onclick="try{localStorage.setItem(\'pth_lang\',\'pt\')}catch(_){}" hreflang="pt">PT</a>'
    )
    html = html.replace(
        '<a href="/en/" class="lang-btn" data-lang="en" onclick="try{localStorage.setItem(\'pth_lang\',\'en\')}catch(_){}" hreflang="en">EN</a>',
        '<span class="lang-btn lang-btn--active" aria-current="true" hreflang="en">EN</span>'
    )

    # Validação pós-transformação
    if 'NegÃ³cio' in html or 'NegÃƒÂ³cio' in html:
        print("ERRO: mojibake gerado durante substituição", file=sys.stderr)
        sys.exit(2)

    # Encoding check — re-encode para confirmar UTF-8 limpo
    try:
        out_bytes = html.encode('utf-8')
    except UnicodeEncodeError as e:
        print(f"ERRO encoding output: {e}", file=sys.stderr)
        sys.exit(2)

    # Write
    TARGET.parent.mkdir(exist_ok=True)
    TARGET.write_bytes(out_bytes)
    print(f"OK: {TARGET} escrito ({len(out_bytes)} bytes)")

    # Cobertura — quantas strings PT ainda existem (sinal de incompletude)
    suspects = [
        'Página', 'página', 'Voltar', 'Explorar', 'Praias',
        'Pesca', 'Planear', 'Guias', 'Preços', 'Parceiros',
        'Verificado', 'Escolas', 'Para o seu', 'Destinos',
        'Empresa', 'Sobre', 'Contacto', 'Privacidade',
        'Termos', 'Metodologia', 'Transparência', 'Reembolso',
        'Todos os direitos'
    ]
    leftover = []
    for s in suspects:
        # contar fora de atributos (href, etc) — busca simples
        count = html.count(f'>{s}')
        if count > 0:
            leftover.append((s, count))

    if leftover:
        print("\nAVISO: possíveis strings PT não traduzidas:")
        for s, c in leftover:
            print(f"  '{s}': {c}x")
    else:
        print("\nCobertura: nenhuma string PT suspeita encontrada.")

if __name__ == '__main__':
    main()
