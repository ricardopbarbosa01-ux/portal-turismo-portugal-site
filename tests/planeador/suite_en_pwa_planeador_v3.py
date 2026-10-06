"""Testes EN + PWA (instalar como app) + continuar plano — Planeador v3 (06/10/2026)."""
import asyncio, json, re, os, time
from urllib.parse import urlparse, parse_qs
from playwright.async_api import async_playwright

L = '/home/claude/pv3/'
U = '/mnt/user-data/uploads/Portal-turismo-site/'
CSP = re.search(r'Content-Security-Policy:\s*(.+)', open(U + '_headers').read()).group(1).strip()
ORIGIN = 'https://www.portalturismoportugal.com'
PT = ORIGIN + '/planear-v3'
EN = ORIGIN + '/en/planear-v3'
AXE = open('/home/claude/pw/node_modules/axe-core/axe.min.js').read()
SHOT = L + 'shots_en_pwa/'
os.makedirs(SHOT, exist_ok=True)
IGNORE = ('ERR_FAILED', 'open-meteo', 'net::ERR_ABORTED', '429 (Too Many Requests)', 'google.com/g/collect')
RESULTS = []
IPHONE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'
PT_WORDS = re.compile(r'\b(Ver |Próximo|noites?\b|Partilhar|Alterar|Alojamento|Experiências|Onde dormir|Praias a não|Guardar|Continuar|Passo \d|Agora em|Previsão|Água|Ondas|adultos|Como se deslocar|O que fazer|Instalar)')

def rec(name, ok, detail=''):
    RESULTS.append({'test': name, 'ok': bool(ok), 'detail': detail if isinstance(detail, str) else json.dumps(detail, ensure_ascii=False)[:600]})

def mk(path, ct, extra=None):
    async def h(route):
        await route.fulfill(status=200, content_type=ct, body=open(path, 'rb').read(), headers=extra or {})
    return h

async def setup(b, url, vw=1280, ua=None, init=None, ctx=None, wait=2500, sw=False):
    own = ctx is None
    if own:
        kw = {'viewport': {'width': vw, 'height': 900 if vw > 500 else 812}, 'locale': 'en-GB' if '/en/' in url else 'pt-PT'}
        if ua: kw.update(user_agent=ua, is_mobile=True, has_touch=True)
        # O SW real iria buscar o HTML a producao (fora das rotas do teste): so o P1 o deixa ativo
        if not sw: kw.update(service_workers='block')
        ctx = await b.new_context(**kw)
        await ctx.route('**/challenges.cloudflare.com/**', lambda r: r.abort())
        await ctx.route('**/functions/v1/submit-plan-request**', lambda r: r.fulfill(status=200, content_type='application/json', body='{"ok":true}', headers={'access-control-allow-origin': '*'}))
        for pat, f in ((r'https://www\.portalturismoportugal\.com/planear-v3(\?.*)?$', 'planear-v3.html'), (r'https://www\.portalturismoportugal\.com/en/planear-v3(\?.*)?$', 'en/planear-v3.html')):
            await ctx.route(re.compile(pat), mk(L + f, 'text/html; charset=utf-8', {'content-security-policy': CSP}))
        await ctx.route('**/css/planner-v3.css*', mk(L + 'css/planner-v3.css', 'text/css'))
        await ctx.route('**/js/planner-v3.js*', mk(L + 'js/planner-v3.js', 'application/javascript'))
        await ctx.route('**/js/plan-engine.js*', mk(L + 'js/plan-engine.js', 'application/javascript'))
        await ctx.route('**/manifest-planeador.webmanifest', mk(L + 'manifest-planeador.webmanifest', 'application/manifest+json'))
        await ctx.route('**/en/manifest-planner.webmanifest', mk(L + 'en/manifest-planner.webmanifest', 'application/manifest+json'))
        for ic in ('icon-192.png', 'icon-512.png', 'icon-maskable-192.png', 'icon-maskable-512.png', 'apple-touch-icon.png'):
            await ctx.route('**/' + ic, mk(U + ic, 'image/png'))
        await ctx.route('**/sw.js', mk(U + 'sw.js', 'application/javascript'))
        async def img(route):
            await route.fulfill(status=200, content_type='image/webp', body=open(L + 'images/planner/' + urlparse(route.request.url).path.split('/')[-1], 'rb').read())
        await ctx.route('**/images/planner/**', img)
        async def font(route):
            await route.fulfill(status=200, content_type='font/woff2', body=open(L + 'fonts/planner/' + urlparse(route.request.url).path.split('/')[-1], 'rb').read(), headers={'access-control-allow-origin': '*'})
        await ctx.route('**/fonts/planner/**', font)
    pg = await ctx.new_page()
    st = {'errs': []}
    pg.on('console', lambda m: st['errs'].append(m.text[:200]) if m.type == 'error' and not any(x in m.text for x in IGNORE) else None)
    pg.on('pageerror', lambda e: st['errs'].append('PAGEERROR ' + str(e)[:300]))
    await pg.add_init_script("if(window.top===window)document.addEventListener('securitypolicyviolation',e=>console.error('CSPVIOL '+e.violatedDirective+' '+e.blockedURI))")
    if init: await pg.add_init_script(init)
    await pg.goto(url, wait_until='domcontentloaded', timeout=45000)
    await pg.add_style_tag(content='#cookie-consent-banner{display:none!important}')
    await pg.wait_for_timeout(wait)
    return ctx, pg, st

