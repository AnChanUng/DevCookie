import { Link } from 'react-router-dom';
import StudyGoal from '../components/StudyGoal';

const MENUS = [
  { to: '/exam', tone: 'indigo', title: '기업별 기출문제', desc: '금융공기업 · 공기업 응시 후기 기반 모의고사 · 영역별 연습 · 오답 다시 풀기' },
  { to: '/computer-general', tone: 'violet', title: '컴퓨터일반 기출문제', desc: '전산직 9급 컴퓨터일반 · 운영체제부터 통신 · 보안 · 신기술까지 7개 영역' },
  { to: '/ncs', tone: 'cyan', title: 'NCS', desc: '직업기초능력 PSAT형 · 언어논리 · 자료해석 · 상황판단 모의고사와 영역별 연습' },
  { to: '/major', tone: 'pink', title: '필기이론', desc: '정보처리기사 실기 · SQLD · 빅데이터분석기사 · ADsP 요약노트를 바로 열람하거나 다운로드' },
];

// 메뉴 카드 아래의 작은 바로가기. 풀고 난 뒤에 찾게 되는 기능들이다
const SHORTCUTS = [
  { to: '/weak', title: '약점 분석', desc: '영역별 정답률을 한눈에' },
  { to: '/search', title: '문제 검색', desc: '키워드로 전체 문제은행 찾기' },
  { to: '/stats', title: '통계', desc: '학습 진행 상황 돌아보기' },
];

export default function Home() {
  return (
    <div className="fade-in home">
      {/* 왼쪽은 소개, 오른쪽은 시험 일정 · D-day */}
      <div className="home-top">
        <div className="hero">
          <span className="home-eyebrow">공기업 · 금융권 IT직무</span>
          <h1>전산학 전공필기 준비</h1>
          <p>응시 후기 기반 모의고사로 실전처럼 풀고, 틀린 문제는 오답노트와 약점 분석으로 끝까지 잡으세요.</p>
          <div className="home-cta">
            <Link to="/exam" className="home-cta-btn primary">기출 풀러 가기 →</Link>
            <Link to="/weak" className="home-cta-btn">내 약점 보기</Link>
          </div>
        </div>
        <StudyGoal />
      </div>

      <div className="home-menu">
        {MENUS.map((m, i) => (
          <Link key={m.to} to={m.to} className={`home-menu-item ${m.tone}`}>
            <span className="home-menu-no">{i + 1}</span>
            <span className="home-menu-title">{m.title}</span>
            <span className="home-menu-desc">{m.desc}</span>
            <span className="home-menu-go">바로가기 →</span>
          </Link>
        ))}
      </div>

      <div className="home-shortcuts">
        {SHORTCUTS.map(s => (
          <Link key={s.to} to={s.to} className="home-shortcut">
            <span className="home-shortcut-title">{s.title}</span>
            <span className="home-shortcut-desc">{s.desc}</span>
          </Link>
        ))}
      </div>

      {/* 오락실은 SPA 밖의 정적 페이지라 Link가 아니라 일반 링크로 연다 */}
      <a href="/arcade/" className="arcade-door">오락실</a>
    </div>
  );
}
