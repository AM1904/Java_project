/**
 * validation.js  —  Phase 3: Client-side validation + JSON representation
 * Split & Expense Tracker
 */

// ── Validators ──────────────────────────────────────────────────────────────

function validateUsername(v) {
  if (!v || v.trim() === '')      return { ok: false, msg: 'Username cannot be empty.' };
  if (v.trim().length < 3)        return { ok: false, msg: 'Username must be at least 3 characters.' };
  if (!/^[a-zA-Z0-9_]+$/.test(v.trim()))
                                  return { ok: false, msg: 'Only letters, numbers and underscores allowed.' };
  return { ok: true };
}

function validatePassword(v) {
  if (!v || v.trim() === '')      return { ok: false, msg: 'Password cannot be empty.' };
  if (v.trim().length < 6)        return { ok: false, msg: 'Password must be at least 6 characters.' };
  return { ok: true };
}

function validateConfirm(v, original) {
  if (!v || v.trim() === '')      return { ok: false, msg: 'Please confirm your password.' };
  if (v !== original)             return { ok: false, msg: 'Passwords do not match.' };
  return { ok: true };
}

// ── Password Strength ────────────────────────────────────────────────────────

function passwordStrength(p) {
  let score = 0;
  if (p.length >= 6)  score++;
  if (p.length >= 10) score++;
  if (/[A-Z]/.test(p)) score++;
  if (/[0-9]/.test(p)) score++;
  if (/[^a-zA-Z0-9]/.test(p)) score++;
  return score; // 0-5
}

// ── Field State Helpers ──────────────────────────────────────────────────────

function setOk(input, errEl) {
  input.classList.remove('err');
  input.classList.add('ok');
  if (errEl) { errEl.textContent = ''; errEl.classList.remove('show'); }
}

function setErr(input, errEl, msg) {
  input.classList.add('err');
  input.classList.remove('ok');
  if (errEl) { errEl.textContent = msg; errEl.classList.add('show'); }
}

function applyResult(result, input, errEl) {
  if (result.ok) setOk(input, errEl);
  else           setErr(input, errEl, result.msg);
  return result.ok;
}

// ── Password toggle ──────────────────────────────────────────────────────────

window.togglePassword = function(inputId, btn) {
  const inp = document.getElementById(inputId);
  if (inp.type === 'password') {
    inp.type = 'text';
    btn.textContent = '🙈';
    btn.setAttribute('aria-label', 'Hide password');
  } else {
    inp.type = 'password';
    btn.textContent = '👁';
    btn.setAttribute('aria-label', 'Show password');
  }
};

// ── JSON Representation (Phase 3 requirement) ────────────────────────────────

function buildUserJSON(username) {
  return {
    username: username.trim(),
    status:   'active',
    timestamp: new Date().toISOString()
  };
}

// ── Show URL param messages ──────────────────────────────────────────────────

function showUrlMessage() {
  const params  = new URLSearchParams(window.location.search);
  const errMsg  = params.get('error');
  const okMsg   = params.get('message');
  const alertEl = document.getElementById('formAlert');
  if (!alertEl) return;
  if (errMsg) {
    alertEl.innerHTML = '<span>&#9888;</span> ' + decodeURIComponent(errMsg);
    alertEl.classList.add('alert-err', 'show');
  } else if (okMsg) {
    alertEl.innerHTML = '<span>&#10003;</span> ' + decodeURIComponent(okMsg);
    alertEl.classList.add('alert-ok', 'show');
  }
}

// ── Login Form ───────────────────────────────────────────────────────────────

function setupLogin() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  const uInp  = document.getElementById('username');
  const pInp  = document.getElementById('password');
  const uErr  = document.getElementById('usernameErr');
  const pErr  = document.getElementById('passwordErr');
  const btn   = document.getElementById('submitBtn');

  uInp.addEventListener('blur', () => applyResult(validateUsername(uInp.value), uInp, uErr));
  pInp.addEventListener('blur', () => applyResult(validatePassword(pInp.value), pInp, pErr));

  form.addEventListener('submit', function(e) {
    const uOk = applyResult(validateUsername(uInp.value), uInp, uErr);
    const pOk = applyResult(validatePassword(pInp.value), pInp, pErr);
    if (!uOk || !pOk) { e.preventDefault(); return; }
    btn.disabled = true;
    btn.textContent = 'Signing in…';
  });
}

// ── Register Form ────────────────────────────────────────────────────────────

function setupRegister() {
  const form = document.getElementById('registerForm');
  if (!form) return;

  const uInp  = document.getElementById('username');
  const pInp  = document.getElementById('password');
  const cInp  = document.getElementById('confirmPassword');
  const uErr  = document.getElementById('usernameErr');
  const pErr  = document.getElementById('passwordErr');
  const cErr  = document.getElementById('confirmErr');
  const sBar  = document.getElementById('strengthBar');
  const btn   = document.getElementById('submitBtn');

  uInp.addEventListener('blur', () => applyResult(validateUsername(uInp.value), uInp, uErr));

  pInp.addEventListener('input', () => {
    const score = passwordStrength(pInp.value);
    const pct   = (score / 5) * 100;
    const cols  = ['','#FF6B8A','#FFB347','#FFD93D','#6BCB77','#00D4AA'];
    if (sBar) {
      sBar.style.width      = pct + '%';
      sBar.style.background = cols[score] || 'transparent';
    }
  });

  pInp.addEventListener('blur', () => applyResult(validatePassword(pInp.value), pInp, pErr));
  cInp.addEventListener('blur', () => applyResult(validateConfirm(cInp.value, pInp.value), cInp, cErr));

  form.addEventListener('submit', function(e) {
    const uOk = applyResult(validateUsername(uInp.value), uInp, uErr);
    const pOk = applyResult(validatePassword(pInp.value), pInp, pErr);
    const cOk = applyResult(validateConfirm(cInp.value, pInp.value), cInp, cErr);
    if (!uOk || !pOk || !cOk) { e.preventDefault(); return; }

    // Phase 3: log JSON representation to console
    const userJSON = buildUserJSON(uInp.value);
    console.log('[Phase 3] User data as JSON:', JSON.stringify(userJSON, null, 2));

    btn.disabled    = true;
    btn.textContent = 'Creating account…';
  });
}

// ── Init ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function() {
  showUrlMessage();
  setupLogin();
  setupRegister();
});