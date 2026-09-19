import { Link } from 'react-router-dom';
import StudyGoal from '../components/StudyGoal';

const MENUS = [
  { to: '/exam', title: '기업별 기출문제', desc: '금융공기업 · 공기업 응시 후기 기반 모의고사 · 영역별 연습 · 오답 다시 풀기' },
  { to: '/computer-general', title: '컴퓨터일반 기출문제', desc: '전산직 9급 컴퓨터일반 · 운영체제부터 통신 · 보안 · 신기술까지 7개 영역' },
  { to: '/major', title: '필기이론', desc: '정보처리기사 · SQLD · 빅데이터분석기사 요약노트를 화면에서 바로 열람' },
];

export default function Home() {
  return (
    <div className="fade-in">
      <div className="hero">
        <h1>전산학 전공필기 준비</h1>
        <p>공기업 · 금융권 IT직무 전공필기, 기출 기반 모의고사와 이론 정리로 대비하세요</p>
      </div>

      <StudyGoal />

      <div className="home-menu">
        {MENUS.map((m, i) => (
          <Link key={m.to} to={m.to} className="home-menu-item">
            <span className="home-menu-no">{i + 1}</span>
            <span className="home-menu-title">{m.title}</span>
            <span className="home-menu-desc">{m.desc}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
