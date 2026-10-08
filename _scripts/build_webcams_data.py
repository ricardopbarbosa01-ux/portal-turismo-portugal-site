# -*- coding: utf-8 -*-
"""Gera js/webcams-cams.js (pagina /webcams v2).
Fontes:
  _data/meo-livecams-20261007.json  lista publica beachcam.meo.pt/livecams (nome, municipio, regiao, lat/lng, cliques) — SO LINK, nunca incorporar
  _data/beaches-db-20261008.json    praias da BD (id, nome, coords) -> foto images/beaches/<id> + link /beach?id=
  docs/FOTOS-CREDITOS.md            so se usa foto com linha de credito (autor + licenca)
  YT (abaixo)                       diretos YouTube verificados 07/10/2026 (oEmbed 200 + isLive) — aprovar com o Ricardo
Correr: python3 _scripts/build_webcams_data.py
"""
import json, re, os, math, unicodedata
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = lambda *a: os.path.join(ROOT, *a)

meo = json.load(open(P('_data', 'meo-livecams-20261007.json'), encoding='utf-8'))
db = json.load(open(P('_data', 'beaches-db-20261008.json'), encoding='utf-8'))

# ---------- creditos ----------
cred_praia, cred_surf = {}, {}
for line in open(P('docs', 'FOTOS-CREDITOS.md'), encoding='utf-8'):
    m = re.match(r'\| (praia|surf) \| (.*?) \| \[.*?\]\((.*?)\) \| (.*?) \| (.*?) \|', line)
    if not m: continue
    kind, local, url, autor, lic = m.groups()
    if kind == 'praia': cred_praia[local.strip()] = (url, autor.strip(), lic.strip())
    else:
        k = re.search(r'`([^`]+)`', local)
        if k: cred_surf[k.group(1)] = (url, autor.strip(), lic.strip())

def norm(s):
    return re.sub(r'[^a-z0-9 ]', ' ', unicodedata.normalize('NFKD', s.lower()).encode('ascii', 'ignore').decode())
STOP = set('praia praias da de do das dos e a o norte sul estatica panoramica fisica s sao'.split())
def toks(s): return set(norm(s).split()) - STOP
def dist(a, b, c, d):
    p = math.radians
    return 6371 * math.hypot(p(d - b) * math.cos(p((a + c) / 2)), p(c - a))

# ---------- regioes ----------
# (regiao de apresentacao, regiao do planeador v3)
REG = {'norte': ('norte', 'minho'), 'centro': ('centro', 'costa-prata'), 'nazare': ('centro', 'costa-prata'),
       'costa-oeste': ('oeste', 'oeste'), 'peniche': ('oeste', 'oeste'), 'mafra': ('oeste', 'oeste'),
       'cascais': ('lisboa', 'cascais'), 'oeiras': ('lisboa', 'cascais'), 'sintra': ('lisboa', 'cascais'),
       'almada': ('lisboa', 'setubal'), 'sesimbra': ('lisboa', 'setubal'), 'setubal': ('lisboa', 'setubal'),
       'alentejo': ('alentejo', 'alentejo'), 'algarve': ('algarve', 'algarve'), 'costa-vicentina': ('algarve', 'algarve'),
       'madeira': ('madeira', 'madeira'), 'acores': ('acores', 'acores'),
       'lagos-e-rios': ('rios', ''), 'fluviaispiscinas': ('rios', '')}
SEA_OVERRIDE = {'farol-do-bugio-norte': ('lisboa', 'cascais'), 'farol-do-bugio-sul': ('lisboa', 'cascais'), 'lisboa-belem': ('lisboa', 'cascais')}
RIVER = {'lisboa-belem'}
EXCLUDE = {'boardriders-skatepark', 'ski-clube-quinta-grande', 'viana-do-castelo-wakepark', 'ferreira-do-zezere-lago-azul-cable-park'}
VARIANT = {'norte', 'sul', 'este', 'oeste', 'panoramica', 'marina', 'miradouro', 'navio', 'cds norte', 'cds sul'}
PLACE_FIX = {'Costa de Caparica': 'Costa da Caparica', 'Praia Quarteira': 'Quarteira', 'V.N.Milfontes': 'Vila Nova de Milfontes'}  # vista de rio (Tejo), sem dados de mar