async def flow_en(pg):
    await pg.click('.pv3-opt:has-text("Beach")'); await pg.click('#pv3-next'); await pg.wait_for_timeout(500)
    await pg.click('.pv3-opt:has-text("Algarve")'); await pg.wait_for_timeout(700)
    await pg.fill('#pv3-d1', '2026-12-04'); await pg.dispatch_event('#pv3-d1', 'change')
    await pg.fill('#pv3-d2', '2026-12-08'); await pg.dispatch_event('#pv3-d2', 'change')
    await pg.click('#pv3-next'); await pg.wait_for_timeout(300)
    await pg.click('.pv3-opt:has-text("Couple")'); await pg.wait_for_timeout(600)
    await pg.click('.pv3-opt:has-text("Comfortable")')
    await pg.click('#pv3-next'); await pg.wait_for_timeout(2800)

async def axe(pg):
    await pg.add_script_tag(content=AXE)
    r = await pg.evaluate("""axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']},rules:{'frame-tested':{enabled:false}}}).then(r=>r.violations.map(v=>({id:v.id,impact:v.impact,n:v.nodes.length,ex:v.nodes.slice(0,2).map(n=>n.target.join(' '))})))""")
    return [v for v in r if v['impact'] in ('serious', 'critical')]

# ── E1 página EN: arranque, textos, fluxo completo, links dos parceiros ────
async def t_en(b, vw):
    ctx, pg, st = await setup(b, EN, vw)
    try:
        lang = await pg.evaluate('document.documentElement.lang')
        cnt = (await pg.text_content('#pv3-count')).strip()
        opts = await pg.evaluate("[...document.querySelectorAll('.pv3-opt strong')].map(e=>e.textContent)")
        rec(f'E1 EN arranca em inglês ({vw})', lang == 'en' and cnt == 'Step 1 of 5' and opts[:4] == ['Beach', 'Surf', 'Fishing', 'City & food'], [lang, cnt, opts])
        await pg.click('.pv3-opt:has-text("Beach")'); await pg.click('#pv3-next'); await pg.wait_for_timeout(600)
        regs = await pg.evaluate("[...document.querySelectorAll('.pv3-opt strong')].map(e=>e.textContent)")
        rec(f'E1 regiões em inglês, "Surprise me" no fim ({vw})', regs[-1] == 'Surprise me' and 'Silver Coast' in regs and 'Azores' in regs, regs)
        if vw < 500: await pg.screenshot(path=SHOT + 'en-375-regiao.png')
        await pg.click('.pv3-opt:has-text("Algarve")'); await pg.wait_for_timeout(700)
        chips = await pg.evaluate("document.querySelector('#pv3-body').innerText")
        rec(f'E1 passo datas em inglês ({vw})', 'Next weekend' in chips and 'check-in' in chips.lower() and not PT_WORDS.search(chips), chips[:300])
        await pg.fill('#pv3-d1', '2026-12-04'); await pg.dispatch_event('#pv3-d1', 'change')
        await pg.fill('#pv3-d2', '2026-12-01'); await pg.dispatch_event('#pv3-d2', 'change')
        err = await pg.text_content('#pv3-derr')
        rec(f'E1 erro de datas em inglês ({vw})', 'after check-in' in (err or ''), err)
        await pg.fill('#pv3-d2', '2026-12-08'); await pg.dispatch_event('#pv3-d2', 'change')
        await pg.click('#pv3-next'); await pg.wait_for_timeout(300)
        await pg.click('.pv3-opt:has-text("Couple")'); await pg.wait_for_timeout(600)
        await pg.click('.pv3-opt:has-text("Comfortable")')
        nt = (await pg.text_content('#pv3-next .pv3-next-t')).strip()
        rec(f'E1 botão final "Create my plan" ({vw})', nt == 'Create my plan', nt)
        await pg.click('#pv3-next'); await pg.wait_for_timeout(2800)
        txt = await pg.evaluate("document.getElementById('resultado').innerText")
        bad = PT_WORDS.findall(txt)
        rec(f'E1 plano sem texto em português ({vw})', not bad and 'Where to stay in' in txt, bad[:8] or txt[:200])
        ls = await pg.evaluate("[...document.querySelectorAll('#resultado a[href]')].map(a=>({k:a.getAttribute('data-plan-kind'),h:a.href,rel:a.rel}))")
        probs = []
        for l in ls:
            h = l['h']
            if 'getyourguide' in h and ('partner_id=0WTBHZE' not in h or 'cmp=pthplanearen' not in h): probs.append(('gyg', h))
            if 'discovercars' in h and ('/pt/' in h or 'a_aid=portalturismoportugal' not in h): probs.append(('dc', h))
            if 'booksurfcamps' in h and ('/pt/' in h or 'aid=11861' not in h): probs.append(('bsc', h))
            if 'stay22.com/allez' in h and 'aid=kaptarstudio' not in h: probs.append(('s22', h))
            if '/beach.html' in h and '/en/beach.html' not in h: probs.append(('beach', h))
            if 'privac' in h and '/en/privacy.html' not in h: probs.append(('priv', h))
            if l['k'] and 'sponsored' not in l['rel']: probs.append(('rel', h))
        gyg = [l['h'] for l in ls if 'getyourguide' in l['h']][:1]
        rec(f'E1 links EN: GYG/DiscoverCars/BSC/Stay22 com IDs, praias e privacidade em /en/ ({vw})', not probs and gyg, probs[:5] or gyg)
        mp = await pg.evaluate("(document.querySelector('#resultado iframe')||{}).src||''")
        q = parse_qs(urlparse(mp).query)
        rec(f'E1 mapa Stay22 em inglês com datas ({vw})', q.get('lang') == ['en'] and q.get('checkin') == ['2026-12-04'] and q.get('aid') == ['kaptarstudio'], mp[:200])
        dl = await pg.evaluate("(window.dataLayer||[]).filter(x=>x&&x[0]==='event').map(x=>x[2]&&x[2].lang)")
        rec(f'E1 eventos GA levam lang=en ({vw})', dl and all(x == 'en' for x in dl), dl[:6])
        if vw < 500:
            await pg.screenshot(path=SHOT + 'en-375-plano.png')
            await pg.screenshot(path=SHOT + 'en-375-plano-full.png', full_page=True)
        else:
            await pg.screenshot(path=SHOT + 'en-1280-plano.png')
        over = await pg.evaluate('document.documentElement.scrollWidth - window.innerWidth')
        rec(f'E1 sem scroll horizontal ({vw})', over <= 1, over)
        sv = await axe(pg)
        rec(f'E1 axe WCAG 2.1 AA no plano EN ({vw})', not sv, sv)
        rec(f'E1 sem erros de consola/CSP ({vw})', not st['errs'], st['errs'][:5])
    finally:
        await ctx.close()

