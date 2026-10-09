/**
 * js/parceiros.js — /parceiros e /en/parceiros (Lote F, 09/10/2026). Um só script para PT e EN (textos pelo html[lang]).
 *
 * 1) Pré-visualização (#biz-prev-form): o cartão de parceiro monta-se enquanto o dono escreve (só JS local, sem pedidos).
 *    Enviar -> submit-partner-lead com plano 'recomendacao', objetivo 'explorar', origem [en-]parceiros-previa.
 * 2) Planos: "Pedir este plano" e o quadro de zonas preenchem a candidatura e descem para #candidatura.
 * 3) Candidatura (#b2b-form, contrato de ids de C_tech §2.6).
 * Payload: SEMPRE exatamente as 11 colunas de partner_leads (negocio, tipo, objetivo, plano, contacto, email, localizacao,
 * regiao, website, instagram, mensagem); vazias = ''. Plano exato, zona e origem vão no início de `mensagem`.
 * Turnstile via PTHCapture.turnstile(el) (js/email-capture.js). Em erro: reset do Turnstile, botão volta, nova tentativa;
 * mensagem clara "não foi enviado" com email pré-preenchido para ola@portalturismoportugal.com.
 * URL: ?plano=base|local|local-mensal|fundador&zona=<id>&tipo=<tipo> pré-preenche a candidatura.
 */
