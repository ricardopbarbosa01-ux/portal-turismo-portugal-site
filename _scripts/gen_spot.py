#!/usr/bin/env python3
"""Gera paginas de spot de webcam a partir de webcams.html / en/webcams.html (menu, rodape e scripts herdados).
Uso: gen_spot.py <dir_fonte_repo> <dir_saida>
"""
import io, json, re, sys

SRC, OUT = sys.argv[1], sys.argv[2]
BASE = 'https://www.portalturismoportugal.com'
SUPA_IMG = 'https://glupdjvdvunogkqgxoui.supabase.co/storage/v1/object/public/card-images/beaches/4325b4a7-62f3-46a7-a66d-ae0ad6e0d374.jpg'
CAM = 'https://beachcam.meo.pt/livecams/praia-da-luz/'
LAT, LNG = 37.0880, -8.7153  # mesmas coordenadas do cartao da camara (webcams-guias-data.js)
V = '20261006'

ICON_CAM = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>'
ICON_EXT = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>'
ICON_BED = '<svg viewBox="0 0 24 24" aria-hidden="true" style="width:18px;height:18px;stroke:#fff;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round"><path d="M2 20V8"/><path d="M2 16h20v4"/><path d="M22 16v-4a3 3 0 0 0-3-3H10v7"/><circle cx="6" cy="12" r="2"/></svg>'
ICON_CAR = '<svg viewBox="0 0 24 24" aria-hidden="true" style="width:18px;height:18px;stroke:#fff;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round"><path d="M5 17h14M6 17l1.5-6h9L18 17"/><circle cx="7.5" cy="17.5" r="1.5"/><circle cx="16.5" cy="17.5" r="1.5"/></svg>'
ICON_CAL = '<svg viewBox="0 0 24 24" aria-hidden="true" style="width:18px;height:18px;stroke:#fff;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>'
ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true" style="width:12px;height:12px;stroke:currentColor;fill:none;stroke-width:2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>'
CRUMB = '<svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>'

