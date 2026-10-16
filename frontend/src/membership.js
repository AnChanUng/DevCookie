import { useEffect, useState, useSyncExternalStore } from 'react';
import api from './api';
import { account, onAccountChange } from './sync';
import { visitorId } from './track';

export const TIER_NAMES = { BRONZE: '브론즈', SILVER: '실버', GOLD: '골드', DIAMOND: '다이아', RUBY: '루비' };
export const isGold = tier => ['GOLD', 'DIAMOND', 'RUBY'].includes(tier);
export function membershipHeaders() {
  const token = account()?.token;
  return { 'X-Visitor-Id': visitorId(), ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}
const snapshot = () => account()?.token || '';
export function useMembership(revision = 0) {
  const token = useSyncExternalStore(onAccountChange, snapshot, () => '');
  const [state, setState] = useState({ token, revision, loading: true, membership: null, error: false });
  useEffect(() => {
    const controller = new AbortController();
    api.get('/membership', { headers: membershipHeaders(), signal: controller.signal, timeout: 90000 })
      .then(({ data }) => { if (!controller.signal.aborted) setState({ token, revision, loading: false, membership: data, error: false }); })
      .catch(() => { if (!controller.signal.aborted) setState({ token, revision, loading: false, membership: null, error: true }); });
    return () => controller.abort();
  }, [token, revision]);
  return state.token === token && state.revision === revision ? state : { loading: true, membership: null, error: false };
}
