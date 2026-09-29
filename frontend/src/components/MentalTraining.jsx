import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { track } from '../track';

// 홈 오른쪽 아래, 오늘의 운세 위의 "멘탈 기르기". 대기업 공채 최종 결과 화면을 미리 맛보는 장난감이다.
// 회사 이름은 실제 기업이지만 화면은 가상이다. 캡처해도 오해가 없게 카드에 워터마크를 깐다.
// 로고 대신 이니셜 원 하나만 쓰고, 색은 회사마다 결만 다르게 준다.
const COMPANIES = [
  { name: '삼성SDS', mark: 'S', color: '#2563eb' },
  { name: '국민은행', mark: 'K', color: '#b45309' },
  { name: '네이버', mark: 'N', color: '#16a34a' },
  { name: '카카오', mark: 'K', color: '#ca8a04' },
];
const JOBS = ['IT · SW개발', '전산 · 정보보안', '데이터 · AI', '인프라 · 클라우드'];
const STEPS = ['서류전형', '필기전형', '1차 면접', '최종 면접'];

const PASS_CHEER = [
  '이 기분 기억해 두세요. 오늘 푼 한 세트가 이 화면까지 데려다줍니다.',
  '상상이 구체적일수록 가까워집니다. 이제 기출 한 세트만 더.',
  '입사 동기들이 기다리고 있습니다. 오답노트 챙겨서 가시죠.',
];
const FAIL_CHEER = [
  '탈락 메일은 누구나 받습니다. 한 번 맞아 봤으니 진짜 받아도 덜 아픕니다.',
  '이 회사는 당신을 알아볼 기회를 놓쳤습니다. 다음 회사는 놓치지 않게 준비해 봅시다.',
  '불합격은 "아직"이라는 뜻입니다. 오늘은 틀린 문제 다섯 개만 다시 봐요.',
  '최종까지 갔다는 건 실력이 거기까지 왔다는 뜻입니다. 남은 건 한 끗입니다.',
];
// "떨어졌을 때 보시오" 봉투 속 편지. 큰 글씨는 고정이고 아래 한 줄만 바뀐다
const COMFORT_SUB = [
  '더 잘 맞는 자리가 당신 몫으로 비워져 있는 중입니다.',
  '문이 하나 닫혔다는 건, 복도에 문이 더 있다는 뜻이죠.',
  '오늘은 맛있는 거 먹고, 내일 한 세트만 풀어요.',
  '지금 이 순간도 나중엔 "그때 떨어져서 다행이었지"가 됩니다.',
];

// 누를 때마다 관리자 모니터링(admin/cu)의 코너 클릭 수에 쌓인다
const tap = what => track('click', '/fun/mental', what);

const pick = a => a[Math.floor(Math.random() * a.length)];
const LOADING_MS = 1700;

function makeResult(kind, name) {
  const now = new Date();
  const half = now.getMonth() < 6 ? '상반기' : '하반기';
  // 입사일은 두 달 뒤 첫 월요일로 적당히 잡는다
  const start = new Date(now.getFullYear(), now.getMonth() + 2, 1);
  while (start.getDay() !== 1) start.setDate(start.getDate() + 1);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return {
    kind,
    name: name.trim() || '지원자',
    company: pick(COMPANIES),
    job: pick(JOBS),
    title: `${now.getFullYear()}년 ${half} 신입사원 공개채용`,
    no: `${now.getFullYear() % 100}${String(Math.floor(Math.random() * 1e6)).padStart(6, '0')}`,
    start: `${start.getFullYear()}년 ${start.getMonth() + 1}월 ${start.getDate()}일(월)`,
    dday: Math.round((start - today) / 86400000),
    cheer: pick(kind === 'pass' ? PASS_CHEER : FAIL_CHEER),
  };
}

// 오버레이 공통: ESC로 닫고, 떠 있는 동안 뒤 페이지 스크롤을 막는다
function useOverlay(onClose) {
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; document.removeEventListener('keydown', onKey); };
  }, [onClose]);
}

