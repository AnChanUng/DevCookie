import { Link, Navigate, useParams } from 'react-router-dom';
import { COMPANIES, EXAM_CATEGORIES, SOURCE_KINDS, allQuestions } from '../data/examQuestions';
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
        <p>공기업 IT직무 전공필기 · 복기 자료 기반 문제집과 출제범위 기반 예상문제집 · 즉시 채점 · 오답노트 · 북마크</p>
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
              <span className="exam-category-mix">
                📕 복기 {ready.filter(c => c.source?.kind === 'recall').length}곳 · 📝 예상 {ready.filter(c => c.source?.kind !== 'recall').length}곳
              </span>
              <span className="exam-tag">
                {list.length}개 {cat.unit || '기업'} · {total}문항{attempts ? ` · 응시 ${attempts}회 · 오답 ${wrong}문제` : ''}
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

function CompanyCard({ company }) {
  const s = company.ready ? summary(company) : null;
  const recall = company.source?.kind === 'recall';
  const inner = (
    <>
      <span className="exam-company-abbr">{company.abbr}</span>
      <span className="exam-company-name">{company.name}</span>
      {recall && <span className="exam-company-source">{company.source.label}</span>}
      <span className="exam-company-meta">{company.meta}</span>
      <span className={`exam-tag ${company.ready ? '' : 'soon'}`}>
        {!company.ready ? '준비 중' : s?.attempts ? `응시 ${s.attempts}회 · 오답 ${s.wrong}문제` : '풀이 시작 가능'}
      </span>
    </>
  );
  return company.ready ? (
    <Link to={`/exam/${company.key}`} className="exam-company-card">{inner}</Link>
  ) : (
    <div className="exam-company-card disabled">{inner}</div>
  );
}

// 복기 자료로 만든 문제은행과 출제범위만 보고 만든 예상문제집을 갈라서 보여 준다
function CompanyList({ category }) {
  const list = COMPANIES.filter(c => c.category === category.key);
  const groups = ['recall', 'predicted']
    .map(kind => ({ kind, ...SOURCE_KINDS[kind], items: list.filter(c => (c.source?.kind || 'predicted') === kind) }))
    .filter(g => g.items.length);

  return (
    <div className="fade-in">
      <div className="page-header">
        <Link to="/exam" className="back-link">← 기업별 기출문제</Link>
        <h1>📚 {category.name}</h1>
        <p>{category.desc}</p>
      </div>

      {groups.map(g => (
        <section key={g.kind} className="exam-group">
          <div className="section-title">{g.icon} {g.group} <span className="exam-group-count">{g.items.length}곳</span></div>
          <p className="exam-lede">{g.detail}</p>
          <div className="exam-company-grid">
            {g.items.map(c => <CompanyCard key={c.key} company={c} />)}
          </div>
        </section>
      ))}

      {NOTE}
    </div>
  );
}
