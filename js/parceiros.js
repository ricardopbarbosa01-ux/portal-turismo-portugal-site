/**
 * js/parceiros.js — Handler do formulário B2B de parceiros
 * Depende de: config.js (db, showToast, track, getCurrentUser)
 */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('b2b-form');
  const btn = document.getElementById('b2b-submit');
  if (!form || !btn) return;

  // ── GA4: funil parceiros ──────────────────────────────────────────────
  var fNegocio = document.getElementById('f-negocio');
  if (fNegocio) {
    fNegocio.addEventListener('focus', function onParceirosIniciado() {
      fNegocio.removeEventListener('focus', onParceirosIniciado);
      if (typeof gtag === 'function') {
        try { gtag('event', 'partner_aplicacao_iniciada'); } catch(e) { console.warn('GA event failed:', e); }
      }
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'A enviar...';

    const payload = {
      negocio: document.getElementById('f-negocio').value.trim(),
      tipo: document.getElementById('f-tipo').value,
      objetivo: document.getElementById('f-objetivo').value,
      plano: document.getElementById('f-plano').value,
      contacto: document.getElementById('f-contacto').value.trim(),
      email: document.getElementById('f-email').value.trim(),
      localizacao: document.getElementById('f-localizacao').value.trim(),
      regiao: document.getElementById('f-regiao').value,
      website: document.getElementById('f-website').value.trim(),
      instagram: document.getElementById('f-instagram').value.trim(),
      mensagem: document.getElementById('f-mensagem').value.trim(),
    };

    const { error } = await db.from('partner_leads').insert([payload]);

    if (error) {
      showToast('Erro ao enviar. Tente novamente ou contacte-nos directamente.', 'error');
      console.error('partner_leads insert error:', error);
    } else {
      if (typeof gtag === 'function') {
        try {
          gtag('event', 'partner_aplicacao_submetida', {
            tipo:  payload.tipo,
            regiao: payload.regiao,
            plano:  payload.plano,
          });
        } catch(e) { console.warn('GA event failed:', e); }
      }
      showToast('Pedido enviado! A nossa equipa contacta-o em 5 dias úteis.', 'success');
      // Email partner-alert enviado via DB trigger trigger_partner_lead_created
      form.reset();
      track('b2b_form_submit', { plano: payload.plano, regiao: payload.regiao });
    }

    btn.disabled = false;
    btn.textContent = originalText;
  });
});
