import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { visitorId } from '../track';
import { NICKNAME_MAX, cleanNickname, saveNickname, savedNickname } from '../nickname';

const MEDALS = ['🥇', '🥈', '🥉'];
const ANONYMOUS = '익명의 수험생';

// 문제를 매일 푼 사람 순위. 하루에 한 세트라도 끝까지 풀면 그날은 푼 날로 센다
export default function StreakRank() {
  const [rank, setRank] = useState(null);
  const [naming, setNaming] = useState(false);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let stale = false;
    const id = visitorId();
    // 잠든 서버가 깨어나는 동안에도 기다렸다가 보여 준다
    api.get('/rank/streak', { headers: id ? { 'X-Visitor-Id': id } : {}, timeout: 180000 })
      .then(res => { if (!stale) setRank(res.data); })
      .catch(() => {});
    return () => { stale = true; };
  }, [tick]);

  // 서버가 아직 순위를 주지 못하면 자리만 차지하지 않게 비워 둔다
  if (!rank) return null;

  const nickname = rank.nickname || savedNickname();

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

  return (
    <section className="streak">
      <div className="streak-head">
        <div>
          <h2>🔥 매일 푸는 사람들</h2>
          <p>하루에 한 세트라도 끝까지 풀면 하루로 셉니다. 오늘까지 이어진 연속 일수 순위예요.</p>
        </div>
        <div className="streak-me">
          {rank.me
            ? <><b>{rank.me.streak}일 연속</b><span>{rank.me.rank}위{rank.me.today ? '' : ' · 오늘 풀면 이어져요'}</span></>
            : <><b>0일</b><span><Link to="/exam">오늘 한 세트 풀고</Link> 순위에 올라 보세요</span></>}
        </div>
      </div>

      {rank.top.length ? (
        <ol className="streak-list">
          {rank.top.map(r => (
            <li key={r.rank} className={r.me ? 'me' : ''}>
              <span className="streak-rank">{MEDALS[r.rank - 1] || r.rank}</span>
              <span className="streak-name">{r.nickname || ANONYMOUS}{r.me && <em>나</em>}</span>
              <span className="streak-days">{r.streak}일 연속</span>
              <span className={`streak-today${r.today ? ' done' : ''}`}>{r.today ? '오늘 완료' : '오늘 아직'}</span>
            </li>
          ))}
        </ol>
      ) : <p className="streak-empty">아직 순위가 없습니다. 오늘 첫 번째로 이름을 올려 보세요.</p>}

      {naming ? (
        <form className="streak-nick" onSubmit={save}>
          <input value={draft} onChange={e => setDraft(e.target.value)} maxLength={NICKNAME_MAX} placeholder="순위에 보일 닉네임" autoFocus aria-label="닉네임" />
          <button type="submit">저장</button>
          <button type="button" onClick={() => setNaming(false)}>취소</button>
          {error && <span className="streak-error" role="alert">{error}</span>}
        </form>
      ) : (
        <div className="streak-nick">
          <span>{rank.nickname ? <>내 닉네임 <b>{rank.nickname}</b></> : '닉네임을 정하지 않으면 익명으로 나옵니다.'}</span>
          <button type="button" onClick={() => { setDraft(nickname); setNaming(true); }}>{rank.nickname ? '바꾸기' : '닉네임 정하기'}</button>
        </div>
      )}
    </section>
  );
}
