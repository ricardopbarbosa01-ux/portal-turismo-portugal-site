"""_scripts/om_cells.py — Lote A2 (09/10/2026)
Gera data/om-cells.json: para cada ponto de mar do site (praias de mar da BD, webcams de mar, spots de surf e pesca),
a celula do modelo Open-Meteo Marine que lhe corresponde (o Open-Meteo escolhe a celula de mar mais proxima).
js/om-pool.js usa este mapa para pedir cada celula UMA vez (~780 pontos -> ~130 celulas).
Correr na raiz do site depois de acrescentar praias/spots/webcams:  python3 _scripts/om_cells.py
(precisa de node para ler js/webcams-cams.js e js/surf-pesca-data.js). Pontos novos sem mapa continuam a funcionar
(o om-pool aprende a celula no 1.o pedido), so poupam menos pedidos.
"""
import json, os, subprocess, sys, time, urllib.request
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SB = 'https://glupdjvdvunogkqgxoui.supabase.co/rest/v1/beaches?select=latitude,longitude,beach_type&is_active=eq.true&limit=2000'
KEY = 'sb_publishable_HKdE2IRmz9lMDcg4p3l1tw_HiTdD4nw'  # chave publica (a mesma de js/config.js)
NODE = r'''
const fs=require('fs'),vm=require('vm'),p=require('path');const R=process.argv[1];
const w={};w.window=w;w.document={documentElement:{lang:'pt'}};w.location={pathname:'/'};
vm.runInNewContext(fs.readFileSync(p.join(R,'js/webcams-cams.js'),'utf8'),w);
vm.runInNewContext(fs.readFileSync(p.join(R,'js/surf-pesca-data.js'),'utf8'),w);
const out=[];w.WebcamsCams.cams.filter(c=>c.k==='mar').forEach(c=>out.push([c.lat,c.lng]));
[w.SurfPescaData.SURF_GEO,w.SurfPescaData.FISH_GEO].forEach(G=>Object.values(G).forEach(g=>out.push([g[0],g[1]])));
process.stdout.write(JSON.stringify(out));
'''
def key(lat, lng): return '%.4f,%.4f' % (float(lat), float(lng))
def main():
    pts = json.loads(subprocess.check_output(['node', '-e', NODE, ROOT]))
    req = urllib.request.Request(SB, headers={'apikey': KEY})
    for b in json.load(urllib.request.urlopen(req, timeout=30)):
        if b.get('beach_type') != 'fluvial' and b.get('latitude') is not None: pts.append([b['latitude'], b['longitude']])
    uniq = sorted({key(a, b) for a, b in pts})
    out_path = os.path.join(ROOT, 'data', 'om-cells.json')
    old = {}
    if os.path.exists(out_path): old = json.load(open(out_path, encoding='utf-8')).get('cells', {})
    cells = {k: v for k, v in old.items() if k in uniq}
    todo = [k for k in uniq if k not in cells]
    print('pontos', len(pts), 'coordenadas unicas', len(uniq), 'por resolver', len(todo), flush=True)
    for i in range(0, len(todo), 100):
        ch = todo[i:i + 100]
        u = ('https://marine-api.open-meteo.com/v1/marine?latitude=' + ','.join(c.split(',')[0] for c in ch) +
             '&longitude=' + ','.join(c.split(',')[1] for c in ch) + '&current=wave_height')
        r = None
        for _ in range(3):
            try: r = json.load(urllib.request.urlopen(u, timeout=40)); break
            except Exception as e: print('  nova tentativa', e, flush=True); time.sleep(30)
        if r is None: print('  falhou o bloco', i, '(fica para a proxima)'); continue
        r = r if isinstance(r, list) else [r]
        for c, o in zip(ch, r):
            cells[c] = key(o['latitude'], o['longitude']) if (o.get('current') or {}).get('wave_height') is not None else 0
            # 0 = ponto sem mar no modelo (rio/albufeira): o om-pool nem pede
        print('  bloco', i, 'ok', flush=True); time.sleep(8)
    doc = {'updated': time.strftime('%Y-%m-%d'), 'nota': 'coordenada do ponto (4 casas) -> celula Open-Meteo Marine (gerado por _scripts/om_cells.py)', 'cells': dict(sorted(cells.items()))}
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    tmp = out_path + '.tmp~'; open(tmp, 'w', encoding='utf-8').write(json.dumps(doc, separators=(',', ':'))); os.replace(tmp, out_path)
    print('celulas unicas', len(set(v for v in cells.values() if v)), 'pontos sem mar', sum(1 for v in cells.values() if v == 0), 'pontos com mapa', len(cells), 'de', len(uniq))
if __name__ == '__main__': main()
