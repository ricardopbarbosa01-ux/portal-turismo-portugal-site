/**
 * js/login.js — Auth form handlers for login.html
 * Depends on: config.js (signIn, signUp, resetPassword, showToast, track, db)
 * Extracted from inline script — Sprint 1.1 (2026-04-15)
 */

// ── Tab navigation ──────────────────────────────────────────────────────────

function switchTab(tab) {
  document.querySelectorAll('.auth-panel').forEach(p => {
    p.classList.remove('active');
    p.hidden = false;
  });
  document.querySelectorAll('.auth-tab').forEach(t => {
    t.classList.remove('active');
    t.setAttribute('aria-selected', 'false');
  });
  hideAlert();

  if (tab === 'login') {
    document.getElementById('panel-login').classList.add('active');
    document.getElementById('tab-login').classList.add('active');
    document.getElementById('tab-login').setAttribute('aria-selected', 'true');
  } else if (tab === 'register') {
    document.getElementById('panel-register').classList.add('active');
    document.getElementById('tab-register').classList.add('active');
    document.getElementById('tab-register').setAttribute('aria-selected', 'true');
  } else if (tab === 'reset') {
    document.getElementById('panel-reset').classList.add('active');
  }
}

// Activate register tab if URL hash starts with #register
if (window.location.hash.startsWith('#register')) {
  switchTab('register');
}

// Read optional ?redirect= param — only allow safe known origins
const _redirectParam = new URLSearchParams(window.location.search).get('redirect') || '';
const _safeRedirect  = _redirectParam && /^https:\/\/([a-z0-9-]+\.lemonsqueezy\.com|portal-turismo-portugal\.pages\.dev)\//.test(_redirectParam)
  ? _redirectParam : null;

// If already authenticated, skip to redirect target
(async () => {
  const { data: { user } } = await db.auth.getUser();
  if (user) { window.location.href = _safeRedirect || '/dashboard.html'; }
})();

// ── Password visibility toggle ──────────────────────────────────────────────

function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  const isHidden = input.type === 'password';
  input.type = isHidden ? 'text' : 'password';
  btn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
  btn.querySelector('.icon-eye').style.display     = isHidden ? 'none' : '';
  btn.querySelector('.icon-eye-off').style.display = isHidden ? ''     : 'none';
}

// ── Password strength ───────────────────────────────────────────────────────

function checkPasswordStrength(value) {
  const strength = document.getElementById('pw-strength');
  const fill     = document.getElementById('pw-strength-fill');
  const label    = document.getElementById('pw-strength-label');

  if (!value) {
    strength.classList.remove('visible');
    return;
  }
  strength.classList.add('visible');

  let score = 0;
  if (value.length >= 8)          score++;
  if (value.length >= 12)         score++;
  if (/[A-Z]/.test(value))        score++;
  if (/[0-9]/.test(value))        score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;

  const levels = [
    { pct: '20%',  color: '#e53e3e', text: 'Very weak' },
    { pct: '40%',  color: '#ed8936', text: 'Weak' },
    { pct: '60%',  color: '#ecc94b', text: 'Fair' },
    { pct: '80%',  color: '#68d391', text: 'Good' },
    { pct: '100%', color: '#38a169', text: 'Strong' },
  ];
  const lvl = levels[Math.min(score - 1, 4)] || levels[0];
  fill.style.width      = lvl.pct;
  fill.style.background = lvl.color;
  label.textContent     = lvl.text;
  label.style.color     = lvl.color;
}

// ── Alert helpers ───────────────────────────────────────────────────────────

