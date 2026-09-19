import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api';
import { visitorId } from '../track';

const PRESENCE_EVERY = 60 * 1000;

// 헤더 오른쪽의 "지금 공부 중" 표시. 나 말고 다른 사람이 있을 때만 나온다
export default function StudyCount() {
  const admin = useLocation().pathname.startsWith('/admin');
  const [count, setCount] = useState(0);

  // 화면을 보고 있는 동안만 1분마다 신호를 보낸다. 관리자 화면은 세지 않는다
  useEffect(() => {
    if (admin) return;
    const beat = () => {
      const id = visitorId();
      if (!id || document.hidden) return;
      api.post('/presence', { visitorId: id }, { timeout: 20000 })
        .then(res => setCount(res.data?.count || 0))
        .catch(() => {});
    };
    beat();
    const timer = setInterval(beat, PRESENCE_EVERY);
    document.addEventListener('visibilitychange', beat);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', beat); };
  }, [admin]);

  if (admin || count < 2) return null;

  return (
    <span className="study-count" role="status" title="최근 몇 분 안에 이 사이트를 열어 둔 사람 수">
      🔥 {count}명<span className="study-count-tail">이 공부 중</span>
    </span>
  );
}
