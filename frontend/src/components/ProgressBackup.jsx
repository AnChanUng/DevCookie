import { useRef, useState } from 'react';
import { COMPANIES } from '../data/examQuestions';
import { useAuth } from '../contexts/useAuth';
import { mergeProgress } from '../hooks/useExamProgress';

const localKey = (company, userId) => (userId ? `exam-progress:${company}:${userId}` : `exam-progress:${company}`);

function readAll(userId) {
  const out = {};
  for (const c of COMPANIES) {
    try {
      const raw = localStorage.getItem(localKey(c.key, userId));
      if (raw) out[c.key] = JSON.parse(raw);
    } catch {
      /* skip unreadable entry */
    }
  }
  return out;
}

const fmtDate = () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}`;
};

// 브라우저·서버 저장과 별개로, 풀이 기록 전체를 JSON 파일로 내려받거나 다시 합쳐 넣는 세 번째 안전장치
export default function ProgressBackup() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const fileRef = useRef(null);
  const [msg, setMsg] = useState('');

  const download = () => {
    const data = readAll(userId);
    const companies = Object.keys(data);
    if (!companies.length) { setMsg('아직 저장된 풀이 기록이 없습니다.'); return; }
    const payload = { app: 'cs-exam-progress', version: 1, exportedAt: new Date().toISOString(), nickname: user?.nickname ?? null, progress: data };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exam-progress-${user?.nickname ?? 'guest'}-${fmtDate()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    const wrong = companies.reduce((n, k) => n + Object.values(data[k].stats || {}).filter(s => s.last === 'w').length, 0);
    setMsg(`${companies.length}개 회사 기록(현재 오답 ${wrong}문제)을 내려받았습니다.`);
  };

  const restore = async (file) => {
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      if (parsed?.app !== 'cs-exam-progress' || !parsed.progress) throw new Error('format');
      let merged = 0;
      for (const [key, incoming] of Object.entries(parsed.progress)) {
        if (!COMPANIES.some(c => c.key === key)) continue;
        const k = localKey(key, userId);
        let current = null;
        try { current = JSON.parse(localStorage.getItem(k)); } catch { /* treat as empty */ }
        // 기존 기록을 덮어쓰지 않고 합친다 (문제별로는 더 최근 풀이, 응시 이력은 합집합)
        const next = mergeProgress(current || { stats: {}, history: [], marks: {}, updatedAt: 0 }, incoming);
        localStorage.setItem(k, JSON.stringify({ ...next, updatedAt: Date.now() }));
        merged++;
      }
      setMsg(`${merged}개 회사 기록을 합쳤습니다. 각 회사 페이지를 열면 계정에도 다시 저장됩니다.`);
    } catch {
      setMsg('이 사이트에서 내려받은 백업 파일이 아닙니다.');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="exam-backup">
      <div className="exam-backup-text">
        <strong>풀이 기록 백업</strong>
        <span>오답·북마크·응시 이력은 브라우저와 {user ? '계정' : '(로그인 시) 계정'}에 저장됩니다. 파일로도 남겨 두면 기기를 바꾸거나 기록이 지워져도 되돌릴 수 있습니다.</span>
      </div>
      <div className="exam-backup-actions">
        <button type="button" className="exam-btn sm" onClick={download}>JSON으로 내려받기</button>
        <button type="button" className="exam-btn sm" onClick={() => fileRef.current?.click()}>백업 파일 합치기</button>
        <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={e => restore(e.target.files?.[0])} />
      </div>
      {msg && <div className="exam-backup-msg">{msg}</div>}
    </div>
  );
}
