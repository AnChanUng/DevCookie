import { Link } from 'react-router-dom';
import { COMPANIES } from '../data/examQuestions';
import { useAuth } from '../contexts/useAuth';

function summary(company, userId) {
  try {
    const raw = localStorage.getItem(userId ? `exam-progress:${company.key}:${userId}` : `exam-progress:${company.key}`);
    if (!raw) return null;
    const d = JSON.parse(raw);
    const wrong = company.questions.filter(q => d.stats?.[q.id]?.last === 'w').length;
    return { attempts: (d.history || []).length, wrong };
  } catch {
    return null;
  }
}

export default function ExamListPage() {
  const { user } = useAuth();
  return (
    <div className="fade-in">
      <div className="page-header">
        <Link to="/" className="back-link">← 홈으로</Link>
        <h1>📚 기출문제</h1>
        <p>금융공기업 IT직무 전공필기 · 출제 경향 기반 자체 제작 문제은행</p>
      </div>

      <div className="exam-company-grid">
        {COMPANIES.map(c => {
          const s = c.ready ? summary(c, user?.id) : null;
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

      <p className="exam-note">
        문제는 2021~2026년 응시 후기에서 반복 언급된 주제를 중심으로 자체 제작한 것으로, 실제 시험 문항을 복제한 것이 아닙니다.
        로그인하면 풀이 기록과 오답이 계정에 저장되어 어느 기기에서든 이어서 풀 수 있습니다.
      </p>
    </div>
  );
}
