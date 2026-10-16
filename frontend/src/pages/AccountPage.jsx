import { useEffect, useState, useSyncExternalStore } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { account, changeNickname, onAccountChange, signIn, signOut } from '../sync';
import { loadAccountRecords, summarizeAccount } from '../accountRecords';
import { CS_NOTES, migrateNotesCompletion } from '../data/csNotes';
import QuestionExplanation from '../components/QuestionExplanation';
import { buildAccountRetry } from '../accountRetry';
import './AccountPage.css';
import TierBadge from '../components/TierBadge';
import { TIER_NAMES, useMembership } from '../membership';
import { savedNickname, saveNickname } from '../nickname';
import api from '../api';
import { visitorId } from '../track';

const snapshot = () => account() ? `${account().token}:${account().nickname}` : '';
export default function AccountPage() {
  const token = useSyncExternalStore(onAccountChange, snapshot, () => '');
  const location = useLocation();
  useEffect(() => {
    if (location.hash !== '#settings' || typeof document === 'undefined') return;
    const settings = document.getElementById?.('settings');
    settings?.scrollIntoView?.({ block: 'start' });
    settings?.focus?.({ preventScroll: true });
  }, [location.hash, location.key]);
  return <AccountDashboard key={token} user={token ? account() : null} />;
}
function AccountDashboard({ user }) {
  const [form, setForm] = useState({ nickname: '', password: '' });
  const [authBusy, setAuthBusy] = useState(false);
  const [nicknameDraft, setNicknameDraft] = useState(user?.nickname || savedNickname());
  const [message, setMessage] = useState('');
  const [result, setResult] = useState({ records: {}, failed: [] });
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  const [query, setQuery] = useState('');
  const [wrongOnly, setWrongOnly] = useState(false);
  const [limit, setLimit] = useState(20);
  const tierStatus = useMembership(revision);
  useEffect(() => {
    const controller = new AbortController();
    loadAccountRecords(user, controller.signal).then(next => {
      if (!controller.signal.aborted) { setResult(next); setLoading(false); }
    });
    return () => controller.abort();
  }, [user, revision]);
  async function authenticate(mode) {
    setAuthBusy(true); setMessage('');
    try { await signIn(mode, form.nickname.trim(), form.password); }
    catch (error) { setMessage(error?.response?.data?.error || '로그인하지 못했습니다. 입력 내용과 서버 연결을 확인해 주세요.'); }
    finally { setAuthBusy(false); }
  }
  const { rows, attempts, correct, wrong } = summarizeAccount(result.records);
  const retryCount = buildAccountRetry(result.records).company.questions.length;
  const filtered = rows.filter(r => (!wrongOnly || r.last === 'w') && `${r.bank} ${r.title}`.toLowerCase().includes(query.trim().toLowerCase()));
  const noteRecords = migrateNotesCompletion(result.records['cs-notes-v1']?.completed);
  const completed = CS_NOTES.flatMap(s => s.items).filter(e => noteRecords[e.id]?.done);
  return <div className="account-page fade-in">
    <header className="page-header"><h1>내 계정</h1><p>{user ? `${user.nickname}님의 학습 기록` : '로그인하면 내 계정에 저장된 학습 기록을 볼 수 있습니다.'}</p></header>
    <section className="account-auth" id="settings" tabIndex={-1}>
      <h2>본인 설정</h2>
      {user ? <><div className="account-actions"><strong>{user.nickname}</strong><button className="exam-btn sm" disabled={authBusy} onClick={async () => { setAuthBusy(true); await signOut(); }}>로그아웃</button></div>
        <form onSubmit={async e => {
          e.preventDefault(); setAuthBusy(true); setMessage('');
          try { await changeNickname(nicknameDraft.trim()); setMessage('닉네임을 변경했습니다. 다음 로그인부터 새 닉네임을 사용해 주세요.'); }
          catch (error) { setMessage(error?.response?.data?.error || '닉네임을 변경하지 못했습니다.'); }
          finally { setAuthBusy(false); }
        }}>
          <input aria-label="새 닉네임" maxLength={20} value={nicknameDraft} onChange={e => setNicknameDraft(e.target.value)} />
          <button className="exam-btn sm" disabled={authBusy || !nicknameDraft.trim() || nicknameDraft.trim() === user.nickname}>닉네임 변경</button>
        </form></> : <form onSubmit={e => { e.preventDefault(); authenticate('login'); }}>
        <input aria-label="닉네임" placeholder="닉네임" autoComplete="username" maxLength={20} value={form.nickname} onChange={e => setForm({ ...form, nickname: e.target.value })} />
        <input aria-label="비밀번호" type="password" placeholder="비밀번호" autoComplete="current-password" maxLength={72} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
        <button className="exam-btn sm primary" disabled={authBusy || !form.nickname.trim() || !form.password}>로그인</button>
        <button type="button" className="exam-btn sm" disabled={authBusy || !form.nickname.trim() || !form.password} onClick={() => authenticate('register')}>새 계정 만들기</button>
      </form>}
      {!user && <form onSubmit={async e => {
        e.preventDefault(); setAuthBusy(true); setMessage('');
        try {
          const { data } = await api.put('/profile', { visitorId: visitorId(), nickname: nicknameDraft.trim() });
          saveNickname(data.nickname); setNicknameDraft(data.nickname); setMessage('방문자 닉네임을 변경했습니다.'); setRevision(v => v + 1);
        } catch (error) { setMessage(error?.response?.data?.error || '닉네임을 변경하지 못했습니다.'); }
        finally { setAuthBusy(false); }
      }}>
        <input aria-label="방문자 닉네임" placeholder="방문자 닉네임" maxLength={20} value={nicknameDraft} onChange={e => setNicknameDraft(e.target.value)} />
        <button className="exam-btn sm" disabled={authBusy || !nicknameDraft.trim()}>닉네임 변경</button>
      </form>}
      {message && <p role="alert">{message}</p>}
    </section>
    <section className="membership-panel">
      <h2>내 등급 {tierStatus.membership && <TierBadge tier={tierStatus.membership.tier} />}</h2>
      {tierStatus.loading ? <p role="status">등급을 불러오는 중…</p> : tierStatus.error ? <p role="alert">등급을 불러오지 못했습니다. 새로고침해 주세요.</p> : <p>
        누적 {tierStatus.membership.solvedCount.toLocaleString()}문제
        {tierStatus.membership.nextTier ? ` · ${TIER_NAMES[tierStatus.membership.nextTier]}까지 ${tierStatus.membership.remaining.toLocaleString()}문제` : ' · 최고 등급입니다!'}
      </p>}
      <p>브론즈: 기본 방문자 · 실버: 50문제 · 골드: SSAFY 16기 교육생 · 다이아: 200문제 · 루비: 1,000문제</p>
      <p>같은 문제의 반복 풀이는 1문제로 집계합니다. 필기이론은 골드 이상 이용할 수 있습니다.</p>
    </section>
    <div className="account-record-heading"><p>{user ? '계정에 저장된 기록' : '현재 브라우저의 비로그인 풀이 기록'} · 문제집별 문항 기준</p><button className="exam-btn sm" disabled={loading} onClick={() => { setLoading(true); setRevision(v => v + 1); }}>새로고침</button></div>
    {loading && <p role="status">학습 기록을 불러오는 중… 서버가 깨어나는 데 시간이 걸릴 수 있습니다.</p>}
    {!!result.failed.length && <p role="alert">{result.failed.length}개 기록을 불러오지 못했습니다. 아래는 불러온 기록만 표시합니다. 새로고침하거나 다시 로그인해 주세요.</p>}
    <div className="account-metrics">
      {[[rows.length, '풀어본 문항'], [attempts, '총 풀이 횟수'], [attempts ? `${Math.round(correct / attempts * 100)}%` : '—', '누적 정답률'], [wrong, '최근 오답 문항'], [completed.length, '전공노트 완료']].map(([value, label]) => <div key={label}><strong>{loading ? '…' : value}</strong><span>{label}</span></div>)}
    </div>
    <section className="account-history"><h2>풀었던 문제</h2>
      {!loading && !result.failed.length && retryCount > 0 && <p><Link className="exam-btn primary" to="/account/retry">오답 전체 다시 풀기 ({retryCount}문제)</Link></p>}
      <p>기업·문제집 구분 없이 한 번이라도 틀린 문제를 모두 다시 풀 수 있습니다.</p>
      <div className="account-filters"><input aria-label="풀이 기록 검색" placeholder="문제 또는 문제집 검색" value={query} onChange={e => { setQuery(e.target.value); setLimit(20); }} /><label><input type="checkbox" checked={wrongOnly} onChange={e => { setWrongOnly(e.target.checked); setLimit(20); }} /> 최근 오답만</label></div>
      {!loading && !filtered.length && <p>표시할 풀이 기록이 없습니다.</p>}
      {filtered.slice(0, limit).map(row => <details className="account-question" key={row.key}><summary><span className="account-result">{row.last === 'r' ? '정답' : '오답'}</span><span>{row.bank} · {row.title}</span></summary><div><p>총 {row.c + row.w}회 · 정답 {row.c}회 / 오답 {row.w}회{row.at > 0 && ` · 최근 풀이 ${new Date(row.at).toLocaleString('ko-KR')}`}</p>{row.question && <QuestionExplanation q={row.question} />}<Link to={row.path}>해당 문제집 열기 →</Link></div></details>)}
      {filtered.length > limit && <button className="exam-btn" onClick={() => setLimit(n => n + 20)}>20개 더 보기 ({Math.min(limit, filtered.length)}/{filtered.length})</button>}
    </section>
    <section className="account-notes"><h2>학습 완료한 전공노트</h2>{completed.length ? <ul>{completed.map(entry => <li key={entry.id}><Link to={`/notes#${entry.id}`}>✓ {entry.title}</Link></li>)}</ul> : <p>아직 완료한 지식이 없습니다.</p>}<Link to="/notes">전공노트 공부하기 →</Link></section>
  </div>;
}