async def t_en_initial(b):
    ctx, pg, st = await setup(b, EN, 375)
    try:
        await pg.screenshot(path=SHOT + 'en-375-inicio.png')
        txt = await pg.evaluate('document.body.innerText')
        bad = PT_WORDS.findall(txt)
        rec('E2 página EN inicial sem português visível', not bad, bad[:8])
        sv = await axe(pg)
        rec('E2 axe WCAG 2.1 AA na página EN inicial', not sv, sv)
        hl = await pg.evaluate("[...document.querySelectorAll('link[rel=alternate][hreflang]')].map(l=>l.hreflang+' '+l.href)")
        sw = await pg.evaluate("document.querySelector('.pv3-top-nav a[lang]').getAttribute('href')")
        can = await pg.evaluate("document.querySelector('link[rel=canonical]').href")
        rob = await pg.evaluate("document.querySelector('meta[name=robots]').content")
        rec('E2 EN: hreflang PT/EN, canonical /en/planear, noindex, botão PT', len(hl) == 2 and sw == '/planear-v3' and can.endswith('/en/planear') and rob.startswith('noindex'), [hl, sw, can, rob])
    finally:
        await ctx.close()

# ── P1 manifesto + instalabilidade (Chromium) ────────────────────────────
async def t_manifest(b):
    for url, name, start in ((PT, 'Planeador', '/planear-v3?ref=app'), (EN, 'Trip Planner', '/en/planear-v3?ref=app')):
        # Manifesto lido sem SW (o SW real iria buscar o ficheiro a producao, fora das rotas do teste)
        c0, p0, _ = await setup(b, url, 412, wait=1500)
        try:
            cd0 = await c0.new_cdp_session(p0)
            for _ in range(10):
                m = await cd0.send('Page.getAppManifest')
                data = json.loads(m.get('data') or '{}')
                if data: break
                await p0.wait_for_timeout(500)
            rec(f'P1 manifesto carregado sem erros ({name})', data.get('short_name') == name and data.get('start_url') == start and data.get('display') == 'standalone' and not m.get('errors'), {'url': m.get('url'), 'errors': m.get('errors'), 'short': data.get('short_name')})
        finally:
            await c0.close()
        ctx, pg, st = await setup(b, url, 412, wait=4000, sw=True)
        try:
            cdp = await ctx.new_cdp_session(pg)
            ie = await cdp.send('Page.getInstallabilityErrors')
            errs = [e['errorId'] for e in ie.get('installabilityErrors', [])]
            rec(f'P1 Chrome considera a página instalável ({name})', not errs, errs)
            sw = await pg.evaluate("navigator.serviceWorker.getRegistration().then(r=>!!r)")
            rec(f'P1 service worker registado ({name})', sw, sw)
        finally:
            await ctx.close()

