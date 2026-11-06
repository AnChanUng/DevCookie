import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { account } from '../sync';
import { membershipHeaders } from '../membership';
import './DirectChat.css';

const config = () => ({ headers: membershipHeaders(), timeout: 20000 });

export default function DirectChat({ participants, self }) {
  const [threads, setThreads] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const retry = useRef(null);
  const active = useRef(true);
  const list = useRef(null);
  const refresh = useCallback(async () => {
    const { data } = await api.get('/direct', config());
    if (active.current) { setThreads(data); setLoaded(true); }
  }, []);
  useEffect(() => {
    active.current = true;
    let pending = false;
    const poll = async () => {
      if (document.hidden || pending || !account()) return;
      pending = true;
      try { await refresh(); } catch { if (active.current) setError('목록을 불러오지 못했습니다. 잠시 후 다시 확인합니다.'); }
      finally { pending = false; }
    };
    poll();
    const timer = setInterval(poll, 5000);
    return () => { active.current = false; clearInterval(timer); };
  }, [refresh]);
  useEffect(() => {
    if (!selected) return;
    let alive = true, pending = false;
    const poll = async () => {
      if (document.hidden || pending) return;
      pending = true;
      try {
        const { data } = await api.get(`/direct/${selected.id}/messages`, config());
        if (!alive) return;
        setMessages(data);
        if (data.length) await api.post(`/direct/${selected.id}/read`, { last: data.at(-1).id }, config());
      } catch { if (alive) setError('대화를 불러오지 못했습니다. 잠시 후 다시 확인합니다.'); }
      finally { pending = false; }
    };
    poll(); const timer = setInterval(poll, 3000);
    return () => { alive = false; clearInterval(timer); };
  }, [selected]);
  useEffect(() => { if (list.current) list.current.scrollTop = list.current.scrollHeight; }, [messages.length]);
  const run = async action => {
    if (busy) return;
    setBusy(true); setError('');
    try { await action(); await refresh(); }
    catch (e) { if (active.current) setError(e.response?.data?.error || '처리하지 못했습니다. 잠시 후 다시 시도해 주세요.'); }
    finally { if (active.current) setBusy(false); }
  };
  const choose = thread => { setSelected(thread); setMessages([]); setText(''); retry.current = null; setError(''); };
  const start = (nickname, friend = false) => run(async () => {
    const { data } = await api.post('/direct', { nickname }, config());
    if (friend) await api.post(`/direct/${data.id}/friend`, { action: 'request' }, config());
    else if (active.current) choose(data);
  });
  const friend = (id, action) => run(() => api.post(`/direct/${id}/friend`, { action }, config()));
  const send = e => {
    e.preventDefault();
    if (!text.trim() || !selected) return;
    const body = retry.current?.text === text.trim() ? retry.current : { text: text.trim(), clientId: crypto.randomUUID() };
    retry.current = body;
    run(async () => {
      await api.post(`/direct/${selected.id}/messages`, body, config());
      if (!active.current) return;
      setText(''); retry.current = null;
      const { data } = await api.get(`/direct/${selected.id}/messages`, config());
      if (active.current) setMessages(data);
    });
  };
  if (!account()) return <div className="direct-panel"><p>1:1 대화와 친구 목록은 계정에 저장됩니다.</p><Link to="/account">로그인하고 이용하기 →</Link></div>;
  return <div className={`direct-panel${selected ? ' direct-conversation' : ''}`}>
    {error && <p role="alert" className="lounge-error">{error}</p>}
    {selected ? <>
      <div className="direct-heading"><button disabled={busy} onClick={() => { setSelected(null); setMessages([]); }}>← 목록</button><strong>{selected.nickname}님과 1:1 대화</strong></div>
      <p className="direct-hint">두 사람만 볼 수 있는 대화입니다. 최근 100개 메시지를 표시합니다.</p>
      <div className="direct-messages" ref={list}>
        {!messages.length && <p>첫 메시지를 보내 보세요.</p>}
        {messages.map(m => <div key={m.id} className={`lounge-msg${m.mine ? ' mine' : ''}`}><span className="lounge-meta">{m.mine ? '나' : selected.nickname} · {new Date(m.at).toLocaleString('ko-KR')}</span><span className="lounge-bubble">{m.text}</span></div>)}
      </div>
      <form className="lounge-form" onSubmit={send}><input aria-label="1:1 메시지" placeholder="메시지 (최대 1,000자)" maxLength={1000} value={text} disabled={busy} onChange={e => setText(e.target.value)} /><button disabled={busy || !text.trim()}>보내기</button></form>
    </> : <>
      <form className="direct-search" onSubmit={e => { e.preventDefault(); start(name.trim()); }}><input aria-label="상대 닉네임" placeholder="계정 닉네임으로 대화 시작" value={name} onChange={e => setName(e.target.value)} /><button disabled={busy || !name.trim()}>대화</button></form>
      <h3>접속 중</h3>
      {participants.filter(p => p.id !== self && p.nickname !== account()?.nickname).map(p => <div className="direct-row" key={p.id}><span>{p.nickname}</span><button disabled={busy} onClick={() => start(p.nickname)}>1:1 대화</button><button disabled={busy} onClick={() => start(p.nickname, true)}>친구 추가</button></div>)}
      <h3>친구 · 요청 · 대화 목록</h3>
      {!loaded && <p>목록을 불러오는 중…</p>}
      {loaded && !threads.length && <p>닉네임으로 대화를 시작하거나 접속 중인 친구를 추가해 보세요.</p>}
      {threads.map(t => <div className="direct-contact" key={t.id}>
        <div className="direct-row"><button disabled={busy} onClick={() => choose(t)}>{t.nickname}{t.unread > 0 ? ` · 새 메시지 ${t.unread}` : ''}</button><span>{({friends:'친구',sent:'수락 대기',received:'받은 친구 요청',none:'대화'})[t.friendship]}</span></div>
        <div className="direct-actions">
          {t.friendship === 'none' && <button disabled={busy} onClick={() => friend(t.id, 'request')}>친구 추가</button>}
          {t.friendship === 'received' && <button disabled={busy} onClick={() => friend(t.id, 'accept')}>수락</button>}
          {t.friendship !== 'none' && <button disabled={busy} onClick={() => friend(t.id, 'remove')}>{({friends:'친구 삭제',sent:'요청 취소',received:'거절'})[t.friendship]}</button>}
        </div>
      </div>)}
    </>}
  </div>;
}
