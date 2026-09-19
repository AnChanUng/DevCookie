import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { COMPANIES, EXAM_CATEGORIES } from '../data/examQuestions';

const KEY = 'admin-key';
const RANGES = [7, 30, 90];
const MODES = { exam: '모의고사', practice: '영역별 연습', wrong: '오답 다시 풀기', marked: '북마크 다시 풀기', cpp: 'C++ 문제집' };

const PAGE_NAMES = {
  '/': '홈', '/exam': '기업별 기출문제', '/computer-general': '컴퓨터일반', '/major': '필기이론',
  '/major-exam': '필기이론 문제', '/stats': '통계', '/search': '문제 검색', '/ncs': 'NCS', '/interview': '면접 연습',
  ...Object.fromEntries(EXAM_CATEGORIES.map(c => [`/exam/category/${c.key}`, `기업별 기출 · ${c.name}`])),
  ...Object.fromEntries(COMPANIES.map(c => [`/exam/${c.key}`, c.name])),
};
const pageName = (path) => PAGE_NAMES[path] || path;

const fmtAt = (iso) => {
  const d = new Date(iso);
  const p = (n) => String(n).padStart(2, '0');
  return `${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
};

const fmtDur = (s) => (s == null ? '–' : s >= 60 ? `${Math.floor(s / 60)}분 ${s % 60}초` : `${s}초`);
const pct = (score, total) => (total ? Math.round(score / total * 100) : null);

const savedKey = () => { try { return sessionStorage.getItem(KEY) || ''; } catch { return ''; } };

export default function AdminPage() {
  const [key, setKey] = useState(savedKey);
  const [input, setInput] = useState('');
  const [days, setDays] = useState(30);
  const [tick, setTick] = useState(0);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(() => !!savedKey());

  useEffect(() => {
    if (!key) return;
    let stale = false;
    // 잠든 서버가 깨어나는 데 1~2분 걸릴 수 있다
    api.get('/admin/usage', { params: { days }, headers: { 'X-Admin-Key': key }, timeout: 180000 })
      .then(res => { if (!stale) setData(res.data); })
      .catch(err => {
        if (stale) return;
        const status = err.response?.status;
        if (status === 401) {
          try { sessionStorage.removeItem(KEY); } catch { /* 무시 */ }
          setKey('');
          setData(null);
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
  };

  if (!key) {
    return (
      <div className="fade-in">
        <div className="page-header">
          <Link to="/" className="back-link">← 홈으로</Link>
          <h1>관리자</h1>
          <p>이용 현황을 보려면 관리자 키를 입력하세요.</p>
        </div>
        <form className="admin-login" onSubmit={submit}>
          <input type="password" value={input} onChange={e => setInput(e.target.value)} placeholder="관리자 키" autoFocus autoComplete="off" />
          <button type="submit" className="exam-btn primary">확인</button>
        </form>
        {error && <p className="admin-error">{error}</p>}
      </div>
    );
  }

  const maxViews = data ? Math.max(1, ...data.daily.map(d => d.views)) : 1;
  const maxHour = data ? Math.max(1, ...data.hours) : 1;
  const deviceTotal = data ? data.devices.reduce((n, d) => n + d.count, 0) : 0;

  return (
    <div className="fade-in">
      <div className="page-header exam-page-header">
        <Link to="/" className="back-link">← 홈으로</Link>
        <div className="exam-toplinks">
          {RANGES.map(r => <button key={r} type="button" className={days === r ? 'on' : ''} onClick={() => { if (r !== days) { begin(); setDays(r); } }}>최근 {r}일</button>)}
          <button type="button" onClick={() => { begin(); setTick(t => t + 1); }}>{loading ? '불러오는 중' : '새로고침'}</button>
          <button type="button" onClick={logout}>잠그기</button>
        </div>
        <h1>이용 현황</h1>
        <p>익명 방문자 ID 기준 · 한국 시간 · 관리자 화면 열람은 집계에서 제외</p>
      </div>

      {error && <p className="admin-error">{error}</p>}
      {loading && !data && <div className="loading"><div className="loading-spinner" />불러오는 중... 서버가 잠들어 있으면 1~2분 걸립니다</div>}

      {data && (
        <>
          <div className="exam-stats">
            <Tile k="오늘 방문자" v={data.today.visitors} sub={`조회 ${data.today.views} · 풀이 ${data.today.exams}`} />
            <Tile k="최근 7일 방문자" v={data.week.visitors} sub={`조회 ${data.week.views} · 풀이 ${data.week.exams}`} />
            <Tile k={`최근 ${data.days}일 방문자`} v={data.range.visitors} sub={`조회 ${data.range.views} · 풀이 ${data.range.exams}`} />
            <Tile k="누적 방문자" v={data.all.visitors} sub={`조회 ${data.all.views} · 풀이 ${data.all.exams} · 계정 ${data.users}`} />
          </div>

          <div className="exam-stats">
            <Tile k="지금 접속 중" v={data.active} sub="최근 5분 안에 활동한 방문자" />
            <Tile k="오늘 신규 방문자" v={data.newToday} sub={`재방문 ${Math.max(0, data.today.visitors - data.newToday)}명`} />
            {data.devices.map(d => (
              <Tile key={d.device} k={d.device === 'mobile' ? '모바일' : 'PC'} v={d.count} sub={`최근 ${data.days}일 방문자의 ${deviceTotal ? Math.round(d.count / deviceTotal * 100) : 0}%`} />
            ))}
          </div>

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
                    <td className="admin-barcol"><span className="admin-bar"><i style={{ width: `${Math.round(d.views / maxViews * 100)}%` }} /></span></td>
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

          <div className="section-title">풀이 완료가 많은 문제은행</div>
          <PathTable rows={data.exams} countLabel="풀이 완료" empty="아직 풀이 기록이 없습니다." />

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

          <div className="section-title">서버 상태</div>
          <div className="exam-stats">
            <Tile k="서버 가동 시간" v={fmtDur(data.server.uptimeSeconds)} unit="" sub="Render 무료 서버는 쉬다가 깨어나면 0부터 다시 셉니다" />
            <Tile k="쌓인 기록" v={data.server.events} unit=" 건" sub="열람 + 풀이 완료 전체" />
            <Tile k="메모리 사용" v={data.server.memoryUsedMb} unit=" MB" sub={`최대 ${data.server.memoryMaxMb} MB`} />
          </div>
        </>
      )}
    </div>
  );
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
