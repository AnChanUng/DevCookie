import { useState } from 'react';
import { Link } from 'react-router-dom';

const KEY = 'study-goal';
const DEFAULT_DAILY = 30;
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

// 필기 시험일. 지난 시험은 첫 화면에서 자동으로 빠진다
const EXAMS = [
  { name: '기업은행', date: '2026-10-17', to: '/exam/ibk' },
  { name: '코스콤', date: '2026-10-24', to: '/exam/koscom' },
];

function readDaily() {
  try {
    const daily = Number(JSON.parse(localStorage.getItem(KEY))?.daily);
    return daily > 0 ? daily : DEFAULT_DAILY;
  } catch {
    return DEFAULT_DAILY;
  }
}

// 오늘 푼 문제 수: 모든 문제은행의 풀이 기록에서 마지막 풀이 시각이 오늘인 문제를 센다
function solvedToday() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  let n = 0;
  try {
    for (const k of Object.keys(localStorage)) {
      if (!k.startsWith('exam-progress:')) continue;
      try {
        const stats = JSON.parse(localStorage.getItem(k))?.stats || {};
        n += Object.values(stats).filter(s => (s.at || 0) >= start.getTime()).length;
      } catch { /* 깨진 기록은 건너뛴다 */ }
    }
  } catch {
    /* storage unavailable */
  }
  return n;
}

function daysLeft(day) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((day - today) / 86400000);
}

// 시험 일정 · D-day와 하루 목표. 계정이 없는 사이트라 목표는 이 브라우저에만 저장한다
export default function StudyGoal() {
  const [daily, setDaily] = useState(readDaily);
  const [draft, setDraft] = useState(null);
  const [solved] = useState(solvedToday);
  const exams = EXAMS
    .map(e => {
      const day = new Date(`${e.date}T00:00:00`);
      return { ...e, left: daysLeft(day), when: `${day.getMonth() + 1}.${day.getDate()} (${WEEKDAYS[day.getDay()]})` };
    })
    .filter(e => e.left >= 0);

  const save = (e) => {
    e.preventDefault();
    const next = Math.max(1, Math.min(500, Number(draft) || DEFAULT_DAILY));
    try { localStorage.setItem(KEY, JSON.stringify({ daily: next })); } catch { /* 무시 */ }
    setDaily(next);
    setDraft(null);
  };

  return (
    <aside className="goal-card">
      {exams.length > 0 && (
        <>
          <div className="goal-label">시험 일정</div>
          {exams.map(e => (
            <Link key={e.name} to={e.to} className="goal-exam">
              <span>
                <span className="goal-title">{e.name}</span>
                <span className="goal-sub">{e.when}</span>
              </span>
              <span className="goal-dday">{e.left === 0 ? 'D-DAY' : `D-${e.left}`}</span>
            </Link>
          ))}
        </>
      )}

      <div className="goal-today">
        <div className="goal-today-head">
          <span className="goal-label">오늘 {solved} / {daily}문제</span>
          {draft === null ? (
            <button type="button" className="goal-edit" onClick={() => setDraft(String(daily))}>목표 수정</button>
          ) : (
            <form className="goal-form" onSubmit={save}>
              <input type="number" min="1" max="500" value={draft} onChange={e => setDraft(e.target.value)} aria-label="하루 목표 문제 수" autoFocus />
              <button type="submit" className="goal-edit">저장</button>
            </form>
          )}
        </div>
        <span className="goal-bar"><i style={{ width: `${Math.round(Math.min(solved, daily) / daily * 100)}%` }} /></span>
      </div>
    </aside>
  );
}
