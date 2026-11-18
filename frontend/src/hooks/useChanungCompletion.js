import { useEffect, useRef, useState } from 'react';
import { account, fetchRemote, pushRemoteNow } from '../sync';


export function mergeCompletion(a = {}, b = {}) {
  const merged = { ...a };
  for (const [id, value] of Object.entries(b)) {
    if (typeof value?.done !== 'boolean' || !Number.isFinite(value.at)) continue;
    if (!merged[id] || value.at > merged[id].at) merged[id] = value;
  }
  return merged;
}
export default function useChanungCompletion(user, ids, version = '') {
  const bank = version ? `chanung-completion-${version}` : 'chanung-completion-v1';
  const allowed = new Set(ids);
  const owner = user ? `user:${user.id || user.nickname}` : 'guest';
  const legacyKey = `chanung:practice:v1:${owner}${version ? `:version:${version}` : ''}:completed`;
  const key = `${legacyKey}:v2`;
  const read = () => {
    try {
      const raw = JSON.parse(localStorage.getItem(key));
      if (raw && typeof raw === 'object' && !Array.isArray(raw)) return clean(raw);
      const legacy = JSON.parse(localStorage.getItem(legacyKey));
      return Object.fromEntries((Array.isArray(legacy) ? legacy : []).filter(id => allowed.has(id)).map(id => [id, { done: true, at: 1 }]));
    } catch { return {}; }
  };
  function clean(data) { return Object.fromEntries(Object.entries(mergeCompletion({}, data)).filter(([id]) => allowed.has(id))); }
  const [data, setData] = useState(read);
  const [status, setStatus] = useState(user ? 'loading' : 'guest');
  const current = useRef(data);
  const alive = useRef(true);
  const busy = useRef(false);
  const again = useRef(false);
  const currentUser = () => !user || account()?.token === user.token;
  const cache = value => {
    current.current = value;
    let saved = true;
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { saved = false; }
    if (alive.current && currentUser()) setData(value);
    return saved;
  };
  async function sync() {
    if (!user || !currentUser() || !alive.current) return;
    if (busy.current) { again.current = true; return; }
    busy.current = true;
    try {
      do {
        again.current = false;
        if (alive.current) setStatus('saving');
        const remote = await fetchRemote(bank, user);
        if (!alive.current || !currentUser()) return;
        const merged = clean(mergeCompletion(mergeCompletion(read(), current.current), remote?.completed || {}));
        cache(merged);
        // The existing durable queue retries failed writes without losing them.
        const saved = await pushRemoteNow(bank, { completed: merged });
        if (!alive.current || !currentUser()) return;
        setStatus(saved ? 'saved' : 'error');
      } while (again.current && alive.current && currentUser());
    } catch (error) {
      if (alive.current && currentUser()) setStatus(error?.response?.status === 401 ? 'expired' : 'error');
    } finally { busy.current = false; }
  }
  function toggle(id) {
    if (!allowed.has(id)) return;
    const previous = mergeCompletion(read(), current.current);
    const at = Math.max(Date.now(), ...Object.values(previous).map(v => v.at + 1), 1);
    const next = { ...previous, [id]: { done: !previous[id]?.done, at } };
    const saved = cache(next);
    if (user) void sync();
    else setStatus(saved ? 'guest' : 'error');
  }
  useEffect(() => {
    alive.current = true;
    const refresh = () => { if (user) void sync(); else cache(read()); };
    const storage = event => { if (event.key === key || event.key === legacyKey || event.key === null) refresh(); };
    if (user) void sync();
    window.addEventListener('online', refresh);
    window.addEventListener('focus', refresh);
    window.addEventListener('storage', storage);
    return () => {
      alive.current = false;
      window.removeEventListener('online', refresh);
      window.removeEventListener('focus', refresh);
      window.removeEventListener('storage', storage);
    };
    // Parent remounts on login/session change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return { completed: Object.keys(data).filter(id => data[id].done), status, toggle, retry: sync };
}
