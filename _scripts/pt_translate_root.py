"""
Apply Portuguese translations to root pages.
Handles: lang attr, meta, nav, footer, bottom-nav, hreflang, lang-switcher injection.
Page-specific body content is done separately via Edit tool.
"""
import os
import re

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOMAIN = "https://portal-turismo-portugal.pages.dev"

PAGES = {
    "index.html":     {"pt_url": f"{DOMAIN}/",              "en_url": f"{DOMAIN}/en/",               "en_path": "/en/"},
    "planear.html":   {"pt_url": f"{DOMAIN}/planear.html",  "en_url": f"{DOMAIN}/en/planear.html",   "en_path": "/en/planear.html"},
    "precos.html":    {"pt_url": f"{DOMAIN}/precos.html",   "en_url": f"{DOMAIN}/en/precos.html",    "en_path": "/en/precos.html"},
    "parceiros.html": {"pt_url": f"{DOMAIN}/parceiros.html","en_url": f"{DOMAIN}/en/parceiros.html", "en_path": "/en/parceiros.html"},
    "media-kit.html": {"pt_url": f"{DOMAIN}/media-kit.html","en_url": f"{DOMAIN}/en/media-kit.html", "en_path": "/en/media-kit.html"},
    "contact.html":   {"pt_url": f"{DOMAIN}/contact.html",  "en_url": f"{DOMAIN}/en/contact.html",   "en_path": "/en/contact.html"},
    "login.html":     {"pt_url": f"{DOMAIN}/login.html",    "en_url": f"{DOMAIN}/en/login.html",     "en_path": "/en/login.html"},
}

# ── Shared nav text replacements (same across all pages) ──────────────
NAV_REPLACEMENTS = [
    # Nav links
    ('>Beaches<',      '>Praias<'),
    ('>Fishing<',      '>Pesca<'),
    ('Plan</a>',       'Planear</a>'),
    ('>Pricing<',      '>Preços<'),
    ('>Partners<',     '>Parceiros<'),
    # Buttons
    ('>Log In<',       '>Entrar<'),
    ('>Sign Up<',      '>Registar<'),
    # ARIA / accessibility labels (nav)
    ('aria-label="Main navigation"',    'aria-label="Navegação principal"'),
    ('aria-label="Open menu"',          'aria-label="Abrir menu"'),
    ('aria-label="Close menu"',         'aria-label="Fechar menu"'),
    # Skip link
    ('>Skip to content<', '>Saltar para o conteúdo<'),
    # footer labels
    ('aria-label="Social media"',       'aria-label="Redes sociais"'),
    ('>Destinations<',                  '>Destinos<'),
    ('>Lisbon<',                        '>Lisboa<'),
    ('aria-label="Portal"',             'aria-label="Portal"'),
    ('>Beaches</a>',                    '>Praias</a>'),
    ('>Webcams</a>',                    '>Webcams</a>'),
    ('>Fishing</a>',                    '>Pesca</a>'),
    ('>Plan a Trip</a>',                '>Planear Viagem</a>'),
    ('Partners &amp; Help',             'Parceiros &amp; Ajuda'),
    ('>Partners</a>',                   '>Parceiros</a>'),
    ('>Media Kit</a>',                  '>Media Kit</a>'),
    ('>About Us</a>',                   '>Sobre Nós</a>'),
    ('>Contact</a>',                    '>Contacto</a>'),
    ('>Privacy</a>',                    '>Privacidade</a>'),
    # footer bottom
    ("All rights reserved.",            "Todos os direitos reservados."),
    ('>About<',                         '>Sobre<'),
    ('· <a href="contact.html">Contact</a>', '· <a href="contact.html">Contacto</a>'),
    ('· <a href="privacy.html">Privacy</a>', '· <a href="privacy.html">Privacidade</a>'),
    ('· <a href="terms.html">Terms</a>',    '· <a href="terms.html">Termos</a>'),
    ('· <a href="cookies.html">Cookies</a>','· <a href="cookies.html">Cookies</a>'),
    # Footer tagline
    ("Portugal's reference portal for beaches — conditions, webcams, surf, fishing and trip planning.",
     "O portal de referência de praias em Portugal — condições, webcams, surf, pesca e planeamento de viagens."),
    # Bottom nav
    ('aria-label="Quick navigation"',   'aria-label="Navegação rápida"'),
    ('>Home<',                          '>Início<'),
    # Bottom nav items
    ('aria-label="Home"',               'aria-label="Início"'),
    ('aria-label="Beaches"',            'aria-label="Praias"'),
    ('aria-label="Fishing"',            'aria-label="Pesca"'),
    ('aria-label="Pricing"',            'aria-label="Preços"'),
    # Preloader (index only)
    ('>500+ Beaches<',                  '>500+ Praias<'),
    ('>7 Regions<',                     '>7 Regiões<'),
]

