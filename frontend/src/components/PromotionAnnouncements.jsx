import { useEffect, useState } from 'react';
import api from '../api';
import { refreshMembership } from '../membership';
import './PromotionAnnouncements.css';

export default function PromotionAnnouncements() {
  const [notices, setNotices] = useState([]);
  useEffect(() => {
    if (typeof EventSource === 'undefined') return undefined;
    const source = new EventSource(`${api.defaults.baseURL}/promotions/stream`);
    const timers = new Map(), seen = new Set();
    const receive = event => {
      let data;
      try { data = JSON.parse(event.data); } catch { return; }
      if (typeof data.id !== 'string' || typeof data.nickname !== 'string' || typeof data.tierName !== 'string' || seen.has(data.id)) return;
      seen.add(data.id);
      if (seen.size > 300) seen.delete(seen.values().next().value);
      setNotices(previous => [...previous.slice(-2), data]);
      refreshMembership();
      timers.set(data.id, setTimeout(() => {
        setNotices(previous => previous.filter(n => n.id !== data.id)); timers.delete(data.id);
      }, 8000));
    };
    source.addEventListener('promotion', receive);
    return () => { source.removeEventListener('promotion', receive); source.close(); timers.forEach(clearTimeout); };
  }, []);
  return <aside className="promotion-announcements" aria-label="실시간 승급 축하" aria-live="polite" aria-atomic="false">
    {notices.map(notice => <div className="promotion-announcement" key={notice.id} role="status">
      <span>🎉 <strong>{notice.nickname}</strong>님이 <strong>{notice.tierName}</strong>로 승급했습니다! 축하합니다!</span>
      <button type="button" aria-label="승급 알림 닫기" onClick={() => setNotices(previous => previous.filter(n => n.id !== notice.id))}>×</button>
    </div>)}
  </aside>;
}
