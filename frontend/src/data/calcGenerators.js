// 계산 문제 무한 생성기. 공식이 정해진 유형은 숫자만 바꿔 끝없이 낼 수 있어서,
// 문제를 저장해 두지 않고 그때그때 숫자를 뽑아 정답과 풀이 과정까지 직접 계산한다.
// 각 생성기는 { topic, q, ctx?, o[4], a, e, sim? } 를 돌려준다. sim은 해설에서 그림으로 보여 줄 재료다.

const rnd = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
const pick = (list) => list[rnd(0, list.length - 1)];
const shuffle = (arr) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = rnd(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const fix = (x) => String(Number(x.toFixed(2)));

// 정답과 그럴듯한 오답으로 보기 4개를 만든다. 오답이 모자라면 정답 근처의 값으로 채운다
function options(correct, wrongs, fmt = (x) => String(x)) {
  const answer = fmt(correct);
  const seen = new Set([answer]);
  const out = [];
  for (const w of wrongs) {
    const text = fmt(w);
    if (typeof w === 'number' && (!Number.isFinite(w) || w < 0)) continue;
    if (!seen.has(text)) { seen.add(text); out.push(text); }
    if (out.length === 3) break;
  }
  for (let step = 1; out.length < 3 && typeof correct === 'number'; step++) {
    for (const v of [correct + step, correct - step, correct + step * 2]) {
      const text = fmt(v);
      if (v >= 0 && !seen.has(text) && out.length < 3) { seen.add(text); out.push(text); }
    }
  }
  const o = shuffle([answer, ...out]);
  return { o, a: o.indexOf(answer) };
}

/* ===================== 네트워크 ===================== */

function subnetHosts() {
  const p = rnd(20, 30);
  const n = 2 ** (32 - p);
  return {
    topic: '서브넷 · 호스트 수',
    q: `프리픽스가 /${p}인 서브넷 하나에서 호스트에 할당할 수 있는 IP 주소는 몇 개인가?`,
    ...options(n - 2, [n, n - 1, n / 2 - 2, n * 2 - 2]),
    e: `호스트 부분은 32 − ${p} = ${32 - p}비트이므로 주소는 2^${32 - p} = ${n}개다. 여기서 네트워크 주소와 브로드캐스트 주소 2개를 빼면 ${n - 2}개를 호스트에 쓸 수 있다.`,
  };
}

function subnetAddress() {
  const p = rnd(25, 30);
  const block = 2 ** (32 - p);
  const d = rnd(1, 254);
  const net = Math.floor(d / block) * block;
  const bc = net + block - 1;
  const head = `${pick([10, 172, 192])}.${rnd(16, 168)}.${rnd(0, 254)}`;
  const askBroadcast = Math.random() < 0.5;
  const ip = (x) => `${head}.${x}`;
  return {
    topic: `서브넷 · ${askBroadcast ? '브로드캐스트' : '네트워크'} 주소`,
    q: `${ip(d)}/${p} 가 속한 서브넷의 ${askBroadcast ? '브로드캐스트' : '네트워크'} 주소는?`,
    ...options(askBroadcast ? bc : net, askBroadcast ? [net, bc - 1, bc + block, 255, net + block] : [bc, net + 1, net + block, 0, d], ip),
    e: `/${p}는 마지막 옥텟을 ${block}개씩 끊는다. ${d}는 ${net}~${bc} 구간에 들어가므로 네트워크 주소는 ${ip(net)}, 브로드캐스트 주소는 ${ip(bc)}다.`,
  };
}

function symmetricKeys() {
  const n = rnd(5, 30);
  const sym = n * (n - 1) / 2;
  const askSym = Math.random() < 0.6;
  return {
    topic: '암호 · 키 개수',
    q: `${n}명이 서로 비밀 통신을 한다. ${askSym ? '대칭키 암호' : '공개키 암호'}를 쓸 때 전체에 필요한 키는 모두 몇 개인가?`,
    ...options(askSym ? sym : 2 * n, askSym ? [2 * n, n * (n - 1), n, sym + n] : [sym, n, n * n, 2 * n - 1]),
    e: `대칭키는 두 사람마다 키 하나가 필요해 n(n−1)/2 = ${n}×${n - 1}/2 = ${sym}개, 공개키는 사람마다 공개키·개인키 한 쌍이면 되므로 2n = ${2 * n}개다.`,
  };
}

function nyquist() {
  const b = pick([3, 4, 5, 6, 8, 10]);
  const m = pick([2, 4, 8, 16, 32]);
  const bits = Math.log2(m);
  return {
    topic: '데이터통신 · 나이퀴스트',
    q: `잡음이 없는 대역폭 ${b}kHz 채널에서 신호 레벨을 ${m}개 쓸 때, 나이퀴스트 공식에 따른 최대 전송률(kbps)은?`,
    ...options(2 * b * bits, [b * bits, 2 * b * m, 2 * b, b * m]),
    e: `나이퀴스트 공식 C = 2B·log₂M 이다. log₂${m} = ${bits}이므로 C = 2 × ${b} × ${bits} = ${2 * b * bits}kbps.`,
  };
}

/* ===================== 운영체제 ===================== */

// 스케줄링 한 판을 돌려 간트 차트 조각과 프로세스별 종료 시각을 구한다
export function runSchedule(procs, algo, quantum) {
  const n = procs.length;
  const left = procs.map(p => p.burst);
  const finish = Array(n).fill(0);
  const segs = [];
  const push = (p, s, e) => {
    const last = segs[segs.length - 1];
    if (last && last.p === p && last.e === s) last.e = e; else segs.push({ p, s, e });
  };
  let t = 0;
  let done = 0;
  if (algo === 'RR') {
    const order = procs.map((_, i) => i).sort((x, y) => procs[x].arrival - procs[y].arrival || x - y);
    const queue = [];
    let next = 0;
    const admit = () => { while (next < n && procs[order[next]].arrival <= t) queue.push(order[next++]); };
    admit();
    while (done < n) {
      if (!queue.length) { t = procs[order[next]].arrival; admit(); continue; }
      const i = queue.shift();
      const run = Math.min(quantum, left[i]);
      push(i, t, t + run);
      t += run;
      left[i] -= run;
      admit(); // 실행 중에 도착한 프로세스가 먼저 줄을 서고, 방금 쓴 프로세스는 그 뒤로 간다
      if (left[i] > 0) queue.push(i); else { finish[i] = t; done++; }
    }
    return { segs, finish };
  }
  while (done < n) {
    const ready = procs.map((_, i) => i).filter(i => left[i] > 0 && procs[i].arrival <= t);
    if (!ready.length) { t = Math.min(...procs.filter((_, i) => left[i] > 0).map(p => p.arrival)); continue; }
    const key = algo === 'FCFS' ? (i) => procs[i].arrival : (i) => left[i];
    const i = ready.sort((x, y) => key(x) - key(y) || procs[x].arrival - procs[y].arrival || x - y)[0];
    const run = algo === 'SRT' ? 1 : left[i];
    push(i, t, t + run);
    t += run;
    left[i] -= run;
    if (left[i] === 0) { finish[i] = t; done++; }
  }
  return { segs, finish };
}

const avgWait = (procs, finish) => procs.reduce((s, p, i) => s + finish[i] - p.arrival - p.burst, 0) / procs.length;

function scheduling() {
  const algo = pick(['FCFS', 'SJF', 'SRT', 'RR']);
  const quantum = pick([2, 3, 4]);
  const procs = [{ arrival: 0, burst: rnd(4, 9) }];
  for (let i = 1; i < 4; i++) procs.push({ arrival: procs[i - 1].arrival + rnd(0, 3), burst: rnd(1, 8) });
  const names = ['P1', 'P2', 'P3', 'P4'];
  const { segs, finish } = runSchedule(procs, algo, quantum);
  const answer = avgWait(procs, finish);
  const others = ['FCFS', 'SJF', 'SRT', 'RR'].filter(a => a !== algo).map(a => avgWait(procs, runSchedule(procs, a, quantum).finish));
  const turnaround = procs.reduce((s, p, i) => s + finish[i] - p.arrival, 0) / 4;
  const label = { FCFS: 'FCFS', SJF: '비선점 SJF', SRT: 'SRT(선점 SJF)', RR: `RR(시간 할당량 ${quantum})` }[algo];
  const waits = procs.map((p, i) => finish[i] - p.arrival - p.burst);
  return {
    topic: `CPU 스케줄링 · ${algo}`,
    ctx: `프로세스 | 도착 시간 | 실행 시간\n${procs.map((p, i) => `${names[i]}       | ${p.arrival}         | ${p.burst}`).join('\n')}`,
    q: `위 프로세스들을 ${label} 방식으로 스케줄링할 때 평균 대기 시간은?${algo === 'RR' ? ' (실행 중에 도착한 프로세스가 방금 실행을 마친 프로세스보다 먼저 줄을 선다)' : ''}`,
    ...options(answer, [...others, turnaround, answer + 1, answer + 0.5], fix),
    e: `실행 순서는 ${segs.map(s => `${names[s.p]}(${s.s}~${s.e})`).join(' → ')} 이다. 대기 시간 = 종료 시각 − 도착 시간 − 실행 시간이므로 ${waits.map((w, i) => `${names[i]}=${w}`).join(', ')}, 평균은 (${waits.join(' + ')}) / 4 = ${fix(answer)}.`,
    sim: { type: 'gantt', names, segs, procs },
  };
}

// 페이지 교체 한 판. 단계마다 프레임 모습과 부재 여부를 남긴다
export function runPaging(refs, frames, algo) {
  let mem = [];
  const loaded = new Map(); // 들어온 순서 (FIFO)
  const used = new Map(); // 마지막으로 쓴 시점 (LRU)
  const steps = [];
  let faults = 0;
  refs.forEach((page, t) => {
    const hit = mem.includes(page);
    let out = null;
    if (!hit) {
      faults++;
      if (mem.length < frames) mem = [...mem, page];
      else {
        const score = (x) => {
          if (algo === 'FIFO') return loaded.get(x);
          if (algo === 'LRU') return used.get(x);
          const next = refs.indexOf(x, t + 1); // OPT: 가장 나중에 다시 쓰이는 것을 내보낸다
          return next === -1 ? -Infinity : -next;
        };
        out = mem.slice().sort((x, y) => score(x) - score(y) || loaded.get(x) - loaded.get(y))[0];
        mem = mem.map(x => (x === out ? page : x));
      }
      loaded.set(page, t);
    }
    used.set(page, t);
    steps.push({ page, frames: mem.slice(), fault: !hit, out });
  });
  return { steps, faults };
}

function pageReplacement() {
  const algo = pick(['FIFO', 'LRU', 'OPT']);
  const frames = pick([3, 3, 4]);
  const pages = frames + 2;
  const refs = Array.from({ length: rnd(10, 12) }, () => rnd(1, pages));
  const { steps, faults } = runPaging(refs, frames, algo);
  const others = ['FIFO', 'LRU', 'OPT'].filter(a => a !== algo).map(a => runPaging(refs, frames, a).faults);
  return {
    topic: `페이지 교체 · ${algo}`,
    q: `페이지 프레임이 ${frames}개이고 처음에는 모두 비어 있다. 참조열 ${refs.join(' ')} 을 ${algo} 방식으로 처리하면 페이지 부재는 몇 번 일어나는가?`,
    ...options(faults, [...others, faults + 1, faults - 1, refs.length - faults]),
    e: `부재가 난 참조는 ${steps.map((s, i) => (s.fault ? `${i + 1}번째(${s.page})` : null)).filter(Boolean).join(', ')} 로 모두 ${faults}번이다. ${algo === 'FIFO' ? 'FIFO는 가장 먼저 들어온 페이지를 내보낸다.' : algo === 'LRU' ? 'LRU는 가장 오랫동안 쓰이지 않은 페이지를 내보낸다.' : 'OPT는 앞으로 가장 오랫동안 쓰이지 않을 페이지를 내보낸다.'}`,
    sim: { type: 'frames', frames, steps },
  };
}

// 디스크 스케줄링 한 판. 헤드가 지나간 위치를 순서대로 돌려준다
export function runDisk(start, queue, algo, max) {
  const path = [start];
  if (algo === 'FCFS') path.push(...queue);
  else if (algo === 'SSTF') {
    const rest = queue.slice();
    let at = start;
    while (rest.length) {
      rest.sort((x, y) => Math.abs(x - at) - Math.abs(y - at));
      at = rest.shift();
      path.push(at);
    }
  } else {
    const up = queue.filter(x => x >= start).sort((x, y) => x - y);
    const down = queue.filter(x => x < start).sort((x, y) => y - x);
    path.push(...up);
    if (algo === 'SCAN' && down.length) path.push(max); // SCAN은 끝까지 갔다가 돌아온다
    path.push(...down);
  }
  const dedup = path.filter((x, i) => i === 0 || x !== path[i - 1]);
  return { path: dedup, total: dedup.slice(1).reduce((s, x, i) => s + Math.abs(x - dedup[i]), 0) };
}

function diskScheduling() {
  const max = 199;
  for (;;) {
    const algo = pick(['FCFS', 'SSTF', 'SCAN', 'LOOK']);
    const start = rnd(30, 150);
    const set = new Set();
    while (set.size < 6) { const x = rnd(5, 190); if (Math.abs(x - start) > 2) set.add(x); }
    const queue = shuffle([...set]);
    // SSTF에서 양쪽 거리가 같은 경우는 답이 갈리므로 그런 숫자는 다시 뽑는다
    const tie = queue.some(x => queue.some(y => x !== y && Math.abs(x - start) === Math.abs(y - start)));
    if (tie) continue;
    const { path, total } = runDisk(start, queue, algo, max);
    const others = ['FCFS', 'SSTF', 'SCAN', 'LOOK'].filter(a => a !== algo).map(a => runDisk(start, queue, a, max).total);
    const note = algo === 'SCAN' ? ` 헤드는 번호가 커지는 방향으로 움직이고 있으며, 트랙 번호는 0~${max}이다.` : algo === 'LOOK' ? ' 헤드는 번호가 커지는 방향으로 움직이고 있다.' : '';
    return {
      topic: `디스크 스케줄링 · ${algo}`,
      q: `디스크 헤드가 ${start}번 트랙에 있고 대기 큐에 ${queue.join(', ')} 순으로 요청이 들어와 있다.${note} ${algo} 방식으로 처리할 때 헤드의 총 이동 거리는?`,
      ...options(total, [...others, total + 10, total - 10]),
      e: `헤드는 ${path.join(' → ')} 순으로 움직인다. 이동 거리를 더하면 ${path.slice(1).map((x, i) => Math.abs(x - path[i])).join(' + ')} = ${total}.`,
      sim: { type: 'disk', path, max },
    };
  }
}

function pagingAddress() {
  const kb = pick([1, 2, 4]);
  const size = kb * 1024;
  const page = rnd(1, 6);
  const offset = rnd(10, size - 10);
  const logical = page * size + offset;
  const frame = rnd(2, 12);
  const physical = frame * size + offset;
  return {
    topic: '페이징 · 주소 변환',
    q: `페이지 크기가 ${kb}KB인 시스템에서 논리 주소 ${logical}을 변환한다. 이 주소가 속한 페이지가 ${frame}번 프레임에 올라와 있다면 물리 주소는?`,
    ...options(physical, [logical, frame * size, (frame + 1) * size + offset, frame * size + page, page * size + frame]),
    e: `페이지 크기는 ${size}바이트다. ${logical} ÷ ${size} = 몫 ${page}(페이지 번호), 나머지 ${offset}(변위). 물리 주소 = 프레임 번호 × 페이지 크기 + 변위 = ${frame} × ${size} + ${offset} = ${physical}.`,
  };
}

/* ===================== 컴퓨터 구조 ===================== */

function raidCapacity() {
  const level = pick(['0', '1', '5', '6', '10']);
  const size = pick([1, 2, 4]);
  const n = level === '1' ? 2 : level === '10' ? pick([4, 6, 8]) : level === '6' ? rnd(4, 8) : rnd(3, 8);
  const usable = { 0: n, 1: 1, 5: n - 1, 6: n - 2, 10: n / 2 }[level] * size;
  const why = {
    0: '스트라이핑만 하므로 모든 디스크를 그대로 쓴다',
    1: '같은 내용을 두 디스크에 똑같이 쓰므로 한 개 분량만 쓸 수 있다',
    5: '패리티가 디스크 한 개 분량을 차지한다',
    6: '서로 다른 패리티 두 개가 디스크 두 개 분량을 차지한다',
    10: '둘씩 미러링한 뒤 스트라이핑하므로 절반만 쓸 수 있다',
  }[level];
  return {
    topic: `RAID ${level} · 용량`,
    q: `${size}TB 디스크 ${n}개로 RAID ${level}을 구성했을 때 실제로 쓸 수 있는 저장 용량은?`,
    ...options(usable, [n * size, (n - 1) * size, (n - 2) * size, n * size / 2, size], (x) => `${x}TB`),
    e: `RAID ${level}은 ${why}. 따라서 ${usable}TB를 쓸 수 있다.`,
  };
}

function cacheTime() {
  const h = pick([80, 85, 90, 95]);
  const tc = pick([5, 10, 20]);
  const tm = pick([100, 150, 200]);
  const t = (h * tc + (100 - h) * tm) / 100;
  return {
    topic: '캐시 · 평균 접근 시간',
    q: `캐시 적중률이 ${h}%, 캐시 접근 시간이 ${tc}ns, 주기억장치 접근 시간이 ${tm}ns이다. 평균 접근 시간을 h·Tc + (1−h)·Tm 으로 계산하면?`,
    ...options(t, [(h * tm + (100 - h) * tc) / 100, tc + (100 - h) * tm / 100, (tc + tm) / 2, t + tc], (x) => `${fix(x)}ns`),
    e: `${h / 100} × ${tc} + ${fix((100 - h) / 100)} × ${tm} = ${fix(h * tc / 100)} + ${fix((100 - h) * tm / 100)} = ${fix(t)}ns. 캐시 접근 시간을 적중 실패 때도 더하는 식(Tc + (1−h)·Tm)과는 결과가 다르니 문제에 주어진 식을 따른다.`,
  };
}

function baseConversion() {
  const n = rnd(20, 255);
  const kind = pick(['bin', 'hex', 'oct', 'fromBin', 'fromHex']);
  const bin = n.toString(2);
  const hex = n.toString(16).toUpperCase();
  const oct = n.toString(8);
  if (kind === 'fromBin' || kind === 'fromHex') {
    const src = kind === 'fromBin' ? `2진수 ${bin}` : `16진수 ${hex}`;
    return {
      topic: '진법 변환',
      q: `${src}을 10진수로 나타내면?`,
      ...options(n, [n + 1, n - 1, n + 16, n - 16, n + 2]),
      e: kind === 'fromBin'
        ? `자리값을 더한다. ${bin.split('').map((b, i) => (b === '1' ? 2 ** (bin.length - 1 - i) : null)).filter(x => x !== null).join(' + ')} = ${n}.`
        : `${hex.split('').map((c, i) => `${parseInt(c, 16)}×${16 ** (hex.length - 1 - i)}`).join(' + ')} = ${n}.`,
    };
  }
  const to = { bin: ['2진수', bin, 2], hex: ['16진수', hex, 16], oct: ['8진수', oct, 8] }[kind];
  const alt = (x) => x.toString(to[2]).toUpperCase();
  return {
    topic: '진법 변환',
    q: `10진수 ${n}을 ${to[0]}로 나타내면?`,
    ...options(to[1], [alt(n + 1), alt(n - 1), alt(n + to[2]), alt(n - to[2]), alt(n + 2)]),
    e: `${n}을 ${to[2]}로 계속 나누어 나머지를 거꾸로 읽으면 ${to[1]}이다. (2진수 ${bin} · 8진수 ${oct} · 16진수 ${hex})`,
  };
}

function twosComplement() {
  const n = rnd(3, 120);
  const bits = (x) => (x & 0xff).toString(2).padStart(8, '0');
  return {
    topic: '2의 보수',
    q: `−${n}을 8비트 2의 보수로 나타내면?`,
    ...options(bits(-n), [bits(~n), bits(n), bits(-n + 1), bits(n | 0x80), bits(-n - 1)]),
    e: `+${n} = ${bits(n)}. 모든 비트를 뒤집으면(1의 보수) ${bits(~n)}, 여기에 1을 더하면 ${bits(-n)}이다.`,
  };
}

function amdahl() {
  const p = pick([50, 60, 75, 80, 90]);
  const s = pick([2, 4, 5, 10]);
  const speedup = 1 / ((100 - p) / 100 + p / 100 / s);
  return {
    topic: '암달의 법칙',
    q: `프로그램의 ${p}%를 ${s}배 빠르게 개선했다. 암달의 법칙에 따른 전체 성능 향상은 약 몇 배인가?`,
    ...options(speedup, [s * p / 100, 1 / ((100 - p) / 100), s, speedup + 0.5, 1 + p / 100], (x) => `${fix(x)}배`),
    e: `전체 향상 = 1 / ((1 − P) + P / S) = 1 / (${fix((100 - p) / 100)} + ${fix(p / 100)} / ${s}) = 1 / ${fix((100 - p) / 100 + p / 100 / s)} ≈ ${fix(speedup)}배. 개선하지 않은 ${100 - p}% 때문에 아무리 빨라져도 ${fix(100 / (100 - p))}배를 넘지 못한다.`,
  };
}

function pipeline() {
  const k = rnd(3, 6);
  const n = pick([10, 20, 50, 100]);
  const t = pick([1, 2, 5, 10]);
  const time = (k + n - 1) * t;
  return {
    topic: '파이프라인 · 실행 시간',
    q: `${k}단계 파이프라인에서 각 단계가 ${t}ns 걸린다. 명령어 ${n}개를 모두 실행하는 데 걸리는 시간은? (해저드는 없다고 본다)`,
    ...options(time, [n * k * t, (k + n) * t, n * t, (k + n - 2) * t], (x) => `${x}ns`),
    e: `첫 명령어가 끝나는 데 ${k}단계, 그 뒤로는 한 단계마다 하나씩 끝나므로 (k + n − 1) × t = (${k} + ${n} − 1) × ${t} = ${time}ns. 파이프라인이 없으면 ${n} × ${k} × ${t} = ${n * k * t}ns가 걸린다.`,
  };
}

function hammingBits() {
  const m = pick([4, 7, 8, 11, 16, 26, 32]);
  let r = 1;
  while (2 ** r < m + r + 1) r++;
  return {
    topic: '해밍 코드 · 패리티 비트 수',
    q: `데이터 ${m}비트에 해밍 코드로 1비트 오류 정정을 하려면 패리티 비트가 최소 몇 개 필요한가?`,
    ...options(r, [r - 1, r + 1, r + 2, Math.ceil(Math.log2(m))]),
    e: `2^r ≥ m + r + 1 을 만족하는 가장 작은 r을 찾는다. r = ${r - 1}이면 2^${r - 1} = ${2 ** (r - 1)} < ${m + r}, r = ${r}이면 2^${r} = ${2 ** r} ≥ ${m + r + 1}이므로 ${r}개다.`,
  };
}

/* ===================== 자료구조·기타 ===================== */

function postfix() {
  for (;;) {
    const count = rnd(3, 4);
    const tokens = [];
    const stack = [];
    let operands = 0;
    // 피연산자가 둘 이상 쌓였을 때만 연산자를 놓아 올바른 후위식을 만든다
    while (operands < count || stack.length > 1) {
      if (stack.length >= 2 && (operands === count || Math.random() < 0.45)) {
        const op = pick(['+', '-', '*']);
        const b = stack.pop();
        const a = stack.pop();
        stack.push(op === '+' ? a + b : op === '-' ? a - b : a * b);
        tokens.push(op);
      } else {
        const v = rnd(1, 9);
        stack.push(v);
        tokens.push(String(v));
        operands++;
      }
    }
    const value = stack[0];
    if (value < 0 || value > 200) continue;
    return {
      topic: '스택 · 후위식 계산',
      q: `후위 표기식 ${tokens.join(' ')} 을 스택으로 계산한 결과는?`,
      ...options(value, [value + 1, value - 1, value + rnd(2, 6), Math.abs(value - rnd(2, 6)), value * 2]),
      e: '피연산자는 스택에 넣고, 연산자를 만나면 위의 두 값을 꺼내 "먼저 넣은 값 (연산자) 나중에 넣은 값"으로 계산해 다시 넣는다. 끝까지 처리하면 ' + value + '이 남는다.',
    };
  }
}

function binarySearch() {
  const n = pick([15, 31, 63, 100, 127, 255, 500, 1000, 1023]);
  const max = Math.floor(Math.log2(n)) + 1;
  return {
    topic: '이진 탐색 · 비교 횟수',
    q: `정렬된 원소 ${n}개에서 이진 탐색을 할 때 최악의 경우 비교 횟수는?`,
    ...options(max, [max - 1, max + 1, Math.ceil(n / 2), max + 2]),
    e: `한 번 비교할 때마다 범위가 절반으로 줄어든다. ⌊log₂${n}⌋ + 1 = ${max - 1} + 1 = ${max}번이면 원소가 하나 남는다.`,
  };
}

function hashProbe() {
  const size = pick([7, 11, 13]);
  const keys = [];
  const table = Array(size).fill(null);
  let lastPos = 0;
  while (keys.length < 5) {
    const k = rnd(10, 99);
    if (keys.includes(k)) continue;
    let pos = k % size;
    while (table[pos] !== null) pos = (pos + 1) % size;
    table[pos] = k;
    keys.push(k);
    lastPos = pos;
  }
  const last = keys[keys.length - 1];
  return {
    topic: '해시 · 선형 조사',
    q: `크기 ${size}인 해시 테이블에 h(k) = k mod ${size}, 충돌은 선형 조사로 해결한다. 키 ${keys.join(', ')} 를 차례로 넣을 때 마지막 키 ${last}가 저장되는 위치는?`,
    ...options(lastPos, [last % size, (lastPos + 1) % size, (lastPos + size - 1) % size, (last % size + 2) % size, (lastPos + 2) % size], (x) => `${x}번`),
    e: `${keys.map(k => `${k} mod ${size} = ${k % size}`).join(', ')}. 자리가 차 있으면 바로 다음 칸으로 한 칸씩 옮긴다. 최종 테이블은 [${table.map(x => (x === null ? '·' : x)).join(', ')}] 이고 ${last}는 ${lastPos}번에 들어간다.`,
  };
}

function availability() {
  const a = pick([0.8, 0.9, 0.95, 0.99]);
  const b = pick([0.8, 0.9, 0.95, 0.99]);
  const serial = Math.random() < 0.5;
  const value = serial ? a * b : 1 - (1 - a) * (1 - b);
  const pct = (x) => `${Number((x * 100).toFixed(2))}%`;
  return {
    topic: `가용성 · ${serial ? '직렬' : '병렬'} 구성`,
    q: `가용성이 ${pct(a)}인 장비와 ${pct(b)}인 장비를 ${serial ? '직렬' : '병렬(이중화)'}로 구성했다. 전체 가용성은?`,
    ...options(value, [serial ? 1 - (1 - a) * (1 - b) : a * b, (a + b) / 2, Math.min(a, b), Math.max(a, b), a * b * 0.9], pct),
    e: serial
      ? `직렬은 둘 다 살아 있어야 하므로 곱한다. ${a} × ${b} = ${Number((a * b).toFixed(4))} → ${pct(value)}.`
      : `병렬은 둘 다 죽을 때만 멈춘다. 1 − (1 − ${a})(1 − ${b}) = 1 − ${Number(((1 - a) * (1 - b)).toFixed(4))} → ${pct(value)}.`,
  };
}

/* ===================== 목록 ===================== */

export const CALC_GROUPS = [
  { key: 'os', name: '운영체제', sub: 'CPU 스케줄링 · 페이지 교체 · 디스크 스케줄링 · 주소 변환', gens: [scheduling, pageReplacement, diskScheduling, pagingAddress] },
  { key: 'net', name: '네트워크·보안', sub: '서브넷 · 키 개수 · 나이퀴스트 · 가용성', gens: [subnetHosts, subnetAddress, symmetricKeys, nyquist, availability] },
  { key: 'ca', name: '컴퓨터 구조', sub: 'RAID · 캐시 · 진법 · 2의 보수 · 암달 · 파이프라인 · 해밍', gens: [raidCapacity, cacheTime, baseConversion, twosComplement, amdahl, pipeline, hammingBits] },
  { key: 'ds', name: '자료구조', sub: '후위식 계산 · 이진 탐색 · 해시 선형 조사', gens: [postfix, binarySearch, hashProbe] },
];

export const ALL_GENERATORS = CALC_GROUPS.flatMap(g => g.gens);

// 고른 묶음(없으면 전체)에서 문제 하나를 새로 만든다
export function generate(groupKey) {
  const gens = CALC_GROUPS.find(g => g.key === groupKey)?.gens || ALL_GENERATORS;
  return pick(gens)();
}