# ── Per-page meta translations ─────────────────────────────────────────
META = {
    "index.html": {
        "title": "Portugal Travel Hub — Praias, Webcams, Surf e Pesca em Tempo Real",
        "desc":  "O portal de referência para praias em Portugal. Condições em tempo real, webcams ao vivo, previsões de surf e pesca, mapa interactivo — tudo num só lugar.",
        "og_title": "Portugal Travel Hub — Praias, Webcams, Surf e Pesca em Tempo Real",
        "og_desc":  "O portal de praias de Portugal. Condições em tempo real, webcams ao vivo, previsões de surf e pesca — tudo num só lugar.",
        "tw_title": "Portugal Travel Hub — Condições de Praia, Webcams, Surf e Pesca em Tempo Real",
        "tw_desc":  "O portal de praias de Portugal. Condições em tempo real, webcams ao vivo, previsões de surf e pesca — tudo num só lugar.",
    },
    "planear.html": {
        "title": "Planear a Sua Escapada em Portugal — Praia, Surf e Pesca · Portugal Travel Hub",
        "desc":  "Diga-nos o que procura e ajudamo-lo a planear — praia, surf, pesca ou uma escapada completa. Recomendações personalizadas para o melhor de Portugal.",
        "og_title": "Planear a Sua Escapada em Portugal — Praia, Surf e Pesca · Portugal Travel Hub",
        "og_desc":  "Diga-nos o que procura — praia, surf, pesca ou uma escapada completa — e tratamos do resto.",
        "tw_title": "Planear a Sua Escapada em Portugal — Praia, Surf e Pesca · Portugal Travel Hub",
        "tw_desc":  "Diga-nos o que procura — praia, surf, pesca ou uma escapada completa — e tratamos do resto.",
    },
    "precos.html": {
        "title": "Planos e Preços — Portugal Travel Hub · Grátis e Pro",
        "desc":  "Escolha o plano certo para si. Acesso gratuito a praias e webcams, ou desbloqueie previsões avançadas, alertas e conteúdo exclusivo com o plano Pro.",
        "og_title": "Planos e Preços — Portugal Travel Hub · Grátis e Pro",
        "og_desc":  "Acesso gratuito às praias de Portugal ou desbloqueie o plano Pro com previsões avançadas, alertas e conteúdo exclusivo.",
        "tw_title": "Planos e Preços — Portugal Travel Hub · Grátis e Pro",
        "tw_desc":  "Acesso gratuito às praias de Portugal ou desbloqueie o plano Pro com previsões avançadas, alertas e conteúdo exclusivo.",
    },
    "parceiros.html": {
        "title": "Torne-se Parceiro no Portal de Praias de Portugal · Portugal Travel Hub",
        "desc":  "Coloque o seu negócio no principal portal de praias de Portugal. Visibilidade premium, tráfego qualificado e presença verificada em frente a quem planeia férias costeiras.",
        "og_title": "Torne-se Parceiro no Portal de Praias de Portugal · Portugal Travel Hub",
        "og_desc":  "Coloque o seu negócio no principal portal de praias de Portugal. Visibilidade premium, tráfego qualificado e presença verificada em frente a quem decide para onde ir.",
        "tw_title": "Torne-se Parceiro no Portal de Praias de Portugal · Portugal Travel Hub",
        "tw_desc":  "Coloque o seu negócio no principal portal de praias de Portugal. Visibilidade premium, tráfego qualificado.",
    },
    "media-kit.html": {
        "title": "Media Kit — Parcerias e Publicidade · Portugal Travel Hub",
        "desc":  "Media Kit do Portugal Travel Hub — o portal de referência para viagens costeiras em Portugal. Formatos de parceria, critérios editoriais e modelos de colaboração.",
        "og_title": "Media Kit — Parcerias e Publicidade · Portugal Travel Hub",
        "og_desc":  "O portal de referência para praias em Portugal. Formatos de parceria, critérios editoriais e modelos de colaboração para empresas de turismo costeiro.",
        "tw_title": "Media Kit — Parcerias e Publicidade · Portugal Travel Hub",
        "tw_desc":  "O portal de referência para praias em Portugal. Formatos de parceria, critérios editoriais e modelos de colaboração.",
    },
    "contact.html": {
        "title": "Contacto — Parcerias, Suporte e Questões · Portugal Travel Hub",
        "desc":  "Entre em contacto com o Portugal Travel Hub — planeamento de viagens, parcerias comerciais, suporte editorial e questões gerais.",
        "og_title": "Contacto — Parcerias, Suporte e Questões · Portugal Travel Hub",
        "og_desc":  "Entre em contacto — planeamento de viagens, parcerias comerciais ou suporte geral.",
        "tw_title": "Contacto — Parcerias, Suporte e Questões · Portugal Travel Hub",
        "tw_desc":  "Entre em contacto — planeamento de viagens, parcerias comerciais ou suporte geral.",
    },
    "login.html": {
        "title": "Entrar · Portugal Travel Hub",
        "desc":  "Inicie sessão na sua conta do Portugal Travel Hub — previsões premium, alertas personalizados e muito mais.",
    },
}


