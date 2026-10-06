"""Testes: links antigos (formato v2) + praia de origem + atribuicao por ponto de entrada — Planeador v3 (06/10/2026).
Reutiliza setup() de suite_en_pwa.py (mesmo diretorio)."""
import asyncio, json, os, time
from urllib.parse import urlparse, parse_qs, quote
HERE = os.path.dirname(os.path.abspath(__file__))
_f = next(f for f in ('suite_en_pwa_go.py', 'suite_en_pwa_producao_planeador.py') if os.path.exists(os.path.join(HERE, f)))
_src = open(os.path.join(HERE, _f), encoding='utf-8').read().split('async def main')[0]
exec(_src)  # setup, PT, EN, rec, RESULTS, flow_en, L ...
RESULTS.clear()

SHARE_SPY = "window.__shared=null;Object.defineProperty(navigator,'share',{value:(d)=>{window.__shared=d.url;return Promise.resolve()},configurable:true});"

async def state(pg):
    return await pg.evaluate("""({count:document.getElementById('pv3-count').textContent.trim(),
      rows:[...document.querySelectorAll('#pv3-prev-rows li')].map(li=>li.innerText.replace(/\\s+/g,' ').trim()),
      sel:[...document.querySelectorAll('.pv3-opt.is-sel strong')].map(e=>e.textContent)})""")

async def finish_pt(pg):
    """A partir do passo atual, completa o planeador PT com valores fixos e gera o plano."""
    for _ in range(6):
        c = (await pg.text_content('#pv3-count')).strip()
        if 'Passo 1' in c:
            if not await pg.locator('.pv3-opt.is-sel').count(): await pg.click('.pv3-opt:has-text("Praia")')
            await pg.click('#pv3-next'); await pg.wait_for_timeout(400)
        elif 'Passo 2' in c:
            if await pg.locator('#pv3-next').is_disabled(): await pg.click('.pv3-opt:has-text("Algarve")'); await pg.wait_for_timeout(700)
            else: await pg.click('#pv3-next'); await pg.wait_for_timeout(400)
        elif 'Passo 3' in c:
            await pg.fill('#pv3-d1', '2026-12-04'); await pg.dispatch_event('#pv3-d1', 'change')
            await pg.fill('#pv3-d2', '2026-12-08'); await pg.dispatch_event('#pv3-d2', 'change')
            await pg.click('#pv3-next'); await pg.wait_for_timeout(400)
        elif 'Passo 4' in c:
            await pg.click('.pv3-opt:has-text("A dois")'); await pg.wait_for_timeout(600)
        elif 'Passo 5' in c:
            await pg.click('.pv3-opt:has-text("Confortável")'); await pg.click('#pv3-next'); await pg.wait_for_timeout(2800)
            return

async def hrefs(pg):
    return await pg.evaluate("""({stay:(document.querySelector('#resultado a[data-plan-kind=stay]')||{}).href||'',
      gyg:[...document.querySelectorAll('#resultado a[href*="getyourguide"]')].map(a=>a.href),
      map:(document.querySelector('#resultado iframe')||{}).src||''})""")

def q(u, k):
    return (parse_qs(urlparse(u).query).get(k) or [''])[0]

# ── L1 links antigos: abrem já pré-preenchidos ────────────────────────────
LEGACY = [
    ('webcams Nazaré', '?source=webcams&region=Centro&intent=alojamento', 'Passo 1', [], 'Costa de Prata'),
    ('pesca costeira', '?source=pesca&tipo=pesca&subtipo=costeira&intent=planear', 'Passo 2', ['Pesca'], ''),
    ('escola de surf', '?source=surf&tipo=surf&nivel=iniciante&parceiro=Matosinhos%20Surf%20Academy&intent=planear', 'Passo 2', ['Surf'], ''),
    ('pesca Açores', '?source=pesca&tipo=pesca&region=A%C3%A7ores&intent=planear', 'Passo 3', ['Pesca'], 'Açores'),
    ('praias Alentejo', '?source=beaches&region=Alentejo&intent=planear', 'Passo 1', [], 'Costa Alentejana'),
    ('Lisboa e Setúbal', '?source=beaches&region=Lisboa%20e%20Set%C3%BAbal', 'Passo 1', [], 'Cascais e Lisboa'),
    ('região inválida', '?source=x&region=Marte&tipo=xpto', 'Passo 1', [], ''),
]
async def t_legacy(b):
    ctx, pg, st = await setup(b, PT, 390)
    try:
        for name, qs_, step, sel, dest in LEGACY:
            await pg.goto(PT + qs_, wait_until='domcontentloaded'); await pg.wait_for_timeout(1800)
            s = await state(pg)
            rows = {r.split(' ', 1)[0].lower(): (r.split(' ', 1)[1] if ' ' in r else '') for r in s['rows']}
            ints = rows.get('interesse', '—'); dst = rows.get('destino', '—')
            ok = s['count'].startswith(step) and (all(x in ints for x in sel) if sel else ints == '—') and (dest in dst if dest else dst == '—')
            rec(f'L1 link antigo "{name}" abre pré-preenchido', ok, s)
        rec('L1 sem erros de consola', not st['errs'], st['errs'][:5])
    finally:
        await ctx.close()

