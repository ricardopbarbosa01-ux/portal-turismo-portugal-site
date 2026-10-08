# -*- coding: utf-8 -*-
"""Decisoes 08/10 (Ricardo: 'voce decide'): especies proibidas na ludica fora dos cartoes; Tejo 2 canas + 3 anzois (Portaria 330/2026/1); defeso do sargo PNSACV 1-28 fev (FAQ DGRM 2026, Portaria 372/2024/1 alterada pela 51-A/2026/1)."""
import os, re
def rd(p): return open(p, encoding='utf-8', newline='').read()
def wr(p, s): open(p+'.tmp','w',encoding='utf-8',newline='').write(s); os.replace(p+'.tmp', p)
def rep(s, a, b, n=1):
    c = s.count(a); assert c == n, (c, n, a[:90]); return s.replace(a, b)
def block(s, sid):
    i = s.index("id: '%s'" % sid); j = s.index('\n    },', i); return i, j
def setblock(s, sid, fn):
    i, j = block(s, sid); return s[:i] + fn(s[i:j]) + s[j:]
q = lambda x: "'" + x.replace("\\", "\\\\").replace("'", "\\'") + "'"
d = rd('js/surf-pesca-data.js'); NL = '\r\n' if '\r\n' in d else '\n'
def field(b, name, val):
    return re.sub(r"(\n      %s: )\{[^\n]*\}," % name, lambda m: m.group(1) + val + ',', b, count=1)
def descf(b, pt, en):
    return re.sub(r"(\n      desc: \{\r?\n        pt: ).*?(\r?\n      \},)", lambda m: m.group(1) + q(pt) + ',' + NL + '        en: ' + q(en) + ',' + m.group(2), b, count=1, flags=re.S)
def add_aviso(b, pt, en):
    assert 'aviso:' not in b
    return re.sub(r"(\n      tags: )", lambda m: NL + "      aviso: { pt: %s, en: %s }," % (q(pt), q(en)) + m.group(1), b, count=1)
pe = lambda pt, en: '{ pt: %s, en: %s }' % (q(pt), q(en))
# 1a Viana — Rio Lima (estuario)
def viana(b):
    b = field(b, 'season', pe('Outubro–Abril (robalo)', 'October–April (sea bass)'))
    b = field(b, 'especies', pe('Robalo, Tainha', 'Sea bass, Mullet'))
    b = field(b, 'tecnica', pe('Spinning / Fundo', 'Spinning / Bottom'))
    b = descf(b, 'Estuário do Lima junto à cidade, com margens acessíveis a pé. O robalo entra com a maré, sobretudo nas mudanças de maré e do outono à primavera — spinning ou fundo a partir de terra.',
                 'The Lima estuary right by the city, with banks you can walk to. Sea bass come in with the tide, especially around the turn of the tide from autumn to spring — lure or bottom fishing from the bank.')
    b = add_aviso(b, 'Regulamento do rio Lima (Portaria 370/2024/1): a partir de terra só cana ou linha de mão, máximo 2 canas; proibido pescar a jusante da bacia de rotação do porto comercial (boia n.º 11). Sável e lampreia são pescas profissionais — proibidas na pesca lúdica.',
                     'Lima river rules (Portaria 370/2024/1): from the bank only rod or handline, max. 2 rods; no fishing downstream of the commercial port turning basin (buoy no. 11). Shad and lamprey are commercial net fisheries — not allowed for recreational anglers.')
    return re.sub(r"\n      tags: \{[^\n]*\},", NL + "      tags: { pt: ['Robalo', 'Estuário', 'Spinning'], en: ['Sea Bass', 'Estuary', 'Spinning'] },", b, count=1)
d = setblock(d, 'viana-rio-lima', viana)
# 1b Rio Lima — Ponte de Lima
def plima(b):
    b = field(b, 'season', pe('Março–Julho (truta)', 'March–July (trout)'))
    b = field(b, 'especies', pe('Truta, Barbo, Boga', 'Brown trout, Barbel, Nase'))
    b = descf(b, 'Um dos rios mais bonitos de Portugal: truta à mosca ou à amostra nos troços de corrente e barbos e bogas nas zonas calmas junto à vila.',
                 "One of Portugal's most beautiful rivers: trout on fly or lure in the faster stretches, barbel and nase in the slow water by the town.")
    b = add_aviso(b, 'Licença de pesca em águas interiores (ICNF). Truta-de-rio de 1 de março a 31 de julho, mínimo 20 cm. Sável e lampreia não podem ser pescados na pesca lúdica.',
                     'Inland fishing licence (ICNF). Brown trout 1 March–31 July, minimum 20 cm. Shad and lamprey may not be taken by recreational anglers.')
    return re.sub(r"\n      tags: \{[^\n]*\},", NL + "      tags: { pt: ['Mosca', 'Truta', 'Cenário'], en: ['Fly Fishing', 'Trout', 'Scenery'] },", b, count=1)
