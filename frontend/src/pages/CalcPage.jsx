import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CALC_GROUPS, generate } from '../data/calcGenerators';
import Simulator from '../components/Simulator';

const CIRC = ['①', '②', '③', '④'];

// 계산 문제 무한 연습. 풀 때마다 숫자를 새로 뽑아 문제를 만들므로 끝이 없고, 풀이 기록은 남기지 않는다
export default function CalcPage() {
  const [group, setGroup] = useState('all');
  const [q, setQ] = useState(() => generate('all'));
  const [picked, setPicked] = useState(null);
  const [tally, setTally] = useState({ right: 0, total: 0 });

  const next = (key = group) => { setQ(generate(key)); setPicked(null); };
  const choose = (i) => {
    if (picked !== null) return;
    setPicked(i);
    setTally(t => ({ right: t.right + (i === q.a ? 1 : 0), total: t.total + 1 }));
  };

  // 키보드: 숫자로 고르고 Enter·→ 로 다음 문제
  const keyRef = useRef(() => {});
  useEffect(() => {
    keyRef.current = (e) => {
      if (/^[1-4]$/.test(e.key)) { e.preventDefault(); choose(Number(e.key) - 1); }
      else if ((e.key === 'Enter' || e.key === 'ArrowRight') && picked !== null && e.target.tagName !== 'BUTTON') next();
    };
  });
  useEffect(() => {
    const onKey = (e) => { if (!e.ctrlKey && !e.metaKey && !e.altKey) keyRef.current(e); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="fade-in">
      <div className="page-header">
        <Link to="/exam" className="back-link">← 기업별 기출문제</Link>
        <h1>계산 문제 무한 연습</h1>
        <p>풀 때마다 숫자가 새로 바뀌는 계산 문제입니다. 정답과 풀이는 프로그램이 직접 계산하고, 스케줄링 · 페이지 교체 · 디스크 문제는 해설을 그림으로 한 단계씩 볼 수 있습니다.</p>
      </div>

      <div className="exam-filters">
        <button type="button" className={`exam-btn sm ${group === 'all' ? 'on' : ''}`} onClick={() => { setGroup('all'); next('all'); }}>전체</button>
        {CALC_GROUPS.map(g => (
          <button key={g.key} type="button" title={g.sub} className={`exam-btn sm ${group === g.key ? 'on' : ''}`} onClick={() => { setGroup(g.key); next(g.key); }}>{g.name}</button>
        ))}
      </div>

      <div className="exam-qhead">
        <span className="prog">이번에 푼 문제 {tally.total}</span>
        <span className="prog">맞힘 {tally.right}{tally.total > 0 && ` (${Math.round(tally.right / tally.total * 100)}%)`}</span>
      </div>

      <div className="exam-qcard">
        <div className="exam-qtop"><span className="exam-chip sec">{q.topic}</span></div>
        {q.ctx && <div className="exam-ctx">{q.ctx}</div>}
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
              {q.sim && <Simulator key={q.q} sim={q.sim} />}
            </div>
            <div className="exam-actions">
              <button type="button" className="exam-btn primary" onClick={() => next()}>다음 문제</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
