"""Bateria de testes exaustiva — Planeador v3 (06/10/2026).
Serve os ficheiros locais na origem de producao com o CSP real do _headers."""
import asyncio, json, re, sys, time, os
from urllib.parse import urlparse, parse_qs
from playwright.async_api import async_playwright

L = '/home/claude/pv3/'
CSP = re.search(r'Content-Security-Policy:\s*(.+)', open('/mnt/user-data/uploads/Portal-turismo-site/_headers').read()).group(1).strip()
ORIGIN = 'https://www.portalturismoportugal.com'
BASE = ORIGIN + '/planear'
AXE = open('/home/claude/pw/node_modules/axe-core/axe.min.js').read()
SHOT = L + 'suite_shots/'
os.makedirs(SHOT, exist_ok=True)
RESULTS = []
REGIONS = ['algarve', 'alentejo', 'setubal', 'cascais', 'oeste', 'costa-prata', 'minho', 'madeira', 'acores', '']
INTS = [['praia'], ['surf'], ['pesca'], ['roteiro'], ['praia', 'surf'], ['surf', 'pesca'], ['praia', 'roteiro']]
DC_OK = {'faro', 'lisbon', 'porto', 'madeira', ''}
IGNORE = ('ERR_FAILED', 'open-meteo', 'net::ERR_ABORTED', '429 (Too Many Requests)', 'google.com/g/collect')

def rec(name, ok, detail=''):
    RESULTS.append({'test': name, 'ok': bool(ok), 'detail': detail if isinstance(detail, str) else json.dumps(detail, ensure_ascii=False)[:600]})

async def setup(b, vw=1280, url=BASE, opts=None):
    opts = opts or {}
    ctx = await b.new_context(service_workers='block', viewport={'width': vw, 'height': 900 if vw > 500 else 812}, locale='pt-PT')
    pg = await ctx.new_page()
    st = {'errs': [], 'posts': [], 'turnstile': 0, 'embed': []}
    pg.on('console', lambda m: st['errs'].append(m.text[:200]) if m.type == 'error' and not any(x in m.text for x in IGNORE) else None)
    pg.on('pageerror', lambda e: st['errs'].append('PAGEERROR ' + str(e)[:300]))
    pg.on('response', lambda r: st['embed'].append(r.status) if r.url.startswith('https://www.stay22.com/embed/gm') else None)

    async def ts(route):
        st['turnstile'] += 1
        await route.abort()
    await ctx.route('**/challenges.cloudflare.com/**', ts)

    async def lead(route):
        st['posts'].append(route.request.post_data)
        code = opts.get('lead_status', 200)
        await route.fulfill(status=code, content_type='application/json', body='{"ok":true}' if code == 200 else '{"error":"x"}', headers={'access-control-allow-origin': '*'})
    await ctx.route('**/functions/v1/submit-plan-request**', lead)

    if opts.get('beaches') == 'fail':
        await ctx.route('**/rest/v1/beaches**', lambda r: r.fulfill(status=500, body='err', headers={'access-control-allow-origin': '*'}))
    elif opts.get('beaches') == 'hang':
        async def hang(r):
            await asyncio.sleep(20)
            try: await r.abort()
            except Exception: pass
        await ctx.route('**/rest/v1/beaches**', hang)
    if opts.get('meteo') == 'fail':
        await ctx.route(re.compile(r'.*open-meteo\.com.*'), lambda r: r.abort())

    async def doc(r):
        await r.fulfill(status=200, headers={'content-type': 'text/html; charset=utf-8', 'content-security-policy': CSP}, body=open(L + 'planear-go.html', 'rb').read())
    await pg.route(re.compile(r'https://www\.portalturismoportugal\.com/planear(\?.*)?$'), doc)

    def mk(f, ct):
        async def h(route): await route.fulfill(status=200, content_type=ct, body=open(L + f, 'rb').read())
        return h
    await ctx.route('**/css/planner-v3.css*', mk('css/planner-v3.css', 'text/css'))
    await ctx.route('**/js/planner-v3.js*', mk('js/planner-v3.js', 'application/javascript'))
    if opts.get('engine') == 'missing':
        await ctx.route('**/js/plan-engine.js*', lambda r: r.fulfill(status=404, body='nf'))
    else:
        await ctx.route('**/js/plan-engine.js*', mk('js/plan-engine.js', 'application/javascript'))

    async def img(route):
        name = urlparse(route.request.url).path.split('/')[-1]
        await route.fulfill(status=200, content_type='image/webp', body=open(L + 'images/planner/' + name, 'rb').read())
    await ctx.route('**/images/planner/**', img)
    async def font(route):
        name = urlparse(route.request.url).path.split('/')[-1]
        await route.fulfill(status=200, content_type='font/woff2', body=open(L + 'fonts/planner/' + name, 'rb').read(), headers={'access-control-allow-origin': '*'})
    await ctx.route('**/fonts/planner/**', font)

    if opts.get('nostorage'):
        await pg.add_init_script("""(()=>{if(window.top!==window)return;const t=()=>{throw new Error('blocked')};
          Object.defineProperty(window,'localStorage',{get:t});Object.defineProperty(window,'sessionStorage',{get:t});})()""")
    await pg.add_init_script("document.addEventListener('securitypolicyviolation',e=>console.error('CSPVIOL '+e.violatedDirective+' '+e.blockedURI))")
    await pg.goto(url, wait_until='domcontentloaded', timeout=45000)
    await pg.add_style_tag(content='#cookie-consent-banner{display:none!important}')
    await pg.wait_for_timeout(opts.get('wait', 2500))
    return ctx, pg, st

