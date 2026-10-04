import { useMemo, useState } from 'react';
import { TOPICS } from '../data/topicBank';
import { theoryFor } from '../theory';

const CIRC = ['①', '②', '③', '④', '⑤'];
const baseTopic = (q) => (q.topic || '').split(' · ')[0];

// 같은 이론 글에 걸리거나 주제 이름이 같은 문제를 다른 문제집에서 찾는다
function candidatesFor(q) {
  const theory = theoryFor(q)?.id;
  const topic = baseTopic(q);
  return TOPICS.questions.filter(x =>
    x.q !== q.q && (theory ? theoryFor(x)?.id === theory : baseTopic(x) === topic));
}

// 틀린 직후 같은 주제의 다른 문제를 그 자리에서 한 번 더 푼다. 연습용이라 풀이 기록에는 남기지 않는다
export default function SimilarQuestion({ q }) {
  const pool = useMemo(() => candidatesFor(q), [q]);
  const [order, setOrder] = useState(null); // 섞어 둔 후보 순서
  const [at, setAt] = useState(0);
  const [picked, setPicked] = useState(null);
  if (!pool.length) return null;

  const open = () => setOrder(pool.map((_, i) => i).sort(() => Math.random() - 0.5));
  if (!order) {
    return (
      <div className="exam-similar-bar">
        <button type="button" className="exam-btn sm" onClick={open}>🔁 같은 주제 문제 한 번 더 ({pool.length})</button>
      </div>
    );
  }

  const s = pool[order[at]];
  const done = picked !== null;
  return (
    <div className="exam-similar">
      <div className="exam-similar-head">같은 주제 문제 {at + 1} / {pool.length} <span>{s.topic}</span></div>
      {s.ctx && <div className="exam-ctx">{s.ctx}</div>}
      <div className="exam-qtext">{s.q}</div>
      {s.code && <pre className="exam-code">{s.code}</pre>}
      <ul className="exam-opts">
        {s.o.map((opt, i) => {
          let cls = 'exam-opt';
          if (done) { if (i === s.a) cls += ' right'; else if (i === picked) cls += ' wrong'; }
          return (
            <li key={i}>
              <button type="button" className={cls} disabled={done} onClick={() => setPicked(i)}>
                <span className="no">{i + 1}</span><span className="tx">{opt}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {done && (
        <>
          <div className="exam-similar-result">{picked === s.a ? '정답' : `오답 · 정답은 ${CIRC[s.a]}`}</div>
          <div className="exam-similar-ex">{s.e}</div>
          {at < pool.length - 1 && (
            <div className="exam-similar-bar">
              <button type="button" className="exam-btn sm" onClick={() => { setAt(at + 1); setPicked(null); }}>하나 더</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
