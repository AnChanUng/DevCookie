import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api';
import { visitorId } from '../track';

const PRESENCE_EVERY = 60 * 1000;

// "지금 공부 중" 인원 집계용 신호만 보낸다. 숫자는 사용자 화면에 보여 주지 않고 관리자 페이지 개요에서만 본다
export default function StudyCount() {
  const admin = useLocation().pathname.startsWith('/admin');

  // 화면을 보고 있는 동안만 1분마다 신호를 보낸다. 관리자 화면은 세지 않는다
  useEffect(() => {
    if (admin) return;
    const beat = () => {
      const id = visitorId();
      if (!id || document.hidden) return;
      api.post('/presence', { visitorId: id }, { timeout: 20000 }).catch(() => {});
    };
    beat();
    const timer = setInterval(beat, PRESENCE_EVERY);
    document.addEventListener('visibilitychange', beat);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', beat); };
  }, [admin]);

  return null;
}
