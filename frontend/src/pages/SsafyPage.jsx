import { Link } from 'react-router-dom';
import { COMPANIES, EXAM_CATEGORIES, allQuestions, companyPath } from '../data/examQuestions';

// SSAFY 평가 대비 문제은행. 분류(전공필기 · 월말평가)마다 큰 카드 하나씩 나란히 보여 준다
const CATEGORIES = EXAM_CATEGORIES.filter(c => c.hub === 'ssafy');
const BANKS = CATEGORIES.flatMap(cat => COMPANIES.filter(c => c.category === cat.key && c.ready).map(bank => ({ cat, bank })));

const KIND = { obj: '객관식', short: '단답형', essay: '서술형' };
const kindOf = (q) => q.kind || 'obj';

function progress(bank) {
  try {
    const d = JSON.parse(localStorage.getItem(`exam-progress:${bank.key}`) || 'null');
    if (!d) return null;
    const qs = allQuestions(bank);
    return {
      attempts: (d.history || []).length,
      solved: qs.filter(q => d.stats?.[q.id]).length,
      wrong: qs.filter(q => d.stats?.[q.id]?.last === 'w').length,
    };
  } catch {
    return null;
  }
}

export default function SsafyPage() {
  const all = BANKS.flatMap(({ bank }) => allQuestions(bank));
  const kinds = Object.keys(KIND).map(k => [k, all.filter(q => kindOf(q) === k).length]).filter(([, n]) => n);

  return (
    <div className="fade-in ssafy">
      <Link to="/" className="back-link">← 홈으로</Link>

      <section className="ssafy-hero">
        <div className="ssafy-hero-text">
          <span className="ssafy-eyebrow">SSAFY · 알고리즘</span>
          <h1>과목평가 · 월말평가 대비</h1>
          <p>복기된 출제 범위를 따라 만든 문제로 실전처럼 풀어 보세요. 객관식은 바로 채점하고, 단답형은 입력하면 자동으로 채점하며, 서술형은 모범답안과 채점 포인트를 보고 직접 채점합니다.</p>
        </div>
        <div className="ssafy-hero-stats">
          <div className="ssafy-stat big"><b>{all.length}</b><span>전체 문항</span></div>
          {kinds.map(([k, n]) => <div key={k} className="ssafy-stat"><b>{n}</b><span>{KIND[k]}</span></div>)}
        </div>
      </section>

      <div className="ssafy-grid">
        {BANKS.map(({ cat, bank }) => {
          const qs = allQuestions(bank);
          const p = progress(bank);
          const pct = p ? Math.round(p.solved / qs.length * 100) : 0;
          const topics = [...new Set(qs.map(q => q.topic))];
          return (
            <Link key={bank.key} to={companyPath(bank)} className={`ssafy-card ${cat.key}`}>
              <div className="ssafy-card-top">
                <span className="ssafy-tag">{cat.name}</span>
                <span className="ssafy-time">⏱ {bank.minutes}분</span>
              </div>
              <h2>{bank.name.replace('SSAFY ', '')}</h2>
              <p className="ssafy-desc">{cat.desc}</p>

              <div className="ssafy-secs">
                {Object.entries(bank.sections).map(([k, s]) => (
                  <div key={k} className="ssafy-sec">
                    <b>{bank.questions.filter(q => q.sec === k).length}</b>
                    <span>{s.name}</span>
                  </div>
                ))}
              </div>

              <div className="ssafy-topics">
                {topics.slice(0, 9).map(t => <span key={t}>{t}</span>)}
                {topics.length > 9 && <span className="more">+{topics.length - 9}</span>}
              </div>

              <div className="ssafy-foot">
                <div className="ssafy-progress">
                  <div className="ssafy-progress-label">
                    {p ? <>푼 문제 {p.solved}/{qs.length} · 응시 {p.attempts}회 · 오답 {p.wrong}</> : <>아직 풀지 않았어요 · {qs.length}문항</>}
                  </div>
                  <div className="ssafy-bar"><i style={{ width: `${pct}%` }} /></div>
                </div>
                <span className="ssafy-go">풀러 가기 →</span>
              </div>
            </Link>
          );
        })}
      </div>

      <p className="exam-note">
        풀이 기록과 오답은 이 브라우저에 저장됩니다. 기업별 기출문제 첫 화면의 백업 기능으로 SSAFY 기록도 함께 JSON으로 내려받을 수 있습니다.
      </p>
    </div>
  );
}