L = {
 'pt': dict(
  src='webcams.html', out='webcam-praia-da-luz.html', path='/webcam-praia-da-luz', other='/en/praia-da-luz-webcam',
  lang_old='href="/en/webcams.html"', lang_new='href="/en/praia-da-luz-webcam"', locale='pt_PT', inlang='pt-PT',
  title='Webcam Praia da Luz em Direto: Ondas e Água Hoje · Portal Turismo Portugal',
  desc='Webcam da Praia da Luz (Lagos) ao vivo e o mar agora: altura das ondas, vento, temperatura da água e pôr do sol. Hotéis perto e dicas para a visita.',
  ogtitle='Webcam da Praia da Luz em direto — ondas, vento e água hoje',
  kicker='WEBCAM · PRAIA DA LUZ · LAGOS, ALGARVE', h1=[['Webcam', 'da'], ['Praia', 'da', 'Luz.']],
  sub='Veja a câmara ao vivo e o mar agora — ondas, vento e temperatura da água — antes de sair de casa.',
  cta1='Ver câmara ao vivo', cta2='Hotéis perto da praia',
  booking='https://www.booking.com/searchresults.pt-pt.html?ss=Praia%20da%20Luz%2C%20Lagos%2C%20Portugal',
  alt='Praia da Luz, Lagos — areal e falésias vistos das rochas', photo='Foto: colaboradores da Wikipédia',
  home='Início', webcams='Webcams', webcams_href='/webcams', crumb='Praia da Luz',
  now_tag='Ao vivo', now_title='O mar na Praia da Luz <em>agora</em>', loading='A carregar as condições…', updating='a atualizar…',
  tiles=[('wave','Ondas','wave-sub'),('wind','Vento','wind-sub'),('sst','Água do mar','à superfície'),('air','Ar','agora'),('sunset','Pôr do sol','hoje'),('uv','Índice UV','máximo hoje')],
  hours='Próximas horas · ondas e vento',
  note='Previsão de modelo (Open-Meteo), não é uma medição na praia. Confirme sempre a bandeira e o nadador-salvador.',
  cam_label='Câmara oficial · Beachcam by MEO', cam_title='Imagem ao vivo da Praia da Luz',
  cam_sub='A câmara é da Beachcam by MEO e abre no site oficial, num novo separador. O Portal Turismo Portugal indica apenas o link.',
  cam_btn='Abrir câmara ao vivo',
  next_tag='Vai à Praia da Luz?', next_title='O próximo passo, <em>já resolvido</em>',
  next=[('Alojamento','Dormir na Luz ou em Lagos','Hotéis e apartamentos a poucos minutos do areal, com preços para as suas datas.','Ver hotéis perto','BOOKING','#1a5fa3,#2980d4',ICON_BED,True),
        ('Carro','Alugar carro em Faro','O aeroporto de Faro é a porta de entrada do Algarve. A A22 não tem portagens desde 2025.','Comparar preços','https://www.discovercars.com/portugal/faro?a_aid=portalturismoportugal','#0a3d6b,#0d2b4e',ICON_CAR,True),
        ('Planear','Planear a escapada','Datas, alojamento e atividades num plano automático em 60 segundos.','Planear viagem','/planear?r=algarve&amp;i=praia&amp;ref=webcam-luz','#c9a84c,#e8c97a',ICON_CAL,False)],
  gyg_eyebrow='VIU O MAR? · RESERVE O PASSEIO', gyg_title='Passeios de barco e grutas,<br><em>a minutos da Luz.</em>',
  gyg_trust='Barcos, kayak e passeios pela costa de Lagos. Reserva imediata e avaliações de outros viajantes.',
  gyg_frame='Lagos e Ponta da Piedade', gyg_frame_sub='Reserva imediata via GetYourGuide', gyg_badge='Lagos',
  gyg_locale='pt-PT', gyg_cmp='pthwebcamluzpt', gyg_q='Lagos Portugal', gyg_aria='Reservar passeios perto da Praia da Luz',
  about_tag='A praia', about_title='Sobre a <em>Praia da Luz</em>',
  about=['A Praia da Luz é a praia da vila com o mesmo nome, a alguns quilómetros a oeste de Lagos. O areal é de dimensão média, emoldurado por falésias escuras de rocha basáltica que contrastam com a areia clara — uma composição visual diferente da maioria das praias algarvias.',
         'A vila de Luz tem escala humana, com comércio e restauração a poucos passos do areal. A Rocha Negra — uma formação rochosa proeminente num extremo da praia — é um dos elementos visuais mais reconhecíveis de toda a costa de Lagos.'],
  facts=[('Concelho','Lagos, Algarve'),('Qualidade da água','Excelente'),('Tipo','Areal entre falésias'),('Serviços','Vila a poucos passos'),('Câmara','Beachcam by MEO')],
  links=[('/praias/praia-da-luz/','Guia da Praia da Luz →'),('/onde-ficar-algarve-praia','Onde ficar no Algarve →'),('/praias-calmas-algarve','Praias calmas do Algarve →'),('/webcams?region=Algarve','Outras webcams do Algarve →')],
  faq_tag='Perguntas frequentes', faq_title='Antes de ir à <em>Praia da Luz</em>',
  faq=[('Onde posso ver a webcam da Praia da Luz em direto?','A câmara ao vivo da Praia da Luz é da Beachcam by MEO e vê-se no site oficial da MEO (botão “Abrir câmara ao vivo”, acima). Nesta página juntamos o que a imagem não mostra: altura e período das ondas, vento, temperatura da água e previsão para as próximas horas.'),
       ('Qual é a temperatura da água na Praia da Luz hoje?','O valor atualizado está no painel “O mar na Praia da Luz agora” (temperatura à superfície do mar, previsão Open-Meteo). No Algarve a água costuma estar mais quente no fim do verão, em agosto e setembro.'),
       ('A Praia da Luz é boa para crianças?','Com mar calmo, sim: o areal é de dimensão média e a vila tem serviços a poucos passos. Veja a altura das ondas acima antes de sair e, na época balnear, fique junto à zona vigiada pelo nadador-salvador.'),
       ('Onde ficar perto da Praia da Luz?','Na própria vila da Luz, para ir a pé para a praia, ou em Lagos, a poucos quilómetros, com mais restaurantes e vida à noite. Compare preços para as suas datas em <a href="BOOKING" target="_blank" rel="sponsored noopener noreferrer">hotéis perto da Praia da Luz</a>.'),
       ('Como chegar à Praia da Luz?','A Luz fica a oeste de Lagos, no barlavento algarvio. Quem chega de avião aterra normalmente em Faro e segue de carro pela A22, que não tem portagens desde 2025.')],
  updated='Atualizado a 06/10/2026. Descrição da praia: base de dados editorial do Portal Turismo Portugal; qualidade da água segundo a classificação oficial (APA).',
 ),
 'en': dict(
  src='en/webcams.html', out='en/praia-da-luz-webcam.html', path='/en/praia-da-luz-webcam', other='/webcam-praia-da-luz',
  lang_old='href="/webcams.html"', lang_new='href="/webcam-praia-da-luz"', locale='en_GB', inlang='en',
  title='Praia da Luz Webcam Live: Waves & Sea Temperature Today · Portal Turismo Portugal',
  desc='Watch the Praia da Luz (Lagos) webcam live and check the sea right now: wave height, wind, water temperature and sunset. Hotels nearby and visit tips.',
  ogtitle='Praia da Luz webcam live — waves, wind and sea temperature today',
  kicker='WEBCAM · PRAIA DA LUZ · LAGOS, ALGARVE', h1=[['Praia', 'da', 'Luz'], ['webcam,', 'live.']],
  sub='Watch the live camera and check the sea right now — waves, wind and water temperature — before you leave.',
  cta1='Watch the live cam', cta2='Hotels near the beach',
  booking='https://www.booking.com/searchresults.en-gb.html?ss=Praia%20da%20Luz%2C%20Lagos%2C%20Portugal',
  alt='Praia da Luz, Lagos — beach and cliffs seen from the rocks', photo='Photo: Wikipedia contributors',
  home='Home', webcams='Webcams', webcams_href='/en/webcams', crumb='Praia da Luz',
  now_tag='Live', now_title='The sea at Praia da Luz <em>right now</em>', loading='Loading conditions…', updating='updating…',
  tiles=[('wave','Waves','wave-sub'),('wind','Wind','wind-sub'),('sst','Sea temperature','sea surface'),('air','Air','now'),('sunset','Sunset','today'),('uv','UV index','max today')],
  hours='Next hours · waves and wind',
  note='Model forecast (Open-Meteo), not a measurement at the beach. Always check the flag and the lifeguard.',
  cam_label='Official camera · Beachcam by MEO', cam_title='Live view of Praia da Luz',
  cam_sub='The camera belongs to Beachcam by MEO and opens on their official site in a new tab. Portal Turismo Portugal only links to it.',
  cam_btn='Open the live cam',
  next_tag='Heading to Praia da Luz?', next_title='Your next step, <em>sorted</em>',
  next=[('Stay','Stay in Luz or Lagos','Hotels and apartments a few minutes from the sand, with prices for your dates.','See hotels nearby','BOOKING','#1a5fa3,#2980d4',ICON_BED,True),
        ('Car hire','Hire a car at Faro','Faro Airport is the gateway to the Algarve. The A22 motorway has been toll-free since 2025.','Compare prices','https://www.discovercars.com/portugal/faro?a_aid=portalturismoportugal','#0a3d6b,#0d2b4e',ICON_CAR,True),
        ('Plan','Plan the getaway','Dates, places to stay and activities in an automatic plan in 60 seconds.','Plan a trip','/en/planear?r=algarve&amp;i=praia&amp;ref=webcam-luz','#c9a84c,#e8c97a',ICON_CAL,False)],
  gyg_eyebrow='SEEN THE SEA? · BOOK THE TRIP', gyg_title='Boat trips and sea caves,<br><em>minutes from Luz.</em>',
  gyg_trust='Boats, kayaks and coastal tours around Lagos. Instant booking and reviews from other travellers.',
  gyg_frame='Lagos & Ponta da Piedade', gyg_frame_sub='Instant booking via GetYourGuide', gyg_badge='Lagos',
  gyg_locale='en-US', gyg_cmp='pthwebcamluzen', gyg_q='Lagos Portugal', gyg_aria='Book tours near Praia da Luz',
  about_tag='The beach', about_title='About <em>Praia da Luz</em>',
  about=['Praia da Luz is the beach of the village of the same name, a few kilometres west of Lagos. The sandy stretch is medium-sized, framed by dark basalt rock cliffs that contrast with the pale sand — a visual composition unlike most Algarve beaches.',
         'The village of Luz has a human scale, with shops and restaurants within easy reach of the beach. Rocha Negra — a prominent rock formation at one end of the beach — is one of the most recognisable landmarks on the entire Lagos coast.'],
  facts=[('Municipality','Lagos, Algarve'),('Water quality','Excellent'),('Type','Sandy cove between cliffs'),('Services','Village steps away'),('Camera','Beachcam by MEO')],
  links=[('/en/praias/praia-da-luz/','Praia da Luz guide →'),('/en/where-to-stay-algarve-beach','Where to stay in the Algarve →'),('/en/calm-beaches-algarve','Calm beaches in the Algarve →'),('/en/webcams?region=Algarve','More Algarve webcams →')],
  faq_tag='FAQ', faq_title='Before you go to <em>Praia da Luz</em>',
  faq=[('Where can I watch the Praia da Luz webcam live?','The live camera at Praia da Luz belongs to Beachcam by MEO and streams on MEO’s official site (“Open the live cam” button above). On this page we add what the picture does not show: wave height and period, wind, water temperature and the forecast for the next hours.'),
       ('What is the sea temperature at Praia da Luz today?','The current value is in the “The sea at Praia da Luz right now” panel (sea surface temperature, Open-Meteo forecast). In the Algarve the water is usually warmest at the end of summer, in August and September.'),
       ('Is Praia da Luz good for children?','When the sea is calm, yes: the beach is medium-sized and the village has services steps away. Check the wave height above before you go and, in the bathing season, stay near the lifeguard-patrolled area.'),
       ('Where to stay near Praia da Luz?','In Luz itself, to walk to the beach, or in Lagos, a few kilometres away, with more restaurants and nightlife. Compare prices for your dates at <a href="BOOKING" target="_blank" rel="sponsored noopener noreferrer">hotels near Praia da Luz</a>.'),
       ('How do I get to Praia da Luz?','Luz is west of Lagos, in the western Algarve. Most visitors fly into Faro and drive along the A22 motorway, which has been toll-free since 2025.')],
  updated='Updated 06/10/2026. Beach description: Portal Turismo Portugal editorial database; water quality per the official classification (APA).',
 ),
}

