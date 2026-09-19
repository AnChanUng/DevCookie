import { Link, Navigate, useParams } from 'react-router-dom';
import { COMPANIES, EXAM_CATEGORIES, allQuestions } from '../data/examQuestions';
import ProgressBackup from '../components/ProgressBackup';

function summary(company) {
  try {
    const raw = localStorage.getItem(`exam-progress:${company.key}`);
    if (!raw) return null;
    const d = JSON.parse(raw);
    const wrong = allQuestions(company).filter(q => d.stats?.[q.id]?.last === 'w').length;
    return { attempts: (d.history || []).length, wrong };
  } catch {
    return null;
  }
}

const NOTE = (
  <p className="exam-note">
    풀이 기록과 오답은 이 브라우저에 저장됩니다. 다른 기기로 옮기거나 브라우저 데이터를 지우기 전에는 위에서 JSON으로 내려받아 두세요.
  </p>
);

// /exam 은 분류(금융공기업 / 공기업) 선택, /exam/category/:category 는 그 분류의 기업 목록
export default function ExamListPage() {
  const { category: key } = useParams();
  if (!key) return <CategoryPicker />;
  const category = EXAM_CATEGORIES.find(c => c.key === key);
  if (!category) return <Navigate to="/exam" replace />;
  return <CompanyList category={category} />;
}

function CategoryPicker() {
  return (
    <div className="fade-in">
      <div className="page-header">
        <Link to="/" className="back-link">← 홈으로</Link>
        <h1>📚 기업별 기출문제</h1>
        <p>공기업 IT직무 전공필기 · 응시 후기 기반 자체 제작 문제은행 · 즉시 채점 · 오답노트 · 북마크</p>
      </div>

      <div className="exam-category-grid">
        {EXAM_CATEGORIES.map(cat => {
          const list = COMPANIES.filter(c => c.category === cat.key);
          const ready = list.filter(c => c.ready);
          const total = ready.reduce((n, c) => n + allQuestions(c).length, 0);
          const sums = ready.map(summary).filter(Boolean);
          const attempts = sums.reduce((n, s) => n + s.attempts, 0);
          const wrong = sums.reduce((n, s) => n + s.wrong, 0);
          return (
            <Link key={cat.key} to={`/exam/category/${cat.key}`} className="exam-company-card exam-category-card">
              <span className="exam-category-name">{cat.name}</span>
              <span className="exam-company-meta">{cat.desc}</span>
              <span className="exam-category-names">{list.map(c => c.name).join(' · ')}</span>
              <span className="exam-tag">
                {list.length}개 기업 · {total}문항{attempts ? ` · 응시 ${attempts}회 · 오답 ${wrong}문제` : ''}
              </span>
            </Link>
          );
        })}
      </div>

      <ProgressBackup />
      {NOTE}
    </div>
  );
}

function CompanyList({ category }) {
  return (
    <div className="fade-in">
      <div className="page-header">
        <Link to="/exam" className="back-link">← 기업별 기출문제</Link>
        <h1>📚 {category.name}</h1>
        <p>{category.desc} · 응시 후기 기반 자체 제작 문제은행</p>
      </div>

      <div className="exam-company-grid">
        {COMPANIES.filter(c => c.category === category.key).map(c => {
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

      {NOTE}
    </div>
  );
}
