import { store } from '../common.js';

const ROUNDS = 5;
const $ = (id) => document.getElementById(id);
const pad = $('pad');

let state = 'idle';   // idle | wait | go | early | shown | done
let times = [];
let timer = 0;
let shownAt = 0;
let best = store.get('reaction:best', 0);

const rank = (ms) => (ms < 200 ? '프로게이머급' : ms < 250 ? '아주 빠름' : ms < 300 ? '평균보다 빠름' : ms < 380 ? '평균' : '커피가 필요합니다');

function show(cls, title, text) {
  pad.className = `pad ${cls}`;
  $('pad-title').textContent = title;
  $('pad-text').textContent = text;
}

function hud() {
  const avg = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
  $('avg').textContent = avg ? `${avg}ms` : '–';
  $('best').textContent = best ? `${best}ms` : '–';
  $('rounds').innerHTML = times.map((t, i) => `<i>${i + 1}회 ${t}ms</i>`).join('');
  return avg;
}

function arm() {
  state = 'wait';
  show('wait', '기다리세요…', `${times.length + 1} / ${ROUNDS}`);
  // 언제 바뀔지 짐작할 수 없게 1.2~4초 사이에서 고른다
  timer = setTimeout(() => {
    state = 'go';
    shownAt = performance.now();
    show('go', '지금!', '');
  }, 1200 + Math.random() * 2800);
}

function press() {
  if (state === 'idle' || state === 'done') {
    times = [];
    hud();
    arm();
  } else if (state === 'wait') {
    clearTimeout(timer);
    state = 'early';
    show('early', '너무 빨랐습니다', '초록이 된 뒤에 눌러야 합니다. 눌러서 다시 시도하세요.');
  } else if (state === 'early' || state === 'shown') {
    arm();
  } else if (state === 'go') {
    times.push(Math.round(performance.now() - shownAt));
    const avg = hud();
    if (times.length < ROUNDS) {
      state = 'shown';
      show('', `${times[times.length - 1]}ms`, '눌러서 다음으로');
    } else {
      state = 'done';
      const record = !best || avg < best;
      if (record) { best = avg; store.set('reaction:best', best); hud(); }
      show('', `평균 ${avg}ms`, `${rank(avg)}${record ? ' · 신기록' : ''} · 눌러서 다시 하기`);
    }
  }
}

// 누르는 순간을 재야 하므로 click이 아니라 pointerdown을 쓴다
pad.addEventListener('pointerdown', (e) => { e.preventDefault(); press(); });
window.addEventListener('keydown', (e) => {
  if (e.repeat || (e.key !== ' ' && e.key !== 'Enter')) return;
  e.preventDefault();
  press();
});

hud();
