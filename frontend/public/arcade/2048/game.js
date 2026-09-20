import { store, onSwipe, onDirKey } from '../common.js';

const N = 4;
const VEC = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] };
const $ = (id) => document.getElementById(id);
const tilesEl = $('tiles');

let tiles = [];      // {id, r, c, v}
let score = 0;
let best = store.get('2048:best', 0);
let won = false;     // 2048을 이미 만들었으면 축하는 한 번만 한다
let over = false;
let nextId = 1;
let undoState = null;
const nodes = new Map();

$('cells').innerHTML = '<i></i>'.repeat(N * N);

const at = (r, c) => tiles.find(t => t.r === r && t.c === c && !t.dying);
const inside = (r, c) => r >= 0 && r < N && c >= 0 && c < N;

function spawn() {
  const empty = [];
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (!at(r, c)) empty.push([r, c]);
  if (!empty.length) return;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  tiles.push({ id: nextId++, r, c, v: Math.random() < 0.9 ? 2 : 4, fresh: true });
}

function canMove() {
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    const t = at(r, c);
    if (!t) return true;
    for (const [dr, dc] of [[0, 1], [1, 0]]) {
      const n = inside(r + dr, c + dc) && at(r + dr, c + dc);
      if (n && n.v === t.v) return true;
    }
  }
  return false;
}

function move(dir) {
  if (over || !$('overlay').hidden) return;
  const [dr, dc] = VEC[dir];
  tiles = tiles.filter(t => !t.dying);
  const snapshot = { tiles: tiles.map(t => ({ r: t.r, c: t.c, v: t.v })), score };
  tiles.forEach(t => { t.fresh = false; t.merged = false; });

  // 미는 방향의 앞쪽 타일부터 움직여야 뒤 타일이 제자리를 찾는다
  const order = [...tiles].sort((a, b) => (dr ? (b.r - a.r) * dr : (b.c - a.c) * dc));
  let moved = false;
  for (const t of order) {
    let { r, c } = t;
    while (inside(r + dr, c + dc) && !at(r + dr, c + dc)) { r += dr; c += dc; }
    const hit = inside(r + dr, c + dc) && at(r + dr, c + dc);
    if (hit && hit.v === t.v && !hit.merged) {
      // 부딪힌 타일 자리까지 미끄러져 들어간 뒤 사라진다
      t.r = hit.r; t.c = hit.c; t.dying = true;
      hit.v *= 2; hit.merged = true;
      score += hit.v;
      moved = true;
    } else if (r !== t.r || c !== t.c) {
      t.r = r; t.c = c;
      moved = true;
    }
  }
  if (!moved) return;

  undoState = snapshot;
  spawn();
  if (score > best) { best = score; store.set('2048:best', best); }
  render();

  if (!won && tiles.some(t => t.v >= 2048 && !t.dying)) {
    won = true;
    show('2048 달성!', '여기서 멈춰도 되고, 더 큰 숫자에 도전해도 됩니다.', true);
  } else if (!canMove()) {
    over = true;
    show('더 밀 곳이 없습니다', `${score.toLocaleString('ko-KR')}점으로 끝났습니다.`, false);
  }
}

function show(title, text, canKeep) {
  $('overlay-title').textContent = title;
  $('overlay-text').textContent = text;
  $('keep').hidden = !canKeep;
  $('overlay').hidden = false;
}

function render() {
  $('score').textContent = score.toLocaleString('ko-KR');
  $('best').textContent = best.toLocaleString('ko-KR');
  $('undo').disabled = !undoState;
  const alive = new Set();
  for (const t of tiles) {
    alive.add(t.id);
    let el = nodes.get(t.id);
    if (!el) {
      el = document.createElement('div');
      el.innerHTML = '<div></div>';
      nodes.set(t.id, el);
      tilesEl.appendChild(el);
    }
    el.className = `tile${t.fresh ? ' fresh' : ''}${t.merged ? ' merged' : ''}${t.v > 2048 ? ' big' : ''}`;
    el.dataset.v = t.v;
    el.firstChild.textContent = t.v;
    el.style.left = `${t.c * 25}%`;
    el.style.top = `${t.r * 25}%`;
    if (t.dying) setTimeout(() => { el.remove(); nodes.delete(t.id); }, 130);
  }
  for (const [id, el] of nodes) if (!alive.has(id)) { el.remove(); nodes.delete(id); }
}

function reset() {
  tiles = [];
  score = 0;
  won = false;
  over = false;
  undoState = null;
  $('overlay').hidden = true;
  spawn();
  spawn();
  render();
}

function undo() {
  if (!undoState) return;
  tiles = undoState.tiles.map(t => ({ ...t, id: nextId++ }));
  score = undoState.score;
  undoState = null;
  over = false;
  $('overlay').hidden = true;
  render();
}

onDirKey(move);
onSwipe($('board'), move);
$('restart').addEventListener('click', reset);
$('again').addEventListener('click', reset);
$('undo').addEventListener('click', undo);
$('keep').addEventListener('click', () => { $('overlay').hidden = true; });

reset();
