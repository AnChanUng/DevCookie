import { useEffect, useState, useSyncExternalStore } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import InterviewAudio from '../components/InterviewAudio';
import InterviewCamera from '../components/InterviewCamera';
import { account, onAccountChange } from '../sync';
import { CHANUNG_QUESTIONS, CHANUNG_CATEGORIES } from '../data/chanung';
import './CsNotesPage.css';
import './ChanungPage.css';

const isConcept = q => q.id === 'cu-rag' || q.id.endsWith('-concept');
const concepts = CHANUNG_QUESTIONS.filter(isConcept);
const mainQuestions = CHANUNG_QUESTIONS.filter(q => !isConcept(q));

const identity = () => account()?.token || '';
export default function ChanungPage() {
  const token = useSyncExternalStore(onAccountChange, identity, () => '');
  return <div className="cs-notes chanung-page">
    <header className="notes-heading"><div><h1>찬웅의 면접 연습</h1><p>딜로이트 안진 · 경영지원부문 IT AI 엔지니어</p></div><Link to="/">홈으로</Link></header>
    <Practice key={token} />
  </div>;
}

function Practice() {
  const [recordings, setRecordings] = useState({});
  const saveRecording = (id, recording) => setRecordings(prev => ({ ...prev, [id]: recording }));
  const { hash } = useLocation();
  const navigate = useNavigate();
  const user = account();
  const storageKey = `chanung:practice:v1:${user ? `user:${user.id || user.nickname}` : 'guest'}`;
  const [drafts, setDrafts] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      return Object.fromEntries(CHANUNG_QUESTIONS.filter(q => typeof saved?.[q.id] === 'string').map(q => [q.id, saved[q.id]]));
    } catch { return {}; }
  });
  const completedKey = `${storageKey}:completed`;
  const [completed, setCompleted] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(completedKey));
      return Array.isArray(saved) ? saved.filter(id => CHANUNG_QUESTIONS.some(q => q.id === id)) : [];
    } catch { return []; }
  });
  const [showCompleted, setShowCompleted] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const toggleCompleted = id => {
    const next = completed.includes(id) ? completed.filter(value => value !== id) : [...completed, id];
    setCompleted(next);
    try { localStorage.setItem(completedKey, JSON.stringify(next)); setSaveError(false); }
    catch { setSaveError(true); }
  };
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const visible = CHANUNG_CATEGORIES.flatMap(c => mainQuestions.filter(q => q.category === c))
    .filter(q => (showCompleted || !completed.includes(q.id)) && (!category || q.category === category) && `${q.question} ${q.category}`.toLowerCase().includes(query.trim().toLowerCase()));
  const selected = visible.find(q => q.id === hash.slice(1)) || visible[0];
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start' });
  }, [hash]);
  const select = id => {
    navigate(`/chanung#${id}`, { replace: true });
    document.getElementById(id)?.scrollIntoView({ block: 'start' });
  };
  const write = (id, value) => {
    const next = { ...drafts, [id]: value };
    setDrafts(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); setSaveError(false); }
    catch { setSaveError(true); }
  };
  const random = () => {
    const pool = visible.filter(q => q.id !== selected?.id);
    if (pool.length) select(pool[Math.floor(Math.random() * pool.length)].id);
  };
  return <>
    <details className="notes-detail-card notes-markdown"><summary>두괄식 마스터 답변 템플릿</summary>
      <p><strong>질문의 표현을 받아 첫 문장에서 답하기 → 구체적인 경험 → 내가 한 행동 → 결과·배운 점</strong></p>
      <p>“○○한 경험은 [핵심 경험]입니다. [어디서] [무엇을 하며] [어떤 어려움]이 있었습니다. 저는 [행동]으로 개선했습니다. 그 결과 [결과]를 얻었고, [배운 점]을 배웠습니다.”</p>
      <ul>
        <li>힘들었던 경험이 있나요? → “힘들었던 경험은 ○○입니다.”</li>
        <li>갈등을 해결한 경험이 있나요? → “갈등을 해결한 경험은 ○○입니다.”</li>
        <li>본인의 강점은 무엇인가요? → “제 강점은 ○○입니다.”</li>
        <li>왜 지원했나요? → “지원한 이유는 ○○입니다.”</li>
        <li>어떻게 개선했나요? → “○○를 조정해 개선했습니다.”</li>
      </ul>
      <p><strong>힘들었던 경험 답변 틀</strong><br />힘들었던 경험은 [인턴십에서 겪은 어려움]입니다. 인턴십에서 [업무]를 하며 [문제] 때문에 어려움을 겪었습니다. 저는 [구체적인 행동]으로 개선했습니다. 그 결과 [변화]가 있었고, [배운 점]을 배웠습니다.</p>
      <p>첫마디에서 질문만 반복하지 말고 빈칸에 결론을 바로 넣으세요. 경험 질문에는 이 흐름을 쓰고, 개념 질문은 “정의 → 동작·역할”로 짧게 답하면 됩니다.</p>
    </details>
    <p className="notes-list-intro">전체 질문을 아래로 스크롤하며 연습하고, 답변은 필요할 때 펼쳐 보세요. 왼쪽 목차를 누르면 해당 위치로 이동합니다. 직접 작성한 답변 {CHANUNG_QUESTIONS.filter(q => q.original).length}개는 원문 그대로, 나머지는 준비용 답변 예시입니다.</p>
    <p className="notes-save-status" role="status">{saveError ? '저장에 실패했습니다. 입력한 답변을 따로 복사해 주세요.' : '내 연습 답변과 완료 체크는 현재 브라우저에 계정별로 저장됩니다. 다른 기기와 동기화되지 않으며 자동 채점하지 않습니다.'}</p>
    <div className="notes-layout">
      <aside className="notes-index">
        <div className="notes-filters"><input type="search" aria-label="면접 질문 검색" placeholder="질문 검색" value={query} onChange={e => setQuery(e.target.value)} /><select aria-label="면접 질문 분류" value={category} onChange={e => setCategory(e.target.value)}><option value="">전체 질문</option>{CHANUNG_CATEGORIES.map(c => <option key={c}>{c}</option>)}</select><label><input type="checkbox" checked={showCompleted} onChange={e => setShowCompleted(e.target.checked)} /> 완료한 답변도 표시 ({completed.length})</label></div>
        <div className="chanung-list-meta"><span>{visible.length}문항 · 작성 {mainQuestions.filter(q => drafts[q.id]?.trim()).length}/{mainQuestions.length}</span><button type="button" disabled={visible.length < 2} onClick={random}>랜덤 질문</button></div>
        <nav className="notes-questions" aria-label="면접 질문 목차">{CHANUNG_CATEGORIES.map(c => {
          const list = visible.filter(q => q.category === c);
          return list.length ? <section key={c}><h2>{c}<small>{list.length}</small></h2><ul>{list.map(q => <li key={q.id} className={selected?.id === q.id ? 'is-selected' : ''}><button type="button" aria-current={selected?.id === q.id ? 'true' : undefined} onClick={() => select(q.id)}>{q.question}{drafts[q.id]?.trim() && <small> · 작성함</small>}</button></li>)}</ul></section> : null;
        })}</nav>
      </aside>
      <div className="notes-content">
        <div className="chanung-camera-dock"><InterviewCamera /></div>
        {visible.map(q => <PracticeQuestion key={q.id} q={q} draft={drafts[q.id] || ''} write={write} recording={recordings[q.id]} saveRecording={saveRecording} active={selected?.id === q.id} activate={() => select(q.id)} done={completed.includes(q.id)} toggleDone={() => toggleCompleted(q.id)} />)}
        {!visible.length && <p className="notes-empty">표시할 답변이 없습니다. 완료한 답변 표시를 켜거나 검색 조건을 바꿔 주세요.</p>}
        <details className="chanung-concept-review">
          <summary>기초 개념 몰아보기 · {concepts.length}개</summary>
          <p className="audio-hint">하루 한 번 펼쳐서 정의를 쭉 읽고 반복해 보세요.</p>
          {concepts.filter(q => showCompleted || !completed.includes(q.id)).map(q => <section key={q.id} className="notes-detail-card" id={q.id}>
            <div className="notes-detail-top"><h3>{q.question}</h3><label><input type="checkbox" aria-label={`${q.question} 학습 완료`} checked={completed.includes(q.id)} onChange={() => toggleCompleted(q.id)} /> 학습 완료</label></div>
            {q.original ? <div className="chanung-original">{q.answer}</div> : <div className="notes-markdown"><ReactMarkdown>{q.answer}</ReactMarkdown></div>}
          </section>)}
          {concepts.every(q => completed.includes(q.id)) && !showCompleted && <p className="audio-hint">기초 개념을 모두 완료했습니다. ‘완료한 답변도 표시’를 켜면 다시 볼 수 있습니다.</p>}
        </details>
      </div>
    </div>
  </>;
}