function showAlert(message, type = 'error') {
  const el   = document.getElementById('auth-alert');
  const icon = document.getElementById('alert-icon');
  const msg  = document.getElementById('alert-message');

  el.className = `auth-alert auth-alert--${type} visible`;
  msg.textContent = message;

  if (type === 'error') {
    icon.innerHTML = '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>';
  } else {
    icon.innerHTML = '<polyline points="20 6 9 17 4 12"/>';
  }

  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideAlert() {
  const el = document.getElementById('auth-alert');
  el.classList.remove('visible');
  el.className = 'auth-alert';
}

function setFieldError(id, message) {
  const input = document.getElementById(id);
  const error = document.getElementById(id + '-error');
  if (input) input.classList.add('error');
  if (error) { error.textContent = message; error.classList.add('visible'); }
}

function clearFieldErrors(prefix) {
  document.querySelectorAll(`[id^="${prefix}"]`).forEach(el => {
    if (el.tagName === 'INPUT') el.classList.remove('error');
    if (el.classList.contains('form-error')) el.classList.remove('visible');
  });
}

function setLoading(btnId, loading) {
  const btn = document.getElementById(btnId);
  btn.classList.toggle('loading', loading);
  btn.disabled = loading;
}

// ── Map Supabase error messages → user-readable English ────────────────────

function mapError(err) {
  const msg = (err?.message || '').toLowerCase();
  if (msg.includes('invalid login credentials') || msg.includes('invalid email or password'))
    return 'Incorrect email or password. Please try again.';
  if (msg.includes('email not confirmed'))
    return 'Please confirm your email before signing in. Check your inbox.';
  if (msg.includes('user already registered') || msg.includes('already exists'))
    return 'An account with this email already exists. Try signing in.';
  if (msg.includes('password should be at least'))
    return 'Password must be at least 8 characters.';
  if (msg.includes('network') || msg.includes('fetch'))
    return 'Connection error. Check your internet and try again.';
  if (msg.includes('rate limit'))
    return 'Too many attempts. Please wait a moment and try again.';
  return 'Something went wrong. Please try again.';
}

// ── LOGIN ───────────────────────────────────────────────────────────────────

document.getElementById('form-login').addEventListener('submit', async (e) => {
  e.preventDefault();
  clearFieldErrors('login-');
  hideAlert();

  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  let valid = true;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setFieldError('login-email', 'Enter a valid email.');
    valid = false;
  }
  if (!password) {
    setFieldError('login-password', 'Enter your password.');
    valid = false;
  }
  if (!valid) return;

  setLoading('btn-login', true);
  try {
    const { error } = await signIn(email, password);
    if (error) throw error;
    track('login_success', { page: 'login', source: _safeRedirect ? 'upgrade' : 'direct' });
    showAlert('Signed in! Redirecting…', 'success');
    setTimeout(() => { window.location.href = _safeRedirect || '/dashboard.html'; }, 1000);
  } catch (err) {
    showAlert(mapError(err));
  } finally {
    setLoading('btn-login', false);
  }
});

// ── REGISTER ────────────────────────────────────────────────────────────────

document.getElementById('form-register').addEventListener('submit', async (e) => {
  e.preventDefault();
  clearFieldErrors('register-');
  hideAlert();

  const name     = document.getElementById('register-name').value.trim();
  const email    = document.getElementById('register-email').value.trim();
  const password = document.getElementById('register-password').value;
  let valid = true;

  if (!name || name.length < 2) {
    setFieldError('register-name', 'Enter your name (minimum 2 characters).');
    valid = false;
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setFieldError('register-email', 'Enter a valid email.');
    valid = false;
  }
  if (!password || password.length < 8) {
    setFieldError('register-password', 'Password must be at least 8 characters.');
    valid = false;
  }
  if (!valid) return;

  setLoading('btn-register', true);
  try {
    const { data, error } = await signUp(email, password, { full_name: name });
    if (error) throw error;

    // Supabase silent behaviour: when email confirmation is ON and the email
    // already exists, signUp() returns error=null but identities=[].
    if (!data?.user || data.user.identities?.length === 0) {
      showAlert('This email is already registered. Try signing in or reset your password.', 'error');
      return;
    }

    // Fire-and-forget welcome email
    fetch('https://glupdjvdvunogkqgxoui.supabase.co/functions/v1/send-welcome', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY },
      body: JSON.stringify({ email, name })
    }).catch(() => {});

    document.getElementById('form-register').reset();
    document.getElementById('pw-strength').classList.remove('visible');

    if (_safeRedirect) {
      showAlert('Account created! Redirecting to checkout…', 'success');
      setTimeout(() => { window.location.href = _safeRedirect; }, 1200);
    } else {
      showAlert('Account created! Check your email to confirm your registration.', 'success');
    }
  } catch (err) {
    console.error('[register] signUp error:', err);
    showAlert(mapError(err));
  } finally {
    setLoading('btn-register', false);
  }
});

// ── RESET PASSWORD ──────────────────────────────────────────────────────────

document.getElementById('form-reset').addEventListener('submit', async (e) => {
  e.preventDefault();
  clearFieldErrors('reset-');
  hideAlert();

  const email = document.getElementById('reset-email').value.trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setFieldError('reset-email', 'Enter a valid email.');
    return;
  }

  setLoading('btn-reset', true);
  try {
    const { error } = await resetPassword(email);
    if (error) throw error;
    track('reset_request_submit', { page: 'login' });
    document.getElementById('reset-form-wrap').style.display = 'none';
    document.getElementById('reset-success').style.display = 'block';
  } catch (err) {
    showAlert(mapError(err));
  } finally {
    setLoading('btn-reset', false);
  }
});
