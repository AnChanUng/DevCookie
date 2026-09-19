import { useState } from 'react';
import api from '../api';
import { visitorId } from '../track';

const KINDS = [
  ['answer', '정답이 틀렸어요'],
  ['typo', '오타가 있어요'],
  ['explain', '해설이 이상해요'],
  ['etc', '그 밖의 문제'],
];

// 복원 문제라 오타·정답 오류가 섞일 수 있어서, 문제를 보는 자리에서 바로 알릴 수 있게 한다
export default function ReportButton({ q }) {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState('answer');
  const [message, setMessage] = useState('');
  const [state, setState] = useState('');

  const send = (e) => {
    e.preventDefault();
    const id = visitorId();
    if (!id) { setState('done'); return; }
    setState('sending');
    api.post('/reports', {
      visitorId: id,
      path: window.location.pathname,
      questionId: String(q.id),
      questionText: (q.q || '').slice(0, 300),
      kind,
      message: message.trim() || undefined,
    }, { timeout: 60000 })
      .then(() => { setState('done'); setOpen(false); setMessage(''); })
      .catch(err => setState(err.response?.data?.error || '보내지 못했습니다. 잠시 후 다시 시도해 주세요.'));
  };

  if (state === 'done') return <span className="exam-report-done">제보 고마워요! 확인 후 고칠게요</span>;

  if (!open) {
    return (
      <button type="button" className="exam-report-open" onClick={() => setOpen(true)} title="이 문제의 오류 알리기">
        오류 제보
      </button>
    );
  }

  return (
    <form className="exam-report" onSubmit={send}>
      <div className="exam-report-kinds">
        {KINDS.map(([k, label]) => (
          <label key={k} className={kind === k ? 'on' : ''}>
            <input type="radio" name={`report-${q.id}`} value={k} checked={kind === k} onChange={() => setKind(k)} />
            {label}
          </label>
        ))}
      </div>
      <textarea
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder="어디가 잘못됐는지 적어 주세요 (선택)"
        maxLength={1000}
        rows={2}
      />
      <div className="exam-report-actions">
        <button type="submit" className="exam-btn sm primary" disabled={state === 'sending'}>
          {state === 'sending' ? '보내는 중' : '보내기'}
        </button>
        <button type="button" className="exam-btn sm" onClick={() => { setOpen(false); setState(''); }}>취소</button>
        {state && state !== 'sending' && <span className="exam-report-error">{state}</span>}
      </div>
    </form>
  );
}