# Coordenadas erradas na lista da MEO (repetem as de outra camara) -> corrigidas com o OpenStreetMap (Nominatim) a 07/10/2026
COORD_FIX = {'almograve': (37.6498, -8.8035), 'vila-nova-de-milfontes-franquia': (37.7218, -8.7880), 'madeira-paul-do-mar': (32.7548, -17.2272), 'madeira-jardim-do-mar': (32.7376, -17.2111)}
for _c in meo:
    if _c['slug'] in COORD_FIX: _c['lat'], _c['lng'] = COORD_FIX[_c['slug']]
MUNI_FIX = {'leca-da-palmeira-panoraminca-aterro': 'MATOSINHOS'}

def title_case(s):
    s = s.strip()
    if s.isupper() and len(s) > 3:
        s = s.title()
    return s.replace(' Da ', ' da ').replace(' De ', ' de ').replace(' Do ', ' do ').replace(' Das ', ' das ').replace(' Dos ', ' dos ').replace(' E ', ' e ').replace('Cds', 'CDS')

def muni_name(m):
    m = re.sub(r'\s*\((ALGARVE|MADEIRA)\)', '', m).strip()
    return title_case(m)

TITLE_FIX = {
    'praia-da-alagoa': ('Alagoa · Altura', 'Castro Marim'),
    'praia-canide-norte-sul': ('Praia de Canide', None),
    'porto-homem-do-leme': ('Homem do Leme · Foz', 'Porto'),
    'porto-carneiro': ('Carneiro · Foz', 'Porto'),
    'praia-de-matosinhos': ('Matosinhos', 'Porto'),
    'caxinas-macaco-17': ('Caxinas', 'Vila do Conde'),
    'praia-verde': ('Praia Verde', None),
    'praia-da-rocha': ('Praia da Rocha · Panorâmica', None),
    'ribeira-dilhas': ("Ribeira d'Ilhas", 'Ericeira'),
    'ericeira': ('Reef · Pedra Branca', 'Ericeira'),
    'ericeira-praia-do-sul': ('Praia do Sul', 'Ericeira'),
    'praia-dos-pescadores': ('Praia dos Pescadores', 'Ericeira'),
    'ericeira-praia-da-calada': ('Praia da Calada', 'Mafra'),
    'bafureira': ('Bafureira', None),
    'santa-cruz-norte-fisica': ('Santa Cruz · Norte', 'Torres Vedras'),
    'figueira-da-foz-cabedelo-buarcos': ('Figueira da Foz · Panorâmica', None),
    'praia-sesimbra': ('Praia de Sesimbra', None),
    'acores-ribeira-grande-praia-do-monte-verde': ('Praia do Monte Verde', 'Ribeira Grande, São Miguel'),
    'porto-santo': ('Porto Santo', 'Madeira'),
}
ALIASES = {
    'porto-homem-do-leme': 'porto oporto foz do douro porto webcam',
    'porto-carneiro': 'porto oporto foz do douro',
    'praia-de-matosinhos': 'porto oporto',
    'leca-da-palmeira': 'porto oporto',
    'caxinas-macaco-17': 'povoa de varzim povoa vila do conde',
    'peniche-supertubos': 'supertubos peniche surf',
    'praia-do-norte': 'nazare big waves ondas gigantes canhao',
    'praia-do-norte-canhao-nazare': 'nazare big waves ondas gigantes canhao',
    'praia-da-luz': 'lagos luz',
    'meia-praia': 'lagos',
    'praia-de-carcavelos': 'lisboa lisbon cascais',
    'costa-da-caparica': 'lisboa lisbon caparica',
    'praia-do-guincho': 'cascais lisboa kite windsurf',
    'ribeira-dilhas': 'ericeira surf',
    'praia-da-rocha': 'portimao algarve',
    'praia-da-falesia': 'albufeira vilamoura algarve',
    'praia-da-gale': 'albufeira algarve',
    'praia-do-peneco': 'albufeira algarve',
    'faro': 'faro algarve',
}
NEAR = {'caxinas-macaco-17': {'pt': 'Câmara mais perto da Póvoa de Varzim (~3 km)', 'en': 'Closest camera to Póvoa de Varzim (~3 km)'}}

