// Shared helpers and login/logout for all pages.
const $ = id => document.getElementById(id);
const fm = n => Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const num = v => parseFloat(String(v).replace(/[^0-9.\-]/g, '')) || 0;

async function api(url, method = 'GET', body) {
  const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  if (r.status === 401 && !location.pathname.endsWith('login.html')) { location = '/login.html'; throw new Error('Authentication required'); }
  return r.json();
}
function calcTotals(q) {
  const disc = num(q.discount) / 100; let sub = 0, gst = 0;
  const rows = (q.items || []).map(it => { const amount = num(it.qty) * num(it.rate); sub += amount; gst += amount * (1 - disc) * num(it.gst) / 100; return { ...it, amount }; });
  return { rows, sub, d: sub * disc, gst, total: sub - sub * disc + gst };
}
async function logout() { await api('/api/auth/logout', 'POST'); location = '/login.html'; }

const lf = $('loginForm');
const themeToggle = $('themeToggle');
if (themeToggle) {
  const body = document.body;
  const themeIcon = $('themeIcon');
  const themeLabel = $('themeLabel');
  const applyTheme = theme => {
    const isLight = theme === 'light';
    body.dataset.theme = isLight ? 'light' : 'dark';
    themeIcon.textContent = isLight ? '☾' : '☼';
    themeLabel.textContent = isLight ? 'Dark mode' : 'Light mode';
    themeToggle.setAttribute('aria-label', `Switch to ${isLight ? 'dark' : 'light'} theme`);
    themeToggle.title = `Switch to ${isLight ? 'dark' : 'light'} theme`;
  };
  applyTheme(localStorage.getItem('jk-theme') === 'light' ? 'light' : 'dark');
  themeToggle.onclick = () => {
    const theme = body.dataset.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('jk-theme', theme);
    applyTheme(theme);
  };
}

if (lf) lf.onsubmit = async e => {
  e.preventDefault();
  const r = await api('/api/auth/login', 'POST', { password: $('password').value });
  if (r.ok) location = '/dashboard.html'; else $('err').textContent = r.error || 'Sign-in failed';
};
