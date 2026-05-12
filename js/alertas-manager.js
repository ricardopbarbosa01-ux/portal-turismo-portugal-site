/** js/alertas-manager.js — Gestão de alertas Pro em /conta.html#alertas
 *  Depends on: config.js (db, showToast)
 */

(function () {
  'use strict';

  const isEN = document.documentElement.lang === 'en';

  const STR = {
    loading:       isEN ? 'Loading alerts…'        : 'A carregar alertas…',
    empty:         isEN ? "You haven\'t created any alerts yet. Create one on any beach page."
                        : 'Ainda não criaste alertas. Cria um na página de qualquer praia.',
    active:        isEN ? 'Active'                  : 'Activo',
    paused:        isEN ? 'Paused'                  : 'Pausado',
    snoozedUntil:  isEN ? 'Snoozed until'           : 'Em snooze até',
    lastTriggered: isEN ? 'Last triggered:'         : 'Último disparo:',
    neverTrigg:    isEN ? 'Never triggered'         : 'Nunca disparou',
    pause:         isEN ? 'Pause'                   : 'Pausar',
    resume:        isEN ? 'Resume'                  : 'Retomar',
    snooze7d:      isEN ? 'Snooze 7d'               : 'Snooze 7d',
    editThresh:    isEN ? 'Edit threshold'          : 'Editar valor',
    del:           isEN ? 'Delete'                  : 'Apagar',
    confirmDel:    isEN ? 'Delete this alert?'      : 'Apagar este alerta?',
    saveBtn:       isEN ? 'Save'                    : 'Guardar',
    cancelBtn:     isEN ? 'Cancel'                  : 'Cancelar',
    newValue:      isEN ? 'New value'               : 'Novo valor',
    errSave:       isEN ? 'Error saving. Try again.': 'Erro ao guardar. Tenta de novo.',
  };

  const CONDITION_LABELS = {
    pt: {
      'wave_height|above': 'Ondas acima de',    'wave_height|below': 'Ondas abaixo de',
      'wind_speed|above':  'Vento acima de',    'wind_speed|below':  'Vento abaixo de',
      'temperature|above': 'Temperatura acima de', 'temperature|below': 'Temperatura abaixo de',
    },
    en: {
      'wave_height|above': 'Waves above',       'wave_height|below': 'Waves below',
      'wind_speed|above':  'Wind above',        'wind_speed|below':  'Wind below',
      'temperature|above': 'Temperature above', 'temperature|below': 'Temperature below',
    },
  };
  const UNITS = { wave_height: 'm', wind_speed: 'km/h', temperature: '°C' };

  function formatCondition(alert) {
    const key   = alert.condition + '|' + alert.operator;
    const lang  = isEN ? 'en' : 'pt';
    const label = CONDITION_LABELS[lang][key] || key;
    const unit  = UNITS[alert.condition] || alert.unit || '';
    return label + ' ' + alert.threshold + ' ' + unit;
  }

  function formatRelativeTime(ts) {
    if (!ts) return null;
    const diff  = Date.now() - new Date(ts).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days  = Math.floor(diff / 86400000);
    if (mins < 2)  return isEN ? 'just now'           : 'agora mesmo';
    if (mins < 60) return isEN ? mins + 'm ago'        : 'há ' + mins + 'min';
    if (hours < 24)return isEN ? hours + 'h ago'       : 'há ' + hours + 'h';
    if (days === 1)return isEN ? 'yesterday'           : 'ontem';
    return         isEN ? days + ' days ago'           : 'há ' + days + ' dias';
  }

  function formatDate(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleDateString(isEN ? 'en-GB' : 'pt-PT', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function badgeHTML(alert) {
    const now = Date.now();
    if (alert.snoozed_until && new Date(alert.snoozed_until).getTime() > now) {
      return `<span class="alerta-badge snoozed">${STR.snoozedUntil} ${formatDate(alert.snoozed_until)}</span>`;
    }
    if (!alert.active) {
      return `<span class="alerta-badge paused">${STR.paused}</span>`;
    }
    return `<span class="alerta-badge active">${STR.active}</span>`;
  }

  function lastTriggeredHTML(alert) {
    const rel = formatRelativeTime(alert.last_triggered_at);
    if (!rel) return `<span class="alerta-last-triggered">${STR.neverTrigg}</span>`;
    return `<span class="alerta-last-triggered">${STR.lastTriggered} ${rel}</span>`;
  }

  /* ── Render ─────────────────────────────────────────────────────── */
  function renderAlertsList(alerts) {
    const emptyEl = document.getElementById('alertas-empty');
    const listEl  = document.getElementById('alertas-list');
    if (!listEl) return;

    if (!alerts || !alerts.length) {
      listEl.innerHTML = '';
      if (emptyEl) {
        emptyEl.textContent = STR.empty;
        emptyEl.classList.remove('hidden');
      }
      return;
    }

    if (emptyEl) emptyEl.classList.add('hidden');

    listEl.innerHTML = alerts.map(a => `
      <li class="alerta-item" data-id="${a.id}" role="listitem">
        <div class="alerta-item-top">
          <a href="/beach.html?id=${encodeURIComponent(a.beach_id)}" class="alerta-beach-name">${_escHtml(a.beach_name)}</a>
          ${badgeHTML(a)}
        </div>
        <div class="alerta-condition">${_escHtml(formatCondition(a))}</div>
        ${lastTriggeredHTML(a)}
        <div class="alerta-actions">
          <button class="alerta-action-btn" data-action="toggle" data-id="${a.id}" data-active="${a.active}">
            ${a.active ? STR.pause : STR.resume}
          </button>
          <button class="alerta-action-btn" data-action="snooze" data-id="${a.id}">
            ${STR.snooze7d}
          </button>
          <button class="alerta-action-btn" data-action="edit" data-id="${a.id}" data-threshold="${a.threshold}" data-condition="${_escAttr(formatCondition(a))}">
            ${STR.editThresh}
          </button>
          <button class="alerta-action-btn danger" data-action="delete" data-id="${a.id}" data-name="${_escAttr(a.beach_name)}">
            ${STR.del}
          </button>
        </div>
      </li>`
    ).join('');

    listEl.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', handleAction);
    });
  }

  /* ── Actions ────────────────────────────────────────────────────── */
  async function handleAction(e) {
    const btn    = e.currentTarget;
    const action = btn.dataset.action;
    const id     = btn.dataset.id;

    if (action === 'toggle') {
      const current = btn.dataset.active === 'true';
      await toggleActive(id, current);
    } else if (action === 'snooze') {
      await snoozeAlert(id, 7);
    } else if (action === 'edit') {
      showEditModal(id, parseFloat(btn.dataset.threshold), btn.dataset.condition);
    } else if (action === 'delete') {
      await deleteAlert(id, btn.dataset.name);
    }
  }

  async function fetchUserAlerts() {
    const { data, error } = await db
      .from('alerts')
      .select('id, beach_id, beach_name, condition, operator, threshold, unit, active, snoozed_until, last_triggered_at, created_at')
      .order('created_at', { ascending: false });
    if (error) { console.error('[alertas-manager] fetchUserAlerts:', error); return []; }
    return data || [];
  }

  async function toggleActive(id, current) {
    const { error } = await db
      .from('alerts')
      .update({ active: !current })
      .eq('id', id);
    if (error) { showToast(STR.errSave, 'error'); return; }
    await refresh();
  }

  async function snoozeAlert(id, days) {
    const until = new Date(Date.now() + days * 86400000).toISOString();
    const { error } = await db
      .from('alerts')
      .update({ snoozed_until: until })
      .eq('id', id);
    if (error) { showToast(STR.errSave, 'error'); return; }
    await refresh();
  }

  async function deleteAlert(id, beachName) {
    if (!confirm(STR.confirmDel + (beachName ? ' (' + beachName + ')' : ''))) return;
    const { error } = await db
      .from('alerts')
      .delete()
      .eq('id', id);
    if (error) { showToast(STR.errSave, 'error'); return; }
    await refresh();
  }

  async function updateThreshold(id, newValue) {
    const { error } = await db
      .from('alerts')
      .update({ threshold: newValue })
      .eq('id', id);
    if (error) { showToast(STR.errSave, 'error'); return; }
    await refresh();
  }

  async function refresh() {
    const alerts = await fetchUserAlerts();
    renderAlertsList(alerts);
  }

  /* ── Inline edit modal ──────────────────────────────────────────── */
  function showEditModal(id, currentThreshold, conditionLabel) {
    let overlay = document.getElementById('alertas-edit-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'alertas-edit-overlay';
      overlay.className = 'alertas-edit-overlay';
      overlay.innerHTML = `
        <div class="alertas-edit-modal" role="dialog" aria-modal="true" aria-labelledby="alertas-edit-title">
          <div id="alertas-edit-title" class="alertas-edit-title"></div>
          <label class="alertas-edit-label" for="alertas-edit-input">${STR.newValue}</label>
          <input id="alertas-edit-input" type="number" min="0" step="0.1" class="alertas-edit-input">
          <div class="alertas-edit-actions">
            <button id="alertas-edit-save" class="alerta-action-btn primary">${STR.saveBtn}</button>
            <button id="alertas-edit-cancel" class="alerta-action-btn">${STR.cancelBtn}</button>
          </div>
        </div>`;
      document.body.appendChild(overlay);
      overlay.addEventListener('click', e => { if (e.target === overlay) closeEditModal(); });
    }

    overlay.querySelector('#alertas-edit-title').textContent = conditionLabel;
    const input = overlay.querySelector('#alertas-edit-input');
    input.value = currentThreshold;
    overlay.classList.add('open');
    input.focus();

    overlay.querySelector('#alertas-edit-cancel').onclick = closeEditModal;
    overlay.querySelector('#alertas-edit-save').onclick = async () => {
      const val = parseFloat(input.value);
      if (isNaN(val) || val < 0) { input.focus(); return; }
      closeEditModal();
      await updateThreshold(id, val);
    };
  }

  function closeEditModal() {
    const overlay = document.getElementById('alertas-edit-overlay');
    if (overlay) overlay.classList.remove('open');
  }

  /* ── Utils ──────────────────────────────────────────────────────── */
  function _escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function _escAttr(str) { return _escHtml(str); }

  /* ── Init ───────────────────────────────────────────────────────── */
  window.initAlertasManager = async function () {
    const listEl = document.getElementById('alertas-list');
    if (!listEl) return;
    const emptyEl = document.getElementById('alertas-empty');
    if (emptyEl) { emptyEl.classList.remove('hidden'); emptyEl.textContent = STR.loading; }

    const alerts = await fetchUserAlerts();
    renderAlertsList(alerts);
  };

})();