# fotos de surf (credito completo) -> camaras
SURF_PH = {
    'peniche-supertubos': 'supertubos', 'praia-do-norte': 'praia-da-nazare', 'praia-do-norte-canhao-nazare': 'praia-da-nazare',
    'praia-do-amado': 'praia-do-amado', 'costa-da-caparica': 'costa-da-caparica', 'praia-do-guincho': 'praia-do-guincho',
    'praia-do-guincho-norte': 'praia-do-guincho', 'praia-de-matosinhos': 'praia-de-matosinhos', 'arrifana': 'praia-da-arrifana-algarve',
    'viana-do-castelo-afife-arda': 'praia-de-afife', 'viana-do-castelo-cabedelo': 'praia-de-cabedelo', 'vila-praia-de-ancora': 'praia-de-ancora',
    'esposende': 'praia-de-esposende-surf', 'ofir': 'praia-de-ofir', 'furadouro': 'praia-do-furadouro', 'praia-de-mira': 'praia-de-mira',
    'praia-da-tocha': 'praia-da-tocha', 'figueira-da-foz-tamargueira': 'praia-de-buarcos', 'odeceixe': 'praia-de-odeceixe',
}
# paginas estaticas praias/<slug>/ (PT) e en/praias/<slug>/ (EN)
PRAIA_PAGE = {
    'praia-da-luz': 'praia-da-luz', 'praia-da-rocha': 'praia-da-rocha', 'carvoeiro': 'praia-de-carvoeiro', 'armacao-de-pera': 'praia-de-armacao-de-pera',
    'praia-da-gale': 'praia-da-gale', 'praia-da-falesia': 'praia-da-falesia', 'senhora-da-rocha-praia-nova': 'praia-da-senhora-da-rocha',
    'arrifana': 'praia-da-arrifana', 'praia-do-amado': 'praia-do-amado', 'monte-clerigo': 'praia-de-monte-clerigo', 'odeceixe': 'praia-de-odeceixe',
    'cordoama': 'praia-da-cordoama', 'ilha-do-farol-culatra': 'ilha-da-culatra', 'praia-de-carcavelos': 'praia-de-carcavelos',
    'praia-do-guincho': 'praia-do-guincho', 'praia-do-meco': 'praia-do-meco', 'lagoa-de-albufeira': 'lagoa-de-albufeira',
    'praia-de-mira': 'praia-de-mira', 'praia-da-vieira': 'praia-de-vieira-de-leiria', 'porto-santo': 'praia-do-porto-santo',
    'praia-da-barra': 'praia-da-barra', 'costa-nova': 'praia-de-costa-nova', 'praia-de-espinho': 'praia-de-espinho', 'esposende': 'praia-de-esposende',
    'praia-de-matosinhos': 'praia-de-matosinhos', 'sao-pedro-de-moel': 'praia-de-sao-pedro-de-moel', 'faro': 'praia-de-faro', 'alvor': 'praia-de-alvor',
    'ferragudo': 'praia-de-ferragudo', 'meia-praia': 'meia-praia', 'sagres': 'praia-de-sagres', 'vilamoura': 'praia-de-vilamoura',
    'comporta': 'praia-da-comporta', 'praia-sesimbra': 'praia-de-sesimbra', 'praia-grande': 'praia-grande-sintra',
    'peniche-supertubos': 'supertubos-peniche', 'praia-do-norte': 'praia-do-norte-nazare', 'praia-do-norte-canhao-nazare': 'praia-do-norte-nazare',
    'figueira-da-foz-cabedelo': 'praia-da-figueira-da-foz', 'costa-da-caparica': 'costa-de-caparica', 'praia-da-amoreira': 'praia-da-amoreira-aljezur',
    'praia-da-alagoa': 'praia-da-altura',
}
ALT_HOST = {'praia-da-rocha-estatica': 'praia-da-rocha', 'praia-do-guincho-estatica': 'praia-do-guincho',
            'costa-de-caparica-sao-joao-estatica': 'costa-de-caparica-sao-joao-cova-do-vapor', 'costadecaparicapraianorteestatica': 'costa-de-caparica-praia-do-norte'}