function ResultScreen({ r, onClose, onRetry, onComfort }) {
  const pass = r.kind === 'pass';
  const [loading, setLoading] = useState(true);
  useOverlay(onClose);

  // 결과를 바로 보여 주지 않고 조회하는 척 뜸을 들인다. 다시 뽑으면 key가 바뀌어 처음부터
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), LOADING_MS);
    return () => clearTimeout(t);
  }, []);

  const c = r.company;

  return createPortal(
    <div
      className={`mental-overlay ${loading ? 'loading' : pass ? 'pass' : 'fail'}`}
      style={{ '--co': c.color }}
      role="dialog"
      aria-modal="true"
      aria-label="최종 결과 맛보기"
    >
      {pass && !loading && (
        <div className="mental-confetti" aria-hidden="true">
          {Array.from({ length: 60 }, (_, i) => <i key={i} style={{ '--i': i, '--x': (i * 37) % 100, '--d': i % 7, '--w8': i % 12, '--dx': (i % 5) - 2 }} />)}
        </div>
      )}
      <div className="mental-sheet">
        <div className="mental-bar">
          <span className="mental-logo" aria-hidden="true">{c.mark}</span>
          <b>{c.name} 채용</b>
          <span className="mental-bar-sub">지원 결과 조회</span>
          <button type="button" className="mental-x" onClick={onClose} aria-label="닫기">×</button>
        </div>

        {loading ? (
          <div className="mental-card mental-wait" aria-live="polite">
            <div className="mental-spinner" aria-hidden="true" />
            <p className="mental-wait-title"><b>{r.name}</b>님의 최종 결과를 조회하고 있습니다</p>
            <p className="mental-wait-sub">{r.title} · {r.job}</p>
            <div className="mental-progress" aria-hidden="true"><i style={{ animationDuration: `${LOADING_MS}ms` }} /></div>
            <p className="mental-wait-hint">심호흡 한 번 하세요…</p>
          </div>
        ) : (
          <>
            <div className="mental-card mental-reveal">
              <span className="mental-watermark" aria-hidden="true">멘탈 기르기 · 가상</span>

              <ol className="mental-steps" aria-label="전형 단계">
                {STEPS.map((s, i) => {
                  const last = i === STEPS.length - 1;
                  const state = !last ? 'done' : pass ? 'done' : 'no';
                  return (
                    <li key={s} className={state}>
                      <i>{state === 'no' ? '✕' : '✓'}</i>
                      <span>{s}</span>
                    </li>
                  );
                })}
              </ol>

              <dl className="mental-meta">
                <dt>공고</dt><dd>{r.title}</dd>
                <dt>지원 분야</dt><dd>{r.job} (신입)</dd>
                <dt>수험번호</dt><dd>{r.no}</dd>
                <dt>성명</dt><dd>{r.name}</dd>
              </dl>

              <div className="mental-verdict">
                {pass && <p className="mental-headline">최종 합격을 축하드립니다</p>}
                <span className="mental-stamp">{pass ? '최종 합격' : '불합격'}</span>
              </div>

              {pass ? (
                <div className="mental-letter">
                  <p><b>{r.name}</b>님, 축하드립니다.</p>
                  <p>{c.name} {r.title}에 <b>최종 합격</b>하셨음을 진심으로 축하드립니다. 긴 전형 동안 보여 주신 열정과 역량에 깊이 감사드리며, 이제 동료로서 함께하게 되어 기쁩니다.</p>

                  <div className="mental-badge" aria-label="사원증 미리보기">
                    <div className="mental-badge-top"><span>{c.mark}</span>{c.name}</div>
                    <div className="mental-badge-photo" aria-hidden="true">🙂</div>
                    <b>{r.name}</b>
                    <em>{r.job.split(' · ')[0]} · 신입사원</em>
                    <div className="mental-badge-code" aria-hidden="true" />
                  </div>

                  <table className="mental-guide">
                    <tbody>
                      <tr><th>입사 예정일</th><td>{r.start} <span className="mental-dday">D-{r.dday}</span></td></tr>
                      <tr><th>채용 검진</th><td>입사 2주 전까지 지정 병원에서 실시</td></tr>
                      <tr><th>제출 서류</th><td>최종학력 증명서, 경력 · 자격 증빙, 통장 사본</td></tr>
                      <tr><th>입문 교육</th><td>입사 후 4주 합숙 연수</td></tr>
                    </tbody>
                  </table>
                  <p className="mental-sign">{c.name} 인사팀 드림</p>
                </div>
              ) : (
                <div className="mental-letter">
                  <p><b>{r.name}</b>님, 안녕하세요.</p>
                  <p>먼저 {c.name} {r.title}에 보여 주신 관심과 긴 전형 동안의 노력에 깊이 감사드립니다.</p>
                  <p>{r.name}님의 역량과 경험은 높이 평가되었으나, 한정된 인원으로 인해 안타깝게도 이번 채용에서는 함께하지 못하게 되었음을 알려 드립니다.</p>
                  <p>비록 이번에는 좋은 소식을 전해 드리지 못했지만, {r.name}님의 앞날에 무궁한 발전이 있기를 진심으로 기원합니다.</p>
                  <p className="mental-sign">{c.name} 인사팀 드림</p>
                </div>
              )}
            </div>

            <div className="mental-coach">
              <span>{pass ? '🎉' : '🫂'}</span>
              <div>
                <p>{r.cheer}</p>
                {!pass && (
                  <button type="button" className="mental-coach-open" onClick={onComfort}>
                    📮 떨어졌을 때 보시오
                  </button>
                )}
              </div>
            </div>

            <div className="mental-actions">
              <Link to="/exam" className="primary" onClick={onClose}>{pass ? '진짜 합격하러 가기 →' : '다시 일어나서 풀러 가기 →'}</Link>
              <button type="button" onClick={onRetry}>{pass ? '탈락도 맛보기' : '합격도 맛보기'}</button>
              <button type="button" onClick={onClose}>닫기</button>
            </div>
            <p className="mental-note">※ 멘탈 기르기용 가상 화면입니다. 실제 회사의 채용 결과와 무관합니다.</p>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}

// 편지 제목만 손글씨체로 쓴다. 이 한 줄 글자만 받아 오도록 text= 로 잘라서 부른다
const HAND_FONT = 'https://fonts.googleapis.com/css2?family=Gaegu:wght@700&display=swap&text=' +
  encodeURIComponent('아, 더 좋은 회사 가려나 보다~');

function ComfortScreen({ onClose }) {
  const [opened, setOpened] = useState(false);
  const [sub, setSub] = useState(() => pick(COMFORT_SUB));
  useOverlay(onClose);

  useEffect(() => {
    if (document.querySelector('link[data-mental-font]')) return;
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = HAND_FONT;
    l.dataset.mentalFont = '';
    document.head.appendChild(l);
  }, []);

  return createPortal(
    <div className={`mental-comfort ${opened ? 'opened' : ''}`} role="dialog" aria-modal="true" aria-label="떨어졌을 때 보시오">
      <div className="mental-comfort-sky" aria-hidden="true">
        {Array.from({ length: 14 }, (_, i) => <i key={i} style={{ '--x': (i * 29) % 100, '--s': i % 4, '--d': i % 5, '--w8': (i * 3) % 14 }} />)}
      </div>
      <button type="button" className="mental-x light" onClick={onClose} aria-label="닫기">×</button>

      <div className="mental-comfort-stage">
        <button
          type="button"
          className="mental-envelope"
          onClick={() => setOpened(true)}
          disabled={opened}
          aria-label="봉투 열기"
        >
          <span className="env-back" aria-hidden="true" />
          <span className="env-letter">
            <span className="env-letter-title">아, 더 좋은 회사<br />가려나 보다~</span>
            <span className="env-letter-sub">{sub}</span>
          </span>
          <span className="env-front" aria-hidden="true" />
          <span className="env-flap" aria-hidden="true" />
          <span className="env-label" aria-hidden="true">떨어졌을 때 보시오</span>
          <span className="env-seal" aria-hidden="true">♥</span>
        </button>

        {!opened ? (
          <p className="mental-comfort-hint">봉투를 눌러 열어 보세요</p>
        ) : (
          <div className="mental-comfort-actions">
            <Link to="/exam" className="primary" onClick={onClose}>더 좋은 회사 준비하러 가기 →</Link>
            <button type="button" onClick={() => setSub(s => { let n = s; while (n === s) n = pick(COMFORT_SUB); return n; })}>한 줄 더</button>
            <button type="button" onClick={onClose}>닫기</button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

export default function MentalTraining() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [result, setResult] = useState(null);
  const [comfort, setComfort] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = e => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  function show(kind) {
    tap(kind);
    setResult(makeResult(kind, name));
    setOpen(false);
  }

  return (
    <div className="mental-door" ref={boxRef}>
      {open && (
        <div className="mental-pop" role="dialog" aria-label="멘탈 기르기">
          <div className="mental-pop-head">
            <b>🧘 멘탈 기르기</b>
            <span>대기업 공채 최종 발표</span>
          </div>

          <button type="button" className="mental-sos" onClick={() => { tap('comfort'); setComfort(true); setOpen(false); }}>
            <span className="mental-sos-icon" aria-hidden="true">📮</span>
            <span className="mental-sos-text">
              <b>떨어졌을 때 보시오</b>
              <small>진짜 떨어진 날 열어 보는 봉투</small>
            </span>
            <span className="mental-sos-go" aria-hidden="true">→</span>
          </button>

          <div className="mental-pop-divider"><span>결과 화면 미리 맞아 보기</span></div>

          <input
            type="text"
            value={name}
            maxLength={12}
            placeholder="이름 (비워 두면 '지원자')"
            onChange={e => setName(e.target.value)}
            aria-label="이름"
          />
          <div className="mental-pick">
            <button type="button" className="pass" onClick={() => show('pass')}>
              <span>🎉</span>
              <b>합격 맛보기</b>
              <small>축하 폭죽 · 사원증</small>
            </button>
            <button type="button" className="fail" onClick={() => show('fail')}>
              <span>🥲</span>
              <b>탈락 맛보기</b>
              <small>예방주사 한 방</small>
            </button>
          </div>
        </div>
      )}
      <button type="button" className="mental-toggle" onClick={() => { if (!open) tap('open'); setOpen(o => !o); }} aria-expanded={open}><span>🧘</span>멘탈 기르기</button>
      {result && (
        <ResultScreen
          key={result.no}
          r={result}
          onClose={() => setResult(null)}
          onRetry={() => { const kind = result.kind === 'pass' ? 'fail' : 'pass'; tap(kind); setResult(makeResult(kind, name)); }}
          onComfort={() => { tap('comfort'); setResult(null); setComfort(true); }}
        />
      )}
      {comfort && <ComfortScreen onClose={() => setComfort(false)} />}
    </div>
  );
}
