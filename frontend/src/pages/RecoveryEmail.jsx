import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const timeout = 90000;
const failure = error => error?.response?.data?.error || '요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.';

export function RecoveryEmailSettings({ token }) {
  const [status, setStatus] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    api.get('/auth/recovery-email', { headers: { Authorization: `Bearer ${token}` }, signal: controller.signal, timeout })
      .then(({ data }) => setStatus(data))
      .catch(error => { if (!controller.signal.aborted) setMessage(failure(error)); });
    return () => controller.abort();
  }, [token]);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      await api.post('/auth/recovery-email', { email, password }, { headers: { Authorization: `Bearer ${token}` }, timeout });
      setPassword('');
      setMessage('입력한 이메일의 인증 링크를 열어 등록을 완료해 주세요.');
    } catch (error) {
      setMessage(failure(error));
    } finally {
      setBusy(false);
    }
  }

  return <div>
    <h3>복구 이메일</h3>
    {status && <p>{status.email ? `인증된 이메일: ${status.email}` : '비밀번호를 잊었을 때 사용할 이메일을 등록해 주세요.'}</p>}
    {status?.available === false && <p>복구 이메일 발송을 준비 중입니다.</p>}
    {status?.available && <form onSubmit={submit}>
      <input aria-label="복구 이메일" placeholder="복구 이메일" type="email" autoComplete="email" required maxLength={254} value={email} onChange={event => setEmail(event.target.value)} />
      <input aria-label="현재 비밀번호" placeholder="현재 비밀번호" type="password" autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} />
      <button type="submit" className="exam-btn sm" disabled={busy}>인증 메일 보내기</button>
    </form>}
    {message && <p role="status">{message}</p>}
  </div>;
}

export function RecoveryLink({ action, token }) {
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState('');
  const verify = action === 'verify';

  async function submit(event) {
    event.preventDefault();
    if (!verify && password !== confirmation) {
      setMessage('새 비밀번호가 일치하지 않습니다.');
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      const path = verify ? '/auth/recovery-email/verify' : '/auth/reset-password';
      await api.post(path, verify ? { token } : { token, password }, { timeout });
      setDone(true);
    } catch (error) {
      setMessage(failure(error));
    } finally {
      setBusy(false);
    }
  }

  return <div className="account-page">
    <section className="account-auth">
      <h1>{verify ? '복구 이메일 인증' : '비밀번호 재설정'}</h1>
      {done ? <p role="status">{verify ? '복구 이메일을 등록했습니다.' : '비밀번호를 변경했습니다. 새 비밀번호로 로그인해 주세요.'}</p>
        : token ? <form onSubmit={submit}>
          {!verify && <>
            <input aria-label="새 비밀번호" placeholder="새 비밀번호" type="password" autoComplete="new-password" required minLength={8} maxLength={72} value={password} onChange={event => setPassword(event.target.value)} />
            <input aria-label="새 비밀번호 확인" placeholder="새 비밀번호 확인" type="password" autoComplete="new-password" required value={confirmation} onChange={event => setConfirmation(event.target.value)} />
          </>}
          <button type="submit" className="exam-btn sm primary" disabled={busy}>{verify ? '이메일 인증하기' : '새 비밀번호 저장'}</button>
        </form> : <p role="alert">이메일의 링크를 다시 열어 주세요.</p>}
      {message && <p role="alert">{message}</p>}
      <Link to={verify || done ? '/account#settings' : '/account?reset=1#settings'}>{verify || done ? '내 계정으로 이동' : '새 재설정 링크 요청하기'}</Link>
    </section>
  </div>;
}
