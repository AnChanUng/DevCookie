import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CompanyExam } from './ExamCompanyPage';

// 비공개 문제집 입구. 비밀번호는 저장소에 원문으로 두지 않고 해시만 비교한다.
// 화면 잠금일 뿐 서버 인증이 아니므로, 문제 데이터는 잠금을 푼 뒤에만 따로 불러와 공개 화면 번들과 분리한다.
const SALT = 'cs-study:private-chanung:';
const HASH = 'f213708a8ac885488c9d63259093a953f3820b9fed68fd452c10758ce8a285a4';
const STORE = 'private-chanung-unlocked';
const BASE = '/private/chanung';

async function sha256(text) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(bytes)].map(b => b.toString(16).padStart(2, '0')).join('');
}

function readUnlocked() {
  try { return sessionStorage.getItem(STORE) === HASH; } catch { return false; }
}

export default function PrivateChanungPage() {
  const { id } = useParams();
  const [unlocked, setUnlocked] = useState(readUnlocked);
  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState(false);

  const trouble = id === 'trouble';

  useEffect(() => {
    if (!unlocked || data || trouble) return;
    let alive = true;
    import('../data/privateBanks')
      .then(m => { if (alive) setData(m); })
      .catch(() => { if (alive) setLoadError(true); });
    return () => { alive = false; };
  }, [unlocked, data, trouble]);

  if (!unlocked) return <Gate onUnlock={() => setUnlocked(true)} />;
  if (trouble) return <TroubleLog />;
  if (loadError) return <div className="fade-in"><p role="alert">문제집을 불러오지 못했습니다. 새로고침해 주세요.</p></div>;
  if (!data) return <div className="fade-in"><p role="status">문제집을 불러오는 중…</p></div>;

  if (id) {
    const found = data.findPrivateBank(id);
    if (!found) return <div className="fade-in"><p role="alert">찾을 수 없는 문제집입니다. <Link to={BASE}>비공개 문제집 목록</Link></p></div>;
    return <CompanyExam company={found.bank} back={{ to: BASE, label: '← 비공개 문제집' }} />;
  }
  return <PrivateList data={data} onLock={() => { try { sessionStorage.removeItem(STORE); } catch { /* 저장소를 못 쓰면 새로고침으로 잠긴다 */ } setUnlocked(false); }} />;
}

const STATUS = { solved: '해결', open: '진행 중', note: '관찰' };

// 개발하면서 겪은 기술 문제 기록. 데이터는 잠금을 푼 뒤에만 불러온다
function TroubleLog() {
  const [items, setItems] = useState(null);
  const [area, setArea] = useState('all');
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let alive = true;
    import('../data/troubleLog').then(m => { if (alive) setItems(m.TROUBLES); }).catch(() => { if (alive) setFailed(true); });
    return () => { alive = false; };
  }, []);
  if (failed) return <div className="fade-in"><p role="alert">기록을 불러오지 못했습니다. 새로고침해 주세요.</p></div>;
  if (!items) return <div className="fade-in"><p role="status">기록을 불러오는 중…</p></div>;
  const areas = [...new Set(items.map(t => t.area))];
  const shown = items.filter(t => area === 'all' || t.area === area);
  const open = items.filter(t => t.status === 'open').length;
  return (
    <div className="fade-in">
      <div className="page-header">
        <Link to={BASE} className="back-link">← 비공개 문제집</Link>
        <h1>트러블슈팅 기록</h1>
        <p>개발하면서 실제로 겪은 기술 문제와 원인, 해결, 측정 결과입니다. 전체 {items.length}건 · 해결 {items.length - open}건 · 진행 중 {open}건</p>
      </div>
      <div className="exam-filters" role="group" aria-label="분야">
        {['all', ...areas].map(a => (
          <button key={a} type="button" className={`exam-btn${area === a ? ' primary' : ''}`} aria-pressed={area === a} onClick={() => setArea(a)}>
            {a === 'all' ? '전체' : a}
          </button>
        ))}
      </div>
      {shown.map(t => (
        <article key={t.id} style={{ marginTop: 16, padding: '16px 18px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', fontSize: 13, opacity: 0.8 }}>
            <time dateTime={t.date}>{t.date}</time>
            <span>· {t.area}</span>
            <span className={`exam-tag${t.status === 'open' ? ' soon' : ''}`}>{STATUS[t.status] || t.status}</span>
          </div>
          <h2 style={{ fontSize: 18, margin: '8px 0 10px' }}>{t.title}</h2>
          <dl style={{ margin: 0, display: 'grid', gap: 8, lineHeight: 1.6 }}>
            {[['증상', t.symptom], ['원인', t.cause], ['해결', t.fix], ['결과', t.result], ['측정 환경', t.env], ['배운 점', t.lesson]]
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k}>
                  <dt style={{ fontWeight: 700, fontSize: 13 }}>{k}</dt>
                  <dd style={{ margin: 0, wordBreak: 'keep-all' }}>{v}</dd>
                </div>
              ))}
          </dl>
        </article>
      ))}
    </div>
  );
}

