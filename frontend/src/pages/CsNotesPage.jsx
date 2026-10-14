import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CS_NOTES, NOTE_SOURCES } from '../data/csNotes';
import './CsNotesPage.css';

const total = CS_NOTES.reduce((n, section) => n + section.items.length, 0);

export default function CsNotesPage() {
  const { hash } = useLocation();
  useEffect(() => {
    // Lazy route loading can complete after the browser's initial fragment lookup.
    const id = hash.slice(1);
    if (id && (id === 'notes-top' || id === 'note-sources' || CS_NOTES.some(s => s.id === id))) {
      document.getElementById(id)?.scrollIntoView({ block: 'start' });
    }
  }, [hash]);

  return (
    <div className="cs-notes fade-in" id="notes-top">
      <header className="notes-heading">
        <Link to="/" className="back-link">← 홈으로</Link>
        <p className="notes-kicker">COMPUTER SCIENCE · INTERVIEW NOTES</p>
        <h1>전공노트</h1>
        <p className="notes-lead">개념을 연결하고, 내 말로 설명하기.</p>
        <p className="notes-description">컴퓨터구조부터 데이터베이스까지, 면접에서 묻는 CS 핵심을 한 페이지에 모았습니다. 과목을 누르면 바로 이동하고, 아래로 계속 읽으면 전 과목을 복습할 수 있습니다.</p>
        <div className="notes-facts"><span>{CS_NOTES.length}개 과목</span><span>{total}개 핵심 주제</span><span>Spring 제외 · CS 중심</span></div>
      </header>

      <div className="notes-layout">
        <aside className="notes-index">
          <nav aria-label="전공노트 과목 목차">
            <p className="notes-index-title">과목 바로가기</p>
            <ol>
              {CS_NOTES.map((section, i) => (
                <li key={section.id}><a href={`#${section.id}`}><span className="notes-index-no">{String(i + 1).padStart(2, '0')}</span><span>{section.title}</span><small>{section.items.length}</small></a></li>
              ))}
            </ol>
            <a className="notes-reference-link" href="#note-sources">참고 자료</a>
          </nav>
          <p className="notes-reading-tip">먼저 핵심 답변을 읽고, 예시와 주의점까지 말로 풀어보세요. 용어는 브라우저 찾기(Ctrl/⌘ + F)로 바로 찾을 수 있습니다.</p>
        </aside>

        <div className="notes-content">
          {CS_NOTES.map((section, i) => (
            <section className="notes-subject" id={section.id} key={section.id} aria-labelledby={`${section.id}-title`}>
              <header className="notes-subject-head">
                <span className="notes-subject-no">{String(i + 1).padStart(2, '0')}</span>
                <div><h2 id={`${section.id}-title`}>{section.title}</h2><p>{section.intro}</p></div>
                <a href="#notes-top" className="notes-top-link" aria-label={`${section.title}에서 목차로 이동`}>목차 ↑</a>
              </header>
              {section.items.map((entry, index) => (
                <article className="notes-entry" key={entry.title} aria-labelledby={`${section.id}-${index}-title`}>
                  <h3 id={`${section.id}-${index}-title`}><span className="notes-entry-no">{String(i + 1).padStart(2, '0')}.{String(index + 1).padStart(2, '0')}</span>{entry.title}</h3>
                  <p className="notes-answer">{entry.answer}</p>
                  <div className="notes-detail"><span>예시 · 주의점</span><p>{entry.detail}</p></div>
                </article>
              ))}
            </section>
          ))}
          <section className="notes-sources" id="note-sources" aria-labelledby="notes-sources-title">
            <h2 id="notes-sources-title">참고 자료</h2>
            <p>아래 두 글로 준비 범위를 점검하고, 설명과 예시는 면접 복습용으로 새로 작성했습니다. 프레임워크 내용은 제외했으며, 구현에 따라 달라지는 부분은 표준·공식 문서와 구분해 정리했습니다.</p>
            <h3>준비 범위</h3>
            <ul>{NOTE_SOURCES.filter(s => s.kind === 'scope').map(s => <li key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.title} ↗</a></li>)}</ul>
            <h3>개념 확인</h3>
            <ul>{NOTE_SOURCES.filter(s => s.kind === 'reference').map(s => <li key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.title} ↗</a></li>)}</ul>
            <a href="#notes-top" className="notes-end-link">처음으로 돌아가기 ↑</a>
          </section>
        </div>
      </div>
    </div>
  );
}