# ── P2 Android/Chrome: beforeinstallprompt -> botão topo + cartão no plano ─
FAKE_BIP = """window.__prompted=0;window.__fireBIP=()=>{const e=new Event('beforeinstallprompt',{cancelable:true});
 e.prompt=()=>{window.__prompted++;return Promise.resolve()};e.userChoice=Promise.resolve({outcome:'accepted'});window.dispatchEvent(e);};"""
async def t_android(b):
    ctx, pg, st = await setup(b, EN, 412, init=FAKE_BIP)
    try:
        h0 = await pg.is_hidden('#pv3-install')
        await pg.evaluate('window.__fireBIP()'); await pg.wait_for_timeout(200)
        v1 = await pg.is_visible('#pv3-install')
        rec('P2 botão "Install app" só aparece quando o Chrome permite instalar', h0 and v1, [h0, v1])
        await pg.screenshot(path=SHOT + 'en-412-botao-instalar.png')
        await flow_en(pg)
        card = await pg.is_visible('.r-app')
        await pg.locator('.r-app').scroll_into_view_if_needed()
        await pg.screenshot(path=SHOT + 'en-412-cartao-app.png')
        rec('P2 cartão "Take your plan with you" no plano', card, card)
        await pg.click('#r-app-btn'); await pg.wait_for_timeout(400)
        n = await pg.evaluate('window.__prompted')
        ev = await pg.evaluate("(window.dataLayer||[]).filter(x=>x&&x[0]==='event').map(x=>x[1])")
        gone = await pg.evaluate("!document.querySelector('.r-app') && document.getElementById('pv3-install').hidden")
        rec('P2 clicar abre o diálogo nativo, regista GA e esconde os botões', n == 1 and 'pwa_install_click' in ev and 'pwa_install_choice' in ev and gone, [n, ev[-4:], gone])
        await pg.evaluate('window.__fireBIP()'); await pg.wait_for_timeout(200)
        await pg.evaluate("window.dispatchEvent(new Event('appinstalled'))"); await pg.wait_for_timeout(200)
        gone2 = await pg.evaluate("!document.querySelector('.r-app') && document.getElementById('pv3-install').hidden")
        ev = await pg.evaluate("(window.dataLayer||[]).filter(x=>x&&x[0]==='event').map(x=>x[1])")
        rec('P2 depois de instalada: botões desaparecem + evento pwa_installed', gone2 and 'pwa_installed' in ev, [gone2])
        rec('P2 sem erros de consola', not st['errs'], st['errs'][:5])
    finally:
        await ctx.close()

