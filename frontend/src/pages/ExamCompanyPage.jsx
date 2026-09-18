import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { COMPANIES, CPP_GROUPS } from '../data/examQuestions';
import { useExamProgress, recordAnswer, isMarked, toggleMark } from '../hooks/useExamProgress';

const CIRC = ['①', '②', '③', '④', '⑤'];

const shuffle = (arr) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const fmtT = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
const fmtDate = (ts) => {
  const d = new Date(ts);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
};
const modeLabel = (sections, mode, sec) =>
  mode === 'exam' ? '실전 모의고사'
    : mode === 'wrong' ? '오답 다시 풀기'
    : mode === 'marked' ? '북마크 다시 풀기'
    : mode === 'cpp' ? `C++ 집중 문제집 · ${sec === 'all' ? '전체' : CPP_GROUPS[sec]?.name || ''}`
    : `영역별 연습 · ${sections[sec]?.name || ''}`;

export default function ExamCompanyPage() {
  const { company: key } = useParams();
  const company = COMPANIES.find(c => c.key === key);
  if (!company || !company.ready) return <Navigate to="/exam" replace />;
  return <CompanyExam company={company} />;
}

function CompanyExam({ company }) {
  const Q = company.questions;
  const SECTIONS = company.sections;
  const secKeys = Object.keys(SECTIONS).filter(k => !SECTIONS[k].extra); // 모의고사 채점 영역
  const label = (mode, sec) => modeLabel(SECTIONS, mode, sec);
  const CPP = useMemo(() => company.extra || [], [company]); // C++ 집중 문제집 (모의고사 미포함)
  const ALL = useMemo(() => [...Q, ...CPP], [Q, CPP]);       // 오답노트·오답 다시 풀기 범위
  const byId = useMemo(() => Object.fromEntries(ALL.map(q => [q.id, q])), [ALL]);
  const { data, save, sync, loggedIn } = useExamProgress(company.key);
  const [view, setView] = useState({ name: 'home' });

  const wrongIds = ALL.filter(q => data.stats[q.id]?.last === 'w').map(q => q.id);
  const everWrongIds = ALL.filter(q => (data.stats[q.id]?.w || 0) > 0).map(q => q.id);
  const markedIds = ALL.filter(q => isMarked(data, q.id)).map(q => q.id);
  const onMark = (qid) => save(prev => ({ ...prev, marks: toggleMark(prev.marks, qid) }));

  const start = (mode, ids, sec) => {
    if (!ids.length) return;
    setView({ name: 'quiz', mode, sec, ids });
    window.scrollTo({ top: 0 });
  };

  const finish = (quiz, answers, aborted) => {
    const isExam = quiz.mode === 'exam';
    let score = 0;
    const secScore = Object.fromEntries(secKeys.map(k => [k, 0]));
    const items = [];
    let stats = data.stats;
    quiz.ids.forEach(id => {
      const q = byId[id];
      const a = answers[id];
      if (a === undefined && aborted) return;
      const ok = a === q.a;
      if (isExam) stats = recordAnswer(stats, id, ok);
      if (ok) { score++; if (q.sec in secScore) secScore[q.sec]++; }
      items.push({ q, a, ok });
    });
    if (items.length) {
      const entry = { at: Date.now(), mode: quiz.mode, sec: quiz.sec, score, total: items.length, sections: isExam ? secScore : undefined };
      save(prev => ({ ...prev, stats, history: [...prev.history, entry].slice(-200) }));
    }
    setView({ name: 'result', result: { mode: quiz.mode, sec: quiz.sec, score, total: items.length, secScore, items, elapsed: Math.floor((Date.now() - quiz.startedAt) / 1000) } });
    window.scrollTo({ top: 0 });
  };

  const recordPractice = (qid, correct) => save(prev => ({ ...prev, stats: recordAnswer(prev.stats, qid, correct) }));

  const syncLabel = { local: '이 브라우저에만 저장', syncing: '저장 중…', cloud: '계정에 저장됨', error: '서버 저장 실패 · 브라우저에 보관' }[sync];

  const header = (title, links = true) => (
    <div className="page-header exam-page-header">
      <Link to="/exam" className="back-link">← 기출문제</Link>
      {links && (
        <div className="exam-toplinks">
          <button type="button" className={view.name === 'wrongbook' ? 'on' : ''} onClick={() => setView({ name: 'wrongbook' })}>틀린문제 모아보기 {everWrongIds.length}</button>
          <button type="button" className={view.name === 'markbook' ? 'on' : ''} onClick={() => setView({ name: 'markbook' })}>북마크 모아보기 {markedIds.length}</button>
        </div>
      )}
      <h1>{title}</h1>
      <div className={`exam-sync ${sync}`}><i />{syncLabel}{!loggedIn && ' · 로그인하면 계정에 저장됩니다'}</div>
    </div>
  );

  if (view.name === 'quiz') {
    return (
      <Quiz
        key={view.ids.join(',')}
        byId={byId}
        stats={data.stats}
        mode={view.mode}
        sec={view.sec}
        sections={SECTIONS}
        minutes={company.minutes}
        ids={view.ids}
        onPractice={recordPractice}
        onFinish={finish}
        header={(t) => header(t, false)}
        marks={data.marks}
        onMark={onMark}
      />
    );
  }

  if (view.name === 'result') {
    const r = view.result;
    const wrongs = r.items.filter(x => !x.ok);
    return (
      <div className="fade-in">
        {header('채점 결과')}
        <p className="exam-eyebrow">{label(r.mode, r.sec)} · 소요 {fmtT(r.elapsed)}</p>
        <div className="exam-score"><span className="big">{r.score}</span><span className="of">/ {r.total}문제 · {r.total ? Math.round(r.score / r.total * 100) : 0}%</span></div>
        {r.mode === 'exam' && (
          <div className="exam-stats">
            {secKeys.map(k => <StatTile key={k} k={SECTIONS[k].name} v={r.secScore[k]} of={Q.filter(q => q.sec === k).length} />)}
          </div>
        )}
        <div className="exam-actions">
          {wrongs.length > 0 && <button className="exam-btn primary" onClick={() => start('wrong', shuffle(wrongs.map(x => x.q.id)))}>틀린 {wrongs.length}문제 바로 다시 풀기</button>}
          <button className="exam-btn" onClick={() => setView({ name: 'home' })}>{company.abbr} 메인으로</button>
        </div>
        <ReviewList items={r.items} sections={SECTIONS} defaultFilter={wrongs.length ? 'wrong' : 'all'} marks={data.marks} onMark={onMark} />
      </div>
    );
  }

  if (view.name === 'wrongbook') {
    return (
      <div className="fade-in">
        {header('틀린문제 모아보기')}
        <p className="exam-lede">한 번이라도 틀린 문제입니다. 마지막 풀이에서 맞힌 문제는 "해결"로 표시되고, 아직 틀린 상태인 문제만 "오답 다시 풀기"에 나옵니다.</p>
        <div className="exam-actions">
          {wrongIds.length > 0 && <button className="exam-btn primary" onClick={() => start('wrong', shuffle(wrongIds))}>미해결 {wrongIds.length}문제 다시 풀기</button>}
          <button className="exam-btn" onClick={() => setView({ name: 'home' })}>{company.abbr} 메인으로</button>
        </div>
        <WrongBook Q={ALL} ids={everWrongIds} stats={data.stats} sections={SECTIONS} marks={data.marks} onMark={onMark} />
      </div>
    );
  }

  if (view.name === 'markbook') {
    return (
      <div className="fade-in">
        {header('북마크 모아보기')}
        <p className="exam-lede">별표(★)로 표시해 둔 문제입니다. 오답 기록과는 따로 저장되므로, 틀린 문제 기록이 지워지더라도 여기서 다시 풀 수 있습니다. 별표를 다시 누르면 해제됩니다.</p>
        <div className="exam-actions">
          {markedIds.length > 0 && <button className="exam-btn primary" onClick={() => start('marked', shuffle(markedIds))}>북마크 {markedIds.length}문제 다시 풀기</button>}
          <button className="exam-btn" onClick={() => setView({ name: 'home' })}>{company.abbr} 메인으로</button>
        </div>
        <MarkBook Q={ALL} ids={markedIds} stats={data.stats} sections={SECTIONS} marks={data.marks} onMark={onMark} />
      </div>
    );
  }

  const exams = data.history.filter(h => h.mode === 'exam');
  const best = exams.length ? Math.max(...exams.map(h => h.score)) : null;
  const last = exams.length ? exams[exams.length - 1].score : null;

  return (
    <div className="fade-in">
      {header(company.name)}
      <p className="exam-lede">{company.lede}</p>

      <div className="exam-stats">
        <StatTile k="모의고사 응시" v={exams.length} unit="회" />
        <StatTile k="최고 점수" v={best ?? '–'} of={Q.length} />
        <StatTile k="최근 점수" v={last ?? '–'} of={Q.length} />
        <StatTile k="현재 오답" v={wrongIds.length} unit="문제" />
      </div>

      <div className="exam-modes">
        <button className="exam-mode primary" onClick={() => start('exam', Q.map(q => q.id))}>
          <span><span className="t">실전 모의고사</span><span className="d">{Q.length}문제 · {company.minutes}분 타이머 · 실제 영역 순서로 출제, 고르면 바로 정답·해설</span></span>
          <span className="n">{Q.length}문항</span>
        </button>
        <button className="exam-mode" disabled={!wrongIds.length} onClick={() => start('wrong', shuffle(wrongIds))}>
          <span><span className="t">오답 다시 풀기</span><span className="d">마지막에 틀린 문제만 모아서 즉시 채점 · 맞히면 오답에서 빠집니다</span></span>
          <span className="n">{wrongIds.length}문항</span>
        </button>
        <button className="exam-mode" disabled={!markedIds.length} onClick={() => start('marked', shuffle(markedIds))}>
          <span><span className="t">북마크 다시 풀기</span><span className="d">풀다가 ★로 표시한 문제만 모아서 즉시 채점 · 오답 기록과 별도로 저장</span></span>
          <span className="n">{markedIds.length}문항</span>
        </button>
      </div>

      <div className="section-title">영역별 연습</div>
      <div className="exam-sections">
        {Object.entries(SECTIONS).filter(([, s]) => !s.extra).map(([k, s]) => {
          const qs = Q.filter(q => q.sec === k);
          const done = qs.filter(q => data.stats[q.id]).length;
          const right = qs.filter(q => data.stats[q.id]?.last === 'r').length;
          return (
            <button key={k} className="exam-section" onClick={() => start('practice', shuffle(qs.map(q => q.id)), k)}>
              <span className="t">{s.name}</span>
              <span className="d">{s.sub}</span>
              <span className="d">{qs.length}문제 · 최근 정답 {right}/{done}</span>
              <span className="bar"><i style={{ width: `${qs.length ? Math.round(right / qs.length * 100) : 0}%` }} /></span>
            </button>
          );
        })}
      </div>

      {CPP.length > 0 && (
        <>
          <div className="section-title">C++ 집중 문제집</div>
          <p className="exam-lede">HF 프로그래밍 영역에서 자주 나오는 C++ 실행 결과·개념 문제 {CPP.length}문항. 모의고사 60문제와는 별도이며, 한 문제씩 즉시 채점되고 틀린 문제는 오답노트에 함께 쌓입니다.</p>
          <div className="exam-sections">
            <button className="exam-section cpp" onClick={() => start('cpp', shuffle(CPP.map(q => q.id)), 'all')}>
              <span className="t">전체 문제 풀기</span>
              <span className="d">세 분야를 섞어서 무작위 순서로 출제</span>
              <span className="d">{CPP.length}문제 · 최근 정답 {CPP.filter(q => data.stats[q.id]?.last === 'r').length}/{CPP.filter(q => data.stats[q.id]).length}</span>
              <span className="bar"><i style={{ width: `${Math.round(CPP.filter(q => data.stats[q.id]?.last === 'r').length / CPP.length * 100)}%` }} /></span>
            </button>
            {Object.entries(CPP_GROUPS).map(([k, g]) => {
              const qs = CPP.filter(q => q.grp === k);
              const done = qs.filter(q => data.stats[q.id]).length;
              const right = qs.filter(q => data.stats[q.id]?.last === 'r').length;
              return (
                <button key={k} className="exam-section cpp" onClick={() => start('cpp', shuffle(qs.map(q => q.id)), k)}>
                  <span className="t">{g.name}</span>
                  <span className="d">{g.sub}</span>
                  <span className="d">{qs.length}문제 · 최근 정답 {right}/{done}</span>
                  <span className="bar"><i style={{ width: `${qs.length ? Math.round(right / qs.length * 100) : 0}%` }} /></span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {data.history.length > 0 && (
        <>
          <div className="section-title">응시 기록</div>
          <div className="exam-table-wrap">
            <table className="exam-table">
              <thead><tr><th>일시</th><th>유형</th><th>점수</th><th>{secKeys.map(k => SECTIONS[k].short).join(' · ')}</th></tr></thead>
              <tbody>
                {data.history.slice().reverse().slice(0, 15).map((h, i) => (
                  <tr key={i}>
                    <td>{fmtDate(h.at)}</td>
                    <td>{label(h.mode, h.sec)}</td>
                    <td className="num">{h.score} / {h.total}</td>
                    <td className="num">{h.sections ? secKeys.map(k => h.sections[k] ?? 0).join('·') : '–'}</td>
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

function StatTile({ k, v, of, unit }) {
  return (
    <div className="exam-stat">
      <div className="k">{k}</div>
      <div className="v">{v}<small>{of !== undefined ? ` / ${of}` : unit}</small></div>
    </div>
  );
}

function Quiz({ byId, stats, mode, sec, ids, sections, minutes, onPractice, onFinish, header, marks, onMark }) {
  const EXAM_SECONDS = minutes * 60;
  const isExam = mode === 'exam';
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [revealed, setRevealed] = useState({});
  const [left, setLeft] = useState(EXAM_SECONDS);
  const startedAt = useRef(Date.now());
  const quiz = { mode, sec, ids, startedAt: startedAt.current };
  const answersRef = useRef(answers);
  answersRef.current = answers;

  useEffect(() => {
    if (!isExam) return;
    const t = setInterval(() => {
      const remain = Math.max(0, EXAM_SECONDS - Math.floor((Date.now() - startedAt.current) / 1000));
      setLeft(remain);
      if (remain <= 0) {
        clearInterval(t);
        alert(`${minutes}분이 종료되었습니다. 자동으로 채점합니다.`);
        onFinish(quiz, answersRef.current, false);
      }
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExam]);

  const q = byId[ids[idx]];
  const total = ids.length;
  const answered = Object.keys(answers).length;
  const sel = answers[q.id];
  const shown = !!revealed[q.id];
  const wstat = stats[q.id];

  // 모든 모드에서 고르는 즉시 정답 여부와 해설을 보여준다.
  // 모의고사는 통계를 제출 시점에 한꺼번에 기록하고, 나머지는 바로 기록한다.
  const choose = (i) => {
    if (revealed[q.id]) return;
    setAnswers(a => ({ ...a, [q.id]: i }));
    setRevealed(r => ({ ...r, [q.id]: true }));
    if (!isExam) onPractice(q.id, i === q.a);
  };

  return (
    <div className="fade-in">
      {header(modeLabel(sections, mode, sec))}
      <div className="exam-qhead">
        <span className="prog">{idx + 1} / {total}</span>
        <span className="prog">답변 {answered}</span>
        {isExam && <span className={`timer ${left < 300 ? 'low' : ''}`}>{fmtT(left)}</span>}
      </div>
      <div className="exam-pbar"><i style={{ width: `${Math.round(answered / total * 100)}%` }} /></div>

      <div className="exam-qcard">
        <div className="exam-qtop">
          <span className="qnum">Q{String(idx + 1).padStart(2, '0')}</span>
          <span className="exam-chip sec">{sections[q.sec].name}</span>
          <span className="exam-chip">{q.topic}</span>
          {wstat?.w > 0 && <span className="exam-chip wrong">누적 오답 {wstat.w}회</span>}
          <MarkButton on={!!marks?.[q.id]?.on} onClick={() => onMark(q.id)} />
        </div>
        <QuestionBody q={q} />
        <ul className="exam-opts">
          {q.o.map((opt, i) => {
            let cls = 'exam-opt';
            if (shown) { if (i === q.a) cls += ' right'; else if (i === sel) cls += ' wrong'; }
            else if (sel === i) cls += ' sel';
            return (
              <li key={i}>
                <button className={cls} disabled={shown} onClick={() => choose(i)}>
                  <span className="no">{i + 1}</span><span className="tx">{opt}</span>
                </button>
              </li>
            );
          })}
        </ul>
        {shown && (
          <div className={`exam-expl ${sel === q.a ? 'ok' : 'bad'}`}>
            <div className="lab">{sel === q.a ? '정답' : `오답 · 정답은 ${CIRC[q.a]}`}</div>
            <div>{q.e}</div>
          </div>
        )}
        <div className="exam-actions">
          <button className="exam-btn" disabled={idx === 0} onClick={() => setIdx(idx - 1)}>이전</button>
          {idx < total - 1
            ? <button className="exam-btn primary" onClick={() => setIdx(idx + 1)}>다음</button>
            : <button className="exam-btn primary" onClick={() => onFinish(quiz, answers, false)}>{isExam ? '제출하고 채점' : '결과 보기'}</button>}
          <span className="spacer" />
          <button className="exam-btn ghost" onClick={() => { if (confirm('진행 중인 풀이를 종료할까요? 답변한 문제만 기록됩니다.')) onFinish(quiz, answers, true); }}>그만두기</button>
        </div>
      </div>

      <div className="exam-gridnav">
        {ids.map((id, i) => {
          let cls = 'gn';
          if (i === idx) cls += ' cur';
          if (answers[id] !== undefined) cls += answers[id] === byId[id].a ? ' r' : ' w';
          return <button key={id} className={cls} onClick={() => setIdx(i)}>{i + 1}</button>;
        })}
      </div>
    </div>
  );
}

function QuestionBody({ q, className = 'exam-qtext' }) {
  return (
    <>
      {q.ctx && <div className="exam-ctx">{q.ctx}</div>}
      {q.code && <pre className="exam-code">{q.code}</pre>}
      <p className={className}>{q.q}</p>
    </>
  );
}

function MarkButton({ on, onClick }) {
  return (
    <button type="button" className={`exam-mark ${on ? 'on' : ''}`} onClick={onClick} title={on ? '북마크 해제' : '북마크 (나중에 다시 풀기)'} aria-pressed={on}>
      {on ? '★' : '☆'}<span>{on ? '북마크됨' : '북마크'}</span>
    </button>
  );
}

function ReviewCard({ q, a, extra, sections, marked, onMark }) {
  const ok = a === q.a;
  return (
    <div className="exam-rv">
      <div className="h">
        <span className="qnum">{q.id.toUpperCase()}</span>
        <span className="exam-chip sec">{sections[q.sec].name}</span>
        <span className="exam-chip">{q.topic}</span>
        {extra ?? <span className={`exam-chip ${ok ? '' : 'wrong'}`}>{ok ? '정답' : '오답'}</span>}
        {onMark && <MarkButton on={!!marked} onClick={() => onMark(q.id)} />}
      </div>
      <QuestionBody q={q} className="q" />
      <div className="a">
        {a === undefined
          ? (extra ? null : <span className="w">미답변</span>)
          : <>내 답 <b className={ok ? 'r' : 'w'}>{CIRC[a]} {q.o[a]}</b></>}
        {(!ok || a === undefined) && <div>정답 <b className="r">{CIRC[q.a]} {q.o[q.a]}</b></div>}
      </div>
      <div className="ex">{q.e}</div>
    </div>
  );
}

function ReviewList({ items, sections, defaultFilter, marks, onMark }) {
  const [filter, setFilter] = useState(defaultFilter);
  const wrongs = items.filter(x => !x.ok);
  const list = filter === 'wrong' ? wrongs : items;
  return (
    <>
      <div className="exam-filters">
        <button className={`exam-btn sm ${filter === 'wrong' ? 'on' : ''}`} onClick={() => setFilter('wrong')}>오답 {wrongs.length}</button>
        <button className={`exam-btn sm ${filter === 'all' ? 'on' : ''}`} onClick={() => setFilter('all')}>전체 {items.length}</button>
      </div>
      {list.length === 0
        ? <div className="empty"><div className="empty-icon">🎉</div>틀린 문제가 없습니다. 전부 정답입니다.</div>
        : <div className="exam-review">{list.map(it => <ReviewCard key={it.q.id} q={it.q} a={it.a} sections={sections} marked={marks?.[it.q.id]?.on} onMark={onMark} />)}</div>}
    </>
  );
}

function WrongBook({ Q, ids, stats, sections, marks, onMark }) {
  const [filter, setFilter] = useState('all');
  if (!ids.length) return <div className="empty"><div className="empty-icon">📋</div>아직 틀린 문제가 없습니다. 모의고사나 영역별 연습을 먼저 풀어보세요.</div>;
  const tabs = [['all', '전체'], ...Object.entries(sections).map(([k, v]) => [k, v.name])];
  const qs = Q.filter(q => ids.includes(q.id) && (filter === 'all' || q.sec === filter))
    .sort((x, y) => stats[y.id].w - stats[x.id].w);
  return (
    <>
      <div className="exam-filters">
        {tabs.map(([k, t]) => {
          const cnt = k === 'all' ? ids.length : ids.filter(id => Q.find(q => q.id === id).sec === k).length;
          return <button key={k} className={`exam-btn sm ${filter === k ? 'on' : ''}`} onClick={() => setFilter(k)}>{t} {cnt}</button>;
        })}
      </div>
      <div className="exam-review">
        {qs.map(q => (
          <ReviewCard
            key={q.id}
            q={q}
            sections={sections}
            marked={marks?.[q.id]?.on}
            onMark={onMark}
            extra={<><span className="exam-chip wrong">오답 {stats[q.id].w}회</span><span className="exam-chip">{stats[q.id].last === 'r' ? '해결' : '미해결'}</span></>}
          />
        ))}
      </div>
    </>
  );
}

function MarkBook({ Q, ids, stats, sections, marks, onMark }) {
  const [filter, setFilter] = useState('all');
  if (!ids.length) return <div className="empty"><div className="empty-icon">☆</div>아직 북마크한 문제가 없습니다. 문제를 풀다가 ☆ 버튼을 눌러 표시해 두세요.</div>;
  const tabs = [['all', '전체'], ...Object.entries(sections).map(([k, v]) => [k, v.name])];
  const qs = Q.filter(q => ids.includes(q.id) && (filter === 'all' || q.sec === filter))
    .sort((x, y) => (marks[y.id]?.at || 0) - (marks[x.id]?.at || 0));
  return (
    <>
      <div className="exam-filters">
        {tabs.map(([k, t]) => {
          const cnt = k === 'all' ? ids.length : ids.filter(id => Q.find(q => q.id === id).sec === k).length;
          if (k !== 'all' && !cnt) return null;
          return <button key={k} className={`exam-btn sm ${filter === k ? 'on' : ''}`} onClick={() => setFilter(k)}>{t} {cnt}</button>;
        })}
      </div>
      <div className="exam-review">
        {qs.map(q => {
          const s = stats[q.id];
          return (
            <ReviewCard
              key={q.id}
              q={q}
              sections={sections}
              marked
              onMark={onMark}
              extra={s ? <span className={`exam-chip ${s.last === 'w' ? 'wrong' : ''}`}>{s.last === 'w' ? `최근 오답 · 누적 ${s.w}회` : '최근 정답'}</span> : <span className="exam-chip">아직 안 푼 문제</span>}
            />
          );
        })}
      </div>
    </>
  );
}