def lang_switcher_pt(en_path):
    return (
        '<div class="lang-switcher" aria-label="Seleção de idioma">\n'
        '      <span class="lang-btn lang-btn--active" aria-current="true" hreflang="pt">PT</span>\n'
        '      <span class="lang-sep" aria-hidden="true">|</span>\n'
        f'      <a href="{en_path}" class="lang-btn" data-lang="en" '
        'onclick="try{localStorage.setItem(\'pth_lang\',\'en\')}catch(_){}" hreflang="en">EN</a>\n'
        '    </div>'
    )


def translate_page(content, fname, info):
    # 1. lang attribute
    content = re.sub(r'<html lang="[^"]*">', '<html lang="pt-PT">', content)

    # 2. og:locale
    content = content.replace('content="en_GB"', 'content="pt_PT"')

    # 3. Page title
    m = META.get(fname, {})
    if m.get("title"):
        content = re.sub(r'<title>[^<]+</title>', f'<title>{m["title"]}</title>', content)
    if m.get("desc"):
        content = re.sub(
            r'<meta name="description" content="[^"]+">',
            f'<meta name="description" content="{m["desc"]}">',
            content
        )
    if m.get("og_title"):
        content = re.sub(
            r'<meta property="og:title" content="[^"]+"',
            f'<meta property="og:title" content="{m["og_title"]}"',
            content
        )
    if m.get("og_desc"):
        content = re.sub(
            r'<meta property="og:description" content="[^"]+"',
            f'<meta property="og:description" content="{m["og_desc"]}"',
            content
        )
    if m.get("tw_title"):
        content = re.sub(
            r'<meta name="twitter:title"\s+content="[^"]+"',
            f'<meta name="twitter:title"       content="{m["tw_title"]}"',
            content
        )
    if m.get("tw_desc"):
        content = re.sub(
            r'<meta name="twitter:description"\s+content="[^"]+"',
            f'<meta name="twitter:description" content="{m["tw_desc"]}"',
            content
        )

    # 4. Add hreflang tags (skip login)
    if fname != "login.html" and 'hreflang="pt"' not in content:
        canonical_tag = re.search(r'<link rel="canonical" href="[^"]+">',content)
        if canonical_tag:
            old = canonical_tag.group(0)
            hreflangs = (
                f'{old}\n'
                f'  <link rel="alternate" hreflang="pt" href="{info["pt_url"]}">\n'
                f'  <link rel="alternate" hreflang="en" href="{info["en_url"]}">\n'
                f'  <link rel="alternate" hreflang="x-default" href="{info["pt_url"]}">'
            )
            content = content.replace(old, hreflangs)

    # 5. Update JSON-LD inLanguage to pt
    content = content.replace('"inLanguage": "en"', '"inLanguage": "pt"')

    # 6. Nav / footer shared text replacements
    for old, new in NAV_REPLACEMENTS:
        content = content.replace(old, new)

    # 7. Inject lang switcher into nav
    toggle_marker = '<button class="nav-toggle"'
    if toggle_marker in content and 'class="lang-switcher"' not in content:
        sw = lang_switcher_pt(info["en_path"])
        content = content.replace(toggle_marker, sw + '\n    ' + toggle_marker, 1)

    # 8. Add lang-switcher.js before </body>
    if 'lang-switcher.js' not in content:
        content = content.replace(
            '</body>',
            '  <script src="js/lang-switcher.js" defer></script>\n</body>'
        )

    return content


for fname, info in PAGES.items():
    src = os.path.join(BASE, fname)
    with open(src, "r", encoding="utf-8") as f:
        content = f.read()
    content = translate_page(content, fname, info)
    with open(src, "w", encoding="utf-8", newline="\n") as f:
        f.write(content)
    print(f"  Translated  {fname}")

print("Done — all root pages translated to PT.")
