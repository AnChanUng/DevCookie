import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

// 기부받은 자료는 저장소의 기존 폴더 구조를 그대로 따른다
const KINDS = [
  { key: 'public', dir: '공기업 필기', title: '공기업·금융공기업 필기', desc: '기업 필기시험 복기·복원 자료' },
  { key: 'major', dir: '전공필기', title: '전공·자격증 필기', desc: '요약노트 · 개념정리 · 기출 모음' },
];

const MAX_MB = 20;

// 같은 사람이 하루에 몇 번 올렸는지 세는 용도. 기기마다 한 번 만들어 두고 계속 쓴다
const visitorId = () => {
  try {
    let v = localStorage.getItem('visitorId');
    if (!v) { v = Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem('visitorId', v); }
    return v;
  } catch { return 'anon'; }
};

export default function DonatePage() {
  const [kind, setKind] = useState('public');
  const [label, setLabel] = useState('');
  const [note, setNote] = useState('');
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);
  const [error, setError] = useState('');
  const [ledger, setLedger] = useState([]);
  const fileRef = useRef(null);

  // 지금까지 들어온 기부 목록
  useEffect(() => {
    api.get('/donations')
      .then(r => setLedger(Array.isArray(r.data) ? r.data : []))
      .catch(() => setLedger([]));
  }, [done]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!file) return setError('올릴 파일을 골라 주세요.');
    if (file.size > MAX_MB * 1024 * 1024) return setError(`파일이 너무 큽니다. ${MAX_MB}MB 이하만 올릴 수 있습니다.`);
    if (!label.trim()) return setError('자료 이름을 적어 주세요. (예: 2026 상반기 코레일 복기)');

    const form = new FormData();
    form.append('file', file);
    form.append('kind', kind);
    form.append('label', label.trim());
    form.append('note', note.trim());

    setBusy(true);
    try {
      // 잠들어 있던 무료 서버가 깨어나는 데 시간이 걸릴 수 있어 넉넉히 기다린다
      const res = await api.post('/donations', form, {
        headers: { 'X-Visitor-Id': visitorId() },
        timeout: 180000,
      });
      setDone(res.data);
      setFile(null); setLabel(''); setNote('');
      if (fileRef.current) fileRef.current.value = '';
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || '업로드에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <Link to="/" className="back-link">← 홈으로</Link>
        <h1>🎁 자료 기부하기</h1>
        <p>복기·복원 자료나 요약노트를 올려 주세요. 그대로 보관되고, 이를 바탕으로 새 문제은행을 만듭니다.</p>
      </div>

      <form className="donate-form" onSubmit={submit}>
        <div className="section-title">자료 올리기</div>

        <div className="donate-kinds">
          {KINDS.map(k => (
            <button
              key={k.key}
              type="button"
              className={`donate-kind ${kind === k.key ? 'on' : ''}`}
              onClick={() => setKind(k.key)}
            >
              <span className="t">{k.title}</span>
              <span className="d">{k.desc}</span>
            </button>
          ))}
        </div>

        <label className="donate-field">
          <span className="donate-label">자료 이름 <b>*</b></span>
          <input
            className="donate-input"
            placeholder="예: 2026 하반기 농협손해보험 복기"
            value={label}
            onChange={e => setLabel(e.target.value)}
          />
        </label>

        <label className="donate-field">
          <span className="donate-label">메모 (선택)</span>
          <input
            className="donate-input"
            placeholder="예: 전공 30문항, DB 비중이 높았음"
            value={note}
            onChange={e => setNote(e.target.value)}
          />
        </label>

        <label className="donate-field">
          <span className="donate-label">파일 <b>*</b></span>
          <input
            ref={fileRef}
            type="file"
            className="donate-file"
            onChange={e => { setFile(e.target.files?.[0] || null); setError(''); }}
          />
          <span className="donate-hint">
            PDF · HWP · 문서 · 이미지 · 압축 파일을 받습니다. 최대 {MAX_MB}MB.
            {file && ` · 선택됨: ${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB)`}
          </span>
        </label>

        {error && <p className="donate-error">{error}</p>}

        <div className="exam-actions">
          <button type="submit" className="exam-btn primary" disabled={busy}>
            {busy ? '올리는 중…' : '기부하기'}
          </button>
        </div>
        {busy && <p className="donate-hint">서버가 잠들어 있으면 처음 한 번은 1분 남짓 걸릴 수 있습니다. 창을 닫지 말고 기다려 주세요.</p>}

        {done && (
          <div className="donate-done">
            <b>고맙습니다. 잘 받았습니다.</b>
            <span>{done.path}</span>
          </div>
        )}
      </form>

      {ledger.length > 0 && (
        <>
          <div className="section-title">기부해 주신 자료 {ledger.length}건</div>
          <div className="exam-table-wrap">
            <table className="exam-table">
              <thead><tr><th>날짜</th><th>자료</th><th>분류</th><th>문제 제작</th></tr></thead>
              <tbody>
                {ledger.slice().reverse().map((d, i) => (
                  <tr key={i}>
                    <td>{d.at?.slice(0, 10)}</td>
                    <td>{d.label}{d.note ? ` · ${d.note}` : ''}</td>
                    <td>{KINDS.find(k => k.key === d.kind)?.title || d.kind}</td>
                    <td>{d.handled ? '문제은행 반영됨' : '대기 중'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
