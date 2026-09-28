import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

// 홈 오른쪽 아래의 작은 "오늘의 운세". 생년월일과 오늘 날짜로 시드를 만들어서
// 같은 날 같은 생일이면 하루 종일 같은 운세가 나온다. 생일은 이 브라우저(localStorage)에만 둔다.
const KEY = 'daily-fortune-birth';

const ZODIAC = ['원숭이', '닭', '개', '돼지', '쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양'];
const ZODIAC_EMOJI = ['🐒', '🐓', '🐕', '🐖', '🐭', '🐂', '🐅', '🐇', '🐉', '🐍', '🐎', '🐑'];
// [끝나는 월, 끝나는 일, 이름] — 그 날짜까지가 해당 별자리
const SIGNS = [
  [1, 19, '염소자리'], [2, 18, '물병자리'], [3, 20, '물고기자리'], [4, 19, '양자리'], [5, 20, '황소자리'], [6, 21, '쌍둥이자리'],
  [7, 22, '게자리'], [8, 22, '사자자리'], [9, 22, '처녀자리'], [10, 23, '천칭자리'], [11, 22, '전갈자리'], [12, 21, '사수자리'], [12, 31, '염소자리'],
];

const TOTAL = [
  ['막혔던 개념이 갑자기 풀리는 날입니다. 어제 포기한 문제를 다시 펴 보세요.', 5],
  ['집중력이 평소의 두 배입니다. 휴대폰은 다른 방에 두면 세 배가 됩니다.', 5],
  ['작은 실수가 큰 깨달음으로 이어집니다. 틀린 문제를 그냥 넘기지 마세요.', 4],
  ['귀인이 스터디 단톡방에 나타납니다. 모르는 건 오늘 물어보세요.', 4],
  ['꾸준함이 빛을 보는 날. 거창한 계획보다 딱 한 세트만 끝내도 충분합니다.', 4],
  ['평범하지만 단단한 하루입니다. 복습하기 가장 좋은 날이에요.', 3],
  ['컨디션이 들쭉날쭉합니다. 어려운 과목은 오전에, 쉬운 과목은 오후에.', 3],
  ['생각이 많아지는 날입니다. 고민은 종이에 적고, 손은 문제를 푸세요.', 3],
  ['조금 느슨해지기 쉬운 날. 타이머를 25분만 맞추고 시작해 보세요.', 2],
  ['의욕이 바닥이어도 괜찮습니다. 오늘은 오답노트 다시 보기만 해도 이득입니다.', 2],
];
const STUDY_TIP = [
  '새로운 단원보다 이미 본 단원을 한 번 더 보는 게 남는 날입니다.',
  '소리 내어 설명해 보세요. 설명이 막히는 곳이 오늘의 약점입니다.',
  '시간을 재고 풀어 보세요. 실전 감각이 붙는 날입니다.',
  '한 문제에 10분 넘게 붙잡지 마세요. 표시해 두고 넘어가는 게 운을 부릅니다.',
  '처음 보는 유형이 나와도 당황하지 마세요. 소거법이 오늘의 무기입니다.',
  '공부 장소를 바꿔 보세요. 새 자리가 새 집중력을 줍니다.',
  '암기 과목은 자기 전에 10분. 오늘 밤 외운 건 오래 갑니다.',
  '친구와 문제를 하나씩 내 주세요. 가르치면서 두 배로 기억합니다.',
];
const SUBJECTS = ['자료구조', '알고리즘', '운영체제', '네트워크', '데이터베이스', '컴퓨터구조', '소프트웨어공학', '정보보안', 'NCS 의사소통', 'NCS 수리', 'NCS 문제해결', '인적성 추리'];
const TIMES = ['아침 7~9시', '오전 10~12시', '점심 직후', '오후 2~4시', '해 질 녘', '저녁 8~10시', '밤 10~12시'];
const COLORS = [['남색', '#4f46e5'], ['민트', '#10b981'], ['코랄', '#f97316'], ['라벤더', '#8b5cf6'], ['하늘색', '#0ea5e9'], ['버건디', '#be123c'], ['머스터드', '#ca8a04'], ['회색', '#64748b']];
const ITEMS = ['샤프 0.5', '형광펜', '포스트잇', '따뜻한 차', '이어폰', '초콜릿 한 조각', '물 한 병', '손목시계'];

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
// 시드 하나로 여러 값을 뽑는 작은 난수 생성기 (mulberry32)
function rng(seed) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

