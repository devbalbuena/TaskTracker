// ─── Theme Init ───────────────────────────────────────────────────────────────
const isDark = localStorage.getItem('darkMode') === 'true';
if (isDark) document.body.classList.add('dark-theme');

// ─── Elements ─────────────────────────────────────────────────────────────────
const loginTab      = document.getElementById('loginTab');
const registerTab   = document.getElementById('registerTab');
const loginForm     = document.getElementById('loginForm');
const registerForm  = document.getElementById('registerForm');
const loginError    = document.getElementById('loginError');
const registerError = document.getElementById('registerError');
const loginSubmit   = document.getElementById('loginSubmit');
const registerSubmit = document.getElementById('registerSubmit');

// ─── Check if already logged in ───────────────────────────────────────────────
(async () => {
  try {
    const res = await fetch('/api/auth/me');
    if (res.ok) {
      window.location.replace('/app.html');
    }
  } catch (_) {
    // Not logged in — stay on page
  }
})();

// ─── Tab Switching ────────────────────────────────────────────────────────────
loginTab.addEventListener('click', () => {
  loginTab.classList.add('active');
  registerTab.classList.remove('active');
  loginForm.classList.remove('hidden');
  registerForm.classList.add('hidden');
  loginError.classList.add('hidden');
});

registerTab.addEventListener('click', () => {
  registerTab.classList.add('active');
  loginTab.classList.remove('active');
  registerForm.classList.remove('hidden');
  loginForm.classList.add('hidden');
  registerError.classList.add('hidden');
});

// ─── Toggle Password Visibility ───────────────────────────────────────────────
document.querySelectorAll('.toggle-pass').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = btn.previousElementSibling;
    const icon  = btn.querySelector('i');
    if (input.type === 'password') {
      input.type = 'text';
      icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
      input.type = 'password';
      icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
  });
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
function setLoading(btn, loading, idleHtml) {
  btn.disabled = loading;
  btn.innerHTML = loading
    ? '<i class="fas fa-spinner fa-spin"></i> Please wait...'
    : idleHtml;
}

function showError(el, msg) {
  el.textContent = msg;
  el.classList.remove('hidden');
}

// ─── Login Form ───────────────────────────────────────────────────────────────
loginForm.addEventListener('submit', async e => {
  e.preventDefault();
  loginError.classList.add('hidden');
  setLoading(loginSubmit, true);

  try {
    const res  = await fetch('/api/auth/login', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        email:    document.getElementById('loginEmail').value,
        password: document.getElementById('loginPassword').value
      })
    });
    const data = await res.json();

    if (!res.ok) {
      showError(loginError, data.error);
    } else {
      window.location.replace('/app.html');
    }
  } catch (_) {
    showError(loginError, 'Network error. Please try again.');
  } finally {
    setLoading(loginSubmit, false, '<i class="fas fa-sign-in-alt"></i> Sign In');
  }
});

// ─── Register Form ────────────────────────────────────────────────────────────
registerForm.addEventListener('submit', async e => {
  e.preventDefault();
  registerError.classList.add('hidden');
  setLoading(registerSubmit, true);

  try {
    const res  = await fetch('/api/auth/register', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        username: document.getElementById('regUsername').value,
        email:    document.getElementById('regEmail').value,
        password: document.getElementById('regPassword').value
      })
    });
    const data = await res.json();

    if (!res.ok) {
      showError(registerError, data.error);
    } else {
      window.location.replace('/app.html');
    }
  } catch (_) {
    showError(registerError, 'Network error. Please try again.');
  } finally {
    setLoading(registerSubmit, false, '<i class="fas fa-user-plus"></i> Create Account');
  }
});