# ── P3 iPhone: instruções "Adicionar ao ecrã principal" ───────────────────
async def t_ios(b, url, lbl):
    ctx, pg, st = await setup(b, url, 390, ua=IPHONE_UA)
    try:
        v = await pg.is_visible('#pv3-install')
        rec(f'P3 iPhone: botão de instalar visível no topo ({lbl})', v, v)
        over = await pg.evaluate('document.documentElement.scrollWidth - window.innerWidth')
        tb = await pg.evaluate("(()=>{const t=document.querySelector('.pv3-top').getBoundingClientRect();return t.height})()")
        rec(f'P3 barra de topo cabe em 390 px sem partir ({lbl})', over <= 1 and tb < 70, [over, tb])
        await pg.screenshot(path=SHOT + f'{lbl}-iphone-topo.png')
        await pg.click('#pv3-install'); await pg.wait_for_timeout(400)
        op = await pg.is_visible('#pv3-ios'); foc = await pg.evaluate("document.activeElement && document.activeElement.hasAttribute('data-close')")
        await pg.screenshot(path=SHOT + f'{lbl}-iphone-instrucoes.png')
        rec(f'P3 abre instruções com foco no botão ({lbl})', op and foc, [op, foc])
        await pg.keyboard.press('Escape'); await pg.wait_for_timeout(200)
        c1 = await pg.is_hidden('#pv3-ios')
        await pg.click('#pv3-install'); await pg.wait_for_timeout(200)
        await pg.mouse.click(195, 40); await pg.wait_for_timeout(200)
        c2 = await pg.is_hidden('#pv3-ios')
        await pg.click('#pv3-install'); await pg.wait_for_timeout(200)
        await pg.click('#pv3-ios [data-close]'); await pg.wait_for_timeout(200)
        c3 = await pg.is_hidden('#pv3-ios'); busy = await pg.evaluate("document.body.classList.contains('pv3-busy')")
        rec(f'P3 fecha com Esc, toque fora e botão; scroll desbloqueado ({lbl})', c1 and c2 and c3 and not busy, [c1, c2, c3, busy])
        rec(f'P3 sem erros de consola ({lbl})', not st['errs'], st['errs'][:5])
    finally:
        await ctx.close()

