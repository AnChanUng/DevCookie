import { useEffect, useState, useSyncExternalStore } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { WEB_ESSENTIALS, WEB_NOTE_SOURCES } from '../data/webEssentials';
import { account, onAccountChange } from '../sync';
import useNotesProgress from '../hooks/useNotesProgress';
import NoteAnswer from '../components/NoteAnswer';
import './CsNotesPage.css';
import './WebEssentialsPage.css';

const topics = ['웹 통신', '데이터와 저장소', '동시성과 실행 모델', '보안', '테스트', '설계', '개발과 운영', '학습 방향'];
const entries = WEB_ESSENTIALS.items;
const path = '/notes/web-essentials';
const tokenSnapshot = () => account()?.token || '';

export default function WebEssentialsPage() {
  const token = useSyncExternalStore(onAccountChange, tokenSnapshot, () => '');
  return <WebReader key={token} user={token ? account() : null} />;
}

function WebReader({ user }) {
  const { hash } = useLocation();
  const navigate = useNavigate();
  const [topic, setTopic] = useState(topics[0]);
  const [query, setQuery] = useState('');
  const { data, status, toggle, retry, disabled } = useNotesProgress(user);
  const linked = entries.find(entry => `#${entry.id}` === hash);
  const currentTopic = linked?.topic || topic;
  const search = query.trim().toLowerCase();
  const visible = entries.filter(entry => search
    ? `${entry.title} ${entry.question}`.toLowerCase().includes(search)
    : entry.topic === currentTopic);
  const selected = visible.find(entry => entry.id === linked?.id) || visible[0];
  const position = visible.findIndex(entry => entry.id === selected?.id);
  const completed = entries.filter(entry => data[entry.id]?.done).length;
  const choose = entry => navigate(`${path}#${entry.id}`, { replace: true });
  const chooseTopic = next => {
    setTopic(next);
    setQuery('');
    navigate(path, { replace: true });
  };
  useEffect(() => {
    if (hash && selected && hash === `#${selected.id}`) document.getElementById(selected.id)?.scrollIntoView({ block: 'start' });
  }, [hash, selected]);
  const statusText = {
    guest: '학습 완료 기록은 로그인 후 계정에 저장됩니다.', loading: '계정 기록을 불러오는 중…',
    saving: '계정에 저장하는 중…', saved: '계정에 저장됨',
    error: '서버 연결에 실패했습니다. 변경된 체크는 이 기기에 보관되며 재시도하면 저장됩니다.',
    expired: '로그인이 만료되었습니다. 내 계정에서 다시 로그인해 주세요.',
  }[status];

  return <div className="cs-notes web-essentials">
    <Link className="web-back" to="/notes">← 전공노트</Link>
    <header className="notes-heading">
      <div><h1>웹 필수지식</h1><p>8개 주제에서 골라 한 문답씩 읽어보세요.</p></div>
      <div className="notes-progress"><strong>학습 완료 {completed} / {entries.length}</strong><progress value={completed} max={entries.length} aria-label="웹 필수지식 학습 완료" /></div>
    </header>
    <div className="notes-save-status" role="status">{statusText} {status === 'error' && <button type="button" onClick={retry}>다시 저장</button>}</div>
    <nav className="web-topic-picker" aria-label="웹 필수지식 주제">
      {topics.map(title => {
        const list = entries.filter(entry => entry.topic === title);
        return <button key={title} type="button" aria-label={title} aria-pressed={currentTopic === title} onClick={() => chooseTopic(title)}>
          <span>{title}</span><small>{list.filter(entry => data[entry.id]?.done).length}/{list.length}</small>
        </button>;
      })}
    </nav>
    <div className="web-reader-layout">
      <aside className="web-reader-index">
        <input className="web-reader-search" type="search" aria-label="웹 필수지식 검색" placeholder="50문답에서 질문 검색" value={query} onChange={event => setQuery(event.target.value)} />
        <select className="web-reader-select" aria-label="웹 필수지식 질문 선택" value={selected?.id || ''} disabled={!visible.length} onChange={event => choose(visible.find(entry => entry.id === event.target.value))}>
          {!visible.length && <option value="">검색 결과가 없습니다</option>}
          {visible.map((entry, index) => <option key={entry.id} value={entry.id}>{index + 1}. {entry.title}{data[entry.id]?.done ? ' ✓' : ''}</option>)}
        </select>
        <h2>{search ? '검색 결과' : currentTopic}<small>{visible.length}개 질문</small></h2>
        <nav aria-label="웹 필수지식 질문 목록">
          <ol>{visible.map(entry => <li key={entry.id}>
            <button type="button" aria-current={selected?.id === entry.id ? 'true' : undefined} onClick={() => choose(entry)}>
              {entry.title}{data[entry.id]?.done && <span className="web-done" aria-label="학습 완료">✓</span>}
            </button>
          </li>)}</ol>
          {!visible.length && <p className="notes-empty">검색 결과가 없습니다.</p>}
        </nav>
      </aside>
      <div className="web-reader-content">
        {selected ? <article id={selected.id} className="notes-detail-card">
          <div className="notes-detail-top"><span>{selected.topic} / {position + 1}번째 질문</span><label><input type="checkbox" aria-label={`${selected.title} 학습 완료`} checked={!!data[selected.id]?.done} disabled={disabled} onChange={() => toggle(selected.id)} /> 학습 완료</label></div>
          <h2 className="notes-question">{selected.question}</h2>
          <NoteAnswer entry={selected} />
          <nav className="web-reader-pager" aria-label="문답 이동">
            <button type="button" className="exam-btn sm" disabled={position === 0} onClick={() => choose(visible[position - 1])}>← 이전 질문</button>
            <span>{position + 1} / {visible.length}</span>
            <button type="button" className="exam-btn sm" disabled={position === visible.length - 1} onClick={() => choose(visible[position + 1])}>다음 질문 →</button>
          </nav>
        </article> : <div className="notes-empty"><p>검색어를 바꾸거나 주제를 선택해 주세요.</p><button type="button" className="exam-btn sm" onClick={() => setQuery('')}>검색 지우기</button></div>}
        <details className="notes-sources"><summary>참고 글과 작성 기준</summary><p>{WEB_ESSENTIALS.description}</p><a href={WEB_NOTE_SOURCES[0].url} target="_blank" rel="noreferrer">{WEB_NOTE_SOURCES[0].title} ↗</a><p>2026.10.28 작성. 개념별 참고 문서는 각 모범답안 아래에 연결했습니다.</p></details>
      </div>
    </div>
  </div>;
}