(function () {
  'use strict';
  var EN = (document.documentElement.lang || '').toLowerCase().indexOf('en') === 0;
  var PFX = EN ? 'en-' : '';
  var MAIL = 'ola@portalturismoportugal.com';
  var KEYS = ['negocio', 'tipo', 'objetivo', 'plano', 'contacto', 'email', 'localizacao', 'regiao', 'website', 'instagram', 'mensagem'];

  var T = EN ? {
    tipo: { surf: 'Surf school', pesca: 'Fishing', experiencias: 'Tours and experiences', alojamento: 'Accommodation', restaurante: 'Restaurant or bar', retalho: 'Shop', outro: 'Local business' },
    phTipo: 'Type of business', phName: 'Your business', phTown: 'Your town',
    zoneTop: function (z) { return z; },
    fund: function (z) { return 'Zone Founder place in ' + z + ': available.'; },
    noName: 'Please add your business name.', noTipo: 'Please choose the type of business.', noContact: 'Please add your name.',
    badEmail: 'Please check your email address.',
    robot: 'The anti-bot check hasn’t finished yet. Wait a second and try again.',
    fail: 'Not sent. Your request has not reached us. Try again, or send it by email to ' + MAIL + ':',
    mailBtn: 'Send by email', busy: 'Sending…',
    okPrev: function (n, e) { return 'We’ll prepare a preview for ' + n + ' and send it to ' + e + '.'; },
    okApp: function (e) { return 'We’ll reply to ' + e + '.'; },
    chosen: 'Chosen plan: ', subj: 'Partner request', sentCard: 'Request sent'
  } : {
    tipo: { surf: 'Escola de surf', pesca: 'Pesca', experiencias: 'Passeios e experiências', alojamento: 'Alojamento', restaurante: 'Restaurante ou bar', retalho: 'Loja', outro: 'Negócio local' },
    phTipo: 'Tipo de negócio', phName: 'O seu negócio', phTown: 'A sua localidade',
    zoneTop: function (z) { return 'Zona ' + z; },
    fund: function (z) { return 'Lugar de Fundador da Zona em ' + z + ': livre.'; },
    noName: 'Falta o nome do negócio.', noTipo: 'Escolha o tipo de negócio.', noContact: 'Falta o seu nome.',
    badEmail: 'Confirme o email: falta algo.',
    robot: 'A verificação anti-robôs ainda não terminou. Espere um segundo e tente outra vez.',
    fail: 'Não foi enviado. O pedido não chegou até nós. Tente outra vez ou envie-o por email para ' + MAIL + ':',
    mailBtn: 'Enviar por email', busy: 'A enviar…',
    okPrev: function (n, e) { return 'Vamos preparar a pré-visualização de ' + n + ' e enviá-la para ' + e + '.'; },
    okApp: function (e) { return 'Respondemos para ' + e + '.'; },
    chosen: 'Plano escolhido: ', subj: 'Pedido de parceiro', sentCard: 'Pedido enviado'
  };

  // Zonas do Fundador (surf). Nome canónico PT vai para a mensagem (o Ricardo filtra por ele); EN só para o ecrã.
  var ZONES = {
    sagres:    { pt: 'Sagres e Costa Vicentina', en: 'Sagres and Costa Vicentina', reg: 'algarve', k: ['sagres', 'vila do bispo', 'aljezur', 'carrapateira', 'arrifana', 'odeceixe', 'zavial', 'salema', 'burgau', 'bordeira', 'amado', 'monte clerigo', 'beliche', 'tonel'] },
    lagos:     { pt: 'Lagos e Luz', en: 'Lagos and Luz', reg: 'algarve', k: ['lagos', 'luz', 'porto de mos', 'meia praia', 'odiaxere', 'dona ana', 'camilo'] },
    portimao:  { pt: 'Portimão e Alvor', en: 'Portimão and Alvor', reg: 'algarve', k: ['portimao', 'alvor', 'praia da rocha', 'rocha', 'ferragudo', 'carvoeiro', 'lagoa', 'tres irmaos', 'mexilhoeira'] },
    albufeira: { pt: 'Albufeira a Quarteira', en: 'Albufeira to Quarteira', reg: 'algarve', k: ['albufeira', 'armacao de pera', 'gale', 'olhos de agua', 'vilamoura', 'quarteira', 'falesia', 'guia', 'salgados', 'acoteias'] },
    alentejo:  { pt: 'Costa Alentejana', en: 'Alentejo coast', reg: 'alentejo', k: ['milfontes', 'zambujeira', 'odemira', 'porto covo', 'sines', 'comporta', 'almograve', 'melides', 'malhao', 'carvalhal', 'sao torpes'] },
    lisboa:    { pt: 'Lisboa, Cascais e Ericeira', en: 'Lisbon, Cascais and Ericeira', reg: 'cascais', k: ['lisboa', 'lisbon', 'cascais', 'estoril', 'ericeira', 'carcavelos', 'sintra', 'caparica', 'guincho', 'mafra', 'oeiras', 'parede', 'sao juliao', 'ribamar', 'praia grande', 'magoito'] },
    peniche:   { pt: 'Peniche e Nazaré', en: 'Peniche and Nazaré', reg: 'costa-prata', k: ['peniche', 'baleal', 'nazare', 'ferrel', 'obidos', 'foz do arelho', 'sao martinho', 'supertubos', 'consolacao', 'lourinha', 'santa cruz'] },
    porto:     { pt: 'Porto e Norte', en: 'Porto and North', reg: 'minho', k: ['porto', 'oporto', 'matosinhos', 'vila do conde', 'povoa', 'espinho', 'viana', 'esposende', 'moledo', 'leca', 'gaia', 'afife', 'caminha', 'ofir'] }
  };
  var REG_EXTRA = [
    ['algarve', ['faro', 'tavira', 'olhao', 'monte gordo', 'vila real de santo antonio', 'manta rota', 'cabanas', 'fuseta', 'loule', 'almancil', 'quinta do lago', 'vale do lobo', 'silves', 'algarve']],
    ['setubal', ['setubal', 'sesimbra', 'arrabida', 'troia', 'palmela']],
    ['costa-prata', ['figueira da foz', 'aveiro', 'costa nova', 'barra', 'leiria', 'sao pedro de moel', 'vieira', 'mira', 'buarcos', 'torres vedras', 'santa cruz']],
    ['acores', ['acores', 'azores', 'ponta delgada', 'sao miguel', 'terceira', 'faial', 'pico']],
    ['madeira', ['madeira', 'funchal', 'porto santo', 'machico', 'calheta']]
  ];
  var PLAN = {
    ajuda:          { v: 'recomendacao', tag: 'Ajude-me a escolher', o: 'candidatura' },
    base:           { v: 'base', tag: 'Base', o: 'plano-base' },
    'local-anual':  { v: 'partner', tag: 'Parceiro Local anual (149 €/ano)', o: 'plano-local' },
    'local-mensal': { v: 'partner', tag: 'Parceiro Local mensal (19 €/mês)', o: 'plano-local' },
    fundador:       { v: 'sponsored', tag: 'Fundador da Zona (290 €/ano)', o: 'plano-fundador' }
  };

  function $(id) { return document.getElementById(id); }
  function val(id) { var e = $(id); return e ? String(e.value || '').trim() : ''; }
  function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim(); }
  function hasWord(hay, k) { return (' ' + hay + ' ').indexOf(' ' + k + ' ') !== -1; }
  function zoneFor(town) {
    var n = norm(town); if (!n) return '';
    // a correspondência mais longa ganha ("praia da luz" -> Lagos e Luz; "vila do bispo" -> Sagres)
    var best = '', len = 0;
    if (hasWord(n, 'porto santo')) return ''; // Madeira, não é "Porto e Norte"
    Object.keys(ZONES).forEach(function (id) { ZONES[id].k.forEach(function (k) { if (k.length > len && hasWord(n, k)) { best = id; len = k.length; } }); });
    return best;
  }
  function regFor(town, zid) {
    if (zid && ZONES[zid]) return ZONES[zid].reg;
    var n = norm(town); if (!n) return '';
    for (var i = 0; i < REG_EXTRA.length; i++) for (var j = 0; j < REG_EXTRA[i][1].length; j++) if (hasWord(n, REG_EXTRA[i][1][j])) return REG_EXTRA[i][0];
    return '';
  }
  function zName(zid) { return zid && ZONES[zid] ? (EN ? ZONES[zid].en : ZONES[zid].pt) : ''; }
  function track(n, p) { try { if (typeof window.track === 'function') window.track(n, p || {}); else if (typeof window.gtag === 'function') window.gtag('event', n, p || {}); } catch (e) {} }
  function gtagEv(n, p) { if (typeof window.gtag === 'function') { try { window.gtag('event', n, p || {}); } catch (e) { console.warn('GA event failed:', e); } } }
  function endpoint() {
    var base = (typeof SUPABASE_URL !== 'undefined' && SUPABASE_URL) ? SUPABASE_URL + '/functions/v1/' : ((window.PTHCapture && window.PTHCapture.endpoint) || 'https://glupdjvdvunogkqgxoui.supabase.co/functions/v1/');
    return base + 'submit-partner-lead';
  }
  function apikey() { return (typeof SUPABASE_ANON_KEY !== 'undefined' && SUPABASE_ANON_KEY) ? SUPABASE_ANON_KEY : ((window.PTHCapture && window.PTHCapture.key) || 'sb_publishable_HKdE2IRmz9lMDcg4p3l1tw_HiTdD4nw'); }
  function okEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

  /** Junta as 11 chaves e só elas. `tags` = [['origem','…'],['plano','…'],['zona','…']] (as vazias saem). */
  function payload(fields, tags, text) {
    var out = {};
    KEYS.forEach(function (k) { out[k] = fields[k] == null ? '' : String(fields[k]); });
    var head = tags.filter(function (t) { return t[1]; }).map(function (t) { return '[' + t[0] + ': ' + t[1] + ']'; }).join(' ');
    out.mensagem = (head + (text ? ' ' + text : '')).trim();
    return out;
  }
  function mailtoHref(p) {
    var lines = KEYS.map(function (k) { return k + ': ' + p[k]; });
    return 'mailto:' + MAIL + '?subject=' + encodeURIComponent(T.subj + ': ' + (p.negocio || '')) + '&body=' + encodeURIComponent(lines.join('\n'));
  }

  /** Liga Turnstile + envio a um formulário. opts: {form, btn, err, ok, build(), validate(), onOk(p), name, origin()} */
  function wire(opts) {
    var form = opts.form, btn = opts.btn, err = opts.err;
    var tsEl = form.querySelector('[data-biz-ts]');
    var label = btn.innerHTML, ts = null, busy = false;
    function start() {
      if (ts || !tsEl || !window.PTHCapture) return;
      ts = window.PTHCapture.turnstile(tsEl);
      ts.catch(function () { ts = null; });
    }
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (en) { if (en.some(function (x) { return x.isIntersecting; })) { start(); io.disconnect(); } }, { rootMargin: '300px 0px' });
      io.observe(form);
    } else start();
    form.addEventListener('focusin', start);

    function clearErr() { err.hidden = true; err.innerHTML = ''; [].forEach.call(form.querySelectorAll('[aria-invalid]'), function (e) { e.removeAttribute('aria-invalid'); }); }
    function showErr(msg, p) {
      err.innerHTML = '';
      var m = document.createElement('p'); m.textContent = msg; err.appendChild(m);
      if (p) {
        var a = document.createElement('a'); a.className = 'biz-btn biz-btn--gold'; a.href = mailtoHref(p); a.textContent = T.mailBtn;
        a.addEventListener('click', function () { track('partner_mailto_fallback', { form: opts.name, lang: EN ? 'en' : 'pt' }); });
        err.appendChild(a);
      }
      err.hidden = false;
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (busy) return;
      clearErr();
      var bad = opts.validate();
      if (bad) {
        showErr(bad.msg);
        if (bad.el) { bad.el.setAttribute('aria-invalid', 'true'); try { bad.el.focus(); } catch (x) {} }
        track('form_error', { form: opts.name, reason: bad.reason, page: 'parceiros', lang: EN ? 'en' : 'pt' });
        return;
      }
      start();
      var p = opts.build();
      busy = true; btn.disabled = true; btn.textContent = T.busy;
      var handle = null;
      (ts || Promise.reject(new Error('no-ts'))).then(function (h) {
        handle = h;
        var tok = h.token();
        if (!tok) throw new Error('robot');
        return fetch(endpoint(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', apikey: apikey() },
          body: JSON.stringify(Object.assign({ turnstileToken: tok }, p))
        }).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r; });
      }).then(function () {
        form.hidden = true;
        opts.onOk(p);
      }).catch(function (e2) {
        var robot = e2 && e2.message === 'robot';
        if (robot) showErr(T.robot); else {
          // cópia só neste dispositivo; a mensagem diz claramente que NÃO foi enviado
          try { var arr = JSON.parse(localStorage.getItem('pth_partner_leads') || '[]'); arr.push(Object.assign({ sent: false, at: new Date().toISOString() }, p)); localStorage.setItem('pth_partner_leads', JSON.stringify(arr.slice(-10))); } catch (x) {}
          showErr(T.fail, p);
          console.error('partner_leads submit error:', e2);
        }
        if (handle) handle.reset();
        track('form_error', { form: opts.name, reason: robot ? 'turnstile' : 'network', page: 'parceiros', lang: EN ? 'en' : 'pt' });
        try { err.focus(); } catch (x) {}
      }).then(function () {
        busy = false;
        if (!form.hidden) { btn.disabled = false; btn.innerHTML = label; }
      });
    });
  }

  function init() {
    var y = $('footer-year'); if (y) y.textContent = new Date().getFullYear();

    // ── 1. Pré-visualização + cartão ao vivo ─────────────────────────
    var pf = $('biz-prev-form');
    var card = document.querySelector('[data-live]');
    if (pf && card) {
      var cName = card.querySelector('[data-live-name]'), cTipo = card.querySelector('[data-live-tipo]');
      var cTown = card.querySelector('[data-live-town]'), cZone = card.querySelector('[data-live-zone]');
      var cFund = document.querySelector('[data-live-fund]');
      var built = false, started = false;
      var set = function (el, text, ph) {
        var t = text || ph;
        if (el.textContent === t) return;
        el.textContent = t;
        el.setAttribute('data-placeholder', text ? '0' : '1');
        el.classList.remove('is-tick'); void el.offsetWidth; if (text) el.classList.add('is-tick');
      };
      var render = function () {
        var n = val('p-negocio'), tp = val('p-tipo'), town = val('p-local');
        var zid = zoneFor(town);
        set(cName, n, T.phName);
        set(cTipo, tp ? T.tipo[tp] : '', T.phTipo);
        set(cTown, town, T.phTown);
        card.setAttribute('data-empty', n ? '0' : '1');
        if (zid) { cZone.hidden = false; set(cZone, T.zoneTop(zName(zid)), ''); } else { cZone.hidden = true; cZone.textContent = ''; }
        if (cFund) { if (zid && tp === 'surf') { cFund.hidden = false; cFund.textContent = T.fund(zName(zid)); } else cFund.hidden = true; }
        if (!built && n && town) { built = true; track('partner_preview_card_built', { tipo: tp || '', zona: zid, lang: EN ? 'en' : 'pt' }); }
      };
      ['p-negocio', 'p-tipo', 'p-local'].forEach(function (id) { var e = $(id); if (e) { e.addEventListener('input', render); e.addEventListener('change', render); } });
      pf.addEventListener('focusin', function () { if (!started) { started = true; track('partner_preview_start', { lang: EN ? 'en' : 'pt' }); } });
      [].forEach.call(document.querySelectorAll('[data-set-tipo]'), function (b) {
        b.addEventListener('click', function () {
          var s = $('p-tipo'); if (s) { s.value = b.getAttribute('data-set-tipo'); render(); }
          [].forEach.call(document.querySelectorAll('[data-set-tipo]'), function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
          var nm = $('p-negocio'); if (nm) nm.focus();
        });
      });
      render();

      wire({
        form: pf, btn: $('p-submit'), err: $('biz-prev-err'), name: 'previa',
        validate: function () {
          if (!val('p-negocio')) return { msg: T.noName, el: $('p-negocio'), reason: 'negocio' };
          if (!val('p-tipo')) return { msg: T.noTipo, el: $('p-tipo'), reason: 'tipo' };
          if (!okEmail(val('p-email'))) return { msg: T.badEmail, el: $('p-email'), reason: 'email' };
          return null;
        },
        build: function () {
          var town = val('p-local'), zid = zoneFor(town);
          return payload({
            negocio: val('p-negocio'), tipo: val('p-tipo'), objetivo: 'explorar', plano: 'recomendacao', contacto: '',
            email: val('p-email'), localizacao: town, regiao: regFor(town, zid), website: '', instagram: ''
          }, [['origem', PFX + 'parceiros-previa'], ['plano', 'Pré-visualização grátis'], ['zona', zid ? ZONES[zid].pt : '']], '');
        },
        onOk: function (p) {
          var ok = $('biz-prev-ok');
          card.classList.add('is-sent');
          if (ok) { ok.querySelector('[data-ok-text]').textContent = T.okPrev(p.negocio, p.email); ok.hidden = false; try { ok.focus(); } catch (x) {} }
          track('partner_preview_submit', { tipo: p.tipo, regiao: p.regiao, lang: EN ? 'en' : 'pt' });
        }
      });
    }

    // ── 2. Candidatura ───────────────────────────────────────────────
    var form = $('b2b-form'), btn = $('b2b-submit');
    var origin = 'candidatura';
    var selPlano = $('f-plano'), selZona = $('f-zona');
    var zWrap = document.querySelector('[data-zona-wrap]');
    var chosen = document.querySelector('[data-chosen]');
    function planKey() { var o = selPlano && selPlano.options[selPlano.selectedIndex]; return (o && o.getAttribute('data-k')) || 'ajuda'; }
    function syncPlan() {
      var k = planKey();
      if (zWrap) zWrap.hidden = k !== 'fundador';
      if (chosen) {
        if (k === 'ajuda') { chosen.hidden = true; } else {
          var o = selPlano.options[selPlano.selectedIndex];
          var z = k === 'fundador' && selZona && selZona.value ? ', ' + zName(selZona.value) : '';
          chosen.textContent = T.chosen + o.textContent + z; chosen.hidden = false;
        }
      }
    }
    function choose(k, zid, from) {
      if (!form || !selPlano) return;
      for (var i = 0; i < selPlano.options.length; i++) if (selPlano.options[i].getAttribute('data-k') === k) { selPlano.selectedIndex = i; break; }
      if (selZona) selZona.value = zid || '';
      origin = PLAN[k] ? PLAN[k].o : 'candidatura';
      // o que a pessoa já escreveu na pré-visualização passa para a candidatura
      [['p-negocio', 'f-negocio'], ['p-tipo', 'f-tipo'], ['p-email', 'f-email'], ['p-local', 'f-localizacao']].forEach(function (m) {
        var a = $(m[0]), b = $(m[1]); if (a && b && a.value && !b.value) b.value = a.value;
      });
      var reg = $('f-regiao');
      if (reg && !reg.value) { var town = val('f-localizacao'); reg.value = regFor(town, zid || zoneFor(town)); }
      syncPlan();
      if (from !== 'url') {
        var sec = $('candidatura');
        if (sec) sec.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
        var first = $('f-negocio'); var target = first && first.value ? ($('f-contacto') && !$('f-contacto').value ? $('f-contacto') : first) : first;
        if (target) setTimeout(function () { try { target.focus({ preventScroll: true }); } catch (x) { target.focus(); } }, 350);
      }
    }
    // toggle anual/mensal (o preço troca por CSS :has; aqui só o plano que o botão pede)
    var billM = $('bill-m');
    [].forEach.call(document.querySelectorAll('[data-plan]'), function (b) {
      b.addEventListener('click', function () {
        var p = b.getAttribute('data-plan');
        var k = p === 'local' ? (billM && billM.checked ? 'local-mensal' : 'local-anual') : p;
        track('partner_plan_click', { plan: k, lang: EN ? 'en' : 'pt' });
        choose(k, '', 'btn');
      });
    });
    [].forEach.call(document.querySelectorAll('[data-zone]'), function (b) {
      b.addEventListener('click', function () {
        var z = b.getAttribute('data-zone');
        [].forEach.call(document.querySelectorAll('[data-zone]'), function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
        track('partner_plan_click', { plan: 'fundador', zona: z, lang: EN ? 'en' : 'pt' });
        choose('fundador', z, 'zone');
      });
    });
    if (selPlano) selPlano.addEventListener('change', syncPlan);
    if (selZona) selZona.addEventListener('change', syncPlan);

    if (form && btn) {
      // GA4: funil (eventos já existentes)
      var fNegocio = $('f-negocio');
      if (fNegocio) fNegocio.addEventListener('focus', function onIni() { fNegocio.removeEventListener('focus', onIni); gtagEv('partner_aplicacao_iniciada'); });

      var qs = new URLSearchParams(location.search);
      var qp = qs.get('plano'), qz = qs.get('zona'), qt = qs.get('tipo');
      var qmap = { base: 'base', local: 'local-anual', 'local-anual': 'local-anual', 'local-mensal': 'local-mensal', fundador: 'fundador' };
      if (qt && $('f-tipo') && [].some.call($('f-tipo').options, function (o) { return o.value === qt; })) $('f-tipo').value = qt;
      if (qp && qmap[qp]) choose(qmap[qp], ZONES[qz] ? qz : '', 'url');
      syncPlan();

      wire({
        form: form, btn: btn, err: $('b2b-pending'), name: 'candidatura',
        validate: function () {
          if (!val('f-negocio')) return { msg: T.noName, el: $('f-negocio'), reason: 'negocio' };
          if (!val('f-tipo')) return { msg: T.noTipo, el: $('f-tipo'), reason: 'tipo' };
          if (!val('f-contacto')) return { msg: T.noContact, el: $('f-contacto'), reason: 'contacto' };
          if (!okEmail(val('f-email'))) return { msg: T.badEmail, el: $('f-email'), reason: 'email' };
          return null;
        },
        build: function () {
          var k = planKey(), pl = PLAN[k] || PLAN.ajuda;
          var town = val('f-localizacao');
          var zid = k === 'fundador' ? (selZona ? selZona.value : '') : zoneFor(town);
          var reg = val('f-regiao') || regFor(town, zid);
          return payload({
            negocio: val('f-negocio'), tipo: val('f-tipo'), objetivo: val('f-objetivo') || 'explorar', plano: pl.v,
            contacto: val('f-contacto'), email: val('f-email'), localizacao: town, regiao: reg,
            website: val('f-website'), instagram: val('f-instagram')
          }, [['origem', PFX + 'parceiros-' + origin], ['plano', pl.tag], ['zona', zid && ZONES[zid] ? ZONES[zid].pt : '']], val('f-mensagem'));
        },
        onOk: function (p) {
          var ok = $('b2b-success');
          if (ok) { ok.querySelector('[data-ok-text]').textContent = T.okApp(p.email); ok.hidden = false; ok.classList.add('vis'); try { ok.focus(); } catch (x) {} }
          gtagEv('partner_aplicacao_submetida', { tipo: p.tipo, regiao: p.regiao, plano: p.plano });
          // Email de alerta ao Ricardo: trigger de BD trigger_partner_lead_created
          track('b2b_form_submit', { plano: p.plano, regiao: p.regiao });
        }
      });
    }

    // ── 3. Medição leve ──────────────────────────────────────────────
    [].forEach.call(document.querySelectorAll('[data-demo-link]'), function (a) {
      a.addEventListener('click', function () { track('partner_demo_click', { placement: a.getAttribute('data-demo-link'), lang: EN ? 'en' : 'pt' }); });
    });
    [].forEach.call(document.querySelectorAll('.biz-faq details[data-q]'), function (d) {
      d.addEventListener('toggle', function () { if (d.open) track('partner_faq_open', { q: d.getAttribute('data-q'), lang: EN ? 'en' : 'pt' }); });
    });
    var plans = $('planos');
    if (plans && 'IntersectionObserver' in window) {
      var pio = new IntersectionObserver(function (en) { if (en.some(function (x) { return x.isIntersecting; })) { track('partner_plans_view', { lang: EN ? 'en' : 'pt' }); pio.disconnect(); } }, { threshold: 0.25 });
      pio.observe(plans);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
