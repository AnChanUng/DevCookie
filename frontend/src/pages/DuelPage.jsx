import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import { TOPICS } from '../data/topicBank';
import { myNickname } from '../nickname';
import { visitorId } from '../track';

const CIRC = ['①', '②', '③', '④', '⑤'];
const SIZE = 10;
// 무료 서버가 잠들어 있으면 깨어나는 데 1분쯤 걸려서 넉넉히 기다린다
const SLOW = { timeout: 90000 };
const BY_ID = Object.fromEntries(TOPICS.questions.map(q => [q.id, q]));
const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

const shuffle = (arr) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// /duel 은 방 만들기, /duel/:code 는 그 방에서 같은 문제를 풀고 점수를 겨루는 화면
export default function DuelPage() {
  const { code } = useParams();
  return code ? <Room key={code} code={code.toUpperCase()} /> : <Lobby />;
}

function Lobby() {
  const navigate = useNavigate();
  const [subject, setSubject] = useState('all');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [join, setJoin] = useState('');

  const create = async () => {
    setBusy(true);
    setError('');
    const pool = TOPICS.questions.filter(q => subject === 'all' || q.sec === subject);
    try {
      const { data } = await api.post('/duels', { questionIds: shuffle(pool).slice(0, SIZE).map(q => q.id) }, SLOW);
      navigate(`/duel/${data.code}`);
    } catch {
      setError('방을 만들지 못했습니다. 서버가 깨어나는 중일 수 있으니 잠시 뒤에 다시 눌러 주세요.');
      setBusy(false);
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <Link to="/" className="back-link">← 홈으로</Link>
        <h1>1:1 대결</h1>
        <p>같은 {SIZE}문제를 풀고 점수를 겨룹니다. 방을 만들면 나오는 링크를 친구에게 보내세요.</p>
      </div>

      <div className="section-title">과목 고르기</div>
      <div className="exam-filters">
        <button type="button" className={`exam-btn sm ${subject === 'all' ? 'on' : ''}`} onClick={() => setSubject('all')}>전체</button>
        {Object.entries(TOPICS.sections).map(([k, s]) => (
          <button key={k} type="button" className={`exam-btn sm ${subject === k ? 'on' : ''}`} onClick={() => setSubject(k)}>{s.name}</button>
        ))}
      </div>
      <div className="exam-actions">
        <button type="button" className="exam-btn primary" disabled={busy} onClick={create}>{busy ? '방 만드는 중…' : '대결 방 만들기'}</button>
      </div>
      {error && <p className="exam-note">{error}</p>}

      <div className="section-title">받은 방 번호로 들어가기</div>
      <form className="exam-sync-form" onSubmit={e => { e.preventDefault(); if (join.trim()) navigate(`/duel/${join.trim().toUpperCase()}`); }}>
        <input type="text" placeholder="방 번호 6자리" maxLength={8} value={join} onChange={e => setJoin(e.target.value)} />
        <button type="submit" className="exam-btn sm" disabled={!join.trim()}>들어가기</button>
      </form>
    </div>
  );
}

function Room({ code }) {
  const me = useMemo(() => ({ visitorId: visitorId(), nickname: myNickname() }), []);
  const [room, setRoom] = useState(null); // { questions, players }
  const [status, setStatus] = useState('loading'); // loading | missing | error | ready
  const [started, setStarted] = useState(false);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState(null);
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);
  const startedAt = useRef(0);
  const link = `${window.location.origin}/duel/${code}`;
  const headers = { 'X-Visitor-Id': me.visitorId };

  useEffect(() => {
    let alive = true;
    api.get(`/duels/${code}`, { ...SLOW, headers })
      .then(({ data }) => {
        if (!alive) return;
        const questions = data.questionIds.map(id => BY_ID[id]).filter(Boolean);
        if (questions.length !== data.questionIds.length) { setStatus('missing'); return; }
        // 풀다가 새로고침했으면 서버에 남은 진행 상황에서 이어 간다
        const mine = data.players.find(p => p.me);
        if (mine) {
          setStarted(true);
          setIdx(mine.answered);
          setScore(mine.score);
          setDone(mine.done || mine.answered >= questions.length);
          startedAt.current = Date.now() - mine.seconds * 1000;
        }
        setRoom({ questions, players: data.players });
        setStatus('ready');
      })
      .catch(err => { if (alive) setStatus(err?.response?.status === 404 ? 'missing' : 'error'); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  // 상대의 진행 상황을 몇 초마다 다시 받아 온다
  useEffect(() => {
    if (status !== 'ready') return undefined;
    const timer = setInterval(() => {
      api.get(`/duels/${code}`, { headers, timeout: 8000 })
        .then(({ data }) => setRoom(r => (r ? { ...r, players: data.players } : r)))
        .catch(() => { /* 잠깐 끊겨도 다음 차례에 다시 받는다 */ });
    }, 3000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, code]);

  const report = (nextScore, answered, finished) => {
    const seconds = Math.floor((Date.now() - startedAt.current) / 1000);
    api.put(`/duels/${code}/players`, { ...me, score: nextScore, answered, done: finished, seconds }, { timeout: 15000 })
      .then(({ data }) => setRoom(r => (r ? { ...r, players: data.players } : r)))
      .catch(() => { /* 다음 문제에서 다시 올라간다 */ });
  };

  if (status === 'loading') return <div className="loading"><div className="loading-spinner" />대결 방을 여는 중...</div>;
  if (status !== 'ready') {
    return (
      <div className="fade-in">
        <div className="empty">
          <div className="empty-icon">🚪</div>
          {status === 'missing' ? '없는 방이거나 이 방의 문제를 찾을 수 없습니다.' : '서버에 연결하지 못했습니다. 잠시 뒤에 다시 열어 주세요.'}
        </div>
        <div className="exam-actions"><Link className="exam-btn" to="/duel">새 방 만들기</Link></div>
      </div>
    );
  }

  const total = room.questions.length;
  const q = room.questions[idx];

  const start = () => {
    startedAt.current = Date.now();
    setStarted(true);
    report(0, 0, false);
  };
  const choose = (i) => {
    if (picked !== null) return;
    setPicked(i);
    const nextScore = score + (i === q.a ? 1 : 0);
    setScore(nextScore);
    report(nextScore, idx + 1, idx + 1 === total);
  };
  const next = () => {
    setPicked(null);
    if (idx + 1 >= total) setDone(true);
    setIdx(idx + 1);
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(link); setCopied(true); } catch { setCopied(false); }
    setTimeout(() => setCopied(false), 1500);
  };

  const board = (
    <aside className="duel-board">
      <div className="duel-board-title">점수판 <span>{room.players.length}명</span></div>
      {room.players.length === 0 && <p className="duel-wait">아직 시작한 사람이 없습니다.</p>}
      <ol>
        {room.players.map((p, i) => (
          <li key={i} className={p.me ? 'me' : ''}>
            <span className="no">{i + 1}</span>
            <span className="nick">{p.nickname}{p.me && <em>나</em>}</span>
            <span className="st">{p.done ? fmt(p.seconds) : `${p.answered}/${total}`}</span>
            <b>{p.score}</b>
          </li>
        ))}
      </ol>
      <div className="duel-share">
        <span>친구에게 보낼 링크</span>
        <code>{link}</code>
        <button type="button" className="exam-btn sm" onClick={copy}>{copied ? '복사됨' : '링크 복사'}</button>
      </div>
    </aside>
  );

  return (
    <div className="fade-in exam-quiz">
      <div className="page-header">
        <Link to="/duel" className="back-link">← 1:1 대결</Link>
        <h1>대결 방 {code}</h1>
        <p>{total}문제 · 맞힌 수가 같으면 빨리 끝낸 사람이 위로 갑니다 · 내 이름: {me.nickname}</p>
      </div>
      <div className="exam-quiz-body">
        <div className="exam-quiz-main">
          {!started && (
            <div className="exam-qcard duel-ready">
              <p>준비되면 시작하세요. 시작하는 순간부터 시간이 흐르고, 상대가 들어오지 않아도 먼저 풀 수 있습니다.</p>
              <button type="button" className="exam-btn primary" onClick={start}>시작하기</button>
            </div>
          )}
          {started && !done && q && (
            <>
              <div className="exam-qhead"><span className="prog">{idx + 1} / {total}</span><span className="prog">맞힘 {score}</span></div>
              <div className="exam-pbar"><i style={{ width: `${Math.round(idx / total * 100)}%` }} /></div>
              <div className="exam-qcard">
                <div className="exam-qtop">
                  <span className="exam-chip sec">{TOPICS.sections[q.sec].name}</span>
                  <span className="exam-chip">{q.topic}</span>
                </div>
                {q.ctx && <div className="exam-ctx">{q.ctx}</div>}
                {q.code && <pre className="exam-code">{q.code}</pre>}
                <p className="exam-qtext">{q.q}</p>
                <ul className="exam-opts">
                  {q.o.map((opt, i) => {
                    let cls = 'exam-opt';
                    if (picked !== null) { if (i === q.a) cls += ' right'; else if (i === picked) cls += ' wrong'; }
                    return (
                      <li key={i}>
                        <button type="button" className={cls} disabled={picked !== null} onClick={() => choose(i)}>
                          <span className="no">{i + 1}</span><span className="tx">{opt}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
                {picked !== null && (
                  <>
                    <div className={`exam-expl ${picked === q.a ? 'ok' : 'bad'}`}>
                      <div className="lab">{picked === q.a ? '정답' : `오답 · 정답은 ${CIRC[q.a]}`}</div>
                      <div>{q.e}</div>
                    </div>
                    <div className="exam-actions">
                      <button type="button" className="exam-btn primary" onClick={next}>{idx + 1 < total ? '다음' : '결과 보기'}</button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
          {started && done && (
            <div className="exam-qcard duel-ready">
              <div className="exam-score"><span className="big">{score}</span><span className="of">/ {total}문제</span></div>
              <p>다 풀었습니다. 상대가 끝내면 오른쪽 점수판에 순위가 정해집니다.</p>
              <Link className="exam-btn" to="/duel">새 대결 만들기</Link>
            </div>
          )}
        </div>
        {board}
      </div>
    </div>
  );
}
