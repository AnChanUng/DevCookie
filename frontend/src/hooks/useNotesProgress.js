import { useEffect, useRef, useState } from 'react';
import api from '../api';
import { migrateNotesCompletion } from '../data/csNotes';

const endpoint = '/exam/progress/cs-notes-v1';
const keyFor = user => `cs-notes:v1:${user.nickname}`;
function read(user) {
  try { return migrateNotesCompletion(JSON.parse(localStorage.getItem(keyFor(user))) || {}); } catch { return {}; }
}
function cache(user, data) {
  try { localStorage.setItem(keyFor(user), JSON.stringify(data)); } catch { /* Server remains the durable store. */ }
}
export function mergeNotes(a = {}, b = {}) {
  const result = { ...a };
  for (const [id, value] of Object.entries(b)) {
    if (typeof value?.done !== 'boolean' || !Number.isFinite(value.at)) continue;
    if (!result[id] || value.at > result[id].at) result[id] = value;
  }
  return result;
}

// The parent remounts this hook on account changes. Every request captures that
// account's token, so an in-flight save can never be reassigned to the next user.
export default function useNotesProgress(user) {
  const [data, setData] = useState(() => user ? read(user) : {});
  const [status, setStatus] = useState(user ? 'loading' : 'guest');
  const busy = useRef(false);
  const alive = useRef(true);
  async function sync(id) {
    if (!user || busy.current) return;
    busy.current = true;
    setStatus('saving');
    if (id) {
      const local = read(user);
      const next = { ...local, [id]: { done: !local[id]?.done, at: Math.max(Date.now(), (local[id]?.at || 0) + 1) } };
      cache(user, next);
      if (alive.current) setData(next);
    }
    const config = { headers: { Authorization: `Bearer ${user.token}` }, timeout: 90000 };
    try {
      const response = await api.get(endpoint, config);
      const remote = response.data.data ? JSON.parse(response.data.data).completed || {} : {};
      const merged = migrateNotesCompletion(mergeNotes(read(user), remote));
      cache(user, merged);
      if (alive.current) setData(merged);
      if (JSON.stringify(merged) !== JSON.stringify(remote)) {
        await api.put(endpoint, { data: JSON.stringify({ completed: merged }) }, config);
      }
      if (alive.current) setStatus('saved');
    } catch (error) {
      if (alive.current) setStatus(error?.response?.status === 401 ? 'expired' : 'error');
    } finally { busy.current = false; }
  }
  useEffect(() => {
    alive.current = true;
    // Initial load and reconnects reconcile pending local changes with the server.
    const refresh = () => { void sync(); };
    if (user) refresh();
    window.addEventListener('online', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      alive.current = false;
      window.removeEventListener('online', refresh);
      window.removeEventListener('focus', refresh);
    };
    // Account identity is fixed for this mounted instance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return { data, status, toggle: sync, retry: () => sync(), disabled: !user || status === 'loading' || status === 'saving' || status === 'expired' };
}
