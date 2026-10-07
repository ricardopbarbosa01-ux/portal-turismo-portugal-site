# -*- coding: utf-8 -*-
"""Procura fotos com licenca livre no Wikimedia Commons perto de cada camara sem foto (js/webcams-cams.js).
Saida: _data/commons-candidates-20261007.json  {cam_id: [candidatos ordenados]}.  Uso: python3 _scripts/commons_photos.py [inicio] [fim]
So aceita CC BY, CC BY-SA, CC0 e dominio publico; paisagem; >= 1600 px de largura."""
import json, re, sys, time, os, urllib.request, urllib.parse, unicodedata
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UA = 'PortalTurismoPortugal-webcams/1.0 (https://www.portalturismoportugal.com)'
src = open(os.path.join(ROOT, 'js', 'webcams-cams.js'), encoding='utf-8').read()
cams = json.loads(src[src.index('{', src.index('window.WebcamsCams')):src.rstrip().rstrip(';').rindex('}') + 1])['cams']
todo = [c for c in cams if 'ph' not in c and c.get('meo')]
OUT = os.path.join(ROOT, '_data', 'commons-candidates-20261007.json')
res = json.load(open(OUT, encoding='utf-8')) if os.path.isfile(OUT) else {}
a = int(sys.argv[1]) if len(sys.argv) > 1 else 0; b = int(sys.argv[2]) if len(sys.argv) > 2 else len(todo)
def norm(s): return re.sub(r'[^a-z0-9 ]', ' ', unicodedata.normalize('NFKD', s.lower()).encode('ascii', 'ignore').decode())
STOP = set('praia praias da de do das dos e a o norte sul panoramica estatica beach portugal'.split())
BAD = re.compile(r'\b(map|mapa|logo|coat|bras[aã]o|flag|bandeira|diagram|plan|planta|igreja|church|capela|chapel|interior|altar|museu|museum|azulejo|tile|food|restaurant|car|bus|train|comboio|station|esta[cç][aã]o|street|rua|house|casa|building|edif|statue|est[aá]tua|monument|portrait|retrato|selfie|wedding)\b', re.I)
LIC = re.compile(r'^(cc[- ]by(-sa)?[- ]?[0-9.]*( [a-z]+)?|cc0|public domain|pd)', re.I)
for c in todo[a:b]:
    if c['id'] in res: continue
    q = {'action': 'query', 'generator': 'geosearch', 'ggscoord': '%s|%s' % (c['lat'], c['lng']), 'ggsradius': '1500', 'ggsnamespace': '6', 'ggslimit': '40',
         'prop': 'imageinfo', 'iiprop': 'url|size|mime|extmetadata', 'iiurlwidth': '800', 'iiextmetadatafilter': 'LicenseShortName|Artist|ImageDescription|DateTimeOriginal', 'format': 'json'}
    url = 'https://commons.wikimedia.org/w/api.php?' + urllib.parse.urlencode(q)
    try:
        j = json.load(urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=20))
    except Exception as e:
        print('ERR', c['id'], e); time.sleep(3); continue
    want = (set(norm(c['t'] + ' ' + (c.get('p') or '')).split()) - STOP)
    cands = []
    for p in (j.get('query') or {}).get('pages', {}).values():
        ii = (p.get('imageinfo') or [{}])[0]; md = ii.get('extmetadata') or {}
        lic = (md.get('LicenseShortName') or {}).get('value', '')
        w, h = ii.get('width', 0), ii.get('height', 0)
        if ii.get('mime') != 'image/jpeg' or not LIC.match(lic.strip()) or w < 1600 or not h or not (1.25 <= w / h <= 2.4): continue
        title = p['title'][5:]; desc = re.sub('<[^>]+>', ' ', (md.get('ImageDescription') or {}).get('value', ''))[:200]
        if BAD.search(title) or BAD.search(desc[:80]): continue
        artist = re.sub(r'\s+', ' ', re.sub('<[^>]+>', '', (md.get('Artist') or {}).get('value', ''))).strip()[:60]
        tt = set(norm(title + ' ' + desc).split())
        score = 5 * len(want & tt) + (3 if ('praia' in norm(title) or 'beach' in norm(title)) else 0) + min(w, 4000) / 2000.0
        cands.append({'title': title, 'page': ii.get('descriptionurl'), 'thumb': ii.get('thumburl'), 'orig': ii.get('url'), 'w': w, 'h': h, 'lic': lic, 'artist': artist, 'score': round(score, 2), 'desc': desc[:120]})
    cands.sort(key=lambda x: -x['score'])
    res[c['id']] = cands[:6]
    print(c['id'], len(cands), (cands[0]['title'][:60] if cands else '-'))
    json.dump(res, open(OUT + '.tmp', 'w', encoding='utf-8'), ensure_ascii=False); os.replace(OUT + '.tmp', OUT)
    time.sleep(1.1)
print('feito', len(res), 'de', len(todo))
