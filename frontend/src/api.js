import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://cs-study-backend-i0ln.onrender.com/api/v1',
  timeout: 5000,
});

// 잠들어 있는 Render 무료 서버를 미리 깨운다. 결과는 쓰지 않는다.
export function warmUpBackend() {
  api.get('/categories', { timeout: 180000 }).catch(() => {});
}

export default api;