# camaras agrupadas (angulo extra no painel em vez de cartao proprio)
ALT_LABEL = {'pt': 'Ângulo fixo', 'en': 'Fixed angle'}

# Diretos YouTube (07/10/2026: oEmbed 200 + isLive + playableInEmbed). attach = camara MEO a que se junta; senao cartao novo.
YT = [
    dict(id='yt-porto-ribeira', yt='lfrjNVD10RU', by='Webcamtaxi', t='Ribeira · Douro', p='Porto', r='norte', pr='minho', k='rio', lat=41.1405, lng=-8.6131, pop=1900,
         al='porto oporto ribeira douro ponte luis i gaia porto webcam porto live cam'),
    dict(attach='praia-do-norte-canhao-nazare', yt='_Gi8UC_HPKM', by='Explore.org'),
    dict(attach='praia-da-rocha-marina', yt='w7rzgn6WXs8', by='Playocean'),
    dict(attach='praia-do-meco', yt='EqnyST2s53I', by='Playocean'),
    dict(id='yt-caparica-arriba', yt='oDbKeeojgyk', by='Playocean', t='Panorâmica · Arriba Fóssil', p='Costa da Caparica', r='lisboa', pr='setubal', k='mar', lat=38.640, lng=-9.238, al='caparica lisboa lisbon'),
    dict(id='yt-caparica-infante', yt='9K9f_tgRDXI', by='Playocean', t='Praia do Infante', p='Costa da Caparica', r='lisboa', pr='setubal', k='mar', lat=38.620, lng=-9.220, al='caparica lisboa lisbon'),
    dict(id='yt-funchal-formosa', yt='ZNf42SF9lXM', by='Madeira-Web', t='Praia Formosa', p='Funchal', r='madeira', pr='madeira', k='mar', lat=32.640, lng=-16.950, al='funchal madeira'),
    dict(id='yt-funchal-barreirinha', yt='9iLdNRPGFuQ', by='Madeira-Web', t='Barreirinha', p='Funchal', r='madeira', pr='madeira', k='mar', lat=32.646, lng=-16.898, al='funchal madeira'),
    dict(id='yt-funchal-marina', yt='f6D3Zq6J5A8', by='Madeira-Web', t='Marina do Funchal', p='Funchal', r='madeira', pr='madeira', k='mar', lat=32.646, lng=-16.909, al='funchal madeira'),
    dict(id='yt-funchal-baia', yt='_idE_q5kgtA', by='Webcamtaxi', t='Baía do Funchal', p='Funchal', r='madeira', pr='madeira', k='mar', lat=32.660, lng=-16.920, al='funchal madeira'),
    dict(id='yt-canico-reis-magos', yt='PujA-AJpbek', by='Madeira-Web', t='Praia dos Reis Magos', p='Caniço', r='madeira', pr='madeira', k='mar', lat=32.637, lng=-16.817, al='canico madeira'),
    dict(id='yt-ponta-do-sol', yt='BuL1tgahkXM', by='Portal Netmadeira', t='Ponta do Sol', p='Madeira', r='madeira', pr='madeira', k='mar', lat=32.679, lng=-17.101, al='madeira'),
    dict(id='yt-porto-moniz', yt='owvg72MlX5I', by='Madeira-Web', t='Porto Moniz', p='Madeira', r='madeira', pr='madeira', k='mar', lat=32.868, lng=-17.168, al='madeira piscinas naturais'),
]

