import { store, setupCanvas } from '../common.js';

const W = 400, H = 600, GROUND = 540;
const BIRD_X = 110, BIRD_R = 14;
const PIPE_W = 64, SPACING = 210;
const GRAVITY = 1500, FLAP = -430;
const $ = (id) => document.getElementById(id);
const ctx = setupCanvas($('canvas'), W, H);

let state = 'ready';   // ready | playing | falling | over
let bird, pipes, score, prev, scroll = 0;
let best = store.get('flappy:best', 0);

// 많이 넘길수록 빨라지고 틈이 좁아진다
const speed = () => Math.min(260, 165 + score * 3);
const gap = () => Math.max(124, 168 - score * 1.5);

const stars = Array.from({ length: 40 }, () => ({ x: Math.random() * W, y: Math.random() * 300, r: Math.random() * 1.3 + 0.3 }));

function addPipe(x) {
  const g = gap();
  const top = 70 + Math.random() * (GROUND - 140 - g);
  // 창문 불빛은 빌딩마다 한 번만 정해 둔다. 매 프레임 새로 뽑으면 번쩍거린다
  const lights = Array.from({ length: 60 }, () => Math.random() < 0.45);
  pipes.push({ x, top, bottom: top + g, passed: false, lights });
}

function reset() {
  bird = { y: 260, vy: 0, angle: 0 };
  pipes = [];
  score = 0;
  for (let i = 0; i < 3; i++) addPipe(W + 120 + i * SPACING);
}

function flap() {
  if (state === 'ready' || state === 'over') return start();
  if (state === 'playing') bird.vy = FLAP;
}

function step(dt) {
  if (state === 'playing') {
    scroll += speed() * dt;
    for (const p of pipes) p.x -= speed() * dt;
    if (pipes[0].x + PIPE_W < 0) {
      pipes.shift();
      addPipe(pipes[pipes.length - 1].x + SPACING);
    }
    for (const p of pipes) {
      if (!p.passed && p.x + PIPE_W < BIRD_X - BIRD_R) { p.passed = true; score += 1; hud(); }
      const overlapX = BIRD_X + BIRD_R - 3 > p.x && BIRD_X - BIRD_R + 3 < p.x + PIPE_W;
      if (overlapX && (bird.y - BIRD_R + 3 < p.top || bird.y + BIRD_R - 3 > p.bottom)) state = 'falling';
    }
    if (bird.y - BIRD_R < 0) { bird.y = BIRD_R; bird.vy = 0; }
  }

  bird.vy += GRAVITY * dt;
  bird.y += bird.vy * dt;
  bird.angle = Math.max(-0.5, Math.min(1.3, bird.vy / 500));

  if (bird.y + BIRD_R >= GROUND) {
    bird.y = GROUND - BIRD_R;
    end();
  }
}

function hud() {
  $('score').textContent = score;
  $('best').textContent = Math.max(best, score);
}

function drawTower(p, y, h) {
  if (h <= 0) return;
  ctx.fillStyle = '#1E2347';
  ctx.fillRect(p.x, y, PIPE_W, h);
  ctx.fillStyle = '#2D3470';
  ctx.fillRect(p.x, y, 5, h);
  let n = 0;
  for (let wy = y + 10; wy + 10 < y + h - 4; wy += 20) {
    for (let wx = 0; wx < 3; wx++) {
      ctx.fillStyle = p.lights[n++ % p.lights.length] ? '#FDE68A' : 'rgba(255,255,255,0.08)';
      ctx.fillRect(p.x + 12 + wx * 16, wy, 9, 10);
    }
  }
}

function draw() {
  const sky = ctx.createLinearGradient(0, 0, 0, GROUND);
  sky.addColorStop(0, '#0B1026');
  sky.addColorStop(0.65, '#3B2A6B');
  sky.addColorStop(1, '#F97316');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  for (const s of stars) {
    ctx.beginPath();
    ctx.arc((s.x - scroll * 0.05 % W + W) % W, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const p of pipes) {
    drawTower(p, 0, p.top);
    drawTower(p, p.bottom, GROUND - p.bottom);
    ctx.fillStyle = '#4F46E5';
    ctx.fillRect(p.x - 4, p.top - 10, PIPE_W + 8, 10);
    ctx.fillRect(p.x - 4, p.bottom, PIPE_W + 8, 10);
  }

  ctx.fillStyle = '#0F172A';
  ctx.fillRect(0, GROUND, W, H - GROUND);
  ctx.fillStyle = '#FBBF24';
  for (let x = -(scroll % 48); x < W; x += 48) ctx.fillRect(x, GROUND + 26, 26, 5);

  ctx.save();
  ctx.translate(BIRD_X, bird.y);
  ctx.rotate(bird.angle);
  ctx.fillStyle = '#FDE047';
  ctx.beginPath();
  ctx.arc(0, 0, BIRD_R, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FACC15';
  ctx.beginPath();
  ctx.ellipse(-5, 3 + Math.sin(scroll / 14) * 3, 8, 5, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#F97316';
  ctx.beginPath();
  ctx.moveTo(11, -2); ctx.lineTo(21, 2); ctx.lineTo(11, 6);
  ctx.fill();
  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.arc(5, -5, 2.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  if (state !== 'ready') {
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.font = '900 44px Pretendard, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(score, W / 2, 72);
  }
}

function frame(now) {
  const dt = Math.min(0.03, (now - prev) / 1000);
  prev = now;
  step(dt);
  draw();
  if (state === 'playing' || state === 'falling') requestAnimationFrame(frame);
}

function start() {
  reset();
  state = 'playing';
  bird.vy = FLAP;
  hud();
  $('overlay').hidden = true;
  prev = performance.now();
  requestAnimationFrame(frame);
}

function end() {
  state = 'over';
  const record = score > best;
  if (record) { best = score; store.set('flappy:best', best); }
  hud();
  const rank = score >= 30 ? '전설의 퇴근러' : score >= 10 ? '칼퇴 성공' : score >= 3 ? '야근 확정' : '출근도 못 했습니다';
  $('overlay-title').textContent = record && score > 0 ? '신기록!' : rank;
  $('overlay-text').textContent = `빌딩 ${score}개 통과${record && score > 0 ? ` · ${rank}` : ''}`;
  $('start').textContent = '다시 하기';
  // 떨어지자마자 누른 탭이 바로 재시작으로 이어지지 않게 잠깐 뒤에 띄운다
  setTimeout(() => { $('overlay').hidden = false; }, 350);
}

$('stage').addEventListener('pointerdown', (e) => {
  if (e.target.closest('button')) return;
  if (state === 'playing') flap();
});
$('start').addEventListener('click', start);
window.addEventListener('keydown', (e) => {
  if (e.repeat || (e.key !== ' ' && e.key !== 'ArrowUp' && e.key !== 'Enter')) return;
  e.preventDefault();
  if (state === 'over' && $('overlay').hidden) return;
  flap();
});

reset();
hud();
draw();
