import { useId, useState } from 'react';
import TierBadge from './TierBadge';
import { TIER_NAMES } from '../membership';
const RULES = [
  ['BRONZE', '신규 방문자·신규 회원 · Ⅴ→Ⅰ: 0·5·12·25·45문제'],
  ['SILVER', '서로 다른 문제 50개 이상 · Ⅴ→Ⅰ: 50·60·80·120·180문제'],
  ['GOLD', 'SSAFY 16기 교육생 · Ⅴ→Ⅰ: 0·20·50·100·170문제'],
  ['DIAMOND', '서로 다른 문제 300개 이상 · Ⅴ→Ⅰ: 300·350·450·650·950문제'],
  ['RUBY', '서로 다른 문제 1,000개 이상 · Ⅴ→Ⅰ: 1,000·1,100·1,300·1,700·2,300문제'],
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
      <dl>{RULES.map(([tier, rule]) => <div key={tier}><dt><TierBadge tier={tier} /><span>{TIER_NAMES[tier]}</span></dt><dd>{rule}</dd></div>)}</dl>
      <p>각 등급은 Ⅴ→Ⅳ→Ⅲ→Ⅱ→Ⅰ 순서이며, 단계가 올라갈수록 필요한 추가 문제 수가 늘어납니다.</p>
      <p>같은 문제를 여러 번 풀어도 1문제로 셉니다. 기존 골드 자격은 유지하며, 300·1,000문제부터 상위 등급으로 승급합니다.</p>
      <p>시험에서 95점 이상이면 한 단계 승급하며, 획득한 등급은 유지됩니다. 교육생 배지는 본인 설정에서만 확인할 수 있습니다.</p>
      <p>필기이론은 골드·다이아·루비 등급에서 이용할 수 있습니다.</p>
      <button type="button" className="exam-btn sm" onClick={() => setOpen(false)}>닫기</button>
    </section>}
  </div>;
}
