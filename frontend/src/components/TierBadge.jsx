import { TIER_NAMES } from '../membership';
import './TierBadge.css';
const ICONS = { BRONZE: 1, SILVER: 6, GOLD: 11, DIAMOND: 21, RUBY: 26 };
export default function TierBadge({ tier, division = 5 }) {
  if (!TIER_NAMES[tier]) return null;
  division = Number.isInteger(division) && division >= 1 && division <= 5 ? division : 5;
  const label = `${TIER_NAMES[tier]} ${["", "Ⅰ", "Ⅱ", "Ⅲ", "Ⅳ", "Ⅴ"][division]}`;
  return <span className={`tier-badge tier-${tier.toLowerCase()}`} aria-label={`등급 ${label}`} title={label}>
    <img src={`https://static.solved.ac/tier_small/${ICONS[tier] + 5 - division}.svg`} alt="" aria-hidden="true" width="15" height="20" />
  </span>;
}
