/**
 * favorites.js — Gestão de praias favoritas (Pro only)
 * Depende de: config.js (db, getCurrentUser, showToast)
 */

const FAVORITES_KEY = 'pth_favorites_cache';

async function getFavorites() {
  const user = await getCurrentUser();
  if (!user) return [];
  const { data, error } = await db
    .from('favorites')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (error) { console.error('getFavorites:', error); return []; }
  return data || [];
}

async function toggleFavorite(beachId, beachName, beachRegion) {
  const user = await getCurrentUser();
  if (!user) { window.location.href = '/login.html'; return; }

  // Verificar se é Pro
  const isPro = user?.app_metadata?.plan === 'pro';
  if (!isPro) {
    showToast('Favoritos disponíveis no plano Pro 🌟', 'info');
    setTimeout(() => { window.location.href = '/precos.html'; }, 1500);
    return;
  }

  // Verificar se já é favorito
  const { data: existing } = await db
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('beach_id', beachId)
    .single();

  if (existing) {
    // Remover favorito
    await db.from('favorites').delete()
      .eq('user_id', user.id).eq('beach_id', beachId);
    showToast('Removido dos favoritos', 'info');
    return false;
  } else {
    // Adicionar favorito
    await db.from('favorites').insert([{
      user_id: user.id,
      beach_id: beachId,
      beach_name: beachName,
      beach_region: beachRegion || ''
    }]);
    showToast('Adicionado aos favoritos ⭐', 'success');
    track('favorite_added', { beach_id: beachId, region: beachRegion });
    return true;
  }
}

async function isFavorite(beachId) {
  const user = await getCurrentUser();
  if (!user) return false;
  const { data } = await db
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('beach_id', beachId)
    .single();
  return !!data;
}

// Inicializar botões de favorito na página
async function initFavoriteButtons() {
  const buttons = document.querySelectorAll('[data-favorite-btn]');
  if (!buttons.length) return;

  const user = await getCurrentUser();
  const isPro = user?.app_metadata?.plan === 'pro';

  // Carregar estado dos favoritos de uma vez
  const favorites = user ? await getFavorites() : [];
  const favoriteIds = new Set(favorites.map(f => f.beach_id));

  buttons.forEach(btn => {
    const beachId = btn.dataset.beachId;
    const beachName = btn.dataset.beachName;
    const beachRegion = btn.dataset.beachRegion || '';

    // Estado inicial
    const isFav = favoriteIds.has(beachId);
    btn.classList.toggle('is-favorite', isFav);
    btn.setAttribute('aria-label', isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos');
    btn.innerHTML = isFav ? '⭐' : '☆';
    if (!isPro) btn.title = 'Disponível no plano Pro';

    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const result = await toggleFavorite(beachId, beachName, beachRegion);
      if (result === true) {
        btn.classList.add('is-favorite');
        btn.innerHTML = '⭐';
      } else if (result === false) {
        btn.classList.remove('is-favorite');
        btn.innerHTML = '☆';
      }
    });
  });
}

// Auto-inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFavoriteButtons);
} else {
  initFavoriteButtons();
}
