import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react';
import { account, onAccountChange } from '../sync';
import { visitorId } from '../track';
import { recordAnswer, useExamProgress } from '../hooks/useExamProgress';
import { dayLabel, factForDay, koreanDay, quizForDay } from '../data/todayCs';
import Code from './Code';
import QuestionExplanation from './QuestionExplanation';
import './TodayCs.css';

const CIRC = ['①', '②', '③', '④', '⑤'];
const identitySnapshot = () => account() ? `account:${account().id || account().token}` : `visitor:${visitorId()}`;
export default function TodayCs() {
  const [day, setDay] = useState(koreanDay);
  const identity = useSyncExternalStore(onAccountChange, identitySnapshot, () => '');
  useEffect(() => {
    const update = () => setDay(koreanDay());
    const timer = setInterval(update, 1000);
    document.addEventListener('visibilitychange', update);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', update); };
  }, []);
  return <DailyConcept key={`${day}:${identity}`} day={day} identity={identity} />;
}
function DailyConcept({ day, identity }) {
  const fact = factForDay(day), panelId = useId();
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState({ questions: null, error: false });
  const [retry, setRetry] = useState(0);
  const key = `today-cs:v1:${day}:${identity}`;
  const [picked, setPicked] = useState(() => {
    try { const saved = JSON.parse(localStorage.getItem(key)); return saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {}; }
    catch { return {}; }
  });
  const pickedRef = useRef(picked);
  const { save } = useExamProgress('topics');
  useEffect(() => {
    if (!open) return undefined;
    let active = true;
    import('../data/topicBank').then(({ TOPICS }) => {
      const questions = quizForDay(fact, day, TOPICS.questions);
      if (active) setLoaded({ questions, error: false });
    }).catch(() => { if (active) setLoaded({ questions: null, error: true }); });
    return () => { active = false; };
  }, [open, fact, day, retry]);
  const { questions, error } = loaded;
  const answered = questions?.filter(q => Number.isInteger(picked[q.id]) && picked[q.id] >= 0 && picked[q.id] < q.o.length).length || 0;
  const correct = questions?.filter(q => picked[q.id] === q.a).length || 0;
  const complete = questions?.length > 0 && answered === questions.length;
  function answer(q, choice) {
    if (Number.isInteger(pickedRef.current[q.id]) && pickedRef.current[q.id] >= 0 && pickedRef.current[q.id] < q.o.length) return;
    const next = { ...pickedRef.current, [q.id]: choice }; pickedRef.current = next; setPicked(next);
    try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* Continue even if local storage is unavailable. */ }
    save(previous => ({ ...previous, stats: recordAnswer(previous.stats, q.id, choice === q.a) }));
  }
  return <section className="today-cs today-cs-daily" aria-label="오늘의 CS">
    <div className="today-cs-head"><b>오늘의 CS</b><span>{fact.t}</span></div>
    <p className="today-cs-body">{fact.s}</p>
    <div className="today-cs-check">
      <span className="today-cs-date">{dayLabel(day)} · 한국 시간 00시 갱신</span>
      <button type="button" className="exam-btn sm" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen(value => !value)}>
        {open ? '확인 문제 접기' : '오늘 배운 내용 확인하기 · 5문제'}
      </button>
    </div>
    {open && <div id={panelId} className="today-cs-questions" aria-label="오늘 배운 내용 확인하기">
      <p className="today-quiz-note">오늘은 모두가 같은 개념과 문제를 풉니다. 풀이 기록은 주제별 문제집과 오답노트에 반영됩니다.</p>
      {error ? <div role="alert">문제를 불러오지 못했습니다. <button className="exam-btn sm" onClick={() => { setLoaded({ questions: null, error: false }); setRetry(value => value + 1); }}>다시 불러오기</button></div>
        : questions === null ? <p role="status">문제를 불러오는 중…</p> : questions.length === 0 ? <p>이 개념의 확인 문제를 준비 중입니다.</p> : <>
          <p role="status">{complete ? `오늘 학습 완료! ${questions.length}문제 중 ${correct}문제 정답 🎉` : `${answered}/${questions.length}문제 완료`}</p>
          {questions.map((q, n) => {
            const selected = picked[q.id], done = Number.isInteger(selected) && selected >= 0 && selected < q.o.length;
            return <div key={q.id} className="today-quiz-q">
              <div className="today-quiz-qt"><b>{n + 1}</b><span>{q.q}</span></div>
              {q.ctx && <p className="today-cs-context">{q.ctx}</p>}
              {q.code && <Code code={q.code} />}
              <ul>{q.o.map((option, choice) => <li key={choice}>
                <button type="button" disabled={done} className={done ? choice === q.a ? 'right' : choice === selected ? 'wrong' : '' : ''} onClick={() => answer(q, choice)}>
                  <span>{CIRC[choice]}</span>{option}
                </button>
              </li>)}</ul>
              {done && <><p className="today-quiz-ex"><strong>{selected === q.a ? '정답입니다.' : `오답입니다. 정답은 ${CIRC[q.a]}입니다.`}</strong> {q.e}</p><QuestionExplanation q={q} /></>}
            </div>;
          })}
        </>}
    </div>}
  </section>;
}
