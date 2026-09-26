// 쿠키 연구소. 사이트 어디에도 링크하지 않은 숨은 페이지다.
// 방 네 곳(포춘쿠키 · 해부실 · 터미널 · 동의서)에 황금 쿠키가 하나씩 있고, 넷 다 모으면 인증서가 나온다.
// 아무것도 서버로 보내지 않는다. 기록은 localStorage(cookielab:*)와 Path=/cookie/ 쿠키에만 남는다.
(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  const store = {
    get(k, d) { try { const v = localStorage.getItem('cookielab:' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem('cookielab:' + k, JSON.stringify(v)); } catch { /* 저장 못 해도 동작은 한다 */ } },
  };

  /* ================= 공통: 토스트 · 모달 · 쿠키 비 ================= */
  let toastTimer;
  function toast(msg, ms = 2600) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), ms);
  }
  function modal(html) {
    $('#modalCard').innerHTML = html;
    $('#modal').hidden = false;
  }
  function closeModal() { $('#modal').hidden = true; }
  $('#modal').addEventListener('click', e => {
    if (e.target.id === 'modal' || e.target.closest('[data-close]')) closeModal();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#modal').hidden) closeModal(); });

  function rain(n = 50, pool = ['🍪']) {
    const box = $('#rain');
    for (let i = 0; i < n; i++) {
      const d = document.createElement('span');
      d.className = 'drop';
      d.textContent = pick(pool);
      d.style.left = Math.random() * 100 + 'vw';
      d.style.fontSize = 18 + Math.random() * 26 + 'px';
      d.style.animationDuration = 1.8 + Math.random() * 2.2 + 's';
      d.style.animationDelay = Math.random() * 1.2 + 's';
      d.style.setProperty('--r', (Math.random() * 720 - 360) + 'deg');
      d.addEventListener('animationend', () => d.remove());
      box.appendChild(d);
    }
  }

  /* ================= 황금 쿠키 ================= */
  const GOLD = {
    fortune: { room: '포춘쿠키', how: '다섯 번째 쿠키는 황금으로 구워집니다.' },
    lab: { room: '해부실', how: '단지 속 수상한 쿠키를 먹었습니다.' },
    terminal: { room: '터미널', how: '숨김 파일의 암호를 풀었습니다.' },
    consent: { room: '동의서', how: '쿠키를 끝까지 모두 거부했습니다.' },
  };
  const golds = () => store.get('gold', {});

  function renderGold() {
    const g = golds();
    const n = Object.keys(GOLD).filter(k => g[k]).length;
    $('#goldSlots').innerHTML = Object.keys(GOLD).map(k => `<i class="${g[k] ? 'on' : ''}" title="${GOLD[k].room}">${g[k] ? '' : ''}</i>`).join('');
    $('#goldCount').textContent = `${n} / 4`;
    $$('#rooms button').forEach(b => b.classList.toggle('has-gold', !!g[b.dataset.room]));
  }

  function awardGold(key) {
    const g = golds();
    if (g[key]) { toast('이 방의 황금 쿠키는 이미 찾았어요 ✦'); return; }
    g[key] = Date.now();
    store.set('gold', g);
    renderGold();
    rain(40, ['🍪', '✨', '🍪']);
    const n = Object.keys(GOLD).filter(k => g[k]).length;
    modal(`
      <div class="big-gold">🍪</div>
      <h2>황금 쿠키 발견!</h2>
      <p><b>${GOLD[key].room}</b> · ${GOLD[key].how}<br>${n < 4 ? `남은 황금 쿠키 ${4 - n}개. 다른 방도 뒤져 보세요.` : '네 개를 모두 모았습니다…!'}</p>
      <button class="btn" data-close>${n < 4 ? '계속 찾기' : '두근두근'}</button>`);
    if (n === 4) $('#modalCard [data-close]').addEventListener('click', () => setTimeout(finale, 250), { once: true });
  }

  function finale() {
    const g = golds();
    const name = store.get('name', '');
    const first = Math.min(...Object.values(g));
    const last = Math.max(...Object.values(g));
    const mins = Math.max(1, Math.round((last - first) / 60000));
    rain(90, ['🍪', '🥠', '✨', '🏅']);
    modal(`
      <input class="name-in" id="certName" placeholder="인증서에 새길 이름" maxlength="16" value="${esc(name)}" />
      <div class="cert">
        <small>COOKIE LAB · 제 ${fpShort || '0000'} 호</small>
        <h3>명예 쿠키 연구원 인증서</h3>
        <div class="who" id="certWho">${esc(name || '이름 없는 연구원')}</div>
        <small>위 사람은 지도에 없는 연구소를 찾아와 황금 쿠키 네 개를 ${mins}분 만에 모두 모았으므로<br>이 인증서를 수여합니다. 이제 공부하러 가세요.</small>
        <small style="margin-top:8px">${new Date(last).toLocaleDateString('ko-KR')}</small>
      </div>
      <button class="btn" data-close>공부하러 가기 (진짜로)</button>`);
    $('#certName').addEventListener('input', e => {
      store.set('name', e.target.value);
      $('#certWho').textContent = e.target.value || '이름 없는 연구원';
    });
  }
  $('#goldMeter').addEventListener('click', () => {
    const g = golds();
    if (Object.keys(GOLD).every(k => g[k])) { finale(); return; }
    modal(`<h2>황금 쿠키</h2>
      <p style="text-align:left">${Object.entries(GOLD).map(([k, v]) => `${g[k] ? '✦' : '·'} <b>${v.room}</b> — ${g[k] ? v.how : '아직 못 찾았어요.'}`).join('<br>')}</p>
      <p class="muted">힌트가 필요하면: 쿠키는 많이 깨 보고, 단지는 들여다보고, 점으로 시작하는 파일을 조심하고, 거부는 포기하지 마세요.</p>
      <button class="btn" data-close>닫기</button>`);
  });

  /* ================= 방 전환 ================= */
  const ROOMS = ['fortune', 'lab', 'terminal', 'consent'];
  const entered = {};
  function go(room) {
    if (!ROOMS.includes(room)) room = 'fortune';
    $$('.room').forEach(s => s.classList.toggle('show', s.id === 'room-' + room));
    $$('#rooms button').forEach(b => b.classList.toggle('active', b.dataset.room === room));
    if (location.hash !== '#' + room) history.replaceState(null, '', '#' + room);
    if (!entered[room]) { entered[room] = true; ENTER[room]?.(); }
    if (room === 'terminal') setTimeout(() => $('#termIn').focus({ preventScroll: true }), 50);
  }
  $('#rooms').addEventListener('click', e => { const b = e.target.closest('button'); if (b) go(b.dataset.room); });
  window.addEventListener('hashchange', () => go(location.hash.slice(1)));

  /* ================= 코나미 커맨드 ================= */
  const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let kpos = 0;
  document.addEventListener('keydown', e => {
    if (e.target.matches('input, select, textarea')) return;
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    kpos = k === KONAMI[kpos] ? kpos + 1 : (k === KONAMI[0] ? 1 : 0);
    if (kpos === KONAMI.length) { kpos = 0; rain(120, ['🍪', '🥠', '🍩', '🧁', '🍰']); toast('↑↑↓↓←→←→BA — 옛날 사람 인증 🍪'); }
  });

  /* ================= 1. 포춘쿠키 ================= */
  const FORTUNES = [
    '오늘 짠 코드가 한 번에 컴파일된다. 그게 더 무섭다.',
    '서류 합격 메일은 스팸함에 있다. 지금 확인해라.',
    '면접관이 "마지막으로 하고 싶은 말"을 묻는다. 3초 넘게 침묵하지 마라.',
    '어제 푼 문제가 오늘 시험에 나온다. 선지 순서만 바뀐 채로.',
    'NullPointerException은 당신 잘못이 아니다. 하지만 고치는 건 당신이다.',
    '오늘은 git push --force 하기 좋은 날이 아니다.',
    '스택오버플로의 두 번째 답변이 정답이다. 채택된 답은 2014년 것이다.',
    '당신의 인연은 3-way handshake처럼 확실하게 연결된다. SYN을 먼저 보내라.',
    '캐시를 지우면 해결된다. 인생도 가끔은.',
    '합격은 O(1)이 아니다. 하지만 O(n)이라면 반드시 끝난다.',
    '자소서 4번 문항에 1번을 복붙하지 마라. 들킨다.',
    '누군가 당신의 커밋에 👍를 누를 것이다.',
    '찾는 버그는 세미콜론 바로 뒤에 숨어 있다.',
    '데드락을 피하려면 순서를 정해라. 오늘 할 일도 마찬가지다.',
    '커피는 세 잔까지 버퍼, 네 잔부터 오버플로.',
    '면접에서 "잘 모르겠습니다"는 오답이 아니다. 아는 척이 오답이다.',
    '어제보다 한 문제만 더 풀면 된다. 그게 증가 수열이다.',
    '재귀 같은 하루도 언젠가 base case를 만난다.',
    '오늘 밤 당신의 GC가 스트레스를 수거해 간다.',
    'rm -rf 전에 pwd. 결정 전에 한 번 더.',
    '당신이 올린 PR은 오늘 승인된다. 코멘트 17개와 함께.',
    '정규화는 제3정규형까지만 외워라. 욕심은 반정규화를 부른다.',
    '로컬에서는 잘 된다. 그 말은 오늘로 마지막이다.',
    '이 페이지를 찾아낸 사람의 합격률은 통계적으로 유의미하게 높다. (표본 1명)',
    '타임아웃은 실패가 아니다. 다시 요청하라는 뜻이다.',
    '당신의 우선순위 큐 맨 앞에는 "잠"이 있어야 한다.',
    'SELECT * FROM 걱정 WHERE 내가_바꿀_수_있음 = true; 나머지는 버려라.',
    '오늘의 운은 멱등하다. 여러 번 깨도 결과는… 사실 달라진다. 이건 쿠키니까.',
    '주석을 남겨라. 3개월 뒤의 당신은 남이다.',
    '낙관적 락처럼 살아라. 충돌은 드물고, 나면 다시 하면 된다.',
  ];
  const GOLD_FORTUNE = '✦ 황금 쿠키 ✦ 끝까지 깨 본 사람에게만 나오는 운세: 당신은 결국 해낸다. 방금처럼, 한 번 더 두드려서.';
  const LUCKY = {
    '행운의 포트': ['22', '80', '443', '3000', '3306', '5432', '6379', '8080', '27017'],
    '행운의 상태 코드': ['200 OK', '201 Created', '202 Accepted', '204 No Content', '304 Not Modified', "418 I'm a teapot"],
    '행운의 자료구조': ['힙', '트라이', '해시맵', '덱', '유니온 파인드', '세그먼트 트리', '스킵 리스트', '블룸 필터'],
    '피해야 할 것': ['금요일 오후 배포', 'main에 직접 push', '주석 없는 정규식', '마지막 문제부터 풀기', '혼자 3시간 디버깅', 'SELECT *', '새벽 3시의 리팩터링'],
  };
  let fcHits = 0, fcOpen = false;

  function renderFortuneLog() {
    const log = store.get('fortunes', []);
    $('#fortuneLog').innerHTML = log.slice().reverse().map(f => `<li class="${f.gold ? 'gold' : ''}">${esc(f.text)}</li>`).join('');
    $('#fcTotal').textContent = log.length ? `${log.length}개` : '';
  }
  function crumbs(n, gold) {
    const stage = $('.fc-area');
    for (let i = 0; i < n; i++) {
      const c = document.createElement('span');
      c.className = 'crumb';
      c.style.left = 140 + Math.random() * 20 + 'px';
      c.style.top = 110 + Math.random() * 30 + 'px';
      c.style.background = gold ? 'var(--gold)' : pick(['#e0a867', '#b97a3c', '#f2c27f']);
      c.style.width = c.style.height = 4 + Math.random() * 7 + 'px';
      c.style.setProperty('--dx', (Math.random() * 260 - 130) + 'px');
      c.style.setProperty('--dy', (Math.random() * 200 - 60) + 'px');
      c.style.setProperty('--r', Math.random() * 360 + 'deg');
      c.addEventListener('animationend', () => c.remove());
      stage.appendChild(c);
    }
  }
  function nextIsGold() { return store.get('cracked', 0) + 1 === 5 && !golds().fortune; }
  function prepCookie() {
    fcHits = 0; fcOpen = false;
    const fc = $('#fc');
    fc.className = 'fc' + (nextIsGold() ? ' golden' : '');
    $('#slip').classList.remove('show', 'gold');
    $('#slip').hidden = true;
    $('#fcAgain').hidden = true;
    $('#fcHint').textContent = nextIsGold() ? '…어? 이 쿠키, 뭔가 반짝이는데요' : '쿠키를 세 번 두드려 깨 보세요';
  }
  $('#fc').addEventListener('click', () => {
    if (fcOpen) return;
    const fc = $('#fc');
    const gold = fc.classList.contains('golden');
    fcHits++;
    fc.classList.remove('hit'); void fc.offsetWidth; fc.classList.add('hit');
    crumbs(4 + fcHits * 3, gold);
    if (fcHits === 1) { fc.classList.add('c1'); $('#fcHint').textContent = '금이 갔어요. 조금 더!'; return; }
    if (fcHits === 2) { fc.classList.add('c2'); $('#fcHint').textContent = '한 번만 더…'; return; }
    fcOpen = true;
    fc.classList.add('open');
    crumbs(26, gold);
    const cracked = store.get('cracked', 0) + 1;
    store.set('cracked', cracked);
    const text = gold ? GOLD_FORTUNE : pick(FORTUNES);
    $('#slipText').textContent = text;
    $('#slipLucky').innerHTML = Object.entries(LUCKY).map(([k, v]) => `<dt>${k}</dt><dd>${esc(pick(v))}</dd>`).join('');
    const slip = $('#slip');
    slip.hidden = false;
    slip.classList.toggle('gold', gold);
    requestAnimationFrame(() => requestAnimationFrame(() => slip.classList.add('show')));
    const log = store.get('fortunes', []);
    log.push({ text, gold, at: Date.now() });
    store.set('fortunes', log.slice(-60));
    renderFortuneLog();
    $('#fcHint').textContent = gold ? '' : (cracked < 5 && !golds().fortune ? `${cracked}번째 쿠키. 계속 깨다 보면 좋은 일이 있을지도.` : `${cracked}번째 쿠키`);
    $('#fcAgain').hidden = false;
    if (gold) setTimeout(() => awardGold('fortune'), 1100);
  });
  $('#fcAgain').addEventListener('click', prepCookie);

  /* ================= 2. 해부실 ================= */
  let fpShort = '';
  function hash53(str) { // cyrb53
    let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0');
  }
  function canvasFingerprint() {
    try {
      const c = document.createElement('canvas');
      c.width = 280; c.height = 60;
      const x = c.getContext('2d');
      const g = x.createLinearGradient(0, 0, 280, 60);
      g.addColorStop(0, '#f60'); g.addColorStop(.5, '#069'); g.addColorStop(1, 'rgba(102,204,0,0.7)');
      x.fillStyle = g; x.fillRect(0, 0, 280, 60);
      x.textBaseline = 'alphabetic';
      x.font = '17px "Arial"'; x.fillStyle = '#fff';
      x.fillText('Cookie Lab 쿠키 연구소 🍪 <canvas> 1.0', 4, 24);
      x.font = 'italic 13px serif'; x.fillStyle = 'rgba(40,20,0,0.8)';
      x.fillText('The quick brown fox 🦊 ∑∫√', 8, 48);
      x.beginPath(); x.arc(240, 30, 18, 0, Math.PI * 1.7); x.strokeStyle = '#ff0'; x.lineWidth = 3; x.stroke();
      return hash53(c.toDataURL() + navigator.userAgent + screen.width + 'x' + screen.height + navigator.hardwareConcurrency + (Intl.DateTimeFormat().resolvedOptions().timeZone || ''));
    } catch { return hash53(navigator.userAgent); }
  }
  function drawIdenticon(hex) {
    const cv = $('#identicon');
    const x = cv.getContext('2d');
    const hue = parseInt(hex.slice(0, 3), 16) % 360;
    x.clearRect(0, 0, 140, 140);
    x.fillStyle = `hsl(${hue} 45% 14%)`; x.fillRect(0, 0, 140, 140);
    const cell = 20, off = 20;
    for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) {
      const bit = parseInt(hex[(r * 3 + c) % hex.length], 16);
      if (bit % 2 === 0) continue;
      x.fillStyle = `hsl(${(hue + (bit > 9 ? 30 : 0)) % 360} 75% ${bit > 11 ? 70 : 60}%)`;
      for (const cc of c === 2 ? [2] : [c, 4 - c]) {
        x.beginPath();
        x.roundRect ? x.roundRect(off + cc * cell + 1, off + r * cell + 1, cell - 2, cell - 2, 5) : x.rect(off + cc * cell + 1, off + r * cell + 1, cell - 2, cell - 2);
        x.fill();
      }
    }
  }
  function parseUA() {
    const ua = navigator.userAgent;
    const browser = /Edg\//.test(ua) ? 'Edge' : /Whale\//.test(ua) ? '네이버 웨일' : /SamsungBrowser/.test(ua) ? '삼성 인터넷' : /OPR\//.test(ua) ? 'Opera'
      : /Firefox\//.test(ua) ? 'Firefox' : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : '알 수 없는 브라우저';
    const os = /Windows NT 10/.test(ua) ? 'Windows 10/11' : /Windows/.test(ua) ? 'Windows' : /iPhone|iPad/.test(ua) ? 'iOS' : /Android/.test(ua) ? 'Android'
      : /Mac OS X/.test(ua) ? 'macOS' : /Linux/.test(ua) ? 'Linux' : '알 수 없는 OS';
    return { browser, os };
  }
  function greetingByHour(h) {
    if (h < 5) return '새벽이네요. 이 시간에 여기 있다는 건… 내일 시험인가요?';
    if (h < 9) return '아침형 인간이시군요.';
    if (h < 12) return '오전 집중 시간입니다.';
    if (h < 14) return '점심은 드셨나요?';
    if (h < 18) return '오후의 딴짓 시간이군요.';
    if (h < 22) return '저녁 공부 중이시군요.';
    return '밤이 깊었습니다. 쿠키 말고 잠이 필요할지도.';
  }
  async function renderFacts() {
    const { browser, os } = parseUA();
    const now = new Date();
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const visits = store.get('visits', 0);
    const firstSeen = store.get('firstSeen', Date.now());
    const rows = [
      ['브라우저 · OS', `${browser} · ${os}`],
      ['언어', (navigator.languages || [navigator.language]).join(', ')],
      ['시간대', `${tz} (${now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}) — ${greetingByHour(now.getHours())}`],
      ['화면', `${screen.width}×${screen.height}, 배율 ${devicePixelRatio}x, 창 ${innerWidth}×${innerHeight}`],
      ['CPU 코어', navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency}개` : '숨김'],
      ['메모리', navigator.deviceMemory ? `약 ${navigator.deviceMemory}GB 이상` : '숨김 (이 브라우저는 잘 지키네요)'],
      ['터치', navigator.maxTouchPoints > 0 ? `손가락 ${navigator.maxTouchPoints}개까지` : '마우스파'],
      ['테마', matchMedia('(prefers-color-scheme: dark)').matches ? '다크 모드 (역시)' : '라이트 모드 (용감하시네요)'],
      ['네트워크', navigator.connection?.effectiveType ? `${navigator.connection.effectiveType.toUpperCase()}${navigator.connection.downlink ? `, 약 ${navigator.connection.downlink}Mbps` : ''}` : '숨김'],
      ['어디서 왔나', document.referrer ? new URL(document.referrer).host : '주소창에 직접 입력 (어떻게 알았죠?)'],
      ['방문', `${visits}번째 · 처음 온 날 ${new Date(firstSeen).toLocaleDateString('ko-KR')}`],
      ['이 사이트 저장소', `localStorage 항목 ${(() => { try { return localStorage.length; } catch { return '?'; } })()}개`],
    ];
    try {
      if (navigator.getBattery) {
        const b = await navigator.getBattery();
        rows.push(['배터리', `${Math.round(b.level * 100)}% ${b.charging ? '충전 중 🔌' : '(충전기 찾으세요)'}`]);
      }
    } catch { /* 배터리 API 없음 */ }
    $('#facts').innerHTML = rows.map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join('');
  }

  const live = { start: Date.now(), dist: 0, clicks: 0, keys: 0, scroll: 0, hidden: 0, lx: null, ly: null };
  document.addEventListener('pointermove', e => {
    if (live.lx != null) live.dist += Math.hypot(e.clientX - live.lx, e.clientY - live.ly);
    live.lx = e.clientX; live.ly = e.clientY;
  }, { passive: true });
  document.addEventListener('pointerdown', () => live.clicks++, { passive: true });
  document.addEventListener('keydown', () => live.keys++);
  window.addEventListener('scroll', () => { live.scroll = Math.max(live.scroll, Math.round(scrollY)); }, { passive: true });
  document.addEventListener('visibilitychange', () => { if (document.hidden) live.hidden++; });
  function renderLive() {
    const sec = Math.floor((Date.now() - live.start) / 1000);
    const cm = live.dist / (96 / 2.54) / devicePixelRatio; // 대략적인 실제 거리
    $('#live').innerHTML = [
      ['머문 시간', `${Math.floor(sec / 60)}분 ${sec % 60}초`],
      ['마우스 이동', cm >= 100 ? `${(cm / 100).toFixed(2)}m` : `${cm.toFixed(1)}cm`],
      ['클릭 · 탭', `${live.clicks}번`],
      ['키 입력', `${live.keys}번`],
      ['다른 탭 구경', `${live.hidden}번 ${live.hidden ? '(봤어요)' : ''}`],
    ].map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('');
  }

  // 오븐: 쿠키는 만료 시각을 돌려주지 않아서, 직접 구운 것의 만료 시각은 따로 적어 둔다
  const COOKIE_PATH = '/cookie/';
  function readCookies() {
    return document.cookie ? document.cookie.split('; ').map(p => {
      const i = p.indexOf('=');
      let v = i < 0 ? '' : p.slice(i + 1);
      try { v = decodeURIComponent(v); } catch { /* 그대로 */ }
      return { name: i < 0 ? p : p.slice(0, i), value: v };
    }) : [];
  }
  function bake(name, value, sec) {
    document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${sec}; Path=${COOKIE_PATH}; SameSite=Lax`;
    const exp = store.get('oven', {});
    exp[name] = Date.now() + sec * 1000;
    store.set('oven', exp);
  }
  function eatCookie(name) {
    for (const path of [COOKIE_PATH, '/cookie', '/']) document.cookie = `${name}=; Max-Age=0; Path=${path}`;
    const exp = store.get('oven', {});
    delete exp[name];
    store.set('oven', exp);
  }
  let lastJar = '';
  function renderJar() {
    const exp = store.get('oven', {});
    const list = readCookies();
    const html = list.map(c => {
      const left = exp[c.name] ? Math.max(0, Math.ceil((exp[c.name] - Date.now()) / 1000)) : null;
      const ttl = left == null ? '세션/모름' : left >= 60 ? `${Math.floor(left / 60)}분 ${left % 60}초` : `${left}초`;
      return `<li class="${c.name === 'golden_crumb' ? 'sparkle' : ''}" data-name="${esc(c.name)}">
        <span class="nm">${esc(c.name)}</span><span class="vl" title="${esc(c.value)}">${esc(c.value)}</span>
        <span class="ttl ${left != null && left <= 5 ? 'soon' : ''}">${ttl}</span><button aria-label="먹기">🍴</button></li>`;
    }).join('');
    if (html !== lastJar) { $('#jar').innerHTML = html; lastJar = html; }
  }
  $('#jar').addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const li = btn.closest('li');
    const name = li.dataset.name;
    li.classList.add('eaten');
    setTimeout(() => {
      eatCookie(name);
      lastJar = '';
      renderJar();
      if (name === 'golden_crumb') awardGold('lab');
      else if (readCookies().some(c => c.name === name)) toast(`${name}은(는) 다른 경로나 도메인에서 구운 쿠키라 여기서는 못 먹어요.`);
      else toast(`냠. ${name} 쿠키를 먹었습니다.`);
    }, 450);
  });
  $('#ovenForm').addEventListener('submit', e => {
    e.preventDefault();
    const name = $('#ovenName').value.trim().replace(/[^A-Za-z0-9_-]/g, '');
    if (!name) { toast('쿠키 이름은 영문, 숫자, _ , - 만 됩니다.'); return; }
    bake(name, $('#ovenValue').value, +$('#ovenLife').value);
    $('#ovenName').value = ''; $('#ovenValue').value = '';
    renderJar();
    toast(`🔥 ${name} 쿠키가 구워졌습니다. 개발자 도구 Application 탭에서도 보여요.`);
  });

  /* ================= 3. 터미널 ================= */
  const FS = {
    home: {
      guest: {
        'readme.txt': `쿠키 연구소 터미널에 오신 걸 환영합니다.\n\n  - 명령어 목록은 help\n  - 이 방 어딘가에 황금 쿠키 금고가 있습니다.\n  - 사람들은 보통 숨기고 싶은 파일 이름 앞에 점(.)을 붙이죠.`,
        'todo.txt': `[x] 자료구조 복습\n[x] 운영체제 요약\n[ ] 네트워크 3-way handshake 외우기\n[ ] 자소서 4번 문항 (1번 복붙 금지)\n[ ] 쿠키 연구소 찾기  ← 방금 함`,
        '.bash_history': `ls\ncd projects\ncat resume_final_진짜최종_v3.md\nsudo 합격\nrm -rf 불안\nls -a\ncat .secret\nbase64 -d ...\nunlock ...`,
        '.secret': `쿠키 몬스터의 금고.\n암호는 base64로 적어 두었다. 누가 봐도 못 읽겠지? (읽을 수 있다)\n\n    Y29va2llLW1vbnN0ZXI=\n\n풀었다면: unlock <암호>`,
        projects: {
          'resume_final_진짜최종_v3.md': `# 이력서\n\n- 기술 스택: Java, Spring, 자신감\n- 강점: 로컬에서는 잘 됩니다\n- 약점: 너무 성실함 (면접용)`,
          'HelloWorld.java': `public class HelloWorld {\n    public static void main(String[] args) {\n        System.out.println("Hello, Cookie!");\n    }\n}`,
        },
      },
    },
    etc: {
      motd: '오늘의 메시지: 합격은 컴파일 타임이 아니라 런타임에 결정된다.',
      passwd: 'root:x:0:0:아무나 될 수 없음:/root:/bin/bash\nguest:x:1000:1000:당신:/home/guest:/bin/cookiesh\ncookie-monster:x:1337:1337:금고지기:/dev/null:/bin/nom',
    },
    tmp: {},
    dev: { null: '' },
  };
  const HOME = ['home', 'guest'];
  let cwd = [...HOME];
  const hist = store.get('termHist', []);
  let hpos = hist.length;
  let busy = false;
  let mode = 'sh'; // sh | vim
  let sudoTries = 0;

  const pathStr = p => { const s = '/' + p.join('/'); const h = '/' + HOME.join('/'); return s === h ? '~' : s.startsWith(h + '/') ? '~' + s.slice(h.length) : s; };
  function resolve(arg) {
    if (!arg || arg === '~') return [...HOME];
    let parts = arg.startsWith('/') ? [] : arg.startsWith('~') ? [...HOME] : [...cwd];
    for (const seg of arg.replace(/^~\/?/, '').split('/')) {
      if (!seg || seg === '.') continue;
      if (seg === '..') parts.pop(); else parts.push(seg);
    }
    return parts;
  }
  function node(parts) {
    let n = FS;
    for (const p of parts) { if (n && typeof n === 'object' && p in n) n = n[p]; else return undefined; }
    return n;
  }

  const out = $('#termOut');
  function print(html, cls = '') {
    const pre = document.createElement('pre');
    if (cls) pre.className = cls;
    pre.innerHTML = html;
    out.appendChild(pre);
    $('#termBody').scrollTop = $('#termBody').scrollHeight;
    return pre;
  }
  const printText = (t, cls) => print(esc(t), cls);
  function setPrompt() {
    $('#termPrompt').innerHTML = mode === 'vim' ? '<span class="t-dim">:</span>' : `guest@cookie:<b>${esc(pathStr(cwd))}</b>$`;
  }

  const COWSAY = t => {
    const line = t || '음메. 공부하세요.';
    const w = [...line].reduce((a, ch) => a + (/[\u1100-\uffff]/.test(ch) ? 2 : 1), 0);
    return ` ${'_'.repeat(w + 2)}\n< ${line} >\n ${'-'.repeat(w + 2)}\n        \\   ^__^\n         \\  (oo)\\_______\n            (__)\\       )\\/\\\n                ||----w |\n                ||     ||`;
  };
  const COOKIE_ART = [
    '      .-"""""-.     ',
    "    .'  o   .  '.   ",
    '   /  .    o    \\  ',
    '  |  o   .   .   | ',
    '  |   .    o   o | ',
    '   \\  o  .    . /  ',
    "    '.  .  o  .'   ",
    "      '-.....-'    ",
  ];

  const CMDS = {
    help() {
      print(`<span class="t-gold">쿠키 셸 0.1.4</span> — 쓸 수 있는 명령어\n
  <span class="t-cmd">ls</span> [-a] [경로]   <span class="t-cmd">cd</span> 경로   <span class="t-cmd">pwd</span>   <span class="t-cmd">cat</span> 파일   <span class="t-cmd">echo</span> 글자
  <span class="t-cmd">whoami</span>   <span class="t-cmd">date</span>   <span class="t-cmd">history</span>   <span class="t-cmd">clear</span>   <span class="t-cmd">neofetch</span>   <span class="t-cmd">top</span>
  <span class="t-cmd">fortune</span>   <span class="t-cmd">cowsay</span> 글자   <span class="t-cmd">ping</span> 호스트   <span class="t-cmd">base64</span> [-d] 글자
  <span class="t-cmd">unlock</span> 암호   <span class="t-cmd">sudo</span> …   <span class="t-cmd">git</span> …   <span class="t-cmd">vim</span>   <span class="t-cmd">sl</span>   <span class="t-cmd">matrix</span>   <span class="t-cmd">exit</span>
\n<span class="t-dim">목록에 없는 명령어도 몇 개 숨어 있습니다. rm -rf / 같은 건 치지 마세요. 정말로.</span>`);
    },
    ls(args) {
      const all = args.includes('-a') || args.includes('-la') || args.includes('-al');
      const target = args.find(a => !a.startsWith('-'));
      const n = node(resolve(target));
      if (n === undefined) return printText(`ls: '${target}'에 접근할 수 없음: 그런 파일이나 디렉터리가 없습니다`, 't-err');
      if (typeof n === 'string') return printText(target);
      const names = Object.keys(n).filter(k => all || !k.startsWith('.')).sort();
      const list = (all ? ['.', '..'] : []).concat(names);
      if (!list.length) return;
      print(list.map(k => {
        const v = k === '.' || k === '..' ? {} : n[k];
        return typeof v === 'object' ? `<span class="t-dir">${esc(k)}/</span>` : k.startsWith('.') ? `<span class="t-hid">${esc(k)}</span>` : esc(k);
      }).join('   '));
      if (all && names.includes('.secret') && !golds().terminal) print('<span class="t-dim">(…뭔가 수상한 파일이 보이네요)</span>');
    },
    cd(args) {
      const p = resolve(args[0]);
      const n = node(p);
      if (n === undefined) return printText(`cd: ${args[0]}: 그런 디렉터리가 없습니다`, 't-err');
      if (typeof n === 'string') return printText(`cd: ${args[0]}: 디렉터리가 아닙니다`, 't-err');
      if (p[0] === 'root') return printText('cd: /root: 허가 거부', 't-err');
      cwd = p;
    },
    pwd() { printText('/' + cwd.join('/')); },
    cat(args) {
      if (!args.length) return printText('cat: 파일 이름을 주세요. (고양이는 여기 없습니다 🐈)', 't-dim');
      for (const a of args) {
        const n = node(resolve(a));
        if (n === undefined) printText(`cat: ${a}: 그런 파일이나 디렉터리가 없습니다`, 't-err');
        else if (typeof n === 'object') printText(`cat: ${a}: 디렉터리입니다`, 't-err');
        else printText(n);
      }
    },
    echo(args) { printText(args.join(' ')); },
    whoami() { printText('guest  (합격하면 employee로 바뀝니다)'); },
    date() { printText(new Date().toString()); },
    history() { printText(hist.map((h, i) => `${String(i + 1).padStart(4)}  ${h}`).join('\n') || '(비어 있음)'); },
    clear() { out.innerHTML = ''; },
    fortune() { printText(pick(FORTUNES)); },
    cowsay(args) { printText(COWSAY(args.join(' '))); },
    neofetch() {
      const { browser, os } = parseUA();
      const info = [
        '<span class="t-gold">guest</span>@<span class="t-gold">cookie</span>',
        '-------------',
        `<span class="t-cmd">OS</span>: CookieOS 1.0 (on ${esc(os)})`,
        `<span class="t-cmd">Host</span>: ${esc(browser)}`,
        `<span class="t-cmd">Uptime</span>: ${Math.floor((Date.now() - live.start) / 1000)}초`,
        `<span class="t-cmd">Shell</span>: cookiesh 0.1.4`,
        `<span class="t-cmd">Resolution</span>: ${screen.width}x${screen.height}`,
        `<span class="t-cmd">CPU</span>: 코어 ${navigator.hardwareConcurrency || '?'}개 (대부분 자소서 생각 중)`,
        `<span class="t-cmd">Memory</span>: 외운 것 12% / 외워야 할 것 88%`,
        `<span class="t-cmd">Golden</span>: ${Object.keys(golds()).length} / 4`,
      ];
      print(COOKIE_ART.map((l, i) => `<span class="t-cmd">${esc(l)}</span>  ${info[i] || ''}`).join('\n') + (info.length > COOKIE_ART.length ? '\n' + info.slice(COOKIE_ART.length).map(s => ' '.repeat(22) + s).join('\n') : ''));
    },
    top() {
      print(`<span class="t-dim">  PID USER      %CPU  %MEM  COMMAND</span>
  101 guest     98.7  41.2  자소서_4번문항.exe
  202 guest     72.3  12.0  불안.service
  303 guest     33.1   8.4  유튜브_잠깐만.sh
  404 guest      0.0   0.0  운동 <span class="t-dim">(not found)</span>
  505 guest      0.1   0.1  잠 <span class="t-dim">(sleeping… 아니 안 자고 있음)</span>
 1337 cookie-m…  0.4   0.2  nom nom nom`);
    },
    async ping(args) {
      const host = args[0];
      if (!host) return printText('ping: 호스트를 주세요. 예) ping google.com', 't-dim');
      printText(`PING ${host}: 56 data bytes`);
      const far = /mars|moon|화성|달/.test(host);
      const crush = /crush|짝사랑|면접관|interviewer/.test(host);
      for (let i = 0; i < 4; i++) {
        await sleep(450);
        if (far) printText(`요청 시간 초과 (빛의 속도로도 몇 분 걸립니다)`, 't-err');
        else if (crush) printText(`요청 시간 초과 (읽었는데 답이 없습니다)`, 't-err');
        else printText(`64 bytes from ${host}: icmp_seq=${i} ttl=57 time=${(Math.random() * 30 + (host.includes('localhost') || host.startsWith('127.') ? 0.02 : 8)).toFixed(1)} ms`);
      }
      printText(`--- ${host} ping 통계 --- 4개 보냄, ${far || crush ? '0' : '4'}개 받음`, 't-dim');
    },
    base64(args) {
      const d = args[0] === '-d' || args[0] === '--decode';
      const s = (d ? args.slice(1) : args).join(' ');
      if (!s) return printText('사용법: base64 [-d] 글자', 't-dim');
      try {
        if (d) printText(new TextDecoder().decode(Uint8Array.from(atob(s), c => c.charCodeAt(0))));
        else printText(btoa(String.fromCharCode(...new TextEncoder().encode(s))));
      } catch { printText('base64: 올바른 입력이 아닙니다', 't-err'); }
    },
    unlock(args) {
      const pw = args.join(' ').trim();
      if (!pw) return printText('unlock: 암호를 입력하세요', 't-dim');
      if (pw === 'Y29va2llLW1vbnN0ZXI=') return printText('아깝다! 그건 아직 base64 그대로예요. 한 번 풀어야 합니다. (힌트: base64 -d)', 't-err');
      if (pw.toLowerCase() !== 'cookie-monster') return printText('🔒 금고가 꿈쩍도 하지 않습니다.', 't-err');
      print(`<span class="t-gold">🔓 철컥.
   _______________
  |  ___________  |
  | |           | |    쿠키 몬스터: "나의 쿠키를… 가져가라…"
  | |    🍪     | |
  | |___________| |
  |_______________|</span>`);
      setTimeout(() => awardGold('terminal'), 600);
    },
    sudo(args) {
      const what = args.join(' ');
      if (!what) return printText('usage: sudo 명령어', 't-dim');
      if (/합격|hire|pass/.test(what)) return print('<span class="t-err">[sudo] 권한 부족.</span> 합격은 root도 못 줍니다. 대신 <span class="t-ok">공부</span>는 guest도 할 수 있어요.');
      if (/make me a sandwich|샌드위치/.test(what)) return printText('알겠습니다. 🥪 (xkcd 149)', 't-ok');
      sudoTries++;
      if (sudoTries < 3) return printText(`[sudo] guest의 암호: \nguest은(는) sudoers 파일에 없습니다. 이 사건은 보고됩니다.`, 't-err');
      printText(`[보고서 #${sudoTries}]\n  수신: 산타클로스\n  제목: guest가 또 sudo를 시도함\n  조치: 올해 선물 목록에서 '합격'을 '공부 의지'로 교체`, 't-gold');
    },
    git(args) {
      const sub = args[0];
      if (sub === 'blame') return printText('모든 줄의 작성자: guest (당신입니다)', 't-gold');
      if (sub === 'status') return printText('On branch 취준\n변경 사항: 자소서.md (수정됨, 327번째)\n추적하지 않는 파일: 의욕', '');
      if (sub === 'push' && args.includes('--force')) return printText('오늘의 운세에 그러지 말라고 쓰여 있었을 텐데요.', 't-err');
      if (sub === 'commit') return printText('[취준 a1b2c3d] 오늘도 공부함\n 1 file changed, 1 insertion(+), 0 deletions(-)', 't-ok');
      if (sub === 'log') return printText('commit a1b2c3d  오늘도 공부함\ncommit 9f8e7d6  어제도 공부함\ncommit 0000001  Initial commit: 취준 시작', '');
      printText(`git: '${sub || ''}'은(는) 이 셸에서 지원하지 않습니다. blame, status, commit, log는 됩니다.`, 't-dim');
    },
    vim() {
      mode = 'vim';
      print(`<span class="t-dim">~\n~              VIM - Vi IMproved\n~\n~        여기서 나가는 방법을 아시나요?\n~        (전 세계 개발자 수백만 명이 아직 모릅니다)\n~</span>`);
    },
    exit() { printText('exit할 수 없습니다. 당신은 이미 이 연구소의 일부입니다. (그냥 다른 방 탭을 누르세요)', 't-dim'); },
    async sl() {
      const train = [
        '      ====        ________                ___________ ',
        '  _D _|  |_______/        \\__I_I_____===__|_________| ',
        '   |(_)---  |   H\\________/ |   |        =|___ ___|  ',
        '   /     |  |   H  |  |     |   |         ||_| |_||  ',
        '  |      |  |   H  |__--------------------| [___] |  ',
        '  | ________|___H__/__|_____/[][]~\\_______|       |  ',
        '  |/ |   |-----------I_____I [][] []  D   |=======|__',
        '__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__',
        ' |/-=|___|=    ||    ||    ||    |_____/~\\___/        ',
        '  \\_/      \\O=====O=====O=====O_/      \\_/            ',
      ];
      const pre = print('');
      const width = 70;
      for (let x = width; x > -train[0].length; x -= 3) {
        pre.textContent = train.map(l => (x >= 0 ? ' '.repeat(x) + l : l.slice(-x)).slice(0, width + 10)).join('\n');
        await sleep(45);
      }
      pre.textContent = '(sl: ls를 잘못 치셨군요. 기차가 지나갔습니다.)';
    },
    matrix() { startMatrix(); },
    async rm(args) {
      if (!(args.includes('-rf') || args.includes('-fr')) || !args.includes('/')) return printText('rm: 여기서는 아무것도 지울 수 없습니다. 불안은 빼고요.', 't-dim');
      const files = ['/bin/용기', '/etc/자신감.conf', '/home/guest/자소서_최종.md', '/usr/lib/libmotivation.so', '/var/log/공부기록', '/boot/의지'];
      for (const f of files) { printText(`removed '${f}'`, 't-err'); await sleep(260); }
      await sleep(500);
      printText('\n…농담입니다. 여긴 브라우저라 아무것도 안 지워졌어요.\n그래도 진짜 서버에서는 절대 치지 마세요. --no-preserve-root 없이도 충분히 위험합니다.', 't-gold');
    },
    man(args) { printText(args[0] ? `${args[0]}(1)에 대한 매뉴얼은 없습니다. help를 보세요. 아니면 그냥 해 보세요.` : '무엇의 매뉴얼을 원하시나요? 인생의 매뉴얼은 없습니다.', 't-dim'); },
    ssh(args) { printText(`ssh: connect to host ${args[0] || '?'} port 22: 쿠키만 통과할 수 있는 방화벽입니다`, 't-err'); },
    curl(args) { printText(args[0] ? `HTTP/1.1 418 I'm a teapot\n\n저는 찻주전자라 ${args[0]}에 요청할 수 없습니다.` : 'curl: URL을 주세요', args[0] ? 't-gold' : 't-dim'); },
    coffee() { printText("HTTP/1.1 418 I'm a teapot — 커피는 못 끓입니다. 차는 됩니다. 🍵", 't-gold'); },
    '42'() { printText('삶, 우주, 그리고 모든 것에 대한 답. 질문이 뭐였는지는 아무도 모릅니다.', 't-gold'); },
    nom() { printText('NOM NOM NOM 🍪  (쿠키 몬스터가 좋아합니다)', 't-gold'); },
    hello() { printText('안녕하세요! help를 입력해 보세요. 👋', 't-ok'); },
  };
  CMDS.dir = CMDS.ls; CMDS.type = CMDS.cat; CMDS.cls = CMDS.clear; CMDS.vi = CMDS.vim; CMDS.nano = () => printText('nano는 너무 쉬워서 이 연구소에선 금지입니다. vim을 써 보세요. (들어가면 못 나옵니다)', 't-dim');
  CMDS['안녕'] = CMDS.hello; CMDS.hi = CMDS.hello; CMDS.make = args => (args.join(' ').includes('coffee') ? CMDS.coffee() : printText('make: *** 타깃이 없습니다. 멈춤.', 't-err'));
  CMDS.brew = CMDS.make; CMDS.hire = () => CMDS.sudo(['hire']); CMDS['합격'] = CMDS.hire;

  function vimInput(line) {
    const l = line.trim();
    if ([':q!', ':wq', ':x', ':wq!', 'ZZ', ':qa!'].includes(l)) {
      mode = 'sh';
      const escaped = store.get('vimEscapes', 0) + 1;
      store.set('vimEscapes', escaped);
      printText(`vim을 빠져나왔습니다! 🎉 상위 ${Math.max(1, 40 - escaped * 3)}%의 개발자입니다.`, 't-ok');
    } else if (l === ':q') printText('E37: No write since last change (add ! to override)', 't-err');
    else if (l === 'exit' || l === 'quit' || l === 'q') printText('그건 vim 명령어가 아닙니다. 콜론(:)으로 시작해 보세요…', 't-err');
    else if (l === 'i') printText('-- INSERT -- (라고 뜨지만 여긴 가짜 vim이라 쓸 게 없습니다)', 't-dim');
    else if (l === ':help') printText('나가려면 :q! 를 입력하세요. 이 도움말을 찾은 당신은 상위 1%.', 't-dim');
    else printText(`E492: Not an editor command: ${l}`, 't-err');
  }

  async function run(line) {
    const raw = line.trim();
    print(`${$('#termPrompt').innerHTML} ${esc(line)}`);
    if (!raw) return;
    if (mode === 'vim') return vimInput(raw);
    hist.push(raw); store.set('termHist', hist.slice(-100)); hpos = hist.length;
    const [cmd, ...args] = raw.split(/\s+/);
    const fn = CMDS[cmd] || CMDS[cmd.toLowerCase()];
    if (!fn) {
      if (cmd === 'ㅣㄴ') return printText('한/영 전환을 안 하셨네요. ls 입니다.', 't-dim');
      return printText(`${cmd}: 명령어를 찾을 수 없습니다. help를 입력해 보세요.`, 't-err');
    }
    busy = true;
    try { await fn(args); } finally { busy = false; }
  }

  $('#termForm').addEventListener('submit', async e => {
    e.preventDefault();
    if (busy) return;
    const input = $('#termIn');
    const line = input.value;
    input.value = '';
    await run(line);
    setPrompt();
    $('#termBody').scrollTop = $('#termBody').scrollHeight;
  });
  $('#termIn').addEventListener('keydown', e => {
    const input = e.target;
    if (e.key === 'ArrowUp') { e.preventDefault(); if (hpos > 0) input.value = hist[--hpos]; }
    else if (e.key === 'ArrowDown') { e.preventDefault(); hpos = Math.min(hist.length, hpos + 1); input.value = hist[hpos] || ''; }
    else if (e.key === 'Tab') {
      e.preventDefault();
      const parts = input.value.split(' ');
      const last = parts[parts.length - 1];
      let cands;
      if (parts.length === 1) cands = Object.keys(CMDS).filter(c => c.startsWith(last));
      else {
        const slash = last.lastIndexOf('/');
        const dirArg = slash >= 0 ? last.slice(0, slash + 1) : '';
        const dir = node(resolve(dirArg || '.'));
        const base = last.slice(slash + 1);
        cands = dir && typeof dir === 'object' ? Object.keys(dir).filter(k => k.startsWith(base) && (base.startsWith('.') || !k.startsWith('.'))).map(k => dirArg + k + (typeof dir[k] === 'object' ? '/' : '')) : [];
      }
      if (cands.length === 1) { parts[parts.length - 1] = cands[0]; input.value = parts.join(' ') + (cands[0].endsWith('/') ? '' : ' '); }
      else if (cands.length > 1) printText(cands.join('   '), 't-dim');
    } else if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); out.innerHTML = ''; }
    else if (e.key === 'c' && e.ctrlKey && input.selectionStart === input.selectionEnd) {
      e.preventDefault();
      print(`${$('#termPrompt').innerHTML} ${esc(input.value)}^C`);
      input.value = '';
    }
  });
  $('#termBody').addEventListener('click', () => { if (!getSelection().toString()) $('#termIn').focus(); });

  function startMatrix() {
    const cv = $('#matrix');
    cv.hidden = false;
    const x = cv.getContext('2d');
    const W = cv.width = innerWidth, H = cv.height = innerHeight;
    const fs = 16, cols = Math.ceil(W / fs);
    const drops = Array.from({ length: cols }, () => Math.random() * -50);
    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ01쿠키🍪COOKIE{}<>/;'.split('');
    let raf;
    const tick = () => {
      x.fillStyle = 'rgba(0,0,0,0.08)'; x.fillRect(0, 0, W, H);
      x.font = fs + 'px monospace';
      drops.forEach((y, i) => {
        x.fillStyle = Math.random() > 0.975 ? '#ffcb47' : '#3cff7a';
        x.fillText(pick(chars), i * fs, y * fs);
        drops[i] = y * fs > H && Math.random() > 0.975 ? 0 : y + 1;
      });
      raf = requestAnimationFrame(tick);
    };
    tick();
    const stop = () => {
      cancelAnimationFrame(raf); cv.hidden = true;
      removeEventListener('keydown', stop); cv.removeEventListener('click', stop);
      printText('Wake up, guest… 빨간 약을 먹을 시간입니다. (공부하라는 뜻)', 't-ok');
      $('#termIn').focus();
    };
    setTimeout(() => { addEventListener('keydown', stop); cv.addEventListener('click', stop); }, 300);
  }

  /* ================= 4. 동의서 ================= */
  const DP = [
    { id: 'misdirection', name: '시선 유도 (Misdirection)', desc: '수락은 크고 초록색으로 반짝이고, 거부는 작고 회색이다.' },
    { id: 'obstruction', name: '방해 (Obstruction)', desc: '거부 버튼이 도망간다. 실제로는 여러 화면 뒤에 숨긴다.' },
    { id: 'confirmshaming', name: '죄책감 주기 (Confirmshaming)', desc: '거부하면 요정이 슬퍼한다고 말한다.' },
    { id: 'trick', name: '헷갈리는 질문 (Trick Question)', desc: '이중 부정으로 무엇을 누르면 뭐가 되는지 헷갈리게 만든다.' },
    { id: 'preselection', name: '미리 켜 둠 (Preselection)', desc: '"정당한 이익" 항목을 기본으로 모두 켜 두었다.' },
    { id: 'nagging', name: '되살리기 (Nagging)', desc: '꺼 둔 설정을 몰래 다시 켠다. 여러 번 묻는다.' },
    { id: 'roach', name: '바퀴벌레 모텔 (Roach Motel)', desc: '들어가는(수락) 길은 한 번, 나오는(거부) 길은 미로.' },
  ];
  const VENDORS = [
    '당신의 할머니 추적 주식회사', '마우스 흔들림 분석 LLC', '스크롤 속도 감별사', '새벽 3시 방문자 연구소', '탭 전환 감시단',
    '장바구니 포기 상담소', '글자 크기 선호도 협회', '다크 모드 사용자 연합', '키보드 소리 청취 랩', '복붙 추적 센터',
    '와이파이 이름 수집가', '배터리 잔량 걱정 재단', '광고 차단기 차단 컨소시엄', '무한 스크롤 후원회', '팝업 보존 협회',
    '쿠키의 쿠키 주식회사', '"관심 없음" 무시 전문', '위치 대략 추정단', '화면 밝기 감별소', '이모지 사용 통계청',
    '스타일 추천 알고리즘 17호', '마케팅 이메일 부활 센터', '구독 해지 방해 연구소', '"정당한 이익" 해석 위원회',
    '제3자의 제3자', '또 다른 파트너', '파트너의 친구', '이름을 밝힐 수 없는 파트너', '데이터 브로커 조합', '엄청나게 신뢰할 수 있는 회사',
  ];
  let cstate, cStart, dodges, vendorsOn, revived;
  function dpFound() { return store.get('dp', []); }
  function markDP(id) {
    const f = dpFound();
    if (!f.includes(id)) { f.push(id); store.set('dp', f); toast(`다크 패턴 발견: ${DP.find(d => d.id === id).name}`); }
    renderDP();
  }
  function renderDP() {
    const f = dpFound();
    $('#dpList').innerHTML = DP.map(d => `<li class="${f.includes(d.id) ? 'found' : ''}"><b>${f.includes(d.id) ? d.name : '???'}</b><span>${d.desc}</span></li>`).join('');
    $('#dpCount').textContent = `${f.length} / ${DP.length}`;
  }
  const ov = () => $('#consentOverlay');

  function consentStart() {
    cStart = Date.now(); dodges = 0; revived = false;
    vendorsOn = VENDORS.map(() => true);
    $('#fakeSite').classList.remove('clear');
    showBanner();
    setTimeout(() => markDP('misdirection'), 1500);
  }
  function showBanner(note) {
    cstate = 'banner';
    ov().innerHTML = `<div class="cbox">
      <h4>🍪 우리는 당신의 경험을 소중히 여깁니다</h4>
      <p>저희와 <b>${VENDORS.length * 8 + 7}개</b>의 신뢰할 수 있는 파트너는 더 나은 경험, 맞춤형 광고, 콘텐츠 측정, 그리고 당신도 모르는 다양한 목적을 위해 쿠키를 사용합니다.</p>
      <div class="legal">본 동의는 "수락"을 누르는 즉시, 또는 이 창을 바라보는 즉시, 또는 이 문장을 읽는 즉시 유효합니다. 당신의 데이터는 당신의 데이터이지만, 우리의 파트너의 파트너에게도 당신의 데이터입니다. 자세한 내용은 쿠키 정책 부록 C의 별첨 7을 참고하세요. 별첨 7은 현재 작성 중입니다.</div>
      ${note ? `<div class="cnote">${note}</div>` : ''}
      <div class="cbtns" id="cbtns">
        <button class="c-accept" id="cAccept">모두 수락하고 멋진 경험 시작하기 ✨</button>
        <button class="c-link" id="cManage">설정 관리</button>
        <button class="c-reject" id="cReject">거부</button>
      </div></div>`;
    $('#cAccept').onclick = accepted;
    $('#cManage').onclick = showManage;
    const rej = $('#cReject');
    const run = e => {
      if (dodges >= 7) { rej.textContent = '거부 (지쳤음)'; return; }
      if (e.type === 'pointerdown' && e.pointerType === 'mouse') return;
      e.preventDefault();
      dodges++;
      const box = $('#cbtns').getBoundingClientRect();
      rej.classList.add('run');
      rej.style.left = Math.random() * Math.max(0, box.width - 90) + 'px';
      rej.style.top = (Math.random() * 60 - 30) + 'px';
      if (dodges === 2) markDP('obstruction');
      if (dodges === 7) { rej.textContent = '거부 (지쳤음)'; toast('거부 버튼이 도망치다 지쳤습니다.'); }
    };
    rej.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') run(e); });
    rej.addEventListener('pointerdown', run);
    // 키보드(detail 0)로 누르면 바로 통과. 터치 기기는 세 번만 도망간다
    rej.addEventListener('click', e => { if (dodges >= 7 || e.detail === 0) showShame(); });
    if (!matchMedia('(hover: hover)').matches) dodges = Math.max(dodges, 4);
  }
  function showShame() {
    cstate = 'shame';
    markDP('confirmshaming');
    ov().innerHTML = `<div class="cbox center">
      <h4>정말 거부하시겠어요? 🥺</h4>
      <p>쿠키를 거부하면 저희 쿠키 요정 347명이 오늘 밤 굶게 됩니다. 요정들은 당신을 믿었어요.</p>
      <div class="cbtns">
        <button class="c-accept" id="cBack">아니요, 요정을 지키겠습니다 (수락)</button>
        <button class="c-link" id="cCruel">예, 저는 요정을 굶기는 사람입니다</button>
      </div></div>`;
    $('#cBack').onclick = accepted;
    $('#cCruel').onclick = showTrick;
  }
  function showTrick() {
    cstate = 'trick';
    markDP('trick');
    ov().innerHTML = `<div class="cbox center">
      <h4>확인</h4>
      <p style="font-size:15px;color:#222">쿠키 거부 요청을 <b>취소하지 않으려면</b> '아니요'를 <b>누르지 마세요</b>.</p>
      <div class="cbtns">
        <button class="c-plain" id="cYes">예</button>
        <button class="c-plain" id="cNo">아니요</button>
      </div></div>`;
    $('#cYes').onclick = showManage;
    $('#cNo').onclick = () => { markDP('nagging'); showBanner('거부 요청이 취소되었습니다. 다시 생각해 보셨군요! 😊 (\'아니요\'를 누르면 취소됩니다)'); };
  }
  function showManage() {
    cstate = 'manage';
    markDP('preselection');
    ov().innerHTML = `<div class="cbox center">
      <h4>개인정보 설정 센터</h4>
      <div class="cats">
        <div class="cat"><div>필수 쿠키<small>사이트 작동에 꼭 필요합니다</small></div><button class="sw on" disabled></button></div>
        <div class="cat"><div>성능 · 분석<small>얼마나 오래 망설였는지 측정합니다</small></div><button class="sw on" data-sw></button></div>
        <div class="cat"><div>맞춤형 광고<small>당신보다 당신을 잘 압니다</small></div><button class="sw on" data-sw></button></div>
      </div>
      <p style="margin:10px 0 0"><b>정당한 이익</b> <span style="color:#999">(동의가 아니므로 기본으로 켜져 있습니다. 파트너 ${VENDORS.length}곳)</span></p>
      <div class="vendors" id="vendors"></div>
      <div id="cmNote"></div>
      <div class="cbtns">
        <button class="c-plain" id="cAllOff">정당한 이익 모두 반대</button>
        <button class="c-accept" id="cAcceptAll" style="flex:0 1 auto;padding:10px 14px;font-size:13px">모두 허용</button>
        <button class="c-primary" id="cSave" disabled>선택 저장</button>
      </div></div>`;
    renderVendors();
    $$('[data-sw]').forEach(b => b.onclick = () => { b.classList.toggle('on'); checkSave(); });
    $('#cAcceptAll').onclick = accepted;
    $('#cAllOff').onclick = async () => {
      const btn = $('#cAllOff');
      btn.disabled = true; btn.textContent = '처리 중… (파트너 서버에 한 곳씩 문의 중)';
      for (let i = 0; i < VENDORS.length; i++) {
        if (cstate !== 'manage') return;
        vendorsOn[i] = false; renderVendors(i);
        await sleep(90);
      }
      btn.textContent = '정당한 이익 모두 반대'; btn.disabled = false;
      if (!revived) {
        revived = true;
        await sleep(700);
        if (cstate !== 'manage') return;
        const back = [3, 11, 23];
        back.forEach(i => { vendorsOn[i] = true; });
        renderVendors(back);
        markDP('nagging');
        $('#cmNote').innerHTML = '<div class="cnote">⚠️ 파트너 3곳이 "정당한 이익"을 근거로 다시 켜졌습니다. 목록을 확인하세요.</div>';
      }
      checkSave();
    };
    $('#cSave').onclick = showCaptcha;
    checkSave();
  }
  function renderVendors(flash) {
    const fl = new Set([].concat(flash ?? []));
    $('#vendors').innerHTML = VENDORS.map((v, i) => `<div class="vendor ${fl.has(i) ? 'flash' : ''}"><span>${esc(v)}</span><button class="sw ${vendorsOn[i] ? 'on' : ''}" data-v="${i}"></button></div>`).join('');
    $$('#vendors [data-v]').forEach(b => b.onclick = () => { vendorsOn[+b.dataset.v] = !vendorsOn[+b.dataset.v]; renderVendors(); checkSave(); });
  }
  function checkSave() {
    const save = $('#cSave');
    if (!save) return;
    const ok = vendorsOn.every(v => !v) && $$('[data-sw]').every(b => !b.classList.contains('on'));
    save.disabled = !ok;
    save.title = ok ? '' : '모든 항목을 꺼야 저장할 수 있습니다';
  }
  function showCaptcha() {
    cstate = 'captcha';
    const tiles = ['🍪', '🍩', '🥠', '🧇', '🍪', '🥐', '🍘', '🍪', '🥯'];
    const cookies = new Set([0, 2, 4, 7]); // 포춘쿠키도 쿠키다
    const sel = new Set();
    ov().innerHTML = `<div class="cbox center">
      <h4>🤖 로봇이 아님을 증명하세요</h4>
      <p>쿠키를 거부하는 건 보통 로봇이라서요. <b>쿠키가 아닌</b> 칸을 모두 고르세요.</p>
      <div class="captcha" id="captcha">${tiles.map((t, i) => `<button data-i="${i}">${t}</button>`).join('')}</div>
      <div id="capNote"></div>
      <div class="cbtns"><button class="c-primary" id="capOk" style="margin-left:auto">확인</button></div></div>`;
    $('#captcha').onclick = e => {
      const b = e.target.closest('button'); if (!b) return;
      const i = +b.dataset.i;
      sel.has(i) ? sel.delete(i) : sel.add(i);
      b.classList.toggle('sel');
    };
    $('#capOk').onclick = () => {
      const want = [...tiles.keys()].filter(i => !cookies.has(i));
      const right = want.every(i => sel.has(i)) && [...sel].every(i => !cookies.has(i));
      if (right) return rejected();
      const note = sel.has(2) ? '포춘쿠키 🥠도 쿠키입니다. 이름에 쿠키가 들어가잖아요.' : [...sel].some(i => tiles[i] === '🍪') ? '그건 누가 봐도 쿠키입니다.' : '빠뜨린 칸이 있어요. 와플 🧇, 도넛 🍩, 크루아상 🥐, 센베 🍘, 베이글 🥯…';
      $('#capNote').innerHTML = `<div class="cnote">틀렸습니다. ${note}</div>`;
    };
  }
  function rejected() {
    cstate = 'done';
    const sec = ((Date.now() - cStart) / 1000).toFixed(1);
    markDP('roach');
    $('#fakeSite').classList.add('clear');
    ov().innerHTML = `<div class="cbox center" style="text-align:center">
      <h4>✅ 모든 쿠키를 거부했습니다</h4>
      <p>걸린 시간 <b>${sec}초</b>. 수락은 0.4초면 됐을 거예요. 이 차이가 바로 동의서가 이렇게 생긴 이유입니다.</p>
      <p style="font-size:12px;color:#888">실제로 유럽 GDPR 가이드라인은 거부를 수락만큼 쉽게 만들라고 요구합니다. 잘 안 지켜지지만요.</p>
      <div class="cbtns" style="justify-content:center"><button class="c-plain" id="cClose">기사 읽기</button></div></div>`;
    $('#cClose').onclick = () => { ov().innerHTML = ''; };
    setTimeout(() => awardGold('consent'), 900);
  }
  function accepted() {
    cstate = 'accepted';
    markDP('roach');
    rain(70, ['👁️', '📡', '🕵️', '📊', '🍪']);
    ov().innerHTML = `<div class="cbox center" style="text-align:center">
      <h4>감사합니다! 🎉</h4>
      <p>당신의 데이터가 <b>${VENDORS.length * 8 + 7}개</b> 파트너와 공유되었습니다. 걸린 시간 ${((Date.now() - cStart) / 1000).toFixed(1)}초. 역시 수락은 빠르죠.</p>
      <p style="font-size:12px;color:#888">임무는 "모두 거부"였습니다. 황금 쿠키는 거부 끝에 있어요.</p>
      <div class="cbtns" style="justify-content:center"><button class="c-primary" id="cRetry">다시 도전</button></div></div>`;
    $('#cRetry').onclick = consentStart;
  }
  $('#consentReset').addEventListener('click', consentStart);

  /* ================= 시작 ================= */
  const ENTER = {
    fortune() { prepCookie(); renderFortuneLog(); },
    lab() {
      if (!golds().lab && !readCookies().some(c => c.name === 'golden_crumb')) {
        document.cookie = `golden_crumb=${encodeURIComponent('먹어 보세요')}; Max-Age=31536000; Path=${COOKIE_PATH}; SameSite=Lax`;
      }
      const fp = canvasFingerprint();
      fpShort = fp.slice(0, 4).toUpperCase();
      $('#fpHash').textContent = fp.match(/.{4}/g).join('-');
      drawIdenticon(fp);
      renderFacts();
      renderLive(); renderJar();
      setInterval(() => { if ($('#room-lab').classList.contains('show')) { renderLive(); renderJar(); } }, 500);
    },
    terminal() {
      setPrompt();
      print(`<span class="t-gold">CookieOS 1.0</span> <span class="t-dim">(tty1)</span>\n${esc(FS.etc.motd)}\n\n마지막 로그인: ${esc(new Date(store.get('lastLogin', Date.now())).toLocaleString('ko-KR'))}\n<span class="t-dim">처음이라면 cat readme.txt</span>\n`);
      store.set('lastLogin', Date.now());
    },
    consent() { renderDP(); consentStart(); },
  };

  store.set('visits', store.get('visits', 0) + 1);
  if (!store.get('firstSeen', null)) store.set('firstSeen', Date.now());
  fpShort = canvasFingerprint().slice(0, 4).toUpperCase();
  renderGold();
  go(location.hash.slice(1) || 'fortune');
  console.log('%c🍪 쿠키 연구소', 'font-size:20px;font-weight:bold;color:#e0a867', '\n개발자 도구까지 열어 보셨군요. 여기엔 황금 쿠키가 없습니다. 하지만 Application → Cookies에는…?');
})();