def base_of(c):
    n = c['name']
    b = re.sub(r'\s*\|?\s*(Estática|Física)\s*\|?\s*$', '', n).strip()
    b = re.sub(r'\s+Estática$', '', b).strip()
    if b.startswith('Nazaré | Forte S. Miguel Arcanjo'): b = 'Nazaré | Forte S. Miguel Arcanjo'
    return b

by_name = {c['name'].strip(): c for c in meo}
groups = {}
for c in sorted(meo, key=lambda c: -c['clicks']):
    b = base_of(c)
    host = None
    if b != c['name'].strip():
        host = by_name.get(b) or by_name.get(b + ' ')
        if host is None and b.startswith('Nazaré | Forte'): host = by_name.get('Nazaré | Forte S. Miguel Arcanjo')
    if c['slug'] == 'bafureira': host = None
    if c['slug'] in ALT_HOST: host = next(x for x in meo if x['slug'] == ALT_HOST[c['slug']])
    if host is not None and host['slug'] != c['slug']:
        groups.setdefault(host['slug'], []).append(c)
    else:
        groups.setdefault(c['slug'], groups.get(c['slug'], []))
merged = {s for v in groups.values() for s in [x['slug'] for x in v]}

COMMONS_CAND = json.load(open(P('_data', 'commons-candidates-20261007.json'), encoding='utf-8')) if os.path.isfile(P('_data', 'commons-candidates-20261007.json')) else {}
COMMONS_PICK = {k: v for k, v in (json.load(open(P('_data', 'commons-picks-20261007.json'), encoding='utf-8')) if os.path.isfile(P('_data', 'commons-picks-20261007.json')) else {}).items() if not k.startswith('_')}
def clean_artist(a):
    a = re.sub(r'\s+from\s+.*$', '', a or '').strip()
    a = re.sub(r'\s*\(.*$', '', a).strip()
    return a[:40] or 'Wikimedia Commons'

def photo_for(c):
    s = c['slug']
    if s in SURF_PH and SURF_PH[s] in cred_surf and os.path.isfile(P('images', 'spots', 'surf-%s-480.webp' % SURF_PH[s])):
        url, a, l = cred_surf[SURF_PH[s]]
        return ['/images/spots/surf-' + SURF_PH[s], a + ' · ' + l, url]
    # 1.o: foto escolhida a mao para esta camara; depois foto da praia da BD
    # fotos do Wikimedia Commons escolhidas a mao para esta camara (_scripts/commons_photos.py + commons_fetch.py)
    if s in COMMONS_PICK and os.path.isfile(P('images', 'webcams', s + '-480.webp')):
        c = COMMONS_CAND[s][COMMONS_PICK[s]]
        return ['/images/webcams/' + s, clean_artist(c['artist']) + ' · ' + c['lic'], c['page']]
    nm = c['name'].split('|')
    ct = toks(' '.join(nm[1:]) if len(nm) > 1 else nm[0])
    ch = toks(nm[0]) if len(nm) > 1 else set()
    best = None
    for b in db:
        if not b.get('latitude') or b['name'] not in cred_praia: continue
        if not os.path.isfile(P('images', 'beaches', b['id'] + '-480.webp')): continue
        d = dist(c['lat'], c['lng'], b['latitude'], b['longitude'])
        if d > 3: continue
        tb = toks(b['name'])
        if not (ct & tb) and not (ch & tb and d < 1.5): continue
        score = len(ct & tb) * 10 - d
        if best is None or score > best[0]: best = (score, b)
    if best:
        b = best[1]; url, a, l = cred_praia[b['name']]
        return ['/images/beaches/' + b['id'], a + ' · ' + l, url]
    return None

