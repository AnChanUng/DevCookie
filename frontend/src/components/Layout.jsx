import { Suspense, useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import ChaosChat from './ChaosChat';

export default function Layout() {
  const location = useLocation();
  const { user, login, register, logout } = useAuth();
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  // 'idle' | 'pending' | 'success'
  const [status, setStatus] = useState('idle');
  const [doneNickname, setDoneNickname] = useState('');
  const [slow, setSlow] = useState(false);

  // 5초 넘게 걸리면 서버가 깨어나는 중이라는 안내를 붙인다
  useEffect(() => {
    if (status !== 'pending') return undefined;
    const t = setTimeout(() => setSlow(true), 5000);
    return () => clearTimeout(t);
  }, [status]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nickname.trim() || !password.trim() || status === 'pending') return;
    setError('');
    setSlow(false);
    setStatus('pending');
    try {
      const userData = isRegister
        ? await register(nickname.trim(), password.trim())
        : await login(nickname.trim(), password.trim());
      setDoneNickname(userData?.nickname || nickname.trim());
      setStatus('success');
      setNickname('');
      setPassword('');
    } catch (err) {
      setStatus('idle');
      setError(err.response?.data?.error || '요청에 실패했습니다.');
    }
  };

  const closeModal = () => {
    setShowLogin(false);
    setError('');
    setNickname('');
    setPassword('');
    setStatus('idle');
    setSlow(false);
    setDoneNickname('');
  };

  const pendingText = isRegister ? '회원가입 진행 중입니다...' : '로그인 진행 중입니다...';
  const successText = isRegister ? '회원가입에 성공했습니다!' : '로그인에 성공했습니다!';

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
              <Link to="/stats" className={location.pathname === '/stats' ? 'active' : ''}>
                통계
              </Link>
              <Link to="/interview" className={location.pathname === '/interview' ? 'active' : ''}>
                면접연습
              </Link>
              <Link to="/exam" className={location.pathname.startsWith('/exam') ? 'active' : ''}>
                기출문제
              </Link>
            </nav>
            {user ? (
              <div className="user-info">
                <span className="user-nickname">{user.nickname}</span>
                <button onClick={logout} className="logout-btn">로그아웃</button>
              </div>
            ) : (
              <button onClick={() => { setShowLogin(true); setIsRegister(false); }} className="login-btn">로그인</button>
            )}
          </div>
        </div>
      </header>

      {showLogin && (
        <div className="login-overlay" onClick={closeModal}>
          <div className="login-modal" onClick={e => e.stopPropagation()}>
            <h2>{isRegister ? '회원가입' : '로그인'}</h2>
            {status === 'success' ? (
              <div className="login-success">
                <div className="login-success-icon">✓</div>
                <div className="login-success-title">{successText}</div>
                <div className="login-success-id">아이디: <strong>{doneNickname}</strong></div>
                <button type="button" onClick={closeModal} className="submit-btn">확인</button>
              </div>
            ) : (
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                placeholder="닉네임"
                className="login-input"
                autoFocus
                maxLength={20}
              />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="비밀번호"
                className="login-input"
                maxLength={30}
              />
              {error && <div className="login-error">{error}</div>}
              {status === 'pending' && (
                <div className="login-pending">
                  <span className="login-pending-spinner" />
                  <span>
                    {pendingText}
                    {slow && <small className="login-pending-hint">서버가 잠들어 있어서 깨우는 중이에요. 최대 2분 정도 걸릴 수 있어요.</small>}
                  </span>
                </div>
              )}
              <button type="submit" className="submit-btn" disabled={status === 'pending'}>
                {status === 'pending' ? '처리 중...' : isRegister ? '가입하기' : '로그인'}
              </button>
            </form>
            )}
            {status !== 'success' && (
            <div className="login-switch">
              {isRegister ? (
                <span>이미 계정이 있나요? <button onClick={() => { setIsRegister(false); setError(''); }} className="switch-btn">로그인</button></span>
              ) : (
                <span>처음이신가요? <button onClick={() => { setIsRegister(true); setError(''); }} className="switch-btn">회원가입</button></span>
              )}
            </div>
            )}
          </div>
        </div>
      )}

      <main className="container">
        <Suspense fallback={<div className="loading"><div className="loading-spinner" />불러오는 중...</div>}>
          <Outlet />
        </Suspense>
      </main>

      <ChaosChat />
    </>
  );
}
