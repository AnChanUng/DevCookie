import { useEffect, useRef, useState } from 'react';
import { daysLeft, loadExams } from '../schedule';
import './StudyNotice.css';

export default function StudyNotice() {
  const dialog = useRef(null);
  const [, refresh] = useState(0);
  useEffect(() => {
    dialog.current.showModal();
    const timer = setInterval(() => refresh(n => n + 1), 60000);
    return () => clearInterval(timer);
  }, []);
  const upcoming = loadExams()
    .map(exam => ({ ...exam, left: daysLeft(exam.date) }))
    .filter(exam => exam.name.trim() && exam.left !== null && exam.left >= 0)
    .sort((a, b) => a.left - b.left);
  return (
    <>
      <button className="study-notice-open" type="button" onClick={() => { refresh(n => n + 1); dialog.current.showModal(); }}>공지사항 · 문제집 풀이 순서</button>
      <dialog className="study-notice" ref={dialog} aria-labelledby="study-notice-title" aria-describedby="study-notice-intro">
        <span className="study-notice-label">공지사항</span>
        <h2 id="study-notice-title">풀어야 하는 우선순위 문제집</h2>
        <p id="study-notice-intro">아래 순서대로 풀고, 틀린 문제는 다시 확인해 주세요.</p>
        <ol className="study-notice-priorities">
          <li>기업별 복기 문제집</li>
          <li>컴퓨터일반 100제</li>
          <li>예상문제집</li>
        </ol>
        <section className="study-notice-dates" aria-label="시험 D-day">
          <h3>다가오는 시험</h3>
          {upcoming.map((exam, i) => <div className="study-notice-exam" key={`${exam.name}-${exam.date}-${i}`}>
            <span>{exam.name}<small>{exam.date.replaceAll('-', '.')}</small></span>
            <strong>{exam.left === 0 ? 'D-DAY' : `D-${exam.left}`}</strong>
          </div>)}
          {!upcoming.length && <p>등록된 예정 시험이 없습니다.</p>}
          <p className="study-notice-help">홈의 ‘시험 일정 → 편집’에서 변경한 일정이 반영됩니다.</p>
        </section>
        <button className="study-notice-confirm" type="button" autoFocus onClick={() => dialog.current.close()}>확인하고 공부 시작</button>
      </dialog>
    </>
  );
}
