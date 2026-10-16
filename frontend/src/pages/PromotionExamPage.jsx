import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { membershipHeaders, refreshMembership } from '../membership';
import { account } from '../sync';
import { visitorId } from '../track';
import Code from '../components/Code';
import './PromotionExamPage.css';
const GROUPS = { os: '운영체제', net: '네트워크', db: '데이터베이스', arch: '컴퓨터구조', c: 'C', java: 'Java', python: 'Python' };
export default function PromotionExamPage() {
  const identity = account()?.token || visitorId();
  return <Exam key={identity} identity={identity} />;
}
function Exam({ identity }) {
  const storageKey = `promotion-exam:${identity}`;
  const [paper, setPaper] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const lock = useRef(false);
  const config = () => ({ headers: membershipHeaders(), timeout: 90000 });
  useEffect(() => {
    let active = true;
    let saved;
    try { saved = JSON.parse(localStorage.getItem(storageKey)); } catch { /* No valid saved attempt. */ }
    if (!saved?.id) { setLoading(false); return; }
    api.get(`/promotion-exams/${saved.id}`, { headers: membershipHeaders(), timeout: 90000 })
      .then(({ data }) => { if (active) { setPaper(data); setAnswers(data.result ? Object.fromEntries(data.result.review.map(r => [r.id, r.selected])) : saved.answers || {}); setResult(data.result); } })
      .catch(error => {
        if (!active) return;
        if ([401,404].includes(error?.response?.status)) localStorage.removeItem(storageKey);
        else setError('진행 중인 시험을 불러오지 못했습니다. 새로고침해 주세요.');
      }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [storageKey]);
  const remember = (id, next) => { try { localStorage.setItem(storageKey, JSON.stringify({ id, answers: next })); } catch { /* The server still retains this attempt. */ } };
  async function start() {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError('');
    try {
      const { data } = await api.post('/promotion-exams', {}, config());
      setPaper(data); setAnswers({}); setResult(null); remember(data.id, {});
    } catch { setError('시험을 시작하지 못했습니다. 잠시 후 다시 시도해 주세요.'); }
    finally { lock.current = false; setBusy(false); }
  }
  async function submit() {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError('');
    try {
      const { data } = await api.post(`/promotion-exams/${paper.id}/submit`, { answers }, config());
      setResult(data); refreshMembership();
    } catch { setError('제출하지 못했습니다. 답안은 유지됩니다. 다시 제출해 주세요.'); }
    finally { lock.current = false; setBusy(false); }
  }
  const answered = paper?.questions.filter(q => Number.isInteger(answers[q.id])).length || 0;
  return <div className="promotion-exam fade-in">
    <header className="page-header"><Link className="back-link" to="/">← 홈으로</Link><h1>시험</h1>
      <p>운영체제·네트워크·데이터베이스·컴퓨터구조 각 6문제, C·Java·Python 각 2문제 · 총 30문제</p>
      <p>95점 이상(29문제 이상 정답)이면 티어 한 단계 승급! Ⅴ→Ⅳ→Ⅲ→Ⅱ→Ⅰ 순서이며, Ⅰ에서는 다음 등급으로 올라갑니다.</p>
    </header>
    {error && <p role="alert">{error}</p>}
    {loading ? <p role="status">진행 중인 시험을 확인하는 중…</p> : !paper ? <button className="exam-btn primary" disabled={busy} onClick={start}>{busy ? '출제 중…' : '30문제 시험 시작'}</button> : <>
      {result && <section className="promotion-result" aria-label="시험 결과">
        <h2>{result.score}점 · {result.correct}/{result.total}문제 정답</h2>
        <p>{result.promoted ? `${result.tierName} 승급 완료!` : result.passed ? '합격! 현재 최고 등급입니다.' : '95점 미만입니다. 오답을 확인하고 다시 도전해 보세요.'}</p>
        <Link className="exam-btn" to="/account#settings">내 티어 확인</Link>{' '}
        <button className="exam-btn primary" disabled={busy} onClick={start}>새 시험 도전</button>
      </section>}
      <p aria-live="polite">{result ? '문항별 결과와 해설' : `${answered}/30문제 응답 · 답안은 자동 저장됩니다.`}</p>
      <form onSubmit={e => { e.preventDefault(); submit(); }}>
        {paper.questions.map((q, i) => {
          const review = result?.review.find(r => r.id === q.id);
          return <fieldset className="promotion-question" key={q.id} disabled={busy || !!result}>
            <legend>{i+1}. {GROUPS[q.group]} · {q.topic}</legend><p className="promotion-prompt">{q.q}</p>
            {q.code && <Code code={q.code} />}
            <div className="promotion-options">{q.o.map((option, index) => <label key={index} className={review?.answer === index ? 'correct' : ''}>
              <input type="radio" name={q.id} checked={answers[q.id] === index} onChange={() => {
                const next = { ...answers, [q.id]: index }; setAnswers(next); remember(paper.id, next);
              }} /> <span>{index+1}. {option}</span>
            </label>)}</div>
            {review && <div className="promotion-review"><strong>{review.correct ? '정답' : `오답 · 정답 ${review.answer+1}번`}</strong><p>{review.explanation}</p></div>}
          </fieldset>;
        })}
        {!result && <button className="exam-btn primary" disabled={busy || answered !== 30}>{busy ? '채점 중…' : `시험 제출 (${answered}/30)`}</button>}
      </form>
    </>}
  </div>;
}
