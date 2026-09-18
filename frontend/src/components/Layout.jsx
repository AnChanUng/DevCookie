import { Suspense, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { warmUpBackend } from '../api';
import ChaosChat from './ChaosChat';

export default function Layout() {
  const location = useLocation();

  // 첫 화면이 뜨는 동안 잠들어 있던 서버를 깨워 두면 챗봇 응답이 바로 온다
  useEffect(() => { warmUpBackend(); }, []);

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
              <Link to="/exam" className={location.pathname.startsWith('/exam') ? 'active' : ''}>
                기업별 기출
              </Link>
              <Link to="/computer-general" className={location.pathname === '/computer-general' ? 'active' : ''}>
                컴퓨터일반
              </Link>
              <Link to="/major" className={location.pathname === '/major' ? 'active' : ''}>
                필기이론
              </Link>
              <Link to="/stats" className={location.pathname === '/stats' ? 'active' : ''}>
                통계
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container">
        <Suspense fallback={<div className="loading"><div className="loading-spinner" />불러오는 중...</div>}>
          <Outlet />
        </Suspense>
      </main>

      <ChaosChat />
    </>
  );
}
