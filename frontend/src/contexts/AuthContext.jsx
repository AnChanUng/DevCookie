import { useState, useEffect } from 'react';
import api, { AUTH_EXPIRED_EVENT, USER_KEY, readSavedUser, warmUpBackend } from '../api';
import { AuthContext } from './useAuth';

// 잠들어 있던 백엔드(Render)가 깨어나는 데 2분 가까이 걸릴 수 있다
const AUTH_TIMEOUT = 150000;

const isTimeout = (err) => err.code === 'ECONNABORTED' || (!err.response && err.request);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readSavedUser);

  // 첫 화면이 뜨는 동안 서버를 깨워 두면 로그인/회원가입이 바로 된다
  useEffect(() => { warmUpBackend(); }, []);

  useEffect(() => {
    const onExpired = () => setUser(null);
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
  }, []);

  const signIn = async (path, nickname, password) => {
    const send = () => api.post(path, { nickname, password }, { timeout: AUTH_TIMEOUT });
    let res;
    try {
      res = await send();
    } catch (err) {
      // 서버가 깨어나는 중에 끊긴 경우 한 번 더 시도한다
      if (!isTimeout(err)) throw err;
      res = await send();
    }
    const userData = res.data;
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const login = (nickname, password) => signIn('/auth/login', nickname, password);
  const register = (nickname, password) => signIn('/auth/register', nickname, password);

  const logout = () => {
    api.post('/auth/logout').catch(() => {});
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
