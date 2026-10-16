import { useId, useState } from 'react';
import TierBadge from './TierBadge';
const RULES = [
  ['BRONZE', '신규 방문자·신규 회원의 기본 등급'],
  ['SILVER', '서로 다른 문제 50개 이상 풀이'],
  ['GOLD', 'SSAFY 16기 교육생'],
  ['DIAMOND', '서로 다른 문제 200개 이상 풀이'],
  ['RUBY', '서로 다른 문제 1,000개 이상 풀이'],
];
export default function TierGuide() {
  const [open, setOpen] = useState(false);
  const id = useId();
  return <div className="tier-guide">
    <button type="button" className="tier-guide-toggle" aria-label="티어 기준 보기" title="티어 기준"
      aria-expanded={open} aria-controls={id} onClick={() => setOpen(value => !value)}
      onKeyDown={event => { if (event.key === 'Escape') setOpen(false); }}>ⓘ</button>
    {open && <section id={id} className="tier-guide-panel" aria-label="티어 등급 기준">
      <strong>티어 등급 기준</strong>
      <dl>{RULES.map(([tier, rule]) => <div key={tier}><dt><TierBadge tier={tier} /></dt><dd>{rule}</dd></div>)}</dl>
      <p>같은 문제를 여러 번 풀어도 1문제로 셉니다. 기존 골드 자격은 유지하며, 200·1,000문제부터 상위 등급으로 승급합니다.</p>
      <p>필기이론은 골드·다이아·루비 등급에서 이용할 수 있습니다.</p>
      <button type="button" className="exam-btn sm" onClick={() => setOpen(false)}>닫기</button>
    </section>}
  </div>;
}
