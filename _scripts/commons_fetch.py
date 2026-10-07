# -*- coding: utf-8 -*-
"""Descarrega as fotos escolhidas (_data/commons-picks-20261007.json) e grava images/webcams/<id>-{480,800}.webp. Retomavel."""
import json, os, io, sys, time, urllib.request
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UA = 'PortalTurismoPortugal-webcams/1.0 (https://www.portalturismoportugal.com)'
cand = json.load(open(os.path.join(ROOT, '_data', 'commons-candidates-20261007.json'), encoding='utf-8'))
picks = json.load(open(os.path.join(ROOT, '_data', 'commons-picks-20261007.json'), encoding='utf-8'))
t0 = time.time()
for cid, i in picks.items():
    if cid.startswith('_'): continue
    out = os.path.join(ROOT, 'images', 'webcams', cid)
    if os.path.isfile(out + '-800.webp') and os.path.isfile(out + '-480.webp'): continue
    if time.time() - t0 > 150: print('pausa'); sys.exit(0)
    c = cand[cid][i]
    raw = urllib.request.urlopen(urllib.request.Request(c['thumb'], headers={'User-Agent': UA}), timeout=30).read()
    im = Image.open(io.BytesIO(raw)).convert('RGB')
    w, h = im.size; tw = int(h * 1.6)  # recorte 16:10 centrado (como no cartao)
    if w > tw: im = im.crop(((w - tw) // 2, 0, (w - tw) // 2 + tw, h))
    else:
        th = int(w / 1.6); im = im.crop((0, (h - th) // 2, w, (h - th) // 2 + th))
    for W in (800, 480):
        r = im.resize((W, int(W / 1.6)), Image.LANCZOS)
        r.save(out + '-%d.webp' % W, 'WEBP', quality=72, method=6)
    print('ok', cid); time.sleep(0.3)
print('feito')