async def links(pg):
    return await pg.evaluate("""[...document.querySelectorAll('#resultado a[data-plan-kind]')].map(a=>({k:a.getAttribute('data-plan-kind'),s:a.getAttribute('data-plan-section'),h:a.href,rel:a.rel,t:a.target}))""")

def check_links(ls, ints, dated):
    probs = []
    kinds = {l['k'] for l in ls}
    for l in ls:
        u = urlparse(l['h']); q = parse_qs(u.query)
        if 'sponsored' not in l['rel'] or l['t'] != '_blank': probs.append('rel/target ' + l['k'])
        if l['k'] == 'stay':
            if not l['h'].startswith('https://www.stay22.com/allez/booking') or q.get('aid') != ['kaptarstudio']: probs.append('stay id')
            if dated and not (q.get('checkin') and q.get('checkout')): probs.append('stay sem datas')
            if not q.get('address') or not q.get('adults'): probs.append('stay address/adults')
        elif l['k'] in ('surf', 'fish', 'activity'):
            if u.netloc != 'www.getyourguide.com' or q.get('partner_id') != ['0WTBHZE'] or q.get('cmp') != ['pthplanear']: probs.append('gyg id ' + l['k'])
            if dated and not q.get('date_from'): probs.append('gyg sem datas')
        elif l['k'] == 'surfcamp':
            if u.netloc != 'www.booksurfcamps.com' or q.get('aid') != ['11861']: probs.append('bsc id')
        elif l['k'] == 'car':
            slug = u.path.replace('/pt/portugal', '').strip('/')
            if u.netloc != 'www.discovercars.com' or q.get('a_aid') != ['portalturismoportugal'] or slug not in DC_OK: probs.append('dc ' + u.path)
    if 'stay' not in kinds: probs.append('falta alojamento')
    if 'car' not in kinds: probs.append('falta carro')
    if 'surf' in ints and not {'surfcamp', 'surf'} <= kinds: probs.append('falta surf')
    if 'pesca' in ints and 'fish' not in kinds: probs.append('falta pesca')
    if 'surf' not in ints and 'pesca' not in ints and 'activity' not in kinds: probs.append('falta atividade')
    return probs

