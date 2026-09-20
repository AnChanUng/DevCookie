import { store, setupCanvas } from '../common.js';
import { createRanking } from '../rank.js';

const W = 480, H = 600;
const COLS = 8, BRICK_H = 22, GAP = 6, TOP = 60;
const BRICK_W = (W - GAP * (COLS + 1)) / COLS;
const PADDLE_W = 92, PADDLE_H = 12, PADDLE_Y = H - 40;
const R = 7;
const COLORS = ['#F43F5E', '#F97316', '#FBBF24', '#34D399', '#22D3EE', '#818CF8', '#C084FC'];
const $ = (id) => document.getElementById(id);
const canvas = $('canvas');
const ctx = setupCanvas(canvas, W, H);

let state = 'ready';   // ready | serve | playing | over
let score, lives, level, bricks, ball, paddleX, particles, prev, keys = {};
let best = store.get('breakout:best', 0);
const ranking = createRanking('breakout');

// 판마다 모양이 달라진다. 1은 보통 벽돌, 2는 두 번 맞혀야 깨지는 벽돌
const LAYOUTS = [
  (r, c) => (r < 5 ? 1 : 0),
  (r, c) => (r < 6 && (r + c) % 2 === 0 ? 1 : r === 0 ? 2 : 0),
  (r, c) => (r < 6 && c >= r && c < COLS - r ? (r === 0 ? 2 : 1) : r < 6 && r > 3 ? 1 : 0),
  (r, c) => (r < 7 ? (r % 3 === 0 ? 2 : c % 3 === 1 ? 0 : 1) : 0),
  (r, c) => (r < 7 ? ((r + c) % 3 === 0 ? 2 : 1) : 0),
];

function buildLevel() {
  const layout = LAYOUTS[(level - 1) % LAYOUTS.length];
  bricks = [];
  for (let r = 0; r < 7; r++) for (let c = 0; c < COLS; c++) {
    const hp = layout(r, c);
    if (hp) bricks.push({ x: GAP + c * (BRICK_W + GAP), y: TOP + r * (BRICK_H + GAP), hp, color: COLORS[r % COLORS.length] });
  }
}

const ballSpeed = () => Math.min(620, 330 + (level - 1) * 35);

function serve() {
  state = 'serve';
  ball = { x: paddleX, y: PADDLE_Y - R - 1, vx: 0, vy: 0 };
}

function launch() {
  if (state !== 'serve') return;
  const angle = (-90 + (Math.random() * 50 - 25)) * Math.PI / 180;
  ball.vx = Math.cos(angle) * ballSpeed();
  ball.vy = Math.sin(angle) * ballSpeed();
  state = 'playing';
}

function burst(x, y, color) {
  for (let i = 0; i < 9; i++) {
    const a = Math.random() * Math.PI * 2, s = 60 + Math.random() * 160;
    particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.5, color });
  }
}

function step(dt) {
  if (keys.left) paddleX -= 520 * dt;
  if (keys.right) paddleX += 520 * dt;
  paddleX = Math.max(PADDLE_W / 2, Math.min(W - PADDLE_W / 2, paddleX));

  for (const p of particles) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 500 * dt; p.life -= dt; }
  particles = particles.filter(p => p.life > 0);

  if (state === 'serve') { ball.x = paddleX; return; }
  if (state !== 'playing') return;

  const px = ball.x, py = ball.y;
  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;

  if (ball.x < R) { ball.x = R; ball.vx = Math.abs(ball.vx); }
  if (ball.x > W - R) { ball.x = W - R; ball.vx = -Math.abs(ball.vx); }
  if (ball.y < R) { ball.y = R; ball.vy = Math.abs(ball.vy); }

  // 막대: 맞은 위치에 따라 튕기는 각도가 달라진다 (가운데는 수직, 끝은 최대 60도)
  if (ball.vy > 0 && ball.y + R >= PADDLE_Y && py + R <= PADDLE_Y + PADDLE_H && Math.abs(ball.x - paddleX) <= PADDLE_W / 2 + R) {
    const offset = Math.max(-1, Math.min(1, (ball.x - paddleX) / (PADDLE_W / 2)));
    const angle = (-90 + offset * 60) * Math.PI / 180;
    ball.vx = Math.cos(angle) * ballSpeed();
    ball.vy = Math.sin(angle) * ballSpeed();
    ball.y = PADDLE_Y - R;
  }

  for (const b of bricks) {
    if (b.hp <= 0) continue;
    if (ball.x + R < b.x || ball.x - R > b.x + BRICK_W || ball.y + R < b.y || ball.y - R > b.y + BRICK_H) continue;
    // 직전 위치가 벽돌의 좌우 바깥이었으면 옆면에 맞은 것으로 본다
    const fromSide = px + R <= b.x || px - R >= b.x + BRICK_W;
    if (fromSide) ball.vx = -ball.vx; else ball.vy = -ball.vy;
    b.hp -= 1;
    score += b.hp ? 5 : 10 * level;
    if (!b.hp) burst(b.x + BRICK_W / 2, b.y + BRICK_H / 2, b.color);
    break;
  }

  if (ball.y - R > H) {
    lives -= 1;
    if (lives <= 0) return end();
    serve();
  } else if (bricks.every(b => b.hp <= 0)) {
    level += 1;
    score += 100;
    buildLevel();
    serve();
  }
  hud();
}

