import { lazy, Suspense, useEffect, useState, useSyncExternalStore } from 'react';
import { Link } from 'react-router-dom';
import { account, onAccountChange } from '../sync';
import { visitorId } from '../track';
import { useMembership, TIER_NAMES } from '../membership';
import { factForDay, koreanDay } from '../data/todayCs';
import { quoteForDay } from '../data/quotes';
import TierBadge from '../components/TierBadge';
import './Main.css';

// 나의쿠키 메인 — 웹 우선 배치.
// 데스크톱: 왼쪽 콘텐츠(오늘의 학습 · CS·면접 · 실전 문제집) + 오른쪽 사이드바(내 정보 · 순위 · 코딩테스트).
// 휴대폰: 한 줄로 쌓는다(내 정보 → 콘텐츠 → 순위). 디자인 토큰 · 부품은 styles/ds.css.

// 순위는 문제은행 데이터를 함께 쓰므로 따로 불러와 첫 화면을 가볍게 둔다
const SolveRank = lazy(() => import('../components/SolveRank'));

const CODING_SITES = [
  { name: '백준', desc: '단계별 · 알고리즘 분류별', tag: 'BOJ', tone: 'brand', href: 'https://www.acmicpc.net/' },
  { name: '프로그래머스', desc: '기업 코딩테스트 기출', tag: 'PG', tone: 'night', href: 'https://school.programmers.co.kr/learn/challenges' },
  { name: '코드트리', desc: '커리큘럼 따라 차근차근', tag: 'CT', tone: 'green', href: 'https://www.codetree.ai/' },
  { name: '리트코드', desc: '해외 기업 인터뷰 문제', tag: 'LC', tone: 'yellow', href: 'https://leetcode.com/problemset/' },
];
const CS_TRACKS = [
  { to: '/notes', icon: '📚', tone: '', name: '전공노트', desc: '운영체제 · 네트워크 · DB · 자료구조', key: 'notes' },
  { to: '/web-essentials', icon: '🌐', tone: 'green', name: '웹 필수지식', desc: 'HTTP · 쿠키 · 세션 · JWT · CORS 57문답' },
  { to: '/topics', icon: '🧩', tone: 'cookie', name: '주제별 통합 문제집', desc: '과목별로 모아 풀고 오답 다시 풀기' },
  { to: '/interview', icon: '🎥', tone: 'red', name: '면접 공통질문 연습', desc: '카메라로 자기소개 · 지원동기 연습' },
];
const PRACTICE = [
  { to: '/exam', icon: '🏢', name: '기업별 전공필기', desc: '기업별 예상문제 · 모의고사' },
  { to: '/duel', icon: '⚔️', name: '실시간 대결', desc: '같은 10문제로 1:1 · 단체전' },
  { to: '/aptitude', icon: '🧠', name: 'NCS · 인적성', desc: '기업별 인적성 · NCS' },
  { to: '/calc', icon: '🧮', name: '계산 문제 무한 연습', desc: '서브넷 · 페이지 교체 등' },
  { to: '/bug-hunt', icon: '🐞', name: '버그 찾기', desc: '코드에서 버그 찾기' },
  { to: '/weak', icon: '↺', name: '오답 다시 풀기', desc: '틀린 문제만 모아서' },
];
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const TODAY_GOAL = 5;
const tokenSnapshot = () => account()?.token || '';

// 오늘의 CS 5문제 중 몇 개를 풀었는지(오늘의 CS가 쓰는 저장 위치를 읽기만 한다)
function readTodayDone(day) {
  const identity = account() ? `account:${account().id || account().token}` : `visitor:${visitorId()}`;
  try {
    const saved = JSON.parse(localStorage.getItem(`today-cs:v1:${day}:${identity}`));
    return saved && typeof saved === 'object' ? Math.min(TODAY_GOAL, Object.keys(saved).length) : 0;
  } catch { return 0; }
}

// 마지막으로 풀다 만 문제(또는 최근 본 문제집)
function readContinue() {
  const visible = to => typeof to === 'string' && !/^\/(ssafy|exam\/ssafy)/.test(to);
  try {
    let best = null;
    for (const key of Object.keys(localStorage)) {
      if (!key.startsWith('exam-resume:')) continue;
      try {
        const r = JSON.parse(localStorage.getItem(key));
        if (visible(r?.to) && Array.isArray(r.ids) && (!best || (r.at || 0) > (best.at || 0))) best = r;
      } catch { /* 깨진 항목은 건너뛴다 */ }
    }
    if (best) {
      const answered = Object.keys(best.answers || {}).length;
      return { to: `${best.to}?resume=1`, name: best.name, detail: `${answered} / ${best.ids.length} 답변`, pct: Math.round(answered / best.ids.length * 100) };
    }
    const last = JSON.parse(localStorage.getItem('exam:last'));
    if (visible(last?.to) && last.name) return { to: last.to, name: last.name, detail: '최근에 본 문제집' };
  } catch { /* 저장소를 못 쓰면 없음 */ }
  return null;
}

