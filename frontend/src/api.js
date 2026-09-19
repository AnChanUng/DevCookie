import axios from 'axios';

const BACKEND = 'https://cs-study-backend-i0ln.onrender.com/api/v1';

// 배포 빌드는 항상 위 주소를 쓴다. 배포판 환경변수(VITE_API_URL)가 옛 주소로 남아 있어도
// 영향을 받지 않게 하려는 것이고, VITE_API_URL은 로컬 개발에서만 백엔드를 바꿔 끼우는 용도다
const api = axios.create({
  baseURL: (import.meta.env.DEV && import.meta.env.VITE_API_URL) || BACKEND,
  timeout: 5000,
});

// 잠들어 있는 Render 무료 서버를 미리 깨운다. 결과는 쓰지 않는다.
export function warmUpBackend() {
  api.get('/categories', { timeout: 180000 }).catch(() => {});
}

export default api;