# ── T1 matriz de combinacoes (link partilhado) ───────────────────────────
async def t_matrix(b):
    sem = asyncio.Semaphore(5)
    async def one(r, ints, vw):
        async with sem:
            q = f'?plano=1&i={",".join(ints)}&r={r}&n=2&o=moderado&de=2026-11-02&ate=2026-11-06'
            ctx, pg, st = await setup(b, vw, BASE + q, {'wait': 3200})
            try:
                ls = await links(pg)
                probs = check_links(ls, ints, True)
                info = await pg.evaluate("""({title:(document.getElementById('r-title')||{}).textContent, map:(document.querySelector('.r-map iframe')||{}).src||'', hs:document.documentElement.scrollWidth>document.documentElement.clientWidth})""")
                await pg.locator('.r-map').scroll_into_view_if_needed(); await pg.wait_for_timeout(2500)
                mq = parse_qs(urlparse(info['map']).query)
                if mq.get('aid') != ['kaptarstudio'] or mq.get('zoom') != ['13'] or mq.get('currency') != ['EUR']: probs.append('mapa params')
                if any(s >= 400 for s in st['embed']): probs.append('mapa HTTP ' + str(st['embed']))
                if not st['embed']: probs.append('mapa nao pediu')
                if info['hs']: probs.append('scroll horizontal')
                if st['errs']: probs.append('erros: ' + '; '.join(st['errs'][:2]))
                rec(f'T1 matriz {r or "qualquer"} · {"+".join(ints)} · {vw}px', not probs, probs or info['title'])
                return [l['h'] for l in ls]
            finally:
                await ctx.close()
    jobs = [one(r, i, 375) for r in REGIONS for i in INTS]
    jobs += [one(r, ['praia'], 1280) for r in REGIONS]
    allurls = await asyncio.gather(*jobs)
    return sorted({u.split('&deeplink_id')[0] for lst in allurls for u in lst})

# ── T2 fluxo por cliques + T8 checklist/sticky ───────────────────────────
async def t_clickflow(b, vw):
    ctx, pg, st = await setup(b, vw)
    try:
        nx = pg.locator('#pv3-next')
        rec(f'T2 passo 1 bloqueado sem escolha ({vw})', await nx.is_disabled())
        await pg.click('.pv3-opt:has-text("Pesca")'); await pg.click('.pv3-opt:has-text("Praia")')
        await nx.click(); await pg.wait_for_timeout(500)
        await pg.click('.pv3-opt:has-text("Algarve")'); await pg.wait_for_timeout(700)
        rec(f'T2 regiao avanca sozinha ({vw})', (await pg.text_content('#pv3-count')).strip() == 'Passo 3 de 5')
        await pg.fill('#pv3-d1', '2026-12-04'); await pg.dispatch_event('#pv3-d1', 'change')
        d2 = await pg.input_value('#pv3-d2')
        rec(f'T3 so data de chegada -> partida +3 ({vw})', d2 == '2026-12-07', d2)
        await pg.fill('#pv3-d2', '2026-12-01'); await pg.dispatch_event('#pv3-d2', 'change')
        err = await pg.text_content('#pv3-derr')
        rec(f'T3 partida antes da chegada mostra erro e bloqueia ({vw})', 'depois' in (err or '') and await nx.is_disabled(), err)
        await pg.fill('#pv3-d2', '2026-12-08'); await pg.dispatch_event('#pv3-d2', 'change')
        await nx.click(); await pg.wait_for_timeout(300)
        await pg.click('.pv3-opt:has-text("Família")'); await pg.wait_for_timeout(600)
        await pg.click('.pv3-opt:has-text("Premium")')
        prev = await pg.text_content('#pv3-ring-n')
        rec(f'T2 resumo chega a 5/5 ({vw})', prev.strip() == '5/5', prev)
        await pg.evaluate("(()=>{const b=document.getElementById('pv3-next'); b.click(); b.click();})()")  # duplo clique
        await pg.wait_for_timeout(2600)
        ls = await links(pg)
        probs = check_links(ls, ['praia', 'pesca'], True)
        u = pg.url
        rec(f'T2 plano gerado com links validos ({vw})', not probs and 'plano=1' in u, probs or u.replace(ORIGIN, ''))
        q = parse_qs(urlparse([l['h'] for l in ls if l['k'] == 'stay'][0]).query)
        rec(f'T2 família -> 4 adultos/1 quarto; praia+pesca no Algarve -> base Portimão ({vw})', q.get('adults') == ['4'] and q.get('rooms') == ['1'] and 'Portimão' in q.get('address', [''])[0], q)
        focus = await pg.evaluate('document.activeElement && document.activeElement.id')
        rec(f'A11y foco vai para o titulo do plano ({vw})', focus == 'r-title', focus)
        n_ov = await pg.evaluate("document.querySelectorAll('#resultado .r-hero').length")
        rec(f'T7 duplo clique nao duplica o plano ({vw})', n_ov == 1, n_ov)
        # T8 checklist
        st_t = await pg.text_content('#r-sticky-t')
        async with ctx.expect_page() as pi:
            await pg.click('#resultado a[data-plan-kind="car"]')
        await (await pi.value).close(); await pg.wait_for_timeout(300)
        n = await pg.text_content('#r-ring-n')
        async with ctx.expect_page() as pi:
            await pg.click('#r-sticky-go')
        await (await pi.value).close(); await pg.wait_for_timeout(300)
        st2 = await pg.text_content('#r-sticky-t')
        async with ctx.expect_page() as pi:
            await pg.click('#r-sticky-go')
        await (await pi.value).close(); await pg.wait_for_timeout(300)
        st3 = await pg.text_content('#r-sticky-t'); n3 = await pg.text_content('#r-ring-n')
        rec(f'T8 checklist + barra "proximo passo" ({vw})', st_t.startswith('Próximo: alojamento') and n.strip() == '1/3' and 'experiências' in st2 and n3.strip() == '3/3' and 'completa' in st3, [st_t, n, st2, st3, n3])
        # T5 restaurar o proprio plano
        await pg.reload(wait_until='domcontentloaded'); await pg.wait_for_timeout(3500)
        k = await pg.text_content('.r-kicker')
        n4 = await pg.text_content('#r-ring-n')
        rec(f'T5 recarregar mostra "o seu plano" e mantem progresso ({vw})', 'O seu plano' in k and n4.strip() == '3/3', [k, n4])
        # T7 alterar
        await pg.click('.r-btn--ghost'); await pg.wait_for_timeout(500)
        vis = await pg.evaluate("getComputedStyle(document.getElementById('planner')).display!=='none' && document.getElementById('resultado').hidden")
        await pg.click('.pv3-opt:has-text("Pesca")')  # tira pesca
        await pg.click('#pv3-next'); await pg.wait_for_timeout(400)
        await pg.click('.pv3-opt:has-text("Madeira")'); await pg.wait_for_timeout(600)
        for _ in range(3):
            if await pg.locator('#pv3-next').is_enabled(): await pg.click('#pv3-next'); await pg.wait_for_timeout(350)
        await pg.wait_for_timeout(2600)
        t2 = await pg.evaluate("document.getElementById('r-title').firstChild.textContent")
        dc = [l['h'] for l in await links(pg) if l['k'] == 'car']
        rec(f'T7 alterar pedido e regenerar (Madeira) ({vw})', vis and t2 == 'Funchal' and dc and '/madeira' in dc[0], [vis, t2, dc])
        await pg.screenshot(path=SHOT + f'fluxo_{vw}.png')
        rec(f'T17 sem erros de consola/CSP no fluxo ({vw})', not st['errs'], st['errs'][:3])
    finally:
        await ctx.close()

