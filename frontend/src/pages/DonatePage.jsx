import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

// 기부받은 자료는 저장소의 기존 폴더 구조를 그대로 따른다
const KINDS = [
  { key: 'public', dir: '공기업 필기', title: '공기업·금융공기업 필기', desc: '기업 필기시험 복기·복원 자료' },
  { key: 'major', dir: '전공필기', title: '전공·자격증 필기', desc: '요약노트 · 개념정리 · 기출 모음' },
];

// 기부 내역을 한곳에 모아 두는 장부. 새 기부가 들어왔는지 이 파일만 보면 안다
const LEDGER = 'content/donations.json';
const REPO = { owner: 'AnChanUng', name: 'cs-study-platform', branch: 'master' };
const TOKEN_KEY = 'donate.gh.token';
const MAX_MB = 20;

const api = async (path, token, options = {}) => {
  const res = await fetch(`https://api.github.com/repos/${REPO.owner}/${REPO.name}${path}`, {
    ...options,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    },
  });
  if (res.status === 404) return null; // 아직 없는 파일
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message || `GitHub ${res.status}`);
  return body;
};

// 파일 내용을 GitHub contents API가 요구하는 base64로 바꾼다. 바이너리도 그대로 실린다
const toBase64 = (file) => new Promise((resolve, reject) => {
  const r = new FileReader();
  r.onload = () => resolve(String(r.result).split(',')[1]);
  r.onerror = () => reject(new Error('파일을 읽지 못했습니다.'));
  r.readAsDataURL(file);
});

const putFile = async (token, path, base64, message, sha) =>
  api(`/contents/${path.split('/').map(encodeURIComponent).join('/')}`, token, {
    method: 'PUT',
    body: JSON.stringify({ message, content: base64, branch: REPO.branch, ...(sha ? { sha } : {}) }),
  });

const today = () => new Date().toISOString().slice(0, 10);