function Ring({ value, max }) {
  const r = 22, c = 2 * Math.PI * r, pct = max ? Math.min(1, value / max) : 0;
  return (
    <svg className="mn-ring" viewBox="0 0 56 56" role="img" aria-label={`오늘의 CS ${value} / ${max}`}>
      <circle cx="28" cy="28" r={r} className="mn-ring-track" />
      <circle cx="28" cy="28" r={r} className="mn-ring-fill" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} />
      <text x="28" y="33" textAnchor="middle">{value}/{max}</text>
    </svg>
  );
}

function SectionHead({ id, title, to, label = '전체 보기' }) {
  return (
    <div className="mn-section-head">
      <h2 id={id}>{title}</h2>
      {to && <Link to={to}>{label} <span aria-hidden="true">›</span></Link>}
    </div>
  );
}

export default function Main() {
  useSyncExternalStore(onAccountChange, tokenSnapshot, () => '');
  const user = account();
  const { membership } = useMembership();
  const [learning, setLearning] = useState(null);
  const [resume] = useState(readContinue);
  const day = koreanDay();
  const today = factForDay(day);
  const quote = quoteForDay(day);
  const [todayDone] = useState(() => readTodayDone(day));
  const now = new Date();
  const dateLabel = `${now.getMonth() + 1}월 ${now.getDate()}일 ${WEEKDAYS[now.getDay()]}요일`;

  useEffect(() => {
    let alive = true;
    import('../learningStats')
      .then(m => { if (alive) setLearning({ ...m.collectLearning(account()), notesTotal: m.NOTES_TOTAL }); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  return (
    <div className="mn">
      <figure className="mn-quote">
        <q>{quote.text}</q>
        {quote.author && <cite>{quote.author}</cite>}
      </figure>

      <div className="mn-layout">
        {/* ---------- 사이드바 위: 내 정보 ---------- */}
        <aside className="mn-me-wrap" aria-label="내 정보">
          <section className="ds-card mn-me">
            <p className="ds-caption">{dateLabel}</p>
            <h1 className="mn-greet">{user?.nickname ? <>{user.nickname}님,<br />오늘 할 공부예요</> : <>개발자 취업 준비,<br />오늘은 여기서 시작해요</>}</h1>
            <div className="mn-chips">
              {membership && <Link to="/account" className="ds-chip"><TierBadge tier={membership.tier} division={membership.division} />{TIER_NAMES[membership.tier]}</Link>}
              <Link to="/stats" className="ds-chip"><span aria-hidden="true">🔥</span>{learning ? `${learning.streak}일 연속` : '연속 학습'}</Link>
            </div>
            <Link to="/cs" className="mn-goal">
              <Ring value={todayDone} max={TODAY_GOAL} />
              <span>
                <small className="ds-caption">오늘의 목표</small>
                <b>{todayDone >= TODAY_GOAL ? '오늘 목표 달성! 🎉' : `오늘의 CS ${TODAY_GOAL - todayDone}문제 남았어요`}</b>
              </span>
            </Link>
            <div className="mn-stats">
              <div className="ds-stat"><b>{learning ? learning.week : '–'}</b><span>이번 주</span></div>
              <div className="ds-stat"><b>{learning?.rate ?? '–'}{learning?.rate != null && <em>%</em>}</b><span>정답률</span></div>
              <div className="ds-stat"><b>{learning ? learning.solved.toLocaleString() : '–'}</b><span>누적 풀이</span></div>
            </div>
            <Link to="/stats" className="ds-btn ds-btn--secondary mn-me-btn">내 학습 보기</Link>
          </section>
        </aside>

        {/* ---------- 왼쪽 콘텐츠 ---------- */}
        <div className="mn-content">
          <section aria-labelledby="mn-today-title">
            <SectionHead id="mn-today-title" title="오늘의 학습" />
            <div className="mn-hero">
              <Link to="/cs" className="ds-card ds-card--brand mn-today">
                <span className="ds-badge ds-badge--glass">오늘의 CS</span>
                <h3>{today.t}</h3>
                <p className="ds-clamp-2">{today.s}</p>
                <span className="mn-go">오늘의 5문제 풀기 <span aria-hidden="true">→</span></span>
                <span className="mn-cookie" aria-hidden="true">🍪</span>
              </Link>
              <div className="mn-hero-side">
                <Link to={resume?.to || '/exam'} className="ds-card mn-row-card">
                  <span className="ds-icon ds-icon--sm" aria-hidden="true">▶</span>
                  <span className="mn-row-text">
                    <small className="ds-caption">{resume ? '이어서 하기' : '처음이라면'}</small>
                    <b>{resume ? resume.name : '실전 문제부터 풀어 봐요'}</b>
                    {resume?.pct != null && <span className="ds-bar"><i style={{ width: `${Math.max(resume.pct, 4)}%` }} /></span>}
                  </span>
                </Link>
                <Link to="/weak" className="ds-card mn-row-card">
                  <span className="ds-icon ds-icon--sm ds-icon--red" aria-hidden="true">↺</span>
                  <span className="mn-row-text">
                    <small className="ds-caption">다시 풀기</small>
                    <b>{learning?.wrongOpen ? `틀린 문제 ${learning.wrongOpen}개` : '남은 오답이 없어요'}</b>
                    <small className="ds-text-3">{learning?.weak?.[0] ? `약한 주제 · ${learning.weak[0].name} ${learning.weak[0].rate}%` : '풀수록 약한 주제를 알려 드려요'}</small>
                  </span>
                </Link>
                <Link to="/duel" className="ds-card ds-card--night mn-row-card">
                  <span className="mn-duel-icon" aria-hidden="true">⚔️</span>
                  <span className="mn-row-text">
                    <span className="ds-badge ds-badge--glass ds-badge--live">LIVE</span>
                    <b>같은 10문제로 지금 대결</b>
                  </span>
                </Link>
              </div>
            </div>
          </section>

          <section aria-labelledby="mn-cs-title">
            <SectionHead id="mn-cs-title" title="CS · 면접" to="/cs" />
            <div className="mn-cats">
              {CS_TRACKS.map(t => (
                <Link key={t.to} to={t.to} className="mn-cat">
                  <span className={`ds-icon${t.tone ? ` ds-icon--${t.tone}` : ''}`} aria-hidden="true">{t.icon}</span>
                  <span className="mn-cat-text">
                    <b>{t.name}</b>
                    <small>{t.key === 'notes' && learning ? `${learning.notesDone} / ${learning.notesTotal} 완료 · ` : ''}{t.desc}</small>
                  </span>
                  <span className="mn-chev" aria-hidden="true">›</span>
                </Link>
              ))}
            </div>
          </section>

          <section aria-labelledby="mn-practice-title">
            <SectionHead id="mn-practice-title" title="실전 문제집" to="/exam" />
            <div className="mn-cats mn-cats--3">
              {PRACTICE.map(p => (
                <Link key={p.to} to={p.to} className="mn-cat">
                  <span className="ds-icon ds-icon--cookie" aria-hidden="true">{p.icon}</span>
                  <span className="mn-cat-text"><b>{p.name}</b><small>{p.desc}</small></span>
                  <span className="mn-chev" aria-hidden="true">›</span>
                </Link>
              ))}
            </div>
          </section>

          <Link to="/intro" className="mn-intro">
            <span className="mn-intro-art" aria-hidden="true">🍪</span>
            <span className="mn-intro-text">
              <small className="ds-caption">나의쿠키가 처음이라면</small>
              <b>개발자 취업 준비, 이제 쿠키 하나로</b>
            </span>
            <span className="ds-btn ds-btn--primary ds-btn--sm">서비스 소개 보기</span>
          </Link>
        </div>

        {/* ---------- 사이드바 아래: 순위 · 코딩테스트 ---------- */}
        <aside className="mn-side-wrap" aria-label="순위와 바로가기">
          <section className="ds-card mn-rank" aria-label="풀이 순위">
            <Suspense fallback={<p className="ds-caption" role="status">순위를 불러오는 중…</p>}>
              <SolveRank />
            </Suspense>
          </section>
          <section className="ds-card mn-coding" aria-labelledby="mn-coding-title">
            <div className="mn-section-head small"><h2 id="mn-coding-title">코딩테스트</h2><span className="ds-caption ds-text-3">새 탭</span></div>
            <ul className="ds-list">
              {CODING_SITES.map(s => (
                <li key={s.name}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="ds-list-item">
                    <span className={`mn-site-tag tone-${s.tone}`} aria-hidden="true">{s.tag}</span>
                    <span className="mn-cat-text"><b>{s.name}</b><small>{s.desc}</small></span>
                    <span className="mn-chev" aria-hidden="true">↗</span>
                    <span className="sr-only">(새 탭에서 열림)</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