# ── T3b "Ainda nao sei" + teclado ─────────────────────────────────────────
async def t_keyboard(b):
    ctx, pg, st = await setup(b, 1280)
    try:
        await pg.focus('#pv3-q')
        seq = []
        for _ in range(2):
            await pg.keyboard.press('Tab')
        await pg.keyboard.press('Enter')  # 2.a opcao: Surf
        sel = await pg.evaluate("[...document.querySelectorAll('.pv3-opt.is-sel')].map(b=>b.innerText.split('\\n')[0])")
        seq.append(sel)
        await pg.focus('#pv3-next'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(400)
        focus = await pg.evaluate('document.activeElement.id')
        await pg.keyboard.press('Tab'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(700)  # 1.a regiao
        cnt = await pg.text_content('#pv3-count')
        await pg.click('.pv3-chip:has-text("Ainda não sei")'); await pg.wait_for_timeout(700)
        cnt2 = await pg.text_content('#pv3-count')
        await pg.click('.pv3-opt:has-text("Só eu")'); await pg.wait_for_timeout(600)
        await pg.click('.pv3-opt:has-text("Económico")'); await pg.click('#pv3-next'); await pg.wait_for_timeout(2600)
        ls = await links(pg)
        stay = [l['h'] for l in ls if l['k'] == 'stay'][0]
        rec('T9 teclado: Tab+Enter seleciona e avança; foco vai para a pergunta', sel == ['Surf'] and focus == 'pv3-q' and cnt.strip() == 'Passo 3 de 5', [sel, focus, cnt])
        rec('T3 "Ainda não sei" avança e plano sai sem datas', cnt2.strip() == 'Passo 4 de 5' and 'checkin' not in stay and check_links(ls, ['surf'], False) == [], [cnt2, stay[:120]])
        chip = await pg.text_content('.r-chips')
        rec('T3 sem datas: chip "Datas flexíveis" e nota do mapa', 'flexíveis' in chip, chip)
    finally:
        await ctx.close()

# ── T4 links partilhados limite / seguranca ───────────────────────────────
async def t_shared_edge(b):
    cases = [
        ('datas passadas', '?plano=1&i=praia&r=algarve&n=2&o=moderado&de=2025-01-10&ate=2025-01-15', lambda i: 'flexíveis' in i['chips'] and i['stay'] and 'checkin' not in i['stay']),
        ('>30 noites', '?plano=1&i=praia&r=algarve&n=2&o=moderado&de=2026-11-01&ate=2027-01-15', lambda i: i['stay'] and 'checkin' not in i['stay']),
        ('XSS em i', '?plano=1&i=%3Cimg%20src%3Dx%20onerror%3Dalert(1)%3E&r=algarve', lambda i: not i['stay'] and i['planner'] and not i['xss']),
        ('regiao invalida', '?plano=1&i=surf&r=%22%3E%3Cscript%3Ealert(1)%3C%2Fscript%3E&n=2', lambda i: i['title'] == 'Ericeira' and not i['xss']),
        ('sem i', '?plano=1&r=algarve', lambda i: not i['stay'] and i['planner']),
        ('pessoas/orcamento invalidos', '?plano=1&i=praia&r=minho&n=999&o=bitcoin', lambda i: i['title'] == 'Viana do Castelo' and 'adults=2' in i['stay']),
        ('Açores sem fotos', '?plano=1&i=surf&r=acores&n=2&o=moderado', lambda i: i['title'] == 'Ponta Delgada' and '/pt/portugal?' in i['car']),
    ]
    for name, q, ok in cases:
        ctx, pg, st = await setup(b, 375, BASE + q, {'wait': 3300})
        try:
            await pg.evaluate("window.__xss=0; window.alert=function(){window.__xss=1}; 0")
            await pg.wait_for_timeout(300)
            info = await pg.evaluate("""({stay:(document.querySelector('#resultado a[data-plan-kind=stay]')||{}).href||'',
              car:(document.querySelector('#resultado a[data-plan-kind=car]')||{}).href||'',
              title:((document.getElementById('r-title')||{}).firstChild||{}).textContent||'', chips:(document.querySelector('.r-chips')||{}).textContent||'',
              planner:getComputedStyle(document.getElementById('planner')).display!=='none', xss:!!window.__xss || !!document.querySelector('#resultado img[src=x], script:not([src]):not([type])[data-x]')})""")
            res = ok(info) and not st['errs']
            rec(f'T4 link partilhado: {name}', res, {k: (v[:90] if isinstance(v, str) else v) for k, v in info.items()} if not res else info['title'] or 'planeador mostrado')
        finally:
            await ctx.close()

# ── T6 pre-preenchimento a partir de outras paginas ───────────────────────
async def t_prefill(b):
    ctx, pg, st = await setup(b, 375, BASE + '?i=surf&r=oeste&ref=webcams')
    try:
        cnt = await pg.text_content('#pv3-count')
        ring = await pg.text_content('#pv3-ring-n')
        await pg.click('.pv3-chip:has-text("Próximo fim de semana")'); await pg.click('#pv3-next'); await pg.wait_for_timeout(300)
        await pg.click('.pv3-opt:has-text("A dois")'); await pg.wait_for_timeout(600)
        await pg.click('.pv3-opt:has-text("Confortável")'); await pg.click('#pv3-next'); await pg.wait_for_timeout(2600)
        ev = await pg.evaluate("""(window.dataLayer||[]).filter(a=>a&&a[0]==='event'&&a[1]==='plan_generated').map(a=>a[2])""")
        t = await pg.evaluate("document.getElementById('r-title').firstChild.textContent")
        rec('T6 pre-preenchimento ?i=surf&r=oeste&ref=webcams começa no passo 3', cnt.strip() == 'Passo 3 de 5' and ring.strip() == '2/5', [cnt, ring])
        rec('T6 GA4 plan_generated com origem=webcams e versao=v3', bool(ev) and ev[-1].get('origem') == 'webcams' and ev[-1].get('versao') == 'v3' and t == 'Peniche', ev[-1] if ev else 'sem evento')
    finally:
        await ctx.close()

# ── T9 lead (email) ───────────────────────────────────────────────────────
async def t_lead(b):
    for status in (200, 500):
        ctx, pg, st = await setup(b, 1280, BASE + '?plano=1&i=surf&r=oeste&n=2&o=moderado&de=2026-11-02&ate=2026-11-06', {'wait': 3300, 'lead_status': status})
        try:
            await pg.fill('.r-email-f input', 'nao-e-email'); await pg.click('.r-email-f button'); m1 = await pg.text_content('.r-email-msg')
            await pg.fill('.r-email-f input', 'teste+v3@example.com'); await pg.wait_for_timeout(300)
            await pg.click('.r-email-f button'); m2 = await pg.text_content('.r-email-msg')
            ts_req = st['turnstile']
            await pg.evaluate("()=>{const i=document.createElement('input');i.type='hidden';i.name='cf-turnstile-response';i.value='tok';document.getElementById('r-ts').appendChild(i);}")
            await pg.click('.r-email-f button'); await pg.wait_for_timeout(800)
            m3 = await pg.text_content('.r-email-msg'); dis = await pg.locator('.r-email-f button').is_disabled()
            body = json.loads(st['posts'][0]) if st['posts'] else {}
            legal = await pg.locator('.r-email-legal a[href="/privacidade.html"]').count()
            if status == 200:
                okb = body.get('email') == 'teste+v3@example.com' and body.get('nome') == 'Sem nome' and body.get('interesses') == ['surf'] and body.get('turnstileToken') == 'tok' and 'plano=1' in body.get('notas', '') and body.get('regiao') == 'oeste'
                rec('T9 lead: email inválido rejeitado', 'válido' in m1, m1)
                rec('T9 lead: sem token pede verificação e carrega Turnstile', 'robô' in m2 and ts_req >= 1, [m2, ts_req])
                rec('T9 lead: payload correto e sucesso (botão bloqueia)', okb and 'guardado' in m3 and dis, {'body': {k: body.get(k) for k in ('email', 'nome', 'interesses', 'regiao', 'pessoas', 'data_inicio', 'orcamento')}, 'msg': m3})
                rec('T9 lead: aviso RGPD com link para a política de privacidade', legal == 1, legal)
            else:
                rec('T9 lead: erro 500 mostra mensagem e permite repetir', 'Não foi possível' in m3 and not dis, [m3, dis])
        finally:
            await ctx.close()

# ── T10 falhas de rede + T11 storage bloqueado ────────────────────────────
async def t_failures(b):
    q = '?plano=1&i=praia&r=algarve&n=2&o=moderado&de=2026-11-02&ate=2026-11-06'
    ctx, pg, st = await setup(b, 375, BASE, {'beaches': 'fail'})
    try:
        await pg.click('.pv3-opt:has-text("Praia")'); await pg.click('#pv3-next'); await pg.wait_for_timeout(400)
        await pg.click('.pv3-opt:has-text("Algarve")'); await pg.wait_for_timeout(600)
        await pg.click('.pv3-chip:has-text("Ainda não sei")'); await pg.wait_for_timeout(600)
        await pg.click('.pv3-opt:has-text("A dois")'); await pg.wait_for_timeout(600)
        await pg.click('.pv3-opt:has-text("Económico")'); await pg.click('#pv3-next'); await pg.wait_for_timeout(2600)
        ls = await links(pg)
        rec('T10 BD de praias em erro 500: planeador e plano funcionam (sem fotos)', check_links(ls, ['praia'], False) == [] and not [e for e in st['errs'] if 'PAGEERROR' in e], st['errs'][:2])
    finally:
        await ctx.close()
    t0 = time.time()
    ctx, pg, st = await setup(b, 375, BASE + q, {'beaches': 'hang', 'wait': 500})
    try:
        await pg.wait_for_selector('#r-title', timeout=12000)
        rec('T10 BD sem resposta: link partilhado abre na mesma (timeout 6 s)', True, f'{time.time()-t0:.1f}s')
    except Exception as e:
        rec('T10 BD sem resposta: link partilhado abre na mesma (timeout 6 s)', False, str(e)[:120])
    finally:
        await ctx.close()
    ctx, pg, st = await setup(b, 375, BASE + q, {'meteo': 'fail', 'wait': 3500})
    try:
        pills = await pg.locator('.r-live-pill').count(); t = await pg.evaluate("document.getElementById('r-title').firstChild.textContent")
        rec('T10 meteorologia em falha: sem pílulas, plano intacto', pills == 0 and t == 'Albufeira' and not st['errs'], [pills, t])
    finally:
        await ctx.close()
    ctx, pg, st = await setup(b, 375, BASE, {'engine': 'missing'})
    try:
        await pg.click('.pv3-opt:has-text("Praia")'); await pg.click('#pv3-next'); await pg.wait_for_timeout(300)
        await pg.click('.pv3-opt:has-text("Minho")'); await pg.wait_for_timeout(600)
        await pg.click('.pv3-chip:has-text("Ainda não sei")'); await pg.wait_for_timeout(600)
        await pg.click('.pv3-opt:has-text("A dois")'); await pg.wait_for_timeout(600)
        await pg.click('.pv3-opt:has-text("Premium")'); await pg.click('#pv3-next'); await pg.wait_for_timeout(600)
        h = await pg.text_content('#pv3-h')
        rec('T10 motor de links em falta: mensagem clara em vez de botão morto', 'Recarregue' in h, h)
    finally:
        await ctx.close()
    ctx, pg, st = await setup(b, 375, BASE, {'nostorage': True})
    try:
        await pg.click('.pv3-opt:has-text("Surf")'); await pg.click('#pv3-next'); await pg.wait_for_timeout(300)
        await pg.click('.pv3-opt:has-text("Oeste")'); await pg.wait_for_timeout(600)
        await pg.click('.pv3-chip:has-text("Próximo fim de semana")'); await pg.click('#pv3-next'); await pg.wait_for_timeout(300)
        await pg.click('.pv3-opt:has-text("A dois")'); await pg.wait_for_timeout(600)
        await pg.click('.pv3-opt:has-text("Confortável")'); await pg.click('#pv3-next'); await pg.wait_for_timeout(2600)
        async with ctx.expect_page() as pi:
            await pg.click('#resultado a[data-plan-kind="car"]')
        await (await pi.value).close()
        n = await pg.text_content('#r-ring-n')
        rec('T11 localStorage/sessionStorage bloqueados (modo privado): tudo funciona', n.strip() == '1/3' and not [e for e in st['errs'] if 'PAGEERROR' in e], [n, st['errs'][:2]])
    finally:
        await ctx.close()

# ── T12 viewports + T14 acessibilidade (axe) ──────────────────────────────
async def t_viewports(b):
    q = '?plano=1&i=surf,praia&r=algarve&n=3-4&o=premium&de=2026-11-02&ate=2026-11-06'
    for vw in (320, 360, 390, 414, 768, 1024, 1366, 1920):
        ctx, pg, st = await setup(b, vw)
        try:
            hs1 = await pg.evaluate('document.documentElement.scrollWidth>document.documentElement.clientWidth')
            await pg.click('.pv3-opt:has-text("Surf")'); await pg.click('#pv3-next'); await pg.wait_for_timeout(500)
            hs2 = await pg.evaluate('document.documentElement.scrollWidth>document.documentElement.clientWidth')
            await pg.screenshot(path=SHOT + f'vp_{vw}_regioes.png')
            await pg.goto(BASE + q, wait_until='domcontentloaded'); await pg.wait_for_timeout(3300)
            hs3 = await pg.evaluate('document.documentElement.scrollWidth>document.documentElement.clientWidth')
            over = await pg.evaluate("""[...document.querySelectorAll('#resultado *')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.right>document.documentElement.clientWidth+1&&!e.closest('.r-beaches')&&!e.closest('.r-map')}).slice(0,3).map(e=>e.className)""")
            await pg.screenshot(path=SHOT + f'vp_{vw}_plano.png')
            rec(f'T12 viewport {vw}px sem scroll horizontal (início, passo 2, plano)', not (hs1 or hs2 or hs3) and not over, [hs1, hs2, hs3, over])
        finally:
            await ctx.close()
    for label, url in (('início', BASE), ('plano', BASE + q)):
        ctx, pg, st = await setup(b, 1280, url, {'wait': 3500})
        try:
            await pg.add_script_tag(content=AXE)
            r = await pg.evaluate("""axe.run(document, {runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}, rules:{'frame-tested':{enabled:false}}}).then(r=>r.violations.map(v=>({id:v.id,impact:v.impact,n:v.nodes.length,ex:v.nodes.slice(0,2).map(n=>n.target.join(' '))})))""")
            serious = [v for v in r if v['impact'] in ('serious', 'critical')]
            rec(f'T14 acessibilidade axe WCAG 2.1 AA ({label}) — sem falhas sérias/críticas', not serious, r)
        finally:
            await ctx.close()

# ── T15 performance (rede 4G lenta + CPU 4x) ──────────────────────────────
async def t_perf(b):
    ctx = await b.new_context(service_workers='block', viewport={'width': 390, 'height': 844}, locale='pt-PT')
    await ctx.close()
    ctx, pg, st = await setup(b, 390, 'about:blank', {'wait': 10})
    try:
        cdp = await ctx.new_cdp_session(pg)
        await cdp.send('Network.enable')
        await cdp.send('Network.emulateNetworkConditions', {'offline': False, 'latency': 150, 'downloadThroughput': 1.6e6 / 8, 'uploadThroughput': 750e3 / 8})
        await cdp.send('Emulation.setCPUThrottlingRate', {'rate': 4})
        sizes = {'n': 0, 'bytes': 0}
        def on_fin(e):
            sizes['n'] += 1; sizes['bytes'] += e.get('encodedDataLength', 0)
        cdp.on('Network.loadingFinished', on_fin)
        await pg.add_init_script("""window.__lcp=0;new PerformanceObserver(l=>{for(const e of l.getEntries())window.__lcp=e.startTime}).observe({type:'largest-contentful-paint',buffered:true});
          window.__cls=0;new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.__cls+=e.value}).observe({type:'layout-shift',buffered:true});""")
        t0 = time.time()
        await pg.goto(BASE, wait_until='load', timeout=90000)
        await pg.wait_for_timeout(4000)
        lcp = await pg.evaluate('window.__lcp'); cls = await pg.evaluate('window.__cls')
        load_b = sizes['bytes']; load_n = sizes['n']
        await pg.click('.pv3-opt:has-text("Praia")'); await pg.click('#pv3-next'); await pg.wait_for_timeout(5000)
        step2 = sizes['bytes'] - load_b
        rec('T15 performance 4G lenta + CPU 4x: LCP < 2,5 s, CLS < 0,1', lcp < 2500 and cls < 0.1, f'LCP {lcp/1000:.2f}s · CLS {cls:.3f} · carga inicial {load_b/1024:.0f} KB em {load_n} pedidos · passo 2 (+fotos) {step2/1024:.0f} KB')
    finally:
        await ctx.close()

async def t_ga_csp(b):
    ctx = await b.new_context(service_workers='block', viewport={'width': 1280, 'height': 900})
    pg = await ctx.new_page(); viol = []
    await pg.add_init_script("if(window.top===window)document.addEventListener('securitypolicyviolation',e=>console.log('CSPVIOL '+e.violatedDirective+' '+e.blockedURI))")
    pg.on('console', lambda m: viol.append(m.text) if 'CSPVIOL' in m.text else None)
    try:
        await pg.goto(ORIGIN + '/planear', wait_until='load', timeout=60000); await pg.wait_for_timeout(5000)
        g = [v for v in viol if 'google.com' in v]
        rec('T18 (site atual em produção) GA4 sem bloqueios do CSP', not g, g[:3] or viol[:3])
    finally:
        await ctx.close()

async def safe(name, coro):
    try:
        return await coro
    except Exception as e:
        rec(f'{name} (exceção no teste)', False, str(e)[:400])

async def main():
    t0 = time.time()
    async with async_playwright() as p:
        b = await p.chromium.launch()
        urls = await safe('T1', t_matrix(b)) or []
        await asyncio.gather(safe('T2 375', t_clickflow(b, 375)), safe('T2 1280', t_clickflow(b, 1280)), safe('T9 teclado', t_keyboard(b)), safe('T4', t_shared_edge(b)), safe('T6', t_prefill(b)), safe('T9 lead', t_lead(b)))
        await safe('T10/T11', t_failures(b))
        await safe('T12/T14', t_viewports(b))
        await safe('T15', t_perf(b))
        await safe('T18', t_ga_csp(b))
        await b.close()
    json.dump({'results': RESULTS, 'urls': urls, 'secs': round(time.time() - t0)}, open(L + 'suite_go_results.json', 'w'), ensure_ascii=False, indent=1)
    ok = sum(r['ok'] for r in RESULTS)
    print(f'{ok}/{len(RESULTS)} OK em {round(time.time()-t0)}s')
    for r in RESULTS:
        if not r['ok']: print('FALHA', r['test'], '::', r['detail'])

asyncio.run(main())
