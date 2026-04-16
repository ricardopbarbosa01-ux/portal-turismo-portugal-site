/**
 * js/planear.js — Handler do formulário de planeamento de viagem
 * Depende de: config.js (db, showToast, track)
 */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('plan-form');
  const btn = document.getElementById('submit-btn');
  if (!form || !btn) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'A enviar...';

    // Recolher checkboxes de interesses
    const interesses = Array.from(
      form.querySelectorAll('input[type="checkbox"]:checked')
    ).map(cb => cb.value);

    // Recolher radio de orçamento
    const orcamentoEl = form.querySelector('input[type="radio"]:checked');

    const payload = {
      nome: document.getElementById('f-nome').value.trim(),
      email: document.getElementById('f-email').value.trim(),
      interesses,
      regiao: document.getElementById('f-regiao').value,
      pessoas: document.getElementById('f-pessoas').value,
      data_inicio: document.getElementById('f-data-inicio').value || null,
      data_fim: document.getElementById('f-data-fim').value || null,
      orcamento: orcamentoEl ? orcamentoEl.value : null,
      notas: document.getElementById('f-notas').value.trim(),
    };

    const { error } = await db.from('plan_requests').insert([payload]);

    if (error) {
      showToast('Erro ao enviar. Tente novamente.', 'error');
      console.error('plan_requests insert error:', error);
    } else {
      showToast('Pedido recebido! Enviamos o seu plano em 24h.', 'success');
      fetch('https://glupdjvdvunogkqgxoui.supabase.co/functions/v1/send-plan-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY },
        body: JSON.stringify(payload)
      }).catch(() => {});
      form.reset();
      track('plan_form_submit', { regiao: payload.regiao, orcamento: payload.orcamento });
    }

    btn.disabled = false;
    btn.textContent = originalText;
  });
});