d = setblock(d, 'rio-lima-ponte-de-lima', plima)
RAB = ('Atum-rabilho: só pode ser retido a bordo de embarcações de pesca-turística autorizadas pela DGRM (quota anual); nas outras saídas é devolvido ao mar.',
       'Bluefin tuna: may only be kept on DGRM-authorised fishing-tourism boats (annual quota); on other trips it must be released.')
# 1c Canical
def canical(b):
    b = field(b, 'especies', pe('Marlim, Patudo, Wahoo, Dourado', 'Marlin, Bigeye tuna, Wahoo, Mahi-mahi'))
    b = descf(b, 'O porto do Caniçal é uma das bases de charters de pesca grossa da Madeira. Espadim e atum-patudo sobretudo de maio a outubro, em águas quentes e fundas a poucas milhas da costa.',
                 "Caniçal harbour is one of Madeira's big-game charter bases. Marlin and bigeye tuna mainly May to October, in warm, deep water a few miles offshore.")
    return re.sub(r"\n      tags: \{[^\n]*\},", NL + "      tags: { pt: ['Big Game', 'Marlim', 'Patudo', 'Madeira', 'Charter'], en: ['Big Game', 'Marlin', 'Bigeye Tuna', 'Madeira', 'Charter'] },", b, count=1)
d = setblock(d, 'madeira-canical', canical)
# 1d Sesimbra / Portimao
def sesimbra(b):
    b = field(b, 'especies', pe('Espadim, Atuns, Pargo', 'Billfish, Tuna, Red porgy'))
    b = b.replace("Large bluefin tuna and billfish just miles offshore", "Large tuna and billfish just miles offshore")
    return add_aviso(b, *RAB)
d = setblock(d, 'sesimbra-mar-alto', sesimbra)
def portimao(b):
    b = field(b, 'especies', pe('Atuns, Dourada, Polvo', 'Tuna, Sea bream, Octopus'))
    return add_aviso(b, *RAB)
d = setblock(d, 'portimao-barco', portimao)
# 3 Sargo PNSACV (novos avisos)
d = rep(d, 'em fevereiro (fontes indicam até 15 de março — confirme)', 'de 1 a 28 de fevereiro', 3)
d = rep(d, 'white seabream in February (sources say until 15 March — check)', 'white seabream 1–28 February', 1)
d = re.sub(r'(shore closed season for white seabream )[^,;.]*?\(sources[^)]*\)', r'\g<1>1–28 February', d)
# 2 Tejo (novos avisos)
d = rep(d, 'no máximo 2 canas por pescador;', 'no máximo 2 canas e 3 anzóis por pescador;', 3)
wr('js/surf-pesca-data.js', d)
# FAQ / textos das paginas
br = rd('js/beach-renderer.js')
br = rep(br, 'Para sável e lampreia nos rios: Março a Junho. Para robalão e pargo', 'Para truta nos rios: 1 de Março a 31 de Julho. Para robalo e pargo')
br = rep(br, 'For bluefin tuna and billfish offshore: June to October. For shad and lamprey in rivers: March to June.', 'For tuna and billfish offshore: June to October. For trout in rivers: 1 March to 31 July.')
wr('js/beach-renderer.js', br)
p = rd('pesca.html')
p = rep(p, 'Para sável e lampreia nos rios: Março a Junho. Para robalão e pargo', 'Para truta nos rios: 1 de Março a 31 de Julho. Para robalo e pargo')
p = rep(p, 'Rios e albufeiras: truta, sável, achigã e lúcio.', 'Rios e albufeiras: truta, barbo, achigã e lúcio.')
p = rep(p, 'algumas espécies, como o sável e a lampreia, têm épocas em que não se podem capturar.', 'algumas espécies têm épocas em que não se podem capturar (corvina em junho; sargo em fevereiro na Costa Vicentina), e outras — sável, lampreia, enguia, meros, atum-rabilho — não se podem pescar na pesca lúdica.')
p = re.sub(r'beach-renderer\.js\?v=[^"\']+', 'beach-renderer.js?v=20261008-esp', p)
wr('pesca.html', p)
e = rd('en/pesca.html')
e = rep(e, 'For shad and lamprey in rivers: March to June.', 'For trout in rivers: 1 March to 31 July.')
e = rep(e, 'Rivers and reservoirs: trout, shad, black bass and pike.', 'Rivers and reservoirs: trout, barbel, black bass and pike.')
e = rep(e, 'some species, such as shad and lamprey, cannot be caught at certain times of year.', 'some species have closed seasons (meagre in June; white seabream in February on the south-west coast), and others — shad, lamprey, eel, groupers, bluefin tuna — cannot be taken by recreational anglers at all.')
e = re.sub(r'beach-renderer\.js\?v=[^"\']+', 'beach-renderer.js?v=20261008-esp', e)
wr('en/pesca.html', e)
print('ok')
