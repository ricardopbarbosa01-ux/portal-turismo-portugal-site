# -*- coding: utf-8 -*-
"""Barra de navegacao do telemovel v2 (08/10/2026): Webcams entra em todas as paginas, ao centro.
Padrao unico (5 itens):
  sem botao Menu : Inicio · Praias · Webcams · Surf · Pesca
  com botao Menu : Praias · Surf · Webcams · Pesca · Menu   (o <button id="mob-menu-btn"> original e mantido tal e qual)
So mexe no bloco <nav class="mobile-bottom-nav ..."> ... </nav> ou <nav class="bottom-nav ..."> ... </nav> (1 por pagina).
Mantem a classe dos itens (mobile-nav-item ou bottom-nav-item + <span>) e marca o item da pagina atual (active + aria-current).
Uso: python3 _scripts/bottom_nav_v2.py [--write] ficheiro.html ...   |   --all  (todas as paginas com a barra, exceto planear-legacy e docs/_*)"""
import os, re, sys, subprocess
ICON = {
 'home': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12L12 3l9 9"/><path d="M9 21V12h6v9"/></svg>',
 'beaches': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 14c0 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2"/><path d="M2 20c0 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2"/><line x1="12" y1="2" x2="12" y2="10"/></svg>',
 'webcams': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/><circle cx="19.5" cy="3.5" r="3" style="fill:#ff4d6d;stroke:none"/></svg>',
 'surf': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12c0 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2"/><path d="M8 6l4-4 4 4"/></svg>',
 'pesca': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 12c3-5 9-5 12 0-3 5-9 5-12 0z"/><path d="M6.5 12L3 9v6z"/></svg>',
}
LBL = {'pt': {'home': 'Início', 'beaches': 'Praias', 'webcams': 'Webcams', 'surf': 'Surf', 'pesca': 'Pesca'},
       'en': {'home': 'Home', 'beaches': 'Beaches', 'webcams': 'Webcams', 'surf': 'Surf', 'pesca': 'Fishing'}}
ARIA = {'pt': {'home': 'Início', 'beaches': 'Praias', 'webcams': 'Webcams ao vivo', 'surf': 'Surf', 'pesca': 'Pesca'},
        'en': {'home': 'Home', 'beaches': 'Beaches', 'webcams': 'Live webcams', 'surf': 'Surf', 'pesca': 'Fishing'}}
HREF = {'pt': {'home': '/', 'beaches': '/beaches', 'webcams': '/webcams', 'surf': '/surf', 'pesca': '/pesca'},
        'en': {'home': '/en/', 'beaches': '/en/beaches', 'webcams': '/en/webcams', 'surf': '/en/surf', 'pesca': '/en/pesca'}}
NAV_RE = re.compile(r'(<nav\b[^>]*class="(mobile-bottom-nav|bottom-nav)\b[^"]*"[^>]*>)(.*?)(</nav>)', re.S)
def section(path):
    p = path.replace('\\', '/')
    b = os.path.basename(p)
    if re.search(r'(^|/)(webcams|webcam-[^/]*|[^/]*-webcam)\.html$', p): return 'webcams'
    if re.search(r'(^|/)(surf|escolas-de-surf|surf-schools)\.html$', p): return 'surf'
    if re.search(r'(^|/)pesca\.html$', p): return 'pesca'
    if re.search(r'(^|/)(beaches|beach)\.html$', p) or '/praias/' in '/' + p: return 'beaches'
    if p in ('index.html', 'en/index.html'): return 'home'
    return None
def build(path, html, cls, inner):
    lang = 'en' if re.search(r'<html[^>]*lang="en', html) else 'pt'
    btn = re.search(r'<button\b[^>]*id="mob-menu-btn"[^>]*>.*?</button>', inner, re.S)
    keys = ['beaches', 'surf', 'webcams', 'pesca'] if btn else ['home', 'beaches', 'webcams', 'surf', 'pesca']
    cur = section(path)
    item = 'mobile-nav-item' if cls == 'mobile-bottom-nav' else 'bottom-nav-item'
    ind = '    ' if cls == 'mobile-bottom-nav' else '  '
    out = []
    for k in keys:
        on = (k == cur)
        lab = LBL[lang][k]
        text = ('<span>%s</span>' % lab) if cls == 'bottom-nav' else lab
        out.append('%s<a href="%s" class="%s%s" aria-label="%s"%s>\n%s  %s\n%s  %s\n%s</a>' % (
            ind, HREF[lang][k], item, ' active' if on else '', ARIA[lang][k], ' aria-current="page"' if on else '', ind, ICON[k], ind, text, ind))
    if btn: out.append(ind + btn.group(0).strip())
    body = '\n'.join(out)
    if cls == 'mobile-bottom-nav':
        return '\n  <div class="mobile-bottom-nav-inner">\n' + body + '\n  </div>\n'
    return '\n' + body + '\n'
def run(paths, write):
    changed = 0
    for path in paths:
        html = open(path, encoding='utf-8').read()
        ms = list(NAV_RE.finditer(html))
        if len(ms) != 1: print('SALTA (%d barras)' % len(ms), path); continue
        m = ms[0]
        new = m.group(1) + build(path, html, m.group(2), m.group(3)) + m.group(4)
        if new == m.group(0): continue
        out = html[:m.start()] + new + html[m.end():]
        assert out.count('<nav') == html.count('<nav') and len(out) - len(html) < 3000
        changed += 1
        if write:
            open(path + '.tmp', 'w', encoding='utf-8', newline='').write(out); os.replace(path + '.tmp', path)
        else:
            print('---', path, '(seccao:', section(path), ')'); print(new)
    print('alterados:', changed, '(escrito)' if write else '(ensaio)')
if __name__ == '__main__':
    a = sys.argv[1:]; write = '--write' in a; a = [x for x in a if x != '--write']
    if a == ['--all']:
        a = [f for f in subprocess.run(['git', '--no-optional-locks', 'grep', '-l', '-E', 'class="(mobile-bottom-nav|bottom-nav)', '--', '*.html'], capture_output=True, text=True).stdout.split()
             if not f.startswith(('docs/', '_')) and 'legacy' not in f]
    run(a, write)
