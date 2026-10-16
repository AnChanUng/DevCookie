import { TIER_NAMES } from '../membership';
import './TierBadge.css';
const ICONS = { BRONZE: 1, SILVER: 6, GOLD: 11, DIAMOND: 21, RUBY: 26 };
export default function TierBadge({ tier }) {
  if (!TIER_NAMES[tier]) return null;
  return <span className={`tier-badge tier-${tier.toLowerCase()}`} aria-label={`등급 ${TIER_NAMES[tier]}`} title={TIER_NAMES[tier]}>
    <img src={`https://static.solved.ac/tier_small/${ICONS[tier]}.svg`} alt="" aria-hidden="true" width="15" height="20" />
  </span>;
}
