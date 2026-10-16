import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { visitorId } from '../track';
import { NICKNAME_MAX, cleanNickname, myNickname, saveNickname, savedNickname } from '../nickname';

const POLL_OPEN = 3000;
const POLL_CLOSED = 30000;
const TEXT_MAX = 200;
const koreanDay = (at = Date.now()) => new Date(new Date(at).getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);

// 대결 초대 글에 든 /duel/방번호 는 누르면 바로 들어가는 참가 버튼으로 보여 준다
function ChatText({ text }) {
  const m = text.match(/^(.*?)\s*\/duel\/([A-Za-z0-9]{6})\b(.*)$/s);
  if (!m) return text;
  return <>{m[1]} <Link to={`/duel/${m[2].toUpperCase()}`} className="lounge-join">참가하기 →</Link>{m[3]}</>;
}
const KEEP = 200;
const SEEN_KEY = 'lounge:seen';

const p2 = (n) => String(n).padStart(2, '0');
function fmtAt(iso) {
  const d = new Date(iso);
  const clock = `${p2(d.getHours())}:${p2(d.getMinutes())}`;
  return d.toDateString() === new Date().toDateString() ? clock : `${d.getMonth() + 1}.${d.getDate()} ${clock}`;
}

const readSeen = () => { try { return Number(localStorage.getItem(SEEN_KEY)) || 0; } catch { return 0; } };
const writeSeen = (id) => { try { localStorage.setItem(SEEN_KEY, String(id)); } catch { /* storage unavailable */ } };