def esc_attr(s):
    return s.replace('&', '&amp;').replace('"', '&quot;')

def build(lang):
    c = L[lang]
    src = io.open(f'{SRC}/{c["src"]}', encoding='utf-8', newline='').read()
    eol = '\r\n' if '\r\n' in src else '\n'
    s = src.replace('\r\n', '\n')
    url = BASE + c['path']
    booking = c['booking']

    # ---------- head ----------
    i_title = s.index('  <title>')
    head_top = s[:i_title]
    assert head_top.count('<meta charset="UTF-8">') == 1 and 'gtag(' in head_top
    m = re.search(r'\n\s*<link href="https://fonts\.googleapis\.com/css2[^\n]*\n<noscript>[^\n]*\n', s)
    assert m, 'fonts link'
    fonts = m.group(0).strip('\n')

    faq_ld = [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": re.sub(r'<[^>]+>', '', a)}} for q, a in c['faq']]
    ld = {"@context": "https://schema.org", "@graph": [
        {"@type": "WebPage", "name": c['ogtitle'], "description": c['desc'], "url": url, "inLanguage": c['inlang'],
         "isPartOf": {"@type": "WebSite", "name": "Portal Turismo Portugal", "url": BASE + "/"},
         "about": {"@type": "Beach", "name": "Praia da Luz", "geo": {"@type": "GeoCoordinates", "latitude": 37.0834, "longitude": -8.7234},
                   "containedInPlace": {"@type": "Place", "name": "Lagos, Algarve, Portugal"}},
         "primaryImageOfPage": {"@type": "ImageObject", "url": SUPA_IMG, "license": "https://creativecommons.org/licenses/by-sa/3.0/"}},
        {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": c['home'], "item": BASE + ('/en/' if lang == 'en' else '/')},
            {"@type": "ListItem", "position": 2, "name": "Webcams", "item": BASE + c['webcams_href']},
            {"@type": "ListItem", "position": 3, "name": "Praia da Luz", "item": url}]},
        {"@type": "FAQPage", "mainEntity": faq_ld}]}
    pt_url, en_url = BASE + L['pt']['path'], BASE + L['en']['path']
    head = head_top + '\n'.join([
        f'  <title>{c["title"].replace("&", "&amp;")}</title>',
        f'  <meta name="description" content="{esc_attr(c["desc"])}">',
        f'  <link rel="canonical" href="{url}">',
        f'  <link rel="alternate" hreflang="pt" href="{pt_url}">',
        f'  <link rel="alternate" hreflang="en" href="{en_url}">',
        f'  <link rel="alternate" hreflang="x-default" href="{pt_url}">',
        '  <meta name="robots" content="index, follow, max-image-preview:large">',
        '  <meta property="og:type" content="website">',
        f'  <meta property="og:title" content="{esc_attr(c["ogtitle"])}">',
        f'  <meta property="og:description" content="{esc_attr(c["desc"])}">',
        f'  <meta property="og:url" content="{url}">',
        f'  <meta property="og:locale" content="{c["locale"]}">',
        '  <meta property="og:site_name" content="Portal Turismo Portugal">',
        f'  <meta property="og:image" content="{SUPA_IMG}">',
        '  <meta name="twitter:card" content="summary_large_image">',
        f'  <meta name="twitter:title" content="{esc_attr(c["ogtitle"])}">',
        f'  <meta name="twitter:description" content="{esc_attr(c["desc"])}">',
        f'  <meta name="twitter:image" content="{SUPA_IMG}">',
        '  <script type="application/ld+json">',
        json.dumps(ld, ensure_ascii=False, indent=2),
        '  </script>',
        '  <link rel="preconnect" href="https://fonts.googleapis.com">',
        '  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
        fonts,
        '  <link rel="preload" as="image" type="image/webp" href="/images/heroes/praia-da-luz-1200.webp" imagesrcset="/images/heroes/praia-da-luz-800.webp 800w, /images/heroes/praia-da-luz-1200.webp 1200w, /images/heroes/praia-da-luz-1600.webp 1600w" imagesizes="(max-width: 768px) 90vw, 60vw" fetchpriority="high">',
        '  <link rel="stylesheet" href="/css/style.css?v=20260522-navdd-c">',
        '  <link rel="stylesheet" href="/css/webcams-guias-page.css?v=20261005-aff">',
        f'  <link rel="stylesheet" href="/css/spot-page.css?v={V}">',
        '<link rel="stylesheet" href="/css/gyg-block.css?v=20260513-gyg2">',
        '<script async src="https://widget.getyourguide.com/dist/pa.umd.production.min.js" data-gyg-partner-id="0WTBHZE"></script>',
        '</head>', ''])

    # ---------- body top (navbar + svg clip), herdado ----------
    i_body = s.index('<body>')
    i_main = s.index('<main id="main">')
    body_top = s[i_body:i_main]
    assert body_top.count(c['lang_old']) == 1, ('lang', lang)
    body_top = body_top.replace(c['lang_old'], c['lang_new'])
    assert 'hero-wave-clip' in body_top
    # o link Webcams do menu nao e a pagina atual
    body_top = body_top.replace(' class="active" role="listitem" aria-current="page">Webcams', ' role="listitem">Webcams')

    # ---------- main ----------
    words = []; n = 0
    for line in c['h1']:
        ws = []
        for w in line:
            ws.append(f'<span class="page-hero__word" style="--i:{n}">{w}</span>'); n += 1
        words.append('          <span class="page-hero__line">\n            ' + '\n            '.join(ws) + '\n          </span>')
    tiles = []
    for key, label, sub in c['tiles']:
        sub_html = f'<span class="spot-tile-sub" data-spot="{sub}">—</span>' if sub in ('wave-sub', 'wind-sub') else f'<span class="spot-tile-sub">{sub}</span>'
        cls = ' spot-tile--water' if key == 'sst' else ''
        tiles.append(f'        <div class="spot-tile{cls}"><span class="spot-tile-label">{label}</span><span class="spot-tile-value" data-spot="{key}">—</span>{sub_html}</div>')
    hours_li = '\n'.join(['          <li><span>—</span><span>—</span><span>—</span></li>'] * 6)
    next_cards = []
    for label, title, desc, cta, href, grad, icon, ext in c['next']:
        href = booking.replace('&', '&amp;') if href == 'BOOKING' else href
        attrs = ' target="_blank" rel="sponsored noopener noreferrer"' if ext else ''
        next_cards.append(f'''        <a href="{href}" class="zone-card"{attrs}>
          <div class="zone-icon" style="background:linear-gradient(135deg,{grad})">{icon}</div>
          <span class="zone-label">{label}</span>
          <p class="zone-title">{title}</p>
          <p class="zone-desc">{desc}</p>
          <span class="zone-cta">{cta} {ARROW}</span>
        </a>''')
    facts = '\n'.join(f'        <li><span>{a}</span><span>{b}</span></li>' for a, b in c['facts'])
    links = '\n'.join(f'        <a href="{h}">{t}</a>' for h, t in c['links'])
    faqs = '\n'.join(f'      <details><summary>{q}</summary><p>{a.replace("BOOKING", booking.replace("&", "&amp;"))}</p></details>' for q, a in c['faq'])

    main = f'''<main id="main">

  <!-- Hero (mesmo componente .page-hero das paginas webcams/surf/pesca) -->
  <section class="page-hero" aria-label="{c['ogtitle']}">
    <div class="page-hero__media">
      <img class="page-hero__image"
           src="/images/heroes/praia-da-luz-1200.webp"
           srcset="/images/heroes/praia-da-luz-800.webp 800w, /images/heroes/praia-da-luz-1200.webp 1200w, /images/heroes/praia-da-luz-1600.webp 1600w"
           sizes="(max-width: 768px) 90vw, 60vw"
           width="1200" height="900"
           fetchpriority="high"
           alt="{c['alt']}"
           loading="eager">
      <div class="page-hero__media-overlay" aria-hidden="true"></div>
      <p class="page-hero__attribution" data-source-url="https://pt.wikipedia.org/wiki/Praia_da_Luz">{c['photo']} · CC BY-SA 3.0</p>
    </div>
    <div class="page-hero__content">
      <p class="page-hero__kicker">{c['kicker']}</p>
      <h1 class="page-hero__headline">
{chr(10).join(words)}
      </h1>
      <p class="page-hero__sub">{c['sub']}</p>
      <div class="page-hero__actions">
        <a href="{CAM}" class="page-hero__cta page-hero__cta--primary" target="_blank" rel="noopener noreferrer">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none"/></svg>
          {c['cta1']}
        </a>
        <a href="{booking.replace('&', '&amp;')}" class="page-hero__cta page-hero__cta--secondary" target="_blank" rel="sponsored noopener noreferrer">{c['cta2']}</a>
      </div>
    </div>
  </section>

  <!-- Breadcrumb -->
  <nav class="breadcrumb" aria-label="{'Localização na página' if lang == 'pt' else 'Breadcrumb'}">
    <a href="{'/' if lang == 'pt' else '/en/'}">{c['home']}</a>
    {CRUMB}
    <a href="{c['webcams_href']}">{c['webcams']}</a>
    {CRUMB}
    <span aria-current="page">{c['crumb']}</span>
  </nav>

  <!-- Condicoes ao vivo (js/spot-page.js) -->
  <section class="spot-section spot-section--alt" id="{'condicoes' if lang == 'pt' else 'conditions'}" aria-labelledby="spot-now-title" data-spot-lat="{LAT}" data-spot-lng="{LNG}" data-spot-lang="{lang}">
    <div class="spot-wrap">
      <span class="value-tag">{c['now_tag']} · <span data-spot="updated">{c['updating']}</span></span>
      <h2 class="value-title" id="spot-now-title">{c['now_title']}</h2>
      <p class="spot-verdict" data-spot="verdict" aria-live="polite">{c['loading']}</p>
      <div class="spot-tiles">
{chr(10).join(tiles)}
      </div>
      <div class="spot-hours">
        <p class="spot-hours-title">{c['hours']}</p>
        <ol data-spot="hours">
{hours_li}
        </ol>
      </div>
      <p class="spot-note">{c['note']}</p>

      <div class="spot-cam">
        <div class="spot-cam-text">
          <p class="spot-cam-label">{c['cam_label']}</p>
          <p class="spot-cam-title">{c['cam_title']}</p>
          <p class="spot-cam-sub">{c['cam_sub']}</p>
        </div>
        <a href="{CAM}" class="spot-cam-btn" target="_blank" rel="noopener noreferrer">{ICON_CAM.replace('<svg ', '<svg ')} {c['cam_btn']} {ICON_EXT}</a>
      </div>
    </div>
  </section>

  <!-- Proximo passo (afiliados que faturam: Stay22 via link Booking, DiscoverCars, planeador) -->
  <section class="spot-section" aria-labelledby="spot-next-title">
    <div class="spot-wrap">
      <span class="value-tag">{c['next_tag']}</span>
      <h2 class="value-title" id="spot-next-title">{c['next_title']}</h2>
      <div class="spot-next">
{chr(10).join(next_cards)}
      </div>
    </div>
  </section>

  <!-- GYG afiliado: atividades em Lagos -->
  <section class="gyg-block" aria-label="{c['gyg_aria']}">
    <div class="gyg-block-bg">
      <div class="gyg-block-inner">
        <div class="gyg-block-header">
          <div class="gyg-block-number">&#8470; 02</div>
          <div class="gyg-block-headtext">
            <div class="gyg-block-eyebrow">{c['gyg_eyebrow']}</div>
            <h2 class="gyg-block-title">{c['gyg_title']}</h2>
            <p class="gyg-block-trust">{c['gyg_trust']}</p>
          </div>
        </div>
        <div class="gyg-block-frame">
          <div class="gyg-block-frame-head">
            <div class="gyg-block-frame-head-left">
              <svg class="gyg-block-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 20c2-2 4-3 6-3 2.5 0 4 1.5 6 1.5 2 0 3.5-1 4-1.5"/><path d="M9 9c0 2.5 1 4.5 3 6"/><path d="M15 3c-2 3-2.5 5.5-1 8"/></svg>
              <div>
                <div class="gyg-block-frame-title">{c['gyg_frame']}</div>
                <div class="gyg-block-frame-sub">{c['gyg_frame_sub']}</div>
              </div>
            </div>
          </div>
          <div data-gyg-href="https://widget.getyourguide.com/default/activities.frame" data-gyg-locale-code="{c['gyg_locale']}" data-gyg-widget="activities" data-gyg-number-of-items="3" data-gyg-cmp="{c['gyg_cmp']}" data-gyg-partner-id="0WTBHZE" data-gyg-q="{c['gyg_q']}"><span>Powered by <a target="_blank" rel="sponsored" href="https://www.getyourguide.com/">GetYourGuide</a></span></div>
          <div class="gyg-block-frame-foot">
            <div class="gyg-block-frame-foot-text">POWERED BY GETYOURGUIDE</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Sobre a praia (texto da BD editorial) -->
  <section class="spot-section spot-section--alt" aria-labelledby="spot-about-title">
    <div class="spot-wrap">
      <span class="value-tag">{c['about_tag']}</span>
      <h2 class="value-title" id="spot-about-title">{c['about_title']}</h2>
      <div class="spot-about">
        <div>
          <p>{c['about'][0]}</p>
          <p>{c['about'][1]}</p>
          <div class="spot-links">
{links}
          </div>
        </div>
        <ul class="spot-facts">
{facts}
        </ul>
      </div>
    </div>
  </section>

  <!-- FAQ (FAQPage no JSON-LD) -->
  <section class="spot-section" aria-labelledby="spot-faq-title">
    <div class="spot-wrap spot-faq">
      <span class="value-tag">{c['faq_tag']}</span>
      <h2 class="value-title" id="spot-faq-title">{c['faq_title']}</h2>
{faqs}
      <p class="spot-note">{c['updated']}</p>
    </div>
  </section>

'''
    # ---------- fim (rodape, menu inferior, scripts), herdado ----------
    i_end = s.index('</main>')
    tail = s[i_end:]
    tail = tail.replace(' aria-current="page">Webcams</a></li>', '>Webcams</a></li>')
    for pat in [r'<script src="/js/beach-renderer\.js[^"]*" defer></script>\n',
                r'<script src="/js/webcams-guias-data\.js[^"]*" defer></script>\n',
                r'<script src="/js/webcams-guias-page\.js[^"]*" defer></script>\n']:
        tail, k = re.subn(pat, '', tail)
        assert k == 1, pat
    anchor = re.search(r'<script>\(function \(s, t, a, y, twenty, two\)[^\n]*\n', tail)
    assert anchor, 'stay22'
    tail = tail[:anchor.end()] + f'<script src="/js/spot-page.js?v={V}" defer></script>\n' + tail[anchor.end():]
    assert 'affiliate.js' in tail and 'cookie-consent.js' in tail and 'nav-dropdown.js' in tail

    out = head + body_top + main + tail
    assert out.rstrip().endswith('</html>')
    out = out.replace('\n', eol)
    io.open(f'{OUT}/{c["out"]}', 'w', encoding='utf-8', newline='').write(out)
    print('ok', c['out'], len(out), 'bytes')

for lg in ('pt', 'en'):
    build(lg)
