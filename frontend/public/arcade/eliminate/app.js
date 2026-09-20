// 숨은 페이지: 소거법 디펜스. 선지가 답안지를 향해 내려오고, 오답만 쏴서 지운 뒤 정답만 통과시킨다.
// 객관식 시험에서 실제로 쓰는 "아닌 것부터 지우기"를 속도 압박 아래에서 연습하는 게 목적이다.
// 본 사이트와는 번들을 공유하지 않는다. 사이트의 풀이 기록(exam-progress:*)은 읽기만 하고, 쓰는 건 이 게임의 키뿐이다
import { createEngine, readStore, FIELD_H, CARD_H } from './engine.js';
import { createRanking } from '../rank.js';

const MARKS = ['①', '②', '③', '④', '⑤'];
const MUTE_KEY = 'arcade-eliminate:mute';

// 영역 이름이 은행마다 조금씩 달라서 키워드로 묶는다
const AREAS = [
  { key: 'all', name: '전 범위', words: [] },
  { key: 'db', name: '데이터베이스', words: ['데이터베이스'] },
  { key: 'ds', name: '자료구조·알고리즘', words: ['자료구조', '알고리즘'] },
  { key: 'os', name: '운영체제', words: ['운영체제'] },
  { key: 'net', name: '네트워크', words: ['네트워크', '통신'] },
  { key: 'se', name: '소프트웨어공학', words: ['소프트웨어공학'] },
  { key: 'sec', name: '정보보호', words: ['정보보호', '보안'] },
  { key: 'arch', name: '컴퓨터구조', words: ['컴퓨터구조', '논리회로'] },
];

const REASONS = {
  clear: '깔끔하게 소거했습니다',
  shot: '정답을 쏴 버렸습니다',
  leak: '오답이 답안지에 찍혔습니다',
};

const root = document.getElementById('app');
const esc = (v) => String(v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const num = (n) => n.toLocaleString('ko-KR');

let pool = [];
let area = 'all';
let snap = null;
let muted = false;
try { muted = localStorage.getItem(MUTE_KEY) === '1'; } catch { /* storage unavailable */ }

/* ===== 소리 ===== */
let audio = null;
const NOTES = {
  shot: [[660, 0, 0.07, 'square']],
  safe: [[523, 0, 0.09, 'triangle'], [784, 0.08, 0.12, 'triangle']],
  clear: [[523, 0, 0.08, 'triangle'], [659, 0.07, 0.08, 'triangle'], [1047, 0.14, 0.16, 'triangle']],
  hurt: [[196, 0, 0.22, 'sawtooth']],
  over: [[392, 0, 0.16, 'triangle'], [294, 0.15, 0.16, 'triangle'], [196, 0.3, 0.32, 'triangle']],
};

function sound(kind) {
  if (muted) return;
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    audio = audio || new Ctx();
    for (const [freq, at, dur, type] of NOTES[kind] || []) {
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.06, audio.currentTime + at);
      gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + at + dur);
      osc.connect(gain).connect(audio.destination);
      osc.start(audio.currentTime + at);
      osc.stop(audio.currentTime + at + dur + 0.02);
    }
  } catch { /* 소리가 안 나도 게임은 된다 */ }
}

function toggleMute() {
  muted = !muted;
  try { localStorage.setItem(MUTE_KEY, muted ? '1' : '0'); } catch { /* storage unavailable */ }
  document.querySelectorAll('[data-act="mute"]').forEach(b => { b.textContent = muteLabel(); });
}
const muteLabel = () => (muted ? '소리 꺼짐' : '소리 켜짐');

/* ===== 문제 풀 ===== */
// 사이트 문제은행에서 마지막에 틀린 문제를 표시해 둔다. 기록은 읽기만 한다
function markLast(items) {
  const cache = {};
  for (const it of items) {
    if (!(it.key in cache)) {
      try { cache[it.key] = JSON.parse(localStorage.getItem(`exam-progress:${it.key}`) || '{}')?.stats || {}; }
      catch { cache[it.key] = {}; }
    }
    it.last = cache[it.key][it.id]?.last;
  }
  return items;
}

const inArea = () => {
  const words = AREAS.find(a => a.key === area)?.words || [];
  return words.length ? pool.filter(it => words.some(w => it.area.includes(w))) : pool;
};
// 문제은행에서 마지막에 틀렸거나 이 게임에서 놓친 문제만 모은 복수전용 풀
const grudge = () => {
  const { missed } = readStore();
  return inArea().filter(it => it.last === 'w' || missed[it.uid]);
};

/* ===== 화면 ===== */
const ranking = createRanking('eliminate');
const engine = createEngine({
  onChange: (next) => {
    const finished = next.phase === 'over' && snap?.phase !== 'over';
    snap = next;
    render();
    if (finished) ranking.submit(next.score);
  },
  sound,
});
let builtWave = 0;   // 필드 DOM을 만들어 둔 문제 번호. 같은 문제 안에서는 클래스만 고친다
let shownShake = 0;
let shownPops = new Set();