function Gate({ onUnlock }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    const ok = (await sha256(SALT + value.trim())) === HASH;
    setBusy(false);
    if (!ok) { setError(true); setValue(''); return; }
    try { sessionStorage.setItem(STORE, HASH); } catch { /* 이번 화면에서만 열어 둔다 */ }
    onUnlock();
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <Link to="/" className="back-link">← 홈으로</Link>
        <h1>비공개 문제집</h1>
        <p>비밀번호를 입력해야 볼 수 있습니다.</p>
      </div>
      <form onSubmit={submit} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          id="private-password" type="password" inputMode="numeric" autoComplete="off" autoFocus
          value={value} onChange={e => { setValue(e.target.value); setError(false); }}
          placeholder="비밀번호" aria-label="비밀번호" aria-invalid={error} aria-describedby={error ? 'private-password-error' : undefined}
          style={{ padding: '10px 12px', fontSize: 16, minWidth: 0, flex: '1 1 160px', maxWidth: 240 }}
        />
        <button type="submit" className="exam-btn" disabled={busy || !value.trim()}>열기</button>
      </form>
      {error && <p id="private-password-error" role="alert" style={{ marginTop: 8 }}>비밀번호가 맞지 않습니다.</p>}
    </div>
  );
}

function PrivateList({ data, onLock }) {
  return (
    <div className="fade-in">
      <div className="page-header">
        <Link to="/" className="back-link">← 홈으로</Link>
        <h1>비공개 문제집</h1>
        <p>실제 응시 후기·복기 자료로 만든 문제집과 컴퓨터일반 문제집입니다. 공개 메뉴에는 나오지 않습니다.</p>
        <button type="button" className="exam-btn" onClick={onLock}>잠그기</button>
      </div>
      <section style={{ marginTop: 24 }}>
        <div className="section-title">개발 기록</div>
        <div className="exam-company-grid">
          <Link to={`${BASE}/trouble`} className="exam-company-card">
            <span className="exam-company-abbr">LOG</span>
            <span className="exam-company-name">트러블슈팅 기록</span>
            <span className="exam-company-meta">개발하면서 겪은 기술 문제 · 원인 · 해결 · 측정 결과</span>
          </Link>
        </div>
      </section>
      {data.PRIVATE_GROUPS.map(group => (
        <section key={group.key} style={{ marginTop: 24 }}>
          <div className="section-title">{group.name}</div>
          <p className="exam-lede">{group.desc}</p>
          <div className="exam-company-grid">
            {group.banks.map(bank => (
              <Link key={data.privateBankId(group, bank)} to={`${BASE}/${data.privateBankId(group, bank)}`} className="exam-company-card">
                <span className="exam-company-abbr">{bank.abbr}</span>
                <span className="exam-company-name">{bank.name}</span>
                {bank.source?.label && <span className="exam-company-source">{bank.source.label}</span>}
                <span className="exam-company-meta">{bank.meta}</span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
