import { Link } from 'react-router-dom';
import StudyGoal from '../components/StudyGoal';
import DailyFortune from '../components/DailyFortune';
import MentalTraining from '../components/MentalTraining';

const MENUS = [
  { to: '/exam', tone: 'indigo', tag: '전공필기', title: '기업별 기출문제', desc: '금융공기업, 공기업, 컴퓨터일반 기출 모의고사' },
  { to: '/ncs', tone: 'cyan', tag: '직업기초', title: 'NCS', desc: 'PSAT형 직업기초능력 모의고사' },
  { to: '/aptitude', tone: 'emerald', tag: '적성검사', title: '인적성검사', desc: '기업별 언어 · 수리 · 추리 · 문제해결 모의고사', isNew: true },
  { to: '/major', tone: 'pink', tag: '요약노트', title: '필기이론', desc: '자격증 요약노트 열람과 다운로드' },
];

// 메뉴 카드 아래의 작은 바로가기. 풀고 난 뒤에 찾게 되는 기능들이다
const SHORTCUTS = [
  { to: '/weak', title: '약점 분석', desc: '영역별 정답률' },
  { to: '/search', title: '문제 검색', desc: '키워드로 문제 찾기' },
  { to: '/stats', title: '통계', desc: '학습 기록' },
];

export default function Home() {
  return (
    <div className="fade-in home">
      {/* 왼쪽은 소개, 오른쪽은 시험 일정 · D-day */}
      <div className="home-top">
        <div className="hero">
          <span className="home-eyebrow">공기업 IT직무</span>
          <h1>전산학 전공필기 준비</h1>
          <p>기출 기반 모의고사로 풀고, 틀린 문제는 다시 풉니다.</p>
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
            <span className="home-menu-head">
              <span className="home-menu-no">{i + 1}</span>
              <span className="home-menu-tag">{m.tag}</span>
            </span>
            <span className="home-menu-title">
              {m.title}
              {m.isNew && <span className="home-menu-new">NEW</span>}
            </span>
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
      <MentalTraining />
      <DailyFortune />
    </div>
  );
}