export default function DonatePage() {
  const [token, setToken] = useState(() => { try { return localStorage.getItem(TOKEN_KEY) || ''; } catch { return ''; } });
  const [tokenInput, setTokenInput] = useState('');
  const [kind, setKind] = useState('public');
  const [label, setLabel] = useState('');
  const [note, setNote] = useState('');
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);
  const [error, setError] = useState('');
  const [ledger, setLedger] = useState(null);
  const fileRef = useRef(null);

  // 지금까지 들어온 기부 목록. 토큰 없이도 공개 저장소라 그냥 읽힌다
  useEffect(() => {
    fetch(`https://api.github.com/repos/${REPO.owner}/${REPO.name}/contents/${LEDGER}?ref=${REPO.branch}`, {
      headers: { Accept: 'application/vnd.github.raw' },
    })
      .then(r => (r.ok ? r.json() : []))
      .then(list => setLedger(Array.isArray(list) ? list : []))
      .catch(() => setLedger([]));
  }, [done]);

  const saveToken = () => {
    const t = tokenInput.trim();
    if (!t) return;
    try { localStorage.setItem(TOKEN_KEY, t); } catch { /* 저장 못 해도 이번 세션에는 쓸 수 있다 */ }
    setToken(t);
    setTokenInput('');
  };

  const forgetToken = () => {
    try { localStorage.removeItem(TOKEN_KEY); } catch { /* 무시 */ }
    setToken('');
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!file) return setError('올릴 파일을 골라 주세요.');
    if (file.size > MAX_MB * 1024 * 1024) return setError(`파일이 너무 큽니다. ${MAX_MB}MB 이하만 올릴 수 있습니다.`);
    if (!label.trim()) return setError('자료 이름을 적어 주세요. (예: 2026 상반기 코레일 복기)');

    setBusy(true);
    try {
      const dir = KINDS.find(k => k.key === kind).dir;
      const safe = file.name.replace(/[/\\?%*:|"<>]/g, '_');
      const path = `${dir}/${safe}`;

      // 같은 이름이 이미 있으면 덮어쓰지 않고 날짜를 붙여 새 파일로 남긴다
      const existing = await api(`/contents/${path.split('/').map(encodeURIComponent).join('/')}?ref=${REPO.branch}`, token);
      const finalPath = existing
        ? `${dir}/${safe.replace(/(\.[^.]+)?$/, (ext) => `_${today()}${ext || ''}`)}`
        : path;

      const base64 = await toBase64(file);
      await putFile(token, finalPath, base64, `자료 기부: ${label.trim()}`);

      // 장부에 한 줄 더한다. 새 기부 확인은 이 파일만 보면 된다
      const cur = await api(`/contents/${LEDGER}?ref=${REPO.branch}`, token);
      const prev = cur ? JSON.parse(decodeURIComponent(escape(atob(cur.content.replace(/\n/g, ''))))) : [];
      const entry = { at: new Date().toISOString(), kind, label: label.trim(), note: note.trim(), path: finalPath, size: file.size, handled: false };
      const next = [...(Array.isArray(prev) ? prev : []), entry];
      await putFile(token, LEDGER, btoa(unescape(encodeURIComponent(JSON.stringify(next, null, 2) + '\n'))), `자료 기부 장부: ${label.trim()}`, cur?.sha);

      setDone(entry);
      setFile(null); setLabel(''); setNote('');
      if (fileRef.current) fileRef.current.value = '';
    } catch (err) {
      setError(err.message || '업로드에 실패했습니다.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <Link to="/" className="back-link">← 홈으로</Link>
        <h1>🎁 자료 기부하기</h1>
        <p>복기·복원 자료나 요약노트를 올리면 저장소에 그대로 저장되고, 이를 바탕으로 새 문제은행을 만듭니다.</p>
      </div>

      {!token ? (
        <div className="donate-gate">
          <div className="section-title">먼저 GitHub 토큰을 등록해 주세요</div>
          <p className="exam-lede">
            올린 파일은 <b>{REPO.owner}/{REPO.name}</b> 저장소에 바로 커밋됩니다. 커밋 권한을 확인하기 위해 GitHub 토큰이 필요합니다.
            토큰은 <b>이 브라우저에만</b> 저장되고 서버로 전송되지 않습니다.
          </p>
          <ol className="donate-steps">
            <li>GitHub → Settings → Developer settings → Personal access tokens</li>
            <li>Fine-grained token 생성 · Repository access는 <b>{REPO.name}</b>만 선택</li>
            <li>Repository permissions에서 <b>Contents: Read and write</b> 부여</li>
          </ol>
          <div className="donate-row">
            <input
              type="password"
              className="donate-input"
              placeholder="github_pat_..."
              value={tokenInput}
              onChange={e => setTokenInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') saveToken(); }}
            />
            <button type="button" className="exam-btn primary" onClick={saveToken}>등록</button>
          </div>
        </div>
      ) : (
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
                <span className="d path">{k.dir}/</span>
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
              PDF · HWP · 이미지 · 텍스트 모두 가능합니다. 최대 {MAX_MB}MB.
              {file && ` · 선택됨: ${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB)`}
            </span>
          </label>

          {error && <p className="donate-error">{error}</p>}

          <div className="exam-actions">
            <button type="submit" className="exam-btn primary" disabled={busy}>
              {busy ? '올리는 중…' : '기부하기'}
            </button>
            <button type="button" className="exam-btn" onClick={forgetToken}>토큰 지우기</button>
          </div>

          {done && (
            <div className="donate-done">
              <b>고맙습니다. 올라갔습니다.</b>
              <span>{done.path}</span>
              <a href={`https://github.com/${REPO.owner}/${REPO.name}/blob/${REPO.branch}/${done.path.split('/').map(encodeURIComponent).join('/')}`} target="_blank" rel="noreferrer">
                GitHub에서 보기 →
              </a>
            </div>
          )}
        </form>
      )}

      {ledger && ledger.length > 0 && (
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
