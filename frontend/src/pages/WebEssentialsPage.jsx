import { useEffect, useSyncExternalStore } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { WEB_ESSENTIALS, WEB_NOTE_SOURCES } from '../data/webEssentials';
import { account, onAccountChange } from '../sync';
import useNotesProgress from '../hooks/useNotesProgress';
import NoteAnswer from '../components/NoteAnswer';
import './CsNotesPage.css';
import './WebEssentialsPage.css';

const topics = ['웹 통신', '데이터와 저장소', '동시성과 실행 모델', '보안', '테스트', '설계', '개발과 운영', '학습 방향'];
const entries = WEB_ESSENTIALS.items;
const sections = topics.map((title, index) => ({ id: `web-topic-${index + 1}`, title, items: entries.filter(entry => entry.topic === title) }));
const numbers = new Map(sections.flatMap(section => section.items).map((entry, index) => [entry.id, index + 1]));
const tokenSnapshot = () => account()?.token || '';

export default function WebEssentialsPage() {
  const token = useSyncExternalStore(onAccountChange, tokenSnapshot, () => '');
  return <WebChannel key={token} user={token ? account() : null} />;
}

function WebChannel({ user }) {
  const { hash } = useLocation();
  const { data, status, toggle, retry, disabled } = useNotesProgress(user);
  const completed = entries.filter(entry => data[entry.id]?.done).length;
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start' });
  }, [hash]);
  const statusText = {
    guest: '학습 완료 기록은 로그인 후 계정에 저장됩니다.', loading: '계정 기록을 불러오는 중…',
    saving: '계정에 저장하는 중…', saved: '계정에 저장됨',
    error: '서버 연결에 실패했습니다. 변경된 체크는 이 기기에 보관되며 재시도하면 저장됩니다.',
    expired: '로그인이 만료되었습니다. 내 계정에서 다시 로그인해 주세요.',
  }[status];

  return <div className="cs-notes web-channel">
    <header className="notes-heading">
      <div><h1>웹 필수지식</h1><p>정리한 질문과 모범답안 50개를 한곳에 모았습니다.</p></div>
      <div className="notes-progress"><strong>학습 완료 {completed} / {entries.length}</strong><progress value={completed} max={entries.length} aria-label="웹 필수지식 학습 완료" /></div>
    </header>
    <div className="notes-save-status" role="status">{statusText} {status === 'error' && <button type="button" onClick={retry}>다시 저장</button>}</div>
    <nav className="web-channel-toc" aria-label="웹 필수지식 목차">
      {sections.map(section => <Link key={section.id} to={`/web-essentials#${section.id}`}>{section.title}<small>{section.items.length}</small></Link>)}
    </nav>
    {sections.map(section => <section key={section.id} id={section.id} className="web-channel-topic" aria-labelledby={`${section.id}-title`}>
      <h2 id={`${section.id}-title`}>{section.title}<small>{section.items.length}문답</small></h2>
      {section.items.map(entry => <article key={entry.id} id={entry.id} className="notes-detail-card">
        <div className="notes-detail-top"><span>Q{numbers.get(entry.id)}</span><label><input type="checkbox" aria-label={`${entry.title} 학습 완료`} checked={!!data[entry.id]?.done} disabled={disabled} onChange={() => toggle(entry.id)} /> 학습 완료</label></div>
        <h3 className="notes-question">{entry.question}</h3>
        <NoteAnswer entry={entry} />
      </article>)}
    </section>)}
    <details className="notes-sources"><summary>참고 글과 작성 기준</summary><p>{WEB_ESSENTIALS.description}</p><a href={WEB_NOTE_SOURCES[0].url} target="_blank" rel="noreferrer">{WEB_NOTE_SOURCES[0].title} ↗</a><p>2026.10.28 작성. 개념별 참고 문서는 각 모범답안 아래에 연결했습니다.</p></details>
  </div>;
}
