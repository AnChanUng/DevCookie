import { createContext, useContext, useState, useEffect } from 'react';
import api, { AUTH_EXPIRED_EVENT, USER_KEY, readSavedUser } from '../api';

const AuthContext = createContext(null);
// 잠들어 있던 백엔드(Render)가 깨어나는 시간을 기다린다
const AUTH_TIMEOUT = 60000;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readSavedUser);

  useEffect(() => {
    const onExpired = () => setUser(null);
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
  }, []);

  const signIn = async (path, nickname, password) => {
    const res = await api.post(path, { nickname, password }, { timeout: AUTH_TIMEOUT });
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

export function useAuth() {
  return useContext(AuthContext);
}
