import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { visitorId } from '../track';
import { NICKNAME_MAX, cleanNickname, saveNickname, savedNickname } from '../nickname';

const MEDALS = ['🥇', '🥈', '🥉'];

// 이 브라우저에 남은 풀이 기록에서 한 번이라도 푼 문제를 센다. 같은 문제를 여러 번 풀어도 한 문제다
function solvedCount() {
  let count = 0;
  try {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('exam-progress:')) {
        try { count += Object.keys(JSON.parse(localStorage.getItem(key))?.stats || {}).length; } catch { /* 깨진 기록은 건너뛴다 */ }
      } else if (key.startsWith('cospro:solved:') && localStorage.getItem(key) === 'pass') {
        count++;
      }
    }
  } catch {
    /* storage unavailable */
  }
  return count;
}

// 문제를 많이 푼 사람 순위. 지금까지 푼 문제 수를 서버에 알리고 순위를 받아 온다
export default function SolveRank() {
  const [rank, setRank] = useState(null);
  const [naming, setNaming] = useState(false);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [tick, setTick] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let stale = false;
    const id = visitorId();
    const count = solvedCount();
    // 내 문제 수를 먼저 알린 뒤 순위를 받는다. 잠든 서버가 깨어나는 동안에도 기다렸다가 보여 준다
    const report = id && count > 0
      ? api.put('/rank/solved', { visitorId: id, count }, { timeout: 180000 }).catch(() => {})
      : Promise.resolve();
    report
      .then(() => api.get('/rank/solved', { headers: id ? { 'X-Visitor-Id': id } : {}, timeout: 180000 }))
      .then(res => { if (!stale) setRank(res.data); })
      .catch(() => { if (!stale) setFailed(true); });
    return () => { stale = true; };
  }, [tick]);

  // 서버가 끝내 순위를 주지 못하면 자리만 차지하지 않게 비워 둔다
  if (failed && !rank) return null;

  const save = (e) => {
    e.preventDefault();
    const name = cleanNickname(draft);
    const id = visitorId();
    if (!name || !id) return;
    setError('');
    api.put('/profile', { visitorId: id, nickname: name }, { timeout: 20000 })
      .then(() => { saveNickname(name); setNaming(false); setTick(t => t + 1); })
      .catch(err => setError(err.response?.data?.error || '저장하지 못했습니다.'));
  };

  // 5위 밖이면 내 기록을 목록 아래에 한 줄 덧붙인다
  const me = rank?.me;
  const rows = rank ? (me && !rank.top.some(r => r.me) ? [...rank.top, { ...me, me: true }] : rank.top) : [];

  return (
    <aside className="solve-rank">
      <div className="solve-rank-head">
        <h2>🏆 순위</h2>
        <span>지금까지 푼 문제 수</span>
      </div>

      {!rank && <p className="solve-rank-empty">순위를 불러오는 중...</p>}
      {rank && rows.length === 0 && <p className="solve-rank-empty">아직 순위가 없습니다. 첫 번째로 이름을 올려 보세요.</p>}
      {rows.length > 0 && (
        <ol className="solve-rank-list">
          {rows.map(r => (
            <li key={r.rank} className={r.me ? 'me' : ''}>
              <span className="solve-rank-no">{MEDALS[r.rank - 1] || r.rank}</span>
              <span className="solve-rank-name">{r.nickname}{r.me && <em>나</em>}</span>
              <span className="solve-rank-count">{r.count.toLocaleString()}문제</span>
            </li>
          ))}
        </ol>
      )}

      {rank && !me && (
        <p className="solve-rank-empty"><Link to="/exam">한 세트 풀고</Link> 순위에 올라 보세요.</p>
      )}

      {rank && (naming ? (
        <form className="solve-rank-nick" onSubmit={save}>
          <input value={draft} onChange={e => setDraft(e.target.value)} maxLength={NICKNAME_MAX} placeholder="순위에 보일 닉네임" autoFocus aria-label="닉네임" />
          <button type="submit">저장</button>
          <button type="button" onClick={() => setNaming(false)}>취소</button>
          {error && <span className="solve-rank-error" role="alert">{error}</span>}
        </form>
      ) : (
        <div className="solve-rank-nick">
          <span>
            {rank.nickname
              ? <>내 닉네임 <b>{rank.nickname}</b></>
              : me ? <>익명 닉네임 <b>{me.nickname}</b></> : '닉네임을 정하지 않으면 익명 닉네임으로 나옵니다.'}
          </span>
          <button type="button" onClick={() => { setDraft(rank.nickname || savedNickname()); setNaming(true); }}>
            {rank.nickname ? '바꾸기' : '닉네임 정하기'}
          </button>
        </div>
      ))}
    </aside>
  );
}
