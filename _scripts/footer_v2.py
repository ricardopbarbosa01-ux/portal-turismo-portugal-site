"""Rodape v2: substitui <footer class="footer"...>...</footer> pelo rodape compacto unico (PT ou EN pelo <html lang>)
e liga /css/footer-v2.css antes de </head>. Uso: python3 footer_v2.py <lista.json> <saida_dir|--inplace>
Escrita segura no disco montado: ficheiro temporario + os.replace. Idempotente (salta paginas ja com ft2)."""
import re, sys, os, json
CSS='<link rel="stylesheet" href="/css/footer-v2.css?v=20261007">'
LOGO='<svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5" fill="#0a3d6b"/></svg>'
def footer(lang):
    if lang=='en':
        rows=[('Explore',[('/en/beaches','Beaches'),('/en/surf','Surf'),('/en/pesca','Fishing'),('/en/webcams','Webcams'),('/en/guides','Guides'),('/en/planear','Plan a trip'),('https://www.discovercars.com/portugal?a_aid=portalturismoportugal','Car hire')]),
              ('Business',[('/en/parceiros','For your business'),('/en/precos','Pricing'),('/en/media-kit','Media kit')]),
              ('About',[('/en/about','About us'),('/en/methodology','Methodology'),('/en/transparency','Transparency'),('/en/contact','Contact')])]
        legal=[('/en/privacy','Privacy'),('/en/terms','Terms'),('/en/cookies','Cookies'),('/en/refund-policy','Refunds')]
        tag='Beaches, webcams, surf and fishing in Portugal — with live conditions.'; home='/en/'; aria='Footer'; rights='All rights reserved.'
    else:
        rows=[('Explorar',[('/beaches','Praias'),('/surf','Surf'),('/pesca','Pesca'),('/webcams','Webcams'),('/guias','Guias'),('/planear','Planear viagem'),('https://www.discovercars.com/pt/portugal?a_aid=portalturismoportugal','Aluguer de carro')]),
              ('Negócios',[('/parceiros','Para o seu negócio'),('/precos','Preços'),('/media-kit','Media kit')]),
              ('Sobre',[('/sobre','Sobre nós'),('/metodologia-editorial','Metodologia'),('/transparencia-comercial','Transparência'),('/contact','Contacto')])]
        legal=[('/privacidade','Privacidade'),('/termos','Termos'),('/cookies','Cookies'),('/refund-policy','Reembolsos')]
        tag='Praias, webcams, surf e pesca em Portugal — com condições ao vivo.'; home='/'; aria='Rodapé'; rights='Todos os direitos reservados.'
    def a(h,t):
        ext=' target="_blank" rel="noopener noreferrer sponsored"' if h.startswith('http') else ''
        return f'<a href="{h}"{ext}>{t}</a>'
    nav='\n'.join(f'      <p class="ft2__row"><span class="ft2__h">{h}</span>'+''.join(a(*x) for x in L)+'</p>' for h,L in rows)
    return (f'<footer class="footer ft2" role="contentinfo" aria-label="{aria}">\n'
            f'  <div class="ft2__main">\n'
            f'    <div>\n      <a class="ft2__brand" href="{home}"><span class="ft2__logo" aria-hidden="true">{LOGO}</span>Portugal Travel Hub</a>\n'
            f'      <p class="ft2__tag">{tag}</p>\n    </div>\n'
            f'    <nav class="ft2__nav" aria-label="{aria}">\n{nav}\n    </nav>\n  </div>\n'
            f'  <div class="ft2__bottom">\n    <span>© <span id="footer-year">2026</span> Portugal Travel Hub. {rights}</span>\n'
            f'    <span class="ft2__legal">'+''.join(a(*x) for x in legal)+'</span>\n  </div>\n</footer>')
def transform(s):
    if 'class="footer ft2"' in s: return None,'ja'
    m=list(re.finditer(r'<footer class="footer"[^>]*>.*?</footer>',s,re.S))
    if len(m)!=1: return None,f'{len(m)} footers'
    if s.count('</head>')!=1: return None,'head'
    lm=re.search(r'<html[^>]*\blang="([a-zA-Z-]+)"',s); lang='en' if lm and lm.group(1).lower().startswith('en') else 'pt'
    nl='\r\n' if '\r\n' in s else '\n'
    f=footer(lang).replace('\n',nl)
    s=s[:m[0].start()]+f+s[m[0].end():]
    s=s.replace('</head>',CSS+nl+'</head>',1)
    return s,lang
if __name__=='__main__':
    files=json.load(open(sys.argv[1])); out=sys.argv[2]; rep={}
    for p in files:
        s=open(p,encoding='utf-8',newline='').read()
        t,info=transform(s); rep[p]=info
        if t is None: continue
        if out=='--inplace':
            tmp=p+'.ft2tmp'
            with open(tmp,'w',encoding='utf-8',newline='') as fh: fh.write(t)
            os.replace(tmp,p)
        else:
            d=os.path.join(out,os.path.dirname(p)); os.makedirs(d,exist_ok=True)
            with open(os.path.join(out,p),'w',encoding='utf-8',newline='') as fh: fh.write(t)
    import collections; print(collections.Counter(rep.values())); print({k:v for k,v in rep.items() if v not in('pt','en')})
