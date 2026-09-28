import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';

// 홈 오른쪽 아래, 오늘의 운세 위의 "멘탈 기르기". 대기업 공채 최종 결과 화면을 미리 맛보는 장난감이다.
// 회사 이름은 실제 기업이지만 화면은 가상이다. 캡처해도 오해가 없게 카드에 워터마크를 깐다.
const COMPANIES = ['삼성SDS', '국민은행', '네이버', '카카오'];
const JOBS = ['IT · SW개발', '전산 · 정보보안', '데이터 · AI', '인프라 · 클라우드'];

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

const pick = a => a[Math.floor(Math.random() * a.length)];

function makeResult(kind, name) {
  const now = new Date();
  const half = now.getMonth() < 6 ? '상반기' : '하반기';
  // 입사일은 두 달 뒤 첫 월요일로 적당히 잡는다
  const start = new Date(now.getFullYear(), now.getMonth() + 2, 1);
  while (start.getDay() !== 1) start.setDate(start.getDate() + 1);
  return {
    kind,
    name: name.trim() || '지원자',
    company: pick(COMPANIES),
    job: pick(JOBS),
    title: `${now.getFullYear()}년 ${half} 신입사원 공개채용`,
    no: `${now.getFullYear() % 100}${String(Math.floor(Math.random() * 1e6)).padStart(6, '0')}`,
    start: `${start.getFullYear()}년 ${start.getMonth() + 1}월 ${start.getDate()}일(월)`,
    cheer: pick(kind === 'pass' ? PASS_CHEER : FAIL_CHEER),
  };
}

function ResultScreen({ r, onClose, onRetry }) {
  const pass = r.kind === 'pass';

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; document.removeEventListener('keydown', onKey); };
  }, [onClose]);

  return createPortal(
    <div className={`mental-overlay ${pass ? 'pass' : 'fail'}`} role="dialog" aria-modal="true" aria-label="최종 결과 맛보기">
      {pass && (
        <div className="mental-confetti" aria-hidden="true">
          {Array.from({ length: 36 }, (_, i) => <i key={i} style={{ '--i': i }} />)}
        </div>
      )}
      <div className="mental-sheet">
        <div className="mental-bar">
          <b>{r.company} 채용</b>
          <span>지원 결과 조회</span>
        </div>

        <div className="mental-card">
          <span className="mental-watermark" aria-hidden="true">멘탈 기르기 · 가상</span>
          <dl className="mental-meta">
            <dt>공고</dt><dd>{r.title}</dd>
            <dt>지원 분야</dt><dd>{r.job} (신입)</dd>
            <dt>수험번호</dt><dd>{r.no}</dd>
            <dt>전형</dt><dd>최종 면접</dd>
          </dl>

          <div className="mental-verdict">
            <span className="mental-stamp">{pass ? '최종 합격' : '불합격'}</span>
          </div>

          {pass ? (
            <div className="mental-letter">
              <p><b>{r.name}</b>님, 축하드립니다.</p>
              <p>{r.company} {r.title}에 <b>최종 합격</b>하셨음을 진심으로 축하드립니다. 긴 전형 동안 보여 주신 열정과 역량에 깊이 감사드리며, 이제 동료로서 함께하게 되어 기쁩니다.</p>
              <table className="mental-guide">
                <tbody>
                  <tr><th>입사 예정일</th><td>{r.start}</td></tr>
                  <tr><th>채용 검진</th><td>입사 2주 전까지 지정 병원에서 실시</td></tr>
                  <tr><th>제출 서류</th><td>최종학력 증명서, 경력 · 자격 증빙, 통장 사본</td></tr>
                  <tr><th>입문 교육</th><td>입사 후 4주 합숙 연수</td></tr>
                </tbody>
              </table>
              <p className="mental-sign">{r.company} 인사팀 드림</p>
            </div>
          ) : (
            <div className="mental-letter">
              <p><b>{r.name}</b>님, 안녕하세요.</p>
              <p>먼저 {r.company} {r.title}에 보여 주신 관심과 긴 전형 동안의 노력에 깊이 감사드립니다.</p>
              <p>{r.name}님의 역량과 경험은 높이 평가되었으나, 한정된 인원으로 인해 안타깝게도 이번 채용에서는 함께하지 못하게 되었음을 알려 드립니다.</p>
              <p>비록 이번에는 좋은 소식을 전해 드리지 못했지만, {r.name}님의 앞날에 무궁한 발전이 있기를 진심으로 기원합니다.</p>
              <p className="mental-sign">{r.company} 인사팀 드림</p>
            </div>
          )}
        </div>

        <div className="mental-coach">
          <span>{pass ? '🎉' : '🫂'}</span>
          <p>{r.cheer}</p>
        </div>

        <div className="mental-actions">
          <Link to="/exam" className="primary" onClick={onClose}>{pass ? '진짜 합격하러 가기 →' : '다시 일어나서 풀러 가기 →'}</Link>
          <button type="button" onClick={onRetry}>{pass ? '탈락도 맛보기' : '합격도 맛보기'}</button>
          <button type="button" onClick={onClose}>닫기</button>
        </div>
        <p className="mental-note">※ 멘탈 기르기용 가상 화면입니다. 실제 회사의 채용 결과와 무관합니다.</p>
      </div>
    </div>,
    document.body,
  );
}

export default function MentalTraining() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [result, setResult] = useState(null);
  const boxRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = e => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  function show(kind) {
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
          <p className="mental-pop-desc">결과 화면을 미리 맞아 보세요. 어느 쪽이 나와도 멘탈은 단단해집니다.</p>
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
              <span>🎉</span>합격 맛보기
            </button>
            <button type="button" className="fail" onClick={() => show('fail')}>
              <span>🥲</span>탈락 맛보기
            </button>
          </div>
        </div>
      )}
      <button type="button" className="mental-toggle" onClick={() => setOpen(o => !o)} aria-expanded={open}><span>🧘</span>멘탈 기르기</button>
      {result && (
        <ResultScreen
          r={result}
          onClose={() => setResult(null)}
          onRetry={() => setResult(makeResult(result.kind === 'pass' ? 'fail' : 'pass', name))}
        />
      )}
    </div>
  );
}
