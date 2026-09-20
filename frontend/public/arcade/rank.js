// 게임 화면 오른쪽 위의 TOP 3 순위판. 3등 안에 드는 기록이 나오면 닉네임을 받아 서버에 올린다.
// 서버가 잠들어 있거나 응답하지 않아도 게임은 그대로 되도록, 실패는 전부 조용히 넘긴다
const API = 'https://cs-study-backend-i0ln.onrender.com/api/v1/arcade/scores';
const NICK_KEY = 'arcade:nickname';
const MEDALS = ['🥇', '🥈', '🥉'];

const css = document.createElement('link');
css.rel = 'stylesheet';
css.href = new URL('./rank.css', import.meta.url).href;
document.head.appendChild(css);

// 사이트가 방문자 수를 셀 때 쓰는 익명 ID를 같이 쓴다. 없으면 같은 방식으로 하나 만든다
function visitorId() {
  try {
    let id = localStorage.getItem('visitor-id');
    if (!id) {
      id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem('visitor-id', id);
    }
    return id;
  } catch {
    return null;
  }
}

const el = (tag, cls, text) => {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
};

export function createRanking(game, options = {}) {
  let board = { game, lowerWins: false, format: (n) => `${n.toLocaleString('ko-KR')}점`, label: '', ...options };
  let top = null;       // 아직 못 받았으면 null
  let loading = null;
  const me = (visitorId() || '').slice(0, 8);

  const panel = el('aside', 'rank');
  const head = el('div', 'rank-head');
  const list = el('ol', 'rank-list');
  panel.append(head, list);
  // 좁은 화면에서는 본문 위에 놓이므로 맨 앞에 넣는다
  document.body.prepend(panel);

  function render(message) {
    head.textContent = `🏆 TOP 3${board.label ? ` · ${board.label}` : ''}`;
    list.replaceChildren();
    if (message) {
      list.appendChild(el('li', 'rank-note', message));
      return;
    }
    for (let i = 0; i < 3; i++) {
      const row = top[i];
      const li = el('li', `rank-row${row && row.visitor === me ? ' me' : ''}${row ? '' : ' empty'}`);
      li.append(el('span', 'rank-medal', MEDALS[i]), el('span', 'rank-name', row ? row.nickname : '도전자를 기다리는 중'));
      if (row) li.appendChild(el('span', 'rank-score', board.format(row.score)));
      list.appendChild(li);
    }
  }

  function load() {
    const want = board.game;
    render('순위를 불러오는 중…');
    loading = fetch(`${API}?game=${encodeURIComponent(want)}`)
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(data => {
        if (want !== board.game) return;   // 그사이 난이도를 바꿨다
        top = data[want] || [];
        render();
      })
      .catch(() => { if (want === board.game) { top = null; render('순위 서버에 연결하지 못했습니다.'); } });
    return loading;
  }

  const better = (a, b) => (board.lowerWins ? a < b : a > b);

  function qualifies(score) {
    const mine = top.find(r => r.visitor === me);
    if (mine && !better(score, mine.score)) return false;
    return top.length < 3 || better(score, top[top.length - 1].score) || Boolean(mine);
  }

  // 닉네임을 받는다. 건너뛰면 null
  function askNickname(score) {
    return new Promise((resolve) => {
      const back = el('div', 'rank-modal-back');
      const box = el('form', 'rank-modal');
      const input = el('input', 'rank-input');
      input.maxLength = 10;
      input.placeholder = '닉네임 (최대 10자)';
      input.autocomplete = 'off';
      try { input.value = localStorage.getItem(NICK_KEY) || ''; } catch { /* storage unavailable */ }
      const buttons = el('div', 'rank-modal-buttons');
      const skip = el('button', 'rank-btn', '건너뛰기');
      skip.type = 'button';
      const ok = el('button', 'rank-btn primary', '순위에 올리기');
      ok.type = 'submit';
      buttons.append(skip, ok);
      box.append(
        el('div', 'rank-modal-title', '🎉 3등 안에 들었습니다!'),
        el('div', 'rank-modal-score', board.format(score)),
        el('p', 'rank-modal-text', '순위판에 올릴 닉네임을 적어 주세요.'),
        input, buttons,
      );
      back.appendChild(box);
      document.body.appendChild(back);
      input.focus();
      input.select();

      const close = (value) => { back.remove(); resolve(value); };
      // 게임들이 스페이스·엔터·방향키를 window에서 듣고 있어서, 입력 중에는 거기까지 가지 않게 막는다
      box.addEventListener('keydown', (e) => {
        e.stopPropagation();
        if (e.key === 'Escape') close(null);
      });
      for (const type of ['pointerdown', 'pointerup', 'click']) back.addEventListener(type, (e) => e.stopPropagation());
      skip.addEventListener('click', () => close(null));
      box.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = input.value.replace(/\s+/g, ' ').trim();
        if (!name) { input.focus(); return; }
        try { localStorage.setItem(NICK_KEY, name); } catch { /* storage unavailable */ }
        close(name);
      });
    });
  }

  async function submit(score) {
    const id = visitorId();
    if (!id || !Number.isFinite(score) || score <= 0) return;
    const want = board.game;
    if (top === null) await loading;
    // 처음에는 서버가 잠들어 있어 실패했을 수 있다. 기록이 나온 지금 한 번 더 받아 본다
    if (top === null) await load();
    if (top === null || want !== board.game || !qualifies(score)) return;

    const nickname = await askNickname(score);
    if (!nickname) return;
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game: want, nickname, score, visitorId: id }),
      });
      const data = await res.json();
      if (want === board.game && Array.isArray(data.top)) { top = data.top; render(); }
    } catch {
      /* 올리지 못해도 게임은 계속된다 */
    }
  }

  load();

  return {
    submit,
    // 난이도가 바뀌면 그 난이도의 순위판으로 갈아 끼운다
    setBoard(next) {
      board = { ...board, ...next };
      top = null;
      load();
    },
  };
}
