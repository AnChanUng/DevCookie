import { useCallback, useEffect, useRef, useState } from 'react';
import api from '../api';
import { useAuth } from '../contexts/useAuth';

const EMPTY = { stats: {}, history: [], updatedAt: 0 };
// 백엔드(Render)가 잠들어 있다 깨어나는 시간을 감안한 타임아웃
const SYNC_TIMEOUT = 60000;
const RETRY_DELAY = 15000;
// 비로그인 기록은 company 키에, 로그인 기록은 계정별 키에 따로 둔다 (같은 브라우저에서 계정이 바뀌어도 섞이지 않게)
const localKey = (company, userId) => (userId ? `exam-progress:${company}:${userId}` : `exam-progress:${company}`);

function readLocal(company, userId) {
  try {
    const raw = localStorage.getItem(localKey(company, userId));
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : { ...EMPTY };
  } catch {
    return { ...EMPTY };
  }
}

function writeLocal(company, userId, data) {
  try {
    localStorage.setItem(localKey(company, userId), JSON.stringify(data));
  } catch {
    /* storage unavailable */
  }
}

function takeGuest(company) {
  const guest = readLocal(company, null);
  try {
    localStorage.removeItem(localKey(company, null));
  } catch {
    /* storage unavailable */
  }
  return guest;
}

// 두 기기의 기록을 합친다: 문제별로는 더 최근 풀이를, 응시 이력은 합집합을 남긴다
export function mergeProgress(a, b) {
  if (!a) return b;
  if (!b) return a;
  const stats = { ...a.stats };
  for (const [qid, s] of Object.entries(b.stats || {})) {
    if (!stats[qid] || (s.at || 0) > (stats[qid].at || 0)) stats[qid] = s;
  }
  const seen = new Set();
  const history = [...(a.history || []), ...(b.history || [])]
    .filter(h => {
      const key = `${h.at}:${h.mode}:${h.sec ?? ''}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((x, y) => x.at - y.at)
    .slice(-200);
  return { stats, history, updatedAt: Math.max(a.updatedAt || 0, b.updatedAt || 0) };
}

const sameProgress = (a, b) => JSON.stringify([a.stats, a.history]) === JSON.stringify([b.stats, b.history]);

// 로그인 직후에는 로그인 전에 풀었던 기록을 계정 쪽으로 옮겨서 읽는다
function loadLocal(company, userId) {
  const local = readLocal(company, userId);
  if (!userId) return local;
  const guest = takeGuest(company);
  if (!guest.updatedAt) return local;
  const merged = mergeProgress(local, guest);
  writeLocal(company, userId, merged);
  return merged;
}

export function useExamProgress(company) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const key = localKey(company, userId);
  const [state, setState] = useState(() => ({ key, data: loadLocal(company, userId), sync: 'syncing' }));
  if (state.key !== key) setState({ key, data: loadLocal(company, userId), sync: 'syncing' });
  const data = state.key === key ? state.data : EMPTY;

  const pushTimer = useRef(null);
  const retry = useRef(null);
  const latest = useRef(data);
  useEffect(() => { latest.current = data; }, [data]);

  const setSync = useCallback((sync) => setState(prev => (prev.key === key ? { ...prev, sync } : prev)), [key]);

  const push = useCallback((payload, delay = 400) => {
    if (!userId) return;
    clearTimeout(pushTimer.current);
    pushTimer.current = setTimeout(async () => {
      setSync('syncing');
      try {
        await api.put(`/exam/progress/${company}`, { data: JSON.stringify(payload) }, { timeout: SYNC_TIMEOUT });
        setSync('cloud');
      } catch {
        setSync('error');
        // 실패해도 기록은 브라우저에 남아 있으므로 최신 상태로 다시 시도한다
        retry.current?.(latest.current, RETRY_DELAY);
      }
    }, delay);
  }, [company, userId, setSync]);

  useEffect(() => {
    retry.current = push;
    return () => clearTimeout(pushTimer.current);
  }, [push]);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    api.get(`/exam/progress/${company}`, { timeout: SYNC_TIMEOUT })
      .then(res => {
        if (cancelled) return;
        const remote = res.data?.data ? { ...EMPTY, ...JSON.parse(res.data.data) } : null;
        const merged = mergeProgress(latest.current, remote);
        const needsPush = remote ? !sameProgress(merged, remote) : !!merged.updatedAt;
        latest.current = merged;
        writeLocal(company, userId, merged);
        setState(prev => (prev.key === key ? { ...prev, data: merged, sync: needsPush ? prev.sync : 'cloud' } : prev));
        if (needsPush) push(merged, 0);
      })
      .catch(() => { if (!cancelled) setSync('error'); });
    return () => { cancelled = true; };
  }, [company, userId, key, push, setSync]);

  const save = useCallback((updater) => {
    const next = { ...(typeof updater === 'function' ? updater(latest.current) : updater), updatedAt: Date.now() };
    latest.current = next;
    writeLocal(company, userId, next);
    setState(prev => (prev.key === key ? { ...prev, data: next } : prev));
    push(next);
  }, [company, userId, key, push]);

  return { data, save, sync: userId ? state.sync : 'local', loggedIn: !!userId };
}

export function recordAnswer(stats, qid, correct) {
  const prev = stats[qid] || { c: 0, w: 0, last: null };
  return {
    ...stats,
    [qid]: { c: prev.c + (correct ? 1 : 0), w: prev.w + (correct ? 0 : 1), last: correct ? 'r' : 'w', at: Date.now() },
  };
}
