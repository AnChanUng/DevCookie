import { Link } from 'react-router-dom';
import { COMPANIES, EXAM_CATEGORIES } from '../data/examQuestions';
import { CompanyCard } from './ExamListPage';

// SSAFY 평가 대비 문제은행. 분류(전공필기 · 월말평가)마다 한 줄씩 카드로 보여 준다
const CATEGORIES = EXAM_CATEGORIES.filter(c => c.hub === 'ssafy');

export default function SsafyPage() {
  return (
    <div className="fade-in">
      <div className="page-header">
        <Link to="/" className="back-link">← 홈으로</Link>
        <h1>🎓 SSAFY</h1>
        <p>SSAFY 과목평가 · 월말평가 대비 · 복기된 출제 범위 기반 · 객관식 즉시 채점 · 단답형 자동 채점 · 서술형 모범답안 비교</p>
      </div>

      {CATEGORIES.map(cat => (
        <section key={cat.key} className="exam-group">
          <div className="section-title">{cat.name}</div>
          <p className="exam-lede">{cat.desc}</p>
          <div className="exam-company-grid">
            {COMPANIES.filter(c => c.category === cat.key).map(c => <CompanyCard key={c.key} company={c} />)}
          </div>
        </section>
      ))}

      <p className="exam-note">
        풀이 기록과 오답은 이 브라우저에 저장됩니다. 기업별 기출문제 첫 화면의 백업 기능으로 SSAFY 기록도 함께 JSON으로 내려받을 수 있습니다.
      </p>
    </div>
  );
}