// 접속해 있는 사람들이 함께 쓰는 채팅 창. 닫혀 있을 때도 가끔 새 글을 확인해 헤더에 알림 점을 띄운다
export default function LoungeChat({ open, online, onClose, onOnline, onUnread }) {
  const [messages, setMessages] = useState([]);
  const [ready, setReady] = useState(false);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [pending, setPending] = useState([]);
  const [streaming, setStreaming] = useState(false);
  const [nickname, setNickname] = useState(savedNickname);
  const [naming, setNaming] = useState(false);
  const [draftName, setDraftName] = useState('');

  const lastId = useRef(0);
  const epoch = useRef(null);
  const listRef = useRef(null);
  const stick = useRef(true);
  const openRef = useRef(open);
  const inFlight = useRef(false);
  const polling = useRef(false);
  const streamVersion = useRef(0);
  const acknowledged = useRef(new Set());
  const me = (visitorId() || '').slice(0, 8);

  useEffect(() => { openRef.current = open; }, [open]);

  // 받은 글을 목록에 합친다. replace면 처음부터 다시 받은 것이다
  const take = useCallback((rows, replace, advance = true) => {
    const newest = rows.length ? rows[rows.length - 1].id : (replace ? 0 : lastId.current);
    if (advance) lastId.current = replace ? newest : Math.max(lastId.current, newest);
    const confirmed = new Set(rows.map(m => m.clientId).filter(Boolean));
    for (const id of confirmed) acknowledged.current.add(id);
    while (acknowledged.current.size > KEEP) acknowledged.current.delete(acknowledged.current.values().next().value);
    setPending(prev => prev.filter(m => !confirmed.has(m.clientId)));
    setMessages(prev => {
      const have = new Set(replace ? [] : prev.map(m => m.id));
      return [...(replace ? [] : prev), ...rows.filter(m => !have.has(m.id))]
        .filter(m => koreanDay(m.at) === koreanDay()).sort((a, b) => a.id - b.id).slice(-KEEP);
    });
    if (openRef.current) {
      writeSeen(lastId.current);
      onUnread(false);
    } else {
      // 처음 온 사람에게는 예전 대화를 새 글로 치지 않는다
      let seen = readSeen();
      if (!seen) { seen = lastId.current; writeSeen(seen); }
      onUnread(lastId.current > seen);
    }
  }, [onUnread]);

  const poll = useCallback(async () => {
    if (document.hidden || polling.current) return;
    polling.current = true;
    const version = streamVersion.current;
    try {
      const first = epoch.current === null;
      let { data } = await api.get('/lounge/messages', { params: first ? {} : { after: lastId.current } });
      // 관리자가 글을 지웠으면 목록을 통째로 다시 받는다
      const reset = !first && data.epoch !== epoch.current;
      if (reset) ({ data } = await api.get('/lounge/messages'));
      if (version !== streamVersion.current) return;
      epoch.current = data.epoch;
      take(data.messages, first || reset);
      onOnline(data.online);
      setReady(true);
    } catch {
      /* 서버가 잠들어 있거나 끊겼다. 다음 차례에 다시 물어본다 */
    } finally { polling.current = false; }
  }, [take, onOnline]);

  useEffect(() => {
    const first = setTimeout(poll, 0);
    const timer = setInterval(poll, open && !streaming ? POLL_OPEN : POLL_CLOSED);
    document.addEventListener('visibilitychange', poll);
    return () => { clearTimeout(first); clearInterval(timer); document.removeEventListener('visibilitychange', poll); };
  }, [open, poll, streaming]);

  useEffect(() => {
    if (!open || typeof EventSource === 'undefined') return undefined;
    const source = new EventSource(`${api.defaults.baseURL}/lounge/stream`);
    source.addEventListener('messages', event => {
      try {
        const data = JSON.parse(event.data);
        streamVersion.current++;
        epoch.current = data.epoch;
        take(data.messages, true);
        onOnline(data.online);
        setReady(true);
        setStreaming(true);
      } catch { setStreaming(false); }
    });
    source.onerror = () => setStreaming(false); // EventSource reconnects; polling covers the gap.
    return () => { source.close(); setStreaming(false); };
  }, [open, take, onOnline]);

  // Clear yesterday's messages at Korean midnight, even with a disconnected server.
  useEffect(() => {
    const nextMidnight = new Date(`${koreanDay()}T00:00:00+09:00`).getTime() + 86400000;
    const timer = setTimeout(() => {
      setMessages(prev => prev.filter(m => koreanDay(m.at) === koreanDay()));
      setPending(prev => prev.filter(m => koreanDay(m.at) === koreanDay()));
      poll();
    }, Math.max(1, nextMidnight - Date.now()));
    return () => clearTimeout(timer);
  }, [messages, pending, poll]);

  // 맨 아래를 보고 있을 때만 새 글을 따라 내려간다
  useEffect(() => {
    const list = listRef.current;
    if (open && list && stick.current) list.scrollTop = list.scrollHeight;
  }, [messages, pending, open, ready]);

  const openNaming = () => { setDraftName(nickname); setNaming(true); };

  const saveName = (e) => {
    e.preventDefault();
    const name = cleanNickname(draftName);
    if (!name) return;
    saveNickname(name);
    setNickname(name);
    setNaming(false);
    // 순위에 나오는 이름도 함께 바뀐다
    api.put('/profile', { visitorId: visitorId(), nickname: name }).catch(() => {});
  };

  const deliver = async message => {
    if (inFlight.current) return;
    inFlight.current = true;
    setSending(true);
    setError('');
    setPending(prev => prev.map(m => m.clientId === message.clientId ? { ...m, status: 'sending' } : m));
    try {
      const { data } = await api.post('/lounge/messages', {
        visitorId: message.visitorId, nickname: message.nickname, text: message.text, clientId: message.clientId,
      }, { timeout: 90000 });
      stick.current = true;
      take([data], false, false);
    } catch (err) {
      if (!acknowledged.current.has(message.clientId)) {
        setPending(prev => prev.map(m => m.clientId === message.clientId ? { ...m, status: 'failed' } : m));
        setError(err.response?.data?.error || '보내지 못했습니다. 잠시 후 다시 시도해 주세요.');
      }
    } finally {
      inFlight.current = false;
      setSending(false);
    }
  };

  const send = e => {
    e.preventDefault();
    const body = text.trim(), id = visitorId();
    if (!body || inFlight.current || !id) return;
    const name = nickname || myNickname();
    const message = { clientId: crypto.randomUUID(), visitorId: id, visitor: me, nickname: name,
      text: body, at: new Date().toISOString(), status: 'sending' };
    setNickname(name);
    stick.current = true;
    setPending(prev => [...prev, message]);
    setText('');
    deliver(message);
  };

  if (!open) return null;

  return (
    <section className="lounge" aria-label="채팅">
      <header className="lounge-head">
        <div>
          <strong>공부방 채팅</strong>
          <span className="lounge-online"><i aria-hidden="true" />{online > 0 ? `${online}명 접속 중` : '접속 인원 확인 중'}</span>
        </div>
        <button type="button" className="lounge-close" onClick={onClose} aria-label="채팅 닫기">×</button>
      </header>

      <div className="lounge-list" ref={listRef}
        onScroll={e => { const el = e.currentTarget; stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40; }}>
        {!ready && <p className="lounge-empty">불러오는 중... 서버가 잠들어 있으면 1~2분 걸립니다</p>}
        {ready && messages.length === 0 && <p className="lounge-empty">아직 대화가 없습니다. 첫 인사를 남겨 보세요 👋</p>}
        {messages.map(m => (
          <div key={m.id} className={`lounge-msg${m.visitor === me ? ' mine' : ''}`}>
            <span className="lounge-meta">{m.visitor === me ? '나' : m.nickname} · {fmtAt(m.at)}</span>
            <span className="lounge-bubble"><ChatText text={m.text} /></span>
          </div>
        ))}
        {pending.map(m => <div key={m.clientId} className="lounge-msg mine">
          <span className="lounge-meta">나 · {m.status === 'failed' ? '전송 실패' : '전송 중…'}</span>
          <span className="lounge-bubble"><ChatText text={m.text} /></span>
          {m.status === 'failed' && <button type="button" disabled={sending} onClick={() => deliver(m)}>재시도</button>}
        </div>)}
      </div>

      {naming ? (
        <form className="lounge-name" onSubmit={saveName}>
          <input value={draftName} onChange={e => setDraftName(e.target.value)} maxLength={NICKNAME_MAX} placeholder="닉네임" autoFocus aria-label="닉네임" />
          <button type="submit">저장</button>
          <button type="button" onClick={() => setNaming(false)}>취소</button>
        </form>
      ) : (
        <div className="lounge-name">
          <span>{nickname ? <>닉네임 <b>{nickname}</b></> : '닉네임은 처음 보낼 때 자동으로 지어집니다.'}</span>
          <button type="button" onClick={openNaming}>{nickname ? '바꾸기' : '직접 정하기'}</button>
        </div>
      )}

      {error && <p className="lounge-error" role="alert">{error}</p>}
      <form className="lounge-form" onSubmit={send}>
        <input value={text} onChange={e => setText(e.target.value)} maxLength={TEXT_MAX} placeholder="메시지를 입력하세요" aria-label="메시지" />
        <button type="submit" disabled={sending || !text.trim()}>보내기</button>
      </form>
      <p className="lounge-rule">한국시간 00시에 전날 대화가 화면에서 사라집니다. 서로 존중하는 대화를 부탁드려요.</p>
    </section>
  );
}