# ── L2 praia de origem -> vila-base mais próxima ──────────────────────────
BEACHES = [
    ('Praia da Rocha', 'Algarve', 'algarve', 'Portimão'),
    ('Ilha de Tavira', 'Algarve', 'algarve', 'Vilamoura'),
    ('Praia do Guincho', 'Oeste', 'cascais', 'Cascais'),        # BD diz "Oeste"; vila mais perto = Cascais
    ('Praia de Sesimbra', 'Lisboa e Setúbal', 'setubal', 'Sesimbra'),
    ('Praia de Moledo', 'Norte', 'minho', 'Viana do Castelo'),
    ('Praia da Figueira da Foz', 'Centro', 'costa-prata', ''),   # > 60 km de qualquer base -> só região
]
async def t_beach(b):
    ctx, pg, st = await setup(b, PT, 390)
    bad = []
    pg.on('response', lambda r: bad.append(f'{r.status} {r.url[:90]}') if r.status >= 400 else None)
    try:
        for name, reg, r_exp, town_exp in BEACHES:
            await pg.goto(PT + f'?source=beach&beach={quote(name)}&region={quote(reg)}&intent=planear', wait_until='domcontentloaded')
            await pg.wait_for_timeout(2500)
            s = await state(pg)
            await finish_pt(pg)
            h = await hrefs(pg)
            addr = q(h['stay'], 'address'); share = parse_qs(urlparse(pg.url).query)
            okr = share.get('r') == [r_exp]
            okt = (town_exp and addr.startswith(town_exp) and share.get('b') == [town_exp]) or (not town_exp and 'b' not in share)
            rec(f'L2 praia "{name}" -> {town_exp or "só região"} ({r_exp}), começa nas datas', okr and okt and s['count'].startswith('Passo 3'), {'addr': addr, 'share': {k: v for k, v in share.items() if k in ('r', 'b')}, 'passo': s['count']})
        mine = [x for x in bad if 'portalturismoportugal.com' in x or 'supabase' in x]
        rec('L2 sem erros de consola nossos (terceiros listados à parte)', not [e for e in st['errs'] if 'status of' not in e] and not mine, {'errs': st['errs'][:3], 'http>=400': bad[:5]})
    finally:
        await ctx.close()

