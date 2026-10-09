/* affiliate.js — Portal Turismo Portugal
 * 1) Regista no GA4 cada clique de saída para parceiros afiliados (evento `affiliate_click`).
 * 2) Reescreve links Booking.com para o link de afiliado SÓ quando BOOKING estiver configurado.
 * Delegação no document: cobre links estáticos e os gerados por JS (ex.: beach-page.js).
 * Sem dependências. Se algo falhar, o link original segue normalmente.
 */
(function () {
  'use strict';

  // ── Preencher após aprovação na CJ (Booking.com). Vazio = links ficam como estão. ──
  // Opção A (deep link CJ): pid = PID do site na CJ, adId = ID do link/anúncio Booking na CJ.
  // Opção B (parâmetro aid da Booking): aid = ID de afiliado Booking.
  var BOOKING = { pid: '', adId: '', aid: '' };

  var PARTNERS = [
    ['booking',        /(^|\.)booking\.com$/i],
    ['stay22',         /(^|\.)stay22\.com$/i],
    ['discovercars',   /(^|\.)discovercars\.com$/i],
    ['viator',         /(^|\.)viator\.com$/i],
    ['simpson_travel', /(^|\.)simpsontravel\.com$/i],
    ['getyourguide',   /(^|\.)getyourguide\.[a-z.]+$/i],
    ['amazon',         /(^|\.)(amazon\.[a-z.]+|amzn\.to)$/i],
    ['booksurfcamps',  /(^|\.)(booksurfcamps|bookyogaretreats|tripaneer|bookallsafaris|bookhorseridingholidays|bookyogateachertraining|bookcyclingholidays)\.com$/i],
    ['fishingbooker',  /(^|\.)fishingbooker\.com$/i],
    ['awin',           /(^|\.)awin1\.com$/i],
    ['cj',             /(^|\.)(anrdoezrs|dpbolvw|jdoqocy|kqzyfj|tkqlhce)\.net$|(^|\.)(anrdoezrs|dpbolvw|jdoqocy|kqzyfj|tkqlhce)\.com$/i]
  ];

  function partnerOf(host) {
    for (var i = 0; i < PARTNERS.length; i++) if (PARTNERS[i][1].test(host)) return PARTNERS[i][0];
    return null;
  }

  function bookingUrl(u) {
    if (BOOKING.aid && !u.searchParams.has('aid')) { u.searchParams.set('aid', BOOKING.aid); return u.href; }
    if (BOOKING.pid && BOOKING.adId) return 'https://www.anrdoezrs.net/click-' + BOOKING.pid + '-' + BOOKING.adId + '?url=' + encodeURIComponent(u.href);
    return null;
  }

  function dcChannel(path) {
    var p = (path || '/').replace(/\.html$/, '').replace(/\/$/, '').replace(/^\/en(?=\/|$)/, '') || '/';
    if (p === '/' || p === '/index') return 'home';
    if (/webcam/.test(p)) return 'webcams';
    if (/^\/planear/.test(p)) return 'planear';
    if (/^\/beaches$/.test(p)) return 'praias';
    if (/^\/beach$|^\/praias\//.test(p)) return 'praia';
    if (/onde-ficar|where-to-stay/.test(p)) return 'onde-ficar';
    if (/alugar-carro|car-hire/.test(p)) return 'guia-carro';
    if (/^\/surf/.test(p)) return 'surf';
    if (/^\/pesca/.test(p)) return 'pesca';
    if (/^\/guia|^\/guides/.test(p)) return 'guias';
    return 'outras';
  }

  function prepare(a) {
    if (a.dataset.affPartner) return a.dataset.affPartner;
    var u;
    try { u = new URL(a.href, location.href); } catch (_) { return null; }
    if (u.hostname === location.hostname) return null;
    var p = partnerOf(u.hostname);
    if (!p) return null;
    a.dataset.affPartner = p;
    a.dataset.affDest = u.hostname + u.pathname;
    if (p === 'booking') {
      var nu = bookingUrl(u);
      if (nu) a.href = nu;
    }
    // Lote H2 09/10: DiscoverCars (Post Affiliate Pro) — canal por pagina (chan, tem de existir no painel: Promocao > Ad channels)
    // + data1 com o caminho exato (nao precisa de configuracao). Nao mexe no a_aid.
    if (p === 'discovercars' && u.searchParams.has('a_aid') && !u.searchParams.has('chan')) {
      u.searchParams.set('chan', dcChannel(location.pathname));
      u.searchParams.set('data1', location.pathname.replace(/\.html$/, '').slice(0, 60) || '/');
      a.href = u.href;
    }
    if (!/\bsponsored\b/.test(a.rel || '')) a.rel = ((a.rel || '') + ' sponsored').trim();
    return p;
  }

  function onPointer(e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (a) prepare(a);
  }

  function onClick(e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var p = prepare(a);
    if (!p) return;
    var params = { partner: p, link_destination: (a.dataset.affDest || '').slice(0, 100), page_path: location.pathname };
    try {
      if (window.track) window.track('affiliate_click', params);
      else if (window.gtag) window.gtag('event', 'affiliate_click', params);
    } catch (_) {}
  }

  document.addEventListener('mousedown', onPointer, true);
  document.addEventListener('touchstart', onPointer, { capture: true, passive: true });
  document.addEventListener('keydown', function (e) { if (e.key === 'Enter') onPointer(e); }, true);
  document.addEventListener('click', onClick, true);
  document.addEventListener('auxclick', onClick, true);
})();
