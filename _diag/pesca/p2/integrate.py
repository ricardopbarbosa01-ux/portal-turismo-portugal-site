# -*- coding: utf-8 -*-
"""Pesca lote P2 (2026-10-08): +43 spots em js/surf-pesca-data.js, fotos/regioes em js/surf-pesca-page.js, contadores e ?v= nas paginas."""
import json, os, re
R = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
P = lambda *a: os.path.join(R, *a)
def rd(p): return open(P(p), encoding='utf-8', newline='').read()
def wr(p, s):
    t = P(p) + '.tmp'; open(t, 'w', encoding='utf-8', newline='').write(s); os.replace(t, P(p))
S = json.load(open(P('_diag/pesca/p2/merged.json'), encoding='utf-8'))
ids = [s['id'] for s in S]
def q(x): return "'" + x.replace('\\', '\\\\').replace("'", "\\'") + "'"
def pe(d): return '{ pt: %s, en: %s }' % (q(d['pt']), q(d['en']))
def arr(a): return '[' + ', '.join(q(x) for x in a) + ']'
def entry(s):
    L = ['    {', "      id: %s," % q(s['id']), "      name: %s," % q(s['name']), "      region: %s," % q(s['region']),
         "      location: %s," % pe(s['location']), "      bgClass: %s," % q(s['bgClass']), "      tipoKey: %s," % q(s['tipoKey']),
         "      tipos: %s," % arr(s['tipos']), "      levelKey: %s," % q(s['levelKey']), "      season: %s," % pe(s['season']),
         "      especies: %s," % pe(s['especies']), "      tecnica: %s," % pe(s['tecnica']),
         "      desc: {", "        pt: %s," % q(s['desc']['pt']), "        en: %s," % q(s['desc']['en']), "      },"]
    if s.get('aviso'): L.append("      aviso: %s," % pe(s['aviso']))
    L += ["      tags: { pt: %s, en: %s }," % (arr(s['tags']['pt']), arr(s['tags']['en'])), "      quality: %d," % int(s['quality']), '    },']
    return '\n'.join(L)
# ---- data.js
d = rd('js/surf-pesca-data.js'); nl = '\r\n' if '\r\n' in d else '\n'
if "id: 'foz-minho-moledo'" in d: raise SystemExit('ja aplicado')
i = d.index('var FISH_SPOTS'); j = d.index('\n  ];', i)
block = '\n    // Lote P2 (2026-10-08): +43 spots (5 agentes por regiao; fontes em claude/pesca-spots-lote-p2-2026-10.md)\n' + '\n'.join(entry(s) for s in S)
d = d[:j] + block.replace('\n', nl) + d[j:]
g = d.index('var FISH_GEO'); gj = d.index('\n  };', g)
geo = ',\n    // Lote P2 (2026-10-08): coordenadas OpenStreetMap/Nominatim ou fonte (ponto de acesso)\n    ' + ',\n    '.join("%s: [%.4f, %.4f]" % (q(s['id']), s['lat'], s['lng']) for s in S)
d = d[:gj] + geo.replace('\n', nl) + d[gj:]
n_fish = len(re.findall(r"tipoKey:", d[d.index('var FISH_SPOTS'):d.index('var SURF_GEO')]))
d = re.sub(r'FISH_SPOTS:\[\d+\]', 'FISH_SPOTS:[%d]' % n_fish, d, 1)
d = d.replace(' * 2026-10-08: surf lote S2', ' * 2026-10-08: pesca lote P2 (+43: Norte 8, Centro 9, Lisboa 4, Alentejo 6, Algarve 7, Madeira 4, Acores 5) com avisos de regras.' + nl + ' * 2026-10-08: surf lote S2', 1)
wr('js/surf-pesca-data.js', d)
# ---- page.js
p = rd('js/surf-pesca-page.js'); nl2 = '\r\n' if '\r\n' in p else '\n'
cred = {}
for line in open(P('_diag/pesca/p2/creditos.txt'), encoding='utf-8'):
    c = [x.strip() for x in line.split('|')]
    sid = re.search(r'`([^`]+)`', c[2]).group(1); art = c[4]
    art = re.sub(r'\s*\(.*$', '', art).rstrip('.').strip(); cred[sid] = (art, c[5], c[3])
i = p.index('var FISH_PHOTO'); j = p.index('\n  };', i)
ph = '\n    // Lote P2 (2026-10-08)\n' + '\n'.join('    %s: %s,' % (q(k), json.dumps('%s · %s' % (v[0], v[1]), ensure_ascii=False)) for k, v in cred.items())
before = p[:j].rstrip()
if not before.endswith(','): before += ','
p = before + ph.rstrip(',').replace('\n', nl2) + p[j:]
inland = [s['id'] for s in S if s.get('inland')] + ['alhandra-alverca-corvinas']
p = re.sub(r"(var FISH_INLAND = \{[^}]*)\s*\}", lambda m: m.group(1) + ', ' + ', '.join("%s: 1" % q(x) for x in dict.fromkeys(inland)) + ' }', p, 1)
rid = {'peniche-papoa': 'oeste', 'porto-dinheiro-lourinha': 'oeste', 'alges-cruz-quebrada': 'cascais'}
p = re.sub(r"(var FISH_PLAN_R_ID = \{[^}]*)\s*\}", lambda m: m.group(1) + ', ' + ', '.join("%s: %s" % (q(k), q(v)) for k, v in rid.items()) + ' }', p, 1)
wr('js/surf-pesca-page.js', p)
# ---- paginas
V = '20261008p2'
for f in ['pesca.html', 'en/pesca.html', 'surf.html', 'en/surf.html']:
    h = rd(f)
    h = re.sub(r'(surf-pesca-(?:data|page)\.js\?v=)[^"\']+', r'\g<1>' + V, h)
    if 'pesca' in f:
        h = h.replace('33 spots', '%d spots' % n_fish).replace('Ver os 25 spots', 'Ver os %d spots' % n_fish).replace('See all 25 spots', 'See all %d spots' % n_fish)
    wr(f, h)
# ---- creditos
names = {s['id']: s['name'] for s in S}
fc = rd('docs/FOTOS-CREDITOS.md'); nl3 = '\r\n' if '\r\n' in fc else '\n'
add = nl3 + '## Pesca lote P2 (2026-10-08) — images/spots/pesca-<id>-{480,800}.webp' + nl3 + nl3 + '| Tipo | Spot | Ficheiro Commons | Autor | Licença |' + nl3 + '|---|---|---|---|---|' + nl3
for line in open(P('_diag/pesca/p2/creditos.txt'), encoding='utf-8'):
    c = [x.strip() for x in line.split('|')]; sid = re.search(r'`([^`]+)`', c[2]).group(1)
    add += '| pesca | %s (`%s`) | %s | %s | %s |' % (names[sid], sid, c[3], cred[sid][0], c[5]) + nl3
wr('docs/FOTOS-CREDITOS.md', fc.rstrip() + nl3 + add)
print('fish', n_fish, 'photos', len(cred), 'inland', len(set(inland)))
