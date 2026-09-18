import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  // 문제은행은 크므로 첫 화면을 그린 뒤에 불러와 숫자만 채운다
  const [banks, setBanks] = useState(null);
  useEffect(() => {
    import('../data/examQuestions').then(({ COMPANIES, COMIL }) => {
      const ready = COMPANIES.filter(c => c.ready);
      setBanks({
        count: ready.length,
        total: ready.reduce((n, c) => n + c.questions.length + (c.extra?.length || 0), 0),
        abbrs: ready.map(c => c.abbr).join(' · '),
        comil: COMIL.questions.length,
        comilExam: Object.values(COMIL.draw).reduce((n, c) => n + c, 0),
        comilMinutes: COMIL.minutes,
      });
    });
  }, []);

  const menus = [
    {
      to: '/exam', title: '기업별 기출문제',
      desc: `${banks ? banks.abbrs : '공기업 · 금융권'} 응시 후기 기반 모의고사 · 영역별 연습 · 오답 다시 풀기`,
      tags: banks ? [`${banks.count}개 기업`, `${banks.total}문항`] : ['공기업 · 금융권'],
    },
    {
      to: '/computer-general', title: '컴퓨터일반 기출문제',
      desc: '전산직 9급 컴퓨터일반 기출문제집 기반 · 운영체제부터 통신 · 보안 · 신기술까지 7개 영역',
      tags: banks ? [`${banks.comil}문항`, `모의고사 ${banks.comilExam}문제 · ${banks.comilMinutes}분`] : ['전산직 9급'],
    },
    {
      to: '/major', title: '필기이론',
      desc: '정보처리기사 · SQLD · 빅데이터분석기사 요약노트를 화면에서 바로 열람',
      tags: ['요약노트 4종', 'PDF 열람'],
    },
  ];

  return (
    <div className="fade-in">
      <div className="hero">
        <h1>전산학 전공필기 준비</h1>
        <p>공기업 · 금융권 IT직무 전공필기, 기출 기반 모의고사와 이론 정리로 대비하세요</p>
      </div>

      <div className="stats-summary">
        <div className="stats-summary-card">
          <div className="stats-summary-value">{banks ? banks.count + 1 : '–'}</div>
          <div className="stats-summary-label">문제은행</div>
        </div>
        <div className="stats-summary-card">
          <div className="stats-summary-value">{banks ? banks.total + banks.comil : '–'}</div>
          <div className="stats-summary-label">전체 문항</div>
        </div>
        <div className="stats-summary-card">
          <div className="stats-summary-value">즉시</div>
          <div className="stats-summary-label">채점 · 해설 · 오답노트</div>
        </div>
      </div>

      <div className="section-title">학습 메뉴</div>
      <div className="home-menu">
        {menus.map((m, i) => (
          <Link key={m.to} to={m.to} className="home-menu-item">
            <span className="home-menu-no">{i + 1}</span>
            <span className="home-menu-body">
              <span className="home-menu-title">{m.title}</span>
              <span className="home-menu-desc">{m.desc}</span>
              <span className="home-menu-tags">{m.tags.map(t => <span key={t}>{t}</span>)}</span>
            </span>
            <span className="home-menu-arrow" aria-hidden="true">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
