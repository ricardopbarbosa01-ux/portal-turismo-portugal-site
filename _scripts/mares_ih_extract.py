"""_scripts/mares_ih_extract.py — Lote A2 (09/10/2026)
Extrai as previsoes de mares dos portos de referencia do PDF anual do Instituto Hidrografico
(Tabela de Mares, Vol. I) para data/mares/<ano>/<porto>.json (usado por js/beach-page.js).
Uso (container ou PC com pdfplumber):  python3 mares_ih_extract.py TabelaMare_I_2027.pdf 2027 <pasta_do_site>
Validacao embutida: intervalos 4-8.5 h entre extremos e alternancia preia/baixa (aborta se falhar).
Horas no PDF: "Horas do Fuso: 0 (TU)" -> guardadas em UTC; a pagina converte para a hora legal.
Ao mudar de ano: correr para o ano novo, conferir 2-3 valores a olho contra o PDF, subir ?v= do beach-page.js se mudar codigo.
"""
import pdfplumber, re, json, collections, sys, os, datetime as dt
PDF, YEAR, SITE = sys.argv[1], int(sys.argv[2]), sys.argv[3]
MONTHS=['JANEIRO','FEVEREIRO','MARÇO','ABRIL','MAIO','JUNHO','JULHO','AGOSTO','SETEMBRO','OUTUBRO','NOVEMBRO','DEZEMBRO']
TIME=re.compile(r'^\d\d:\d\d$'); H=re.compile(r'^-?\d\.\d$'); DAY=re.compile(r'^\d\d$')
def dm(s):
    m=re.match(r"(\d+)º\s*(\d+\.\d+)'",s); return int(m.group(1))+float(m.group(2))/60
