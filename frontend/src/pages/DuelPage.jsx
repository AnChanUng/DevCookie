import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import { TOPICS } from '../data/topicBank';
import { myNickname } from '../nickname';
import { recordAnswer, useExamProgress } from '../hooks/useExamProgress';
import { visitorId } from '../track';
import Code from '../components/Code';
import { account } from '../sync';
import './DuelPage.css';

const CIRC = ['①', '②', '③', '④', '⑤'];
const SIZE = 10;
// 무료 서버가 잠들어 있으면 깨어나는 데 1분쯤 걸려서 넉넉히 기다린다
const SLOW = { timeout: 90000 };
const BY_ID = Object.fromEntries(TOPICS.questions.map(q => [q.id, q]));
const clock = (ms) => { const d = new Date(ms); return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`; };
const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

const shuffle = (arr) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// 상대와의 전적. 방마다 상대 닉네임별 결과(w·l·d)를 이 브라우저에 적어 두고 닉네임 기준으로 합친다
const RECORD_KEY = 'duel:record';
function loadRecord() {
  try { return JSON.parse(localStorage.getItem(RECORD_KEY)) || {}; } catch { return {}; }
}
function tallyOf(record, nickname) {
  const t = { w: 0, l: 0, d: 0 };
  for (const room of Object.values(record)) if (room[nickname]) t[room[nickname]]++;
  return t;
}
const tallyText = (t) => [t.w && `${t.w}승`, t.l && `${t.l}패`, t.d && `${t.d}무`].filter(Boolean).join(' ');

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
  const [rooms, setRooms] = useState(null); // 지금 열려 있는 단체전
  const [record, setRecord] = useState(null);
  const [recordError, setRecordError] = useState(false);
  useEffect(() => {
    let alive = true;
    api.get('/duels/record', { ...SLOW, headers: { 'X-Visitor-Id': visitorId() } })
      .then(({data}) => { if(alive) setRecord(data); })
      .catch(() => { if(alive) setRecordError(true); });
    return () => { alive = false; };
  }, []);

  // 열린 단체전 목록은 몇 초마다 새로 받는다
  useEffect(() => {
    let alive = true;
    const load = () => api.get('/duels/open', { timeout: 20000 })
      .then(({ data }) => { if (alive && Array.isArray(data)) setRooms(data); })
      .catch(() => { if (alive) setRooms(r => r || []); });
    load();
    const timer = setInterval(load, 5000);
    return () => { alive = false; clearInterval(timer); };
  }, []);

  // open이면 목록에 올라가 누구나 들어오는 단체전, 아니면 링크를 받은 사람만 들어오는 방
  const create = async (open) => {
    setBusy(true);
    setError('');
    const pool = TOPICS.questions.filter(q => subject === 'all' || q.sec === subject);
    const title = subject === 'all' ? '전체 과목' : TOPICS.sections[subject].name;
    try {
      const { data } = await api.post('/duels', { questionIds: shuffle(pool).slice(0, SIZE).map(q => q.id), open, title }, SLOW);
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
        <h1>대결</h1>
        <p>같은 {SIZE}문제를 풀고 점수를 겨룹니다. 친구와 붙으려면 1:1 방을, 여럿이 붙으려면 누구나 들어오는 단체전을 여세요.</p>
      </div>

      <section className="duel-career" aria-label="누적 대결 전적">
        <h2>나의 누적 전적</h2>
        <p>현재 브라우저 참가 기록 · 2명 이상이 모두 완료한 대결 기준</p>
        {!record && <p>{recordError ? '전적을 불러오지 못했습니다. 새로고침해 주세요.' : '전적을 불러오는 중…'}</p>}
        {record && <><div className="duel-stats"><div><b>{record.total}</b><span>총 대결</span></div><div className="win"><b>{record.wins}</b><span>승리</span></div><div className="loss"><b>{record.losses}</b><span>패배</span></div><div><b>{record.draws}</b><span>무승부</span></div><div><b>{record.total ? Math.round(record.wins/record.total*100) : 0}%</b><span>승률</span></div></div>
        <div className="duel-recent">{record.recent.map(r => <Link key={r.code} to={`/duel/${r.code}`}><strong className={r.result}>{({win:'승리',loss:'패배',draw:'무승부'})[r.result]}</strong><span>{r.code} · {r.score}점 · {fmt(r.seconds)}</span><span>결과 보기 →</span></Link>)}</div>
        {!record.total && <p>첫 대결을 완료하고 전적을 쌓아 보세요.</p>}</>}
      </section>

      <div className="section-title">과목 고르기</div>
      <div className="exam-filters">
        <button type="button" className={`exam-btn sm ${subject === 'all' ? 'on' : ''}`} onClick={() => setSubject('all')}>전체</button>
        {Object.entries(TOPICS.sections).map(([k, s]) => (
          <button key={k} type="button" className={`exam-btn sm ${subject === k ? 'on' : ''}`} onClick={() => setSubject(k)}>{s.name}</button>
        ))}
      </div>
      <div className="exam-actions">
        <button type="button" className="exam-btn primary" disabled={busy} onClick={() => create(true)}>{busy ? '방 만드는 중…' : '단체전 열기 (누구나 참가)'}</button>
        <button type="button" className="exam-btn" disabled={busy} onClick={() => create(false)}>1:1 방 만들기 (링크로 초대)</button>
      </div>
      {error && <p className="exam-note">{error}</p>}

      <div className="section-title">열려 있는 단체전</div>
      {rooms === null && <p className="exam-note">목록을 불러오는 중입니다…</p>}
      {rooms?.length === 0 && <p className="exam-note">지금 열려 있는 단체전이 없습니다. 위에서 하나 열어 보세요.</p>}
      {rooms?.length > 0 && (
        <div className="exam-sections">
          {rooms.map(r => (
            <Link key={r.code} to={`/duel/${r.code}`} className="exam-section duel-room">
              <span className="t">{r.title || '대결'}</span>
              <span className="d">{r.total}문제 · {r.players}명 참가 중</span>
              <span className="d">방 {r.code} · {clock(r.createdAt)}에 열림</span>
            </Link>
          ))}
        </div>
      )}

      <div className="section-title">받은 방 번호로 들어가기</div>
      <form className="exam-sync-form" onSubmit={e => { e.preventDefault(); if (join.trim()) navigate(`/duel/${join.trim().toUpperCase()}`); }}>
        <input type="text" placeholder="방 번호 6자리" maxLength={8} value={join} onChange={e => setJoin(e.target.value)} />
        <button type="submit" className="exam-btn sm" disabled={!join.trim()}>들어가기</button>
      </form>
    </div>
  );
}

function Room({ code }) {
  const me = useMemo(() => ({ visitorId: visitorId(), nickname: account()?.nickname || myNickname() }), []);
  const [room, setRoom] = useState(null); // { questions, players }
  const [status, setStatus] = useState('loading'); // loading | missing | error | ready
  const [started, setStarted] = useState(false);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState(null);
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);
  const [invite, setInvite] = useState(''); // 채팅방에 올린 결과 안내
  const [record, setRecord] = useState(loadRecord);
  const [rematching, setRematching] = useState(false);
  const [marks, setMarks] = useState(''); // 내가 푼 순서대로의 정오답 ("1011…")
  const [openRow, setOpenRow] = useState(null); // 복기 표에서 펼친 문제
  // 대결 문제는 주제별 통합 문제집의 문제라서, 틀린 것을 그 문제집의 오답으로 넘길 수 있다
  const { save: saveTopics } = useExamProgress('topics');
  const [savedWrong, setSavedWrong] = useState(false);
  const navigate = useNavigate();
  const startedAt = useRef(0);
  const lastReport = useRef(null);
  const reportBusy = useRef(false);
  const [reportError, setReportError] = useState(false);
  const link = `${window.location.origin}/duel/${code}`;
  const headers = { 'X-Visitor-Id': me.visitorId };

  useEffect(() => {
    let alive = true;
    api.post(`/duels/${code}/join`, me, SLOW)
      .then(() => api.get(`/duels/${code}`, { ...SLOW, headers }))
      .then(({ data }) => {
        if (!alive) return;
        const questions = data.questionIds.map(id => BY_ID[id]).filter(Boolean);
        if (questions.length !== data.questionIds.length) { setStatus('missing'); return; }
        // 풀다가 새로고침했으면 서버에 남은 진행 상황에서 이어 간다
        const mine = data.players.find(p => p.me);
        if (mine?.started) {
          setStarted(true);
          setIdx(mine.answered);
          setScore(mine.score);
          setMarks(mine.marks || '');
          setDone(mine.done || mine.answered >= questions.length);
          startedAt.current = Date.now() - mine.seconds * 1000;
        }
        setRoom({ questions, players: data.players, nextCode: data.nextCode, open: !!data.open, title: data.title });
        setStatus('ready');
      })
      .catch(err => { if (alive) setStatus(err?.response?.status === 404 ? 'missing' : 'error'); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  // 상대의 진행 상황을 몇 초마다 다시 받아 온다
  useEffect(() => {
    if (status !== 'ready') return undefined;
    let alive = true, fetching = false;
    const timer = setInterval(() => {
      flushReport();
      if (fetching || document.hidden) return;
      fetching = true;
      api.get(`/duels/${code}`, { headers, timeout: 8000 })
        .then(({ data }) => { if(alive) setRoom(r => (r ? { ...r, players: data.players, nextCode: data.nextCode } : r)); })
        .catch(() => { /* Retry on next poll. */ }).finally(() => { fetching = false; });
    }, 1500);
    const heartbeat = setInterval(() => {
      if(!document.hidden) api.post(`/duels/${code}/join`, me, {timeout:10000}).catch(() => {});
    }, 15000);
    return () => { alive = false; clearInterval(timer); clearInterval(heartbeat); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, code]);

  // 나와 상대가 모두 끝냈으면 이 방의 승패를 한 번 적어 둔다. 점수판 순서(맞힌 수 → 걸린 시간)가 곧 순위다
  useEffect(() => {
    const players = room?.players || [];
    const mine = players.find(p => p.me);
    if (!mine?.done) return;
    const result = {};
    for (const p of players) {
      if (p.me || !p.done) continue;
      result[p.nickname] = p.score === mine.score && p.seconds === mine.seconds ? 'd'
        : (mine.score > p.score || (mine.score === p.score && mine.seconds < p.seconds)) ? 'w' : 'l';
    }
    if (!Object.keys(result).length) return;
    const saved = loadRecord();
    if (JSON.stringify(saved[code]) === JSON.stringify(result)) return;
    const next = { ...saved, [code]: result };
    try { localStorage.setItem(RECORD_KEY, JSON.stringify(next)); } catch { /* storage unavailable */ }
    setRecord(next);
  }, [room, code]);

  const flushReport = () => {
    const payload = lastReport.current;
    if (!payload || reportBusy.current) return;
    reportBusy.current = true;
    api.put(`/duels/${code}/players`, payload, {timeout:15000})
      .then(({data}) => {
        if(lastReport.current === payload) lastReport.current = null;
        setReportError(false);
        setRoom(r => r ? {...r, players:data.players} : r);
      }).catch(() => setReportError(true)).finally(() => { reportBusy.current = false; });
  };
  const report = (nextScore, answered, finished, nextMarks) => {
    const seconds = Math.floor((Date.now() - startedAt.current) / 1000);
    // 새로고침 뒤에는 앞 문제의 정오답을 모르므로, 길이가 맞을 때만 함께 올린다
    const withMarks = nextMarks.length === answered ? { marks: nextMarks } : {};
    lastReport.current = { ...me, score: nextScore, answered, done: finished, seconds, ...withMarks };
    flushReport();
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
  const settled = room.players.length >= 2 && room.players.every(p => p.done);
  const mine = room.players.find(p => p.me);
  const top = room.players[0];
  const tiedTop = top ? room.players.filter(p => p.score === top.score && p.seconds === top.seconds) : [];
  const outcome = !settled || !mine?.done ? 'waiting' : tiedTop.some(p => p.me) ? (tiedTop.length > 1 ? 'draw' : 'win') : 'loss';
  const q = room.questions[idx];

  const start = () => {
    startedAt.current = Date.now();
    setStarted(true);
    report(0, 0, false, '');
  };
  const choose = (i) => {
    if (picked !== null) return;
    setPicked(i);
    const nextScore = score + (i === q.a ? 1 : 0);
    setScore(nextScore);
    const nextMarks = marks + (i === q.a ? '1' : '0');
    setMarks(nextMarks);
    report(nextScore, idx + 1, idx + 1 === total, nextMarks);
  };
  const next = () => {
    setPicked(null);
    if (idx + 1 >= total) setDone(true);
    setIdx(idx + 1);
  };
  // 사이트 채팅방에 초대 글을 올린다. 채팅은 글 속의 /duel/방번호 를 참가 버튼으로 바꿔 보여 준다
  const postInvite = async () => {
    const secs = new Set(room.questions.map(x => x.sec));
    const subject = secs.size === 1 ? TOPICS.sections[[...secs][0]].name : '전체 과목';
    setInvite('올리는 중…');
    try {
      await api.post('/lounge/messages', { ...me, text: `⚔️ ${subject} ${total}문제 대결 열었어요. 같이 풀어요! /duel/${code}` }, { timeout: 20000 });
      setInvite('채팅방에 올렸습니다.');
    } catch (err) {
      setInvite(err?.response?.data?.error || '올리지 못했습니다. 잠시 뒤에 다시 눌러 주세요.');
    }
  };
  // 같은 과목에서 새 문제를 뽑아 다음 방을 연다. 상대가 먼저 열었으면 그 방으로 간다
  const rematch = async () => {
    setRematching(true);
    const secs = new Set(room.questions.map(x => x.sec));
    const pool = TOPICS.questions.filter(x => secs.has(x.sec) && !room.questions.includes(x));
    try {
      const { data } = await api.post(`/duels/${code}/rematch`, { questionIds: shuffle(pool).slice(0, total).map(x => x.id) }, SLOW);
      navigate(`/duel/${data.code}`);
    } catch {
      setRematching(false);
    }
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(link); setCopied(true); } catch { setCopied(false); }
    setTimeout(() => setCopied(false), 1500);
  };

  const myWrong = marks.length === total ? room.questions.filter((_, n) => marks[n] === '0') : [];
  const saveWrong = () => {
    saveTopics(prev => ({ ...prev, stats: myWrong.reduce((stats, x) => recordAnswer(stats, x.id, false), prev.stats) }));
    setSavedWrong(true);
  };

  // 다 푼 사람끼리 문제별로 누가 맞고 틀렸는지 견주어 본다. 서버는 끝낸 사람에게만 정오답을 준다
  const reviewers = room.players.filter(p => p.done && typeof p.marks === 'string' && p.marks.length === total);
  const review = started && done && reviewers.some(p => p.me) && (
    <div className="duel-review">
      <div className="section-title">문제별 복기</div>
      <p className="exam-lede">
        {reviewers.length > 1
          ? '결과가 갈린 문제는 색으로 표시했습니다. 문제를 누르면 정답과 해설이 펼쳐집니다.'
          : '상대가 다 풀면 문제별로 누가 맞았는지 나란히 볼 수 있습니다. 문제를 누르면 정답과 해설이 펼쳐집니다.'}
      </p>
      {myWrong.length > 0 && (
        <div className="exam-actions">
          <button type="button" className="exam-btn primary" disabled={savedWrong} onClick={saveWrong}>
            {savedWrong ? `오답노트에 저장했습니다 (${myWrong.length}문제)` : `내가 틀린 ${myWrong.length}문제 오답노트에 저장`}
          </button>
          {savedWrong && <Link className="exam-btn" to="/topics">주제별 통합에서 다시 풀기 →</Link>}
        </div>
      )}
      <div className="exam-table-wrap">
        <table className="exam-table duel-review-table">
          <thead>
            <tr><th>#</th><th>문제</th>{reviewers.map((p, i) => <th key={i} className="mk">{p.me ? '나' : p.nickname}</th>)}</tr>
          </thead>
          <tbody>
            {room.questions.map((x, n) => {
              const split = new Set(reviewers.map(p => p.marks[n])).size > 1;
              return [
                <tr key={n} className={`${split ? 'split' : ''}${openRow === n ? ' open' : ''}`} onClick={() => setOpenRow(openRow === n ? null : n)}>
                  <td className="num">{n + 1}</td>
                  <td><b>{x.topic}</b><span>{x.q}</span></td>
                  {reviewers.map((p, i) => <td key={i} className={`mk ${p.marks[n] === '1' ? 'r' : 'w'}`}>{p.marks[n] === '1' ? '○' : '✕'}</td>)}
                </tr>,
                openRow === n && (
                  <tr key={`${n}-open`} className="detail">
                    <td />
                    <td colSpan={reviewers.length + 1}>
                      {x.ctx && <div className="exam-ctx">{x.ctx}</div>}
                      {x.code && <Code code={x.code} />}
                      <div className="ans">정답 {CIRC[x.a]} {x.o[x.a]}</div>
                      <div className="ex">{x.e}</div>
                    </td>
                  </tr>
                ),
              ];
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const board = (
    <aside className="duel-board">
      <div className="duel-board-title">{!started ? '실시간 대기실' : '실시간 점수판'} <span>{room.players.length}명</span></div>
      {room.players.length === 0 && <p className="duel-wait">아직 시작한 사람이 없습니다.</p>}
      <ol>
        {room.players.map((p, i) => (
          <li key={i} className={p.me ? 'me' : ''}>
            <span className="no">{p.started ? i + 1 : '·'}</span>
            <span className="nick">{p.nickname}{p.me && <em>나</em>}{!p.me && tallyText(tallyOf(record, p.nickname)) && <small>내 상대전적 {tallyText(tallyOf(record, p.nickname))}</small>}</span>
            <span className="st">{p.done ? (settled ? (tiedTop.includes(p) ? (tiedTop.length > 1 ? '공동 1위' : '승리') : '패배') : '완료') : !p.started ? '대기 중' : `${p.answered}/${total}`}</span>
            <b>{p.score}</b>
          </li>
        ))}
      </ol>
      <div className="duel-share">
        <span>친구에게 보낼 링크</span>
        <code>{link}</code>
        <button type="button" className="exam-btn sm" onClick={copy}>{copied ? '복사됨' : '링크 복사'}</button>
        <button type="button" className="exam-btn sm primary" onClick={postInvite}>채팅방에 올리기</button>
        {invite && <span className="duel-invite-msg">{invite}</span>}
      </div>
    </aside>
  );

  return (
    <div className="fade-in exam-quiz duel-page">
      <div className="page-header">
        <Link to="/duel" className="back-link">← 대결</Link>
        <h1>{room.open ? '단체전' : '1:1 대결'} · {room.title ? `${room.title} · ` : ''}방 {code}</h1>
        <p>{total}문제 · 맞힌 수가 같으면 빨리 끝낸 사람이 위로 갑니다 · 내 이름: {me.nickname}</p>
      </div>
      {room.nextCode && !(started && done) && (
        <div className="exam-resume">
          <div className="exam-resume-text"><strong>재대결 방이 열렸습니다</strong><span>이 방을 끝낸 사람이 새 문제로 한 판 더를 열었습니다.</span></div>
          <Link className="exam-btn primary" to={`/duel/${room.nextCode}`}>참가하기</Link>
        </div>
      )}
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
                {q.code && <Code code={q.code} />}
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
          {reportError && <p role="alert" className="exam-note">진행 기록 전송을 다시 시도하고 있습니다. 저장될 때까지 이 화면을 유지해 주세요.</p>}
          {started && done && (
            <div className={`exam-qcard duel-ready duel-result ${outcome}`}>
              <span className="duel-result-icon" aria-hidden="true">{({win:'🏆',loss:'🌱',draw:'🤝',waiting:'⏳'})[outcome]}</span>
              <h2>{({win:'승리했습니다!',loss:'아쉽게 패배했습니다',draw:'무승부입니다!',waiting:'결과를 기다리고 있어요'})[outcome]}</h2>
              <div className="exam-score"><span className="big">{score}</span><span className="of">/ {total}문제</span></div>
              <p>{settled ? `우승: ${tiedTop.map(p => p.nickname).join(', ')} · ${top.score}점 · ${fmt(top.seconds)}. 점수 우선, 동점이면 소요 시간으로 결정합니다.` : '참가자들이 모두 완료하면 승패가 표시됩니다. 혼자 푼 대결은 전적에 포함되지 않습니다.'}</p>
              {mine?.done && <p>나의 기록 · {fmt(mine.seconds)} · {room.players.length}명 참가</p>}
              <div className="exam-actions">
                {room.nextCode
                  ? <Link className="exam-btn primary" to={`/duel/${room.nextCode}`}>열린 재대결 방으로 →</Link>
                  : <button type="button" className="exam-btn primary" disabled={rematching} onClick={rematch}>{rematching ? '여는 중…' : '같은 사람들과 한 판 더'}</button>}
                <Link className="exam-btn" to="/duel">새 대결 만들기</Link>
              </div>
            </div>
          )}
        </div>
        {board}
      </div>
      {review}
    </div>
  );
}
