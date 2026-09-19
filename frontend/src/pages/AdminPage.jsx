import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { COMPANIES, EXAM_CATEGORIES } from '../data/examQuestions';

const KEY = 'admin-key';
const RANGES = [7, 30, 90];
const AUTO_SECONDS = 60;
const TABS = [['overview', '개요'], ['solves', '풀이'], ['visitors', '방문자'], ['accounts', '계정 · 채점'], ['system', '시스템']];
const MODES = { exam: '모의고사', practice: '영역별 연습', wrong: '오답 다시 풀기', marked: '북마크 다시 풀기', cpp: 'C++ 문제집', recall: '응시 후기 복원 문제' };

const PAGE_NAMES = {
  '/': '홈', '/exam': '기업별 기출문제', '/computer-general': '컴퓨터일반', '/major': '필기이론',
  '/major-exam': '필기이론 문제', '/stats': '통계', '/search': '문제 검색', '/ncs': 'NCS', '/interview': '면접 연습',
  ...Object.fromEntries(EXAM_CATEGORIES.map(c => [`/exam/category/${c.key}`, `기업별 기출 · ${c.name}`])),
  ...Object.fromEntries(COMPANIES.map(c => [`/exam/${c.key}`, c.name])),
};
const pageName = (path) => PAGE_NAMES[path] || path;
const companyName = (key) => COMPANIES.find(c => c.key === key)?.name || key;

const p2 = (n) => String(n).padStart(2, '0');
const fmtAt = (iso) => {
  if (!iso) return '–';
  const d = new Date(iso);
  return `${p2(d.getMonth() + 1)}.${p2(d.getDate())} ${p2(d.getHours())}:${p2(d.getMinutes())}`;
};
const fmtClock = (d) => `${p2(d.getHours())}:${p2(d.getMinutes())}:${p2(d.getSeconds())}`;

const fmtDur = (s) => (s == null ? '–' : s >= 60 ? `${Math.floor(s / 60)}분 ${s % 60}초` : `${s}초`);
const fmtUptime = (s) => {
  if (s >= 86400) return `${Math.floor(s / 86400)}일 ${Math.floor(s % 86400 / 3600)}시간`;
  if (s >= 3600) return `${Math.floor(s / 3600)}시간 ${Math.floor(s % 3600 / 60)}분`;
  return fmtDur(s);
};
const pct = (score, total) => (total ? Math.round(score / total * 100) : null);

const savedKey = () => { try { return sessionStorage.getItem(KEY) || ''; } catch { return ''; } };

