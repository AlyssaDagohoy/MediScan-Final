const SESSION_KEY = 'mediscan_session';

function signup(name, email, password) {
  const users = JSON.parse(localStorage.getItem('mediscan_users') || '{}');
  if (users[email]) return { ok: false, error: 'Email already registered.' };
  users[email] = { name, password };
  localStorage.setItem('mediscan_users', JSON.stringify(users));
  _setSession(email, name);
  return { ok: true };
}

function login(email, password) {
  const users = JSON.parse(localStorage.getItem('mediscan_users') || '{}');
  const user = users[email];
  if (!user) return { ok: false, error: 'No account found with that email.' };
  if (user.password !== password) return { ok: false, error: 'Incorrect password.' };
  _setSession(email, user.name);
  return { ok: true };
}

function logout() {
  localStorage.removeItem(SESSION_KEY);
  window.location.href = 'login.html';
}

function getSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)); }
  catch { return null; }
}

function requireAuth() {
  if (!getSession()) window.location.href = 'login.html';
}

function _setSession(email, name) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ email, name, ts: Date.now() }));
}

// Returns a user-scoped key so each user's data is completely separate.
function userKey(key) {
  const s = getSession();
  if (!s) return key;
  return 'mediscan_data_' + s.email + '_' + key;
}

// Returns every localStorage key belonging to the current user: global
// app-wide keys (like theme) plus this user's own per-account data keys.
// Used by Settings → Export/Reset so those actions only ever touch this
// user's data and never another account's, and never the password store.
function getMyKeys() {
  const s = getSession();
  const prefix = s ? 'mediscan_data_' + s.email + '_' : null;
  return Object.keys(localStorage).filter(k =>
    k.startsWith('MediScan_') || (prefix && k.startsWith(prefix))
  );
}