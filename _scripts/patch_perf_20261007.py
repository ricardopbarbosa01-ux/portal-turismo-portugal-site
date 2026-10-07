import re,sys,os
R=sys.argv[1]
def rw(p,f):
    fp=os.path.join(R,p); s=open(fp,encoding='utf-8',newline='').read(); n=f(s)
    if n==s: print('NOCHANGE',p); return
    t=fp+'.tmp'; open(t,'w',encoding='utf-8',newline='').write(n); os.replace(t,fp); print('ok',p)
AV='/images/map/portugal-relevo-560.avif 560w, /images/map/portugal-relevo-760.avif 760w, /images/map/portugal-relevo-1000.avif 1000w'
SZ='(max-width: 1180px) 300px, 361px'
def html(s):
    s=re.sub(r'<link rel="preload" as="image" href="/images/map/portugal-relevo-720\.webp"[^>]*>',
        f'<link rel="preload" as="image" type="image/avif" imagesrcset="{AV}" imagesizes="{SZ}" fetchpriority="high">',s,count=1)
    s=re.sub(r'(<img class="bh4__relief"[^>]*>)', lambda m: f'<picture><source type="image/avif" srcset="{AV}" sizes="{SZ}">{m.group(1)}</picture>' if '<picture><source type="image/avif"' not in s else m.group(1), s, count=1)
    s=s.replace('beaches-hero-v4.css?v=20261007"','beaches-hero-v4.css?v=20261007p"')
    return s
for p in ['beaches.html','en/beaches.html']: rw(p,html)
rw('css/beaches-hero-v4.css',lambda s:s.replace("url('/images/map/portugal-relevo-420.webp')","url('/images/map/portugal-mascara.png')"))
rw('css/home-hero-v3.css',lambda s:s.replace(".lh__line{display:block; animation:lh-up .9s",".lh__line{display:block; animation:lh-up-t .9s").replace("@keyframes lh-up{","@keyframes lh-up-t{from{transform:translate3d(0,22px,0);} to{transform:none;}}\n@keyframes lh-up{",1))
for p in ['index.html','en/index.html']: rw(p,lambda s:s.replace('home-hero-v3.css?v=20261007"','home-hero-v3.css?v=20261007p"'))
