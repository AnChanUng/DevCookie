import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter } from 'k6/metrics';

const base = (__ENV.BASE_URL || 'http://127.0.0.1:18080').replace(/\/$/, '');
// This suite writes synthetic usage records. Only loopback targets are supported.
if (!/^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(base)) {
  throw new Error('BASE_URL must be a local HTTP server with an explicit port.');
}
const mode = __ENV.PROFILE || 'smoke';
if (!['smoke', 'load', 'rate-limit'].includes(mode)) throw new Error('Unknown PROFILE');
const blocked = new Counter('rate_limited_requests');
const serverErrors = new Counter('server_errors');
const plans = {
  smoke: { vus: 1, iterations: 3 },
  load: {
    stages: [
      { duration: '15s', target: 10 },
      { duration: '25s', target: 30 },
      { duration: '25s', target: 60 },
      { duration: '25s', target: 100 },
      { duration: '20s', target: 100 },
      { duration: '10s', target: 0 },
    ],
  },
  'rate-limit': { vus: 1, iterations: 1 },
};
const routes = ['categories', 'question-list', 'question-detail', 'rank', 'lounge', 'membership', 'metrics', 'track'];
export const options = {
  ...plans[mode],
  thresholds: mode === 'rate-limit' ? {
    checks: ['rate==1'],
    server_errors: ['count==0'],
    rate_limited_requests: ['count>=20'],
  } : {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    checks: ['rate>0.99'],
    server_errors: ['count==0'],
    ...Object.fromEntries(routes.map(name => [`http_req_duration{endpoint:${name}}`, ['p(95)<500']])),
  },
  summaryTrendStats: ['avg', 'med', 'p(90)', 'p(95)', 'p(99)', 'max'],
  userAgent: 'cs-study-k6-local-load-test',
};
function request(method, path, payload, endpoint, visitor) {
  const res = http.request(method, `${base}/api/v1${path}`, payload == null ? null : JSON.stringify(payload), {
    headers: { 'Content-Type': 'application/json', ...(visitor ? { 'X-Visitor-Id': visitor } : {}) },
    tags: { endpoint },
    timeout: '10s',
    responseCallback: http.expectedStatuses(200, 204),
  });
  serverErrors.add(res.status >= 500 || res.status === 0 ? 1 : 0);
  return res;
}
export function setup() {
  const categories = request('GET', '/categories', null, 'setup');
  if (categories.status !== 200 || !categories.json().some(c => c.slug === 'database')) {
    throw new Error('Seeded PostgreSQL fixture is not ready');
  }
  const questions = request('GET', '/questions/category/database', null, 'setup');
  if (questions.status !== 200 || !questions.json().length) throw new Error('Question fixture is empty');
  return { questionId: questions.json()[0].id, run: `k6-${Date.now()}` };
}
export default function (fixture) {
  if (mode === 'rate-limit') {
    let accepted = 0, throttled = 0;
    for (let i = 0; i < 200; i++) {
      const response = http.get(`${base}/api/v1/questions/${fixture.questionId}`, {
        tags: { endpoint: 'rate-limit' }, timeout: '10s',
        responseCallback: http.expectedStatuses(200, 429),
      });
      serverErrors.add(response.status >= 500 || response.status === 0 ? 1 : 0);
      if (response.status === 200) accepted++;
      if (response.status === 429) { throttled++; blocked.add(1); }
      check(response, {
        'only success or intentional throttling': r => r.status === 200 || r.status === 429,
        'throttled responses include Retry-After': r => r.status !== 429 || Number(r.headers['Retry-After']) > 0,
      });
    }
    check(null, {
      'content requests reach the configured limit': () => accepted >= 170 && accepted <= 180,
      'excess content requests are blocked': () => throttled >= 20,
    });
    console.log(`Content limit result: ${accepted} accepted, ${throttled} throttled (200 requests; setup consumes one content request).`);
    return;
  }
  const visitor = `${fixture.run}-${__VU}`;
  const steps = [
    ['GET', '/categories', null, 'categories', r => Array.isArray(r.json()) && r.json().length > 0],
    ['GET', '/questions/category/database', null, 'question-list', r => Array.isArray(r.json()) && r.json().length > 0],
    ['GET', `/questions/${fixture.questionId}`, null, 'question-detail', r => r.json().id === fixture.questionId],
    ['GET', '/rank/solved', null, 'rank', r => Array.isArray(r.json().top)],
    ['GET', '/lounge/messages', null, 'lounge', r => Array.isArray(r.json().messages)],
    ['GET', '/membership', null, 'membership', r => typeof r.json().tier === 'string'],
    ['GET', '/public/metrics', null, 'metrics', r => typeof r.json().visitors30d === 'number'],
    ['POST', '/track', { visitorId: visitor, type: 'view', path: '/load-test', device: 'desktop' }, 'track', () => true],
  ];
  for (const [method, path, payload, endpoint, valid] of steps) {
    const res = request(method, path, payload, endpoint, visitor);
    check(res, { [`${endpoint}: status and response shape`]: r => {
      if (r.status !== (method === 'POST' ? 204 : 200)) return false;
      try { return valid(r); } catch { return false; }
    } });
  }
  sleep(1);
}
export function handleSummary(data) {
  const report = __ENV.REPORT_PATH || `load-tests/results/${mode}.json`;
  const metrics = data.metrics;
  const failed = Object.entries(metrics).flatMap(([name, metric]) => Object.entries(metric.thresholds || {})
    .filter(([, threshold]) => !threshold.ok).map(([threshold]) => `${name}: ${threshold}`));
  return {
    [report]: JSON.stringify({ mode, baseUrl: base, generatedAt: new Date().toISOString(), ...data }, null, 2),
    stdout: `${JSON.stringify({ mode, requests: metrics.http_reqs?.values, durationMs: metrics.http_req_duration?.values,
      failedRequests: metrics.http_req_failed?.values, checks: metrics.checks?.values, failedThresholds: failed }, null, 2)}\n`,
  };
}
