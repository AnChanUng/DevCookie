import { useCallback, useEffect, useRef, useState } from 'react';

// marks: 북마크. 오답 기록(stats)과 별도로 저장해 한쪽이 유실돼도 다시 풀 문제를 찾을 수 있게 한다
const EMPTY = { stats: {}, history: [], marks: {}, updatedAt: 0 };
// 기록은 이 브라우저의 로컬 저장소에만 둔다. 예전 계정별 키(`:userId` 접미사)는 첫 로드 때 흡수한다
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

// 두 기기의 기록을 합친다: 문제별로는 더 최근 풀이를, 응시 이력은 합집합을 남긴다
export function mergeProgress(a, b) {
  if (!a) return b;
  if (!b) return a;
  const stats = { ...a.stats };
  for (const [qid, s] of Object.entries(b.stats || {})) {
    if (!stats[qid] || (s.at || 0) > (stats[qid].at || 0)) stats[qid] = s;
  }
  const marks = { ...(a.marks || {}) };
  for (const [qid, m] of Object.entries(b.marks || {})) {
    if (!marks[qid] || (m.at || 0) > (marks[qid].at || 0)) marks[qid] = m;
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
  return { stats, history, marks, updatedAt: Math.max(a.updatedAt || 0, b.updatedAt || 0) };
}

// 예전에 로그인 상태로 저장된 계정별 기록이 남아 있으면 브라우저 기록과 합쳐서 가져온다
function absorbAccountRecords(company) {
  const prefix = `${localKey(company, null)}:`;
  let merged = readLocal(company, null);
  let found = false;
  try {
    for (const k of Object.keys(localStorage)) {
      if (!k.startsWith(prefix)) continue;
      try { merged = mergeProgress(merged, { ...EMPTY, ...JSON.parse(localStorage.getItem(k)) }); } catch { /* skip */ }
      localStorage.removeItem(k);
      found = true;
    }
  } catch {
    /* storage unavailable */
  }
  if (found) writeLocal(company, null, merged);
  return merged;
}

export function useExamProgress(company) {
  const [state, setState] = useState(() => ({ company, data: absorbAccountRecords(company) }));
  if (state.company !== company) setState({ company, data: absorbAccountRecords(company) });
  const data = state.company === company ? state.data : EMPTY;
  const latest = useRef(data);
  useEffect(() => { latest.current = data; }, [data]);

  const save = useCallback((updater) => {
    const next = { ...(typeof updater === 'function' ? updater(latest.current) : updater), updatedAt: Date.now() };
    latest.current = next;
    writeLocal(company, null, next);
    setState(prev => (prev.company === company ? { ...prev, data: next } : prev));
  }, [company]);

  return { data, save };
}

export const isMarked = (data, qid) => !!data.marks?.[qid]?.on;

// 해제도 시각과 함께 남겨서 다른 기기의 오래된 북마크가 되살아나지 않게 한다
export function toggleMark(marks, qid) {
  return { ...(marks || {}), [qid]: { on: !marks?.[qid]?.on, at: Date.now() } };
}

export function recordAnswer(stats, qid, correct) {
  const prev = stats[qid] || { c: 0, w: 0, last: null };
  return {
    ...stats,
    [qid]: { c: prev.c + (correct ? 1 : 0), w: prev.w + (correct ? 0 : 1), last: correct ? 'r' : 'w', at: Date.now() },
  };
}
