import { Link } from 'react-router-dom';
export default function SsafyPage() {
  return <div className="fade-in ssafy">
    <Link to="/" className="back-link">← 홈으로</Link>
    <section className="ssafy-hero"><div className="ssafy-hero-text">
      <span className="ssafy-eyebrow">SSAFY · 과목평가 대비</span><h1>DB 객관식 30문제</h1>
      <p>Servlet · JSP · SQL 핵심 범위를 4지선다로 풀고, 정답과 해설로 확인하세요.</p>
      <Link to="/ssafy/ssafydb" className="home-cta-btn primary">DB 30문제 풀러 가기 →</Link>
    </div><div className="ssafy-hero-stats"><div className="ssafy-stat big"><b>30</b><span>4지선다 객관식</span></div></div></section>
    <Link to="/ssafy/ssafydb" className="ssafy-card major">
      <div className="ssafy-card-top"><span className="ssafy-tag">지금 공부할 문제집</span></div>
      <h2>DB</h2><p className="ssafy-desc">Servlet 생명주기·동시성·URL 매핑·Filter / JSP·세션 / SQL·트랜잭션·서브쿼리 / 정규화·인덱스</p>
      <div className="ssafy-topics">{['forward vs redirect', 'WHERE vs HAVING', 'MySQL 8.4 · InnoDB', '정답·해설 포함'].map(t=><span key={t}>{t}</span>)}</div>
      <div className="ssafy-foot"><span>객관식 30문제 · 시간 제한 없음</span><span className="ssafy-go">풀러 가기 →</span></div>
    </Link>
  </div>;
}
