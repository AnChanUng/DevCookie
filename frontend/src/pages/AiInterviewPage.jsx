import { useEffect, useState, useSyncExternalStore } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { account, onAccountChange } from '../sync';
import { AI_QUESTIONS, AI_CATEGORIES, AI_REFERENCES } from '../data/aiInterview';
import './CsNotesPage.css';
import './AiInterviewPage.css';

const identity = () => account()?.token || '';
export default function AiInterviewPage() {
  const token = useSyncExternalStore(onAccountChange, identity, () => '');
  return <AiWorkspace key={token} />;
}

function AiWorkspace() {
  const { hash } = useLocation();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [opened, setOpened] = useState({});
  const [saveError, setSaveError] = useState(false);
  const user = account();
  const storageKey = `ai-interview:drafts:v1:${user ? `user:${user.id || user.nickname}` : 'guest'}`;
  const [drafts, setDrafts] = useState(() => {
    try {
      const data = JSON.parse(localStorage.getItem(storageKey));
      return Object.fromEntries(AI_QUESTIONS.filter(q => typeof data?.[q.id] === 'string').map(q => [q.id, data[q.id]]));
    } catch { return {}; }
  });
  const saveDraft = (id, value) => {
    const next = { ...drafts, [id]: value };
    setDrafts(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); setSaveError(false); }
    catch { setSaveError(true); }
  };
  const visible = AI_QUESTIONS.filter(q => (!category || q.category === category)
    && `${q.question} ${q.answer} ${q.category}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start' });
  }, [hash]);
  return <div className="cs-notes ai-interview">
    <header className="notes-heading">
      <div><h1>AI 면접준비</h1><p>딜로이트 안진 · IT AI 엔지니어 | 주관식 {AI_QUESTIONS.length}문항 + 꼬리질문 {AI_QUESTIONS.length}개</p></div>
      <Link to="/">← 홈으로</Link>
    </header>
    <p className="ai-intro">JD · STAROAD · 지원 자소서를 바탕으로 만든 예상 질문입니다. 먼저 내 말로 답하고 모범답안을 확인하세요.</p>
    <p className="notes-save-status" role="status">{saveError ? '브라우저 저장에 실패했습니다. 작성한 답변을 따로 복사해 주세요.' : '내 답변은 현재 브라우저에 계정별로 자동 저장됩니다. 다른 기기와 동기화되지 않으며 자동 채점하지 않습니다.'}</p>
    <div className="notes-layout">
      <aside className="notes-index">
        <div className="notes-filters">
          <input type="search" aria-label="AI 면접 질문 검색" placeholder="RAG, VECTOR DB…" value={query} onChange={e => setQuery(e.target.value)} />
          <select aria-label="AI 면접 주제" value={category} onChange={e => setCategory(e.target.value)}><option value="">전체 주제</option>{AI_CATEGORIES.map(c => <option key={c}>{c}</option>)}</select>
        </div>
        <nav className="notes-questions" aria-label="AI 면접 목차">
          {AI_CATEGORIES.map(c => {
            const list = visible.filter(q => q.category === c);
            return list.length ? <section key={c}><h2>{c}<small>{list.length}</small></h2><ul>{list.map(q => <li key={q.id} className={hash === `#${q.id}` ? 'is-selected' : ''}><Link to={`#${q.id}`} aria-current={hash === `#${q.id}` ? 'location' : undefined}>{q.id.slice(3)}. {q.question}</Link></li>)}</ul></section> : null;
          })}
          {!visible.length && <p className="notes-empty">검색 결과가 없습니다.</p>}
        </nav>
      </aside>
      <div className="notes-content">
        <p className="notes-list-intro">공식 기출이나 회사의 공식 정답이 아닌 면접 연습 자료입니다. ‘경험’은 제공된 자소서를 바탕으로 작성했고, 확인되지 않은 모델·DB·클라우드 제품명은 임의로 넣지 않았습니다. ‘설계’ 답변은 앞으로 구현할 방안으로 설명하세요.</p>
        {visible.map(q => <article key={q.id} id={q.id} className="notes-detail-card">
          <div className="notes-detail-top"><span>{q.id.slice(3)} · {q.category}</span><span>{q.kind === '경험' ? '자소서 기반 · 경험 확인' : `${q.kind} 답변 예시`}</span></div>
          <h2 className="notes-question">{q.question}</h2>
          <label className="ai-draft-label" htmlFor={`draft-${q.id}`}>내 답변</label>
          <textarea id={`draft-${q.id}`} rows={3} value={drafts[q.id] || ''} onChange={e => saveDraft(q.id, e.target.value)} placeholder="핵심 개념 → 내 경험 또는 적용 방안 → 한계 순서로 적어 보세요." />
          <button type="button" className="exam-btn sm notes-reveal" aria-expanded={!!opened[q.id]} aria-controls={`answer-${q.id}`} onClick={() => setOpened(prev => ({ ...prev, [q.id]: !prev[q.id] }))}>{opened[q.id] ? '모범답안 숨기기' : '모범답안 보기'}</button>
          <div id={`answer-${q.id}`} hidden={!opened[q.id]}>{opened[q.id] && <section className="notes-answer notes-markdown" aria-label="모범답안">
            <h3>모범답안 · {q.kind === '경험' ? '본인 기록과 대조해 준비' : '설명 예시'}</h3>
            <ReactMarkdown>{q.answer}</ReactMarkdown>
            {q.followUps.map(f => <section className="ai-followup" key={f.question}><h4>꼬리질문 · {f.question}</h4><details><summary>답변 포인트 보기</summary><ReactMarkdown>{f.answer}</ReactMarkdown></details></section>)}
          </section>}</div>
        </article>)}
        {!visible.length && <p className="notes-empty">조건에 맞는 질문이 없습니다. 검색어 또는 주제를 바꿔 주세요.</p>}
        <details className="notes-sources"><summary>작성 기준 · 개념 참고자료</summary><p>사용자가 제공한 딜로이트 IT AI 엔지니어 채용 JD 및 지원동기·Career Goal. 아래 문서는 기술 개념 검토용입니다.</p><ul>{AI_REFERENCES.map(([title, url]) => <li key={url}><a href={url} target="_blank" rel="noreferrer">{title} ↗</a></li>)}</ul></details>
      </div>
    </div>
  </div>;
}
