import { Link } from 'react-router-dom';
import { COMPANIES } from '../data/examQuestions';
import ProgressBackup from '../components/ProgressBackup';

function summary(company) {
  try {
    const raw = localStorage.getItem(`exam-progress:${company.key}`);
    if (!raw) return null;
    const d = JSON.parse(raw);
    const wrong = [...company.questions, ...(company.extra || [])].filter(q => d.stats?.[q.id]?.last === 'w').length;
    return { attempts: (d.history || []).length, wrong };
  } catch {
    return null;
  }
}

export default function ExamListPage() {
  return (
    <div className="fade-in">
      <div className="page-header">
        <Link to="/" className="back-link">← 홈으로</Link>
        <h1>📚 기업별 기출문제</h1>
        <p>공기업 IT직무 전공필기 · 응시 후기 기반 자체 제작 문제은행 · 즉시 채점 · 오답노트 · 북마크</p>
      </div>

      <div className="exam-company-grid">
        {COMPANIES.map(c => {
          const s = c.ready ? summary(c) : null;
          const inner = (
            <>
              <span className="exam-company-abbr">{c.abbr}</span>
              <span className="exam-company-name">{c.name}</span>
              <span className="exam-company-meta">{c.meta}</span>
              <span className={`exam-tag ${c.ready ? '' : 'soon'}`}>
                {!c.ready ? '준비 중' : s?.attempts ? `응시 ${s.attempts}회 · 오답 ${s.wrong}문제` : '풀이 시작 가능'}
              </span>
            </>
          );
          return c.ready ? (
            <Link key={c.key} to={`/exam/${c.key}`} className="exam-company-card">{inner}</Link>
          ) : (
            <div key={c.key} className="exam-company-card disabled">{inner}</div>
          );
        })}
      </div>

      <ProgressBackup />

      <p className="exam-note">
        풀이 기록과 오답은 이 브라우저에 저장됩니다. 다른 기기로 옮기거나 브라우저 데이터를 지우기 전에는 위에서 JSON으로 내려받아 두세요.
      </p>
    </div>
  );
}