function PracticeQuestion({ q, draft, write, recording, saveRecording, active, activate, done, toggleDone }) {
  const [open, setOpen] = useState(false);
  return <article className={`notes-detail-card ${done ? 'is-done' : ''}`} id={q.id}>
    <div className="notes-detail-top"><span>{q.category}</span><span>{q.original ? '내가 작성한 원문' : '모범답변 예시'}</span><label><input type="checkbox" aria-label={`${q.question} 학습 완료`} checked={done} onChange={toggleDone} /> 학습 완료</label></div>
    <h2 className="notes-question">{q.question}</h2>
    {active ? <InterviewAudio questionId={q.id} recording={recording} saveRecording={saveRecording} /> : <button type="button" className="exam-btn sm" onClick={activate}>이 질문 녹음 연습</button>}
    <details className="chanung-draft-panel">
      <summary>직접 적어보기{draft.trim() ? ' · 작성한 답변 있음' : ' (선택)'}</summary>
      <label className="chanung-label" htmlFor={`draft-${q.id}`}>내 연습 답변</label>
      <textarea id={`draft-${q.id}`} rows={2} value={draft} onChange={e => write(q.id, e.target.value)} placeholder="핵심만 짧게 적어 보세요." />
    </details>
    <div className="chanung-actions"><button type="button" className="exam-btn sm" disabled={!draft.trim()} onClick={() => setOpen(true)} aria-controls={`answer-${q.id}`}>답변 제출하고 비교</button><button type="button" className="exam-btn sm" aria-expanded={open} aria-controls={`answer-${q.id}`} onClick={() => setOpen(value => !value)}>{open ? '답변 숨기기' : '기억 안 나요 · 답변 보기'}</button></div>
    <div id={`answer-${q.id}`} hidden={!open}>{open && <section className="notes-answer" aria-label="참고 답변">
      <h3>{q.original ? '내가 작성한 답변 · 원문 그대로' : '모범답변 · 말하기 예시'}</h3>
      {q.original ? <div className="chanung-original">{q.answer}</div> : <div className="notes-markdown"><ReactMarkdown>{q.answer}</ReactMarkdown></div>}
      {q.note && <p className="chanung-note"><strong>준비 메모</strong> {q.note}</p>}
    </section>}</div>
  </article>;
}
