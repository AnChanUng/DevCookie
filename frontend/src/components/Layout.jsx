import { Suspense, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { warmUpBackend } from '../api';
import { track } from '../track';
import ChaosChat from './ChaosChat';
import StudyAmbience from './StudyAmbience';
import StudyCount from './StudyCount';

// 카오스 고양이 챗봇은 잠시 숨겨 둔다. true로 바꾸면 다시 나온다
const SHOW_CHAOS_CHAT = false;

export default function Layout() {
  const location = useLocation();

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
              <Link to="/exam" className={location.pathname.startsWith('/exam') || location.pathname === '/computer-general' ? 'active' : ''}>
                기업별 기출
              </Link>
              <Link to="/ncs" className={location.pathname === '/ncs' ? 'active' : ''}>
                NCS
              </Link>
              <Link to="/aptitude" className={location.pathname.startsWith('/aptitude') ? 'active' : ''}>
                인적성
              </Link>
              <Link to="/major" className={location.pathname === '/major' ? 'active' : ''}>
                필기이론
              </Link>
              <Link to="/stats" className={location.pathname === '/stats' ? 'active' : ''}>
                통계
              </Link>
            </nav>
            <StudyCount />
            {/* 코드 타자 연습은 따로 배포된 외부 사이트라 새 탭으로 연다 */}
            <a href="https://ssafy-code-race.onrender.com/" target="_blank" rel="noopener noreferrer" className="typing-link" title="코딩으로 타자 연습하러 가기">
              <span aria-hidden="true">⌨️</span>코딩 타자 연습
            </a>
          </div>
        </div>
      </header>

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
