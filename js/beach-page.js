/** js/beach-page.js — Beach page controller. Requires window.BeachRenderer (beach-renderer.js) and window.db (config.js). */
document.addEventListener('DOMContentLoaded', function() {
  'use strict';

  const lang = window.BeachRenderer.detectLang();
  const T    = window.BeachRenderer.getT();

  document.getElementById('footer-year').textContent = new Date().getFullYear();

  // ── Security helper ──────────────────────────────────────────────
  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
  }

  function captionHtml(b) {
    const source = b.image_source;
    if (!source) return '';
    const author = escapeHtml(b.image_photographer || '');
    if (source === 'manual') {
      return author ? `Foto: ${author}` : '';
    }
    if (source === 'wikipedia_infobox') {
      return lang === 'en' ? 'Photo: Wikipedia' : 'Foto: Wikipedia';
    }
    if (source === 'pexels') {
      if (lang === 'en') {
        return author ? `Photo: ${author} / Pexels` : 'Photo: Pexels';
      }
      return author ? `Foto: ${author} / Pexels` : 'Foto: Pexels';
    }
    return '';
  }

  // ── Highlights grid ──────────────────────────────────────────────
  function buildHighlights(beach) {
    const REGION_TYPES_COLORS = {
      'Algarve':          { color: '#8a6b10', bg: 'rgba(201,168,76,0.12)' },
      'Norte':            { color: '#0a3d6b', bg: 'rgba(10,61,107,0.10)'  },
      'Centro':           { color: '#1e5c4a', bg: 'rgba(30,92,74,0.10)'   },
      'Alentejo':         { color: '#1e8449', bg: 'rgba(39,174,96,0.10)'  },
      'Lisboa e Setúbal': { color: '#1a5fa3', bg: 'rgba(41,128,212,0.10)' },
      'Madeira':          { color: '#1a5fa3', bg: 'rgba(41,128,212,0.10)' },
      'Açores':           { color: '#1e8449', bg: 'rgba(39,174,96,0.10)'  },
    };
    const rtColors = REGION_TYPES_COLORS[beach.region] || { color: '#0a3d6b', bg: 'rgba(10,61,107,0.08)' };
    const rtValue  = T.regionCoastTypes[beach.region] || T.regionCoastTypes.default || escapeHtml(beach.region || 'Portugal');

    const Q_COLORS = {
      'Excelente':  { color: '#1e8449', bg: 'rgba(39,174,96,0.10)' },
      'Boa':        { color: '#1a5fa3', bg: 'rgba(41,128,212,0.10)' },
      'Suficiente': { color: '#b05e0d', bg: 'rgba(230,126,34,0.10)' },
      'Má':         { color: '#c0392b', bg: 'rgba(231,76,60,0.08)' },
    };
    const qc = Q_COLORS[beach.water_quality] || { color: '#8892a4', bg: 'rgba(136,146,164,0.07)' };
    const hasLifeguard = Array.isArray(beach.facilities) && beach.facilities.includes('lifeguard');
    const isSurf = !!beach.is_surf_spot;

    const wqLabel = T.waterQuality[beach.water_quality] || escapeHtml(beach.water_quality);

    const items = [
      { label: T.highlights.coastType, value: rtValue, color: rtColors.color, bg: rtColors.bg,
        icon: '<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/>' },
      ...(beach.water_quality ? [{ label: T.highlights.waterQuality, value: wqLabel, color: qc.color, bg: qc.bg,
        icon: '<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>' }] : []),
      ...(isSurf ? [{ label: T.highlights.surf, value: T.highlights.surfValue, color: '#0a3d6b', bg: 'rgba(10,61,107,0.10)',
        icon: '<path d="M2 14c0 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2"/><path d="M2 18c0 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2"/><line x1="12" y1="2" x2="12" y2="8"/>' }] : []),
      ...(hasLifeguard ? [{ label: T.highlights.lifeguard, value: T.highlights.lifeguardValue, color: '#1e8449', bg: 'rgba(39,174,96,0.10)',
        icon: '<circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 0 0-16 0"/>' }] : []),
    ];

    return items.map(h => `
      <div class="highlight-card">
        <div class="highlight-icon" style="background:${h.bg}">
          <svg viewBox="0 0 24 24" aria-hidden="true" style="stroke:${h.color}">${h.icon}</svg>
        </div>
        <div class="highlight-label">${h.label}</div>
        <div class="highlight-value">${h.value}</div>
      </div>`).join('');
  }

  // ── "Ideal para" builder ─────────────────────────────────────────
  function buildIdealPara(beach, rendered) {
    const items = [];
    const reg = (beach.region || '').toLowerCase();
    const hasFac = Array.isArray(beach.facilities);
    const Ti = T.idealPara;

    if (beach.is_surf_spot)
      items.push({ label: Ti.surfers.label, sub: Ti.surfers.sub, color:'#0a3d6b', bg:'rgba(10,61,107,0.10)',
        icon:'<path d="M2 20L8 8l4 6 4-8 6 14"/><path d="M2 20q4-3 8 0 4 3 8 0"/>' });
    if (hasFac && beach.facilities.includes('lifeguard'))
      items.push({ label: Ti.families.label, sub: Ti.families.sub, color:'#1e8449', bg:'rgba(39,174,96,0.10)',
        icon:'<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>' });
    if (beach.water_quality === 'Excelente' || beach.water_quality === 'Boa') {
      const wqLbl = rendered ? rendered.waterQualityLabel : (T.waterQuality[beach.water_quality] || escapeHtml(beach.water_quality));
      items.push({ label: Ti.swimming.label, sub: Ti.swimming.sub + ' ' + wqLbl, color:'#1a5fa3', bg:'rgba(41,128,212,0.10)',
        icon:'<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>' });
    }
    if (hasFac && beach.facilities.includes('restaurant'))
      items.push({ label: Ti.gastronomy.label, sub: Ti.gastronomy.sub, color:'#8a6b10', bg:'rgba(201,168,76,0.12)',
        icon:'<path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>' });
    items.push({ label: Ti.walks.label, sub: Ti.walks.sub, color:'#5a5a7a', bg:'rgba(90,90,122,0.08)',
      icon:'<circle cx="12" cy="5" r="2"/><path d="M12 7v8m-4 4h8M8 10l-2 5m12-5l2 5"/>' });
    if (!beach.is_surf_spot)
      items.push({ label: Ti.fishing.label, sub: Ti.fishing.sub, color:'#1e5c4a', bg:'rgba(30,92,74,0.10)',
        icon:'<path d="M18 4l-6 6-6-6m6 6v8"/><circle cx="12" cy="8" r="1"/><path d="M4 19c0-2.5 3.5-4 8-4s8 1.5 8 4"/>' });
    if (reg.includes('alentejo') || reg.includes('vicentina'))
      items.push({ label: Ti.wildNature.label, sub: Ti.wildNature.sub, color:'#1e8449', bg:'rgba(39,174,96,0.10)',
        icon:'<path d="M12 22V12M12 12C12 7 7 4 2 6M12 12C12 7 17 4 22 6"/><path d="M7 17c1.7-1.5 3.5-2.5 5-2.5s3.3 1 5 2.5"/>' });
    if (reg.includes('madeira') || reg.includes('açores') || reg.includes('acores'))
      items.push({ label: Ti.photo.label, sub: Ti.photo.sub, color:'#8a6b10', bg:'rgba(201,168,76,0.12)',
        icon:'<rect x="3" y="8" width="18" height="14" rx="2"/><path d="M16 8V5a1 1 0 00-1-1H9a1 1 0 00-1 1v3"/><circle cx="12" cy="15" r="3"/>' });
    return items.slice(0,6).map(item => `
      <div class="ideal-para-card">
        <div class="ideal-para-icon" style="background:${item.bg}">
          <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="stroke:${item.color}">${item.icon}</svg>
        </div>
        <div>
          <div class="ideal-para-label">${item.label}</div>
          <div class="ideal-para-sub">${item.sub}</div>
        </div>
      </div>`).join('');
  }

  // ── "Explorar nesta zona" builder ────────────────────────────────
  function buildExplorarZona(beach) {
    const bp   = encodeURIComponent(beach.name   || '');
    const rp   = encodeURIComponent(beach.region || '');
    const type = (beach.beach_type || '').toLowerCase();
    const pfx  = lang === 'en' ? '/en/' : '';

    const REGION_HUB = lang === 'en' ? {
      'Algarve':          '/en/algarve-beaches.html',
      'Norte':            '/en/northern-portugal-beaches.html',
      'Centro':           '/en/central-portugal-beaches.html',
      'Madeira':          '/en/madeira-beaches.html',
      'Alentejo':         '/en/alentejo-coast-beaches.html',
      'Lisboa e Setúbal': '/en/beaches-near-lisbon.html',
    } : {
      'Algarve':          'praias-algarve.html',
      'Norte':            'praias-norte-portugal.html',
      'Centro':           'praias-centro-portugal.html',
      'Madeira':          'praias-madeira.html',
      'Alentejo':         'praias-alentejo-costa.html',
      'Lisboa e Setúbal': 'praias-perto-lisboa.html',
    };
    const regionHref = REGION_HUB[beach.region] || (pfx + 'beaches.html?region=' + rp);

    const Tez = T.exploreZona;
    const regionDef = (Tez.regions && (Tez.regions[beach.region] || Tez.regions.default)) || { label: 'Beaches', title: 'Explore', desc: '', cta: 'View' };

    const ALL = {
      surf:    { label: Tez.surf.label,    title: Tez.surf.title,    desc: Tez.surf.desc,
                 href: `${pfx}surf.html?region=${rp}&source=beach&beach=${bp}`,
                 bg:'linear-gradient(135deg,#0a3d6b,#1a5fa3)',
                 icon:'<path d="M2 20L8 8l4 6 4-8 6 14"/><path d="M2 20q4-3 8 0 4 3 8 0"/>',
                 cta: Tez.surf.cta },
      planner: { label: Tez.planner.label, title: Tez.planner.title, desc: Tez.planner.desc,
                 href: `${pfx}planear.html?source=beach&beach=${bp}&region=${rp}&intent=planear`,
                 bg:'linear-gradient(135deg,#8a6d00,#c9a84c)',
                 icon:'<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
                 cta: Tez.planner.cta },
      fishing: { label: Tez.fishing.label, title: Tez.fishing.title, desc: Tez.fishing.desc,
                 href: `${pfx}pesca.html?region=${rp}&source=beach&beach=${bp}`,
                 bg:'linear-gradient(135deg,#1e5c4a,#2d8b6f)',
                 icon:'<path d="M18 4l-6 6-6-6m6 6v8"/><circle cx="12" cy="8" r="1"/><path d="M4 19c0-2.5 3.5-4 8-4s8 1.5 8 4"/>',
                 cta: Tez.fishing.cta },
      webcams: { label: Tez.webcams.label, title: Tez.webcams.title, desc: Tez.webcams.desc,
                 href: `${pfx}webcams.html?region=${rp}&source=beach&beach=${bp}`,
                 bg:'linear-gradient(135deg,#3d1e6b,#6b40a3)',
                 icon:'<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/><circle cx="12" cy="14" r="3"/>',
                 cta: Tez.webcams.cta },
      region:  { ...regionDef, href: regionHref, bg:'linear-gradient(135deg,#1a4a2e,#2d7a4f)', icon:'<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>' },
    };

    const isSurf        = !!(beach.is_surf_spot || type === 'surf');
    const isFishingCtx  = type === 'river-mouth';
    const isNature      = type === 'wild' || type === 'natural-reserve' || type === 'cove';

    let zones;
    if (isSurf)            zones = [ALL.surf,    ALL.webcams, ALL.region];
    else if (isFishingCtx) zones = [ALL.planner, ALL.fishing, ALL.webcams];
    else if (isNature)     zones = [ALL.planner, ALL.region,  ALL.webcams];
    else                   zones = [ALL.planner, ALL.webcams, ALL.region];

    return zones.map(z => `
      <a class="explore-zona-card" href="${z.href}">
        <div class="explore-zona-card-icon" style="background:${z.bg}" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${z.icon}</svg>
        </div>
        <div class="explore-zona-card-label">${z.label}</div>
        <div class="explore-zona-card-title">${z.title}</div>
        <div class="explore-zona-card-desc">${z.desc}</div>
        <div class="explore-zona-card-cta">
          ${z.cta}
          <svg viewBox="0 0 24 24" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </div>
      </a>`).join('');
  }

  // ── "Planear Final Band" builder ─────────────────────────────────
  function buildPlanearFinalBand(beach) {
    const pfx = lang === 'en' ? '/en/' : '';
    const bp = encodeURIComponent(beach.name      || '');
    const tp = encodeURIComponent(beach.town      || '');
    const sp = encodeURIComponent(beach.subregion || '');
    const rp = encodeURIComponent(beach.region    || '');

    const BOOKING_URLS = lang === 'en' ? {
      'Algarve':          'https://www.booking.com/region/pt/algarve.en-gb.html',
      'Norte':            'https://www.booking.com/region/pt/norte.en-gb.html',
      'Centro':           'https://www.booking.com/region/pt/centro.en-gb.html',
      'Lisboa e Setúbal': 'https://www.booking.com/city/pt/lisbon.en-gb.html',
      'Alentejo':         'https://www.booking.com/region/pt/alentejo.en-gb.html',
      'Madeira':          'https://www.booking.com/region/pt/madeira.en-gb.html',
      'Açores':           'https://www.booking.com/region/pt/azores.en-gb.html',
    } : {
      'Algarve':          'https://www.booking.com/region/pt/algarve.pt-pt.html',
      'Norte':            'https://www.booking.com/region/pt/norte.pt-pt.html',
      'Centro':           'https://www.booking.com/region/pt/centro.pt-pt.html',
      'Lisboa e Setúbal': 'https://www.booking.com/city/pt/lisbon.pt-pt.html',
      'Alentejo':         'https://www.booking.com/region/pt/alentejo.pt-pt.html',
      'Madeira':          'https://www.booking.com/region/pt/madeira.pt-pt.html',
      'Açores':           'https://www.booking.com/region/pt/azores.pt-pt.html',
    };

    const STAY_PAGES = lang === 'en' ? {
      'Algarve':          '/en/where-to-stay-algarve-beach.html',
      'Lisboa e Setúbal': '/en/where-to-stay-lisbon-beaches.html',
      'Norte':            '/en/where-to-stay-northern-portugal-beaches.html',
      'Alentejo':         '/en/where-to-stay-alentejo-coast.html',
      'Madeira':          '/en/where-to-stay-madeira-near-the-beach.html',
      'Centro':           '/en/where-to-stay-central-portugal-beaches.html',
      'Oeste':            '/en/where-to-stay-west-coast-portugal.html',
    } : {
      'Algarve':          'onde-ficar-algarve-praia.html',
      'Lisboa e Setúbal': 'onde-ficar-lisboa-setubal-praia.html',
      'Norte':            'onde-ficar-norte-portugal-praia.html',
      'Alentejo':         'onde-ficar-costa-alentejo-praia.html',
      'Madeira':          'onde-ficar-madeira-perto-da-praia.html',
      'Centro':           'onde-ficar-centro-portugal-praia.html',
      'Oeste':            'onde-ficar-oeste-praia.html',
    };

    const GYG_URLS = lang === 'en' ? {
      'Algarve':          'https://www.getyourguide.com/s/?q=Algarve&partner_id=0WTBHZE&cmp=pthcard-algarve',
      'Norte':            'https://www.getyourguide.com/s/?q=Porto&partner_id=0WTBHZE&cmp=pthcard-norte',
      'Centro':           'https://www.getyourguide.com/s/?q=Coimbra+Portugal&partner_id=0WTBHZE&cmp=pthcard-centro',
      'Lisboa e Setúbal': 'https://www.getyourguide.com/s/?q=Lisbon&partner_id=0WTBHZE&cmp=pthcard-lisboa',
      'Alentejo':         'https://www.getyourguide.com/s/?q=Alentejo&partner_id=0WTBHZE&cmp=pthcard-alentejo',
      'Madeira':          'https://www.getyourguide.com/s/?q=Madeira&partner_id=0WTBHZE&cmp=pthcard-madeira',
      'Oeste':            'https://www.getyourguide.com/s/?q=Nazare+Portugal&partner_id=0WTBHZE&cmp=pthcard-oeste',
      'Açores':           'https://www.getyourguide.com/s/?q=Azores&partner_id=0WTBHZE&cmp=pthcard-acores',
    } : {
      'Algarve':          'https://www.getyourguide.com/s/?q=Algarve&partner_id=0WTBHZE&cmp=pthcard-algarve',
      'Norte':            'https://www.getyourguide.com/s/?q=Porto&partner_id=0WTBHZE&cmp=pthcard-norte',
      'Centro':           'https://www.getyourguide.com/s/?q=Coimbra+Portugal&partner_id=0WTBHZE&cmp=pthcard-centro',
      'Lisboa e Setúbal': 'https://www.getyourguide.com/s/?q=Lisbon&partner_id=0WTBHZE&cmp=pthcard-lisboa',
      'Alentejo':         'https://www.getyourguide.com/s/?q=Alentejo&partner_id=0WTBHZE&cmp=pthcard-alentejo',
      'Madeira':          'https://www.getyourguide.com/s/?q=Madeira&partner_id=0WTBHZE&cmp=pthcard-madeira',
      'Oeste':            'https://www.getyourguide.com/s/?q=Nazare+Portugal&partner_id=0WTBHZE&cmp=pthcard-oeste',
      'Açores':           'https://www.getyourguide.com/s/?q=Azores&partner_id=0WTBHZE&cmp=pthcard-acores',
    };
    const gygDefault  = 'https://www.getyourguide.com/s/?q=Portugal&partner_id=0WTBHZE&cmp=pthcard-default';
    const gygHref     = GYG_URLS[beach.region] || gygDefault;
    const gygLabel    = lang === 'en' ? 'View experiences' : 'Ver experiências';

    const Tpf = T.planearFinal;
    const planearHref = `${pfx}planear.html?source=beach&beach=${bp}&region=${rp}&intent=planear`;
    const bookingDefault = lang === 'en' ? 'https://www.booking.com/country/pt.en-gb.html' : 'https://www.booking.com/country/pt.pt-pt.html';
    const bookingHref = BOOKING_URLS[beach.region] || bookingDefault;
    const beachesHref = `${pfx}beaches.html?region=${rp}`;
    const stayPage    = STAY_PAGES[beach.region];
    const stayLabel   = stayPage ? (Tpf.stayLabels[beach.region] || Tpf.stayLabels.default) : Tpf.stayLabels.default;
    const stayHref    = stayPage ? `${stayPage}?source=beach&beach=${bp}&town=${tp}&sub=${sp}` : bookingHref;
    const stayTarget  = stayPage ? '' : ' target="_blank" rel="noopener noreferrer"';

    const surfHref = `${pfx}surf.html?region=${rp}&source=beach&beach=${bp}`;
    const loginHref = `${pfx}login.html#register`;
    const surfOrSave = beach.is_surf_spot
      ? `<a href="${surfHref}" class="planear-final-secondary">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 20L8 8l4 6 4-8 6 14"/><path d="M2 20q4-3 8 0 4 3 8 0"/></svg>
            ${Tpf.surfForecast}
          </a>`
      : `<a href="${loginHref}" class="planear-final-secondary">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
            ${Tpf.saveBeach}
          </a>`;

    const titleText = Tpf.titleTemplate(escapeHtml(beach.name));
    const titleHtml = titleText.replace('\n', '<br>');
    const descText  = Tpf.descTemplate(escapeHtml(beach.name), escapeHtml(beach.region || 'Portugal'));

    return `
      <div class="planear-final-band-inner">
        <div class="planear-final-eyebrow">${Tpf.eyebrow}</div>
        <h2 class="planear-final-title">${titleHtml}</h2>
        <p class="planear-final-desc">${descText}</p>
        <div class="planear-final-actions">
          <a href="${planearHref}" class="planear-final-primary" onclick="track('beach_detail_cta_click',{page:'beach',source:'planear_band',beach:'${beach.name.replace(/'/g,'\\x27')}',region:'${(beach.region||'').replace(/'/g,'\\x27')}'})">
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            ${Tpf.createPlan}
          </a>
          <a href="${stayHref}"${stayTarget} class="planear-final-secondary">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            ${stayLabel}
          </a>
          <a href="${gygHref}" target="_blank" rel="sponsored noopener" class="planear-final-secondary" onclick="track('beach_detail_cta_click',{page:'beach',source:'gyg_band',beach:'${beach.name.replace(/'/g,'\\x27')}',region:'${(beach.region||'').replace(/'/g,'\\x27')}'})">
            <svg viewBox="0 0 24 24" aria-hidden="true" stroke="currentColor" fill="none" stroke-width="1.8"><path d="M2 9a2 2 0 0 1 0-4h20a2 2 0 0 1 0 4M2 9v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9M12 9v13"/></svg>
            ${gygLabel}
          </a>
          <a href="${beachesHref}" class="planear-final-secondary">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            ${Tpf.regionBeaches}
          </a>
          ${surfOrSave}
        </div>
        <p class="planear-final-trust">${Tpf.trust}</p>
      </div>`;
  }

  // ── Partner / Services data ──────────────────────────────────────
  const REGION_PARTNERS = {
    'Algarve': [
      { type:'surf',       id:'alg-surf-01',  name:'Sagres Surf School',   cat:'Escola de Surf',      zone:'Sagres, Algarve',         prop:'Aulas para todos os níveis. Aluguer de pranchas e material.',           badge:'destaque',  cta:'Ver Perfil',           href:'partner-demo.html' },
      { type:'pesca',      id:'alg-pesca-01', name:'Mar & Anzol Charters', cat:'Pesca Desportiva',    zone:'Portimão, Algarve',        prop:'Saídas de pesca de altura e fundo. Barco próprio, 4–8 pax.',            badge:'verificado', cta:'Ver Disponibilidade',  href:'planear.html' },
      { type:'alojamento', id:'alg-aloj-01',  name:'Quinta do Pinhal',     cat:'Alojamento Rural',    zone:'Lagos, Algarve',           prop:'Casa rural a 5 min da praia. Pequeno-almoço incluído.',                 badge:'destaque',  cta:'Ver Disponibilidade',  href:'planear.html' },
      { type:'experiencia',id:'alg-exp-01',   name:'Algarve Sea Tours',    cat:'Passeios de Barco',   zone:'Albufeira, Algarve',       prop:'Grutas, golfinhos e costa algarvia. Saídas diárias.',                  badge:'novo',      cta:'Saber Mais',           href:'parceiros.html' }
    ],
    'Lisboa': [
      { type:'surf',       id:'lis-surf-01',  name:'Cascais Surf Camp',    cat:'Escola de Surf',      zone:'Cascais, Lisboa',          prop:'Formação certificada, aluguer e transporte para a praia.',              badge:'destaque',  cta:'Saber Mais',           href:'parceiros.html' },
      { type:'pesca',      id:'lis-pesca-01', name:'Sado Fishing Tours',   cat:'Pesca Desportiva',    zone:'Setúbal, Lisboa',          prop:'Pesca no estuário do Sado e costa atlântica. Guia incluído.',           badge:'verificado', cta:'Ver Disponibilidade',  href:'planear.html' },
      { type:'alojamento', id:'lis-aloj-01',  name:'Casa da Arrábida',     cat:'Turismo de Habitação',zone:'Arrábida, Lisboa',         prop:'Vista mar, natureza preservada, tranquilidade total.',                  badge:'destaque',  cta:'Ver Disponibilidade',  href:'planear.html' },
      { type:'restaurante',id:'lis-rest-01',  name:'Taberna do Pescador',  cat:'Restaurante',         zone:'Sesimbra, Lisboa',         prop:'Peixe fresco do dia, marisco vivo e vista para o mar.',                 badge:'verificado', cta:'Ver Carta',            href:'parceiros.html' }
    ],
    'Porto': [
      { type:'surf',       id:'prt-surf-01',  name:'Norte Surf Academy',   cat:'Escola de Surf',      zone:'Matosinhos, Porto',        prop:'Surf, bodyboard e SUP. Equipamento incluído nas aulas.',               badge:'destaque',  cta:'Saber Mais',           href:'parceiros.html' },
      { type:'pesca',      id:'prt-pesca-01', name:'Costa Verde Pesca',    cat:'Pesca Desportiva',    zone:'Póvoa de Varzim, Porto',   prop:'Saídas ao largo e pesca costeira. Toda a semana.',                      badge:'verificado', cta:'Ver Disponibilidade',  href:'planear.html' },
      { type:'alojamento', id:'prt-aloj-01',  name:'Surf House Matosinhos',cat:'Alojamento Surf',     zone:'Matosinhos, Porto',        prop:'Hostel e quartos privados, a 200m da praia. Wi-Fi, cozinha.',           badge:'novo',      cta:'Ver Disponibilidade',  href:'planear.html' },
      { type:'restaurante',id:'prt-rest-01',  name:'Marisqueira do Cais',  cat:'Restaurante',         zone:'Matosinhos, Porto',        prop:'Marisco ao peso, peixe grelhado e ambiente portuário.',                 badge:'verificado', cta:'Ver Carta',            href:'parceiros.html' }
    ],
    'Alentejo': [
      { type:'surf',       id:'ale-surf-01',  name:'Vicentina Surf',       cat:'Escola de Surf',      zone:'Vila Nova de Milfontes, Alentejo', prop:'Surf na Costa Vicentina, ambiente natural único. Max. 6 alunos.',badge:'destaque',  cta:'Ver Perfil',           href:'partner-demo.html' },
      { type:'pesca',      id:'ale-pesca-01', name:'Rio e Mar Aventura',   cat:'Pesca e Natureza',    zone:'Comporta, Alentejo',       prop:'Pesca no estuário e atividades de natureza. Guia local.',               badge:'verificado', cta:'Ver Disponibilidade',  href:'planear.html' },
      { type:'alojamento', id:'ale-aloj-01',  name:'Herdade do Sudoeste',  cat:'Turismo Rural',       zone:'Alentejo litoral',         prop:'Monte alentejano a 3 km da praia, piscina e natureza.',                 badge:'destaque',  cta:'Ver Disponibilidade',  href:'planear.html' },
      { type:'experiencia',id:'ale-exp-01',   name:'Rota Vicentina Tours', cat:'Caminhadas',           zone:'Costa Vicentina, Alentejo',prop:'Percursos guiados na Rota Vicentina. Grupos pequenos.',                 badge:'novo',      cta:'Saber Mais',           href:'parceiros.html' }
    ],
    'Madeira': [
      { type:'surf',       id:'mad-surf-01',  name:'Madeira Surf Point',   cat:'Escola de Surf',      zone:'Paul do Mar, Madeira',     prop:'As melhores ondas da Madeira com instrutores certificados.',            badge:'destaque',  cta:'Saber Mais',           href:'parceiros.html' },
      { type:'pesca',      id:'mad-pesca-01', name:'Pesca Fundo Madeira',  cat:'Pesca Desportiva',    zone:'Funchal, Madeira',         prop:'Pesca de fundo e alto mar, atum e espada. Barco 6 pax.',               badge:'verificado', cta:'Ver Disponibilidade',  href:'planear.html' },
      { type:'alojamento', id:'mad-aloj-01',  name:'Quinta do Atlântico',  cat:'Quinta com Vista Mar', zone:'Câmara de Lobos, Madeira', prop:'Alojamento típico madeirense com varanda sobre o oceano.',             badge:'destaque',  cta:'Ver Disponibilidade',  href:'planear.html' },
      { type:'experiencia',id:'mad-exp-01',   name:'Cetáceos Madeira',     cat:'Avistamento Cetáceos',zone:'Funchal, Madeira',         prop:'Golfinhos e baleias nas águas da Madeira. Saídas diárias.',             badge:'verificado', cta:'Saber Mais',           href:'parceiros.html' }
    ],
    'Açores': [
      { type:'surf',       id:'aco-surf-01',  name:'Azores Surf Club',     cat:'Escola de Surf',      zone:'São Miguel, Açores',       prop:'Surf em ondas oceânicas em ambiente vulcânico único.',                  badge:'destaque',  cta:'Saber Mais',           href:'parceiros.html' },
      { type:'pesca',      id:'aco-pesca-01', name:'Açores Deep Sea',      cat:'Pesca Desportiva',    zone:'Horta, Faial, Açores',     prop:'Big game fishing: marlim, atum e espada. Barco equipado.',             badge:'verificado', cta:'Ver Disponibilidade',  href:'planear.html' },
      { type:'alojamento', id:'aco-aloj-01',  name:'Casa das Furnas',      cat:'Turismo de Habitação',zone:'Furnas, São Miguel, Açores',prop:'Casa açoriana junto às caldeiras, natureza vulcânica.',               badge:'destaque',  cta:'Ver Disponibilidade',  href:'planear.html' },
      { type:'experiencia',id:'aco-exp-01',   name:'Açores Whale Watch',   cat:'Avistamento Cetáceos',zone:'Pico, Açores',             prop:'Um dos melhores locais do mundo para ver baleias.',                     badge:'novo',      cta:'Saber Mais',           href:'parceiros.html' }
    ]
  };

  const DEFAULT_PARTNERS = [
    { type:'surf',       id:'def-surf-01',  name:'Escola de Surf Local',  cat:'Escola de Surf',  zone:'Região', prop:'Aulas e aluguer de equipamento surf e bodyboard.',                          badge:'verificado', cta:'Saber Mais',          href:'parceiros.html' },
    { type:'pesca',      id:'def-pesca-01', name:'Charter de Pesca',      cat:'Pesca Desportiva',zone:'Região', prop:'Saídas de pesca costeira com guia experiente.',                             badge:'verificado', cta:'Ver Disponibilidade', href:'planear.html' },
    { type:'alojamento', id:'def-aloj-01',  name:'Alojamento Local',      cat:'Turismo Local',   zone:'Região', prop:'Opções de alojamento próximas da praia com boa relação qualidade/preço.',   badge:'verificado', cta:'Ver Disponibilidade', href:'planear.html' },
    { type:'experiencia',id:'def-exp-01',   name:'Atividades na Natureza', cat:'Ecoturismo',     zone:'Região', prop:'Passeios pedestres, canoagem e atividades na natureza.',                    badge:'novo',      cta:'Saber Mais',          href:'parceiros.html' }
  ];

  const PARTNER_ICONS = {
    surf:        { bg:'linear-gradient(135deg,#0a3d6b,#1a5fa3)', path:'<path d="M2 20 L8 8 L12 14 L16 6 L22 20"/><path d="M2 20 Q6 17 10 20 Q14 23 18 20 Q20 18 22 20"/>' },
    pesca:       { bg:'linear-gradient(135deg,#1e5c4a,#2d8b6f)', path:'<path d="M18 4l-6 6m0 0l-6-6m6 6v8"/><circle cx="12" cy="8" r="1"/><path d="M4 19c0-2.5 3.5-4 8-4s8 1.5 8 4"/>' },
    alojamento:  { bg:'linear-gradient(135deg,#5c3d1e,#8b6040)', path:'<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>' },
    restaurante: { bg:'linear-gradient(135deg,#6b1a0a,#a33021)', path:'<path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>' },
    experiencia: { bg:'linear-gradient(135deg,#3d1e6b,#6b40a3)', path:'<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>' }
  };

  function buildPartners(beach) {
    const pfx = lang === 'en' ? '/en/' : '';
    const partners = REGION_PARTNERS[beach.region] || DEFAULT_PARTNERS;
    const region = beach.region || 'Portugal';
    const beachParam  = encodeURIComponent(beach.name   || '');
    const regionParam = encodeURIComponent(beach.region || '');
    const Tp = T.partners;

    const cards = partners.map(p => {
      const icon = PARTNER_ICONS[p.type] || PARTNER_ICONS['experiencia'];
      const badgeLabel = p.badge === 'destaque' ? Tp.badges.destaque : p.badge === 'verificado' ? Tp.badges.verificado : Tp.badges.novo;
      let ctaHref, ctaType;
      if (p.href.includes('partner-demo')) {
        ctaHref = `/partner-demo.html?source=beach&beach=${beachParam}&region=${regionParam}&tipo=${encodeURIComponent(p.type)}&parceiro=${encodeURIComponent(p.name)}`;
        ctaType = 'partner-demo';
      } else if (p.href.includes('planear')) {
        ctaHref = `${pfx}planear.html?source=beach&beach=${beachParam}&region=${regionParam}&tipo=${encodeURIComponent(p.type)}&parceiro=${encodeURIComponent(p.name)}&intent=planear`;
        ctaType = 'planear';
      } else {
        ctaHref = `${pfx}parceiros.html?source=beach&beach=${beachParam}&region=${regionParam}&tipo=${encodeURIComponent(p.type)}&intent=parceiro`;
        ctaType = 'partner-profile';
      }
      return `
        <div class="partner-card" data-partner-type="${p.type}" data-partner-id="${p.id}" data-partner-region="${(beach.region||'').toLowerCase().replace(/\s+/g,'-')}">
          <div class="partner-card-header">
            <div class="partner-card-icon" style="background:${icon.bg}" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${icon.path}</svg>
            </div>
            <span class="partner-badge partner-badge--${p.badge}">${badgeLabel}</span>
          </div>
          <div class="partner-card-body">
            <div class="partner-card-cat">${p.cat}</div>
            <div class="partner-card-name">${p.name}</div>
            <div class="partner-card-zone">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              ${p.zone}
            </div>
            <div class="partner-card-prop">${p.prop}</div>
          </div>
          <div class="partner-card-footer">
            <a class="partner-card-cta" href="${ctaHref}" data-cta-type="${ctaType}">
              ${p.cta}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </a>
          </div>
        </div>`;
    }).join('');

    const b2bHref = `${pfx}contact.html?assunto=parceiro&source=beach&beach=${beachParam}&region=${regionParam}&intent=b2b-inbound`;
    const partnersAllHref = `${pfx}parceiros.html`;

    return `
      <div class="partners-header">
        <div>
          <div class="partners-eyebrow">${Tp.eyebrow}</div>
          <h2 class="partners-section-title" id="partners-title">${Tp.title}</h2>
          <p style="font-size:0.82rem;color:var(--text-light);margin-top:4px;">${Tp.noteTemplate(region)}</p>
        </div>
        <a class="partners-see-all" href="${partnersAllHref}">
          ${Tp.viewAll}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </a>
      </div>
      <div class="partners-grid">${cards}</div>
      <div class="partners-foot">
        <div class="partners-foot-text">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
          <span>${Tp.b2bNote}</span>
        </div>
        <a class="partners-foot-cta" href="${b2bHref}" data-cta-type="b2b-inbound">
          ${Tp.b2bCta}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </a>
      </div>`;
  }

  // ── Local Recommendations ────────────────────────────────────────
  function buildLocalRecs(beach) {
    const regionRecs = T.localRecs.regions;
    const recs = regionRecs[beach.region] || regionRecs.default;
    const groups = [
      { id: 'food',    label: T.localRecs.groups.food,    iconCls: 'acc-icon--food',    iconPath: '<path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>' },
      { id: 'explore', label: T.localRecs.groups.explore, iconCls: 'acc-icon--explore', iconPath: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>' },
      { id: 'tips',    label: T.localRecs.groups.tips,    iconCls: 'acc-icon--tips',    iconPath: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>' }
    ];
    const chevron = `<svg class="acc-chevron" viewBox="0 0 24 24" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>`;
    return groups.map((g, i) => `
      <div class="acc-item${i === 0 ? ' open' : ''}" id="acc-${g.id}">
        <button class="acc-header" onclick="toggleAcc('acc-${g.id}')" aria-expanded="${i === 0}" aria-controls="acc-body-${g.id}">
          <span class="acc-header-left">
            <span class="acc-icon ${g.iconCls}" aria-hidden="true"><svg viewBox="0 0 24 24">${g.iconPath}</svg></span>
            <span class="acc-title">${g.label}</span>
          </span>
          ${chevron}
        </button>
        <div class="acc-body" id="acc-body-${g.id}" role="region">
          <ul class="acc-list">${(recs[g.id] || []).map(item => `<li>${item}</li>`).join('')}</ul>
        </div>
      </div>`).join('');
  }

  window.toggleAcc = function toggleAcc(id) {
    const item = document.getElementById(id);
    if (!item) return;
    const isOpen = item.classList.contains('open');
    item.classList.toggle('open', !isOpen);
    item.querySelector('.acc-header').setAttribute('aria-expanded', String(!isOpen));
  };

  // ── Mar & Ondulação — dados reais Open-Meteo Marine ─────────────
  async function loadWaves(beach) {
    const sec  = document.getElementById('surf-section');
    const cont = document.getElementById('surf-content');
    if (!sec || !cont) return;

    // fallback estático para surf spots (caso API falhe)
    function renderFallback() {
      if (!beach.is_surf_spot) return;
      const reg = (beach.region || '').toLowerCase();
      let level = T.surf.levels.all, season = T.surf.levels.sprAutumn;
      if (reg.includes('norte') || reg.includes('porto'))         { level = T.surf.levels.intAdv; season = T.surf.levels.autWinter; }
      else if (reg.includes('centro') || reg.includes('oeste'))   { level = T.surf.levels.int;    season = T.surf.levels.autSpring; }
      else if (reg.includes('algarve'))                           { level = T.surf.levels.begInt; season = T.surf.levels.sprSummer; }
      else if (reg.includes('alentejo'))                          { level = T.surf.levels.intAdv; season = T.surf.levels.autWinter; }
      else if (reg.includes('lisboa'))                            { level = T.surf.levels.int;    season = T.surf.levels.yearRound; }
      let orientText = '—';
      if (beach.orientation != null) {
        const dirs = lang === 'en'
          ? ['N','NE','E','SE','S','SW','W','NW']
          : ['N','NE','E','SE','S','SO','O','NO'];
        orientText = dirs[Math.round(beach.orientation / 45) % 8];
      }
      cont.innerHTML = `
        <div class="surf-card">
          <div class="surf-meta">
            <div class="surf-meta-item"><div class="surf-meta-label">${T.surf.level}</div><div class="surf-meta-value">${level}</div></div>
            <div class="surf-meta-item"><div class="surf-meta-label">${T.surf.bestSeason}</div><div class="surf-meta-value">${season}</div></div>
            <div class="surf-meta-item"><div class="surf-meta-label">${T.surf.orientation}</div><div class="surf-meta-value">${orientText}</div></div>
            <div class="surf-meta-item"><div class="surf-meta-label">${T.surf.type}</div><div class="surf-meta-value">${T.surf.atlanticType}</div></div>
          </div>
          <div class="surf-footer">
            <p class="surf-note">${T.surf.fallbackNote}</p>
          </div>
        </div>`;
      sec.style.display = 'block';
    }

    if (!beach.latitude || !beach.longitude) { renderFallback(); return; }

    try {
      const marineUrl = new URL('https://marine-api.open-meteo.com/v1/marine');
      marineUrl.searchParams.set('latitude',      String(beach.latitude));
      marineUrl.searchParams.set('longitude',     String(beach.longitude));
      marineUrl.searchParams.set('current',        'wave_height,wave_direction,wave_period,swell_wave_height');
      marineUrl.searchParams.set('hourly',        'wave_height,wave_direction,wave_period,swell_wave_height');
      marineUrl.searchParams.set('forecast_days', '10');
      marineUrl.searchParams.set('timezone',      'Europe/Lisbon');
      marineUrl.searchParams.set('cell_selection','sea');

      const weatherUrl = new URL('https://api.open-meteo.com/v1/forecast');
      weatherUrl.searchParams.set('latitude',      String(beach.latitude));
      weatherUrl.searchParams.set('longitude',     String(beach.longitude));
      weatherUrl.searchParams.set('current',       'wind_speed_10m,wind_direction_10m,wind_gusts_10m');
      weatherUrl.searchParams.set('hourly',        'wind_speed_10m,wind_direction_10m,wind_gusts_10m');
      weatherUrl.searchParams.set('forecast_days', '10');
      weatherUrl.searchParams.set('timezone',      'Europe/Lisbon');

      const [marineResult, weatherResult] = await Promise.allSettled([
        fetch(marineUrl.toString()).then(r => { if (!r.ok) throw new Error('marine http ' + r.status); return r.json(); }),
        fetch(weatherUrl.toString()).then(r => { if (!r.ok) throw new Error('weather http ' + r.status); return r.json(); })
      ]);

      const json = marineResult.status === 'fulfilled' ? marineResult.value : null;
      const weatherJson = weatherResult.status === 'fulfilled' ? weatherResult.value : null;

      if (!json) throw new Error('marine api failed');
      const h = json.hourly;
      if (!h?.time?.length) throw new Error('no data');

      // índice da hora actual
      const nowPrefix = new Date().toISOString().slice(0, 13);
      let idx = h.time.findIndex(t => t.slice(0, 13) === nowPrefix);
      if (idx < 0) idx = 0;

      const cur    = json.current ?? {};
      const wCur   = weatherJson?.current ?? {};
      const wH     = weatherJson?.hourly ?? {};
      const waveH  = cur.wave_height       ?? h.wave_height?.[idx]       ?? null;
      const waveP  = cur.wave_period       ?? h.wave_period?.[idx]       ?? null;
      const waveD  = cur.wave_direction    ?? h.wave_direction?.[idx]    ?? null;
      const swellH = cur.swell_wave_height ?? h.swell_wave_height?.[idx] ?? null;
      const windSpeed = wCur.wind_speed_10m    ?? wH.wind_speed_10m?.[idx]    ?? null;
      const windDir   = wCur.wind_direction_10m ?? wH.wind_direction_10m?.[idx] ?? null;
      const windGusts = wCur.wind_gusts_10m    ?? wH.wind_gusts_10m?.[idx]    ?? null;

      function degCompass(d) {
        const c = lang === 'en'
          ? ['N','NE','E','SE','S','SW','W','NW']
          : ['N','NE','E','SE','S','SO','O','NO'];
        return c[Math.round(d / 45) % 8] ?? '—';
      }
      function waveClass(m) {
        if (m == null) return '';
        return m < 0.5 ? 'wave-calm' : m < 1.5 ? 'wave-small' : m < 2.5 ? 'wave-medium' : 'wave-large';
      }

      // próximas 6 horas — ondas
      const strip = [];
      for (let j = 0; j < 6; j++) {
        const k = idx + j;
        if (h.time[k] && h.wave_height[k] != null) strip.push({ t: h.time[k].slice(11, 16), h: h.wave_height[k] });
      }

      // próximas 6 horas — vento
      const windStrip = [];
      if (wH.time) {
        const wIdx = wH.time.findIndex(t => t.slice(0, 13) === nowPrefix);
        const wi = wIdx >= 0 ? wIdx : 0;
        for (let j = 0; j < 6; j++) {
          const k = wi + j;
          if (wH.time[k] && wH.wind_speed_10m?.[k] != null) windStrip.push({ t: wH.time[k].slice(11, 16), s: wH.wind_speed_10m[k] });
        }
      }

      function waveCondition(wh) {
        if (wh == null) return null;
        if (wh < 0.5) return T.surf.waveConditions.calm;
        if (wh < 1.5) return T.surf.waveConditions.gentle;
        if (wh < 2.5) return T.surf.waveConditions.moderate;
        return T.surf.waveConditions.rough;
      }
      function waveLabel(m) {
        if (m == null) return { text: '—', cls: '' };
        if (m < 0.5)  return T.surf.waveLabels.calm;
        if (m < 1.5)  return T.surf.waveLabels.small;
        if (m < 2.5)  return T.surf.waveLabels.medium;
        return         T.surf.waveLabels.large;
      }

      // ── Previsão 10 dias ──
      function _avg(arr) { return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null; }
      function calcScore(wA, wsA, wgA) {
        let s = 5;
        if (wA  != null) { if (wA >= 0.5 && wA < 1.5) s += 2; else if (wA >= 2.5) s -= 2; }
        if (wsA != null) { if (wsA < 15) s += 2; else if (wsA > 30) s -= 2; }
        if (wgA != null && wgA > 40) s -= 1;
        return Math.max(1, Math.min(10, s));
      }
      function scoreInfo(s) {
        if (s >= 8) return T.surf.scoreLabels.great;
        if (s >= 6) return T.surf.scoreLabels.good;
        if (s >= 4) return T.surf.scoreLabels.mod;
        return       T.surf.scoreLabels.poor;
      }
      const DAYS   = T.surf.days;
      const MONTHS = T.surf.months;

      const byDay = {};
      for (let i = 0; i < h.time.length; i++) {
        const date = h.time[i].slice(0, 10);
        if (!byDay[date]) byDay[date] = { waveH: [], windS: [], windG: [] };
        if (h.wave_height[i] != null) byDay[date].waveH.push(h.wave_height[i]);
      }
      if (wH.time) {
        for (let i = 0; i < wH.time.length; i++) {
          const date = wH.time[i].slice(0, 10);
          if (!byDay[date]) byDay[date] = { waveH: [], windS: [], windG: [] };
          if (wH.wind_speed_10m?.[i] != null) byDay[date].windS.push(wH.wind_speed_10m[i]);
          if (wH.wind_gusts_10m?.[i]  != null) byDay[date].windG.push(wH.wind_gusts_10m[i]);
        }
      }
      function buildForecastRow(date, d) {
        const wA  = _avg(d.waveH);
        const wsA = _avg(d.windS);
        const wgA = _avg(d.windG);
        const score = calcScore(wA, wsA, wgA);
        const si  = scoreInfo(score);
        const dt  = new Date(date + 'T12:00:00');
        const dayLabel = DAYS[dt.getDay()] + ' ' + dt.getDate() + ' ' + MONTHS[dt.getMonth()];
        return '<div class="surf-forecast-row">'
          + '<div class="surf-forecast-day">' + dayLabel + '</div>'
          + '<div class="surf-forecast-metrics">'
          + '<span class="surf-forecast-metric">🌊 ' + (wA  != null ? wA.toFixed(1)  + ' m'    : '—') + '</span>'
          + '<span class="surf-forecast-metric">💨 ' + (wsA != null ? Math.round(wsA) + ' km/h' : '—') + '</span>'
          + '</div>'
          + '<span class="surf-score-badge ' + si.cls + '">' + score + ' · ' + si.label + '</span>'
          + '</div>';
      }
      const allDays = Object.entries(byDay);
      const forecastRows = allDays.map(([date, d]) => buildForecastRow(date, d)).join('');

      // ── Plan check ──
      let isPro = false;
      let planUser = null;
      try {
        const { data: { user: authUser } } = await db.auth.getUser();
        planUser = authUser ?? null;
        const plan = planUser?.app_metadata?.plan ?? planUser?.user_metadata?.plan ?? '';
        isPro = plan === 'pro' || plan === 'admin';
      } catch (_) {}

      const pfx = lang === 'en' ? '/en/' : '';

      function buildForecastSection(rows) {
        return '<div class="surf-forecast">'
          + '<h3 class="surf-forecast-title">' + T.surf.forecast10d + '</h3>'
          + '<div class="surf-forecast-card">'
          + rows
          + '<div class="surf-forecast-note">' + T.surf.scoreNote + ' · <a href="https://open-meteo.com" target="_blank" rel="noopener noreferrer" style="color:inherit">Open-Meteo</a></div>'
          + '</div>'
          + '</div>';
      }

      let forecastHtml = '';
      if (forecastRows.length) {
        if (isPro) {
          forecastHtml = buildForecastSection(forecastRows);
        } else {
          const visibleRows  = allDays.slice(0, 3).map(([date, d]) => buildForecastRow(date, d)).join('');
          const ghostRows    = allDays.slice(3, 6).map(([date, d]) => buildForecastRow(date, d)).join('');
          const paywallInner = visibleRows
            + '<div class="surf-paywall-wrap">'
            +   '<div class="surf-paywall-ghost">' + ghostRows + '</div>'
            +   '<div class="surf-paywall-overlay">'
            +     '<div class="surf-paywall-icon">🔒</div>'
            +     '<div class="surf-paywall-text">' + T.surf.paywallText + '</div>'
            +     '<a href="' + pfx + 'precos.html" class="surf-paywall-btn">' + T.surf.paywallBtn + '</a>'
            +   '</div>'
            + '</div>';
          forecastHtml = buildForecastSection(paywallInner);
        }
      }

      const wb = waveLabel(waveH);
      cont.innerHTML = `
        <div class="surf-card">
          <div class="surf-hero">
            <div class="surf-hero-left">
              <div class="surf-hero-label">${T.surf.wavesNow}</div>
              <div class="surf-hero-value ${waveClass(waveH)}">${waveH != null ? waveH.toFixed(1) + ' m' : '—'}</div>
            </div>
            ${waveH != null ? `<span class="surf-hero-badge ${wb.cls}">${wb.text}</span>` : ''}
          </div>
          <div class="surf-meta">
            <div class="surf-meta-item">
              <div class="surf-meta-label">${T.surf.period}</div>
              <div class="surf-meta-value">${waveP != null ? Math.round(waveP) + ' s' : '—'}</div>
            </div>
            <div class="surf-meta-item">
              <div class="surf-meta-label">${T.surf.waveDir}</div>
              <div class="surf-meta-value">${waveD != null ? degCompass(waveD) : '—'}</div>
            </div>
            <div class="surf-meta-item">
              <div class="surf-meta-label">${T.surf.swell}</div>
              <div class="surf-meta-value">${swellH != null ? swellH.toFixed(1) + ' m' : '—'}</div>
            </div>
          </div>
          <div class="surf-meta">
            <div class="surf-meta-item">
              <div class="surf-meta-label">${T.surf.wind}</div>
              <div class="surf-meta-value">${windSpeed != null ? Math.round(windSpeed) + ' km/h' : '—'}</div>
            </div>
            <div class="surf-meta-item">
              <div class="surf-meta-label">${T.surf.windDir}</div>
              <div class="surf-meta-value">${windDir != null ? degCompass(windDir) : '—'}</div>
            </div>
            <div class="surf-meta-item">
              <div class="surf-meta-label">${T.surf.gusts}</div>
              <div class="surf-meta-value">${windGusts != null ? Math.round(windGusts) + ' km/h' : '—'}</div>
            </div>
          </div>
          ${strip.length ? `<div class="surf-strip-label">${T.surf.wavesNext6h}</div><div class="surf-strip">${strip.map(x => {
            const sc = waveClass(x.h);
            return `<div class="surf-strip-item"><span class="surf-strip-time">${x.t}</span><span class="surf-strip-h ${sc}">${x.h.toFixed(1)}m</span></div>`;
          }).join('')}</div>` : ''}
          ${windStrip.length ? `<div class="surf-strip-label">${T.surf.windNext6h}</div><div class="surf-strip" style="border-bottom:none">${windStrip.map(x => {
            return `<div class="surf-strip-item"><span class="surf-strip-time">${x.t}</span><span class="surf-strip-h" style="color:var(--text-mid)">${Math.round(x.s)} km/h</span></div>`;
          }).join('')}</div>` : ''}
          <div class="surf-footer">
            <div class="surf-footer-left">
              ${waveCondition(waveH) ? `<div class="surf-condition">${waveCondition(waveH)}</div>` : ''}
              <div class="surf-source">${T.surf.realtimeSrc} · <a href="https://open-meteo.com" target="_blank" rel="noopener noreferrer" style="color:inherit">Open-Meteo</a></div>
            </div>
            <div class="surf-now">${T.surf.now}</div>
          </div>
        </div>
        <div id="beach-alerts-section"></div>
        ${forecastHtml}`;

      sec.style.display = 'block';
      setupAlertSection(beach, isPro, planUser);

    } catch (_) {
      renderFallback();
    }
  }

  // ── Astronomical Tide Calculator ─────────────────────────────────
  // Based on simplified harmonic constituents for European Atlantic coast
  // Accuracy: ~30 minutes | No API key required | No rate limits
  function calcAstronomicalTides(lat, lon, daysAhead = 2) {
    const now = Date.now();
    const MS_HOUR = 3600000;
    const results = [];

    const M2_PERIOD = 12.4206012 * MS_HOUR;
    const S2_PERIOD = 12.0 * MS_HOUR;
    const K1_PERIOD = 23.9344697 * MS_HOUR;

    const latFactor = Math.max(0.5, Math.min(1.5, (lat - 35) / 10));
    const M2_AMP = 1.2 * latFactor;
    const S2_AMP = 0.4 * latFactor;
    const K1_AMP = 0.1;

    const lonPhase = (lon + 8.5) * (Math.PI / 180) * 2;

    function tidalHeight(t) {
      const M2 = M2_AMP * Math.cos((2 * Math.PI * t / M2_PERIOD) + lonPhase);
      const S2 = S2_AMP * Math.cos((2 * Math.PI * t / S2_PERIOD) + lonPhase * 0.9);
      const K1 = K1_AMP * Math.cos((2 * Math.PI * t / K1_PERIOD));
      return M2 + S2 + K1;
    }

    const INTERVAL = 10 * 60 * 1000;
    const END = now + (daysAhead * 24 * MS_HOUR);

    let prevH = tidalHeight(now - INTERVAL);
    let prevDir = 0;

    for (let t = now; t <= END; t += INTERVAL) {
      const h = tidalHeight(t);
      const dir = h > prevH ? 1 : -1;

      if (prevDir !== 0 && dir !== prevDir) {
        const extremumT = t - INTERVAL / 2;
        const extremumH = tidalHeight(extremumT);
        const isHigh = prevDir === 1;
        results.push({
          time:   new Date(extremumT).toISOString(),
          height: (extremumH + 2.5).toFixed(2),
          type:   isHigh ? 'high' : 'low',
          label:  isHigh ? T.tides.high : T.tides.low
        });
      }

      prevH = h;
      prevDir = dir;
    }

    return results;
  }

  // ── Tides ────────────────────────────────────────────────────────
  async function loadTides(lat, lon) {
    try {
      if (!lat || !lon) return;

      const events = calcAstronomicalTides(parseFloat(lat), parseFloat(lon), 10);
      const upcoming = events
        .filter(e => new Date(e.time) >= new Date())
        .slice(0, 6);

      if (upcoming.length === 0) return;

      const byDate = {};
      upcoming.forEach((e, i) => {
        const date = e.time.slice(0, 10);
        if (!byDate[date]) byDate[date] = [];
        byDate[date].push({ ...e, _i: i });
      });

      const daysHtml = Object.entries(byDate).map(([date, tides]) => {
        const label = new Date(date + 'T12:00:00').toLocaleDateString(T.tides.locale, { weekday: 'long', day: '2-digit', month: 'long' });
        const rowsHtml = tides.map(t => {
          const isNext = t._i === 0;
          const timeStr = new Date(t.time).toLocaleTimeString(T.tides.locale, { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Lisbon' });
          return `<div class="tides-row${isNext ? ' is-next' : ''}">
            <div class="tides-row-icon tide-${t.type}">${t.type === 'high' ? '↑' : '↓'}</div>
            <div class="tides-row-main">
              <span class="tides-row-label tide-${t.type}">${escapeHtml(t.label)}</span>
              ${isNext ? `<span class="tides-next-badge">${T.tides.next}</span>` : ''}
            </div>
            <div class="tides-row-time">${timeStr}</div>
            <div class="tides-row-height">${t.height}<span class="tides-height-unit">m</span></div>
          </div>`;
        }).join('');
        return `<div class="tides-day"><div class="tides-day-label">${label}</div>${rowsHtml}</div>`;
      }).join('');

      const wrap = document.getElementById('tides-content');
      wrap.innerHTML = `<div class="tides-card">${daysHtml}</div>`;
      document.getElementById('tides-section').style.display = 'block';
    } catch(err) {
      console.warn('Tide calc error:', err);
    }
  }

  // ── Related Beaches ──────────────────────────────────────────────
  async function loadRelatedBeaches(beach) {
    if (!beach.region) return;
    try {
      const { data: related } = await db.from('beaches')
        .select('id, name, region, water_quality, town')
        .eq('region', beach.region)
        .eq('is_active', true)
        .neq('id', beach.id)
        .limit(12);
      if (!related || related.length === 0) return;
      const grid = document.getElementById('related-grid');
      const sec  = document.getElementById('related-section');
      if (!grid || !sec) return;
      const ranked = related.map(b => {
        let score = 0;
        if (beach.subregion && b.subregion && b.subregion === beach.subregion)       score += 100;
        if (beach.town && b.town && b.town === beach.town)                           score += 10;
        if (beach.is_surf_spot != null && b.is_surf_spot === beach.is_surf_spot)     score += 2;
        if (beach.beach_type && b.beach_type && b.beach_type === beach.beach_type)   score += 1;
        if (beach.water_quality && b.water_quality === beach.water_quality)          score += 1;
        return { ...b, _score: score };
      }).sort((a, b) => b._score - a._score).slice(0, 6);

      const beachHref = lang === 'en' ? '/en/beach.html?id=' : 'beach.html?id=';
      grid.innerHTML = ranked.map(b => {
        const parts = [];
        if (b.town)          parts.push(escapeHtml(b.town));
        if (b.water_quality) parts.push(T.related.waterPrefix + ' ' + (T.waterQuality[b.water_quality] || escapeHtml(b.water_quality)));
        const tag = parts.join(' · ') || escapeHtml(b.region || 'Portugal');
        return `<a href="${beachHref}${b.id}" class="related-card">
          <span class="related-card-tag">${tag}</span>
          <span class="related-card-name">${escapeHtml(b.name)}</span>
          <span class="related-card-meta">${escapeHtml(b.region || 'Portugal')}</span>
          <span class="related-card-cta">${T.related.viewCard} <svg viewBox="0 0 24 24" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></span>
        </a>`;
      }).join('');
      sec.style.display = 'block';
    } catch(_) {}
  }

  // ── Main load ────────────────────────────────────────────────────
  (async () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    console.log('[beach] id from URL:', id);

    if (!id) {
      document.getElementById('page-robots').content = 'noindex, follow';
      document.getElementById('page-loader').style.display = 'none';
      document.getElementById('page-error').style.display = 'block';
      return;
    }

    try {
      const { data: beach, error } = await db.from('beaches')
        .select('id, name, region, description, i18n, image_url, image_storage_url, image_source, image_photographer, image_source_url, image_license, water_quality, facilities, latitude, longitude, is_active, town')
        .eq('id', id)
        .single();

      console.log('[beach] supabase data:', beach, '| error:', error);

      if (error || !beach) throw new Error('not found');

      // Get i18n-aware rendered data
      const rendered = window.BeachRenderer.renderBeach(beach);

      // Update title and canonical/og/tw tags
      const title = `${beach.name} — ${beach.region || 'Portugal'} · Portugal Travel Hub`;
      document.getElementById('page-title').textContent = title;
      document.title = title;
      document.getElementById('page-og-title').content  = title;
      document.getElementById('page-tw-title').content  = title;

      // Canonical URL
      let canonicalUrl;
      if (lang === 'en') {
        canonicalUrl = `https://portalturismoportugal.com/en/beach.html?id=${id}`;
      } else {
        const beachSlug = (beach.name || '').toLowerCase()
          .normalize('NFD').replace(/[̀-ͯ]/g, '')
          .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        canonicalUrl = beachSlug
          ? `https://portalturismoportugal.com/praias/${beachSlug}`
          : `https://portalturismoportugal.com/beach.html?id=${id}`;
      }
      document.getElementById('page-canonical').href    = canonicalUrl;
      document.getElementById('page-og-url').content    = canonicalUrl;
      document.getElementById('page-tw-url').content    = canonicalUrl;
      if (beach.image_url) {
        document.getElementById('page-og-image').content = beach.image_url;
        document.getElementById('page-tw-image').content = beach.image_url;
      }

      // Update meta description via BeachRenderer (handles i18n + fallback)
      window.BeachRenderer.updateMetaTags(beach, T);

      // Structured data
      window.BeachRenderer.buildJsonLd(beach, T);

      // Hero image
      const heroImg = document.getElementById('hero-img');
      heroImg.onerror = () => { heroImg.onerror = null; heroImg.src = '/beach-placeholder.svg'; };
      const heroImgSrc = beach.image_storage_url || beach.image_url;
      if (heroImgSrc) {
        heroImg.src = heroImgSrc;
        heroImg.alt = T.heroAlt.withName(beach.name, beach.region);
      } else {
        heroImg.src = '/beach-placeholder.svg';
        heroImg.alt = T.heroAlt.generic;
      }
      document.getElementById('hero-name').textContent = beach.name;

      // Hero image attribution
      const attrEl = document.getElementById('hero-attribution');
      if (attrEl) {
        const caption = captionHtml(beach);
        if (caption) {
          attrEl.innerHTML = caption;
          attrEl.style.display = '';
        }
      }

      // Populate favorite button data attrs
      const favBtn = document.querySelector('[data-favorite-btn]');
      if (favBtn) {
        favBtn.dataset.beachId = id;
        favBtn.dataset.beachName = beach.name || '';
        favBtn.dataset.beachRegion = beach.region || '';
      }

      // Hero region label
      if (beach.region) {
        document.getElementById('hero-region-text').textContent = `Portugal · ${beach.region}`;
        document.getElementById('hero-region').style.display = 'flex';
      }

      // Badges
      const badges = [];
      if (beach.region)        badges.push(`<span class="badge badge-region">${escapeHtml(beach.region)}</span>`);
      if (beach.water_quality) badges.push(`<span class="badge badge-q-${beach.water_quality.replace(/[^a-zA-Z]/g,'')}">${T.waterBadgePrefix} ${rendered.waterQualityLabel}</span>`);
      document.getElementById('hero-badges').innerHTML = badges.join('');

      // Breadcrumb
      const bc = document.getElementById('breadcrumb');
      document.getElementById('breadcrumb-name').textContent = beach.name;
      bc.style.display = 'flex';

      // Facilities
      document.getElementById('facilities-strip').innerHTML = window.BeachRenderer.buildFacilitiesHtml(beach.facilities, T);

      // Description — use rendered data from BeachRenderer
      const descEl = document.getElementById('beach-desc-text');
      if (rendered.fallbackUsed) {
        descEl.innerHTML = rendered.description;
      } else {
        descEl.textContent = rendered.description;
      }
      document.getElementById('desc-section').style.display = 'block';

      // Map / Como Chegar
      if (beach.latitude && beach.longitude) {
        document.getElementById('map-coords').textContent = `${beach.latitude.toFixed(5)}, ${beach.longitude.toFixed(5)}`;
        document.getElementById('map-link').href = `https://www.google.com/maps?q=${beach.latitude},${beach.longitude}`;
      } else {
        document.getElementById('map-card').style.display = 'none';
        const fbSearch = document.getElementById('map-fallback-search');
        const mapSearchTerm = lang === 'en'
          ? (beach.name || '') + ' beach Portugal'
          : (beach.name || '') + ' praia Portugal';
        if (fbSearch) fbSearch.href = `https://www.google.com/maps/search/${encodeURIComponent(mapSearchTerm)}`;
        document.getElementById('map-fallback').style.display = 'block';
      }
      document.getElementById('map-section').style.display = 'block';

      // Vibe / Carácter
      const vibeTags = window.BeachRenderer.buildVibesHtml(beach, T);
      if (vibeTags) {
        document.getElementById('vibe-tags').innerHTML = vibeTags;
        document.getElementById('vibe-section').style.display = 'block';
      }

      // Highlights
      const hlGrid = document.getElementById('highlights-grid');
      const hlSec  = document.getElementById('highlights-section');
      if (hlGrid && hlSec) {
        hlGrid.innerHTML = buildHighlights(beach);
        hlSec.style.display = 'block';
      }

      // Mar & Ondulação — async, não bloqueia render
      loadWaves(beach);

      // "Ideal para" section
      const idealGrid = document.getElementById('ideal-para-grid');
      const idealSec  = document.getElementById('ideal-para-section');
      if (idealGrid && idealSec) {
        const idealHtml = buildIdealPara(beach, rendered);
        if (idealHtml) { idealGrid.innerHTML = idealHtml; idealSec.style.display = 'block'; }
      }

      // Recomendações Locais
      document.getElementById('local-recs-accordion').innerHTML = buildLocalRecs(beach);

      // Related beaches — async, non-blocking
      loadRelatedBeaches(beach);

      // "Explorar nesta zona" — vertical routing
      const explorarGrid = document.getElementById('explore-zona-grid');
      if (explorarGrid) explorarGrid.innerHTML = buildExplorarZona(beach);

      // Parceiros e Serviços — oculto até dados reais estarem disponíveis
      // const partnersEl = document.getElementById('partners-section');
      // if (partnersEl) { partnersEl.innerHTML = buildPartners(beach); partnersEl.style.display = 'block'; }

      // Planear final band
      const planearFinalEl = document.getElementById('planear-final-band');
      if (planearFinalEl) planearFinalEl.innerHTML = buildPlanearFinalBand(beach);

      // Confirm indexing on successful load
      const robotsMeta = document.getElementById('page-robots');
      if (robotsMeta) robotsMeta.content = 'index, follow';

      // Show detail, hide loader
      document.getElementById('page-loader').style.display = 'none';
      document.getElementById('beach-detail').style.display = 'block';

      // Reveal animation on beach sections
      const revealObs = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); } });
      }, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });
      document.querySelectorAll('.beach-desc-section,.ideal-para-section,.highlights-section,.vibe-section,.surf-section,.tides-section,.map-section,.local-recs-section,.explore-zona-section,.partners-section,.planear-final-band').forEach(el => {
        if (el.style.display !== 'none') { el.classList.add('reveal-sec'); revealObs.observe(el); }
      });

      // Load tides async
      loadTides(beach.latitude, beach.longitude);

    } catch(e) {
      console.error('[beach.html] load error:', e);
      document.getElementById('page-robots').content = 'noindex, follow';
      document.getElementById('page-loader').style.display = 'none';
      document.getElementById('page-error').style.display = 'block';
    }
  })();

  // ── Mobile bottom nav actions ────────────────────────────────────
  document.getElementById('mob-map-btn')?.addEventListener('click', () => {
    const mapSec = document.getElementById('map-section');
    const target = (mapSec && mapSec.style.display !== 'none') ? mapSec : document.getElementById('tides-section');
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  document.getElementById('mob-menu-btn')?.addEventListener('click', (e) => { e.stopPropagation(); document.getElementById('nav-toggle').click(); });

  // ── Beach Alerts ─────────────────────────────────────────────────────────────
  (function() {
    const Ta = T.alerts;

    // Build condition options from T.alerts.conditions
    const conditionOptions = Object.entries(Ta.conditions)
      .map(([val, label]) => `<option value="${val}">${label}</option>`)
      .join('');

    const modalHtml = `
      <div class="alert-overlay" id="alert-overlay" role="dialog" aria-modal="true" aria-labelledby="alert-modal-title">
        <div class="alert-modal">
          <div class="alert-modal-title" id="alert-modal-title">${Ta.modalTitle}</div>
          <div class="alert-field">
            <label for="alert-condition">${Ta.conditionLabel}</label>
            <select id="alert-condition">
              ${conditionOptions}
            </select>
          </div>
          <div class="alert-field">
            <label for="alert-threshold">${Ta.valueLabel}</label>
            <div class="alert-value-row">
              <input type="number" id="alert-threshold" min="0" step="0.1" placeholder="ex: 1.5">
              <span class="alert-unit" id="alert-unit">m</span>
            </div>
          </div>
          <div class="alert-actions">
            <button class="alert-save-btn" id="alert-save-btn">${Ta.saveBtnLabel}</button>
            <button class="alert-cancel-btn" id="alert-cancel-btn">${Ta.cancelBtnLabel}</button>
          </div>
        </div>
      </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    const overlay   = document.getElementById('alert-overlay');
    const condSel   = document.getElementById('alert-condition');
    const threshIn  = document.getElementById('alert-threshold');
    const unitSpan  = document.getElementById('alert-unit');
    const saveBtn   = document.getElementById('alert-save-btn');
    const cancelBtn = document.getElementById('alert-cancel-btn');

    const UNITS = { wave_height: 'm', wind_speed: 'km/h', temperature: '°C' };
    const PLACEHOLDERS = { wave_height: 'ex: 1.5', wind_speed: 'ex: 20', temperature: 'ex: 22' };

    function updateUnit() {
      const metric = condSel.value.split('|')[0];
      unitSpan.textContent = UNITS[metric] || '';
      threshIn.placeholder = PLACEHOLDERS[metric] || '';
    }
    condSel.addEventListener('change', updateUnit);

    function openModal() { overlay.classList.add('open'); threshIn.focus(); }
    function closeModal() { overlay.classList.remove('open'); threshIn.value = ''; condSel.selectedIndex = 0; updateUnit(); }

    cancelBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal(); });

    // State
    let _beach = null;
    let _userId = null;

    function alertLabel(a) {
      const key = a.condition + '|' + a.operator;
      const lbl = Ta.conditions[key] || (a.condition + ' ' + a.operator);
      return '🔔 ' + lbl + ' ' + a.threshold + ' ' + (UNITS[a.condition] || '');
    }

    function renderAlertsList(alerts) {
      const wrap = document.getElementById('beach-alerts-section');
      if (!wrap) return;
      const list = wrap.querySelector('.alerts-list');
      if (!list) return;
      if (!alerts || !alerts.length) { list.innerHTML = ''; return; }
      list.innerHTML = alerts.map(a =>
        `<div class="alert-item" data-id="${a.id}">
          <span>${alertLabel(a)}</span>
          <button class="alert-item-del" data-id="${a.id}" title="${Ta.deleteLabel}" aria-label="${Ta.deleteLabel}">✕</button>
        </div>`
      ).join('');
      list.querySelectorAll('.alert-item-del').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.dataset.id;
          await db.from('alerts').delete().eq('id', id).eq('user_id', _userId);
          btn.closest('.alert-item').remove();
        });
      });
    }

    async function loadAlerts() {
      if (!_userId || !_beach) return;
      const { data } = await db.from('alerts')
        .select('id, condition, operator, threshold')
        .eq('user_id', _userId)
        .eq('beach_id', _beach.id);
      renderAlertsList(data || []);
    }

    saveBtn.addEventListener('click', async () => {
      const val = parseFloat(threshIn.value);
      if (isNaN(val) || val < 0) { threshIn.focus(); return; }
      const [condition, operator] = condSel.value.split('|');
      const unit = UNITS[condition] || '';
      const { error } = await db.from('alerts').insert({
        user_id:    _userId,
        beach_id:   _beach.id,
        beach_name: _beach.name,
        condition,
        operator,
        threshold:  val,
        unit
      });
      if (!error) {
        closeModal();
        showAlertToast(Ta.savedToast);
        loadAlerts();
        _showAlertOnboardingBanner();
      }
    });

    function showAlertToast(msg) {
      let t = document.getElementById('alerts-toast');
      if (!t) {
        t = document.createElement('div');
        t.id = 'alerts-toast';
        t.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:var(--blue);color:#fff;padding:12px 22px;border-radius:10px;font-size:0.84rem;font-weight:600;z-index:3000;opacity:0;transition:opacity 0.25s ease;max-width:90vw;text-align:center;pointer-events:none;';
        document.body.appendChild(t);
      }
      t.textContent = msg;
      t.style.opacity = '1';
      clearTimeout(t._tid);
      t._tid = setTimeout(() => { t.style.opacity = '0'; }, 4000);
    }

    window.setupAlertSection = function(beach, isPro, planUser) {
      _beach  = beach;
      _userId = planUser?.id ?? null;

      const wrap = document.getElementById('beach-alerts-section');
      if (!wrap) return;

      const isLoggedIn = !!_userId;
      if (!isLoggedIn) { wrap.innerHTML = ''; return; }

      document.getElementById('alert-modal-title').textContent =
        Ta.modalTitleFor ? Ta.modalTitleFor(beach.name || '') : (Ta.modalTitle + ' — ' + (beach.name || ''));

      if (isPro) {
        wrap.innerHTML = `<div class="beach-alerts-wrap">
          <button class="alert-create-btn" id="alert-create-btn">🔔 ${Ta.createBtn}</button>
          <div class="alerts-list"></div>
        </div>`;
        document.getElementById('alert-create-btn').addEventListener('click', openModal);
      } else {
        wrap.innerHTML = `<div class="beach-alerts-wrap">
          <button class="alert-create-btn alert-create-btn-disabled" disabled aria-disabled="true">
            🔔 ${Ta.createBtn}
            <span class="alert-tooltip">${Ta.proTooltip}</span>
          </button>
        </div>`;
      }

      updateUnit();
      if (isPro) loadAlerts();
    };

    function _showAlertOnboardingBanner() {
      const KEY   = 'pth_alerts_onboarding_count';
      const count = parseInt(localStorage.getItem(KEY) || '0', 10);
      if (count >= 3) return;

      const wrap = document.getElementById('beach-alerts-section');
      if (!wrap) return;

      const existing = wrap.querySelector('.alert-onboarding-banner');
      if (existing) { existing.remove(); }

      const banner = document.createElement('div');
      banner.className = 'alert-onboarding-banner';
      // Ta.onboarding already has the correct lang link (/conta.html#alertas or /en/conta.html#alertas)
      banner.innerHTML = Ta.onboarding
        + '<button class="alert-onboarding-dismiss" aria-label="Fechar">✕</button>';
      wrap.appendChild(banner);

      banner.querySelector('.alert-onboarding-dismiss').addEventListener('click', () => {
        banner.remove();
      });

      localStorage.setItem(KEY, String(count + 1));
    }
  })();
});
