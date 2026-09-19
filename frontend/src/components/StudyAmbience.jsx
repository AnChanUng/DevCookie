import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api';
import { visitorId } from '../track';

// 서울 기준 현재 날씨. 키가 필요 없는 공개 API이고, 고정 좌표만 보낸다
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast?latitude=37.57&longitude=126.98&current=weather_code';
const WEATHER_KEY = 'weather-now';
const WEATHER_TTL = 30 * 60 * 1000;
const PRESENCE_EVERY = 60 * 1000;
const TOAST_MS = 7000;

// WMO 날씨 코드: 눈(71~77, 85~86), 비(이슬비 · 비 · 소나기 · 뇌우)
function kindOf(code) {
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow';
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95) return 'rain';
  return null;
}

async function loadWeather() {
  try {
    const cached = JSON.parse(sessionStorage.getItem(WEATHER_KEY));
    if (cached && Date.now() - cached.at < WEATHER_TTL) return cached.kind;
  } catch { /* 캐시가 없으면 새로 받는다 */ }
  const res = await fetch(WEATHER_URL);
  const kind = kindOf((await res.json())?.current?.weather_code);
  try { sessionStorage.setItem(WEATHER_KEY, JSON.stringify({ kind, at: Date.now() })); } catch { /* 무시 */ }
  return kind;
}

// 난수 없이 고르게 흩어 놓는다. 렌더링할 때마다 위치가 바뀌지 않는다
const PARTICLES = Array.from({ length: 48 }, (_, i) => ({
  left: (i * 37) % 100,
  delay: ((i * 53) % 100) / 10,
  speed: (i * 29) % 10,
}));

const isDawn = () => new Date().getHours() < 6;

// 첫 화면의 분위기 요소: 비 · 눈 효과, 새벽 응원, 지금 공부 중인 사람 수
export default function StudyAmbience() {
  const { pathname } = useLocation();
  const admin = pathname.startsWith('/admin');
  const [weather, setWeather] = useState(null);
  const [count, setCount] = useState(0);
  const [toasts, setToasts] = useState(() => {
    try {
      if (!isDawn() || sessionStorage.getItem('dawn-cheer')) return [];
      sessionStorage.setItem('dawn-cheer', '1');
    } catch { /* 저장소를 못 써도 응원은 보여 준다 */ }
    return isDawn() ? ['🌙 새벽에 힘내요!!!'] : [];
  });

  useEffect(() => {
    let stale = false;
    loadWeather().then(kind => {
      if (stale || !kind) return;
      setWeather(kind);
      setToasts(t => [...t, kind === 'snow' ? '❄️ 오늘은 눈이 와요. 따뜻하게 공부해요' : '☔ 오늘은 비가 와요. 공부하기 좋은 날이에요']);
    }).catch(() => {});
    return () => { stale = true; };
  }, []);

  useEffect(() => {
    if (!toasts.length) return;
    const timer = setTimeout(() => setToasts(t => t.slice(1)), TOAST_MS);
    return () => clearTimeout(timer);
  }, [toasts]);

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

  return (
    <>
      {weather && (
        <div className={`ambience-sky ${weather}`} aria-hidden="true">
          {PARTICLES.map((p, i) => (
            <i key={i} style={{ left: `${p.left}%`, animationDelay: `-${p.delay}s`, animationDuration: `${weather === 'snow' ? 7 + p.speed : 0.9 + p.speed / 20}s` }} />
          ))}
        </div>
      )}

      <div className="ambience-notes" role="status">
        {toasts.slice(0, 1).map(t => <span key={t} className="ambience-note toast">{t}</span>)}
        {!admin && count >= 2 && <span className="ambience-note">🔥 {count}명이 지금 공부 중입니다</span>}
      </div>
    </>
  );
}
