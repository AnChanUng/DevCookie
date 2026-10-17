import { useState, useSyncExternalStore } from 'react';
import { Link } from 'react-router-dom';
import { INTERVIEW_TRACKS, TECHNICAL_INTERVIEW, INTERVIEW_REFERENCES } from '../data/technicalInterview';
import { account, onAccountChange } from '../sync';
import './TechnicalInterviewPage.css';

const identity = () => account()?.token || '';
const knownIds = new Set(TECHNICAL_INTERVIEW.map(q => q.id));
export default function TechnicalInterviewPage() {
  const token = useSyncExternalStore(onAccountChange, identity, () => '');
  return <InterviewWorkspace key={token} />;
}
function InterviewWorkspace() {
  const [track, setTrack] = useState('aws');
  const [category, setCategory] = useState('');
  const [query, setQuery] = useState('');
  const [hideDone, setHideDone] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const storageKey = `technical-interview:v1:${account() ? `user:${account().id || account().nickname}` : 'guest'}`;
  const [completed, setCompleted] = useState(() => {
    try {
      const data = JSON.parse(localStorage.getItem(storageKey));
      return Array.isArray(data) ? data.filter(id => knownIds.has(id)) : [];
    } catch { return []; }
  });
  const [storageError, setStorageError] = useState(false);
  const trackQuestions = TECHNICAL_INTERVIEW.filter(q => q.source === track);
  const categories = [...new Set(trackQuestions.map(q => q.category))];
  const normalized = query.trim().toLocaleLowerCase();
  const visible = trackQuestions.filter(q => (!category || q.category === category) && (!hideDone || !completed.includes(q.id))
    && `${q.question} ${q.category} ${q.answer}`.toLocaleLowerCase().includes(normalized));
  const selected = visible.find(q => q.id === selectedId) || visible[0];
  const index = visible.findIndex(q => q.id === selected?.id);
  const source = INTERVIEW_TRACKS.find(item => item.id === track);
  const toggleDone = id => {
    const next = completed.includes(id) ? completed.filter(value => value !== id) : [...completed, id];
    setCompleted(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); setStorageError(false); }
    catch { setStorageError(true); }
  };
  const chooseTrack = id => { setTrack(id); setCategory(''); setQuery(''); setSelectedId(''); };
  return <div className="technical-interview fade-in">
    <header className="tech-heading">
      <Link className="back-link" to="/">← 홈으로</Link>
      <span className="tech-kicker">INTERVIEW WORKSPACE</span>
      <h1>기술면접 준비</h1>
      <p>질문을 먼저 읽고, 내 말로 답한 뒤 예시 답변과 비교해 보세요.</p>
      <div className="tech-heading-links"><Link to="/interview">카메라로 공통질문 연습 →</Link><Link to="/notes">CS 개념 더 공부하기 →</Link></div>
    </header>
    <div className="tech-tracks" aria-label="면접 자료 선택">
      {INTERVIEW_TRACKS.map(item => <button type="button" key={item.id} aria-pressed={track === item.id} onClick={() => chooseTrack(item.id)}>
        <small>{item.subtitle}</small><strong>{item.name}</strong>
        <span>{TECHNICAL_INTERVIEW.filter(q => q.source === item.id).length}개 질문 <b>연습 {TECHNICAL_INTERVIEW.filter(q => q.source === item.id && completed.includes(q.id)).length}개 완료</b></span>
      </button>)}
    </div>
    <p className="tech-source">질문 출처: {source.file} / 답변과 꼬리질문은 학습을 위해 새로 작성했습니다. 회사의 공식 정답이나 합격 답변을 뜻하지 않습니다.</p>
    <div className="tech-layout">
      <aside className="tech-sidebar">
        <div className="tech-filters">
          <label>질문 검색<input type="search" aria-label="면접 질문 검색" value={query} onChange={event => setQuery(event.target.value)} placeholder="SQS, 장애 대응, 트랜잭션…" /></label>
          <label>주제<select aria-label="면접 주제" value={category} onChange={event => setCategory(event.target.value)}><option value="">전체 주제</option>{categories.map(title => <option key={title} value={title}>{title}</option>)}</select></label>
          <label className="tech-hide"><input type="checkbox" checked={hideDone} onChange={event => setHideDone(event.target.checked)} /> 연습 완료한 질문 숨기기</label>
        </div>
        <div className="tech-list-head"><span>{visible.length}개 질문</span><button type="button" disabled={visible.length < 2} onClick={() => {
          const pool = visible.filter(q => q.id !== selected?.id);
          setSelectedId(pool[Math.floor(Math.random() * pool.length)].id);
        }}>랜덤 질문</button></div>
        <nav className="tech-question-list" aria-label="기술면접 질문 목록">
          {visible.map(q => <button type="button" key={q.id} aria-current={q.id === selected?.id ? 'true' : undefined} onClick={() => setSelectedId(q.id)}>
            <span>{q.category}{completed.includes(q.id) && <b>완료</b>}</span>{q.question}
          </button>)}
          {!visible.length && <p>조건에 맞는 질문이 없습니다. 검색어나 주제, 완료 숨기기를 변경해 주세요.</p>}
        </nav>
      </aside>
      <div className="tech-content">
        {selected ? <InterviewQuestion key={selected.id} question={selected} done={completed.includes(selected.id)} toggleDone={toggleDone} /> : <section className="tech-empty"><h2>검색 조건을 바꿔 보세요.</h2><p>다른 질문으로 답변 연습을 이어갈 수 있습니다.</p></section>}
        {selected && <div className="tech-paging"><button type="button" className="exam-btn" disabled={index <= 0} onClick={() => setSelectedId(visible[index - 1].id)}>← 이전 질문</button><span>{index + 1} / {visible.length}</span><button type="button" className="exam-btn" disabled={index === visible.length - 1} onClick={() => setSelectedId(visible[index + 1].id)}>다음 질문 →</button></div>}
        <p className="tech-save-note" role="status">{storageError ? '브라우저 저장이 차단되어 완료 표시를 유지하지 못합니다.' : '연습 완료 표시는 현재 브라우저에 저장됩니다. 기술면접은 자가 점검용이며 티어 풀이 수를 늘리지 않습니다.'}</p>
        <details className="tech-references"><summary>개념 확인용 공식 문서</summary><ul>{INTERVIEW_REFERENCES.map(([label, url]) => <li key={url}><a href={url} target="_blank" rel="noreferrer">{label} ↗</a></li>)}</ul></details>
      </div>
    </div>
  </div>;
}
function InterviewQuestion({ question: q, done, toggleDone }) {
  const [open, setOpen] = useState(false);
  const [followOpen, setFollowOpen] = useState(false);
  const kind = q.kind === 'experience' ? '경험 답변 구성 예시' : q.kind === 'reverse' ? '역질문 준비 가이드' : '기술 답변 예시';
  return <article className="tech-question" aria-label="선택한 면접 질문">
    <div className="tech-question-meta"><span>{q.category}</span><span>{q.source === 'aws' ? `자료 ${q.page}쪽` : '오토에버 1차 자료'}</span></div>
    <h2>{q.question}</h2>
    <p className="tech-speaking-tip">{q.kind === 'experience' ? '상황 → 내가 한 행동 → 실제 결과 → 직무와의 연결 순서로 말해 보세요.' : q.kind === 'reverse' ? '이 질문은 지원자가 면접관에게 묻는 역질문입니다.' : '정의 → 동작 원리 → 사용 사례와 트레이드오프 순서로 말해 보세요.'}</p>
    <button type="button" className="exam-btn primary" aria-expanded={open} aria-controls={`tech-answer-${q.id}`} onClick={() => setOpen(value => !value)}>{open ? '예시 답변 접기' : '예시 답변 보기'}</button>
    {open && <section id={`tech-answer-${q.id}`} className="tech-answer" aria-label={kind}><h3>{kind}</h3><p>{q.answer}</p>
      {q.kind === 'experience' && <p className="tech-experience-note">대괄호는 본인의 실제 경험으로 바꿔 주세요. 자료 속 지원자의 직함·프로젝트·성과를 본인 경험으로 사용하지 마세요.</p>}
    </section>}
    <div className="tech-followup">
      <button type="button" aria-expanded={followOpen} onClick={() => setFollowOpen(value => !value)}>{followOpen ? '연습용 꼬리질문 접기 ↑' : '이 주제의 꼬리질문 연습 ↓'}</button>
      {followOpen && q.followUps.map(([question, answer]) => <section key={question}><h3>{question}</h3><details><summary>답변 포인트 보기</summary><p>{answer}</p></details></section>)}
    </div>
    <label className="tech-complete"><input type="checkbox" checked={done} onChange={() => toggleDone(q.id)} /> 내 말로 답변 연습 완료</label>
  </article>;
}