# ── L3 atribuição por ponto de entrada (PT e EN) ──────────────────────────
async def t_attr(b):
    ctx, pg, st = await setup(b, PT + '?r=algarve&i=praia&ref=webcams', 390, init=SHARE_SPY)
    try:
        await finish_pt(pg)
        h = await hrefs(pg)
        rec('L3 PT ref=webcams -> Stay22 campaign …-planear-webcams, mapa …-webcams-mapa, GYG cmp pthplanear-webcams',
            q(h['stay'], 'campaign') == 'portalturismoportugal-planear-webcams' and q(h['map'], 'campaign') == 'portalturismoportugal-planear-webcams-mapa' and h['gyg'] and all(q(g, 'cmp') == 'pthplanear-webcams' for g in h['gyg']),
            {'stay': q(h['stay'], 'campaign'), 'map': q(h['map'], 'campaign'), 'gyg': [q(g, 'cmp') for g in h['gyg']]})
        own_url = pg.url
        rec('L3 URL do próprio plano não leva ref (não contamina partilhas)', 'ref=' not in own_url, own_url.replace(ORIGIN, ''))
        await pg.reload(wait_until='domcontentloaded'); await pg.wait_for_timeout(3000)
        h2 = await hrefs(pg)
        rec('L3 recarregar mantém a origem da sessão (webcams)', q(h2['stay'], 'campaign') == 'portalturismoportugal-planear-webcams', q(h2['stay'], 'campaign'))
        await pg.click('#resultado button:has-text("Partilhar")'); await pg.wait_for_timeout(300)
        sh = await pg.evaluate('window.__shared') or ''
        rec('L3 link partilhado leva ref=partilha', 'ref=partilha' in sh and 'plano=1' in sh, sh.replace(ORIGIN, ''))
        await pg.close()
        # quem abre o link partilhado (sessão nova)
        c2, p2, s2 = await setup(b, sh or PT, 390)
        h3 = await hrefs(p2)
        k = await p2.evaluate("(document.querySelector('#resultado .r-kicker')||{}).textContent||''")
        rec('L3 quem abre a partilha: campanha …-planear-partilha e "Plano partilhado consigo"', q(h3['stay'], 'campaign') == 'portalturismoportugal-planear-partilha' and 'partilhado' in k, [q(h3['stay'], 'campaign'), k])
        await c2.close()
    finally:
        await ctx.close()
    # EN + direto + ref malicioso
    ctx, pg, st = await setup(b, EN + '?r=algarve&i=surf&source=beaches-suggest', 390)
    try:
        await flow_en_from_any(pg)
        h = await hrefs(pg)
        rec('L3 EN source=beaches-suggest -> …-en-planear-beaches-suggest e pthplanearen-beaches-suggest',
            q(h['stay'], 'campaign') == 'portalturismoportugal-en-planear-beaches-suggest' and h['gyg'] and all(q(g, 'cmp') == 'pthplanearen-beaches-suggest' for g in h['gyg']),
            {'stay': q(h['stay'], 'campaign'), 'gyg': [q(g, 'cmp') for g in h['gyg']]})
    finally:
        await ctx.close()
    ctx, pg, st = await setup(b, PT, 390)
    try:
        await finish_pt(pg)
        h = await hrefs(pg)
        rec('L3 entrada direta mantém o nome de campanha atual (sem sufixo)', q(h['stay'], 'campaign') == 'portalturismoportugal-planear' and all(q(g, 'cmp') == 'pthplanear' for g in h['gyg']), q(h['stay'], 'campaign'))
    finally:
        await ctx.close()
    ctx, pg, st = await setup(b, PT + '?r=algarve&i=praia&ref=%22%3E%3Cimg%20src%3Dx%3EwebcamsXXXXXXXXXXXXXXXXXXXXXXXXXX', 390)
    try:
        await finish_pt(pg)
        h = await hrefs(pg); c = q(h['stay'], 'campaign')
        rec('L3 ref malicioso é limpo ([a-z0-9-], máx. 24)', c.startswith('portalturismoportugal-planear-') and all(ch.isalnum() or ch == '-' for ch in c) and len(c) <= len('portalturismoportugal-planear-') + 24, c)
        rec('L3 sem erros de consola', not st['errs'], st['errs'][:5])
    finally:
        await ctx.close()

async def flow_en_from_any(pg):
    for _ in range(6):
        c = (await pg.text_content('#pv3-count')).strip()
        if 'Step 1' in c:
            await pg.click('#pv3-next'); await pg.wait_for_timeout(400)
        elif 'Step 2' in c:
            await pg.click('#pv3-next'); await pg.wait_for_timeout(400)
        elif 'Step 3' in c:
            await pg.fill('#pv3-d1', '2026-12-04'); await pg.dispatch_event('#pv3-d1', 'change')
            await pg.fill('#pv3-d2', '2026-12-08'); await pg.dispatch_event('#pv3-d2', 'change')
            await pg.click('#pv3-next'); await pg.wait_for_timeout(400)
        elif 'Step 4' in c:
            await pg.click('.pv3-opt:has-text("Couple")'); await pg.wait_for_timeout(600)
        elif 'Step 5' in c:
            await pg.click('.pv3-opt:has-text("Comfortable")'); await pg.click('#pv3-next'); await pg.wait_for_timeout(2800)
            return

# ── L4 parâmetro b inválido / de outra região é ignorado ───────────────────
async def t_bad_base(b):
    ctx, pg, st = await setup(b, PT + '?plano=1&i=praia&r=algarve&n=2&o=moderado&b=Lisboa', 390)
    try:
        h = await hrefs(pg)
        rec('L4 b= de outra região ignorado (Algarve praia -> Albufeira)', q(h['stay'], 'address').startswith('Albufeira'), q(h['stay'], 'address'))
    finally:
        await ctx.close()

async def main():
    t0 = time.time()
    async with async_playwright() as p:
        b = await p.chromium.launch()
        await asyncio.gather(safe('L1', t_legacy(b)), safe('L2', t_beach(b)), safe('L3', t_attr(b)), safe('L4', t_bad_base(b)))
        await b.close()
    json.dump({'results': RESULTS, 'secs': round(time.time() - t0)}, open(L + 'suite_atribuicao_go_results.json', 'w'), ensure_ascii=False, indent=1)
    ok = sum(r['ok'] for r in RESULTS)
    print(f'{ok}/{len(RESULTS)} OK em {round(time.time()-t0)}s')
    for r in RESULTS:
        print('OK   ' if r['ok'] else 'FALHA', r['test'], '' if r['ok'] else ':: ' + r['detail'])

asyncio.run(main())
