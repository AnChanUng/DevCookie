import { useEffect, useState } from 'react';
import { theoryFor } from '../theory';

const CIRC = ['①', '②', '③', '④', '⑤'];
const KEY = 'today-cs';

// 오늘 날짜(이 기기 기준)와, 날짜마다 달라지는 번호. 같은 날에는 누구에게나 같은 문제가 나온다
function today() {
  const d = new Date();
  const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const days = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
  return { date, days };
}

function loadPicked(date) {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    return saved?.date === date && Number.isInteger(saved.picked) ? saved.picked : null;
  } catch {
    return null;
  }
}

// 첫 화면의 "오늘의 CS": 하루에 한 문제를 그 자리에서 풀고 해설까지 본다.
// 문제 데이터는 커서 첫 화면이 뜬 뒤에 따로 받아 온다
export default function TodayCs() {
  const [{ date, days }] = useState(today);
  const [q, setQ] = useState(null);
  const [picked, setPicked] = useState(() => loadPicked(date));

  useEffect(() => {
    let alive = true;
    import('../data/topicBank').then(({ TOPICS }) => {
      if (!alive) return;
      // 시험에 자주 나오는 핵심 주제(이론 글이 있는 주제: 교착상태 · 정규화 · 트랜잭션 · TCP 등)에서만 뽑고,
      // 코드나 지문이 붙은 긴 문제는 빼서 한눈에 읽히는 문제만 낸다
      const pool = TOPICS.questions.filter(x => theoryFor(x) && !x.code && !x.ctx && x.q.length <= 90);
      const pickedQ = pool[(days * 7919) % pool.length];
      setQ({ ...pickedQ, area: TOPICS.sections[pickedQ.sec].name });
    }).catch(() => { /* 못 받으면 카드를 그리지 않는다 */ });
    return () => { alive = false; };
  }, [days]);

  if (!q) return null;

  const choose = (i) => {
    if (picked !== null) return;
    setPicked(i);
    try { localStorage.setItem(KEY, JSON.stringify({ date, picked: i })); } catch { /* storage unavailable */ }
  };
  const done = picked !== null;

  return (
    <section className="today-cs">
      <div className="today-cs-head">
        <b>오늘의 CS</b>
        <span>{date.slice(5).replace('-', '.')} · {q.area}</span>
        {done && <em className={picked === q.a ? 'ok' : 'bad'}>{picked === q.a ? '정답' : '오답'}</em>}
      </div>
      <p className="today-cs-q">{q.q}</p>
      <ul className="today-cs-opts">
        {q.o.map((opt, i) => {
          let cls = '';
          if (done) { if (i === q.a) cls = 'right'; else if (i === picked) cls = 'wrong'; }
          return (
            <li key={i}>
              <button type="button" className={cls} disabled={done} onClick={() => choose(i)}>
                <span>{CIRC[i]}</span>{opt}
              </button>
            </li>
          );
        })}
      </ul>
      {done && <p className="today-cs-ex">{q.e}</p>}
    </section>
  );
}
