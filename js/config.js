// Supabase Configuration
// Note: use only the publishable key on the client side — never expose the secret key
const SUPABASE_URL = 'https://glupdjvdvunogkqgxoui.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_HKdE2IRmz9lMDcg4p3l1tw_HiTdD4nw';

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── Auth Helpers ─────────────────────────────────────────────────────────────

async function getCurrentUser() {
  const { data: { user } } = await db.auth.getUser();
  return user;
}

async function signIn(email, password) {
  return await db.auth.signInWithPassword({ email, password });
}

async function signUp(email, password, meta = {}) {
  return await db.auth.signUp({ email, password, options: { data: meta } });
}

async function signOut() {
  await db.auth.signOut();
  window.location.href = '/login.html';
}

async function resetPassword(email) {
  return await db.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset.html`,
  });
}

// ─── Route Guard ──────────────────────────────────────────────────────────────

async function requireAuth(redirectTo = '/login.html') {
  const user = await getCurrentUser();
  if (!user) window.location.href = redirectTo;
  return user;
}

async function redirectIfAuthed(redirectTo = '/dashboard.html') {
  const user = await getCurrentUser();
  if (user) window.location.href = redirectTo;
}

// ─── User Role ────────────────────────────────────────────────────────────────

// WARNING: returns user-editable metadata. NOT for authorization decisions.
// For privilege checks, use isAdminUser() or check user.app_metadata directly.
function getUserRole(user) {
  return user?.user_metadata?.role || 'user';
}

// Authorization check — uses app_metadata only (server-controlled, not user-editable)
function isAdminUser(user) {
  if (!user) return false;
  return user.app_metadata?.role === 'admin';
}

// ─── Beaches CRUD ─────────────────────────────────────────────────────────────

async function getBeaches(search = '') {
  let q = db.from('beaches').select('*').order('name');
  if (search) q = q.ilike('name', `%${search}%`);
  const { data, error } = await q;
  if (error) throw error;
  return data;
}

async function createBeach(beach) {
  const { data, error } = await db.from('beaches').insert([beach]).select().single();
  if (error) throw error;
  return data;
}

async function updateBeach(id, updates) {
  const { data, error } = await db.from('beaches')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id).select().single();
  if (error) throw error;
  return data;
}

async function deleteBeach(id) {
  const { error } = await db.from('beaches').delete().eq('id', id);
  if (error) throw error;
}

// ─── Tides CRUD ───────────────────────────────────────────────────────────────

async function getTides(beachId) {
  const { data, error } = await db.from('tides')
    .select('*').eq('beach_id', beachId).order('date').order('time');
  if (error) throw error;
  return data;
}

async function createTide(tide) {
  const { data, error } = await db.from('tides').insert([tide]).select().single();
  if (error) throw error;
  return data;
}

async function deleteTide(id) {
  const { error } = await db.from('tides').delete().eq('id', id);
  if (error) throw error;
}

// ─── Toast Notification ───────────────────────────────────────────────────────

function showToast(message, type = 'success') {
  const existing = document.getElementById('toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'toast';
  toast.className = `toast toast--${type}`;
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.innerHTML = `
    <span class="toast__icon">${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
    <span>${message}</span>
  `;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('toast--visible'));
  setTimeout(() => {
    toast.classList.remove('toast--visible');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ─── Analytics helper ─────────────────────────────────────────────────────────
// Pushes into dataLayer (GTM-compatible) and calls gtag() if already loaded.
// Fully resilient — site never breaks if no analytics script is present.
window.track = function(event, params) {
  try {
    if (window.gtag) window.gtag('event', event, params || {});
    (window.dataLayer = window.dataLayer || []).push(Object.assign({ event: event }, params || {}));
  } catch (_) {}
};