def beach_for(c):
    s = c['slug']
    if s in PRAIA_PAGE and os.path.isfile(P('praias', PRAIA_PAGE[s], 'index.html')):
        en = os.path.isfile(P('en', 'praias', PRAIA_PAGE[s], 'index.html'))
        return ['p', PRAIA_PAGE[s], 1 if en else 0]
    ct = toks(c['name']); best = None
    for b in db:
        if not b.get('latitude'): continue
        d = dist(c['lat'], c['lng'], b['latitude'], b['longitude'])
        if d > 2.5 or not (ct & toks(re.sub(r'\(.*?\)', '', b['name']))): continue  # o que esta entre parenteses e so desambiguacao
        if best is None or d < best[0]: best = (d, b)
    return ['b', best[1]['id'], 1] if best else None

out = []
for c in meo:
    s = c['slug']
    if s in merged or s in EXCLUDE: continue
    reg, pr = SEA_OVERRIDE.get(s) or REG.get(c['region'], ('rios', ''))
    k = 'rio' if (reg == 'rios' or s in RIVER) else 'mar'
    name = c['name'].replace('  ', ' ').strip().rstrip('|').strip()
    muni = muni_name(MUNI_FIX.get(s, c['muni']))
    if s in TITLE_FIX:
        t, p = TITLE_FIX[s]; p = p or muni
    elif '|' in name:
        parts = [title_case(x) for x in name.split('|') if x.strip() and norm(x).strip() not in ('estatica',)]
        parts = [re.sub(r'\s*Estática$', '', x).strip() for x in parts]
        head, rest = PLACE_FIX.get(parts[0], parts[0]), parts[1:]
        if head == 'Madeira':
            t, p = ' · '.join(rest), muni + ', Madeira'
        elif rest and norm(rest[0]).strip() in VARIANT and head not in ('Costa da Caparica', 'Figueira da Foz'):
            t, p = head + ' · ' + ' · '.join(rest), muni
        elif not rest:
            t, p = head, muni
        else:
            t, p = ' · '.join(rest), head
    else:
        t, p = title_case(name), muni
    t = re.sub(r'\s*Estática$', '', t).replace('SUL', 'Sul').replace('NORTE', 'Norte').strip()
    if norm(p).strip() and norm(p).strip() in norm(t): p = muni if norm(muni).strip() not in norm(t) else ''
    if c['region'] == 'madeira' and 'Madeira' not in p: p = p + ', Madeira'
    o = dict(id=s, t=t, p=p, r=reg, pr=pr, k=k, lat=round(c['lat'], 4), lng=round(c['lng'], 4), pop=round(c['clicks'] / 1000), meo=s)
    alts = groups.get(s) or []
    if alts:
        def alt_label(a):
            parts = [x.strip() for x in a['name'].split('|') if x.strip()]
            lab = title_case(parts[-1]) if len(parts) > 1 else 'Estática'
            lab = lab.replace('Forte S. Miguel Arcanjo ', '').strip()
            return lab or 'Estática'
        o['alt'] = [[a['slug'], alt_label(a)] for a in alts]
    ph = photo_for(c)
    if ph: o['ph'] = ph
    bp = beach_for(c)
    if bp: o['bp'] = bp
    if s in ALIASES: o['al'] = ALIASES[s]
    if s in NEAR: o['near'] = NEAR[s]
    out.append(o)

idx = {o['id']: o for o in out}
for y in YT:
    if 'attach' in y:
        idx[y['attach']]['yt'] = [y['yt'], y['by']]
    else:
        o = {k: v for k, v in y.items() if k not in ('yt', 'by')}
        o['yt'] = [y['yt'], y['by']]; o['pop'] = y.get('pop', 150)
        bp = beach_for({'slug': y['id'], 'name': y['t'], 'lat': y['lat'], 'lng': y['lng']})  # liga o direto YouTube a pagina da praia
        if bp: o['bp'] = bp
        out.append(o)

