import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  // 문제은행은 크므로 첫 화면을 그린 뒤에 불러와 숫자만 채운다
  const [banks, setBanks] = useState(null);
  useEffect(() => {
    import('../data/examQuestions').then(({ COMPANIES }) => {
      const ready = COMPANIES.filter(c => c.ready);
      setBanks({
        count: ready.length,
        total: ready.reduce((n, c) => n + c.questions.length + (c.extra?.length || 0), 0),
        abbrs: ready.map(c => c.abbr).join(' · '),
      });
    });
  }, []);

  return (
    <div className="fade-in">
      <div className="hero">
        <h1>전산학 전공필기 준비</h1>
        <p>공기업 · 금융권 IT직무 전공필기, 응시 후기 기반 모의고사와 이론 정리로 대비하세요</p>
      </div>

      <div className="stats-summary">
        <div className="stats-summary-card">
          <div className="stats-summary-value">{banks ? banks.count : '–'}</div>
          <div className="stats-summary-label">회사별 문제은행</div>
        </div>
        <div className="stats-summary-card">
          <div className="stats-summary-value">{banks ? banks.total : '–'}</div>
          <div className="stats-summary-label">전체 문항</div>
        </div>
        <div className="stats-summary-card">
          <div className="stats-summary-value">즉시</div>
          <div className="stats-summary-label">채점 · 해설 · 오답노트</div>
        </div>
      </div>

      <div className="section-title">학습 메뉴</div>
      <div className="categories-grid">
        <Link to="/exam" className="category-card major-exam-card">
          <div className="category-icon">📚</div>
          <h3>1. 기출문제</h3>
          <p>{banks ? banks.abbrs : '공기업 · 금융권'} 모의고사 · 영역별 연습 · 오답 다시 풀기 · 북마크</p>
        </Link>
        <Link to="/major" className="category-card major-exam-card">
          <div className="category-icon">📝</div>
          <h3>2. 전공필기</h3>
          <p>정보처리기사 요약노트 PDF · 데이터베이스 · 자료구조 · 운영체제 · 네트워크 과목별 학습</p>
        </Link>
        <Link to="/interview" className="category-card interview-card">
          <div className="category-icon">🎤</div>
          <h3>면접연습</h3>
          <p>공통 면접 질문 카메라 연습 · CS 면접 질문 검색</p>
        </Link>
      </div>
    </div>
  );
}
