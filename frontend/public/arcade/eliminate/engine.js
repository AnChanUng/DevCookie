// 소거법 디펜스의 게임 루프. 화면에 보여 줄 상태가 바뀔 때만 onChange로 스냅샷을 넘긴다.
// 카드 위치는 매 프레임 바뀌므로 다시 그리지 않고 DOM의 transform을 직접 고친다
export const FIELD_H = 440;
export const CARD_H = 64;
const GAP = 88;                  // 카드 사이 간격. 첫 카드가 바닥에 닿기 전에 모든 선지가 화면에 들어온다
const FLOOR = FIELD_H - CARD_H;  // 카드 윗변이 여기 닿으면 답안지에 찍힌 것으로 본다
const LIVES = 3;
const STORE = 'arcade-eliminate';

export function readStore() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE) || '{}') || {};
    return { best: raw.best || 0, plays: raw.plays || 0, missed: raw.missed || {} };
  } catch {
    return { best: 0, plays: 0, missed: {} };
  }
}

function writeStore(data) {
  try { localStorage.setItem(STORE, JSON.stringify(data)); } catch { /* storage unavailable */ }
}

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// 게임에서 틀린 문제 > 문제은행에서 마지막에 틀린 문제 > 안 풀어 본 문제 > 맞힌 문제 순으로 자주 나온다
const weightOf = (item, missed) => (missed[item.uid] ? 5 : item.last === 'w' ? 4 : !item.last ? 2 : 1);

