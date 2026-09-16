import { useCallback, useEffect, useRef, useState } from 'react';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';

const EMPTY = { stats: {}, history: [], updatedAt: 0 };
const localKey = (company) => `exam-progress:${company}`;

function readLocal(company) {
  try {
    const raw = localStorage.getItem(localKey(company));
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : { ...EMPTY };
  } catch {
    return { ...EMPTY };
  }
}

function writeLocal(company, data) {
  try {
    localStorage.setItem(localKey(company), JSON.stringify(data));
  } catch {
    /* storage unavailable */
  }
}

export function useExamProgress(company) {
  const { user } = useAuth();
  const [data, setData] = useState(() => readLocal(company));
  const [sync, setSync] = useState('syncing');
  const pushTimer = useRef(null);
  const latest = useRef(data);
  useEffect(() => { latest.current = data; }, [data]);

  const push = useCallback((payload) => {
    if (!user) return;
    clearTimeout(pushTimer.current);
    pushTimer.current = setTimeout(async () => {
      setSync('syncing');
      try {
        await api.put(`/exam/progress/${company}`, { userId: user.id, data: JSON.stringify(payload) });
        setSync('cloud');
      } catch {
        setSync('error');
      }
    }, 400);
  }, [company, user]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    api.get(`/exam/progress/${company}`, { params: { userId: user.id } })
      .then(res => {
        if (cancelled) return;
        const remote = res.data?.data ? JSON.parse(res.data.data) : null;
        const local = latest.current;
        if (remote && (remote.updatedAt || 0) >= (local.updatedAt || 0)) {
          setData(remote);
          writeLocal(company, remote);
          setSync('cloud');
        } else if (local.updatedAt) {
          push(local);
        } else {
          setSync('cloud');
        }
      })
      .catch(() => { if (!cancelled) setSync('error'); });
    return () => { cancelled = true; };
  }, [company, user, push]);

  const save = useCallback((updater) => {
    setData(prev => {
      const next = { ...(typeof updater === 'function' ? updater(prev) : updater), updatedAt: Date.now() };
      writeLocal(company, next);
      push(next);
      return next;
    });
  }, [company, push]);

  return { data, save, sync: user ? sync : 'local', loggedIn: !!user };
}

export function recordAnswer(stats, qid, correct) {
  const prev = stats[qid] || { c: 0, w: 0, last: null };
  return {
    ...stats,
    [qid]: { c: prev.c + (correct ? 1 : 0), w: prev.w + (correct ? 0 : 1), last: correct ? 'r' : 'w', at: Date.now() },
  };
}