out.sort(key=lambda o: (-o['pop'], o['t']))
js = ('/* js/webcams-cams.js — GERADO por _scripts/build_webcams_data.py (nao editar a mao).\n'
      ' * Camaras MEO: so link (beachcam.meo.pt/livecams/<meo>/). YouTube: incorporacao permitida pelo dono (verificado 07/10/2026).\n'
      ' * Campos: t titulo, p local, r regiao, pr regiao do planeador, k mar|rio, pop popularidade MEO (milhares de cliques),\n'
      ' *         alt angulos extra, ph [foto base, credito, origem], bp praia interna [p=praias/<slug>/|b=beach?id=, id, tem EN], yt [id, dono]\n */\n'
      'window.WebcamsCams = ' + json.dumps({'updated': '2026-10-07', 'total': len(meo), 'cams': out}, ensure_ascii=False, separators=(',', ':')) + ';\n')
tmp = P('js', 'webcams-cams.js.tmp')
open(tmp, 'w', encoding='utf-8').write(js)
os.replace(tmp, P('js', 'webcams-cams.js'))
print('cartoes', len(out), 'meo', len(meo), 'agrupadas', len(merged), 'com foto', sum(1 for o in out if 'ph' in o), 'com praia', sum(1 for o in out if 'bp' in o), 'bytes', len(js.encode()))

# ---------- diretorio estatico (SEO) dentro de webcams.html / en/webcams.html ----------
import html as _html
REG_ORDER = ['norte', 'centro', 'oeste', 'lisboa', 'alentejo', 'algarve', 'madeira', 'acores', 'rios']
REG_LABEL = {'pt': {'norte': 'Norte', 'centro': 'Centro', 'oeste': 'Oeste', 'lisboa': 'Lisboa e Setúbal', 'alentejo': 'Alentejo', 'algarve': 'Algarve', 'madeira': 'Madeira', 'acores': 'Açores', 'rios': 'Rios e lagos'},
             'en': {'norte': 'North', 'centro': 'Centre', 'oeste': 'West coast', 'lisboa': 'Lisbon & Setúbal', 'alentejo': 'Alentejo', 'algarve': 'Algarve', 'madeira': 'Madeira', 'acores': 'Azores', 'rios': 'Rivers & lakes'}}
def directory(lang):
    e = _html.escape
    parts = ['<div class="wd__grid">']
    for r in REG_ORDER:
        items = sorted([o for o in out if o['r'] == r], key=lambda o: norm(o['t']))
        if not items: continue
        parts.append('<details class="wd__reg" open><summary><h3>%s <small>%d</small></h3></summary><ul>' % (e(REG_LABEL[lang][r]), len(items)))
        for o in items:
            parts.append('<li><a href="#cam-%s" data-open="%s">%s</a><small>%s</small></li>' % (e(o['id']), e(o['id']), e(o['t']), e(o.get('p') or '')))
        parts.append('</ul></details>')
    parts.append('</div>')
    return ''.join(parts)
for lang, f in (('pt', 'webcams.html'), ('en', os.path.join('en', 'webcams.html'))):
    fp = P(f)
    if not os.path.isfile(fp): continue
    h = open(fp, encoding='utf-8').read()
    a = h.find('<!-- WCAM-DIR:START'); b = h.find('<!-- WCAM-DIR:END -->')
    if a < 0 or b < 0: continue
    a = h.find('-->', a) + 3
    h = h[:a] + '\n      ' + directory(lang) + '\n      ' + h[b:]
    open(fp + '.tmp', 'w', encoding='utf-8').write(h); os.replace(fp + '.tmp', fp)
    print('diretorio', lang, 'ok')
