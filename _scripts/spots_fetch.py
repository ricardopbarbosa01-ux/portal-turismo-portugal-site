# -*- coding: utf-8 -*-
"""Descarrega fotos escolhidas do Commons e grava images/spots/<prefixo>-<id>-{480,800}.webp (recorte 3:2 centrado). 2026-10-08.
Uso: python3 _scripts/spots_fetch.py <candidatos.json> <picks.json> <prefixo surf|pesca>
picks.json: {id: indice_no_candidatos}. Imprime as linhas para docs/FOTOS-CREDITOS.md."""
import json, os, io, re, sys, time, urllib.request, urllib.parse
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UA = 'PortalTurismoPortugal-spots/1.0 (https://www.portalturismoportugal.com)'
cand = json.load(open(sys.argv[1], encoding='utf-8')); picks = json.load(open(sys.argv[2], encoding='utf-8')); pre = sys.argv[3]
for sid, i in picks.items():
    c = cand[sid][i]; out = os.path.join(ROOT, 'images', 'spots', '%s-%s' % (pre, sid))
    th = c['thumb'].split('?')[0]  # Commons so aceita larguras-padrao de miniatura (https://w.wiki/GHai): 1280
    url = re.sub(r'/\d+px-', '/1280px-', th) if c['w'] > 1280 else th  # original pequeno: a miniatura de 960 px chega
    if not (os.path.isfile(out + '-800.webp') and os.path.isfile(out + '-480.webp')):
        raw = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=40).read()
        im = Image.open(io.BytesIO(raw)).convert('RGB'); w, h = im.size; tw = int(h * 1.5)
        if w > tw: im = im.crop(((w - tw) // 2, 0, (w - tw) // 2 + tw, h))
        else: th = int(w / 1.5); im = im.crop((0, (h - th) // 2, w, (h - th) // 2 + th))
        for S in (800, 480): im.resize((S, int(round(S / 1.5))), Image.LANCZOS).save(out + '-%d.webp' % S, 'WEBP', quality=72, method=6)
        time.sleep(0.5)
    artist = re.sub(r'\s+from\s+.*$', '', c['artist']).strip()
    print('| %s | %s (`%s`) | [%s](%s) | %s | %s |' % (pre, sid, sid, c['title'], c['page'], artist, c['lic']))
