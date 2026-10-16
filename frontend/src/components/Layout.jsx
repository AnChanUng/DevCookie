import { Suspense, useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { warmUpBackend } from '../api';
import { track } from '../track';
import ChaosChat from './ChaosChat';
import StudyAmbience from './StudyAmbience';
import StudyCount from './StudyCount';
import MemberMenu from './MemberMenu';
import PromotionAnnouncements from './PromotionAnnouncements';

// 카오스 고양이 챗봇은 잠시 숨겨 둔다. true로 바꾸면 다시 나온다
const SHOW_CHAOS_CHAT = false;

// 화면 모드. swatch는 고르는 창에 보여 줄 견본 색(바탕 절반 + 강조색 절반), dark는 어두운 계열 여부
const THEMES = [
  { key: 'light', name: '화이트', icon: '☀️', swatch: 'linear-gradient(135deg, #FFFFFF 50%, #6366F1 50%)' },
  { key: 'sepia', name: '크림', icon: '📜', swatch: 'linear-gradient(135deg, #F6EFE0 50%, #B4662A 50%)' },
  { key: 'mint', name: '민트', icon: '🌿', swatch: 'linear-gradient(135deg, #EFF8F4 50%, #0E9F77 50%)' },
  { key: 'dim', name: '딤', icon: '🌆', swatch: 'linear-gradient(135deg, #2C313C 50%, #8188F7 50%)', dark: true },
  { key: 'dark', name: '다크', icon: '🌙', swatch: 'linear-gradient(135deg, #0F1626 50%, #8188F7 50%)', dark: true },
  { key: 'black', name: '블랙', icon: '⚫', swatch: 'linear-gradient(135deg, #000000 50%, #8188F7 50%)', dark: true },
];

// 고른 모드를 문서에 반영한다. 색은 index.css가 이 속성들을 보고 바꾼다
function applyTheme(t) {
  const root = document.documentElement;
  if (t.key === 'light') root.removeAttribute('data-theme'); else root.setAttribute('data-theme', t.key);
  if (t.dark) root.setAttribute('data-mode', 'dark'); else root.removeAttribute('data-mode');
  try { localStorage.setItem('theme', t.key); } catch { /* storage unavailable */ }
}

export default function Layout() {
  const location = useLocation();
  // 화면 모드는 index.html에서 먼저 적용해 두고, 여기서는 바꿀 때만 반영하고 기억한다
  const [theme, setThemeState] = useState(() => (THEMES.some(t => t.key === document.documentElement.dataset.theme) ? document.documentElement.dataset.theme : 'light'));
  const [picking, setPicking] = useState(false);
  const current = THEMES.find(t => t.key === theme);
  const setTheme = (next) => {
    setThemeState(next.key);
    setPicking(false);
    applyTheme(next);
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
            <span className="logo-title">전산학 전공필기 준비</span>
          </Link>
          <div className="header-right">
            <nav className="nav-links">
              <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
                홈
              </Link>
              <Link to="/notes" className={location.pathname === '/notes' ? 'active' : ''}>
                전공노트
              </Link>
              <Link to="/exam" className={location.pathname.startsWith('/exam') || location.pathname === '/computer-general' || location.pathname === '/topics' || location.pathname === '/calc' ? 'active' : ''}>
                기업별 기출
              </Link>
              <Link to="/ncs" className={location.pathname === '/ncs' ? 'active' : ''}>
                NCS
              </Link>
              <Link to="/aptitude" className={location.pathname.startsWith('/aptitude') ? 'active' : ''}>
                인적성
              </Link>
              <Link to="/major" className={location.pathname.startsWith('/major') ? 'active' : ''}>
                필기이론
              </Link>
            </nav>
            {/* 지금 모드의 아이콘을 보여 주고, 누르면 색 견본이 펼쳐진다 */}
            <div className="theme-pick">
              <button type="button" className="theme-toggle" onClick={() => setPicking(!picking)} title="화면 모드 고르기" aria-label="화면 모드 고르기" aria-expanded={picking}>
                {current.icon}
              </button>
              {picking && (
                <div className="theme-menu" role="menu">
                  {THEMES.map(t => (
                    <button key={t.key} type="button" role="menuitem" className={t.key === theme ? 'on' : ''} onClick={() => setTheme(t)}>
                      <i style={{ background: t.swatch }} />{t.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <StudyCount />
            <MemberMenu />
          </div>
        </div>
      </header>

      <main className="container">
        <Suspense fallback={<div className="loading"><div className="loading-spinner" />불러오는 중...</div>}>
          <Outlet />
        </Suspense>
      </main>

      <PromotionAnnouncements />
      <StudyAmbience />
      {SHOW_CHAOS_CHAT && <ChaosChat />}
    </>
  );
}
