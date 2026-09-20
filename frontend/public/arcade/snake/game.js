import { store, onSwipe, onDirKey, setupCanvas } from '../common.js';
import { createRanking } from '../rank.js';

const N = 20;          // 한 변의 칸 수
const CELL = 24;
const SIZE = N * CELL;
const VEC = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
const OPPOSITE = { up: 'down', down: 'up', left: 'right', right: 'left' };
const $ = (id) => document.getElementById(id);
const ctx = setupCanvas($('canvas'), SIZE, SIZE);

let snake, dir, queue, food, bonus, score, timer, state = 'ready';
let best = store.get('snake:best', 0);
const ranking = createRanking('snake');

const level = () => Math.min(12, 1 + Math.floor((snake.length - 3) / 4));
const delay = () => 150 - (level() - 1) * 8;
const same = (a, b) => a.x === b.x && a.y === b.y;

function freeCell() {
  for (;;) {
    const p = { x: Math.floor(Math.random() * N), y: Math.floor(Math.random() * N) };
    if (!snake.some(s => same(s, p)) && !(food && same(food, p))) return p;
  }
}

function reset() {
  snake = [{ x: 9, y: 10 }, { x: 8, y: 10 }, { x: 7, y: 10 }];
  dir = 'right';
  queue = [];
  score = 0;
  food = null;
  food = freeCell();
  bonus = null;
}

// 한 틱 안에 방향키를 두 번 눌러도 둘 다 살리되, 제자리 유턴은 막는다
function turn(next) {
  if (state !== 'playing') return;
  const last = queue.length ? queue[queue.length - 1] : dir;
  if (next === last || next === OPPOSITE[last] || queue.length >= 2) return;
  queue.push(next);
}

function tick() {
  if (queue.length) dir = queue.shift();
  const [dx, dy] = VEC[dir];
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };
  const hitWall = head.x < 0 || head.y < 0 || head.x >= N || head.y >= N;
  // 꼬리는 이번 틱에 빠지므로 꼬리 자리로 들어가는 건 괜찮다
  if (hitWall || snake.slice(0, -1).some(s => same(s, head))) return end();

  snake.unshift(head);
  if (same(head, food)) {
    score += 10;
    food = freeCell();
    if (!bonus && Math.random() < 0.25) bonus = { ...freeCell(), ttl: 40 };
  } else if (bonus && same(head, bonus)) {
    score += 50;
    bonus = null;
    snake.pop();
  } else {
    snake.pop();
  }
  if (bonus && --bonus.ttl <= 0) bonus = null;

  hud();
  draw();
  timer = setTimeout(tick, delay());
}

function hud() {
  $('score').textContent = score;
  $('best').textContent = Math.max(best, score);
  $('speed').textContent = level();
}

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

function draw() {
  ctx.fillStyle = '#0B1026';
  ctx.fillRect(0, 0, SIZE, SIZE);
  ctx.fillStyle = 'rgba(255,255,255,0.025)';
  for (let y = 0; y < N; y++) for (let x = y % 2; x < N; x += 2) ctx.fillRect(x * CELL, y * CELL, CELL, CELL);

  ctx.fillStyle = '#F43F5E';
  ctx.beginPath();
  ctx.arc(food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, CELL * 0.36, 0, Math.PI * 2);
  ctx.fill();

  if (bonus) {
    // 사라지기 직전에는 깜빡인다
    if (bonus.ttl > 12 || bonus.ttl % 2) {
      ctx.fillStyle = '#FBBF24';
      ctx.shadowColor = '#FBBF24';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(bonus.x * CELL + CELL / 2, bonus.y * CELL + CELL / 2, CELL * 0.42, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  snake.forEach((s, i) => {
    const t = i / Math.max(1, snake.length - 1);
    ctx.fillStyle = i === 0 ? '#A5B4FC' : `hsl(${239 + t * 40}, 84%, ${67 - t * 22}%)`;
    roundRect(s.x * CELL + 1.5, s.y * CELL + 1.5, CELL - 3, CELL - 3, 7);
  });

  const [dx, dy] = VEC[dir];
  const hx = snake[0].x * CELL + CELL / 2, hy = snake[0].y * CELL + CELL / 2;
  ctx.fillStyle = '#0B1026';
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(hx + dx * 4 + dy * side * 5, hy + dy * 4 + dx * side * 5, 2.4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function overlay(title, text, button) {
  $('overlay-title').textContent = title;
  $('overlay-text').textContent = text;
  $('start').textContent = button;
  $('overlay').hidden = false;
}

function start() {
  reset();
  state = 'playing';
  $('overlay').hidden = true;
  hud();
  draw();
  timer = setTimeout(tick, delay());
}

function end() {
  state = 'over';
  clearTimeout(timer);
  const record = score > best;
  if (record) { best = score; store.set('snake:best', best); }
  overlay(record ? '신기록!' : '게임 오버', `${score}점 · 길이 ${snake.length}`, '다시 하기');
  ranking.submit(score);
}

function togglePause() {
  if (state === 'playing') {
    state = 'paused';
    clearTimeout(timer);
    overlay('잠시 멈춤', '스페이스를 다시 누르면 이어집니다.', '이어 하기');
  } else if (state === 'paused') {
    state = 'playing';
    $('overlay').hidden = true;
    timer = setTimeout(tick, delay());
  }
}

onDirKey(turn);
onSwipe($('stage'), turn);
$('start').addEventListener('click', () => (state === 'paused' ? togglePause() : start()));
window.addEventListener('keydown', (e) => {
  if (e.key !== ' ' && e.key !== 'Enter') return;
  e.preventDefault();
  if (state === 'ready' || state === 'over') start();
  else if (e.key === ' ') togglePause();
});
// 다른 탭으로 가면 알아서 멈춘다
document.addEventListener('visibilitychange', () => { if (document.hidden && state === 'playing') togglePause(); });

reset();
hud();
draw();