function makeFortune(birth) {
  const [y, m, d] = birth.split('-').map(Number);
  const now = new Date();
  const age = now.getFullYear() - y - ((now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d)) ? 1 : 0);
  const sign = SIGNS.find(([em, ed]) => m < em || (m === em && d <= ed))[2];
  const r = rng(hash(birth + '|' + todayStr()));
  const pick = a => a[Math.floor(r() * a.length)];
  const [msg, stars] = pick(TOTAL);
  const bar = () => 40 + Math.floor(r() * 61);
  return {
    age, sign,
    zodiac: `${ZODIAC_EMOJI[y % 12]} ${ZODIAC[y % 12]}띠`,
    msg, stars,
    bars: [['공부운', bar()], ['시험운', bar()], ['집중력', bar()]],
    tip: pick(STUDY_TIP),
    subject: pick(SUBJECTS),
    number: 1 + Math.floor(r() * 45),
    time: pick(TIMES),
    color: pick(COLORS),
    item: pick(ITEMS),
    birthday: m === now.getMonth() + 1 && d === now.getDate(),
  };
}

export default function DailyFortune() {
  const [open, setOpen] = useState(false);
  const [birth, setBirth] = useState(() => { try { return localStorage.getItem(KEY) || ''; } catch { return ''; } });
  const [draft, setDraft] = useState(birth);
  const [editing, setEditing] = useState(!birth);
  const boxRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = e => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); };
    const onKey = e => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('pointerdown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);

  const max = todayStr();
  const valid = /^\d{4}-\d{2}-\d{2}$/.test(draft) && draft >= '1900-01-01' && draft <= max;

  function submit(e) {
    e.preventDefault();
    if (!valid) return;
    try { localStorage.setItem(KEY, draft); } catch { /* 저장 못 해도 이번엔 보여 준다 */ }
    setBirth(draft);
    setEditing(false);
  }

  const f = birth && !editing ? makeFortune(birth) : null;
  const today = new Date();

  return (
    <div className="fortune-door" ref={boxRef}>
      {open && (
        <div className="fortune-pop" role="dialog" aria-label="오늘의 운세">
          <div className="fortune-head">
            <b>🔮 오늘의 운세</b>
            <span>{today.getMonth() + 1}월 {today.getDate()}일</span>
          </div>

          {!f ? (
            <form onSubmit={submit} className="fortune-form">
              <label htmlFor="fortune-birth">생년월일을 알려 주세요</label>
              <input id="fortune-birth" type="date" value={draft} max={max} min="1900-01-01" onChange={e => setDraft(e.target.value)} autoFocus />
              <button type="submit" disabled={!valid}>운세 보기</button>
              <p className="fortune-note">생일은 이 브라우저에만 저장됩니다.</p>
            </form>
          ) : (
            <div className="fortune-body">
              {f.birthday && <p className="fortune-bday">🎂 생일 축하합니다! 오늘은 무엇이든 잘 풀립니다.</p>}
              <p className="fortune-who">{f.zodiac} · {f.sign} · 만 {f.age}세</p>
              <p className="fortune-stars" aria-label={`별 ${f.stars}개`}>{'★'.repeat(f.stars)}<span>{'★'.repeat(5 - f.stars)}</span></p>
              <p className="fortune-msg">{f.msg}</p>
              <div className="fortune-bars">
                {f.bars.map(([k, v]) => (
                  <div key={k}><span>{k}</span><i><b style={{ width: v + '%' }} /></i><em>{v}</em></div>
                ))}
              </div>
              <dl className="fortune-lucky">
                <dt>행운의 과목</dt><dd>{f.subject}</dd>
                <dt>행운의 시간</dt><dd>{f.time}</dd>
                <dt>행운의 숫자</dt><dd>{f.number}</dd>
                <dt>행운의 색</dt><dd><i style={{ background: f.color[1] }} />{f.color[0]}</dd>
                <dt>행운의 물건</dt><dd>{f.item}</dd>
              </dl>
              <p className="fortune-tip">💡 {f.tip}</p>
              <div className="fortune-foot">
                <Link to="/exam" onClick={() => setOpen(false)}>운 믿고 풀러 가기 →</Link>
                <button type="button" onClick={() => { setDraft(birth); setEditing(true); }}>생일 바꾸기</button>
              </div>
              <p className="fortune-note">재미로 보세요. 합격은 운보다 오답노트가 정합니다.</p>
            </div>
          )}
        </div>
      )}
      <button type="button" className="fortune-toggle" onClick={() => setOpen(o => !o)} aria-expanded={open}><span>🔮</span>오늘의 운세</button>
    </div>
  );
}