# ── P4 aberto como app instalada (display-mode: standalone) ────────────────
STANDALONE = """(()=>{const mm=window.matchMedia.bind(window);window.matchMedia=q=>/display-mode:\\s*standalone/.test(q)?{matches:true,media:q,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}}:mm(q);})()"""
async def t_standalone(b):
    ctx, pg, st = await setup(b, PT + '?ref=app', 390, ua=IPHONE_UA, init=STANDALONE)
    try:
        cls = await pg.evaluate("document.body.classList.contains('pv3-standalone')")
        hid = await pg.is_hidden('#pv3-install')
        ev = await pg.evaluate("(window.dataLayer||[]).filter(x=>x&&x[0]==='event'&&x[1]==='planear_passo').map(x=>x[2].origem)")
        rec('P4 em modo app: classe standalone, sem botão instalar, origem=app', cls and hid and ev == ['app'], [cls, hid, ev])
        await pg.screenshot(path=SHOT + 'pt-app-instalada.png')
    finally:
        await ctx.close()

# ── P5 continuar o último plano (separado por língua) ─────────────────────
async def t_resume(b):
    ctx, pg, st = await setup(b, EN, 390)
    try:
        h0 = await pg.is_hidden('#pv3-resume')
        await flow_en(pg)
        await pg.close()
        ctx2, pg2, st2 = await setup(b, EN, ctx=ctx)
        v = await pg2.is_visible('#pv3-resume'); t = (await pg2.text_content('#pv3-resume')) or ''
        await pg2.screenshot(path=SHOT + 'en-390-continuar-plano.png')
        rec('P5 ao voltar: "Continue my plan for Lagos"', h0 and v and 'Continue my plan for' in t, [h0, v, t])
        await pg2.click('.pv3-resume-btn'); await pg2.wait_for_timeout(3000)
        k = await pg2.evaluate("(document.querySelector('#resultado .r-kicker')||document.querySelector('#resultado')).innerText.slice(0,80)")
        rec('P5 retoma o plano como "Your plan is ready" (não como partilhado)', 'your plan is ready' in k.lower() and 'plano=1' in pg2.url, k)
        await pg2.close()
        ctx3, pg3, _ = await setup(b, PT, ctx=ctx)
        hp = await pg3.is_hidden('#pv3-resume')
        rec('P5 página PT não mostra o plano guardado em EN', hp, hp)
    finally:
        await ctx.close()

async def t_pt_switch(b):
    ctx, pg, st = await setup(b, PT, 1280)
    try:
        sw = await pg.evaluate("document.querySelector('.pv3-top-nav a[lang]').getAttribute('href')")
        man = await pg.evaluate("document.querySelector('link[rel=manifest]').getAttribute('href')")
        t = (await pg.text_content('#pv3-count')).strip()
        rec('E3 PT continua em português, link EN -> /en/planear-v3, manifesto próprio', sw == '/en/planear-v3' and man == '/manifest-planeador.webmanifest' and t == 'Passo 1 de 5', [sw, man, t])
        rec('E3 PT sem erros de consola', not st['errs'], st['errs'][:5])
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
        await asyncio.gather(safe('E1 375', t_en(b, 375)), safe('E1 1280', t_en(b, 1280)), safe('E2', t_en_initial(b)), safe('E3', t_pt_switch(b)))
        await asyncio.gather(safe('P1', t_manifest(b)), safe('P2', t_android(b)), safe('P3 pt', t_ios(b, PT, 'pt')), safe('P3 en', t_ios(b, EN, 'en')), safe('P4', t_standalone(b)), safe('P5', t_resume(b)))
        await b.close()
    json.dump({'results': RESULTS, 'secs': round(time.time() - t0)}, open(L + 'suite_en_pwa_results.json', 'w'), ensure_ascii=False, indent=1)
    ok = sum(r['ok'] for r in RESULTS)
    print(f'{ok}/{len(RESULTS)} OK em {round(time.time()-t0)}s')
    for r in RESULTS:
        print('OK   ' if r['ok'] else 'FALHA', r['test'], '' if r['ok'] else ':: ' + r['detail'])

asyncio.run(main())
