export const OPEN_WORLD_USERS_KEY = 'open-world-users-v1';
export const OPEN_WORLD_AUTH_KEY = 'open-world-auth-v1';

function encodeBase64Url(value) {
  const encoded =
    typeof btoa === 'function'
      ? btoa(unescape(encodeURIComponent(value)))
      : Buffer.from(value, 'utf8').toString('base64');

  return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function readUsers(storage) {
  const raw = storage.getItem(OPEN_WORLD_USERS_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function writeUsers(storage, users) {
  storage.setItem(OPEN_WORLD_USERS_KEY, JSON.stringify(users));
}

function createPasswordHash(username, password) {
  return encodeBase64Url(`${username}:${password}`);
}

export function createJwtLikeToken(payload) {
  const header = { alg: 'none', typ: 'JWT' };
  const body = {
    ...payload,
    iat: 0,
  };
  return `${encodeBase64Url(JSON.stringify(header))}.${encodeBase64Url(
    JSON.stringify(body),
  )}.local`;
}

function normalizeCredentials(credentials) {
  const username = String(credentials?.username || '').trim();
  const password = String(credentials?.password || '');
  if (username.length < 3) {
    throw new Error('Username must be at least 3 characters.');
  }
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters.');
  }
  return { username, password };
}

function persistSession(storage, username) {
  const session = {
    username,
    token: createJwtLikeToken({ sub: username, username }),
  };
  storage.setItem(OPEN_WORLD_AUTH_KEY, JSON.stringify(session));
  return session;
}

export function registerUser(storage, credentials) {
  const { username, password } = normalizeCredentials(credentials);
  const users = readUsers(storage);
  if (users[username]) {
    throw new Error('User already exists.');
  }
  users[username] = {
    username,
    passwordHash: createPasswordHash(username, password),
  };
  writeUsers(storage, users);
  return persistSession(storage, username);
}

export function loginUser(storage, credentials) {
  const { username, password } = normalizeCredentials(credentials);
  const users = readUsers(storage);
  const user = users[username];
  if (!user || user.passwordHash !== createPasswordHash(username, password)) {
    throw new Error('Invalid username or password.');
  }
  return persistSession(storage, username);
}

export function loadAuthSession(storage) {
  const raw = storage.getItem(OPEN_WORLD_AUTH_KEY);
  if (!raw) return null;
  try {
    const session = JSON.parse(raw);
    if (!session?.username || !session?.token) return null;
    return session;
  } catch {
    return null;
  }
}

export function logoutUser(storage) {
  storage.removeItem(OPEN_WORLD_AUTH_KEY);
}