export function createEngine({ onChange, sound }) {
  let raf = 0;
  let prev = 0;
  let els = [];
  let ys = [];
  let pool = [];
  let used = new Set();
  let popId = 0;
  let s = null;

  const emit = () => onChange({ ...s, status: [...s.status], pops: [...s.pops], missed: [...s.missed] });

  const levelOf = (waveNo) => Math.floor((waveNo - 1) / 3) + 1;
  const speedOf = (level) => Math.min(84, 24 + level * 6);
  const multOf = () => 1 + Math.min(s.combo, 10) * 0.1;

  function pick() {
    let cands = pool.filter(it => !used.has(it.uid));
    if (!cands.length) { used = new Set(); cands = pool; }
    const store = readStore();
    const weights = cands.map(it => weightOf(it, store.missed));
    let r = Math.random() * weights.reduce((a, b) => a + b, 0);
    for (let i = 0; i < cands.length; i++) {
      r -= weights[i];
      if (r <= 0) return cands[i];
    }
    return cands[cands.length - 1];
  }

  function pop(text, y, kind) {
    const id = ++popId;
    s.pops.push({ id, text, y: Math.max(0, Math.min(FLOOR, y)), kind });
    setTimeout(() => {
      if (!s) return;
      s.pops = s.pops.filter(p => p.id !== id);
      emit();
    }, 700);
  }

  function nextWave() {
    const item = pick();
    used.add(item.uid);
    const n = item.o.length;
    const order = shuffle([...Array(n).keys()]);
    ys = Array(n).fill(0);
    order.forEach((optIdx, k) => { ys[optIdx] = -CARD_H - k * GAP; });
    els = [];
    s.waveNo += 1;
    s.level = levelOf(s.waveNo);
    s.item = item;
    s.order = order;
    s.startYs = [...ys];
    s.status = Array(n).fill('alive');
    s.flawed = false;
    s.reveal = null;
    s.pops = [];
    s.phase = 'playing';
    emit();
    run();
  }

  // 한 문제가 끝났다. 흠 없이 막았으면 콤보가 쌓이고, 아니면 복습 목록과 저장소에 남긴다
  function endWave(reason) {
    cancelAnimationFrame(raf);
    const ok = !s.flawed;
    const store = readStore();
    if (ok) {
      s.combo += 1;
      s.maxCombo = Math.max(s.maxCombo, s.combo);
      s.cleared += 1;
      s.score += Math.round(50 * multOf());
      if (store.missed[s.item.uid]) {
        delete store.missed[s.item.uid];
        writeStore(store);
      }
      sound('clear');
    } else {
      if (!s.missed.some(m => m.uid === s.item.uid)) s.missed.push(s.item);
      store.missed[s.item.uid] = (store.missed[s.item.uid] || 0) + 1;
      writeStore(store);
    }
    s.reveal = { ok, reason };
    s.phase = 'reveal';
    emit();
  }

  function loseLife() {
    s.lives -= 1;
    s.combo = 0;
    s.slips += 1;
    s.flawed = true;
    s.shake += 1;
    sound('hurt');
  }

  const wrongAlive = () => s.status.some((st, i) => st === 'alive' && i !== s.item.a);

  function land(i) {
    if (i === s.item.a) {
      s.status[i] = 'safe';
      s.score += 30;
      pop('정답 마킹 +30', FLOOR, 'good');
      sound('safe');
      if (!wrongAlive()) return endWave('clear');
    } else {
      s.status[i] = 'leak';
      loseLife();
      pop('오답이 찍혔다!', FLOOR, 'bad');
      if (s.lives <= 0) return endWave('leak');
      if (!wrongAlive()) {
        if (s.status[s.item.a] === 'alive') s.status[s.item.a] = 'safe';
        return endWave('leak');
      }
    }
    emit();
  }

  function shoot(i) {
    if (!s || s.phase !== 'playing' || s.status[i] !== 'alive') return;
    const y = ys[i];
    if (y < -CARD_H + 8) return; // 아직 화면에 안 들어온 카드는 못 쏜다
    s.status[i] = 'boom';
    s.shots += 1;
    if (i === s.item.a) {
      loseLife();
      pop('정답을 쐈다!', y, 'bad');
      return endWave('shot');
    }
    // 일찍 지울수록 점수가 크다. 확신이 있을 때 빨리 쏘는 쪽이 이득이다
    const points = Math.round((10 + 40 * (1 - Math.max(0, y) / FLOOR)) * multOf());
    s.score += points;
    s.hits += 1;
    pop(`+${points}`, y, 'good');
    sound('shot');
    if (!wrongAlive()) {
      if (s.status[s.item.a] === 'alive') s.status[s.item.a] = 'safe';
      return endWave('clear');
    }
    emit();
  }

  function frame(now) {
    const dt = Math.min(0.05, (now - prev) / 1000);
    prev = now;
    const speed = speedOf(s.level);
    const field = document.getElementById('arcade-field');
    for (let i = 0; i < s.status.length && s.phase === 'playing'; i++) {
      if (s.status[i] !== 'alive') continue;
      ys[i] += speed * dt;
      if (!els[i] || !els[i].isConnected) els[i] = field?.querySelector(`[data-opt="${i}"]`);
      if (els[i]) els[i].style.transform = `translateY(${Math.min(ys[i], FLOOR)}px)`;
      if (ys[i] >= FLOOR) land(i);
    }
    if (s.phase === 'playing') raf = requestAnimationFrame(frame);
  }

  function run() {
    cancelAnimationFrame(raf);
    prev = performance.now();
    raf = requestAnimationFrame(frame);
  }

  return {
    start(items) {
      pool = items;
      used = new Set();
      s = {
        phase: 'playing', item: null, order: [], startYs: [], status: [], pops: [], missed: [],
        score: 0, lives: LIVES, combo: 0, maxCombo: 0, waveNo: 0, level: 1,
        shots: 0, hits: 0, slips: 0, cleared: 0, shake: 0, flawed: false, reveal: null,
        best: readStore().best, newBest: false,
      };
      nextWave();
    },
    shoot,
    next() {
      if (!s || s.phase !== 'reveal') return;
      if (s.lives > 0) return nextWave();
      const store = readStore();
      s.newBest = s.score > store.best;
      store.best = Math.max(store.best, s.score);
      store.plays += 1;
      writeStore(store);
      s.best = store.best;
      s.phase = 'over';
      sound('over');
      emit();
    },
    stop() {
      cancelAnimationFrame(raf);
      s = null;
    },
  };
}
