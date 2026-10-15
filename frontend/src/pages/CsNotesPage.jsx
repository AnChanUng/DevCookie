import { useEffect, useState, useSyncExternalStore } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CS_NOTES, NOTE_SOURCES } from '../data/csNotes';
import { account, onAccountChange } from '../sync';
import useNotesProgress from '../hooks/useNotesProgress';
import './CsNotesPage.css';

const entries = CS_NOTES.flatMap(s => s.items.map(e => ({ ...e, subject: s.title, section: s.id })));
const tokenSnapshot = () => account()?.token || '';
export default function CsNotesPage() {
  const token = useSyncExternalStore(onAccountChange, tokenSnapshot, () => '');
  return <NotesWorkspace key={token} user={token ? account() : null} />;
}
function NotesWorkspace({ user }) {
  const { hash } = useLocation();
  const navigate = useNavigate();
  const [subject, setSubject] = useState('');
  const [query, setQuery] = useState('');
  const [hideDone, setHideDone] = useState(false);
  const [opened, setOpened] = useState({});
  const { data, status, toggle, retry, disabled } = useNotesProgress(user);
  const selected = entries.find(e => e.id === hash.slice(1));
  const completed = entries.filter(e => data[e.id]?.done).length;
  const visible = entries.filter(e => (!subject || e.section === subject) && (!hideDone || !data[e.id]?.done) && `${e.title} ${e.question}`.toLowerCase().includes(query.trim().toLowerCase()));
  const choose = id => {
    navigate(`/notes#${id}`, { replace: true });
    document.getElementById(id)?.scrollIntoView({ block: 'start' });
  };
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start' });
  }, [hash]);
  const statusText = {
    guest: '학습 완료 기록은 로그인 후 계정에 저장됩니다.', loading: '계정 기록을 불러오는 중…',
    saving: '계정에 저장하는 중…', saved: '계정에 저장됨',
    error: '서버 연결에 실패했습니다. 변경된 체크는 이 기기에 보관되며 재시도하면 저장됩니다.',
    expired: '로그인이 만료되었습니다. 내 계정에서 다시 로그인해 주세요.',
  }[status];
  return (
    <div className="cs-notes">
      <header className="notes-heading">
        <div><h1>전공노트</h1><p>{CS_NOTES.length}과목 · {entries.length}개 기본 키워드</p></div>
        <div className="notes-progress"><strong>학습 완료 {completed} / {entries.length}</strong><progress value={completed} max={entries.length} aria-label="전공노트 학습 완료" /></div>
        <Link to="/account">내 계정 →</Link>
      </header>
      <div className="notes-save-status" role="status">{statusText} {(status === 'error') && <button type="button" onClick={retry}>다시 저장</button>}</div>
      <div className="notes-layout">
        <aside className="notes-index">
          <div className="notes-filters">
            <input aria-label="질문 검색" placeholder="질문 검색…" value={query} onChange={e => setQuery(e.target.value)} />
            <select aria-label="과목 선택" value={subject} onChange={e => setSubject(e.target.value)}><option value="">전 과목</option>{CS_NOTES.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}</select>
            <label><input type="checkbox" aria-label="완료한 지식 숨기기" checked={hideDone} onChange={e => setHideDone(e.target.checked)} /> 완료한 지식 숨기기</label>
          </div>
          <nav aria-label="전공노트 질문 목록" className="notes-questions">
            {CS_NOTES.map(section => {
              const list = visible.filter(e => e.section === section.id);
              if (!list.length) return null;
              return <section key={section.id}><h2>{section.title}<small>{section.items.filter(e => data[e.id]?.done).length}/{section.items.length}</small></h2><ul>{list.map(entry => (
                <li key={entry.id} className={`${data[entry.id]?.done ? 'is-done' : ''} ${selected?.id === entry.id ? 'is-selected' : ''}`}>
                  <input type="checkbox" aria-label={`${entry.title} 학습 완료`} checked={!!data[entry.id]?.done} disabled={disabled} onChange={() => toggle(entry.id)} />
                  <button type="button" aria-current={selected?.id === entry.id ? 'true' : undefined} onClick={() => choose(entry.id)}>{entry.title}</button>
                </li>
              ))}</ul></section>;
            })}
            {!visible.length && <p className="notes-empty">조건에 맞는 질문이 없습니다.</p>}
          </nav>
        </aside>
        <div className="notes-content">
          <p className="notes-list-intro">키워드의 뜻과 기본 차이를 알고 있는지 짧게 확인하세요. ‘답 보기’로 기본 답을 확인하고, 아는 항목은 학습 완료로 체크하세요.</p>
          {selected && hideDone && data[selected.id]?.done && <p className="notes-empty">이 링크의 질문은 학습 완료되어 숨겨져 있습니다. ‘완료한 지식 숨기기’를 해제하면 다시 볼 수 있습니다.</p>}
          {CS_NOTES.map(section => {
            const list = visible.filter(e => e.section === section.id);
            if (!list.length) return null;
            return <section className="notes-subject" key={section.id} aria-labelledby={`subject-${section.id}`}>
              <h2 id={`subject-${section.id}`} className="notes-subject-title">{section.title}<small>{list.length}개 질문</small></h2>
              {list.map(entry => <article id={entry.id} className={`notes-detail-card ${data[entry.id]?.done ? 'is-done' : ''}`} key={entry.id}>
                <div className="notes-detail-top"><span>{entry.title}</span><label><input type="checkbox" aria-label={`${entry.title} 본문 학습 완료`} checked={!!data[entry.id]?.done} disabled={disabled} onChange={() => toggle(entry.id)} /> 학습 완료</label></div>
                <h3 className="notes-question">{entry.question}</h3>
                <button type="button" className="exam-btn sm notes-reveal" aria-expanded={!!opened[entry.id]} aria-controls={`answer-${entry.id}`} onClick={() => setOpened(prev => ({ ...prev, [entry.id]: !prev[entry.id] }))}>{opened[entry.id] ? '답 숨기기' : '답 보기'}</button>
                <div id={`answer-${entry.id}`} hidden={!opened[entry.id]}>
                  {opened[entry.id] && <><div className="notes-answer"><h4>핵심 답변</h4><p>{entry.answer}</p></div>{entry.detail && <div className="notes-detail"><h4>예시 · 주의점</h4><p>{entry.detail}</p></div>}</>}
                </div>
              </article>)}
            </section>;
          })}
          {!visible.length && <div className="notes-empty"><h2>표시할 질문이 없습니다.</h2><p>완료한 지식 숨기기를 해제하거나 검색·과목 조건을 바꿔보세요.</p></div>}
          <details className="notes-sources"><summary>참고 자료</summary><p>컴퓨터과학 교재의 개념도와 정보처리기사 요약노트를 함께 참고해 핵심 기본기를 선별했습니다. 문답은 새로 작성했으며, 세부 암기·설정법·긴 종합 설명은 제외했습니다.</p><ul>{NOTE_SOURCES.map(s => <li key={s.title}>{s.url ? <a href={s.url} target="_blank" rel="noreferrer">{s.title} ↗</a> : s.title}</li>)}</ul></details>
        </div>
      </div>
    </div>
  );
}