ports=collections.OrderedDict()
with pdfplumber.open(PDF) as pdf:
  for pi,page in enumerate(pdf.pages):
    t=page.extract_text() or ''
    if 'Horas do Fuso' not in t or 'Ano: %d' % YEAR not in t: continue
    pm=re.search(r'Porto de (.+)\n',t); lm=re.search(r"Latitude\s+(\d+º\s*[\d.]+')\s*N\s+Longitude\s+(\d+º\s*[\d.]+')\s*W",t)
    if not pm or not lm: print('skip page',pi); continue
    name=pm.group(1).strip(); lat=dm(lm.group(1)); lon=-dm(lm.group(2))
    words=page.extract_words(keep_blank_chars=False, use_text_flow=False)
    mons=[w for w in words if w['text'] in MONTHS]; mons.sort(key=lambda w:w['x0'])
    if len(mons)!=3: print('months?',pi,[m['text'] for m in mons]); continue
    hora=[w for w in words if w['text']=='Hora']; hora.sort(key=lambda w:w['x0'])
    if len(hora)!=6: print('hora?',pi,len(hora)); continue
    top0=max(w['bottom'] for w in hora)
    cols=[h['x0'] for h in hora]
    # day labels: 2-digit numbers left of each time column
    body=[w for w in words if w['top']>top0]
    times=[w for w in body if TIME.match(w['text'])]
    heights=[w for w in body if H.match(w['text'])]
    days=[w for w in body if DAY.match(w['text']) and int(w['text'])<=31]
    def col_of(x): return min(range(6), key=lambda i: abs(cols[i]-x))
    P=ports.setdefault(name,{'name':name,'lat':round(lat,5),'lon':round(lon,5),'ev':[]})
    for c in range(6):
        ct=[w for w in times if col_of(w['x0'])==c]
        cd=[w for w in days if w['x1']<cols[c]+2 and (c==0 or w['x0']>cols[c-1]+30) and col_of(w['x1']+40)==c]
        ch=[w for w in heights if col_of(w['x0']-35)==c]
        month=MONTHS.index(mons[c//2]['text'])+1
        ct.sort(key=lambda w:w['top'])
        if not ct: continue
        dif=sorted(b['top']-a['top'] for a,b in zip(ct,ct[1:]) if b['top']-a['top']>1)
        L=dif[len(dif)//4] if dif else 10
        blocks=[[ct[0]]]
        for a,b in zip(ct,ct[1:]):
            if b['top']-a['top']>1.5*L: blocks.append([b])
            else: blocks[-1].append(b)
        for bl in blocks:
            y0=bl[0]['top']-2; y1=bl[-1]['bottom']+2
            dd=[w for w in cd if w['top']>=y0 and w['bottom']<=y1]
            if len(dd)!=1: print('block day?',pi,c,[w['text'] for w in bl],[w['text'] for w in dd]); continue
            for tw in bl:
                hw=[w for w in ch if abs(w['top']-tw['top'])<3 and w['x0']>tw['x1']]
                if not hw: print('noh',pi,tw['text']); continue
                hw=min(hw,key=lambda w:w['x0']-tw['x1'])
                P['ev'].append((month,int(dd[0]['text']),tw['text'],float(hw['text'])))
SLUG={'Viana do Castelo':('viana-do-castelo','Viana do Castelo'),'Leixões':('leixoes','Leixões'),'Aveiro':('aveiro','Aveiro'),'Figueira da Foz':('figueira-da-foz','Figueira da Foz'),
'Peniche':('peniche','Peniche'),'Cascais':('cascais','Cascais'),'Lisboa':('lisboa','Lisboa'),'Sesimbra':('sesimbra','Sesimbra'),'Setúbal (Troia)':('setubal-troia','Setúbal (Tróia)'),
'Sines':('sines','Sines'),'Lagos':('lagos','Lagos'),'Faro-Olhão':('faro-olhao','Faro-Olhão'),'Vila Real de Santo António':('vila-real-de-santo-antonio','Vila Real de Santo António'),
'Funchal':('funchal','Funchal'),'Vila do Porto (Ilha de Santa Maria)':('vila-do-porto','Vila do Porto (Santa Maria)'),'Ponta Delgada (Ilha de S. Miguel)':('ponta-delgada','Ponta Delgada (São Miguel)'),
'Angra do Heroísmo (Ilha Terceira)':('angra-do-heroismo','Angra do Heroísmo (Terceira)'),'Horta (Ilha do Faial)':('horta','Horta (Faial)'),'Lajes das Flores (Ilha das Flores)':('lajes-das-flores','Lajes das Flores (Flores)')}
out=os.path.join(SITE,'data','mares',str(YEAR)); os.makedirs(out,exist_ok=True)
base=dt.datetime(YEAR,1,1)
for n,p in ports.items():
    if n not in SLUG: print('PORTO NOVO sem slug:',n); continue
    slug,short=SLUG[n]
    ev=sorted((dt.datetime(YEAR,m,d,int(t[:2]),int(t[3:])),h) for m,d,t,h in set(p['ev']))
    for a,b in zip(ev,ev[1:]):
        g=(b[0]-a[0]).total_seconds()/3600
        if not 4.0<=g<=8.5: sys.exit('ABORT %s intervalo %.1f h em %s' % (n,g,a[0]))
    for i in range(1,len(ev)-1):
        hi=ev[i][1]>ev[i-1][1] and ev[i][1]>ev[i+1][1]; lo=ev[i][1]<ev[i-1][1] and ev[i][1]<ev[i+1][1]
        if not (hi or lo): sys.exit('ABORT %s sem alternancia em %s' % (n,ev[i][0]))
    doc={'porto':short,'lat':p['lat'],'lon':p['lon'],'ano':YEAR,'fuso':'UTC',
         'fonte':'Instituto Hidrográfico (Marinha) — Tabela de Marés %d, Vol. I' % YEAR,
         'nota':'t = minutos desde %d-01-01 00:00 UTC; h = altura em decímetros acima do zero hidrográfico' % YEAR,
         't':[int((e[0]-base).total_seconds()//60) for e in ev],'h':[int(round(e[1]*10)) for e in ev]}
    open(os.path.join(out,slug+'.json'),'w',encoding='utf-8').write(json.dumps(doc,ensure_ascii=False,separators=(',',':')))
    print(slug,len(ev))
