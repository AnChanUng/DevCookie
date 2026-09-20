import { store } from '../common.js';
import { createRanking } from '../rank.js';

const FACES = ['🐶', '🐱', '🦊', '🐼', '🐸', '🐵', '🦁', '🐷', '🐙', '🦄', '🐝', '🐢', '🦉', '🐳', '🦖', '🍀', '🍉', '🚀'];
const $ = (id) => document.getElementById(id);
const grid = $('grid');

let size = store.get('memory:size', 4);
let cards, open, moves, found, locked;
let bests = store.get('memory:best', {});

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function reset() {
  const pairs = size * size / 2;
  const faces = shuffle(FACES).slice(0, pairs);
  cards = shuffle([...faces, ...faces]);
  open = [];
  moves = 0;
  found = 0;
  locked = false;
  grid.className = `memory-grid${size === 6 ? ' six' : ''}`;
  grid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
  grid.innerHTML = cards.map((face, i) => `
    <button class="mcard" data-i="${i}" aria-label="카드">
      <div class="mcard-inner">
        <div class="mcard-face mcard-back">?</div>
        <div class="mcard-face mcard-front">${face}</div>
      </div>
    </button>`).join('');
  document.querySelectorAll('[data-size]').forEach(b => b.classList.toggle('on', Number(b.dataset.size) === size));
  $('status').textContent = '';
  hud();
}

function hud() {
  $('moves').textContent = moves;
  $('pairs').textContent = `${found} / ${size * size / 2}`;
  $('best').textContent = bests[size] ? `${bests[size]}회` : '–';
}

function flip(i) {
  const el = grid.children[i];
  if (locked || el.classList.contains('up')) return;
  el.classList.add('up');
  open.push(i);
  if (open.length < 2) return;

  moves += 1;
  const [a, b] = open;
  open = [];
  if (cards[a] === cards[b]) {
    found += 1;
    grid.children[a].classList.add('done');
    grid.children[b].classList.add('done');
    if (found === size * size / 2) finish();
  } else {
    // 틀린 두 장을 잠깐 보여 준 뒤 다시 덮는다. 그동안은 다른 카드를 못 뒤집는다
    locked = true;
    setTimeout(() => {
      grid.children[a].classList.remove('up');
      grid.children[b].classList.remove('up');
      locked = false;
    }, 750);
  }
  hud();
}

function finish() {
  const record = !bests[size] || moves < bests[size];
  if (record) { bests = { ...bests, [size]: moves }; store.set('memory:best', bests); }
  $('status').textContent = `${moves}번 만에 다 찾았습니다!${record ? ' 신기록입니다.' : ''}`;
  ranking.submit(moves);
}

grid.addEventListener('click', (e) => {
  const el = e.target.closest('.mcard');
  if (el) flip(Number(el.dataset.i));
});
$('restart').addEventListener('click', reset);
document.querySelectorAll('[data-size]').forEach(b => b.addEventListener('click', () => {
  size = Number(b.dataset.size);
  store.set('memory:size', size);
  ranking.setBoard({ game: `memory-${size}`, label: `${size}×${size}` });
  reset();
}));

if (size !== 4 && size !== 6) size = 4;
// 적게 뒤집을수록 좋은 기록이다
const ranking = createRanking(`memory-${size}`, { lowerWins: true, format: (n) => `${n}회`, label: `${size}×${size}` });
reset();
