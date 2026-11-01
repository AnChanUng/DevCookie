import { useState, useSyncExternalStore } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import InterviewAudio from '../components/InterviewAudio';
import { account, onAccountChange } from '../sync';
import { CHANUNG_QUESTIONS, CHANUNG_CATEGORIES } from '../data/chanung';
import './CsNotesPage.css';
import './ChanungPage.css';

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
  const [saveError, setSaveError] = useState(false);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const visible = CHANUNG_CATEGORIES.flatMap(c => CHANUNG_QUESTIONS.filter(q => q.category === c))
    .filter(q => (!category || q.category === category) && `${q.question} ${q.category}`.toLowerCase().includes(query.trim().toLowerCase()));
  const selected = visible.find(q => q.id === hash.slice(1)) || visible[0];
  const index = visible.findIndex(q => q.id === selected?.id);
  const select = id => {
    navigate(`/chanung#${id}`, { replace: true });
    document.getElementById('chanung-question')?.scrollIntoView({ block: 'start' });
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
    <p className="notes-list-intro">한 질문씩 답해 본 뒤 모범답변과 비교하세요. 기억이 안 나면 바로 펼쳐 읽을 수 있습니다. 직접 작성한 답변 {CHANUNG_QUESTIONS.filter(q => q.original).length}개는 원문 그대로, 나머지는 준비용 답변 예시입니다.</p>
    <p className="notes-save-status" role="status">{saveError ? '저장에 실패했습니다. 입력한 답변을 따로 복사해 주세요.' : '내 연습 답변은 현재 브라우저에 계정별로 저장됩니다. 다른 기기와 동기화되지 않으며 자동 채점하지 않습니다.'}</p>
    <div className="notes-layout">
      <aside className="notes-index">
        <div className="notes-filters"><input type="search" aria-label="면접 질문 검색" placeholder="질문 검색" value={query} onChange={e => setQuery(e.target.value)} /><select aria-label="면접 질문 분류" value={category} onChange={e => setCategory(e.target.value)}><option value="">전체 질문</option>{CHANUNG_CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
        <div className="chanung-list-meta"><span>{visible.length}문항 · 작성 {CHANUNG_QUESTIONS.filter(q => drafts[q.id]?.trim()).length}/{CHANUNG_QUESTIONS.length}</span><button type="button" disabled={visible.length < 2} onClick={random}>랜덤 질문</button></div>
        <nav className="notes-questions" aria-label="면접 질문 목차">{CHANUNG_CATEGORIES.map(c => {
          const list = visible.filter(q => q.category === c);
          return list.length ? <section key={c}><h2>{c}<small>{list.length}</small></h2><ul>{list.map(q => <li key={q.id} className={selected?.id === q.id ? 'is-selected' : ''}><button type="button" aria-current={selected?.id === q.id ? 'true' : undefined} onClick={() => select(q.id)}>{q.question}{drafts[q.id]?.trim() && <small> · 작성함</small>}</button></li>)}</ul></section> : null;
        })}</nav>
      </aside>
      <div className="notes-content">
        {selected ? <>
          <div className="chanung-pagination"><button type="button" className="exam-btn sm" disabled={index <= 0} onClick={() => select(visible[index - 1].id)}>← 이전</button><span>{index + 1} / {visible.length}</span><button type="button" className="exam-btn sm" disabled={index === visible.length - 1} onClick={() => select(visible[index + 1].id)}>다음 →</button></div>
          <PracticeQuestion key={selected.id} q={selected} draft={drafts[selected.id] || ''} write={write} recording={recordings[selected.id]} saveRecording={saveRecording} />
        </> : <p className="notes-empty">검색 결과가 없습니다. 검색어나 분류를 바꿔 주세요.</p>}
      </div>
    </div>
  </>;
}

function PracticeQuestion({ q, draft, write, recording, saveRecording }) {
  const [open, setOpen] = useState(false);
  return <article className="notes-detail-card" id="chanung-question">
    <div className="notes-detail-top"><span>{q.category}</span><span>{q.original ? '내가 작성한 원문' : '모범답변 예시'}</span></div>
    <h2 className="notes-question">{q.question}</h2>
    <InterviewAudio questionId={q.id} recording={recording} saveRecording={saveRecording} />
    <label className="chanung-label" htmlFor="chanung-draft">내 연습 답변</label>
    <textarea id="chanung-draft" rows={7} value={draft} onChange={e => write(q.id, e.target.value)} placeholder="실제로 면접에서 말하듯 작성해 보세요." />
    <div className="chanung-actions"><button type="button" className="exam-btn sm" disabled={!draft.trim()} onClick={() => setOpen(true)} aria-controls="chanung-answer">답변 제출하고 비교</button><button type="button" className="exam-btn sm" aria-expanded={open} aria-controls="chanung-answer" onClick={() => setOpen(value => !value)}>{open ? '답변 숨기기' : '기억 안 나요 · 답변 보기'}</button></div>
    <div id="chanung-answer" hidden={!open}>{open && <section className="notes-answer" aria-label="참고 답변">
      <h3>{q.original ? '내가 작성한 답변 · 원문 그대로' : '모범답변 · 말하기 예시'}</h3>
      {q.original ? <div className="chanung-original">{q.answer}</div> : <div className="notes-markdown"><ReactMarkdown>{q.answer}</ReactMarkdown></div>}
      {q.note && <p className="chanung-note"><strong>준비 메모</strong> {q.note}</p>}
    </section>}</div>
  </article>;
}