function hud() {
  $('score').textContent = score.toLocaleString('ko-KR');
  $('best').textContent = Math.max(best, score).toLocaleString('ko-KR');
  $('level').textContent = level;
  $('lives').textContent = '♥'.repeat(Math.max(0, lives)) || '–';
}

function draw() {
  ctx.fillStyle = '#0B1026';
  ctx.fillRect(0, 0, W, H);

  for (const b of bricks) {
    if (b.hp <= 0) continue;
    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.roundRect(b.x, b.y, BRICK_W, BRICK_H, 5);
    ctx.fill();
    if (b.hp > 1) {
      ctx.strokeStyle = 'rgba(255,255,255,0.9)';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }
  }

  for (const p of particles) {
    ctx.globalAlpha = Math.max(0, p.life * 2);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
  }
  ctx.globalAlpha = 1;

  ctx.fillStyle = '#E0E7FF';
  ctx.beginPath();
  ctx.roundRect(paddleX - PADDLE_W / 2, PADDLE_Y, PADDLE_W, PADDLE_H, 6);
  ctx.fill();

  if (ball) {
    ctx.fillStyle = '#fff';
    ctx.shadowColor = '#A5B4FC';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, R, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  if (state === 'serve') {
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '600 15px Pretendard, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('탭하거나 스페이스를 눌러 발사', W / 2, H / 2 + 60);
  }
}

function frame(now) {
  // 탭을 떠났다 돌아와도 공이 순간이동하지 않게 한 프레임의 길이를 자른다
  const dt = Math.min(0.025, (now - prev) / 1000);
  prev = now;
  step(dt);
  draw();
  if (state !== 'over') requestAnimationFrame(frame);
}

function start() {
  score = 0;
  lives = 3;
  level = 1;
  particles = [];
  paddleX = W / 2;
  buildLevel();
  serve();
  hud();
  $('overlay').hidden = true;
  prev = performance.now();
  requestAnimationFrame(frame);
}

function end() {
  state = 'over';
  const record = score > best;
  if (record) { best = score; store.set('breakout:best', best); }
  hud();
  draw();
  $('overlay-title').textContent = record ? '신기록!' : '게임 오버';
  $('overlay-text').textContent = `${score.toLocaleString('ko-KR')}점 · ${level}판까지 갔습니다.`;
  $('start').textContent = '다시 하기';
  $('overlay').hidden = false;
  ranking.submit(score);
}

const toCanvasX = (e) => (e.clientX - canvas.getBoundingClientRect().left) / canvas.getBoundingClientRect().width * W;
canvas.addEventListener('pointermove', (e) => { if (state === 'serve' || state === 'playing') paddleX = toCanvasX(e); });
canvas.addEventListener('pointerdown', (e) => { paddleX = toCanvasX(e); });
canvas.addEventListener('pointerup', launch);

window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'a') { keys.left = true; e.preventDefault(); }
  else if (e.key === 'ArrowRight' || e.key === 'd') { keys.right = true; e.preventDefault(); }
  else if (e.key === ' ' || e.key === 'Enter') {
    e.preventDefault();
    if (state === 'ready' || state === 'over') start(); else launch();
  }
});
window.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = false;
  else if (e.key === 'ArrowRight' || e.key === 'd') keys.right = false;
});
$('start').addEventListener('click', start);

// 시작 전에도 벽돌이 깔린 화면을 보여 준다
score = 0; lives = 3; level = 1; particles = []; paddleX = W / 2;
buildLevel();
hud();
draw();
