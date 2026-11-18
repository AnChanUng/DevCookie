// 로그인 직후 여러 문제집 기록을 한꺼번에 동기화할 때 DB 커넥션 풀이 버티는지 본다.
//   sync   : 로그인한 사용자가 문제집 기록 BANKS개를 동시에 저장한다(다른 기기에서 로그인했을 때와 같은 모양)
//   browse : 같은 시간에 다른 방문자들이 문제 목록 · 순위 · 채팅을 조회한다
//   pool   : 1초마다 HikariCP 지표(active · pending)를 읽는다
// 로컬 loadtest 프로필 서버에만 보낸다.
//   k6 run -e REPORT_PATH=load-tests/results/progress-sync-before.json load-tests/progress-sync.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

const base = (__ENV.BASE_URL || 'http://127.0.0.1:18080').replace(/\/$/, '');
if (!/^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(base)) throw new Error('BASE_URL must be a local HTTP server with an explicit port.');
// 커넥션 풀 지표는 로컬 관리 포트에서 읽는다(서비스 포트의 /actuator는 보안 필터가 막는다)
const metricsBase = (__ENV.METRICS_URL || 'http://127.0.0.1:18081').replace(/\/$/, '');

const USERS = Number(__ENV.USERS || 30);        // 동시에 동기화하는 로그인 사용자 수
const BANKS = Number(__ENV.BANKS || 30);        // 사용자마다 저장하는 문제집 수
const QUESTIONS = Number(__ENV.QUESTIONS || 120); // 문제집마다 푼 문제 수
const DURATION = __ENV.DURATION || '60s';

const syncMs = new Trend('sync_request_ms', true);
const browseMs = new Trend('browse_request_ms', true);
const syncFailed = new Rate('sync_failed');
const browseFailed = new Rate('browse_failed');
const serverErrors = new Counter('server_errors');
const poolActive = new Trend('hikari_active');
const poolPending = new Trend('hikari_pending');
const poolAcquireMax = new Trend('hikari_acquire_max_ms');

export const options = {
  setupTimeout: '300s',
  scenarios: {
    sync: { executor: 'constant-vus', vus: USERS, duration: DURATION, exec: 'sync', startTime: '2s' },
    browse: { executor: 'constant-vus', vus: 40, duration: DURATION, exec: 'browse', startTime: '2s' },
    pool: { executor: 'constant-vus', vus: 1, duration: DURATION, exec: 'pool', startTime: '2s' },
  },
  summaryTrendStats: ['avg', 'med', 'p(90)', 'p(95)', 'p(99)', 'max'],
  userAgent: 'cs-study-k6-local-load-test',
};

// 문제집 하나의 풀이 기록. 서버의 ExamProgressMerge가 합치는 모양(stats · history · updatedAt)을 따른다
function progress(bank, seed) {
  const now = Date.now();
  const stats = {};
  for (let i = 0; i < QUESTIONS; i++) {
    const right = (i + seed) % 3 !== 0;
    stats[`${bank}-q${i}`] = { c: right ? 1 : 0, w: right ? 0 : 1, last: right ? 'r' : 'w', at: now - i * 1000 + seed };
  }
  const history = [];
  for (let i = 0; i < 20; i++) history.push({ at: now - i * 60000 + seed, mode: 'exam', sec: 'all', score: 15, total: 20 });
  return JSON.stringify({ stats, history, updatedAt: now + seed });
}

const banks = Array.from({ length: BANKS }, (_, i) => `k6bank${i}`);

function json(method, path, body, token, tag) {
  return http.request(method, `${base}/api/v1${path}`, body == null ? null : JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    tags: { endpoint: tag }, timeout: '60s',
  });
}

export function setup() {
  const run = `k${Date.now().toString(36)}`;
  const tokens = [];
  for (let u = 0; u < USERS; u++) {
    const res = json('POST', '/auth/register', { nickname: `${run}u${u}`, password: 'k6-local-only' }, null, 'setup');
    if (res.status !== 200) throw new Error(`register failed ${res.status} ${res.body}`);
    const token = res.json().token;
    tokens.push(token);
    // 이미 여러 문제집을 풀어 둔 사용자로 만든다
    for (const bank of banks) {
      const saved = json('PUT', `/exam/progress/${bank}`, { data: progress(bank, u) }, token, 'setup');
      if (saved.status !== 200) throw new Error(`seed failed ${saved.status} ${saved.body}`);
    }
  }
  return { tokens };
}

export function sync(data) {
  const token = data.tokens[(__VU - 1) % data.tokens.length];
  // 다른 기기에서 로그인한 직후처럼 모든 문제집 기록을 한꺼번에 올린다
  const responses = http.batch(banks.map(bank => ['PUT', `${base}/api/v1/exam/progress/${bank}`,
    JSON.stringify({ data: progress(bank, __ITER + __VU) }),
    { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, tags: { endpoint: 'progress-sync' }, timeout: '60s' }]));
  for (const r of responses) {
    syncMs.add(r.timings.duration);
    syncFailed.add(r.status !== 200);
    if (r.status >= 500 || r.status === 0) serverErrors.add(1);
  }
  check(responses, { 'all banks saved': rs => rs.every(r => r.status === 200) });
  sleep(1);
}

export function browse() {
  for (const [path, tag] of [['/questions/category/database', 'question-list'], ['/rank/solved', 'rank'], ['/lounge/messages', 'lounge'], ['/categories', 'categories']]) {
    const r = json('GET', path, null, null, tag);
    browseMs.add(r.timings.duration);
    browseFailed.add(r.status !== 200);
    if (r.status >= 500 || r.status === 0) serverErrors.add(1);
  }
  sleep(0.5);
}

function metric(name) {
  const r = http.get(`${metricsBase}/actuator/metrics/${name}`, { tags: { endpoint: 'metrics' }, timeout: '10s' });
  if (r.status !== 200) return null;
  const m = r.json().measurements || [];
  return m;
}

export function pool() {
  const active = metric('hikaricp.connections.active');
  const pending = metric('hikaricp.connections.pending');
  const acquire = metric('hikaricp.connections.acquire');
  if (active) poolActive.add(active[0].value);
  if (pending) poolPending.add(pending[0].value);
  if (acquire) { const max = acquire.find(x => x.statistic === 'MAX'); if (max) poolAcquireMax.add(max.value * 1000); }
  sleep(1);
}

export function handleSummary(data) {
  const report = __ENV.REPORT_PATH || 'load-tests/results/progress-sync.json';
  const pick = name => data.metrics[name]?.values;
  const summary = {
    users: USERS, banks: BANKS, questionsPerBank: QUESTIONS, duration: DURATION,
    syncRequests: pick('sync_request_ms'), syncFailed: pick('sync_failed'),
    browseRequests: pick('browse_request_ms'), browseFailed: pick('browse_failed'),
    serverErrors: pick('server_errors'),
    hikariActive: pick('hikari_active'), hikariPending: pick('hikari_pending'), hikariAcquireMaxMs: pick('hikari_acquire_max_ms'),
  };
  return {
    [report]: JSON.stringify({ baseUrl: base, generatedAt: new Date().toISOString(), summary, metrics: data.metrics }, null, 2),
    stdout: `${JSON.stringify(summary, null, 2)}\n`,
  };
}
