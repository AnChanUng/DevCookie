import { useState } from 'react';
import { Link } from 'react-router-dom';
import { isGold, useMembership } from '../membership';
import TierBadge from './TierBadge';
export default function GoldGate({ children }) {
  const [revision, setRevision] = useState(0);
  const { membership, loading, error } = useMembership(revision);
  if (loading) return <p role="status">이용 등급을 확인하는 중…</p>;
  if (membership && isGold(membership.tier)) return children;
  return <section className="membership-panel">
    <h1>필기이론 · 골드 이상 전용</h1>
    {error ? <p role="alert">등급을 확인하지 못했습니다. 다시 시도해 주세요.</p> : <p>내 등급 <TierBadge tier={membership?.tier} division={membership?.division} /> · 골드, 다이아, 루비 등급에서 이용할 수 있습니다.</p>}
    <p>기존 회원과 기존 순위 방문자는 골드로 유지됩니다. 이전에 이용하던 브라우저나 계정으로 접속해 주세요.</p>
    <Link className="exam-btn" to="/account">내 계정</Link>{' '}
    <button className="exam-btn" onClick={() => setRevision(v => v + 1)}>다시 확인</button>
  </section>;
}
