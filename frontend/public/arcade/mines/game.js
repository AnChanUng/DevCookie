import { store } from '../common.js';

const LEVELS = {
  easy: { rows: 9, cols: 9, mines: 10 },
  normal: { rows: 16, cols: 16, mines: 40 },
  hard: { rows: 22, cols: 16, mines: 70 },
};
const $ = (id) => document.getElementById(id);
const grid = $('grid');

let levelKey = store.get('mines:level', 'easy');
let level, cells, state, flags, opened, seconds, timer, flagMode = false;
let bests = store.get('mines:best', {});

const fmt = (sec) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
const idx = (r, c) => r * level.cols + c;

function neighbors(i) {
  const r = Math.floor(i / level.cols), c = i % level.cols;
  const out = [];
  for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
    const nr = r + dr, nc = c + dc;
    if ((dr || dc) && nr >= 0 && nr < level.rows && nc >= 0 && nc < level.cols) out.push(idx(nr, nc));
  }
  return out;
}

function reset() {
  level = LEVELS[levelKey];
  cells = Array.from({ length: level.rows * level.cols }, () => ({ mine: false, open: false, flag: false, n: 0 }));
  state = 'ready';
  flags = 0;
  opened = 0;
  seconds = 0;
  clearInterval(timer);
  grid.style.gridTemplateColumns = `repeat(${level.cols}, 1fr)`;
  grid.innerHTML = cells.map((_, i) => `<button class="cell" data-i="${i}" aria-label="닫힌 칸"></button>`).join('');
  document.querySelectorAll('[data-level]').forEach(b => b.classList.toggle('on', b.dataset.level === levelKey));
  setStatus('아무 칸이나 눌러 시작하세요.', '');
  hud();
}

// 지뢰는 첫 칸을 연 뒤에 깐다. 첫 칸과 그 둘레에는 놓지 않아서 시작하자마자 터지는 일이 없다
function plant(safe) {
  const banned = new Set([safe, ...neighbors(safe)]);
  let left = level.mines;
  while (left > 0) {
    const i = Math.floor(Math.random() * cells.length);
    if (cells[i].mine || banned.has(i)) continue;
    cells[i].mine = true;
    left--;
  }
  cells.forEach((cell, i) => { cell.n = neighbors(i).filter(j => cells[j].mine).length; });
}

function paint(i) {
  const cell = cells[i];
  const el = grid.children[i];
  el.className = `cell${cell.open ? ' open' : ''}`;
  el.removeAttribute('data-n');
  if (cell.open) {
    el.textContent = cell.mine ? '💣' : cell.n || '';
    if (cell.n && !cell.mine) el.dataset.n = cell.n;
  } else {
    el.textContent = cell.flag ? '🚩' : '';
  }
}

function open(start) {
  // 숫자 0인 칸은 둘레를 이어서 연다. 재귀 대신 스택을 써서 큰 판에서도 안전하다
  const stack = [start];
  while (stack.length) {
    const i = stack.pop();
    const cell = cells[i];
    if (cell.open || cell.flag) continue;
    cell.open = true;
    opened++;
    paint(i);
    if (cell.mine) return lose(i);
    if (cell.n === 0) stack.push(...neighbors(i));
  }
  if (opened === cells.length - level.mines) win();
}

function reveal(i) {
  if (state === 'won' || state === 'lost') return;
  const cell = cells[i];
  if (state === 'ready') {
    if (cell.flag) return;
    plant(i);
    state = 'playing';
    setStatus('', '');
    timer = setInterval(() => { seconds++; hud(); }, 1000);
  }
  if (cell.open) {
    // 둘레 깃발 수가 숫자와 같으면 나머지를 한꺼번에 연다
    const around = neighbors(i);
    if (cell.n && around.filter(j => cells[j].flag).length === cell.n) {
      for (const j of around) if (state === 'playing') open(j);
    }
    return;
  }
  if (!cell.flag) open(i);
}

function toggleFlag(i) {
  if (state === 'won' || state === 'lost') return;
  const cell = cells[i];
  if (cell.open) return;
  cell.flag = !cell.flag;
  flags += cell.flag ? 1 : -1;
  paint(i);
  hud();
}

function lose(hit) {
  state = 'lost';
  clearInterval(timer);
  cells.forEach((cell, i) => {
    if (cell.mine && !cell.flag) { cell.open = true; paint(i); }
    else if (!cell.mine && cell.flag) { grid.children[i].classList.add('wrong'); grid.children[i].textContent = '✕'; }
  });
  grid.children[hit].classList.add('boom');
  setStatus('펑! 지뢰를 밟았습니다.', 'lose');
}

function win() {
  state = 'won';
  clearInterval(timer);
  cells.forEach((cell, i) => { if (cell.mine && !cell.flag) { cell.flag = true; paint(i); } });
  flags = level.mines;
  const took = Math.max(1, seconds);
  const record = !bests[levelKey] || took < bests[levelKey];
  if (record) { bests = { ...bests, [levelKey]: took }; store.set('mines:best', bests); }
  setStatus(`모두 찾았습니다! ${fmt(seconds)}${record ? ' · 신기록' : ''}`, 'win');
  hud();
}

function setStatus(text, tone) {
  $('status').textContent = text;
  $('status').className = `mines-status ${tone}`;
}

function hud() {
  $('left').textContent = level.mines - flags;
  $('time').textContent = fmt(seconds);
  $('best').textContent = bests[levelKey] ? fmt(bests[levelKey]) : '–';
}

/* ===== 입력 ===== */
const cellIndex = (e) => {
  const el = e.target.closest('.cell');
  return el ? Number(el.dataset.i) : -1;
};

// 터치에서는 길게 누르면 깃발. 길게 누른 뒤 따라오는 click은 한 번 무시한다
let pressTimer = 0, longPressed = false, pressX = 0, pressY = 0;
grid.addEventListener('pointerdown', (e) => {
  const i = cellIndex(e);
  if (i < 0 || e.pointerType === 'mouse') return;
  longPressed = false;
  pressX = e.clientX;
  pressY = e.clientY;
  pressTimer = setTimeout(() => {
    longPressed = true;
    toggleFlag(i);
    navigator.vibrate?.(20);
  }, 380);
});
for (const type of ['pointerup', 'pointerleave', 'pointercancel', 'pointermove']) {
  grid.addEventListener(type, (e) => {
    // 손가락이 살짝 떨리는 정도로는 길게 누르기를 취소하지 않는다
    if (type === 'pointermove' && Math.hypot(e.clientX - pressX, e.clientY - pressY) < 10) return;
    clearTimeout(pressTimer);
  });
}

grid.addEventListener('click', (e) => {
  const i = cellIndex(e);
  if (i < 0) return;
  if (longPressed) { longPressed = false; return; }
  if (flagMode && !cells[i].open) toggleFlag(i); else reveal(i);
});
grid.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  const i = cellIndex(e);
  if (i >= 0 && !longPressed) toggleFlag(i);
});

$('flag-mode').addEventListener('click', () => {
  flagMode = !flagMode;
  $('flag-mode').classList.toggle('on', flagMode);
});
$('restart').addEventListener('click', reset);
document.querySelectorAll('[data-level]').forEach(b => b.addEventListener('click', () => {
  levelKey = b.dataset.level;
  store.set('mines:level', levelKey);
  reset();
}));

if (!LEVELS[levelKey]) levelKey = 'easy';
reset();
