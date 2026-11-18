import { useEffect, useRef } from 'react';
import './StudyNotice.css';

const DISMISSED_KEY = 'study:priority-notice:dismissed';
export default function StudyNotice() {
  const dialog = useRef(null);
  useEffect(() => {
    let dismissed = false;
    try { dismissed = localStorage.getItem(DISMISSED_KEY) === 'true'; } catch { /* Storage unavailable. */ }
    if (!dismissed) dialog.current.showModal();
  }, []);
  const dismiss = () => {
    try { localStorage.setItem(DISMISSED_KEY, 'true'); } catch { /* Still allow closing. */ }
    dialog.current.close();
  };
  return (
    <>
      <dialog className="study-notice" ref={dialog} aria-labelledby="study-notice-title">
        <span className="study-notice-label">공지사항</span>
        <h2 id="study-notice-title">문제집 풀이 우선순위</h2>
        <ol className="study-notice-priorities">
          <li>기업별 예상문제집</li>
          <li>주제별 통합 문제집</li>
          <li>전공노트 복습</li>
        </ol>
        <div className="study-notice-update">
          <time dateTime="2026-10-15">2026.10.15</time>
          <p>면접·전공필기 대비, 키워드별 답변을 준비하는 <strong>전공노트</strong>가 추가되었습니다.</p>
        </div>
        <div className="study-notice-actions">
          <button className="study-notice-dismiss" type="button" onClick={dismiss}>다시 보지 않기</button>
          <button className="study-notice-confirm" type="button" autoFocus onClick={() => dialog.current.close()}>닫기</button>
        </div>
      </dialog>
    </>
  );
}
