import { CookieIcon } from './TierBadge';
import './RankMedal.css';

// 1~3위 메달: 3위 동 쿠키, 2위 은 쿠키, 1위 금 쿠키 색에 순위 숫자. 4위부터는 숫자만
const MEDAL_TIER = ['GOLD', 'SILVER', 'BRONZE'];
export default function RankMedal({ rank, className = '' }) {
  if (!(rank >= 1 && rank <= 3)) return <span className={className}>{rank}</span>;
  return <span className={`rank-medal m${rank} ${className}`} aria-label={`${rank}위`}>
    <CookieIcon tier={MEDAL_TIER[rank - 1]} />
    <b aria-hidden="true" data-n={rank} />
  </span>;
}