export default function AdminPage() {
  const [key, setKey] = useState(savedKey);
  const [input, setInput] = useState('');
  const [days, setDays] = useState(30);
  const [tab, setTab] = useState('overview');
  const [auto, setAuto] = useState(false);
  const [tick, setTick] = useState(0);
  const [data, setData] = useState(null);
  const [sys, setSys] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(() => !!savedKey());

  useEffect(() => {
    if (!key) return;
    let stale = false;
    // 잠든 서버가 깨어나는 데 1~2분 걸릴 수 있다
    const options = { headers: { 'X-Admin-Key': key }, timeout: 180000 };
    // 계정·시스템 조회는 실패해도 이용 현황은 그대로 보여 준다
    api.get('/admin/system', options)
      .then(res => { if (!stale) setSys(res.data); })
      .catch(() => { if (!stale) setSys(null); });
    api.get('/admin/usage', { ...options, params: { days } })
      .then(res => { if (!stale) { setData(res.data); setUpdatedAt(new Date()); setError(''); } })
      .catch(err => {
        if (stale) return;
        const status = err.response?.status;
        if (status === 401) {
          try { sessionStorage.removeItem(KEY); } catch { /* 무시 */ }
          setKey('');
          setData(null);
          setSys(null);
          setError('관리자 키가 올바르지 않습니다.');
        } else if (status === 503) {
          setError('서버에 ADMIN_KEY 환경변수가 설정되지 않았습니다.');
        } else {
          setError('서버에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.');
        }
      })
      .finally(() => { if (!stale) setLoading(false); });
    return () => { stale = true; };
  }, [key, days, tick]);

  useEffect(() => {
    if (!auto || !key) return;
    const id = setInterval(() => setTick(t => t + 1), AUTO_SECONDS * 1000);
    return () => clearInterval(id);
  }, [auto, key]);

  const begin = () => { setLoading(true); setError(''); };

  const submit = (e) => {
    e.preventDefault();
    const v = input.trim();
    if (!v) return;
    try { sessionStorage.setItem(KEY, v); } catch { /* 무시 */ }
    begin();
    setKey(v);
    setInput('');
  };

  const logout = () => {
    try { sessionStorage.removeItem(KEY); } catch { /* 무시 */ }
    setKey('');
    setData(null);
    setSys(null);
    setAuto(false);
  };

  if (!key) {
    return (
      <div className="fade-in">
        <div className="page-header">
          <Link to="/" className="back-link">← 홈으로</Link>
          <h1>관리자</h1>
          <p>모니터링 화면을 보려면 관리자 키를 입력하세요.</p>
        </div>
        <form className="admin-login" onSubmit={submit}>
          <input type="password" value={input} onChange={e => setInput(e.target.value)} placeholder="관리자 키" autoFocus autoComplete="off" />
          <button type="submit" className="exam-btn primary">확인</button>
        </form>
        {error && <p className="admin-error">{error}</p>}
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="page-header exam-page-header">
        <Link to="/" className="back-link">← 홈으로</Link>
        <div className="exam-toplinks">
          {RANGES.map(r => <button key={r} type="button" className={days === r ? 'on' : ''} onClick={() => { if (r !== days) { begin(); setDays(r); } }}>최근 {r}일</button>)}
          <button type="button" onClick={() => { begin(); setTick(t => t + 1); }}>{loading ? '불러오는 중' : '새로고침'}</button>
          <button type="button" className={auto ? 'on' : ''} onClick={() => setAuto(a => !a)}>자동 {auto ? '켜짐' : '꺼짐'}</button>
          <button type="button" onClick={logout}>잠그기</button>
        </div>
        <h1>관리자 모니터링</h1>
        <p>
          익명 방문자 ID 기준 · 한국 시간 · 관리자 화면 열람은 집계에서 제외
          {updatedAt && ` · ${fmtClock(updatedAt)} 갱신`}
          {auto && ` · ${AUTO_SECONDS}초마다 자동 갱신`}
        </p>
      </div>

      {error && <p className="admin-error">{error}</p>}
      {loading && !data && <div className="loading"><div className="loading-spinner" />불러오는 중... 서버가 잠들어 있으면 1~2분 걸립니다</div>}

      {data && (
        <>
          <div className="major-tabs">
            {TABS.map(([k, name]) => (
              <button key={k} type="button" className={`major-tab${tab === k ? ' active' : ''}`} onClick={() => setTab(k)}>{name}</button>
            ))}
          </div>
          <Health sys={sys} />
          {tab === 'overview' && <Overview data={data} sys={sys} />}
          {tab === 'solves' && <Solves data={data} />}
          {tab === 'visitors' && <Visitors data={data} />}
          {tab === 'accounts' && (sys ? <Accounts sys={sys} /> : <SysMissing />)}
          {tab === 'system' && (sys ? <System sys={sys} events={data.server.events} /> : <SysMissing />)}
        </>
      )}
    </div>
  );
}

function SysMissing() {
  return <p className="exam-note">계정·시스템 정보를 불러오지 못했습니다. 백엔드가 아직 이전 버전이면 배포가 끝난 뒤 새로고침해 주세요.</p>;
}

// 어느 탭에서든 한 줄로 보이는 상태 표시
function Health({ sys }) {
  if (!sys) return null;
  const mem = sys.server.memoryMaxMb ? sys.server.memoryUsedMb / sys.server.memoryMaxMb : 0;
  const items = [
    ['cloud', `서버 가동 ${fmtUptime(sys.server.uptimeSeconds)}`],
    [sys.database.up ? 'cloud' : 'error', sys.database.up ? `DB 정상 · ${sys.database.pingMs}ms` : 'DB 연결 실패'],
    [mem > 0.85 ? 'error' : 'cloud', `메모리 ${Math.round(mem * 100)}%`],
    [!sys.chat.geminiConfigured ? '' : sys.chat.geminiErrors ? 'error' : 'cloud',
      !sys.chat.geminiConfigured ? 'Gemini 키 없음 (챗봇은 검색 답변만)' : sys.chat.geminiErrors ? `Gemini 오류 ${sys.chat.geminiErrors}회` : 'Gemini 정상'],
    [sys.slackEnabled ? 'cloud' : 'off', sys.slackEnabled ? 'Slack 알림 켜짐' : 'Slack 알림 꺼짐'],
  ];
  return (
    <div className="admin-health">
      {items.map(([state, label]) => <span key={label} className={`exam-sync ${state}`}><i />{label}</span>)}
    </div>
  );
}

function Overview({ data, sys }) {
  const maxViews = Math.max(1, ...data.daily.map(d => d.views));
  const maxHour = Math.max(1, ...data.hours);
  const deviceTotal = data.devices.reduce((n, d) => n + d.count, 0);
  const mobile = data.devices.find(d => d.device === 'mobile')?.count || 0;
  return (
    <>
      <div className="exam-stats">
        <Tile k="지금 공부 중" v={data.studying ?? data.active} sub="화면을 열어 둔 방문자 (홈에 보이는 숫자)" />
        <Tile k="최근 5분 활동" v={data.active} sub="페이지를 옮기거나 풀이를 끝낸 방문자" />
        <Tile k="오늘 방문자" v={data.today.visitors} sub={`조회 ${data.today.views} · 풀이 ${data.today.exams}`} />
        <Tile k="오늘 신규 방문자" v={data.newToday} sub={`재방문 ${Math.max(0, data.today.visitors - data.newToday)}명`} />
      </div>

      <div className="exam-stats">
        <Tile k="최근 7일 방문자" v={data.week.visitors} sub={`조회 ${data.week.views} · 풀이 ${data.week.exams}`} />
        <Tile k={`최근 ${data.days}일 방문자`} v={data.range.visitors} sub={`조회 ${data.range.views} · 풀이 ${data.range.exams}`} />
        <Tile k="누적 방문자" v={data.all.visitors} sub={`조회 ${data.all.views} · 풀이 ${data.all.exams}`} />
        <Tile k="모바일 비율" v={deviceTotal ? Math.round(mobile / deviceTotal * 100) : '–'} unit=" %" sub={`최근 ${data.days}일 · 모바일 ${mobile}명 · PC ${deviceTotal - mobile}명`} />
      </div>

      {sys && (
        <div className="exam-stats">
          <Tile k="계정" v={sys.accounts.total} sub={`최근 24시간 가입 ${sys.accounts.joined24h} · 7일 ${sys.accounts.joined7d}`} />
          <Tile k="면접 답변 채점" v={sys.grading.total} unit=" 건" sub={`최근 24시간 ${sys.grading.last24h} · 7일 ${sys.grading.last7d}`} />
          <Tile k="채점 평균" v={sys.grading.avgScore ?? '–'} unit=" 점" sub="전체 채점 기록 기준" />
          <Tile k="챗봇 응답" v={sys.chat.aiReplies + sys.chat.fallbackReplies} unit=" 회" sub="서버가 마지막으로 깨어난 뒤부터" />
        </div>
      )}

      <div className="section-title">일별 추이</div>
      <div className="exam-table-wrap">
        <table className="exam-table admin-table">
          <thead><tr><th>날짜</th><th>방문자</th><th>조회</th><th>풀이 완료</th><th className="admin-barcol">조회 추이</th></tr></thead>
          <tbody>
            {data.daily.slice().reverse().map(d => (
              <tr key={d.day}>
                <td>{d.day}</td>
                <td className="num">{d.visitors}</td>
                <td className="num">{d.views}</td>
                <td className="num">{d.exams}</td>
                <td className="admin-barcol"><Bar ratio={d.views / maxViews} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="section-title">시간대별 열람 (한국 시간)</div>
      <div className="admin-hours">
        {data.hours.map((n, h) => (
          <div key={h} className="admin-hour" title={`${h}시 · ${n}회`}>
            <span className="admin-hour-bar"><i style={{ height: `${Math.round(n / maxHour * 100)}%` }} /></span>
            <span className="admin-hour-label">{h}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function Solves({ data }) {
  return (
    <>
      <div className="section-title">풀이 기록</div>
      {data.solves.length ? (
        <div className="exam-table-wrap">
          <table className="exam-table admin-table">
            <thead><tr><th>시각</th><th>방문자</th><th>문제은행</th><th>방식</th><th>점수</th><th>정답률</th><th>소요</th><th>기기</th></tr></thead>
            <tbody>
              {data.solves.map((r, i) => (
                <tr key={i}>
                  <td>{fmtAt(r.at)}</td>
                  <td className="num">{r.visitor}</td>
                  <td>{pageName(r.path)}</td>
                  <td>{MODES[r.detail] || r.detail || ''}</td>
                  <td className="num">{r.total ? `${r.score} / ${r.total}` : '–'}</td>
                  <td className="num">{r.total ? `${pct(r.score, r.total)}%` : '–'}</td>
                  <td className="num">{fmtDur(r.seconds)}</td>
                  <td>{r.device === 'mobile' ? '모바일' : r.device === 'desktop' ? 'PC' : '–'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <p className="exam-note">아직 풀이 기록이 없습니다.</p>}
      <p className="exam-note">점수는 이 기능이 배포된 뒤의 풀이부터 기록됩니다. 그 전 기록은 점수 없이 "–"로 나옵니다.</p>

      <div className="section-title">문제은행별 평균 점수</div>
      {data.scores.length ? (
        <div className="exam-table-wrap">
          <table className="exam-table admin-table">
            <thead><tr><th>문제은행</th><th>방식</th><th>풀이</th><th>방문자</th><th>평균 정답률</th><th>평균 소요</th></tr></thead>
            <tbody>
              {data.scores.map((r, i) => (
                <tr key={i}>
                  <td>{pageName(r.path)}</td>
                  <td>{MODES[r.detail] || r.detail || ''}</td>
                  <td className="num">{r.count}</td>
                  <td className="num">{r.visitors}</td>
                  <td className="num">{r.avgPercent}%</td>
                  <td className="num">{fmtDur(r.avgSeconds)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <p className="exam-note">점수가 기록된 풀이가 아직 없습니다.</p>}

      <div className="section-title">풀이 완료가 많은 문제은행</div>
      <PathTable rows={data.exams} countLabel="풀이 완료" empty="아직 풀이 기록이 없습니다." />
    </>
  );
}

function Visitors({ data }) {
  return (
    <>
      <div className="section-title">방문자별 현황</div>
      <div className="exam-table-wrap">
        <table className="exam-table admin-table">
          <thead><tr><th>방문자</th><th>열람</th><th>풀이</th><th>평균 정답률</th><th>첫 방문</th><th>마지막 활동</th></tr></thead>
          <tbody>
            {data.visitors.map(v => (
              <tr key={v.visitor + v.firstAt}>
                <td className="num">{v.visitor}</td>
                <td className="num">{v.views}</td>
                <td className="num">{v.exams}</td>
                <td className="num">{v.avgPercent == null ? '–' : `${v.avgPercent}%`}</td>
                <td>{fmtAt(v.firstAt)}</td>
                <td>{fmtAt(v.lastAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="exam-note">최근 {data.days}일 안에 활동한 방문자 중 마지막 활동이 최근인 순서로 50명까지 보여줍니다.</p>

      <div className="section-title">유입 경로</div>
      {data.referrers.length ? (
        <div className="exam-table-wrap">
          <table className="exam-table admin-table">
            <thead><tr><th>들어온 곳</th><th>횟수</th></tr></thead>
            <tbody>
              {data.referrers.map(r => <tr key={r.referrer}><td>{r.referrer}</td><td className="num">{r.count}</td></tr>)}
            </tbody>
          </table>
        </div>
      ) : <p className="exam-note">다른 사이트에서 들어온 기록이 아직 없습니다. 주소를 직접 입력하거나 메신저 앱에서 연 경우는 잡히지 않습니다.</p>}

      <div className="section-title">많이 본 페이지</div>
      <PathTable rows={data.pages} countLabel="조회" empty="아직 기록이 없습니다." />

      <div className="section-title">최근 활동</div>
      <div className="exam-table-wrap">
        <table className="exam-table admin-table">
          <thead><tr><th>시각</th><th>방문자</th><th>종류</th><th>페이지</th></tr></thead>
          <tbody>
            {data.recent.map((r, i) => (
              <tr key={i}>
                <td>{fmtAt(r.at)}</td>
                <td className="num">{r.visitor}</td>
                <td>{r.type === 'exam' ? `풀이 완료 · ${MODES[r.detail] || r.detail || ''}${r.total ? ` · ${r.score}/${r.total}` : ''}` : '열람'}</td>
                <td>{pageName(r.path)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Accounts({ sys }) {
  const { accounts, grading, examSync } = sys;
  const maxGrade = Math.max(1, ...Object.values(grading.grades));
  return (
    <>
      <div className="exam-stats">
        <Tile k="계정" v={accounts.total} sub={`최근 24시간 가입 ${accounts.joined24h} · 7일 ${accounts.joined7d}`} />
        <Tile k="살아 있는 로그인" v={accounts.sessions} unit=" 개" sub="로그아웃하지 않은 기기 수" />
        <Tile k="면접 답변 채점" v={grading.total} unit=" 건" sub={`로그인 없이 ${grading.anonymous}건`} />
        <Tile k="채점 평균" v={grading.avgScore ?? '–'} unit=" 점" sub={`최근 24시간 ${grading.last24h}건 · 7일 ${grading.last7d}건`} />
      </div>

      <div className="section-title">계정 목록</div>
      {accounts.users.length ? (
        <div className="exam-table-wrap">
          <table className="exam-table admin-table">
            <thead><tr><th>닉네임</th><th>가입</th><th>마지막 로그인</th><th>로그인 기기</th><th>학습 문제</th><th>북마크</th><th>채점</th><th>채점 평균</th><th>기출 저장</th><th>마지막 기출 저장</th></tr></thead>
            <tbody>
              {accounts.users.map(u => (
                <tr key={u.id}>
                  <td>{u.nickname}</td>
                  <td>{fmtAt(u.joinedAt)}</td>
                  <td>{fmtAt(u.lastLoginAt)}</td>
                  <td className="num">{u.sessions}</td>
                  <td className="num">{u.studied}</td>
                  <td className="num">{u.bookmarks}</td>
                  <td className="num">{u.answers}</td>
                  <td className="num">{u.avgScore == null ? '–' : u.avgScore}</td>
                  <td className="num">{u.examBanks}</td>
                  <td>{fmtAt(u.lastExamSaveAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <p className="exam-note">아직 가입한 계정이 없습니다.</p>}
      <p className="exam-note">최근에 가입한 순서로 200명까지 보여줍니다. 마지막 로그인은 로그아웃하지 않은 기기 기준이라, 모두 로그아웃한 계정은 "–"로 나옵니다.</p>

      <div className="section-title">기출 풀이 기록을 계정에 저장한 문제은행</div>
      {examSync.length ? (
        <div className="exam-table-wrap">
          <table className="exam-table admin-table">
            <thead><tr><th>문제은행</th><th>계정 수</th></tr></thead>
            <tbody>
              {examSync.map(r => <tr key={r.company}><td>{companyName(r.company)}</td><td className="num">{r.count}</td></tr>)}
            </tbody>
          </table>
        </div>
      ) : <p className="exam-note">아직 계정에 저장된 기출 풀이 기록이 없습니다.</p>}

      <div className="section-title">면접 답변 채점 등급 분포</div>
      <div className="exam-table-wrap">
        <table className="exam-table admin-table">
          <thead><tr><th>등급</th><th>건수</th><th className="admin-barcol">분포</th></tr></thead>
          <tbody>
            {Object.entries(grading.grades).map(([g, n]) => (
              <tr key={g}>
                <td>{g}</td>
                <td className="num">{n}</td>
                <td className="admin-barcol"><Bar ratio={n / maxGrade} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="section-title">최근 채점</div>
      {grading.recent.length ? (
        <div className="exam-table-wrap">
          <table className="exam-table admin-table">
            <thead><tr><th>시각</th><th>닉네임</th><th>문제</th><th>점수</th></tr></thead>
            <tbody>
              {grading.recent.map((r, i) => (
                <tr key={i}>
                  <td>{fmtAt(r.at)}</td>
                  <td>{r.nickname || '비로그인'}</td>
                  <td>{r.question}</td>
                  <td className="num">{r.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <p className="exam-note">아직 채점 기록이 없습니다.</p>}

      <div className="section-title">채점이 많은 문제</div>
      {grading.topQuestions.length ? (
        <div className="exam-table-wrap">
          <table className="exam-table admin-table">
            <thead><tr><th>문제</th><th>채점</th><th>평균 점수</th></tr></thead>
            <tbody>
              {grading.topQuestions.map(r => (
                <tr key={r.question}>
                  <td>{r.question}</td>
                  <td className="num">{r.count}</td>
                  <td className="num">{r.avgScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <p className="exam-note">아직 채점 기록이 없습니다.</p>}
    </>
  );
}

const TABLE_NAMES = {
  users: '계정', auth_tokens: '로그인 토큰', usage_events: '이용 기록 (열람 + 풀이 완료)', answers: '면접 답변 채점',
  exam_progress: '기출 풀이 저장', user_question_progress: '문제별 학습 · 북마크', questions: '면접 문제', categories: '면접 카테고리',
};

function System({ sys, events }) {
  const { server, database, chat } = sys;
  const maxRows = Math.max(1, ...Object.values(database.tables));
  return (
    <>
      <div className="section-title">서버</div>
      <div className="exam-stats">
        <Tile k="서버 가동 시간" v={fmtUptime(server.uptimeSeconds)} unit="" sub={`${fmtAt(server.startedAt)}에 깨어남 · Render 무료 서버는 쉬다가 깨어나면 0부터 다시 셉니다`} />
        <Tile k="메모리 사용" v={server.memoryUsedMb} unit=" MB" sub={`최대 ${server.memoryMaxMb} MB`} />
        <Tile k="스레드" v={server.threads} unit=" 개" sub={`CPU ${server.processors}개${server.loadAverage == null ? '' : ` · 부하 ${server.loadAverage}`}`} />
        <Tile k="Java" v={server.java} unit="" sub="실행 중인 JVM 버전" />
      </div>

      <div className="section-title">데이터베이스</div>
      <div className="exam-stats">
        <Tile k="연결" v={database.up ? '정상' : '실패'} unit="" sub={database.up ? `응답 ${database.pingMs}ms` : 'select 1 이 실패했습니다'} />
        <Tile k="DB 크기" v={database.sizeMb ?? '–'} unit=" MB" sub="Neon 무료 요금제 한도는 0.5 GB" />
        <Tile k="이용 기록" v={events} unit=" 건" sub="열람 + 풀이 완료 전체" />
      </div>
      <div className="exam-table-wrap">
        <table className="exam-table admin-table">
          <thead><tr><th>테이블</th><th>내용</th><th>행 수</th><th className="admin-barcol">비중</th></tr></thead>
          <tbody>
            {Object.entries(database.tables).map(([name, rows]) => (
              <tr key={name}>
                <td className="num">{name}</td>
                <td>{TABLE_NAMES[name] || ''}</td>
                <td className="num">{rows}</td>
                <td className="admin-barcol"><Bar ratio={rows / maxRows} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="section-title">카오스 고양이 챗봇</div>
      <div className="exam-stats">
        <Tile k="AI 응답" v={chat.aiReplies} unit=" 회" sub={chat.geminiConfigured ? 'Gemini가 답한 횟수' : 'GEMINI_API_KEY가 설정되지 않았습니다'} />
        <Tile k="검색 답변" v={chat.fallbackReplies} unit=" 회" sub="Gemini 없이 문제 검색으로 답한 횟수" />
        <Tile k="Gemini 오류" v={chat.geminiErrors} unit=" 회" sub={chat.lastErrorAt ? `마지막 ${fmtAt(chat.lastErrorAt)} · ${chat.lastError}` : '오류 없음'} />
        <Tile k="전체 응답" v={chat.aiReplies + chat.fallbackReplies} unit=" 회" sub={`마지막 대화 ${fmtAt(chat.lastChatAt)} · 내용은 저장하지 않습니다`} />
      </div>
      <p className="exam-note">챗봇 숫자는 메모리에만 있어서 서버가 다시 깨어나면 0부터 셉니다.</p>
    </>
  );
}

function Bar({ ratio }) {
  return <span className="admin-bar"><i style={{ width: `${Math.round(ratio * 100)}%` }} /></span>;
}

function Tile({ k, v, sub, unit = ' 명' }) {
  return (
    <div className="exam-stat">
      <div className="k">{k}</div>
      <div className="v">{v}<small>{unit}</small></div>
      <div className="admin-sub">{sub}</div>
    </div>
  );
}

function PathTable({ rows, countLabel, empty }) {
  if (!rows.length) return <p className="exam-note">{empty}</p>;
  return (
    <div className="exam-table-wrap">
      <table className="exam-table admin-table">
        <thead><tr><th>페이지</th><th>{countLabel}</th><th>방문자</th></tr></thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.path}>
              <td>{pageName(r.path)}</td>
              <td className="num">{r.count}</td>
              <td className="num">{r.visitors}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