function start(items) {
  if (!items.length) return;
  builtWave = 0;
  engine.start(items);
}

function toLobby() {
  engine.stop();
  snap = null;
  render();
}

function render() {
  const phase = snap?.phase || 'ready';
  if (phase === 'ready') return renderLobby();
  if (phase === 'over') return renderOver();
  if (phase === 'reveal') return renderReveal();
  return renderPlaying();
}

function renderLobby() {
  const store = readStore();
  const all = inArea();
  const mine = grudge();
  root.innerHTML = `
    <header class="head">
      <a class="back" href="/arcade/">← 오락실</a>
      <h1>소거법 디펜스 <span class="tag">HIDDEN</span></h1>
      <p>여기까지 찾아오셨네요. 선지가 답안지로 내려옵니다. 오답만 쏴서 지우고, 정답만 통과시키세요.</p>
    </header>
    <div class="rules">
      <div><b>쏜다</b><span>오답 선지를 클릭하거나 숫자키 1–5로 지웁니다. 일찍 지울수록 점수가 큽니다.</span></div>
      <div><b>보낸다</b><span>정답 선지는 건드리지 않고 답안지까지 보냅니다. 오답을 다 지우면 바로 통과됩니다.</span></div>
      <div><b>잃는다</b><span>정답을 쏘거나 오답이 답안지에 닿으면 목숨이 줄어듭니다. 목숨은 3개입니다.</span></div>
    </div>
    <div class="chips">
      ${AREAS.map(a => `<button class="btn sm${area === a.key ? ' on' : ''}" data-act="area" data-key="${a.key}">${esc(a.name)}</button>`).join('')}
    </div>
    <div class="row">
      <button class="btn primary" data-act="start" ${all.length ? '' : 'disabled'}>시작 · ${all.length}문제 중 출제</button>
      <button class="btn" data-act="grudge" ${mine.length >= 3 ? '' : 'disabled'}>복수전 · 내가 틀린 ${mine.length}문제만</button>
      <button class="btn ghost" data-act="mute">${muteLabel()}</button>
    </div>
    <p class="note">
      틀렸던 문제일수록 자주 나옵니다. 문제은행 오답 기록과 이 게임에서 놓친 문제를 함께 봅니다.
      ${store.plays > 0 ? ` · 최고 ${num(store.best)}점 · ${store.plays}판` : ''}
    </p>`;
}

const hudHtml = () => {
  const mult = (1 + Math.min(snap.combo, 10) * 0.1).toFixed(1);
  return `
    <div class="hud">
      <div class="hud-score" id="hud-score">${num(snap.score)}</div>
      <div class="hud-item">Lv.${snap.level} · ${snap.waveNo}번째</div>
      <div class="hud-item${snap.combo >= 2 ? ' hot' : ''}" id="hud-combo">콤보 ${snap.combo} · ×${mult}</div>
      <div class="hud-lives" id="hud-lives" aria-label="목숨 ${snap.lives}개">
        ${[0, 1, 2].map(i => `<span class="${i < snap.lives ? 'on' : ''}">♥</span>`).join('')}
      </div>
      <button class="btn ghost sm" data-act="mute">${muteLabel()}</button>
      <button class="btn ghost sm" data-act="lobby">그만하기</button>
    </div>
    <div class="question">
      <div class="meta">${esc(snap.item.bank)} · ${esc(snap.item.area)}</div>
      ${esc(snap.item.q)}
    </div>`;
};

function renderPlaying() {
  const { item } = snap;
  if (builtWave !== snap.waveNo) {
    builtWave = snap.waveNo;
    shownShake = snap.shake;
    shownPops = new Set();
    root.innerHTML = `
      ${hudHtml()}
      <div id="arcade-field" class="field" style="height:${FIELD_H}px">
        ${snap.order.map(i => `
          <div class="lane" data-opt="${i}" style="height:${CARD_H}px;transform:translateY(${snap.startYs[i]}px)">
            <button class="card alive" data-act="shoot" data-i="${i}">
              <span class="card-no">${MARKS[i]}</span><span class="card-text">${esc(item.o[i])}</span>
            </button>
          </div>`).join('')}
        <div class="sheet">답안지 · 여기 닿은 선지가 마킹됩니다</div>
      </div>`;
    return;
  }

  // 같은 문제 안에서는 카드를 다시 만들지 않는다. 다시 만들면 위치와 터지는 애니메이션이 처음으로 돌아간다
  const field = document.getElementById('arcade-field');
  snap.status.forEach((st, i) => {
    const card = field.querySelector(`.card[data-i="${i}"]`);
    if (card && !card.classList.contains(st)) card.className = `card ${st}`;
  });
  document.getElementById('hud-score').textContent = num(snap.score);
  const mult = (1 + Math.min(snap.combo, 10) * 0.1).toFixed(1);
  const combo = document.getElementById('hud-combo');
  combo.textContent = `콤보 ${snap.combo} · ×${mult}`;
  combo.classList.toggle('hot', snap.combo >= 2);
  document.querySelectorAll('#hud-lives span').forEach((el, i) => el.classList.toggle('on', i < snap.lives));

  for (const p of snap.pops) {
    if (shownPops.has(p.id)) continue;
    shownPops.add(p.id);
    const el = document.createElement('div');
    el.className = `pop ${p.kind}`;
    el.style.top = `${p.y}px`;
    el.textContent = p.text;
    el.addEventListener('animationend', () => el.remove());
    field.appendChild(el);
  }

  if (snap.shake !== shownShake) {
    shownShake = snap.shake;
    field.classList.remove('shake');
    void field.offsetWidth;
    field.classList.add('shake');
  }
}

