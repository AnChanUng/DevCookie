import { Link } from 'react-router-dom';

export default function WebPage() {
  return <div className="fade-in">
    <div className="page-header">
      <Link to="/" className="back-link">← 홈으로</Link>
      <h1>웹</h1>
      <p>Spring · JPA 문제풀이와 웹 필수지식을 한곳에서 공부하세요.</p>
    </div>
    <div className="exam-sections">
      <Link to="/web-essentials" className="exam-section">
        <span className="t">웹 필수지식</span>
        <span className="d">웹 개발 핵심 질문과 모범답변</span>
        <span className="d">기존 웹 필수지식 페이지로 이동 →</span>
      </Link>
      <Link to="/web/spring" className="exam-section">
        <span className="t">Spring · JPA</span>
        <span className="d">스프링 코어 · 웹 MVC · JPA · 부트</span>
        <span className="d">60문제 · 기존 풀이 기록으로 이어서 학습</span>
      </Link>
    </div>
  </div>;
}
