"""
Generate /en/ copies of the 7 main pages.
Fixes relative paths, adds hreflang, canonical, and lang switcher HTML.
"""
import os
import re

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EN_DIR = os.path.join(BASE, "en")
os.makedirs(EN_DIR, exist_ok=True)

DOMAIN = "https://portal-turismo-portugal.pages.dev"

PAGES = {
    "index.html":     {"pt_url": f"{DOMAIN}/",              "en_url": f"{DOMAIN}/en/",               "pt_path": "/",              "en_path": "/en/"},
    "planear.html":   {"pt_url": f"{DOMAIN}/planear.html",  "en_url": f"{DOMAIN}/en/planear.html",   "pt_path": "/planear.html",  "en_path": "/en/planear.html"},
    "precos.html":    {"pt_url": f"{DOMAIN}/precos.html",   "en_url": f"{DOMAIN}/en/precos.html",    "pt_path": "/precos.html",   "en_path": "/en/precos.html"},
    "parceiros.html": {"pt_url": f"{DOMAIN}/parceiros.html","en_url": f"{DOMAIN}/en/parceiros.html", "pt_path": "/parceiros.html","en_path": "/en/parceiros.html"},
    "media-kit.html": {"pt_url": f"{DOMAIN}/media-kit.html","en_url": f"{DOMAIN}/en/media-kit.html", "pt_path": "/media-kit.html","en_path": "/en/media-kit.html"},
    "contact.html":   {"pt_url": f"{DOMAIN}/contact.html",  "en_url": f"{DOMAIN}/en/contact.html",   "pt_path": "/contact.html",  "en_path": "/en/contact.html"},
    "login.html":     {"pt_url": f"{DOMAIN}/login.html",    "en_url": f"{DOMAIN}/en/login.html",     "pt_path": "/login.html",    "en_path": "/en/login.html"},
}

RELATIVE_PAGES = [
    "beaches.html", "surf.html", "pesca.html", "webcams.html",
    "planear.html", "precos.html", "parceiros.html", "login.html",
    "media-kit.html", "contact.html", "sobre.html", "privacy.html",
    "terms.html", "cookies.html", "beach.html", "dashboard.html",
    "best-beaches-portugal.html", "best-beaches-algarve.html",
    "family-beaches-algarve.html", "surfing-portugal.html",
    "beginner-surf-beaches-algarve.html",
]


def lang_switcher_en(pt_path):
    return (
        '<div class="lang-switcher" aria-label="Language selection">\n'
        f'      <a href="{pt_path}" class="lang-btn" data-lang="pt" '
        'onclick="try{localStorage.setItem(\'pth_lang\',\'pt\')}catch(_){}" hreflang="pt">PT</a>\n'
        '      <span class="lang-sep" aria-hidden="true">|</span>\n'
        '      <span class="lang-btn lang-btn--active" aria-current="true" hreflang="en">EN</span>\n'
        '    </div>'
    )


def process_en_copy(content, fname, info):
    # 1. Fix relative css paths
    content = content.replace('href="css/', 'href="/css/')
    content = content.replace("href='css/", "href='/css/")

    # 2. Fix relative js paths
    content = content.replace('src="js/', 'src="/js/')
    content = content.replace("src='js/", "src='/js/")
    content = content.replace('href="js/', 'href="/js/')

    # 3. Fix relative HTML page links
    for page in RELATIVE_PAGES:
        content = content.replace(f'href="{page}"', f'href="/{page}"')
        content = content.replace(f"href='{page}'", f"href='/{page}'")
        # With hash anchors
        content = re.sub(
            rf'href="{re.escape(page)}(#[^"]*)"',
            rf'href="/{page}\1"',
            content
        )

    # beaches.html?region=... links
    content = re.sub(r'href="(beaches\.html\?[^"]+)"', r'href="/\1"', content)

    # 4. Update canonical
    content = re.sub(
        r'<link rel="canonical" href="[^"]+">',
        f'<link rel="canonical" href="{info["en_url"]}">',
        content
    )

    # 5. Update og:url
    content = re.sub(
        r'<meta property="og:url" content="[^"]+">',
        f'<meta property="og:url" content="{info["en_url"]}">',
        content
    )

    # 6. Update twitter:url
    content = re.sub(
        r'<meta name="twitter:url"\s+content="[^"]+"',
        f'<meta name="twitter:url"         content="{info["en_url"]}"',
        content
    )

    # 7. Add hreflang after canonical (skip login — it's noindex)
    if fname != "login.html" and 'hreflang="pt"' not in content:
        new_canonical = f'<link rel="canonical" href="{info["en_url"]}">'
        hreflangs = (
            f'{new_canonical}\n'
            f'  <link rel="alternate" hreflang="pt" href="{info["pt_url"]}">\n'
            f'  <link rel="alternate" hreflang="en" href="{info["en_url"]}">\n'
            f'  <link rel="alternate" hreflang="x-default" href="{info["pt_url"]}">'
        )
        content = content.replace(new_canonical, hreflangs)

    # 8. Add lang-switcher.js before </body>
    if 'lang-switcher.js' not in content:
        content = content.replace(
            '</body>',
            '  <script src="/js/lang-switcher.js" defer></script>\n</body>'
        )

    # 9. Inject lang switcher HTML into nav (before nav-toggle button)
    toggle_marker = '<button class="nav-toggle"'
    if toggle_marker in content and 'class="lang-switcher"' not in content:
        sw = lang_switcher_en(info["pt_path"])
        content = content.replace(toggle_marker, sw + '\n    ' + toggle_marker, 1)

    return content


for fname, info in PAGES.items():
    src = os.path.join(BASE, fname)
    dst = os.path.join(EN_DIR, fname)
    with open(src, "r", encoding="utf-8") as f:
        content = f.read()
    content = process_en_copy(content, fname, info)
    with open(dst, "w", encoding="utf-8", newline="\n") as f:
        f.write(content)
    print(f"  Created  en/{fname}")

print("Done — all /en/ copies created.")
