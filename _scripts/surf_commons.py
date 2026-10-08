# -*- coding: utf-8 -*-
"""Fotos livres no Wikimedia Commons perto de spots novos (surf/pesca). 2026-10-08.
Uso: python3 _scripts/surf_commons.py <spots.json> <saida.json> [raio_m]
spots.json: {id: [lat, lng, "nome para pontuar"]}. So CC BY, CC BY-SA, CC0, dominio publico; paisagem; >= 1200 px.
Depois: python3 _scripts/surf_commons.py --sheet <saida.json> <pasta>  -> folhas de contacto JPG numeradas (escolha a olho)."""
import json, re, sys, time, os, io, urllib.request, urllib.parse, unicodedata
UA = 'PortalTurismoPortugal-spots/1.0 (https://www.portalturismoportugal.com)'
def norm(s): return re.sub(r'[^a-z0-9 ]', ' ', unicodedata.normalize('NFKD', s.lower()).encode('ascii', 'ignore').decode())
STOP = set('praia praias da de do das dos e a o norte sul beach portugal'.split())
BAD = re.compile(r'\b(map|mapa|logo|coat|bras[aã]o|flag|bandeira|diagram|planta|igreja|church|capela|chapel|interior|altar|museu|museum|azulejo|tile|food|restaurant|car|bus|hotel|apartment|street|rua|selfie|portrait|retrato|wedding)\b', re.I)
LIC = re.compile(r'^(cc[- ]by(-sa)?[- ]?[0-9.]*( [a-z]+)?|cc0|public domain|pd)', re.I)
def search(spots, out, radius):
    res = json.load(open(out, encoding='utf-8')) if os.path.isfile(out) else {}
    for sid, (lat, lng, name) in spots.items():
        if sid in res: continue
        q = {'action': 'query', 'generator': 'geosearch', 'ggscoord': '%s|%s' % (lat, lng), 'ggsradius': str(radius), 'ggsnamespace': '6', 'ggslimit': '50',
             'prop': 'imageinfo', 'iiprop': 'url|size|mime|extmetadata', 'iiurlwidth': '800', 'iiextmetadatafilter': 'LicenseShortName|Artist|ImageDescription|DateTimeOriginal', 'format': 'json'}
        try:
            j = json.load(urllib.request.urlopen(urllib.request.Request('https://commons.wikimedia.org/w/api.php?' + urllib.parse.urlencode(q), headers={'User-Agent': UA}), timeout=25))
        except Exception as e:
            print('ERR', sid, e); time.sleep(3); continue
        want = set(norm(name).split()) - STOP
        cands = []
        for p in (j.get('query') or {}).get('pages', {}).values():
            ii = (p.get('imageinfo') or [{}])[0]; md = ii.get('extmetadata') or {}
            lic = (md.get('LicenseShortName') or {}).get('value', '').strip()
            w, h = ii.get('width', 0), ii.get('height', 0)
            if ii.get('mime') != 'image/jpeg' or not LIC.match(lic) or w < 1200 or not h or not (1.2 <= w / h <= 2.6): continue
            title = p['title'][5:]; desc = re.sub('<[^>]+>', ' ', (md.get('ImageDescription') or {}).get('value', ''))[:200]
            if BAD.search(title) or BAD.search(desc[:80]): continue
            artist = re.sub(r'\s+', ' ', re.sub('<[^>]+>', '', (md.get('Artist') or {}).get('value', ''))).strip()[:60]
            tt = set(norm(title + ' ' + desc).split())
            score = 5 * len(want & tt) + (4 if 'surf' in tt else 0) + (2 if ('praia' in tt or 'beach' in tt) else 0) + min(w, 4000) / 2000.0
            cands.append({'title': title, 'page': ii.get('descriptionurl'), 'thumb': ii.get('thumburl'), 'w': w, 'h': h, 'lic': lic, 'artist': artist, 'score': round(score, 2), 'desc': desc[:140]})
        cands.sort(key=lambda x: -x['score'])
        res[sid] = cands[:12]
        print(sid, len(cands), (cands[0]['title'][:60] if cands else '-'))
        json.dump(res, open(out + '.tmp', 'w', encoding='utf-8'), ensure_ascii=False); os.replace(out + '.tmp', out)
        time.sleep(1.2)
def sheet(out, folder):
    from PIL import Image, ImageDraw
    res = json.load(open(out, encoding='utf-8'))
    for sid, cands in res.items():
        dst = os.path.join(folder, 'sheet-%s.jpg' % sid)
        if os.path.isfile(dst) or not cands: continue
        tiles = []
        for i, c in enumerate(cands):
            try:
                raw = urllib.request.urlopen(urllib.request.Request(c['thumb'], headers={'User-Agent': UA}), timeout=25).read()
                im = Image.open(io.BytesIO(raw)).convert('RGB'); im.thumbnail((400, 260)); tiles.append((i, im))
            except Exception as e: print('ERR thumb', sid, i, e)
            time.sleep(0.4)
        cols = 4; rows = (len(tiles) + cols - 1) // cols
        S = Image.new('RGB', (cols * 410, rows * 290), 'white'); d = ImageDraw.Draw(S)
        for k, (i, im) in enumerate(tiles):
            x, y = (k % cols) * 410 + 5, (k // cols) * 290 + 5
            S.paste(im, (x, y)); d.rectangle([x, y, x + 34, y + 26], fill='black'); d.text((x + 8, y + 6), str(i), fill='yellow')
            d.text((x, y + 264), cands[i]['title'][:62], fill='black')
        S.save(dst, quality=82); print('sheet', sid, len(tiles))
if __name__ == '__main__':
    if sys.argv[1] == '--sheet': sheet(sys.argv[2], sys.argv[3])
    else: search(json.load(open(sys.argv[1], encoding='utf-8')), sys.argv[2], int(sys.argv[3]) if len(sys.argv) > 3 else 1200)
