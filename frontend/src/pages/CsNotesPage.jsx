import { useState, useSyncExternalStore } from 'react';
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
  const { data, status, toggle, retry, disabled } = useNotesProgress(user);
  const selected = entries.find(e => e.id === hash.slice(1));
  const completed = entries.filter(e => data[e.id]?.done).length;
  const visible = entries.filter(e => (!subject || e.section === subject) && (!hideDone || !data[e.id]?.done) && e.title.toLowerCase().includes(query.trim().toLowerCase()));
  const choose = id => navigate(`/notes#${id}`, { replace: true });
  const statusText = {
    guest: '학습 완료 기록은 로그인 후 계정에 저장됩니다.', loading: '계정 기록을 불러오는 중…',
    saving: '계정에 저장하는 중…', saved: '계정에 저장됨',
    error: '서버 연결에 실패했습니다. 변경된 체크는 이 기기에 보관되며 재시도하면 저장됩니다.',
    expired: '로그인이 만료되었습니다. 내 계정에서 다시 로그인해 주세요.',
  }[status];
  return (
    <div className="cs-notes">
      <header className="notes-heading">
        <div><h1>전공노트</h1><p>9과목 · 100개 주제 · Spring 제외</p></div>
        <div className="notes-progress"><strong>학습 완료 {completed} / {entries.length}</strong><progress value={completed} max={entries.length} aria-label="전공노트 학습 완료" /></div>
        <Link to="/account">내 계정 →</Link>
      </header>
      <div className="notes-save-status" role="status">{statusText} {(status === 'error') && <button type="button" onClick={retry}>다시 저장</button>}</div>
      <div className="notes-layout">
        <aside className="notes-index">
          <div className="notes-filters">
            <input aria-label="질문 검색" placeholder="질문 검색…" value={query} onChange={e => setQuery(e.target.value)} />
            <select aria-label="과목 선택" value={subject} onChange={e => setSubject(e.target.value)}><option value="">전 과목</option>{CS_NOTES.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}</select>
            <label><input type="checkbox" checked={hideDone} onChange={e => setHideDone(e.target.checked)} /> 완료한 지식 숨기기</label>
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
          {selected ? <article className={`notes-detail-card ${data[selected.id]?.done ? 'is-done' : ''}`} key={selected.id}>
            <div className="notes-detail-top"><span>{selected.subject}</span><label><input type="checkbox" checked={!!data[selected.id]?.done} disabled={disabled} onChange={() => toggle(selected.id)} /> 충분히 공부했어요</label></div>
            <h2>{selected.title}</h2>
            <div className="notes-answer"><h3>핵심 답변</h3><p>{selected.answer}</p></div>
            <div className="notes-detail"><h3>예시 · 주의점</h3><p>{selected.detail}</p></div>
            <p className="notes-tip">답을 내 말로 설명할 수 있다면 학습 완료를 체크하세요. 체크는 언제든 해제할 수 있습니다.</p>
          </article> : <div className="notes-empty notes-welcome"><h2>질문을 선택해 시작하세요</h2><p>왼쪽에서 질문을 누르면 핵심 답변과 예시가 여기에 표시됩니다.</p><p>공부가 끝난 지식은 체크해 두고, 남은 질문에 집중하세요.</p></div>}
          <details className="notes-sources"><summary>참고 자료</summary><p>참고 글의 준비 범위를 바탕으로 설명과 예시를 새로 작성했습니다.</p><ul>{NOTE_SOURCES.map(s => <li key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.title} ↗</a></li>)}</ul></details>
        </div>
      </div>
    </div>
  );
}
