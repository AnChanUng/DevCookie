import { useEffect, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import api from '../api';
import { visitorId } from '../track';
import LoungeChat from './LoungeChat';
import { account, onAccountChange } from '../sync';
import { membershipHeaders } from '../membership';

const PRESENCE_EVERY = 60 * 1000;

// 헤더 오른쪽의 "지금 공부 중" 표시. 누르면 접속해 있는 사람들과의 채팅 창이 열린다
export default function StudyCount() {
  const admin = useLocation().pathname.startsWith('/admin');
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(false);
  const token = useSyncExternalStore(onAccountChange, () => account()?.token || '', () => '');
  const [privateNotice, setPrivateNotice] = useState({ token: '', count: 0 });
  const directUnread = privateNotice.token === token ? privateNotice.count : 0;
  useEffect(() => {
    if (!token || admin) return;
    let active = true, pending = false;
    const check = async () => {
      if (document.hidden || pending) return;
      pending = true;
      try {
        const { data } = await api.get('/direct', { headers: membershipHeaders(), timeout: 20000 });
        if (active) setPrivateNotice({ token, count: data.reduce((n, t) => n + t.unread + (t.friendship === 'received' ? 1 : 0), 0) });
      } catch { /* Retry after a temporary connection failure. */ }
      finally { pending = false; }
    };
    check(); const timer = setInterval(check, open ? 5000 : 15000);
    document.addEventListener('visibilitychange', check);
    return () => { active = false; clearInterval(timer); document.removeEventListener('visibilitychange', check); };
  }, [token, admin, open]);

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

  if (admin) return null;

  return (
    <>
      <button type="button" className={`study-count${open ? ' on' : ''}`} onClick={() => setOpen(o => !o)}
        aria-expanded={open} title="최근 몇 분 안에 이 사이트를 열어 둔 사람 수 · 누르면 채팅이 열립니다">
        <span className="study-count-dot" aria-hidden="true" />
        {count > 0 ? `${count}명` : '채팅'}
        {count > 0 && <span className="study-count-tail">&nbsp;공부 중</span>}
        <span className="study-count-chat" aria-hidden="true">💬</span>
        {(unread || directUnread > 0) && !open && <span className="study-count-new" aria-label="새 채팅 또는 친구 요청" />}
      </button>
      {/* 헤더의 흐림 효과 안에서는 고정 위치가 헤더 기준이 되므로 body에 붙인다 */}
      {createPortal(
        <LoungeChat open={open} online={count} onClose={() => setOpen(false)} onOnline={setCount} onUnread={setUnread} directUnread={directUnread} />,
        document.body,
      )}
    </>
  );
}
