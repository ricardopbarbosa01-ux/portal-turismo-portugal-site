/**
 * js/parceiros.js — Handler do formulário B2B de parceiros
 * Depende de: config.js (db, showToast, track, getCurrentUser)
 */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('b2b-form');
  const btn = document.getElementById('b2b-submit');
  if (!form || !btn) return;

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
      showToast('Pedido enviado! A nossa equipa contacta-o em 48h.', 'success');
      fetch('https://glupdjvdvunogkqgxoui.supabase.co/functions/v1/send-partner-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY },
        body: JSON.stringify(payload)
      }).catch(() => {});
      form.reset();
      track('b2b_form_submit', { plano: payload.plano, regiao: payload.regiao });
    }

    btn.disabled = false;
    btn.textContent = originalText;
  });
});
