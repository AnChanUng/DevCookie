import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Link } from 'react-router-dom';
import { account, onAccountChange, pushRemoteNow } from '../sync';
import { loadAccountRecords } from '../accountRecords';
import { buildAccountRetry, updateRetryRecords } from '../accountRetry';
import { CompanyExamWithProgress } from './ExamCompanyPage';

const snapshot = () => account()?.token || '';
export default function AccountRetryPage() {
  const token = useSyncExternalStore(onAccountChange, snapshot, () => '');
  return <LoadRetry key={token} user={token ? account() : null} />;
}

function LoadRetry({ user }) {
  const [result, setResult] = useState(null);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    loadAccountRecords(user, controller.signal).then(next => {
      if (!controller.signal.aborted) setResult(next);
    });
    return () => controller.abort();
  }, [user, revision]);
  if (!result || result.failed.length) return <div className="account-page">
    <Link to="/account">← 내 계정</Link><h1>전체 오답 다시 풀기</h1>
    {!result ? <p role="status">모든 문제집의 오답을 불러오는 중…</p> : <>
      <p role="alert">일부 기록을 불러오지 못했습니다. 전체 오답을 불러온 뒤 시작할 수 있습니다.</p>
      <button className="exam-btn" onClick={() => { setResult(null); setRevision(n => n + 1); }}>다시 불러오기</button>
    </>}
  </div>;
  return <RetrySession records={result.records} />;
}

function RetrySession({ records }) {
  const [retry] = useState(() => buildAccountRetry(records));
  const [data, setData] = useState(retry.data);
  const latest = useRef(data);
  const sourceRecords = useRef(records);
  const save = updater => {
    const next = { ...(typeof updater === 'function' ? updater(latest.current) : updater), updatedAt: Date.now() };
    const changed = updateRetryRecords(sourceRecords.current, retry.sources, latest.current, next, next.updatedAt);
    for (const [bank, record] of Object.entries(changed)) {
      try { localStorage.setItem(`exam-progress:${bank}`, JSON.stringify(record)); } catch { /* storage unavailable */ }
      pushRemoteNow(bank, record);
    }
    sourceRecords.current = { ...sourceRecords.current, ...changed };
    latest.current = next;
    setData(next);
  };
  if (!retry.company.questions.length) return <div className="account-page">
    <Link to="/account">← 내 계정</Link><h1>전체 오답 다시 풀기</h1><p>다시 풀 오답이 없습니다.</p>
  </div>;
  return <CompanyExamWithProgress company={retry.company} progress={{ data, save }}
    initialIds={retry.company.questions.map(q => q.id)} back={{ to: '/account', label: '← 내 계정' }} />;
}
