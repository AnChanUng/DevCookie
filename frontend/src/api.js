import axios from 'axios';

export const USER_KEY = 'cs_user';
export const AUTH_EXPIRED_EVENT = 'auth:expired';

export function readSavedUser() {
  try {
    const saved = JSON.parse(localStorage.getItem(USER_KEY));
    // 토큰 도입 전에 저장된 로그인 정보는 쓸 수 없으므로 다시 로그인하게 한다
    return saved?.token ? saved : null;
  } catch {
    return null;
  }
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://cs-study-backend.onrender.com/api/v1',
  timeout: 5000,
});

api.interceptors.request.use(config => {
  const token = readSavedUser()?.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401 && readSavedUser()) {
      localStorage.removeItem(USER_KEY);
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
    }
    return Promise.reject(err);
  },
);

export default api;
