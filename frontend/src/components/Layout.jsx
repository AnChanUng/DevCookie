import { Suspense, useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { warmUpBackend } from '../api';
import { track } from '../track';
import ChaosChat from './ChaosChat';
import StudyAmbience from './StudyAmbience';
import StudyCount from './StudyCount';

// 카오스 고양이 챗봇은 잠시 숨겨 둔다. true로 바꾸면 다시 나온다
const SHOW_CHAOS_CHAT = false;

// 이 사이트 밖의 코딩테스트 준비 사이트. 로고만 작게 두고 새 탭으로 연다 (로고 파일은 public/outside/).
// 넓은 화면에서는 화면 맨 왼쪽에 세로로, 좁은 화면에서는 자리가 없어 머리말 메뉴 줄에 가로로 놓는다
const OUTSIDE = [
  { href: 'https://www.codetree.ai/ko/frequent-problems', label: '코드트리 기출 빈출 문제', logo: '/outside/codetree.png' },
  { href: 'https://school.programmers.co.kr/learn/challenges?order=acceptance_desc&levels=2%2C3&languages=java', label: '프로그래머스', logo: '/outside/programmers.png' },
  { href: 'https://jungol.co.kr/', label: '정올', logo: '/outside/jungol.png' },
];

function OutsideLinks({ className }) {
  return (
    <div className={className}>
      {OUTSIDE.map(o => (
        <a key={o.href} href={o.href} target="_blank" rel="noopener noreferrer" title={o.label} aria-label={o.label}>
          <img src={o.logo} alt="" width="22" height="22" />
        </a>
      ))}
    </div>
  );
}

export default function Layout() {
  const location = useLocation();
  // 화면 모드는 index.html에서 먼저 적용해 두고, 여기서는 바꿀 때만 반영하고 기억한다
  const [theme, setThemeState] = useState(() => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'));
  const setTheme = (next) => {
    setThemeState(next);
    if (next === 'dark') document.documentElement.dataset.theme = 'dark';
    else delete document.documentElement.dataset.theme;
    try { localStorage.setItem('theme', next); } catch { /* storage unavailable */ }
  };

  // 첫 화면이 뜨는 동안 잠들어 있던 서버를 깨워 두면 이후 요청이 바로 온다
  useEffect(() => { warmUpBackend(); }, []);

  useEffect(() => { track('view', location.pathname); }, [location.pathname]);

  return (
    <>
      <header className="header">
        <div className="container header-inner">
          <Link to="/" className="logo">
            <span className="logo-dot" />
            전산학 전공필기 준비
          </Link>
          <div className="header-right">
            <nav className="nav-links">
              <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
                홈
              </Link>
              <Link to="/exam" className={location.pathname.startsWith('/exam') || location.pathname === '/computer-general' || location.pathname === '/topics' ? 'active' : ''}>
                기업별 기출
              </Link>
              <Link to="/ncs" className={location.pathname === '/ncs' ? 'active' : ''}>
                NCS
              </Link>
              <Link to="/aptitude" className={location.pathname.startsWith('/aptitude') ? 'active' : ''}>
                인적성
              </Link>
              <Link to="/algo" className={location.pathname === '/algo' ? 'active' : ''}>
                코테 풀이
              </Link>
              <Link to="/major" className={location.pathname === '/major' ? 'active' : ''}>
                필기이론
              </Link>
              <Link to="/stats" className={location.pathname === '/stats' ? 'active' : ''}>
                통계
              </Link>
            </nav>
            <OutsideLinks className="outside-links in-header" />
            {/* 지금 모드의 아이콘을 보여 주고, 누르면 반대 모드로 바꾼다 */}
            <button
              type="button"
              className="theme-toggle"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title={theme === 'dark' ? '화이트 모드로 바꾸기' : '다크 모드로 바꾸기'}
              aria-label={theme === 'dark' ? '화이트 모드로 바꾸기' : '다크 모드로 바꾸기'}
            >
              {theme === 'dark' ? '🌙' : '☀️'}
            </button>
            <StudyCount />
          </div>
        </div>
      </header>
      {/* 머리말은 흐림 효과 때문에 고정 위치의 기준이 되므로, 세로 줄은 머리말 밖에 둔다 */}
      <OutsideLinks className="outside-links rail" />

      <main className="container">
        <Suspense fallback={<div className="loading"><div className="loading-spinner" />불러오는 중...</div>}>
          <Outlet />
        </Suspense>
      </main>

      <StudyAmbience />
      {SHOW_CHAOS_CHAT && <ChaosChat />}
    </>
  );
}
