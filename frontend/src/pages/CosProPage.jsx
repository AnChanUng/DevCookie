import { useMemo, useRef, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import api from '../api';
import { track } from '../track';
import { COSPRO_GROUPS, COSPRO_PARTS, COSPRO_PROBLEMS, buildHarness } from '../data/cosproQuestions';

const BASE = '/aptitude/daou/cospro';
const STORE = 'cospro';

const load = (k, fallback) => { try { return localStorage.getItem(k) ?? fallback; } catch { return fallback; } };
const save = (k, v) => { try { localStorage.setItem(k, v); } catch { /* 저장소를 못 쓰면 이번 화면에서만 유지 */ } };
const drop = (k) => { try { localStorage.removeItem(k); } catch { /* 무시 */ } };

// 풀이 상태: pass(제출 채점 전부 통과) / tried(제출했지만 틀림) / 없음
const statusOf = (id) => load(`${STORE}:solved:${id}`, '');

// COS Pro 1급(Java) 문제 목록과 풀이 화면. 주소에 문제 id가 있으면 풀이 화면을 연다
export default function CosProPage() {
  const { pid } = useParams();
  if (!pid) return <ProblemList />;
  const problem = COSPRO_PROBLEMS.find(p => p.id === pid);
  if (!problem) return <Navigate to={BASE} replace />;
  return <Solve key={problem.id} problem={problem} />;
}

function ProblemList() {
  const passed = COSPRO_PROBLEMS.filter(p => statusOf(p.id) === 'pass').length;
  return (
    <div className="fade-in cos">
      <Link to="/aptitude/daou" className="back-link">← 다우기술 인적성</Link>
      <section className="cos-hero">
        <div>
          <span className="cos-eyebrow">COS Pro 1급 · Java</span>
          <h1>코딩 문제 채점</h1>
          <p>빈칸 채우기, 한 줄 바꾸기, 함수 작성 세 유형입니다. 코드를 고쳐 제출하면 서버에서 자바로 컴파일하고 숨은 테스트까지 채점합니다. 작성한 코드는 이 브라우저에 자동으로 저장됩니다.</p>
        </div>
        <div className="cos-score"><b>{passed}</b><span>/ {COSPRO_PROBLEMS.length} 통과</span></div>
      </section>

      {Object.entries(COSPRO_GROUPS).map(([gk, g]) => {
        const list = COSPRO_PROBLEMS.filter(p => p.group === gk);
        return (
          <section key={gk} className="cos-group">
            <div className="section-title">{g.name}</div>
            <p className="exam-lede">{g.desc}</p>
            {Object.entries(COSPRO_PARTS).map(([pk, part]) => {
              const items = list.filter(p => p.part === pk);
              if (!items.length) return null;
              return (
                <div key={pk} className="cos-part">
                  <div className="cos-part-head"><span className={`cos-chip ${pk}`}>{part.no}</span>{part.name}<small>{part.desc}</small></div>
                  <div className="cos-list">
                    {items.map(p => {
                      const st = statusOf(p.id);
                      return (
                        <Link key={p.id} to={`${BASE}/${p.id}`} className={`cos-item ${st}`}>
                          <span className="cos-item-title">{p.title}</span>
                          <span className="cos-item-topic">{p.topic}</span>
                          <span className="cos-item-state">{st === 'pass' ? '✓ 통과' : st === 'tried' ? '다시 도전' : '풀기 →'}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </section>
        );
      })}

      <p className="exam-note">채점 서버가 잠들어 있으면 첫 채점에 1~2분이 걸릴 수 있습니다. 표준 라이브러리 중 문자열 · 수학 · 컬렉션 · 스트림만 쓸 수 있고, 파일 · 네트워크 · 스레드 · 리플렉션은 막혀 있습니다.</p>
    </div>
  );
}

// 결과 한 줄: "@@CASE 번호 PASS|FAIL|ERROR 기대값 @@GOT 실제값"
function parseCases(stdout) {
  const cases = {};
  const other = [];
  for (const line of stdout.split('\n')) {
    const m = line.match(/^@@CASE (\d+) (PASS|FAIL|ERROR) (.*?) @@GOT (.*)$/);
    if (m) cases[m[1]] = { state: m[2], expected: m[3], got: m[4].trim() };
    else if (line.trim()) other.push(line);
  }
  return { cases, other: other.join('\n') };
}

function Solve({ problem }) {
  const key = `${STORE}:code:${problem.id}`;
  const [code, setCode] = useState(() => load(key, problem.starter));
  const [running, setRunning] = useState('');
  const [result, setResult] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const area = useRef(null);
  const part = COSPRO_PARTS[problem.part];
  const idx = COSPRO_PROBLEMS.indexOf(problem);
  const prev = COSPRO_PROBLEMS[idx - 1];
  const next = COSPRO_PROBLEMS[idx + 1];
  const samples = useMemo(() => problem.tests.map((t, i) => ({ ...t, no: i + 1 })).filter(t => t.sample), [problem]);

  const edit = (v) => { setCode(v); save(key, v); };

  // 탭은 4칸 띄어쓰기로, 엔터는 윗줄 들여쓰기를 따라간다
  const onKeyDown = (e) => {
    const el = e.currentTarget;
    const { selectionStart: s, selectionEnd: t, value } = el;
    if (e.key === 'Tab') {
      e.preventDefault();
      const v = value.slice(0, s) + '    ' + value.slice(t);
      edit(v);
      requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = s + 4; });
    } else if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      e.preventDefault();
      const lineStart = value.lastIndexOf('\n', s - 1) + 1;
      const indent = value.slice(lineStart, s).match(/^\s*/)[0] + (value[s - 1] === '{' ? '    ' : '');
      const v = value.slice(0, s) + '\n' + indent + value.slice(t);
      edit(v);
      requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = s + 1 + indent.length; });
    }
  };

  const run = async (all) => {
    setRunning(all ? 'submit' : 'sample');
    setResult(null);
    try {
      const { data } = await api.post('/code/java', {
        files: { 'Solution.java': code, 'Main.java': buildHarness(problem, !all) },
      }, { timeout: 200000 });
      const parsed = parseCases(data.stdout || '');
      const nos = all ? problem.tests.map((_, i) => String(i + 1)) : samples.map(t => String(t.no));
      const pass = nos.filter(n => parsed.cases[n]?.state === 'PASS').length;
      const r = { ...data, ...parsed, all, pass, total: nos.length };
      setResult(r);
      if (all) {
        const ok = data.status === 'ok' && pass === nos.length;
        if (ok || statusOf(problem.id) !== 'pass') save(`${STORE}:solved:${problem.id}`, ok ? 'pass' : 'tried');
        track('exam', `${BASE}/${problem.id}`, 'cospro', { score: pass, total: nos.length });
      }
    } catch (err) {
      const msg = err.response?.data?.error
        || (err.code === 'ECONNABORTED' ? '서버 응답이 없습니다. 잠든 서버가 깨어나는 중일 수 있으니 잠시 뒤 다시 시도해 주세요.' : '채점 서버에 연결하지 못했습니다.');
      setResult({ status: 'network', message: msg });
    } finally {
      setRunning('');
    }
  };

  const reset = () => {
    if (!confirm('작성한 코드를 지우고 처음 코드로 되돌릴까요?')) return;
    edit(problem.starter);
    drop(key);
    setResult(null);
  };

  return (
    <div className="fade-in cos">
      <div className="cos-top">
        <Link to={BASE} className="back-link">← COS Pro 1급 문제 목록</Link>
        <div className="cos-nav">
          {prev && <Link to={`${BASE}/${prev.id}`}>← 이전</Link>}
          {next && <Link to={`${BASE}/${next.id}`}>다음 →</Link>}
        </div>
      </div>

      <div className="cos-solve">
        <section className="cos-problem">
          <div className="cos-problem-head">
            <span className={`cos-chip ${problem.part}`}>{part.no}</span>
            <span className="cos-part-name">{part.name}</span>
            <span className="cos-topic">{problem.topic}</span>
            {statusOf(problem.id) === 'pass' && <span className="cos-pass-badge">✓ 통과</span>}
          </div>
          <h1>{problem.title}</h1>
          <p className="cos-part-desc">{part.desc}</p>
          <div className="cos-statement">{problem.statement}</div>

          <h3>제한 사항</h3>
          <ul className="cos-constraints">{problem.constraints.map(c => <li key={c}>{c}</li>)}</ul>

          <h3>입출력 예</h3>
          <div className="exam-table-wrap">
            <table className="exam-table cos-examples">
              <thead><tr><th>#</th><th>입력</th><th>return</th></tr></thead>
              <tbody>
                {samples.map(t => (
                  <tr key={t.no}><td>{t.no}</td><td><code>{t.input}</code></td><td><code>{t.expect}</code></td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="cos-hidden-note">제출 채점에는 예제 {samples.length}개와 숨은 테스트 {problem.tests.length - samples.length}개가 쓰입니다.</p>

          <button type="button" className="exam-btn ghost cos-answer-btn" onClick={() => setShowAnswer(s => !s)}>
            {showAnswer ? '모범답안 닫기' : '모범답안 · 해설 보기'}
          </button>
          {showAnswer && (
            <div className="cos-answer">
              <div className="lab">해설</div>
              <p>{problem.explain}</p>
              <div className="lab">모범답안</div>
              <pre className="exam-code">{problem.answer}</pre>
            </div>
          )}
        </section>

        <section className="cos-editor-wrap">
          <div className="cos-editor-bar">
            <span>Solution.java</span>
            <button type="button" onClick={reset}>초기화</button>
          </div>
          <textarea
            ref={area}
            className="cos-editor"
            value={code}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            onChange={e => edit(e.target.value)}
            onKeyDown={onKeyDown}
          />
          <div className="cos-actions">
            <button type="button" className="exam-btn" disabled={!!running} onClick={() => run(false)}>
              {running === 'sample' ? '실행 중…' : '예제 실행'}
            </button>
            <button type="button" className="exam-btn primary" disabled={!!running} onClick={() => run(true)}>
              {running === 'submit' ? '채점 중…' : '제출 채점'}
            </button>
          </div>
          {running && <p className="cos-wait">컴파일하고 실행하는 중입니다. 서버가 잠들어 있었다면 1~2분 걸릴 수 있습니다.</p>}
          {result && <ResultPanel result={result} problem={problem} />}
        </section>
      </div>
    </div>
  );
}

const STATUS_TEXT = {
  compile_error: '컴파일 오류',
  blocked: '사용할 수 없는 기능',
  timeout: '시간 초과',
  runtime_error: '실행 오류',
  busy: '채점 대기',
  unavailable: '채점 불가',
  error: '서버 오류',
  network: '연결 실패',
};

function ResultPanel({ result, problem }) {
  const { status } = result;
  if (status !== 'ok' && !(status === 'runtime_error' && Object.keys(result.cases || {}).length)) {
    return (
      <div className="cos-result bad">
        <div className="cos-result-head">{STATUS_TEXT[status] || '오류'}</div>
        {result.message && <p>{result.message}</p>}
        {result.errors?.length > 0 && (
          <pre className="cos-log">{result.errors.map(e => `${e.file}:${e.line}  ${e.message}`).join('\n\n')}</pre>
        )}
        {result.stderr && <pre className="cos-log">{result.stderr}</pre>}
      </div>
    );
  }
  const allPass = result.pass === result.total;
  return (
    <div className={`cos-result ${allPass ? 'good' : 'bad'}`}>
      <div className="cos-result-head">
        {result.all ? '제출 채점' : '예제 실행'} · {result.pass} / {result.total} 통과
        {allPass && result.all && ' 🎉'}
        <span className="cos-ms">{result.millis ? `${(result.millis / 1000).toFixed(2)}초` : ''}</span>
      </div>
      <ul className="cos-cases">
        {problem.tests.map((t, i) => {
          const c = result.cases[String(i + 1)];
          if (!c) return null;
          const hidden = !t.sample;
          return (
            <li key={i} className={c.state.toLowerCase()}>
              <b>{hidden ? `숨은 테스트 ${i + 1}` : `예제 ${i + 1}`}</b>
              <span>{c.state === 'PASS' ? '통과' : c.state === 'FAIL' ? '실패' : '오류'}</span>
              {!hidden && c.state !== 'PASS' && (
                <em>기대값 {c.expected} · 실제 {c.got}</em>
              )}
              {hidden && c.state === 'ERROR' && <em>{c.got.split(':')[0]}</em>}
            </li>
          );
        })}
      </ul>
      {result.other && (
        <>
          <div className="lab">출력</div>
          <pre className="cos-log">{result.other}</pre>
        </>
      )}
      {result.stderr && <pre className="cos-log">{result.stderr}</pre>}
    </div>
  );
}
