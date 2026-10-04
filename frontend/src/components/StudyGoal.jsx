import { useState } from 'react';
import { Link } from 'react-router-dom';
import { daysLeft, loadExams, saveExams } from '../schedule';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

// 시험 일정 · D-day를 한 줄로 보여 준다. 문제은행이 걸린 시험은 그 은행으로 이어지고,
// "편집"으로 일정을 직접 넣고 뺄 수 있다. 지난 시험은 줄에서 자동으로 빠진다
export default function StudyGoal() {
  const [exams, setExams] = useState(loadExams);
  const [editing, setEditing] = useState(false);
  const [banks, setBanks] = useState(null); // 편집을 열 때만 문제은행 목록을 불러온다

  const update = (next) => { setExams(next); saveExams(next); };
  const change = (i, patch) => update(exams.map((e, n) => (n === i ? { ...e, ...patch } : e)));

  const openEditor = () => {
    setEditing(true);
    if (banks) return;
    import('../data/examQuestions')
      .then(m => setBanks(m.COMPANIES.filter(c => c.ready).map(c => ({ name: c.name, to: m.companyPath(c) }))))
      .catch(() => setBanks([]));
  };

  // 문제은행을 고르면 주소를 걸고, 이름이 비어 있으면 그 은행 이름으로 채운다
  const linkBank = (i, to) => {
    const bank = banks?.find(b => b.to === to);
    change(i, { to: to || undefined, ...(bank && !exams[i].name.trim() ? { name: bank.name } : {}) });
  };

  const upcoming = exams
    .map(e => {
      const day = new Date(`${e.date}T00:00:00`);
      return { ...e, left: daysLeft(e.date), when: `${day.getMonth() + 1}.${day.getDate()} (${WEEKDAYS[day.getDay()]})` };
    })
    .filter(e => e.name.trim() && e.left !== null && e.left >= 0)
    .sort((a, b) => a.left - b.left);

  return (
    <>
      <div className="goal-strip">
        <span className="goal-label">시험 일정</span>
        {upcoming.map((e, i) => {
          const body = (
            <>
              <span className="goal-title">{e.name}</span>
              <span className="goal-dday">{e.left === 0 ? 'D-DAY' : `D-${e.left}`}</span>
            </>
          );
          return e.to
            ? <Link key={i} to={e.to} className="goal-exam" title={e.when}>{body}</Link>
            : <span key={i} className="goal-exam" title={e.when}>{body}</span>;
        })}
        {upcoming.length === 0 && <span className="goal-none">등록된 일정이 없습니다</span>}
        <button type="button" className="goal-edit" onClick={() => (editing ? setEditing(false) : openEditor())}>{editing ? '닫기' : '편집'}</button>
      </div>

      {editing && (
        <div className="goal-editor">
          {exams.map((e, i) => (
            <div key={i} className="goal-row">
              <input type="text" placeholder="시험 이름" maxLength={20} value={e.name} onChange={ev => change(i, { name: ev.target.value })} />
              <input type="date" value={e.date} onChange={ev => change(i, { date: ev.target.value })} />
              <select value={e.to || ''} onChange={ev => linkBank(i, ev.target.value)}>
                <option value="">문제집 연결 안 함</option>
                {/* 목록을 아직 못 받았어도 지금 걸린 연결은 지워지지 않게 그대로 보여 준다 */}
                {e.to && !banks?.some(b => b.to === e.to) && <option value={e.to}>연결됨</option>}
                {(banks || []).map(b => <option key={b.to} value={b.to}>{b.name}</option>)}
              </select>
              <button type="button" className="goal-del" onClick={() => update(exams.filter((_, n) => n !== i))} aria-label="일정 삭제">✕</button>
            </div>
          ))}
          <div className="goal-editor-foot">
            <button type="button" className="goal-edit" onClick={() => update([...exams, { name: '', date: '' }])}>+ 일정 추가</button>
            <span>문제집을 연결하면 그 문제집 화면에 하루 목표가 나옵니다. 일정은 이 브라우저에 저장됩니다.</span>
          </div>
        </div>
      )}
    </>
  );
}
