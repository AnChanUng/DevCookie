// 오락실 게임들이 같이 쓰는 작은 도구. 기록은 'arcade:' 로 시작하는 키에만 쓴다 (사이트의 풀이 기록과 섞이지 않게)
export const store = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(`arcade:${key}`);
      return raw === null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try { localStorage.setItem(`arcade:${key}`, JSON.stringify(value)); } catch { /* storage unavailable */ }
  },
};

// 손가락으로 민 방향을 'up' | 'down' | 'left' | 'right' 로 알려 준다
export function onSwipe(el, handler) {
  let sx = 0, sy = 0, active = false;
  el.addEventListener('pointerdown', (e) => { sx = e.clientX; sy = e.clientY; active = true; });
  el.addEventListener('pointerup', (e) => {
    if (!active) return;
    active = false;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    handler(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
  });
  el.addEventListener('pointercancel', () => { active = false; });
}

const KEY_DIRS = {
  ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
  w: 'up', s: 'down', a: 'left', d: 'right', W: 'up', S: 'down', A: 'left', D: 'right',
};

// 방향키와 WASD를 같은 방향 이름으로 바꿔 준다. 방향키가 페이지를 스크롤하지 않게 막는다
export function onDirKey(handler) {
  window.addEventListener('keydown', (e) => {
    const dir = KEY_DIRS[e.key];
    if (!dir || e.metaKey || e.ctrlKey || e.altKey) return;
    e.preventDefault();
    handler(dir);
  });
}

// 화면 배율이 높은 기기에서도 캔버스가 흐릿하지 않게 한다. 그리기 좌표는 논리 크기(w×h) 그대로 쓴다
export function setupCanvas(canvas, w, h) {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = w * ratio;
  canvas.height = h * ratio;
  canvas.style.aspectRatio = `${w} / ${h}`;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  return ctx;
}
