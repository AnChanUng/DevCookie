import api from './api';

const KEY = 'visitor-id';

// 로그인 없이 쓰는 사이트라 브라우저마다 익명 ID를 하나 만들어 방문자 수를 센다
function visitorId() {
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}

// 이용 현황 기록. 실패해도 화면에는 영향을 주지 않는다.
// 잠든 서버가 깨어나는 동안의 방문도 놓치지 않도록 타임아웃을 길게 둔다
export function track(type, path, detail) {
  const id = visitorId();
  if (!id || path.startsWith('/admin')) return;
  api.post('/track', { visitorId: id, type, path, detail }, { timeout: 180000 }).catch(() => {});
}
