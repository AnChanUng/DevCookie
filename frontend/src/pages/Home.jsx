import { useState } from 'react';
import { Link } from 'react-router-dom';
import StudyGoal from '../components/StudyGoal';
import DailyFortune from '../components/DailyFortune';
import MentalTraining from '../components/MentalTraining';
import SolveRank from '../components/SolveRank';
import ContinueCard from '../components/ContinueCard';
import TodayCs from '../components/TodayCs';
import StudyNotice from '../components/StudyNotice';

const MENUS = [
  { to: '/exam', tone: 'indigo', tag: '전공필기', title: '기업별 기출문제', desc: '금융공기업, 공기업, 컴퓨터일반 기출 모의고사' },
  { to: '/ncs', tone: 'cyan', tag: '직업기초', title: 'NCS', desc: 'PSAT형 직업기초능력 모의고사' },
  { to: '/aptitude', tone: 'emerald', tag: '적성검사', title: '인적성검사', desc: '기업별 언어 · 수리 · 추리 · 문제해결 모의고사', isNew: true },
  { to: '/major', tone: 'pink', tag: '요약노트', title: '필기이론', desc: '자격증 요약노트 열람과 다운로드' },
];

export default function Home() {
  const [more, setMore] = useState(false);
  return (
    <div className="fade-in home">
      <StudyNotice />
      {/* 왼쪽은 소개와 시험 일정, 오른쪽은 문제 많이 푼 사람 순위 */}
      <div className="home-top">
        <div className="hero">
          <h1>전산학 전공필기 준비</h1>
          <p>기출 기반 모의고사로 풀고, 틀린 문제는 다시 풉니다.</p>
          <div className="home-cta">
            <Link to="/notes" className="home-cta-btn primary">전공노트 →</Link>
            <Link to="/duel" className="home-cta-btn">대결</Link>
            <Link to="/promotion-exam" className="home-cta-btn">시험</Link>
            <Link to="/account/retry" className="home-cta-btn">오답노트</Link>
            <Link to="/bug-hunt" className="home-cta-btn">🐛 코드 범인 찾기</Link>
          </div>
          <StudyGoal />
        </div>
        {/* 가운데 칸: 오늘의 CS 말풍선이 위에, 그 아래에 이어서 하기 카드 */}
        <div className="home-mid">
          <TodayCs />
          <ContinueCard />
        </div>
        <SolveRank />
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

      {/* 왼쪽 아래 도크: 위에서부터 멘탈 기르기, 오늘의 운세. 좁은 화면에서는 숨겨 두고 "더보기"를 눌러야 맨 아래에 한 줄로 나온다 */}
      <div className={`home-dock ${more ? 'open' : ''}`}>
        <button type="button" className="home-dock-more" onClick={() => setMore(m => !m)} aria-expanded={more}>{more ? '접기' : '더보기'}</button>
        <MentalTraining />
        <DailyFortune />
      </div>
    </div>
  );
}
