import { Link } from 'react-router-dom';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

// 필기 시험일. 지난 시험은 첫 화면에서 자동으로 빠진다
const EXAMS = [
  { name: '기업은행', date: '2026-10-17', to: '/exam/ibk' },
  { name: '코스콤', date: '2026-10-24', to: '/exam/koscom' },
  { name: '현대오토에버', date: '2026-10-25' },
];

function daysLeft(day) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((day - today) / 86400000);
}

// 시험 일정 · D-day를 한 줄로 보여 준다. 문제은행이 있는 시험만 그 은행으로 이어진다
export default function StudyGoal() {
  const exams = EXAMS
    .map(e => {
      const day = new Date(`${e.date}T00:00:00`);
      return { ...e, left: daysLeft(day), when: `${day.getMonth() + 1}.${day.getDate()} (${WEEKDAYS[day.getDay()]})` };
    })
    .filter(e => e.left >= 0);

  if (exams.length === 0) return null;

  return (
    <div className="goal-strip">
      <span className="goal-label">시험 일정</span>
      {exams.map(e => {
        const body = (
          <>
            <span className="goal-title">{e.name}</span>
            <span className="goal-dday">{e.left === 0 ? 'D-DAY' : `D-${e.left}`}</span>
          </>
        );
        return e.to
          ? <Link key={e.name} to={e.to} className="goal-exam" title={e.when}>{body}</Link>
          : <span key={e.name} className="goal-exam" title={e.when}>{body}</span>;
      })}
    </div>
  );
}
