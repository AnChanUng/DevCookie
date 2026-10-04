// questionSims.js의 항목마다 시뮬레이션을 돌려 문제의 정답과 맞는지 확인한다.
// 실행: frontend 폴더에서  node --import ./scripts/extensionless-loader.mjs ../review/verify-question-sims.mjs
// 하나라도 어긋나면 종료 코드 1.
const data = (f) => new URL(`../frontend/src/data/${f}`, import.meta.url).href;
const { BANKS, allQuestions } = await import(data('examQuestions.js'));
const { runSchedule, runPaging, runDisk } = await import(data('calcGenerators.js'));
const { QUESTION_SIMS } = await import(data('questionSims.js'));

const index = new Map();
for (const b of BANKS) for (const q of allQuestions(b)) index.set(`${b.key}:${q.id}`, q);

const nums = (s) => (String(s).match(/\d+(?:\.\d+)?/g) || []).map(Number);
// "6.5", "6.5ms", "약 7.33", "8회", "26/4" 같은 표기를 숫자로 읽는다
const toNumber = (s) => {
  const t = String(s).replace(/,/g, '');
  const frac = t.match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/);
  if (frac) return Number(frac[1]) / Number(frac[2]);
  const m = t.match(/\d+(?:\.\d+)?/);
  return m ? Number(m[0]) : NaN;
};
const close = (x, y) => Math.abs(x - y) < 0.006;
// seq가 hay 안에 (연속으로 / 순서만 지켜서) 들어 있는가. 옮겨 적은 숫자가 문제 본문에 실제로 있는지 본다
const contiguous = (hay, seq) => hay.some((_, i) => seq.every((x, j) => hay[i + j] === x));
const inOrder = (hay, seq) => { let i = 0; for (const x of hay) if (x === seq[i]) i++; return i === seq.length; };

function check(key, sim) {
  const q = index.get(key);
  if (!q) return { ok: false, msg: '문제를 찾지 못함' };
  const keyed = Array.isArray(q.o) ? q.o[q.a] : q.ans; // 단답형은 o 대신 ans
  if (keyed == null) return { ok: false, msg: '정답을 읽지 못함' };
  const text = [q.q, q.ctx, q.code].filter(Boolean).join('\n');
  const body = nums(text);
  const want = toNumber(keyed);

  if (sim.type === 'gantt') {
    const n = sim.procs.length;
    if (!sim.procs.every(p => body.includes(p.burst))) return { ok: false, msg: '실행 시간이 본문에 없음' };
    if (sim.procs.some(p => p.arrival) && !inOrder(body, sim.procs.flatMap(p => [p.arrival, p.burst]))) return { ok: false, msg: '도착·실행 시간이 본문과 다름' };
    if (sim.algo === 'RR' && !body.includes(sim.quantum)) return { ok: false, msg: '시간 할당량이 본문에 없음' };
    if (!new RegExp(sim.algo === 'RR' ? 'RR|라운드 로빈' : sim.algo === 'SRT' ? 'SRT|선점형' : sim.algo === 'SJF' ? '비선점 SJF' : 'FCFS').test(text)) return { ok: false, msg: '알고리즘이 본문과 다름' };
    const { finish } = runSchedule(sim.procs, sim.algo, sim.quantum);
    const turn = sim.procs.reduce((s, p, i) => s + finish[i] - p.arrival, 0) / n;
    const wait = sim.procs.reduce((s, p, i) => s + finish[i] - p.arrival - p.burst, 0) / n;
    const askTurn = /반환/.test(q.q);
    const got = askTurn ? turn : wait;
    return { ok: close(got, want), msg: `${askTurn ? '평균 반환' : '평균 대기'} ${Number(got.toFixed(4))} / 정답 ${keyed}` };
  }
  if (sim.type === 'frames') {
    if (!contiguous(body, sim.refs)) return { ok: false, msg: '참조열이 본문과 다름' };
    if (!body.includes(sim.frames)) return { ok: false, msg: '프레임 수가 본문에 없음' };
    if (!new RegExp(sim.algo === 'OPT' ? 'OPT|최적' : sim.algo).test(text)) return { ok: false, msg: '알고리즘이 본문과 다름' };
    const { faults } = runPaging(sim.refs, sim.frames, sim.algo);
    const askHit = /적중 ?횟수/.test(q.q);
    const got = askHit ? sim.refs.length - faults : faults;
    return { ok: got === want, msg: `${askHit ? '적중' : '부재'} ${got} / 정답 ${keyed}` };
  }
  if (sim.type === 'disk') {
    if (!contiguous(body, sim.queue) || !body.includes(sim.start)) return { ok: false, msg: '대기 큐나 시작 위치가 본문과 다름' };
    if (!text.includes(sim.algo)) return { ok: false, msg: '알고리즘이 본문과 다름' };
    if (sim.algo === 'SCAN' && !body.includes(sim.max)) return { ok: false, msg: '끝 트랙이 본문에 없음' };
    const { path, total } = runDisk(sim.start, sim.queue, sim.algo, sim.max);
    if (/이동 거리/.test(q.q)) return { ok: total === want, msg: `이동 거리 ${total} / 정답 ${keyed}` };
    // 처리 순서를 묻는 문제: 정답 보기의 숫자들이 방문 순서의 앞부분과 같아야 한다
    const order = nums(keyed);
    const visited = path.slice(1, 1 + order.length);
    return { ok: order.length > 0 && order.every((x, i) => x === visited[i]), msg: `방문 순서 ${path.slice(1).join(' → ')} / 정답 ${keyed}` };
  }
  return { ok: false, msg: `알 수 없는 type ${sim.type}` };
}

let failed = 0;
const count = {};
const keys = Object.keys(QUESTION_SIMS);
for (const key of keys) {
  const sim = QUESTION_SIMS[key];
  const { ok, msg } = check(key, sim);
  if (ok) count[sim.type] = (count[sim.type] || 0) + 1; else failed++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${key.padEnd(16)} ${sim.type}/${sim.algo}  ${msg}`);
}
if (keys.join() !== keys.slice().sort().join()) { failed++; console.log('FAIL  키가 정렬되어 있지 않음'); }
console.log(`\n${keys.length}개 중 ${keys.length - failed}개 통과 (${Object.entries(count).map(([t, c]) => `${t} ${c}`).join(', ')}), 실패 ${failed}개`);
process.exit(failed ? 1 : 0);
