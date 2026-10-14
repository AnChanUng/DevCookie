import api from './api';

// 기기 간 동기화 계정(닉네임 + 비밀번호). 로그인하지 않아도 사이트는 그대로 쓸 수 있고,
// 로그인하면 풀이 기록을 서버에 함께 저장해 다른 기기에서 이어서 본다
const KEY = 'sync:account';
const EVENT = 'sync:change';

export function account() {
  try {
    const a = JSON.parse(localStorage.getItem(KEY));
    return a?.token ? a : null;
  } catch {
    return null;
  }
}

function setAccount(value) {
  try {
    if (value) localStorage.setItem(KEY, JSON.stringify(value));
    else localStorage.removeItem(KEY);
  } catch { /* storage unavailable */ }
  window.dispatchEvent(new Event(EVENT));
}

// 로그인 상태가 바뀔 때 화면을 다시 그리게 한다
export function onAccountChange(listener) {
  window.addEventListener(EVENT, listener);
  const storageChange = event => { if (event.key === KEY || event.key === null) listener(); };
  window.addEventListener('storage', storageChange);
  return () => {
    window.removeEventListener(EVENT, listener);
    window.removeEventListener('storage', storageChange);
  };
}

// 무료 서버가 잠들어 있으면 깨어나는 데 1분쯤 걸려서 넉넉히 기다린다
const auth = () => ({ headers: { Authorization: `Bearer ${account()?.token}` }, timeout: 90000 });

// mode: 'login' | 'register'
export async function signIn(mode, nickname, password) {
  const { data } = await api.post(`/auth/${mode}`, { nickname, password }, { timeout: 90000 });
  setAccount({ nickname: data.nickname, token: data.token });
}

export async function signOut() {
  try { await api.post('/auth/logout', null, auth()); } catch { /* 서버에 닿지 않아도 이 기기에서는 로그아웃한다 */ }
  setAccount(null);
}

// 다른 기기에서 로그아웃해 토큰이 사라졌으면 이 기기도 로그아웃 상태로 돌린다
const guard = (err) => {
  if (err?.response?.status === 401) setAccount(null);
  throw err;
};

export async function fetchRemote(company) {
  const { data } = await api.get(`/exam/progress/${company}`, auth()).catch(guard);
  try { return data.data ? JSON.parse(data.data) : null; } catch { return null; }
}

// 답을 고를 때마다 서버를 부르지 않게 문제은행마다 잠깐 모았다가 마지막 상태만 올린다
const timers = new Map();
const pending = new Map();

const flush = (company) => {
  const data = pending.get(company);
  if (!data || !account()) return Promise.resolve();
  pending.delete(company);
  return api.put(`/exam/progress/${company}`, { data: JSON.stringify(data) }, auth())
    .catch(guard)
    .catch(() => { if (!pending.has(company)) pending.set(company, data); }); // 실패한 것은 다음 저장 때 다시 올린다
};

export function pushRemote(company, data, delay = 1500) {
  if (!account()) return;
  pending.set(company, data);
  clearTimeout(timers.get(company));
  timers.set(company, setTimeout(() => flush(company), delay));
}

// 지금 바로 올리고 끝날 때까지 기다린다
export function pushRemoteNow(company, data) {
  pending.set(company, data);
  clearTimeout(timers.get(company));
  return flush(company);
}
