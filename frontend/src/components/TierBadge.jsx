import { TIER_NAMES } from '../membership';
import './TierBadge.css';
export default function TierBadge({ tier }) {
  if (!TIER_NAMES[tier]) return null;
  return <span className={`tier-badge tier-${tier.toLowerCase()}`} aria-label={`등급 ${TIER_NAMES[tier]}`}>{TIER_NAMES[tier]}</span>;
}