function renderReveal() {
  const { item, reveal, status } = snap;
  // 오답을 흘린 뒤 나머지를 다 지워서 끝난 경우도 '놓친 문제'로 알려 준다
  const title = reveal.ok ? REASONS.clear : REASONS[reveal.reason === 'clear' ? 'leak' : reveal.reason];
  root.innerHTML = `
    ${hudHtml()}
    <div class="reveal ${reveal.ok ? 'good' : 'bad'}">
      <h2>${title}</h2>
      <ul>
        ${item.o.map((o, i) => `
          <li class="${i === item.a ? 'answer' : status[i] === 'leak' ? 'leak' : ''}">
            <span>${MARKS[i]}</span>${esc(o)}
            ${i === item.a ? '<em>정답</em>' : status[i] === 'leak' ? '<em>놓침</em>' : ''}
          </li>`).join('')}
      </ul>
      <p>${esc(item.e)}</p>
      <button class="btn primary" data-act="next">${snap.lives > 0 ? '다음 문제 (Space)' : '결과 보기 (Space)'}</button>
    </div>`;
}

function renderOver() {
  const accuracy = snap.shots ? Math.round(snap.hits / snap.shots * 100) : 0;
  root.innerHTML = `
    <header class="head">
      <h1>게임 오버 ${snap.newBest ? '<span class="tag">NEW BEST</span>' : ''}</h1>
      <p>${snap.waveNo}문제 중 ${snap.cleared}문제를 흠 없이 소거했습니다.</p>
    </header>
    <div class="result">
      <div><span>점수</span><b>${num(snap.score)}</b></div>
      <div><span>최고 기록</span><b>${num(snap.best)}</b></div>
      <div><span>사격 정확도</span><b>${accuracy}%</b></div>
      <div><span>최대 콤보</span><b>${snap.maxCombo}</b></div>
    </div>
    <div class="row">
      <button class="btn primary" data-act="start">다시 하기</button>
      <button class="btn" data-act="retry-missed" ${snap.missed.length ? '' : 'disabled'}>방금 놓친 ${snap.missed.length}문제만 다시</button>
      <button class="btn ghost" data-act="lobby">처음으로</button>
    </div>
    ${snap.missed.length ? `<h2 class="h2">놓친 문제 복습</h2>` : ''}
    ${snap.missed.map(m => `
      <div class="review">
        <div class="meta">${esc(m.bank)} · ${esc(m.area)}${m.topic ? ` · ${esc(m.topic)}` : ''}</div>
        <div class="review-q">${esc(m.q)}</div>
        <div class="review-a">${MARKS[m.a]} ${esc(m.o[m.a])}</div>
        <p>${esc(m.e)}</p>
      </div>`).join('')}`;
}

/* ===== 입력 ===== */
// 카드는 클릭이 아니라 누르는 순간에 터져야 손맛이 난다
root.addEventListener('pointerdown', (e) => {
  const card = e.target.closest('[data-act="shoot"]');
  if (card) engine.shoot(Number(card.dataset.i));
});

root.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-act]');
  if (!btn || btn.disabled) return;
  const act = btn.dataset.act;
  if (act === 'area') { area = btn.dataset.key; renderLobby(); }
  else if (act === 'start') start(inArea());
  else if (act === 'grudge') start(grudge());
  else if (act === 'retry-missed') start(snap.missed);
  else if (act === 'mute') toggleMute();
  else if (act === 'lobby') toLobby();
  else if (act === 'next') engine.next();
});

window.addEventListener('keydown', (e) => {
  if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
  const phase = snap?.phase;
  if (phase === 'playing' && e.key >= '1' && e.key <= '5') {
    engine.shoot(Number(e.key) - 1);
  } else if (phase === 'reveal' && (e.key === ' ' || e.key === 'Enter')) {
    e.preventDefault();
    engine.next();
  }
});

fetch(new URL('./questions.json', import.meta.url))
  .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
  .then(items => { pool = markLast(items); render(); })
  .catch(() => { root.innerHTML = '<p class="note">문제 데이터를 불러오지 못했습니다. 새로고침해 주세요.</p>'; });
